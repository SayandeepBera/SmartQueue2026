import express from "express";
import { body, validationResult } from "express-validator";
import Service from "../models/Service.js";
import QueueToken from "../models/QueueToken.js";
import authorizeOrg from "../middleware/authorizeOrg.js";
import { logActivity } from "../utils/logActivity.js";

const router = express.Router();

// Validation rules
const serviceValidator = [
    body("name", "Service name is required").notEmpty().trim(),
    body("counter", "Counter ID is required").notEmpty().trim(),
    body("icon").optional(),
    body("color").optional(),
    body("maxQueueSize").optional().isInt({ min: 1, max: 500 }),
    body("avgWait").optional().isInt({ min: 1 }),
    body("tokenPrefix").optional(),
];

// Route 1: Get all services for the org - GET /api/services/:orgId
router.get("/:orgId", async (req, res) => {
    try {
        const services = await Service.find({ orgId: req.params.orgId })
            .sort({ createdAt: 1 });

        return res.json({ success: true, services: services });
    } catch (error) {
        console.error("Error fetching services:", error);
        return res.status(500).json({ success: false, error: "Server error while fetching services." });
    }
});

// Route 2: Create a new service room - POST /api/services/new-service
router.post("/new-service", authorizeOrg, serviceValidator, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, counter, icon, color, maxQueueSize, avgWait, tokenPrefix } = req.body;

        // Get orgId from the authorizeOrg middleware
        const orgId = req.orgId;

        // Check duplicate counter within same org
        const existing = await Service.findOne({ orgId, counter: counter.trim().toUpperCase() });
        if (existing) {
            return res.status(400).json({ success: false, error: `Counter ${counter.toUpperCase()} already exists in your organization.` });
        }

        // Create the service
        const service = await Service.create({
            orgId,
            name, counter, icon, color, maxQueueSize, avgWait,
            tokenPrefix: tokenPrefix || counter.trim().toUpperCase(),
            status: "active", isActive: true
        });

        // Log activity
        await logActivity({
            orgId: service.orgId,
            serviceId: service._id,
            eventType: "service_created",
            message: `Service "${service.name}" (${service.counter}) has been created`,
            meta: { counter: service.counter }
        });

        return res.status(201).json({ success: true, message: "Service has been created successfully.", service });
    } catch (error) {
        console.error("Error creating service:", error);
        return res.status(500).json({ success: false, error: "Server error while creating service." });
    }
});

// Route 3: Edit service details - PUT /api/services/edit-service/:serviceId
router.put("/edit-service/:serviceId", authorizeOrg, async (req, res) => {
    try {
        const allowed = ["name", "counter", "icon", "color", "maxQueueSize", "avgWait", "tokenPrefix"];
        const updateData = {};

        // Only add fields that are present in the request body and are allowed to be updated
        allowed.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Update the service
        const service = await Service.findOneAndUpdate(
            { _id: req.params.serviceId, orgId: req.orgId },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        // If service is not found or doesn't belong to the org
        if (!service) {
            return res.status(404).json({ success: false, error: "Service not found." });
        }

        return res.status(200).json({ success: true, message: "Service has been updated successfully.", service });
    } catch (error) {
        console.error("Error updating service:", error);
        return res.status(500).json({ success: false, error: "Server error while updating service." });
    }
});

// Route 4: Toggle status of service (active/paused/closed) - PATCH /api/services/update-status/:serviceId
router.patch("/update-status/:serviceId", authorizeOrg, async (req, res) => {
    const { status } = req.body;
    const allowedStatuses = ["active", "paused", "closed"];

    // Check if the provided status is valid
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: `Invalid status. Status must be one of: ${allowedStatuses.join(", ")}` });
    }

    try {
        // Update the service status and isActive flag accordingly
        const service = await Service.findOneAndUpdate(
            { _id: req.params.serviceId, orgId: req.orgId },
            { $set: { status, isActive: status === "active" } },
            { returnDocument: 'after' }
        );

        // If service is not found or doesn't belong to the org
        if (!service) {
            return res.status(404).json({ success: false, error: "Service not found." });
        }

        // Log activity
        const eventMap = { active: "counter_opened", paused: "counter_paused", closed: "counter_closed" };
        const msgMap = { active: "opened", paused: "paused", closed: "closed for the day" };

        await logActivity({
            orgId: service.orgId,
            serviceId: service._id,
            eventType: eventMap[status],
            message: `Counter ${service.counter} (${service.name}) has been ${msgMap[status]}`,
            meta: { counter: service.counter, status }
        });

        return res.status(200).json({ success: true, message: `Counter ${service.counter} is now ${status}.`, service });
    } catch (error) {
        console.error("Error updating service status:", error);
        return res.status(500).json({ success: false, error: "Server error while updating service status." });
    }
});

// Route 5: Delete a service - DELETE /api/services/delete-service/:serviceId
router.delete("/delete-service/:serviceId", authorizeOrg, async (req, res) => {
    try {
        const service = await Service.findOneAndDelete({ _id: req.params.serviceId, orgId: req.orgId });

        // If service is not found or doesn't belong to the org
        if (!service)
            return res.status(404).json({ success: false, error: "Service not found." });

        // Log activity
        await logActivity({
            orgId: service.orgId,
            serviceId: service._id,
            eventType: "service_deleted",
            message: `Service "${service.name}" (${service.counter}) has been deleted`,
            meta: { counter: service.counter }
        });

        // Cascade delete all tokens belonging to this service
        await QueueToken.deleteMany({ serviceId: req.params.serviceId });

        return res.json({ success: true, message: "Service and all its queue tokens deleted." });
    } catch (error) {
        console.error("Error deleting service:", error);
        return res.status(500).json({ success: false, error: "Server error while deleting service." });
    }
});

// Route 6: Reset daily stats for a service - POST /api/services/reset-stats/:serviceId
router.post("/reset-stats/:serviceId", authorizeOrg, async (req, res) => {
    try {
        // Reset the stats fields to 0 and tokenSequence to 0 for the specified service
        const service = await Service.findOneAndUpdate(
            { _id: req.params.serviceId, orgId: req.orgId },
            {
                $set: {
                    "stats.total": 0,
                    "stats.served": 0,
                    "stats.skipped": 0,
                    "stats.noShows": 0,
                    tokenSequence: 0
                }
            },
            { returnDocument: 'after' }
        );

        // If service is not found or doesn't belong to the org
        if (!service) {
            return res.status(404).json({ success: false, error: "Service not found." });
        }

        // Log activity
        await logActivity({
            orgId: service.orgId,
            serviceId: service._id,
            eventType: "counter_reset",
            message: `Stats reset for counter ${service.counter} (${service.name})`,
            meta: { counter: service.counter }
        });

        return res.status(200).json({ success: true, message: "Service stats have been reset successfully.", service });
    } catch (error) {
        console.error("Error resetting service stats:", error);
        return res.status(500).json({ success: false, error: "Server error while resetting service stats." });
    }
});

// Route 7: Featured active services for hero cards - GET /api/services/public/featured
router.get("/public/featured", async (req, res) => {
    try {
        // Get active services whose org is approved, along with live queue counts
        const services = await Service.find({ isActive: true, status: "active" })
            .populate({
                path: "orgId",
                match: { status: "approved" },
                select: "orgName shortName orgType city logo status"
            })
            .sort({ createdAt: -1 })
            .limit(30)
            .lean();

        // Filter out services whose org didn't match (i.e. not approved)
        const valid = services.filter(s => s.orgId !== null);

        // Get live queue counts for each service
        const serviceIds = valid.map(s => s._id);
        const queueCounts = await QueueToken.aggregate([
            { $match: { serviceId: { $in: serviceIds }, status: { $in: ["waiting", "next", "serving"] } } },
            { $group: { _id: "$serviceId", count: { $sum: 1 } } }
        ]);

        // Create a map of serviceId to count for easy lookup
        const countMap = Object.fromEntries(queueCounts.map(q => [q._id.toString(), q.count]));

        // Construct the response payload
        const payload = valid.map(s => ({
            id: s._id.toString(),
            name: s.name,
            icon: s.icon,
            color: s.color,
            counter: s.counter,
            avgWait: s.avgWait,
            maxQueueSize: s.maxQueueSize,
            currentQueue: countMap[s._id.toString()] || 0,
            servedToday: s.stats?.served || 0,
            orgName: s.orgId.orgName,
            orgShort: s.orgId.shortName || s.orgId.orgName.slice(0, 8),
            orgType: s.orgId.orgType,
            orgLogo: s.orgId.logo?.url || null,
            city: s.orgId.city,
            orgId: s.orgId._id.toString(),
        }));

        // Shuffle so different orgs surface on each request
        payload.sort(() => Math.random() - 0.5);

        return res.status(200).json({ success: true, services: payload });
    } catch (error) {
        console.error("Error fetching featured services:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

export default router;