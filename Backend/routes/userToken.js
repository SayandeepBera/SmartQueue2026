import express from 'express';
import QueueToken from '../models/QueueToken.js';
import Service from '../models/Service.js';

const router = express.Router();

const ORG_META = {
    Hospital: { icon: "🏥", color: "#FF6B6B" },
    Bank: { icon: "🏦", color: "#00C9A7" },
    Government: { icon: "🏛️", color: "#4DA8DA" },
    Clinic: { icon: "🩺", color: "#845EC2" },
    Diagnostic: { icon: "🔬", color: "#F96167" },
    Other: { icon: "🏢", color: "#FFC75F" },
};

// Route 1: Get all tokens for the user - GET /api/my-tokens/
router.get('/', async (req, res) => {
    try {
        const { userId, email, phone, limit = 20, page = 1 } = req.query;

        if (!userId && !email && !phone) {
            return res.status(400).json({
                success: false,
                error: "At least one of userId, email, or phone is required."
            });
        }

        // Build query — userId takes priority for logged-in users
        let query;
        if (userId) {
            query = { userId };
        } else if (email && phone) {
            // Guest: match either email OR phone (OR query catches all their tokens)
            query = { $or: [{ email: email.toLowerCase() }, { phone }] };
        } else if (email) {
            query = { email: email.toLowerCase() };
        } else {
            query = { phone };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await QueueToken.countDocuments(query);

        const tokens = await QueueToken.find(query)
            .sort({ bookedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate("serviceId", "name counter color icon avgWait")
            .populate("orgId", "orgName address area city lat lng")
            .lean();

        return res.json({
            success: true,
            tokens,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error("Error fetching user tokens:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Route 2: Get a single token's live status - GET /api/my-tokens/token-status/:tokenId
router.get('/token-status/:tokenId', async (req, res) => {
    try {
        const token = await QueueToken.findById(req.params.tokenId)
            .populate("serviceId", "name counter color icon avgWait status isActive")
            .populate("orgId", "orgName address area city lat lng")
            .lean();

        // If token not found or already served/skipped/no_show, return 404
        if (!token)
            return res.status(404).json({ success: false, error: "Token not found." });

        // Count how many are ahead
        const ahead = await QueueToken.countDocuments({
            serviceId: token.serviceId._id || token.serviceId,
            status: { $in: ["waiting", "next"] },
            position: { $lt: token.position }
        });

        return res.json({ success: true, token, ahead });
    } catch (error) {
        console.error("Error fetching token status:", error);
        return res.status(500).json({ success: false, error: "Server error while fetching token status." });
    }
});

export default router;