import mongoose, { Schema } from "mongoose";

const SupportChannelSchema = new Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        enum: ["live_chat", "email_support", "phone_support", "report_bug", "feature_request", "documentation"],
    },
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        trim: true, 
        default: "" 
    },
    actionLabel: { 
        type: String, 
        trim: true, 
        default: "Learn More" 
    },
    link: { 
        type: String, 
        trim: true, 
        default: null 
    },
    isEnabled: { 
        type: Boolean, 
        default: true 
    },
    order: { 
        type: Number, 
        default: 0 
    },
}, { timestamps: true });

export default mongoose.model("SupportChannel", SupportChannelSchema);