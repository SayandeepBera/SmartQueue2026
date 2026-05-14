import mongoose, { Schema } from "mongoose";

const queueTokenSchema = new Schema({
    // Linked org + service
    orgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true
    },

    // Token details
    tokenNumber: {
        type: String,    // e.g. "H-A-088"
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        default: null
    },
    // Added: email for booking confirmation and "My Tokens" lookup
    email: {
        type: String,
        default: null,
        lowercase: true,
        trim: true,
        index: true     // indexed for fast "my tokens" queries
    },

    // Queue position (lower = closer to front; 1 = next)
    position: {
        type: Number,
        required: true
    },

    // Status lifecycle: waiting → next → serving → served | skipped | no_show
    status: {
        type: String,
        enum: ["waiting", "next", "serving", "served", "skipped", "no_show"],
        default: "waiting"
    },

    // Timing
    bookedAt: { type: Date, default: Date.now },
    calledAt: { type: Date, default: null },
    servedAt: { type: Date, default: null },

    // Estimated wait in minutes at time of booking
    estimatedWait: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

// Compound index — fast look up of a service's active queue
queueTokenSchema.index({ serviceId: 1, position: 1 });
queueTokenSchema.index({ serviceId: 1, status: 1 });

// For "my tokens" page
queueTokenSchema.index({ userId: 1, bookedAt: -1 }); 
queueTokenSchema.index({ email: 1, bookedAt: -1 });
queueTokenSchema.index({ phone: 1, bookedAt: -1 });

export default mongoose.model("QueueToken", queueTokenSchema);