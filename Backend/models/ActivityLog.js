import mongoose, { Schema } from 'mongoose';

const activityLogSchema = new Schema({

    orgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true
    },

    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        default: null
    },

    // Human-readable message  e.g. "Token H-A-087 served"
    message: {
        type: String,
        required: true
    },

    // Event category — used for filtering & icon mapping on the frontend
    eventType: {
        type: String,
        enum: [
            "token_booked",
            "token_served",
            "token_skipped",
            "token_no_show",
            "counter_opened",
            "counter_paused",
            "counter_closed",
            "counter_reset",
            "service_created",
            "service_edited",
            "service_deleted"
        ],
        required: true
    },

    // Optional extra payload (token number, counter name, etc.)
    meta: {
        type: Schema.Types.Mixed,
        default: {}
    }

}, { timestamps: true });

// TTL index — auto-delete logs older than 30 days to keep the collection lean
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

// Fast recent-log queries
activityLogSchema.index({ orgId: 1, createdAt: -1 });

export default mongoose.model("ActivityLog", activityLogSchema);