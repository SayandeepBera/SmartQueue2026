import mongoose, { Schema } from "mongoose";

const adminActivityLogSchema = new Schema({
    eventType: {
        type: String,
        enum: [
            "org_registered", "org_approved", "org_rejected",
            "org_suspended", "org_deleted", "org_reactivated",
            "user_registered", "user_suspended", "user_restored",
            "user_deleted", "plan_changed",
        ],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    meta: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

// Auto-delete after 90 days
adminActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

// Fast recent queries
adminActivityLogSchema.index({ createdAt: -1 });
adminActivityLogSchema.index({ eventType: 1, createdAt: -1 });

export default mongoose.model("AdminActivityLog", adminActivityLogSchema);