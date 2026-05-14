import express from 'express';
import AdminActivityLog from '../models/AdminActivityLog.js';
import { ADMIN_EVENT_ICONS } from "../utils/logAdminActivity.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";

const router = express.Router();

// Route: Get recent admin activity logs by GET /api/admin/activity
router.get("/activity", authorizeAdmin, async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const { type } = req.query;

        const query = {};

        // If a specific type is requested (and it's not "all"), filter by that type
        if (type && type !== "all") query.eventType = type;

        // Fetch logs based on query, sorted by most recent
        const logs = await AdminActivityLog.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Helper to format time difference in a human-readable way
        const formatTime = (date) => {
            const diff = Math.floor((Date.now() - new Date(date)) / 1000);
            if (diff < 60) return `${diff}s ago`;
            if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
            if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
            return `${Math.floor(diff / 86400)} d ago`;
        };

        // Map logs to frontend-friendly format
        const activity = logs.map(log => ({
            _id: log._id,
            msg: log.message,
            time: formatTime(log.createdAt),
            icon: ADMIN_EVENT_ICONS[log.eventType] || "📋",
            type: log.eventType,
            meta: log.meta,
        }));

        return res.status(200).json({ success: true, activity, total: activity.length });
    } catch (error) {
        console.error("Error fetching admin activity:", error);
        return res.status(500).json({ success: false, error: "Server error fetching activity" });
    }
});

export default router;