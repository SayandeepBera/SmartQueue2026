import mongoose, { Schema } from "mongoose";

// Message model for individual chat messages
const ChatMessageSchema = new Schema({
    conversationId: {
        type: mongoose.Types.ObjectId,
        ref: "ChatConversation",
        required: true,
        index: true,
    },
    sender: {
        type: String,
        enum: ['user', 'pending_org', 'approved_org', 'rejected_org', 'suspended_org', 'suspended_user', 'admin'],
        required: true,
    },
    senderId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    senderName: { 
        type: String, 
        default: "Unknown" 
    },
    message: { 
        type: String,  
        trim: true,
        default: "" 
    },
    messageType: {
        type: String,
        enum: ["text", "image", "file", "emoji"],
        default: "text",
    },
    attachment: {
        url: { type: String },
        name: { type: String },
        size: { type: Number },
        format: { type: String },
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
}, { timestamps: true });

// Conversation model to track chat sessions
const ChatConversationSchema = new Schema({
    // The user or org who initiated the conversation
    initiatorId: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
    },
    initiatorType: {
        type: String,
        enum: ["user", "approved_org", "pending_org", "rejected_org", "suspended_org", "suspended_user"],
        required: true,
    },
    initiatorName: { 
        type: String, 
        default: "Unknown" 
    },
    status: {
        type: String,
        enum: ["open", "in_progress", "resolved", "closed"],
        default: "open",
    },
    lastMessage: { 
        type: String, 
        default: null 
    },
    lastMessageAt: { 
        type: Date, 
        default: null 
    },
    unreadByAdmin: { 
        type: Number, 
        default: 0 
    },
    unreadByUser: { 
        type: Number, 
        default: 0 
    },
}, { timestamps: true });

export const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);
export const ChatConversation = mongoose.model("ChatConversation", ChatConversationSchema);