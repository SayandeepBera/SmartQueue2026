import AdminActivityLog from "../models/AdminActivityLog.js";

// Icon mapping for admin event types
export const ADMIN_EVENT_ICONS = {
    org_registered:  "🏢",
    org_approved:    "✅",
    org_rejected:    "❌",
    org_suspended:   "⚠️",
    org_deleted:     "🗑️",
    org_reactivated: "🔄",
    user_registered: "👤",
    user_suspended:  "🚫",
    user_restored:   "♻️",
    user_deleted:    "🗑️",
    plan_changed:    "💎",
};

// Function to log admin activity
export const logAdminActivity = async ({ eventType, message, meta = {} }) => {
    try {
        await AdminActivityLog.create({ eventType, message, meta });
    } catch (err) {
        console.error("Failed to log admin activity:", err);
    }
};