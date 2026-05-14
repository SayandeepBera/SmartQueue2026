import mongoose, { Schema } from "mongoose";

const serviceSchema = new Schema({
    // Linked organization
    orgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },
    icon: {
        type: String,
        default: "🎛️"
    },
    // Counter ID e.g. "H-A"
    counter: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    color: {
        type: String,
        default: "#00C9A7"
    },
    maxQueueSize: {
        type: Number,
        default: 50
    },
    avgWait: {
        type: Number,
        default: 10   // minutes
    },

    // Status
    status: {
        type: String,
        enum: ["active", "paused", "closed"],
        default: "active"
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // Daily stats — reset each day by cron
    stats: {
        total:   { 
            type: Number, 
            default: 0 
        },
        served:  { 
            type: Number, 
            default: 0 
        },
        skipped: { 
            type: Number, 
            default: 0 
        },
        noShows: { 
            type: Number, 
            default: 0 
        },
    },

    // Prefix used when generating token numbers e.g. "H-A-001"
    tokenPrefix: {
        type: String,
        trim: true,
        default: null   // falls back to counter value if null
    },
    // Incremental counter for today's token numbers
    tokenSequence: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

export default mongoose.model("Service", serviceSchema);