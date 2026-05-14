import express from 'express';
import { body, validationResult } from 'express-validator';
import authorizeUser from '../middleware/authorizeUser.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Organization from '../models/Organization.js';
import bcrypt from 'bcryptjs';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import upload from '../middleware/imageUpload.js';

const router = express.Router();

// Validation rules for updating a profile
const profileUpdateValidator = [
    body("fullName").optional().trim().isLength({ max: 80 }).withMessage("Name should be less than 80 chars"),
    body("phone").optional().trim(),
    body("city").optional().trim(),
    body("state").optional().trim(),
    body("bio").optional().trim().isLength({ max: 300 }).withMessage("Bio should be less than 300 chars"),
    body("gender").optional().isIn(["Male", "Female", "Other"]).withMessage("Gender must be Male, Female or Other"),
];

// Helper function to get or create a profile for a user
const getOrCreateProfile = async (userId) => {
    let profile = await Profile.findOne({ userId });

    if (!profile) {
        profile = await Profile.create({ userId });
    }

    return profile;
};

// Routes 1: Get full profile by GET /api/profile/me
router.get('/me/:userId', authorizeUser, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password -resetOTP -resetOTPExpiry');

        // If user is not found (shouldn't happen if token is valid, but just in case)
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found." });
        }

        const profile = await getOrCreateProfile(req.params.userId);

        let orgDetails = null;

        // Only fetch organization details if the user has an organization-related role
        const orgRoles = ['pending_org', 'approved_org', 'rejected_org', 'suspended_org'];

        // If user has an org role, fetch the organization details
        if (orgRoles.includes(user.role)) {
            orgDetails = await Organization.findOne({ userId: req.params.userId })
                .select("orgName shortName orgType city state address email phone plan status logo adminName designation estYear workStart workEnd");
        }

        return res.json({ success: true, user, profile, org: orgDetails });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ success: false, error: "Server error while fetching profile." });
    }
});

// Routes 2: Update profile by PUT /api/profile/update-details
router.put('/update-details/:id', authorizeUser, profileUpdateValidator, async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const allowed = ["fullName", "phone", "gender", "city", "state", "bio"];

        const updateData = {};

        // Only add fields that are present in the request body and are allowed to be updated
        allowed.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Find the profile by user ID and update with new data
        const updatedProfile = await Profile.findOneAndUpdate(
            { userId: req.params.id },
            { $set: updateData },
            { new: true, upsert: true } // Create a new profile if one doesn't exist
        );

        return res.status(200).json({ success: true, profile: updatedProfile, message: "Profile updated successfully." });

    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ success: false, error: "Server error while updating profile." });
    }
});

// Routes 3: Update username by PUT /api/profile/username
router.put('/username/:id', authorizeUser, [
    body("username").notEmpty().trim().toLowerCase()
        .isLength({ min: 3, max: 30 }).withMessage("Username should be between 3 and 30 characters.")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores.")
], async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username } = req.body;

        // Check if the new username is already taken by another user
        const existingUser = await User.findOne({ username, _id: { $ne: req.params.id } });

        if (existingUser) {
            return res.status(400).json({ success: false, error: "Username is already taken by another user." });
        }

        // Update the username of the current user
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { username } },
            { new: true }
        ).select('-password -resetOTP -resetOTPExpiry');

        return res.status(200).json({ success: true, user: updatedUser, message: "Username updated successfully." });
    } catch (error) {
        console.error("Error updating username:", error);
        return res.status(500).json({ success: false, error: "Server error while updating username." });
    }
});

// Routes 4: Update password by PUT /api/profile/password
router.put("/password/:id", authorizeUser, [
    body("currentPassword").notEmpty().withMessage("Current password is required."),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long.")
], async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { currentPassword, newPassword } = req.body;

        // Fetch the user from the database
        const user = await User.findById(req.params.id);

        // Check if the current password matches
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        // If the current password is incorrect, return an error
        if (!isMatch) {
            return res.status(400).json({ success: false, error: "Current password is incorrect." });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({ success: true, message: "Password updated successfully." });

    } catch (error) {
        console.error("Error updating password:", error);
        return res.status(500).json({ success: false, error: "Server error while updating password." });
    }
});

// Routes 5: Update avatar by POST /api/profile/avatar
router.put('/avatar/:id', authorizeUser, upload.single('avatar'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: "No image file uploaded." });
    }

    try {
        const profile = await getOrCreateProfile(req.params.id);

        // If the user already has an avatar, delete the old one from Cloudinary
        if (profile.avatar && profile.avatar?.public_id) {
            await deleteFromCloudinary(profile.avatar.public_id);
        }      
        
        // Upload the new avatar to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.buffer, "users/avatars", "image");

        // Update the profile with the new avatar details
        profile.avatar = {
            url: uploadResult.url,
            public_id: uploadResult.public_id
        };

        await profile.save();

        return res.status(200).json({ success: true, avatar: profile.avatar, message: "Avatar updated successfully." });
    } catch (error) {
        console.error("Error updating avatar:", error);
        return res.status(500).json({ success: false, error: "Server error while updating avatar." });
    }
});

// Routes 6: Delete avatar by DELETE /api/profile/avatar
router.delete('/delete-avatar/:id', authorizeUser, async (req, res) => {
    try {
        const profile = await getOrCreateProfile(req.params.id);

        // If there is no avatar to delete, return an error
        if (!profile.avatar || !profile.avatar?.public_id) {
            return res.status(400).json({ success: false, error: "No avatar to delete." });
        }

        // Delete the avatar from Cloudinary
        await deleteFromCloudinary(profile.avatar.public_id);

        // Remove avatar details from the profile
        profile.avatar = { url: null, public_id: null };
        await profile.save();

        return res.status(200).json({ success: true, message: "Avatar deleted successfully." });
    } catch (error) {
        console.error("Error deleting avatar:", error);
        return res.status(500).json({ success: false, error: "Server error while deleting avatar." });
    }
});

export default router;