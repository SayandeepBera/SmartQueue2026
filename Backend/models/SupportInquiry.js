import mongoose, { Schema } from "mongoose";

const SupportInquirySchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        enum: [
            "General", "Token Booking", "Technical Issue",
            "Billing & Plans", "Organization Registration",
            "Queue Management", "Analytics", "Account Issue", "Other"
        ],
        default: "General",
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["open", "in-progress", "resolved"],
        default: "open"
    },
    adminResponse: {
        type: String,
        default: null
    },
    respondedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

export default mongoose.model("SupportInquiry", SupportInquirySchema);