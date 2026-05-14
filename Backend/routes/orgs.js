import express from "express";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
import QueueToken from "../models/QueueToken.js";
import { body, validationResult } from 'express-validator';
import upload from "../middleware/imageUpload.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { sendNotificationEmail } from "../utils/emailService.js";
import {
    getOrgRegistrationEmailTemplate,
    getOrgApprovalTemplate,
    getOrgDeletionTemplate,
    getOrgRejectionTemplate,
    getOrgReactivationTemplate,
    getOrgSuspensionTemplate
} from "../utils/emailTemplates.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";
import { geocodeAddress } from "../utils/geocode.js";
import authorizeUser from "../middleware/authorizeUser.js";
import { logAdminActivity } from "../utils/logAdminActivity.js";

const router = express.Router();

/* ----- Helper Functions ----- */
// Utility function to generate a random password for the admin user
const generateToken = (length = 8) => {
    return crypto.randomBytes(length * 2).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, length);
}

// Utility function to generate a unique username for the admin user based on the organization name
const generateUniqueUsername = async () => {
    for (let i = 0; i < 5; i++) {
        const username = `org_${generateToken(8)}`;
        const existingUser = await User.findOne({ username });

        // If no existing user is found with the generated username, return it
        if (!existingUser) {
            return username;
        }
    }

    throw new Error("Could not generate a unique username. Please try again.");
};

// Validation rules for organization registration
const orgRegistrationValidator = [
    body('orgType', 'Organization type is required').notEmpty().isIn(["Hospital", "Bank", "Government", "Clinic", "Diagnostic", "Other"]),

    body('orgName', 'Organization name is required').notEmpty().trim(),
    body('regNumber', 'Registration number is required').notEmpty().trim(),
    body('gstNumber', 'GST number is required').notEmpty().trim(),

    body('adminName', 'Admin contact name is required').notEmpty().trim(),
    body('designation', 'Admin designation is required').notEmpty().trim(),
    body('email', 'Valid email is required').notEmpty().isEmail().normalizeEmail({ gmail_remove_dots: false }),
    body('phone', 'Phone number is required').notEmpty(),
    body('address', 'Address is required').notEmpty(),
    body('city', 'City is required').notEmpty().trim(),
    body('state', 'State is required').notEmpty().trim(),
    body('pincode', 'PIN code is required').notEmpty().isLength({ min: 6, max: 6 }),

    body('plan', 'Plan must be one of: Free, Starter, Pro, Enterprise')
        .notEmpty().isIn(['Free', 'Starter', 'Pro', 'Enterprise']),
]

// Routes 1: Register organization by POST: api/orgs/register
router.post("/register", upload.fields([
    { name: "docRegCert", maxCount: 1 }, // required
    { name: "docGst", maxCount: 1 }, // required
    { name: "docIdProof", maxCount: 1 }, // required
    { name: "docAddressProof", maxCount: 1 }, // optional
    { name: "logo", maxCount: 1 } // optional
]), orgRegistrationValidator, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const {
            orgType, orgName, shortName, regNumber, gstNumber, description,
            estYear, staffCount, workStart, workEnd,
            adminName, designation, email, phone,
            address, area, city, state, pincode, website,
            plan
        } = req.body;

        // Check for existing user with the same email or organization with the same registration/GST number
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "A user with this email already exists" });
        }

        // Check for existing organization with the same registration number or GST number
        const existingOrg = await Organization.findOne({
            $or: [
                { regNumber },
                { gstNumber }
            ]
        });

        if (existingOrg) {
            return res.status(400).json({ success: false, error: "An organization with the same registration or GST number already exists" });
        }

        // Validate that required files are uploaded
        if (!req.files?.docRegCert) {
            return res.status(400).json({ success: false, error: "Registration certificate is required" });
        }

        if (!req.files?.docGst) {
            return res.status(400).json({ success: false, error: "GST certificate is required" });
        }

        if (!req.files?.docIdProof) {
            return res.status(400).json({ success: false, error: "Owner ID proof is required" });
        }

        // Geocode the organization's address to get latitude and longitude
        const { lat, lng } = await geocodeAddress({ address, area, city, state, pincode });

        // Generate a random password and unique username for the admin user
        const plainPassword = generateToken(12);
        const username = await generateUniqueUsername();

        // Hash the generated password before saving to the database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        // Create the user account for the organization's admin contact
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: "pending_org"
        });

        // Function to handle uploading a single document and returning its Cloudinary details
        const uploadDocs = async (fieldName, folder) => {
            const file = req.files[fieldName]?.[0];
            if (!file) {
                return null;
            }

            // Upload the file buffer directly to Cloudinary without saving it to disk
            const result = await uploadToCloudinary(file.buffer, `orgs/${folder}`, "image");

            return {
                url: result.url,
                public_id: result.public_id,
                format: result.format,
            };
        }

        // Upload all documents in parallel and wait for all uploads to complete
        const [docRegCert, docGst, docIdProof, docAddressProof, logo] = await Promise.all([
            uploadDocs("docRegCert", "reg_cert"),
            uploadDocs("docGst", "gst_cert"),
            uploadDocs("docIdProof", "id_proof"),
            uploadDocs("docAddressProof", "address_proof"),
            uploadDocs("logo", "logos")
        ]);

        // Create the organization document in the database
        const newOrg = await Organization.create({
            userId: newUser._id,
            orgType,
            orgName,
            shortName,
            regNumber,
            gstNumber,
            description,
            estYear,
            staffCount,
            workStart,
            workEnd,
            adminName,
            designation,
            email,
            phone,
            address,
            area,
            city,
            state,
            pincode,
            website,
            lat,
            lng,
            docRegCert,
            docGst,
            docIdProof,
            docAddressProof,
            logo,
            plan,
            status: "pending"
        });

        // Send notification email to the organization's admin contact
        const emailHtml = getOrgRegistrationEmailTemplate(adminName, orgName, email, username, plainPassword);
        await sendNotificationEmail(email, "Organization Registration Received - SmartQueue", emailHtml);

        // Log the registration event in the admin activity log
        await logAdminActivity({
            eventType: "org_registered",
            message: `${orgName} (${orgType}) has been submitted a registration request`,
            meta: { orgId: newOrg._id, orgName, orgType, city, plan }
        });

        return res.status(201).json({ success: true, message: "Organization registered successfully. Your account is pending approval.", orgId: newOrg._id });

    } catch (error) {
        console.error("Error occurred while registering organization:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Routes 2: Get organization details by GET: api/orgs/:id
router.get("/org-details/:id", async (req, res) => {
    try {
        const org = await Organization.findById(req.params.id)
            .populate("userId", "username email role");

        if (!org) {
            return res.status(404).json({ success: false, error: "Organization not found" });
        }

        return res.status(200).json({ success: true, org });
    } catch (error) {
        console.error("Error occurred while fetching organization details:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Routes 3: Get all organizations by GET: api/orgs/allorg (admin only)
router.get('/', authorizeAdmin, async (req, res) => {
    try {
        const {
            search = '',
            status = 'all',
            type = 'all',
            plan = 'all',
            page = 1,
            limit = 25,
        } = req.query;

        const matchQuery = {};

        // Status filter
        if (status !== 'all') {
            matchQuery.status = status;
        }

        // Type filter
        if (type !== 'all') {
            matchQuery.orgType = type;
        }

        // Plan filter
        if (plan !== 'all') {
            matchQuery.plan = plan;
        }

        // Search filter
        if (search.trim()) {
            matchQuery.$or = [
                { orgName: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { adminName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Organization.countDocuments(matchQuery);

        const orgs = await Organization
            .find(matchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate("userId", "username email role");

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            orgs
        });

    } catch (error) {
        console.error("Error occurred while fetching organizations:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Routes 4: Returns lightweight org data with geocoords + service count. GET: api/orgs/public/map
router.get('/public/map', async (req, res) => {
    try {
        const { city, area } = req.query;

        // Only approved organizations should be shown on the public map
        const matchQuery = { status: "approved" };

        // Apply city and area filters if provided
        if (city)
            matchQuery.city = { $regex: city, $options: "i" };

        if (area)
            matchQuery.area = { $regex: area, $options: "i" };

        // Fetch organizations matching the criteria, along with their geocoordinates and service counts
        const orgs = await Organization.find(matchQuery)
            .select("orgName shortName orgType city area address lat lng logo")
            .sort({ orgName: 1 })
            .limit(100);

        // Get service counts for each organization in a single aggregation query
        const orgIds = orgs.map(o => o._id);
        const serviceCounts = await Service.aggregate([
            { $match: { orgId: { $in: orgIds }, isActive: true } },
            { $group: { _id: "$orgId", count: { $sum: 1 } } }
        ]);

        // Create a map of organization ID to service count for easy lookup
        const countMap = Object.fromEntries(serviceCounts.map(s => [s._id.toString(), s.count]));

        // Define icons and colors for each organization type
        const TYPE_META = {
            Hospital: { icon: "🏥", color: "#FF6B6B" },
            Bank: { icon: "🏦", color: "#00C9A7" },
            Government: { icon: "🏛️", color: "#4DA8DA" },
            Clinic: { icon: "🩺", color: "#845EC2" },
            Diagnostic: { icon: "🔬", color: "#F9A826" },
            Other: { icon: "🏢", color: "#A0AEC0" },
        };

        // Transform the organization data into the format needed for the frontend map, including geocoordinates and service counts
        const payload = orgs
            .filter(o => o.lat && o.lng)   // only include geocoded orgs
            .map(o => {
                const meta = TYPE_META[o.orgType] || TYPE_META.Other;
                return {
                    id: o._id.toString(),
                    name: o.orgName,
                    short: o.shortName || o.orgName.slice(0, 6),
                    type: o.orgType,
                    icon: meta.icon,
                    color: meta.color,
                    lat: o.lat,
                    lng: o.lng,
                    address: `${o.address}${o.area ? ", " + o.area : ""}, ${o.city}`,
                    area: o.area || o.city,
                    count: countMap[o._id.toString()] || 0,
                    verified: true,
                    logo: o.logo?.url || null,
                };
            });

        return res.status(200).json({ success: true, orgs: payload });
    } catch (error) {
        console.error("Error occurred while fetching organizations for map:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Routes 5: Get recent activity for a user by GET: api/orgs/public/activity
router.get('/public/activity', authorizeUser, async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const userId = req.user.id;

        // Validate that the user ID is present in the request (should be set by authorizeUser middleware)
        if (!userId) {
            return res.status(400).json({ success: false, error: "User identification required" });
        }

        // Fetch the most recent tokens for the user that are either served, skipped, or marked as no-show, along with their associated service and organization details
        const tokens = await QueueToken.find({
            userId,
            status: { $in: ["served", "skipped", "no_show"] }
        })
            .sort({ updatedAt: -1 })
            .limit(parseInt(limit))
            .populate("serviceId", "name icon color counter")
            .populate("orgId", "orgName shortName orgType");

        // Transform the token data into the format needed for the frontend
        const activity = tokens.map(t => ({
            service: t.serviceId?.name || "Service",
            org: t.orgId?.orgName || "Organization",
            token: t.tokenNumber,
            time: t.updatedAt,
            status: t.status === "served" ? "Completed" : t.status === "skipped" ? "Skipped" : "No Show",
            color: t.serviceId?.color || "#00C9A7",
            icon: t.serviceId?.icon || "🎟️",
        }));

        return res.status(200).json({ success: true, activity });
    } catch (error) {
        console.error("Error occurred while fetching recent activity:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Routes 6: Update organization status by PATCH: api/orgs/update-status/:id (admin only)
router.patch("/update-status/:id", authorizeAdmin, async (req, res) => {
    const { status, reason } = req.body;
    const allowedStatuses = ["pending", "approved", "rejected", "suspended"];

    // Check if the provided status is valid
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: `Invalid status. Allowed: ${allowedStatuses.join(", ")}` });
    }

    try {
        // Find the organization by ID and populate the associated user details
        const org = await Organization.findById(req.params.id)
            .populate("userId", "email");

        // Check if the organization exists or not
        if (!org) {
            return res.status(404).json({ success: false, error: "Organization not found" });
        }

        // Update the organization status
        org.status = status;

        // Store reason for rejected or suspended
        if (status === "rejected" || status === "suspended") {
            org.rejectionReason = reason?.trim() || null;
        } else {
            // Clear reason when approving / restoring
            org.rejectionReason = null;
        }

        await org.save();

        // Update the associated user's role based on the new organization status
        const roleMap = {
            approved: "approved_org",
            pending: "pending_org",
            rejected: "rejected_org",
            suspended: "suspended_org"
        };
        await User.findByIdAndUpdate(org.userId, { role: roleMap[status] });

        // Send notification email to the organization's admin contact
        let emailHtml, subject;

        if (status === 'approved') {
            emailHtml = getOrgApprovalTemplate(org.adminName, org.orgName);
            subject = "Your Organization has been Approved - SmartQueue";
        } else if (status === 'rejected') {
            emailHtml = getOrgRejectionTemplate(org.adminName, org.orgName, reason);
            subject = "Your Organization has been Rejected - SmartQueue";
        } else if (status === "suspended") {
            emailHtml = getOrgSuspensionTemplate(org.adminName, org.orgName, reason);
            subject = "Your Organization has been Suspended - SmartQueue";
        }

        if (emailHtml && subject) {
            await sendNotificationEmail(org.email, subject, emailHtml);
        }

        // Log the status update event in the admin activity log
        const eventMap = { approved: "org_approved", rejected: "org_rejected", suspended: "org_suspended" };
        const msgMap = {
            approved: `${org.orgName} has been approved and is now live`,
            rejected: `${org.orgName} registration was rejected${reason ? ` — ${reason}` : ""}`,
            suspended: `${org.orgName} has been suspended${reason ? ` — ${reason}` : ""}`,
        };

        if (eventMap[status]) {
            await logAdminActivity({
                eventType: eventMap[status],
                message: msgMap[status],
                meta: { orgId: org._id, orgName: org.orgName, orgType: org.orgType, reason }
            });
        }

        return res.status(200).json({ success: true, message: `Organization status updated to ${status}` });

    } catch (error) {
        console.error("Error occurred while updating organization status:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Routes 7: Delete organization by DELETE: api/orgs/delete/:id (admin only)
router.delete("/delete/:id", authorizeAdmin, async (req, res) => {
    try {
        const org = await Organization.findById(req.params.id);

        // Check if the organization exists or not
        if (!org) {
            return res.status(404).json({ success: false, error: "Organization not found" });
        }

        // Schedule the organization for deletion instead of immediate deletion
        const deletionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Set deletion date to 7 days from now

        // Update the organization status
        org.status = "scheduled_for_deletion";
        org.deletionExpiredAt = deletionDate;

        await org.save();

        // Update the associated user's role to "pending_org" to restrict access while allowing for potential reactivation
        await User.findByIdAndUpdate(org.userId, { role: "pending_org" });

        // Send notification email to the organization's admin contact about the scheduled deletion
        const emailHtml = getOrgDeletionTemplate(org.adminName, org.orgName, deletionDate);
        await sendNotificationEmail(org.email, "Organization Scheduled for Deletion - SmartQueue", emailHtml);

        // Log the deletion event in the admin activity log
        await logAdminActivity({
            eventType: "org_deleted",
            message: `${org.orgName} has been scheduled for permanent deletion in 7 days`,
            meta: { orgId: org._id, orgName: org.orgName, deletionDate }
        });

        return res.status(200).json({ success: true, message: "Organization scheduled for deletion. It will be permanently deleted after 7 days." });

    } catch (error) {
        console.error("Error occurred while scheduling organization for deletion:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Routes 8: Reactivate organization by PATCH: api/orgs/reactivate/:id (admin only)
router.patch("/reactivate/:id", authorizeAdmin, async (req, res) => {
    try {
        const org = await Organization.findById(req.params.id);

        // Check if the organization exists or not
        if (!org) {
            return res.status(404).json({ success: false, error: "Organization not found" });
        }

        // Update the organization status
        org.status = "approved";
        org.deletionExpiredAt = null;
        org.rejectionReason = null; // Clear any previous rejection reason

        await org.save();

        // Update the associated user's role
        await User.findByIdAndUpdate(org.userId, { role: "approved_org" });

        // Send notification email to the organization's admin contact about the reactivation
        const emailHtml = getOrgReactivationTemplate(org.adminName, org.orgName);
        await sendNotificationEmail(org.email, "Organization Account Reactivated - SmartQueue", emailHtml);

        // Log the reactivation event in the admin activity log
        await logAdminActivity({
            eventType: "org_reactivated",
            message: `${org.orgName} has been reactivated and is live again`,
            meta: { orgId: org._id, orgName: org.orgName, orgType: org.orgType }
        });

        return res.status(200).json({ success: true, message: "Organization reactivated successfully." });
    } catch (error) {
        console.error("Error occurred while reactivating organization:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Routes 9: Get all approved organizations for public listing by GET: api/orgs/public/approved-orgs
router.get('/public/approved-orgs', async (req, res) => {
    try {
        const approvedOrgs = await Organization.find({ status: "approved" })

        return res.status(200).json({ success: true, approvedOrgs: approvedOrgs });
    } catch (error) {
        console.error("Error occurred while fetching approved organizations:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;