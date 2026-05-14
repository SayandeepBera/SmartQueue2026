import express from 'express';
import ActivityLog from '../models/ActivityLog.js';
import { ICONS } from '../utils/logActivity.js';

const router = express.Router();

// Route 1: Get recent activity logs for an organization by GET /api/activity/:orgId
router.get('/:orgId', async (req, res) => {
    try {
        const { orgId } = req.params;

        // Optional query param to limit number of logs returned (default 20, max 50)
        const limit = Math.min(parseInt(req.query.limit) || 20, 50); // Max 100 logs at a time

        // Fetch recent activity logs for the organization, sorted by most recent
        const logs = await ActivityLog.find({ orgId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Helper to format time difference in a human-readable way
        const formatTime = (date) => {
            const diff = Math.floor((Date.now() - new Date(date)) / 1000);
            if (diff < 60) return `${diff} seconds ago`; if (diff < 60) return `${diff}s ago`;
            if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
            if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;

            return `${Math.floor(diff / 86400)} d ago`;
        }

        // Map logs to frontend-friendly format
        const formatted = logs.map(log => ({
            _id: log._id,
            msg: log.message,
            time: formatTime(log.createdAt),
            icon: ICONS[log.eventType] || "📋",
            eventType: log.eventType,
            meta: log.meta,
        }));

        return res.status(200).json({ success: true, activity: formatted });
    } catch (error) {
        console.error("Error fetching activity logs:", error);
        return res.status(500).json({ success: false, message: "Server error fetching activity logs" });
    }
});

export default router;