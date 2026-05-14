import express from "express";
import { body, validationResult } from "express-validator";
import Service from "../models/Service.js";
import QueueToken from "../models/QueueToken.js";
import authorizeUser from "../middleware/authorizeUser.js";
import authorizeOrg from "../middleware/authorizeOrg.js";
import { logActivity } from "../utils/logActivity.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import { recalcWaits, generateTokenNumber } from "../utils/queueHelper.js";
import { sendNotificationEmail } from "../utils/emailService.js";
import { getTokenBookingConfirmationTemplate } from "../utils/emailTemplates.js";

const router = express.Router();

// Route 1: Get live queue for a service (waiting + next tokens only) - GET /api/queue/live/:serviceId
router.get("/live/:serviceId", async (req, res) => {
    try {
        // Fetch tokens with status "waiting" or "next" for the specified service, sorted by position
        const tokens = await QueueToken.find({
            serviceId: req.params.serviceId,
            status: { $in: ["serving", "waiting", "next"] }
        }).sort({ position: 1 });

        // Always put the serving token(s) first so the frontend can easily identify them
        const serving = tokens.filter(t => t.status === "serving");
        const rest = tokens.filter(t => t.status !== "serving");

        return res.json({ success: true, queue: [...serving, ...rest], count: tokens.length });
    } catch (error) {
        console.error("Error fetching live queue:", error);
        return res.status(500).json({ success: false, error: "Server error while fetching live queue." });
    }
});

// Route 2: Book a new token (walk-in or self-serve kiosk) - POST /api/queue/new-token/:serviceId
router.post("/new-token/:serviceId", [
    body("name", "Name is required").notEmpty().trim(),
    body("phone", "Phone number is required").notEmpty().isMobilePhone(),
    body("email").optional().isEmail().normalizeEmail({ gmail_remove_dots: false }),
    body("userId").optional(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const service = await Service.findById(req.params.serviceId);

        // Check if service exists and is active
        if (!service)
            return res.status(404).json({ success: false, error: "Service not found." });

        if (!service.isActive || service.status === "closed") {
            return res.status(400).json({ success: false, error: "This counter is currently closed." });
        }

        const { name, phone, email, userId } = req.body;

        // Check if user already has 2 active tokens for this service (if email or phone provided)
        const limitQuery = {
            serviceId: service._id,
            status: { $in: ["waiting", "next", "serving"] },
        };

        if (userId) {
            limitQuery.userId = userId;
        } else {
            limitQuery.email = email.toLowerCase();
        }

        const activeCount = await QueueToken.countDocuments(limitQuery);

        if (activeCount >= 2) {
            return res.status(400).json({
                success: false,
                error: "You already have 2 active tokens for this service. Please wait until your current tokens are served."
            });
        }

        // Check queue capacity
        const currentQueueSize = await QueueToken.countDocuments({
            serviceId: service._id,
            status: { $in: ["waiting", "next"] }
        });

        // If maxQueueSize is defined and current queue size has reached the limit, reject new token
        if (currentQueueSize >= service.maxQueueSize) {
            return res.status(400).json({ success: false, error: "Queue is full. Please try again later." });
        }

        const position = currentQueueSize + 1;
        const tokenNumber = await generateTokenNumber(service);
        const estimatedWait = (position - 1) * service.avgWait;

        // Create the new token
        const token = await QueueToken.create({
            orgId: service.orgId,
            serviceId: service._id,
            userId: userId || null,
            tokenNumber,
            name,
            phone: phone || null,
            email: email || null,
            position,
            status: position === 1 ? "next" : "waiting",
            estimatedWait
        });

        // Increment total count on service
        await Service.findByIdAndUpdate(service._id, { $inc: { "stats.total": 1 } });

        // Log activity
        await logActivity({
            orgId: service.orgId,
            serviceId: service._id,
            eventType: "token_booked",
            message: `Token ${tokenNumber} has been booked for ${name}`,
            meta: { tokenNumber, counter: service.counter, name }
        });

        // Send confirmation email to user 
        try {
            const org = await Organization.findById(service.orgId)
                .select("orgName address area city").lean();
            const address = [org?.address, org?.area, org?.city].filter(Boolean).join(", ");

            const emailHtml = getTokenBookingConfirmationTemplate(
                name, tokenNumber, service.name,
                org?.orgName || "Organization",
                service.counter, estimatedWait, position, address, null
            );

            await sendNotificationEmail(
                email,
                `Your Token ${tokenNumber} is Confirmed - SmartQueue`,
                emailHtml
            );
        } catch (emailError) {
            console.error("Booking email failed (non-fatal):", emailError);
        }

        return res.status(201).json({
            success: true,
            message: `Token ${tokenNumber} has been booked. Estimated wait: ~${estimatedWait} min.`,
            token
        });
    } catch (error) {
        console.error("Error booking new token:", error);
        return res.status(500).json({ success: false, error: "Server error while booking new token." });
    }
});

// Route 3: Mark current "serving" token as "served" and promote the next token - PATCH /api/queue/mark-served/:tokenId
router.patch("/mark-served/:tokenId", authorizeOrg, async (req, res) => {
    try {
        const token = await QueueToken.findById(req.params.tokenId);

        // Check if token exists and is currently being served
        if (!token)
            return res.status(404).json({ success: false, error: "Token not found." });

        // Mark token as served
        token.status = "served";
        token.servedAt = new Date();
        await token.save();

        // Increment served count on service
        await Service.findByIdAndUpdate(token.serviceId, { $inc: { "stats.served": 1 } });

        // Promote next waiting → next
        const nextWaiting = await QueueToken.findOne({
            serviceId: token.serviceId,
            status: "waiting"
        }).sort({ position: 1 });

        // If there is a next waiting token, promote it to "next"
        if (nextWaiting) {
            nextWaiting.status = "next";
            await nextWaiting.save();
        }

        // Recalculate estimated waits for remaining tokens
        await recalcWaits(token.serviceId);

        // Fetch service details for counter info in activity log
        const service = await Service.findById(token.serviceId).lean();

        // Log activity
        await logActivity({
            orgId: token.orgId,
            serviceId: token.serviceId,
            eventType: "token_served",
            message: `Token ${token.tokenNumber} served at counter ${service?.counter || ""}`,
            meta: { tokenNumber: token.tokenNumber, counter: service?.counter }
        });

        return res.json({ success: true, message: `${token.tokenNumber} has been served.`, token });
    } catch (error) {
        console.error("Error marking token as served:", error);
        return res.status(500).json({ success: false, error: "Server error while marking token as served." });
    }
});

// Route 4: Skip current "next" token and promote the next waiting token - PATCH /api/queue/skip-next/:tokenId
router.patch("/skip-next/:tokenId", authorizeOrg, async (req, res) => {
    try {
        const token = await QueueToken.findById(req.params.tokenId);

        // Check if token exists and is currently "next"
        if (!token)
            return res.status(404).json({ success: false, error: "Token not found." });

        // Find last position in queue
        const lastToken = await QueueToken.findOne({
            serviceId: token.serviceId,
            status: { $in: ["waiting", "next"] }
        }).sort({ position: -1 });

        // Move current token to end of queue
        const newPosition = (lastToken?.position || 0) + 1;
        token.position = newPosition;
        token.status = "waiting";
        await token.save();

        // Increment skipped on service stats
        await Service.findByIdAndUpdate(token.serviceId, { $inc: { "stats.skipped": 1 } });

        // Promote next waiting → next
        const nextWaiting = await QueueToken.findOne({
            serviceId: token.serviceId,
            status: "waiting",
            _id: { $ne: token._id }
        }).sort({ position: 1 });

        // If there is a next waiting token, promote it to "next"
        if (nextWaiting) {
            nextWaiting.status = "next";
            await nextWaiting.save();
        }

        // Recalculate estimated waits for remaining tokens
        await recalcWaits(token.serviceId);

        // Fetch service details for counter info in activity log
        const service = await Service.findById(token.serviceId).lean();

        // Log activity
        await logActivity({
            orgId: token.orgId,
            serviceId: token.serviceId,
            eventType: "token_skipped",
            message: `Token ${token.tokenNumber} skipped at counter ${service?.counter || ""}`,
            meta: { tokenNumber: token.tokenNumber, counter: service?.counter }
        });

        return res.json({ success: true, message: `${token.tokenNumber} has been moved to end of queue.`, token });
    } catch (error) {
        console.error("Error skipping next token:", error);
        return res.status(500).json({ success: false, error: "Server error while skipping next token." });
    }
});

// Route 5: Promote a specific waiting token to position 1 (next) - PATCH /api/queue/promote/:tokenId
router.patch("/promote/:tokenId", authorizeOrg, async (req, res) => {
    try {
        const token = await QueueToken.findById(req.params.tokenId);

        // Check if token exists or not
        if (!token)
            return res.status(404).json({ success: false, error: "Token not found." });

        // Demote current "next" token to "waiting"
        await QueueToken.updateMany(
            { serviceId: token.serviceId, status: "next" },
            { $set: { status: "waiting" } }
        );

        // Shift all tokens with position < token.position down by 1
        await QueueToken.updateMany(
            {
                serviceId: token.serviceId,
                status: { $in: ["waiting", "next"] },
                position: { $lt: token.position }
            },
            { $inc: { position: 1 } }
        );

        // Promote selected token to position 1 and status "next"
        token.position = 1;
        token.status = "next";

        await token.save();

        // Recalculate estimated waits for remaining tokens
        await recalcWaits(token.serviceId);

        return res.json({ success: true, message: `${token.tokenNumber} has been moved to front.`, token });
    } catch (error) {
        console.error("Error promoting token:", error);
        return res.status(500).json({ success: false, error: "Server error while promoting token." });
    }
});

// Route 6: Mark a token as no-show and advance queue - PATCH /api/queue/no-show/:tokenId
router.patch("/no-show/:tokenId", authorizeOrg, async (req, res) => {
    try {
        const token = await QueueToken.findById(req.params.tokenId);

        // Check if token exists or not
        if (!token)
            return res.status(404).json({ success: false, error: "Token not found." });

        // Mark token as no-show
        token.status = "no_show";
        await token.save();

        // Increment no-shows on service stats
        await Service.findByIdAndUpdate(token.serviceId, { $inc: { "stats.noShows": 1 } });

        // Promote next waiting → next
        const nextWaiting = await QueueToken.findOne({
            serviceId: token.serviceId,
            status: "waiting"
        }).sort({ position: 1 });

        // If there is a next waiting token, promote it to "next"
        if (nextWaiting) {
            nextWaiting.status = "next";
            await nextWaiting.save();
        }

        // Recalculate estimated waits for remaining tokens
        await recalcWaits(token.serviceId);

        // Fetch service details for counter info in activity log
        const service = await Service.findById(token.serviceId).lean();

        // Log activity
        await logActivity({
            orgId: token.orgId,
            serviceId: token.serviceId,
            eventType: "token_no_show",
            message: `Token ${token.tokenNumber} marked as no-show`,
            meta: { tokenNumber: token.tokenNumber, counter: service?.counter }
        });

        return res.json({ success: true, message: `${token.tokenNumber} has been marked as no-show.` });
    } catch (error) {
        console.error("Error marking token as no-show:", error);
        return res.status(500).json({ success: false, error: "Server error while marking token as no-show." });
    }
});

// Route 7:  Get user's active tokens for hero card - GET /api/queue/my-tokens
router.get("/my-tokens", authorizeUser, async (req, res) => {
    try {
        // Fetch user's active tokens (waiting, next, serving) across all services
        const tokens = await QueueToken.find({
            userId: req.user.id,
            status: { $in: ["waiting", "next", "serving"] }
        })
            .sort({ bookedAt: -1 })
            .populate("serviceId", "name icon color counter avgWait")
            .populate("orgId", "orgName shortName city")
            .lean();

        // Format tokens for frontend (only necessary fields)
        const formatted = tokens.map(t => ({
            id: t._id.toString(),
            tokenNumber: t.tokenNumber,
            position: t.position,
            status: t.status,
            estimatedWait: t.estimatedWait,
            bookedAt: t.bookedAt,
            serviceName: t.serviceId?.name || "Service",
            serviceIcon: t.serviceId?.icon || "🎟️",
            serviceColor: t.serviceId?.color || "#00C9A7",
            serviceCounter: t.serviceId?.counter || "",
            orgName: t.orgId?.orgName || "Organization",
            city: t.orgId?.city || "",
        }));

        return res.status(200).json({ success: true, tokens: formatted });
    } catch (error) {
        console.error("Error fetching user's active tokens:", error);
        return res.status(500).json({ success: false, error: "Server error fetching active tokens." });
    }
});

export default router;