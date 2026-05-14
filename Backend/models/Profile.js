import mongoose, { Schema } from "mongoose";

const profileSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    avatar: {
        url: {
            type: String,
            default: null
        },
        public_id: {
            type: String,
            default: null
        }
    },

    fullName: {
        type: String,
        trim: true,
        default: null
    },
    phone: {
        type: String,
        trim: true,
        default: null
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other", null],
        default: null
    },
    city: {
        type: String,
        trim: true,
        default: null
    },
    state: {
        type: String,
        trim: true,
        default: null
    },
    bio: {
        type: String,
        trim: true,
        default: null,
        maxlength: 300
    },

    totalTokens: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model('Profile', profileSchema);