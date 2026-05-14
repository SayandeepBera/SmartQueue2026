import mongoose, { Schema } from "mongoose";

const planSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ["Free", "Starter", "Pro", "Enterprise"],
        trim: true,
    },

    price: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },

    color: {
        type: String,
        default: "#64748b",
    },

    features: {
        type: [String],
        default: [],
    },

    // Limits enforced at org-dashboard level
    maxCounters: {
        type: Number,
        default: 2,
    },
    maxTokensPerDay: {
        // -1 means unlimited
        type: Number,
        default: 100,
    },

    // Feature flags
    smsAlerts:   { 
        type: Boolean, 
        default: false 
    },
    apiAccess:   { 
        type: Boolean, 
        default: false 
    },
    fullAnalytics: { 
        type: Boolean, 
        default: false 
    },
    whiteLabel:  { 
        type: Boolean, 
        default: false 
    },
    prioritySupport: { 
        type: Boolean, 
        default: false 
    },

    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default mongoose.model("Plan", planSchema);