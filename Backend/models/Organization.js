import mongoose, { Schema } from "mongoose";

const imageAndDocSchema = new Schema({
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
    }
}, { _id: false });

const organizationSchema = new Schema({
    // Linked auth user
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    // Step 1: Orgs type
    orgType: {
        type: String,
        enum: ["Hospital", "Bank", "Government", "Clinic", "Diagnostic", "Other"],
        required: true
    },

    // Step 2: Basic info
    orgName: {
        type: String,
        required: true,
        trim: true
    },
    shortName: {
        type: String,
        required: true,
        default: null
    },
    regNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    gstNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: null
    },
    estYear: {
        type: Number,
        default: null
    },
    staffCount: {
        type: String,
        default: null
    },
    workStart: {
        type: String,
        default: "09:00"
    },
    workEnd: {
        type: String,
        default: "18:00"
    },

    // Step 3: Contact info & location
    adminName: {
        type: String,
        required: true,
        trim: true
    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    area: {
        type: String,
        default: null
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    pincode: {
        type: String,
        required: true
    },
    lat: {
        type: Number,
        default: null
    },
    lng: {
        type: Number,
        default: null
    },
    website: {
        type: String,
        default: null
    },

    // Step 4: Documents (Cloudinary)
    // Required docs
    docRegCert: {
        type: imageAndDocSchema,
        default: null
    },
    docGst: {
        type: imageAndDocSchema,
        default: null
    },
    docIdProof: {
        type: imageAndDocSchema,
        default: null
    },
    // Optional docs
    docAddressProof: {
        type: imageAndDocSchema,
        default: null
    },
    logo: {
        type: imageAndDocSchema,   // org logo (optional)
        default: null
    },

    // Step 5: Plan
    plan: {
        type: String,
        enum: ["Free", "Starter", "Pro", "Enterprise"],
        default: "Free"
    },

    // Status
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "suspended", "scheduled_for_deletion"],
        default: "pending"
    },
    rejectionReason: {
        type: String,
        default: null
    },

    // Tracking the deletion of a guide profile
    deletionExpiredAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

export default mongoose.model("Organization", organizationSchema);