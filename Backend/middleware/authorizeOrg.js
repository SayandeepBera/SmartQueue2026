import jwt from "jsonwebtoken";
import Organization from "../models/Organization.js";
import User from "../models/User.js";

const ORG_ROLES = ['approved_org', 'pending_org', 'suspended_org', 'rejected_org'];

const authorizeOrg = async (req, res, next) => {
    const token = req.header("auth-token");

    // Check if token is provided
    if (!token) {
        return res.status(401).json({ success: false, error: "Access denied. No token provided." });
    }

    try {
        // Verify token and extract user info
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;

        // Check if user has an organization-related role
        const user = await User.findById(decoded.user.id).select("role");
    
        if (!user || !ORG_ROLES.includes(user.role)) {
            return res.status(403).json({ success: false, error: "Access denied. Organization account required." });
        }

        // Attach orgId for use in route handlers
        const org = await Organization.findOne({ userId: decoded.user.id }).select("_id status");
        if (!org) {
            return res.status(403).json({ success: false, error: "No organization profile found for this account." });
        }

        // If org is not approved, deny access to protected routes
        if (org.status !== "approved") {
            return res.status(403).json({ success: false, error: "Your organization account is not yet approved." });
        }

        // Attach orgId to request object for use in route handlers
        req.orgId = org._id.toString();
        next();
    } catch (error) {
        return res.status(400).json({ success: false, error: "Invalid or expired token. Please log in again." });
    }
};

export default authorizeOrg;
