import express from "express";
import SupportInquiry from "../models/SupportInquiry.js";
import authorizeUser from "../middleware/authorizeUser.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";
import { ChatMessage, ChatConversation } from "../models/Chat.js";
import authorizeOrg from "../middleware/authorizeOrg.js";
import SupportChannel from "../models/SupportChannel.js";
import Report from "../models/Report.js";
import upload from "../middleware/imageUpload.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { sendNotificationEmail } from "../utils/emailService.js";
import {
    getContactFormUserTemplate,
    getContactFormAdminTemplate,
    getReportUserTemplate,
    getReportAdminTemplate,
    getIdeaUserTemplate,
    getIdeaAdminTemplate,
    getInquiryResponseTemplate,
    getBugResponseTemplate,
    getIdeaResponseTemplate,
} from "../utils/emailTemplates.js";
import User from "../models/User.js";

const router = express.Router();

const ADMIN_EMAIL = process.env.EMAIL_USER;

// Default support channels to seed if collection is empty
const DEFAULT_CHANNELS = [
    { key: "live_chat", order: 0, title: "Live Chat", description: "Average response: 2 mins", actionLabel: "Start Chat", link: null },
    { key: "email_support", order: 1, title: "Email Support", description: "support@smartqueue.com", actionLabel: "Send Email", link: "mailto:support@smartqueue.com?subject=Enterprise Support Request" },
    { key: "phone_support", order: 2, title: "24/7 Assistance", description: "Enterprise Hotline", actionLabel: "Call Now", link: "tel:+18001234567" },
    { key: "report_bug", order: 3, title: "Report a Bug", description: "Help us improve SmartQueue", actionLabel: "Report Issue", link: null },
    { key: "feature_request", order: 4, title: "Feature Request", description: "Share your ideas with us", actionLabel: "Submit Idea", link: null },
    { key: "documentation", order: 5, title: "Documentation", description: "Find answers and guides", actionLabel: "Read Docs", link: null },
];

// ----- Channels (PUBLIC READ / ADMIN WRITE) -----

// Routes 1: Get all enabled support channels - GET /api/support/channels
router.get("/channels", async (req, res) => {
    try {
        let channels = await SupportChannel.find({ isEnabled: true }).sort({ order: 1 });

        // Auto-seed if collection is empty
        if (channels.length === 0) {
            await SupportChannel.insertMany(DEFAULT_CHANNELS);
            channels = await SupportChannel.find({ isEnabled: true }).sort({ order: 1 });
        }

        res.json({ success: true, channels });
    } catch (error) {
        console.error("Error fetching channels:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Route 2: Admin - Return all channels (including disabled) - GET /api/support/admin/channels
router.get("/admin/channels", authorizeAdmin, async (req, res) => {
    try {
        let channels = await SupportChannel.find().sort({ order: 1 });

        // Auto-seed if collection is empty (should only happen on first ever run)
        if (channels.length === 0) {
            await SupportChannel.insertMany(DEFAULT_CHANNELS);
            channels = await SupportChannel.find().sort({ order: 1 });
        }

        res.json({ success: true, channels });
    } catch (error) {
        console.error("Error fetching admin channels:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// Route 3: Admin - Update channel 
router.put("/admin/channels/:id", authorizeAdmin, async (req, res) => {
    try {
        const { title, description, actionLabel, link, isEnabled, order } = req.body;

        // Update channel details
        const updated = await SupportChannel.findByIdAndUpdate(
            req.params.id,
            { $set: { title, description, actionLabel, link, isEnabled, order } },
            { new: true, runValidators: true }
        );

        // Check if channel was updated
        if (!updated) return res.status(404).json({ success: false, error: "Channel not found" });

        res.json({ success: true, message: "Channel updated", channel: updated });
    } catch (error) {
        console.error("Error updating channel:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// ------ Support Inquiries (AUTHENTICATED USERS) ------

// Route 1: Submit a support message (User or Org) - POST /api/support/submit
router.post('/submit', authorizeUser, async (req, res) => {
    try {
        const { name, email, category, message } = req.body;

        const newInquiry = await SupportInquiry.create({
            userId: req.user.id,
            name, email, category, message
        });

        // Send notification email to user 
        try {
            const emailTemplateUser = getContactFormUserTemplate(name, category, message);
            await sendNotificationEmail(email, "We received your message - SmartQueue Support", emailTemplateUser);
        } catch (error) {
            console.error("Error sending user confirmation email:", error);
        }

        // Send notification email to admin
        try {
            const emailTemplateAdmin = getContactFormAdminTemplate(name, email, category, message);
            await sendNotificationEmail(ADMIN_EMAIL, `New Support Inquiry: ${category}`, emailTemplateAdmin);
        } catch (error) {
            console.error("Error sending admin notification email:", error);
        }


        res.json({ success: true, message: "Inquiry has been submitted successfully", data: newInquiry });
    } catch (error) {
        console.error("Error submitting inquiry:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// Route 2: Admin: Fetch all inquiries - GET /api/support/admin/all
router.get("/admin/all", authorizeAdmin, async (req, res) => {
    try {
        const { status, category, search, page = 1, limit = 50 } = req.query;
        const query = {};

        // Build query based on filters
        if (status && status !== "all") query.status = status;
        if (category && category !== "all") query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { message: { $regex: search, $options: "i" } },
            ];
        }

        // Get total count for pagination
        const total = await SupportInquiry.countDocuments(query);
        const inquiries = await SupportInquiry.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({ success: true, inquiries, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error("Error fetching inquiries:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// Route 3: Admin: Update inquiry status and response - PUT /api/support/admin/update/:id
router.put('/admin/update/:id', authorizeAdmin, async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const inquiryId = req.params.id;

        // Validate status
        const validStatuses = ["open", "in-progress", "resolved"];

        // If status is provided, validate it
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: "Invalid status" });
        }

        // Prepare update data
        const updateData = { status, adminResponse };
        if (status === "resolved") {
            updateData.respondedAt = new Date();
        }

        // Update inquiry
        const updatedInquiry = await SupportInquiry.findByIdAndUpdate(
            inquiryId,
            { $set: updateData },
            { new: true }
        );

        // Check if inquiry was updated
        if (!updatedInquiry) {
            return res.status(404).json({ success: false, error: "Inquiry not found" });
        }

        // Send notification email to user if there's an admin response
        if (adminResponse?.trim()) {
            try {
                const emailHtml = getInquiryResponseTemplate(
                    updatedInquiry.name,
                    updatedInquiry.category,
                    updatedInquiry.message,
                    adminResponse,
                    status
                );
                await sendNotificationEmail(
                    updatedInquiry.email,
                    `Re: Your SmartQueue Support Inquiry [${updatedInquiry.category}]`,
                    emailHtml
                );
            } catch (error) {
                console.error("Error sending email:", error);
            }
        }

        res.json({ success: true, message: "Inquiry has been updated successfully", data: updatedInquiry });
    } catch (error) {
        console.error("Error updating inquiry:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// Route 4:  Admin: Delete an inquiry - DELETE /api/support/admin/delete/:id
router.delete('/admin/delete/:id', authorizeAdmin, async (req, res) => {
    try {
        const inquiryId = req.params.id;

        const deleted = await SupportInquiry.findByIdAndDelete(inquiryId);

        // Check if inquiry was deleted
        if (!deleted) {
            return res.status(404).json({ success: false, error: "Inquiry not found" });
        }

        res.json({ success: true, message: "Inquiry has been deleted successfully" });
    } catch (error) {
        console.error("Error deleting inquiry:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// ----- Reports (Bug Reports + Feature Ideas) -----

// Route 1: Submit a report (bug or idea) - POST /api/support/report
router.post('/report', authorizeUser, upload.array("attachments", 3), async (req, res) => {
    try {
        const { type, title, description, category, priority } = req.body;

        // Validate type
        if (!["bug", "idea"].includes(type))
            return res.status(400).json({ success: false, error: "Invalid type" });

        // Upload attachments
        let attachments = [];

        if (req.files?.length > 0) {
            for (const file of req.files) {
                const result = await uploadToCloudinary(file.buffer, "support/reports", "auto");
                attachments.push({ url: result.url, public_id: result.public_id, format: result.format, name: file.originalname, size: file.size });
            }
        }

        // Fetch user
        const existingUser = await User.findById(req.user.id);

        // If user not found (should not happen due to auth middleware), return error
        if (!existingUser) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Create report in DB
        const report = await Report.create({
            type,
            submitterId: req.user.id,
            submitterName: existingUser.username || "User",
            submitterEmail: existingUser.email || "",
            submitterRole: req.user.role || "user",
            title, description,
            category: category || "Other",
            priority: priority || "medium",
            attachments,
        });

        // Send confirmation email to user
        try {
            const emailHtml = type === "bug"
                ? getReportUserTemplate(existingUser.username || "User", title, category, priority)
                : getIdeaUserTemplate(existingUser.username || "User", title, category);
            const subject = type === "bug" ? "Bug Report Received - SmartQueue" : "Feature Idea Received - SmartQueue";

            // Send notification email to user
            if (existingUser.email)
                await sendNotificationEmail(existingUser.email, subject, emailHtml);
        } catch (error) {
            console.error("Error sending user confirmation email:", error);
        }

        // Send notification email to admin
        try {
            const adminHtml = type === "bug"
                ? getReportAdminTemplate(existingUser.username || "User", existingUser.email || "", title, category, priority, description)
                : getIdeaAdminTemplate(existingUser.username || "User", existingUser.email || "", title, category, description);
            const adminSubject = type === "bug" ? `New Bug Report: ${title}` : `New Feature Idea: ${title}`;

            await sendNotificationEmail(ADMIN_EMAIL, adminSubject, adminHtml);
        } catch (error) {
            console.error("Error sending admin notification email:", error);
        }

        res.status(201).json({ success: true, message: "Report has been submitted successfully", report });
    } catch (error) {
        console.error("Error submitting report:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// Route 2: Admin - Get all reports - GET /api/support/admin/reports
router.get('/admin/reports', authorizeAdmin, async (req, res) => {
    try {
        const { type, status, category, priority, search, page = 1, limit = 50 } = req.query;
        const query = {};

        // If a specific type is requested (and it's not "all"), filter by that type
        if (type && type !== "all") query.type = type;
        if (status && status !== "all") query.status = status;
        if (category && category !== "all") query.category = category;
        if (priority && priority !== "all") query.priority = priority;

        // If search is provided, filter by title, submitter name, or description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { submitterName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        // Get total count
        const total = await Report.countDocuments(query);

        // Get reports
        const reports = await Report.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));

        res.json({ success: true, reports, total });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// Route 3: Admin - Update report - PUT /api/support/admin/reports/:id
router.put('/admin/reports/:id', authorizeAdmin, async (req, res) => {
    try {
        const { status, adminResponse, priority } = req.body;

        const updateData = {};

        // Update status
        if (status) {
            updateData.status = status;
        }

        // Update admin response
        if (adminResponse !== undefined) {
            updateData.adminResponse = adminResponse;
        }

        // Update priority
        if (priority) {
            updateData.priority = priority;
        }

        // If status is being set to "resolved", also set respondedAt timestamp
        if (status === "resolved") {
            updateData.respondedAt = new Date();
        }

        // Update the report
        const updated = await Report.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });

        // Check if report was found and updated
        if (!updated) {
            return res.status(404).json({ success: false, error: "Report not found" });
        }

        // Send email notification to submitter if there's an admin response
        if (adminResponse?.trim() && updated.submitterEmail) {
            try {
                const emailHtml = updated.type === "bug"
                    ? getBugResponseTemplate(updated.submitterName, updated.title, updated.category, adminResponse, status)
                    : getIdeaResponseTemplate(updated.submitterName, updated.title, updated.category, adminResponse, status);
                const subject = updated.type === "bug"
                    ? `Update on your Bug Report: ${updated.title}`
                    : `Update on your Feature Idea: ${updated.title}`;
                await sendNotificationEmail(updated.submitterEmail, subject, emailHtml);
            } catch (error) {
                console.error("Error sending email:", error);
            }
        }

        res.json({ success: true, report: updated });
    } catch (error) {
        console.error("Error updating report:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// Route 4: Admin - Delete report - DELETE /api/support/admin/reports/:id
router.delete('/admin/reports/:id', authorizeAdmin, async (req, res) => {
    try {
        const deleted = await Report.findByIdAndDelete(req.params.id);

        // Check if report was found and deleted
        if (!deleted) {
            return res.status(404).json({ success: false, error: "Report not found" });
        }

        res.json({ success: true, message: "Report has been deleted successfully" });
    } catch (error) {
        console.error("Error deleting report:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// ----- Live Chat (AUTHENTICATED USERS) -----

// Route 1: Start a live chat session - POST /api/support/chat/start
router.post("/chat/start", authorizeUser, async (req, res) => {
    try {
        const { initiatorType = "user", initiatorName } = req.body;
        const initiatorId = req.user.id;

        // Check if there's an existing open conversation for this user/org
        let conversation = await ChatConversation.findOne({ initiatorId, status: { $ne: "closed" } });

        // If no open conversation exists, create a new one
        if (!conversation) {
            conversation = await ChatConversation.create({
                initiatorId,
                initiatorType,
                initiatorName: initiatorName || req.user.username || "User",
                status: "open",
            });
        }

        res.json({ success: true, conversation });
    } catch (error) {
        console.error("Error starting chat:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// Route 2: user fetches their own conversation + messages - GET /api/support/chat/my
router.get("/chat/my", authorizeUser, async (req, res) => {
    try {
        // Find the user's active conversation
        const conversation = await ChatConversation.findOne({
            initiatorId: req.user.id,
            status: { $ne: "closed" },
        });

        // If no conversation exists, return empty response
        if (!conversation) {
            return res.json({ success: true, conversation: null, messages: [] });
        }

        // Fetch all messages for this conversation
        const messages = await ChatMessage.find({ conversationId: conversation._id }).sort({ createdAt: 1 });

        // Mark admin messages as read
        await ChatMessage.updateMany(
            { conversationId: conversation._id, sender: "admin", isRead: false },
            { $set: { isRead: true } }
        );

        // Also update conversation's unread count for user to 0
        await ChatConversation.findByIdAndUpdate(conversation._id, { $set: { unreadByUser: 0 } });

        res.json({ success: true, conversation, messages });
    } catch (error) {
        console.error("Error fetching user chat:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// Route 3: user sends a message in their conversation - POST /api/support/chat/message
router.post("/chat/message", authorizeUser, async (req, res) => {
    try {
        const { conversationId, message, senderName, messageType = "text", attachment } = req.body;

        const conversation = await ChatConversation.findById(conversationId);

        // Validate conversation
        if (!conversation) {
            return res.status(404).json({ success: false, error: "Conversation not found" });
        }

        // Ensure the conversation belongs to the user/org
        if (conversation.initiatorId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, error: "Not your conversation" });
        }

        // Create new message
        const newMsg = await ChatMessage.create({
            conversationId,
            sender: conversation.initiatorType,
            senderId: req.user.id,
            senderName: senderName || req.user.username || "User",
            message: message || "",
            messageType,
            attachment: attachment || undefined,
        });

        // Update conversation's last message and increment unread count for admin
        await ChatConversation.findByIdAndUpdate(conversationId, {
            $set: { lastMessage: message || (attachment ? `📎 ${attachment.name}` : ""), lastMessageAt: new Date() },
            $inc: { unreadByAdmin: 1 },
            ...(conversation.status === "open" ? { $set: { status: "in_progress" } } : {}),
        });

        res.json({ success: true, message: newMsg });
    } catch (error) {
        console.error("Error sending chat message:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// Route 4: Chat file upload - POST /api/support/chat/upload
router.post("/chat/upload", authorizeUser, upload.single("file"), async (req, res) => {
    try {
        // Validate that a file was uploaded
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file uploaded" });
        }

        // Determine resource type for Cloudinary based on MIME type
        const resourceType = req.file.mimetype.startsWith("image/") ? "image" : "raw";

        // Upload file to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, "support/chat", resourceType);

        // Determine if the uploaded file is an image based on its MIME type
        const isImage = req.file.mimetype.startsWith("image/");

        res.json({
            success: true,
            attachment: {
                url: result.url,
                public_id: result.public_id,
                format: result.format || req.file.mimetype.split("/")[1],
                name: req.file.originalname,
                size: req.file.size,
            },
            messageType: isImage ? "image" : "file",
        });
    } catch (error) {
        console.error("Error uploading chat file:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// Route 5: long-poll for new messages (user side) - GET /api/support/chat/poll/:conversationId
router.get("/chat/poll/:conversationId", authorizeUser, async (req, res) => {
    try {
        const { since } = req.query; // ISO timestamp

        const query = { conversationId: req.params.conversationId };

        // If 'since' parameter is provided, only fetch messages created after that timestamp
        if (since)
            query.createdAt = { $gt: new Date(since) };

        const messages = await ChatMessage.find(query).sort({ createdAt: 1 });

        // Mark admin messages as read
        if (messages.length > 0) {
            await ChatMessage.updateMany(
                { conversationId: req.params.conversationId, sender: "admin", isRead: false },
                { $set: { isRead: true } }
            );

            await ChatConversation.findByIdAndUpdate(req.params.conversationId, { $set: { unreadByUser: 0 } });
        }

        res.json({ success: true, messages });
    } catch (error) {
        console.error("Error polling messages:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Route 6: Admin fetches all conversations with latest message - GET /api/support/admin/chats
router.get("/admin/chats", authorizeAdmin, async (req, res) => {
    try {
        const { status, search } = req.query;
        const query = {};

        // If status is provided, filter by status
        if (status && status !== "all") query.status = status;

        // If search is provided, filter by initiator name
        if (search) {
            query.initiatorName = {
                $regex: search,
                $options: "i"
            };
        }

        // Fetch conversations with latest message info
        const conversations = await ChatConversation.find(query).sort({ lastMessageAt: -1, createdAt: -1 });

        res.json({ success: true, conversations });
    } catch (error) {
        console.error("Error fetching admin chats:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// Route 7: admin fetches messages in a conversation - GET /api/support/admin/chats/:id
router.get("/admin/chats/:id", authorizeAdmin, async (req, res) => {
    try {
        const conversationId = req.params.id;

        const conversation = await ChatConversation.findById(conversationId);

        // If conversation doesn't exist, return error
        if (!conversation) {
            return res.status(404).json({ success: false, error: "Conversation not found" });
        }

        // Fetch all messages for this conversation
        const messages = await ChatMessage.find({ conversationId }).sort({ createdAt: 1 });

        // Mark user/org messages as read
        await ChatMessage.updateMany(
            { conversationId: req.params.id, sender: { $ne: "admin" }, isRead: false },
            { $set: { isRead: true } }
        );

        await ChatConversation.findByIdAndUpdate(req.params.id, { $set: { unreadByAdmin: 0 } });

        res.json({ success: true, conversation, messages });
    } catch (error) {
        console.error("Error fetching admin chat messages:", error);
        res.status(500).json({ success: false, error: "Internal Server error" });
    }
});

// Route 8: admin replies in a conversation - POST /api/support/admin/chats/:id/message
router.post("/admin/chats/:id/message", authorizeAdmin, async (req, res) => {
    try {
        const { message, messageType = "text", attachment } = req.body;

        const conversation = await ChatConversation.findById(req.params.id);

        // If conversation doesn't exist, return error
        if (!conversation) {
            return res.status(404).json({ success: false, error: "Conversation not found" });
        }

        // Create new admin message
        const newMsg = await ChatMessage.create({
            conversationId: req.params.id,
            sender: "admin",
            senderId: req.user.id,
            senderName: "Support Team",
            message: message || "",
            messageType,
            attachment: attachment || undefined,
        });

        // Update conversation's last message and increment unread count for user/org
        await ChatConversation.findByIdAndUpdate(req.params.id, {
            $set: { lastMessage: message || (attachment ? `📎 ${attachment.name}` : ""), lastMessageAt: new Date(), status: "in_progress" },
            $inc: { unreadByUser: 1 },
        });

        res.json({ success: true, message: newMsg });
    } catch (error) {
        console.error("Error sending admin message:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Route 9: admin updates conversation status - PUT /api/support/admin/chats/:id/status
router.put("/admin/chats/:id/status", authorizeAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ["open", "in_progress", "resolved", "closed"];

        // Validate status
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: "Invalid status" });
        }

        // Update conversation status
        const updated = await ChatConversation.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        );

        res.json({ success: true, conversation: updated });
    } catch (error) {
        console.error("Error updating chat status:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Route 10: long-poll for new messages (admin side) - GET /api/support/admin/chats/:id/poll
router.get("/admin/chats/:id/poll", authorizeAdmin, async (req, res) => {
    try {
        const { since } = req.query;
        const query = { conversationId: req.params.id };

        // If 'since' parameter is provided, only fetch messages created after that timestamp
        if (since)
            query.createdAt = { $gt: new Date(since) };

        // Fetch messages
        const messages = await ChatMessage.find(query).sort({ createdAt: 1 });

        // Also return conversation status and unread count for admin
        const conversation = await ChatConversation.findById(req.params.id).select("status unreadByAdmin");

        // Mark user/org messages as read
        if (messages.length > 0) {
            await ChatMessage.updateMany(
                { conversationId: req.params.id, sender: { $ne: "admin" }, isRead: false },
                { $set: { isRead: true } }
            );

            await ChatConversation.findByIdAndUpdate(req.params.id, { $set: { unreadByAdmin: 0 } });
        }

        res.json({ success: true, messages, conversation });
    } catch (error) {
        console.error("Error polling admin messages:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

/* ----- Inquiry & Report History ----- */

// Route: Get user's own inquiries and reports - GET /api/support/my/inquiries
router.get("/my/inquiries", authorizeUser, async (req, res) => {
    try {
        const inquiries = await SupportInquiry.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 inquiries

        res.json({ success: true, inquiries });
    } catch (error) {
        console.error("Error fetching user inquiries:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Route: Get user's own reports - GET /api/support/my/reports
router.get("/my/reports", authorizeUser, async (req, res) => {
    try {
        const reports = await Report.find({ submitterId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 reports

        res.json({ success: true, reports });
    } catch (error) {
        console.error("Error fetching user reports:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

export default router;