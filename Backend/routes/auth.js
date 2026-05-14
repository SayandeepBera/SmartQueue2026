import express from 'express';
import { check, validationResult } from "express-validator";
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendNotificationEmail } from '../utils/emailService.js';
import { getOTPTemplate } from '../utils/emailTemplates.js';
import validator from 'validator';
import { oAuth2Client } from '../utils/googleConfig.js';
import axios from 'axios';
import Organization from '../models/Organization.js';
import { logAdminActivity } from '../utils/logAdminActivity.js';
import crypto from "crypto";

const router = express.Router();

const JWT_SECRET = process.env.SECRET_KEY;

// Helper function to get orgId for a user based on their role
const ORG_ROLES = ['pending_org', 'approved_org', 'rejected_org', 'suspended_org'];

const getOrgId = async (userId, role) => {
    if (!ORG_ROLES.includes(role)) return null;

    try {
        const org = await Organization.findOne({ userId }).select('_id');
        return org?._id?.toString() || null;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

// Routes 1 : Register a user using: POST "/api/auth/register".
router.post('/register', [
    // Validation
    check("username", "Please enter a valid username").notEmpty().trim().toLowerCase()
        .isLength({ min: 3, max: 30 }).withMessage("Username must be 3–30 characters")
        .matches(/^[a-z0-9_]+$/).withMessage("Only lowercase letters, numbers, underscores"),
    check("email", "Please enter a valid email").isEmail().normalizeEmail({ gmail_remove_dots: false }),
    check("password", "Please enter a valid password").isLength({ min: 6 }),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        // Check if username OR email already exists
        const existingUser = await User.findOne({ username });
        const existingEmail = await User.findOne({ email });

        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    error: "A user with this username already exists.",
                });
        }

        if (existingEmail) {
            return res
                .status(400)
                .json({ success: false, error: "A user with this email already exists." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({
            username,
            email,
            password: securePassword
        });

        // Payload for JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // Produces a JWT token valid for 24 hours
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

        await logAdminActivity({
            eventType: "user_registered",
            message: `New user registered: ${username} (${email})`,
            meta: { userId: user._id, username: user.username, email: user.email }
        });

        res.json({
            success: true,
            authToken: token,
            role: user.role,
            username: user.username,
            userId: user.id,
            email: user.email
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Routes 2: Login a user by POST "/api/auth/login"
router.post(
    "/login",
    [
        // validation
        check("loginIdentifier", "Please enter a valid username or email")
            .notEmpty(),
        check("password", "Please enter a valid password").isLength({ min: 6 }),
    ],
    async (req, res) => {
        // validationResult function checks whether any error occurs or not and return an object
        const error = validationResult(req);

        // If some error occurs, then return the error
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }

        const { loginIdentifier, password } = req.body;
        let success = false;

        try {
            // Convert username or email to lowercase
            const sanitizedIdentifier = validator.isEmail(loginIdentifier) ? validator.normalizeEmail(loginIdentifier, { gmail_remove_dots: false }).toLowerCase() : loginIdentifier.toLowerCase();

            // Find user by either username OR email (after converting to lowercase)
            const existUser = await User.findOne({
                $or: [
                    { username: sanitizedIdentifier },
                    { email: sanitizedIdentifier },
                ],
            });

            console.log("existUser : ", existUser);
            // Check user exist or not
            if (!existUser) {
                return res.status(400).json({ success, error: "Invalid Credentials. Please try again." });
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, existUser.password);

            // Check password matche or not
            if (!isMatch) {
                return res.status(400).json({ success, error: "Invalid Credentials. Please try again." });
            }

            // Get orgId for org users (null for regular users/admins)
            const orgId = await getOrgId(existUser._id, existUser.role);

            // JWT payload for secure authentication
            const payload = {
                user: {
                    id: existUser.id,
                    role: existUser.role,
                },
            };

            // Produces a signed JSON Web Token
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

            res.json({
                success: true,
                authToken: token,
                role: existUser.role,
                username: existUser.username,
                userId: existUser.id,
                email: existUser.email,
                orgId: orgId
            });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ success, error: "Internal Server Error" });
        }
    }
);

// Routes 3: Forgot password: POST "/api/auth/forgot-password"
router.post("/forgot-password", [
    // Validation
    check("email", "Please enter a valid email").isEmail().normalizeEmail({ gmail_remove_dots: false }),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
        const existUser = await User.findOne({ email: email.toLowerCase() });

        if (!existUser) {
            return res.status(400).json({ success: false, error: "No user found with this email." });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP and its expiry time (10 minutes) in the user's document
        existUser.resetOTP = otp;
        existUser.resetOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now

        await existUser.save();

        // Send OTP email to the user
        const htmlContent = getOTPTemplate(existUser.username, otp);
        await sendNotificationEmail(existUser.email, "Password Reset OTP - Smart Queue System", htmlContent);

        res.json({ success: true, message: "OTP has been sent to your email." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Routes 4: Verify OTP by POST "/api/auth/verify-otp"
router.post("/verify-otp", [
    // Validation
    check("email", "Please enter a valid email").isEmail().normalizeEmail({ gmail_remove_dots: false }),
    check("otp", "Please enter a valid 6-digit OTP").isLength({ min: 6, max: 6 }).isNumeric(),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    try {
        // Find user with matching email and valid OTP (not expired)
        const existUser = await User.findOne({
            email: email.toLowerCase(),
            resetOTP: otp,
            resetOTPExpiry: { $gt: Date.now() },
        });
        
        // If no user found with matching email and valid OTP, return error
        if (!existUser) {
            return res.status(400).json({ success: false, error: "Invalid or expired OTP. Please try again." });
        }

        res.json({ success: true, message: "OTP verified successfully. You can now reset your password." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Routes 5: Reset password by POST "/api/auth/reset-password"
router.post("/reset-password", [
    // Validation
    check("email", "Please enter a valid email").isEmail().normalizeEmail({ gmail_remove_dots: false }),
    check("newPassword", "Please enter a password with at least 6 characters").isLength({ min: 6 }),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, newPassword } = req.body;

    try {
        // Find user with matching email and valid OTP (not expired)
        const existUser = await User.findOne({
            email: email.toLowerCase(),
            resetOTPExpiry: { $gt: Date.now() },
        });

        // If no user found with matching email and valid OTP, return error
        if (!existUser) {
            return res.status(400).json({ success: false, error: "Invalid or expired OTP. Please try again." });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password
        existUser.password = hashedPassword;
        existUser.resetOTP = null;
        existUser.resetOTPExpiry = null;

        await existUser.save();

        res.json({ success: true, message: "Password has been reset successfully." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Routes 6: Google OAuth login by POST "/api/auth/google-login"
router.get("/google-login", async (req, res) => {
    try {
        const { code } = req.query;
        // Exchange authorization code for access token
        const googleResponse = await oAuth2Client.getToken(code);
        
        // Set credentials for further API calls
        oAuth2Client.setCredentials(googleResponse.tokens);

        // Get user info from Google
        const userResponse = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`
        );

        const { email, name } = userResponse.data;

        // Check if user with this email already exists
        let existUser = await User.findOne({ email: email.toLowerCase() });

        // If user doesn't exist, create a new user with a random password
        if (!existUser) {
            // Generate a secure, random password for social login users
            const randomPassword = crypto.randomBytes(16).toString("hex");

            // Generate salt and hash the random password
            const salt = await bcrypt.genSalt(10);
            const securePassword = await bcrypt.hash(randomPassword, salt);

            // Create a new user
            existUser = await User.create({
                username: name,
                email: email,
                password: securePassword,
            });
        }

        // JWT payload for secure authentication
        const payload = {
            user: {
                id: existUser.id,
                role: existUser.role,
            },
        };

        // Produces a signed JSON Web Token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ 
            success: true, 
            authToken: token, 
            role: existUser.role, 
            username: existUser.username,
            userId: existUser.id
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Google login failed. Please try again." });
    }
});

export default router;