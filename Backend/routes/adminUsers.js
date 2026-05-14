import express from 'express';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import authorizeAdmin from '../middleware/authorizeAdmin.js';
import { sendNotificationEmail } from '../utils/emailService.js';
import {
    getUserSuspensionTemplate,
    getUserRestorationTemplate,
    getUserDeletionTemplate
} from '../utils/emailTemplates.js';
import { deleteFromCloudinary } from '../utils/cloudinary.js';
import { logAdminActivity } from '../utils/logAdminActivity.js';

const router = express.Router();

router.use(authorizeAdmin); // All routes in this file require admin authorization

// Route 1: Get all users (admin only) - GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const { search = '', status = 'all', page = 1, limit = 50 } = req.query;

        // Only fetch regular users (not orgs or admins)
        const userRoles = ['user', 'suspended_user'];

        const matchQuery = {
            role: {
                $in: userRoles
            }
        };

        // Build aggregation: join Profile on userId
        const pipeline = [
            { $match: matchQuery },

            // Join Profile
            {
                $lookup: {
                    from: 'profiles',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profile'
                }
            },
            { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },

            // Shape the output — combine User + Profile fields
            {
                $project: {
                    _id: 1,
                    username: 1,
                    email: 1,
                    role: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    // from Profile
                    fullName: { $ifNull: ['$profile.fullName', null] },
                    phone: { $ifNull: ['$profile.phone', null] },
                    gender: { $ifNull: ['$profile.gender', null] },
                    city: { $ifNull: ['$profile.city', null] },
                    state: { $ifNull: ['$profile.state', null] },
                    bio: { $ifNull: ['$profile.bio', null] },
                    totalTokens: { $ifNull: ['$profile.totalTokens', 0] },
                    avatar: { $ifNull: ['$profile.avatar', null] },
                }
            },

            // Search filter (username, email, fullName, city)
            ...(search ? [{
                $match: {
                    $or: [
                        { username: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { fullName: { $regex: search, $options: 'i' } },
                        { city: { $regex: search, $options: 'i' } },
                    ]
                }
            }] : []),

            // Status filter
            ...(status !== 'all' ? [{
                $match: { role: status === 'suspended' ? 'suspended_user' : 'user' }
            }] : []),

            { $sort: { createdAt: -1 } },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) },
        ];

        const users = await User.aggregate(pipeline);

        // Total count (for pagination)
        const total = await User.countDocuments(matchQuery);

        return res.json({
            success: true,
            total,
            page: parseInt(page),
            users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ success: false, error: "Server error while fetching users." });
    }
});

// Route 2: single user details by GET /api/admin/users/:id
router.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId).select('-password -resetOTP -resetOTPExpiry');

        // If user is not found
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found." });
        }

        // Fetch the profile details for this user
        const profile = await Profile.findOne({ userId: user._id });

        return res.json({ success: true, user, profile: profile || null });
    } catch (error) {
        console.error("Error fetching user details:", error);
        return res.status(500).json({ success: false, error: "Server error while fetching user details." });
    }
});

// Route 3: Update user status (suspend/activate) by PATCH /api/admin/update-users/:id/status
router.patch('/update-users/:id/status', async (req, res) => {
    const { action } = req.body;

    if (!['suspend', 'restore'].includes(action)) {
        return res.status(400).json({ success: false, error: "Invalid action. Must be 'suspend' or 'restore'." });
    }

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found." });
        }

        if (action === 'restore' && user.role !== 'suspended_user') {
            return res.status(400).json({ success: false, error: "Only suspended users can be restored." });
        }

        user.role = action === 'suspend' ? 'suspended_user' : 'user';
        await user.save();

        const profile = await Profile.findOne({ userId: user._id });
        const displayName = profile?.fullName || user.username;

        let emailHtml, subject;

        // Send notification email to user about status change
        if (action === 'suspend') {
            emailHtml = getUserSuspensionTemplate(displayName, user.email);
            subject = 'Your SmartQueue account has been suspended';
        } else {
            emailHtml = getUserRestorationTemplate(displayName, user.email);
            subject = 'Your SmartQueue account has been restored';
        }

        await sendNotificationEmail(user.email, subject, emailHtml);

        // Log this admin activity
        const eventMap = { suspend: "user_suspended", restore: "user_restored" };
        const msgMap = {
            suspend: `${displayName} has been suspended`,
            restore: `${displayName} has been restored`,
        };

        if (eventMap[action]) {
            await logAdminActivity({
                eventType: eventMap[action],
                message: msgMap[action],
                meta: { userId: user._id, username: user.username, email: user.email }
            });
        }

        return res.json({
            success: true,
            message: `User has been ${action === 'suspend' ? 'suspended' : 'restored'} successfully.`,
            newRole: user.role
        });
    } catch (error) {
        console.error("Error updating user status:", error);
        return res.status(500).json({ success: false, error: "Server error while updating user status." });
    }
});

// Route 4: Permanently delete user by DELETE /api/admin/delete-users/:id
router.delete('/delete-users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        // If user is not found
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found." });
        }

        // Fetch the profile to get display name and check for avatar
        const profile = await Profile.findOne({ userId: user._id });
        const displayName = profile?.fullName || user.username;

        // If user has an avatar, delete it from Cloudinary
        if (profile?.avatar?.public_id) {
            try {
                await deleteFromCloudinary(profile.avatar.public_id);
            } catch (error) {
                console.error("Error deleting avatar from Cloudinary:", error);
            }
        }

        // Permanently delete the user and their profile
        await Profile.findOneAndDelete({ userId: user._id });
        await User.findByIdAndDelete(user._id);

        // Send notification email to user about account deletion
        const emailHtml = getUserDeletionTemplate(displayName, user.email);
        await sendNotificationEmail(user.email, 'Your SmartQueue account has been removed', emailHtml);

        // Log this admin activity
        await logAdminActivity({
            eventType: "user_deleted",
            message: `${displayName} has been deleted permanently`,
            meta: { userId: user._id, username: user.username, email: user.email }
        });

        return res.json({ success: true, message: "User has been permanently deleted." });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ success: false, error: "Server error while deleting user." });
    }
});

export default router;