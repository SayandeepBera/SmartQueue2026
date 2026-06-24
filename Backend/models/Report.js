import mongoose, { Schema } from "mongoose";

const attachmentSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    public_id: {
        type: String,
        required: true
    },
    format: {
        type: String,
    },
    name: {
        type: String,
    },
    size: {
        type: Number
    }
}, { _id: false });

const reportSchema = new Schema({
    type: {
        type: String,
        enum: ["bug", "idea"],
        required: true,
    },
    submitterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    submitterName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    submitterEmail: { 
        type: String, 
        required: true, 
        trim: true 
    },
    submitterRole: {
        type: String,
        enum: ["user", "approved_org", "pending_org", "rejected_org", "suspended_org", "suspended_user"],
        default: "user",
    },
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        required: true, 
        trim: true 
    },
    category: {
        type: String,
        enum: ["UI/UX", "Performance", "Queue Management", "Token Booking", "Organization", "Security", "Other"],
        default: "Other",
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium",
    },
    status: {
        type: String,
        enum: ["open", "in_review", "planned", "resolved", "closed"],
        default: "open",
    },
    adminResponse: { 
        type: String, 
        default: null 
    },
    respondedAt: { 
        type: Date, 
        default: null 
    },
    upvotes: { 
        type: Number, 
        default: 0 
    },
    attachments: [attachmentSchema],
}, { timestamps: true });

export default mongoose.model("Report", reportSchema);