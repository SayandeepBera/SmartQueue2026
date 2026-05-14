import ActivityLog from "../models/ActivityLog.js";

// Icon mapping for event types
const ICONS = {
    token_booked:    "🎟️",
    token_served:    "✅",
    token_skipped:   "⏭️",
    token_no_show:   "🚫",
    counter_opened:  "🟢",
    counter_paused:  "⏸️",
    counter_closed:  "🔴",
    counter_reset:   "🔄",
    service_created: "➕",
    service_edited:  "✏️",
    service_deleted: "🗑️",
};

// Function to log activity
const logActivity = async ({ orgId, eventType, message, serviceId = null, meta = {} }) => {
    try {
        await ActivityLog.create({
            orgId,
            eventType,
            message,
            serviceId,
            meta,
        });
    } catch (error) {
        console.error("Error logging activity:", error.message);
    }
};

export { logActivity, ICONS };