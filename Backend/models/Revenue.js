// models/Revenue.js
import mongoose, { Schema } from "mongoose";

const revenueSchema = new Schema({
    // YYYY-MM  e.g. "2024-07"
    month: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    // Human-readable label  e.g. "Jul"
    label: {
        type: String,
        required: true,
        trim: true,
    },

    // Total amount collected this month  (sum of all active paid org subscriptions)
    totalRevenue: {
        type: Number,
        default: 0,
        min: 0,
    },

    // Breakdown per plan
    breakdown: {
        Free:       { type: Number, default: 0 },
        Starter:    { type: Number, default: 0 },
        Pro:        { type: Number, default: 0 },
        Enterprise: { type: Number, default: 0 },
    },

    // How many orgs were on each plan during this month
    orgCounts: {
        Free:       { type: Number, default: 0 },
        Starter:    { type: Number, default: 0 },
        Pro:        { type: Number, default: 0 },
        Enterprise: { type: Number, default: 0 },
    },

}, { timestamps: true });

export default mongoose.model("Revenue", revenueSchema);