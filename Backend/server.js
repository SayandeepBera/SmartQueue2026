import express from "express";
import cors from 'cors';
import "dotenv/config";

import connectToMongo from "./config/db.js";
import initCronTasks from "./services/cronTasks.js";
import authRoutes from "./routes/auth.js";
import orgsRoutes from "./routes/orgs.js";
import plansRoutes from "./routes/plans.js";
import profileRoutes from "./routes/profile.js";
import adminUsersRoutes from "./routes/adminUsers.js";
import serviceRoutes from "./routes/services.js";
import queueRoutes from "./routes/queue.js";
import analyticsRoutes from "./routes/analytics.js";
import activityRoutes from "./routes/activity.js";
import publicRoutes from "./routes/public.js";
import userTokenRoutes from "./routes/userToken.js";
import adminActivityRoutes from "./routes/admin-activity.js";
import supportRoutes from "./routes/support.js";

// Connect to MongoDB
connectToMongo();

// Initialize scheduled cron tasks
initCronTasks();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/orgs", orgsRoutes);
app.use("/api/plans", plansRoutes); 
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminUsersRoutes); // Admin routes for user management
app.use("/api/services", serviceRoutes); // Service routes
app.use("/api/queue", queueRoutes); // Queue management routes
app.use("/api/analytics", analyticsRoutes); // Analytics routes
app.use("/api/activity", activityRoutes); // Activity log routes
app.use("/api/public", publicRoutes); // Public routes for stats and org/service listing
app.use("/api/my-tokens", userTokenRoutes); // Routes for users to view their tokens
app.use("/api/admin", adminActivityRoutes); // Admin activity log routes
app.use("/api/support", supportRoutes); // Support inquiry routes

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});