import express from 'express';
import { body, validationResult } from 'express-validator';
import Plan from '../models/Plan.js';
import Organization from '../models/Organization.js';
import Revenue from '../models/Revenue.js';
import authorizeAdmin from '../middleware/authorizeAdmin.js';
import { updateMonthlyRevenue } from '../utils/updateMonthlyRevenue.js';
import { logAdminActivity } from '../utils/logAdminActivity.js';

const router = express.Router();

// Validation rules for updating a plan
const planUpdateValidator = [
    body("price").optional().isNumeric().withMessage("Price must be a number"),
    body("color").optional().isString().trim(),
    body("features").optional().isArray().withMessage("Features must be an array"),
    body("maxCounters").optional().isInt({ min: -1 }),
    body("maxTokensPerDay").optional().isInt({ min: -1 }),
    body("smsAlerts").optional().isBoolean(),
    body("apiAccess").optional().isBoolean(),
    body("fullAnalytics").optional().isBoolean(),
    body("whiteLabel").optional().isBoolean(),
    body("prioritySupport").optional().isBoolean(),
];

// Routes 1: Get all plans by GET "/api/plans"
router.get('/', async (req, res) => {
    try {
        const plans = await Plan.find({ isActive: true }).sort({ price: 1 });

        // Get org counts for each plan using aggregation
        const planNames = plans.map(p => p.name);
        const counts = await Organization.aggregate([
            { $match: { plan: { $in: planNames } } },
            { $group: { _id: "$plan", count: { $sum: 1 } } }
        ]);

        // Create a map of plan name to org count for easy lookup
        const countMap = {};
        counts.forEach(c => {
            countMap[c._id] = c.count
        });

        // Enrich plans with org counts and monthly revenue
        const enriched = plans.map(p => ({
            ...p.toObject(),
            orgCount: countMap[p.name] || 0,
            monthlyRevenue: ((countMap[p.name] || 0) * p.price)
        }));

        return res.status(200).json({ success: true, plans: enriched });
    } catch (error) {
        console.error('Error fetching plans:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Routes 2: Single plan details by GET "/api/plans/:name"
router.get('/:name', async (req, res) => {
    try {
        const plan = await Plan.findOne({ name: req.params.name, isActive: true });

        // If plan not found, return 404
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Plan not found' });
        }

        // Get org count for this plan
        const orgCount = await Organization.countDocuments({ plan: plan.name });

        return res.status(200).json({ success: true, plan: { ...plan.toObject(), orgCount, monthlyRevenue: orgCount * plan.price } });
    } catch (error) {
        console.error('Error fetching plan:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Routes 3: Update plan details by PUT "/api/plans/:name" (admin only)
router.put('/:name', authorizeAdmin, planUpdateValidator, async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const allowed = [
            "price", "color", "features", "maxCounters", "maxTokensPerDay",
            "smsAlerts", "apiAccess", "fullAnalytics", "whiteLabel", "prioritySupport"
        ];

        const updateData = {};

        // Only include fields that are present in the request body
        allowed.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Find the plan by name and update with new data
        const plan = await Plan.findOneAndUpdate(
            { name: req.params.name, isActive: true },
            { $set: updateData },
            { new: true }
        );

        // If plan not found, return 404
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Plan not found' });
        }

        return res.status(200).json({ success: true, message: 'Plan updated successfully', plan });

    } catch (error) {
        console.error('Error updating plan:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Routes 4: Organization plan change for a specific organization by PATCH "/api/plans/org/:orgId" (admin only)
router.patch('/org/:orgId', authorizeAdmin, async (req, res) => {
    const { plan } = req.body;

    const validPlans = ["Free", "Starter", "Pro", "Enterprise"];

    // Validate that the provided plan is one of the valid options
    if (!plan || !validPlans.includes(plan)) {
        return res.status(400).json({ success: false, error: 'Invalid or missing plan' });
    }

    try {
        const org = await Organization.findById(req.params.orgId);

        // If organization not found, return 404
        if (!org) {
            return res.status(404).json({ success: false, error: 'Organization not found' });
        }

        // Update the org's plan
        const oldPlan = org.plan;
        org.plan = plan;

        await org.save();

        // Update revenue data for the month since this org's subscription has changed
        await updateMonthlyRevenue();

        await logAdminActivity({
            eventType: "plan_changed",
            message: `Changed plan for ${org.orgName} from ${oldPlan} to ${plan}`,
            meta: { orgId: org._id, orgName: org.orgName, oldPlan, newPlan: plan }
        });

        return res.status(200).json({ success: true, message: `Organization plan updated to ${plan}`, org: { _id: org._id, orgName: org.orgName, plan: org.plan } });
    } catch (error) {
        console.error('Error updating organization plan:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Routes 5: Get monthly revenue data for charts by GET "/api/plans/revenue/chart" (admin only)
router.get('/revenue/chart', authorizeAdmin, async (req, res) => {
    try {
        const months = [];

        // Generate keys and labels for the last 7 months (including current month)
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(1);
            date.setMonth(date.getMonth() - i);

            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            const label = date.toLocaleString("en", { month: "short" });

            months.push({ key, label });
        }

        // Fetch revenue records for these months
        const keys = months.map(m => m.key);
        const records = await Revenue.find({ month: { $in: keys } });
        const recmap = {};

        // Create a map of month key to revenue record for easy lookup
        records.forEach(r => {
            recmap[r.month] = r;
        });

        // Define plan prices for revenue calculation
        const planPrices = {
            Free: 0,
            Starter: 499,
            Pro: 1999,
            Enterprise: 4999,
        }

        // For each month, either use the existing revenue record or calculate real-time revenue for the current month
        const result = await Promise.all(months.map(async ({ key, label }) => {
            // If a record exists for this month, use it
            if (recmap[key]) {
                return {
                    month: label,
                    totalRevenue: recmap[key].totalRevenue,
                    breakdown: recmap[key].breakdown,
                    orgCounts: recmap[key].orgCounts,
                }
            }

            // If no record exists, check if it's the current month. If yes, calculate real-time revenue based on active orgs. If not, return zero revenue.
            const isCurrentMonth = key === months[months.length - 1].key;

            if (isCurrentMonth) {
                // For current month, calculate real-time revenue based on active orgs
                const counts = await Organization.aggregate([
                    { $match: { status: "approved" } },
                    { $group: { _id: "$plan", count: { $sum: 1 } } }
                ]);

                const orgCounts = {
                    Free: 0,
                    Starter: 0,
                    Pro: 0,
                    Enterprise: 0,
                }

                const breakdown = {
                    Free: 0,
                    Starter: 0,
                    Pro: 0,
                    Enterprise: 0,
                }

                counts.forEach(c => {
                    if (orgCounts[c._id] !== undefined) {
                        orgCounts[c._id] = c.count;
                        breakdown[c._id] = c.count * planPrices[c._id] || 0;
                    }
                });

                const totalRevenue = Object.values(breakdown).reduce((a, b) => a + b, 0);

                return {
                    month: label,
                    totalRevenue,
                    breakdown,
                    orgCounts,
                }
            }

            return {
                month: label,
                totalRevenue: 0,
                breakdown: {
                    Free: 0,
                    Starter: 0,
                    Pro: 0,
                    Enterprise: 0,
                },
                orgCounts: {
                    Free: 0,
                    Starter: 0,
                    Pro: 0,
                    Enterprise: 0,
                },
            };
        }));

        return res.status(200).json({ success: true, chart: result });
    } catch (error) {
        console.error('Error fetching revenue chart data:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Routes 6: Manually trigger a snapshot for the current month by POST "/api/plans/revenue/snapshot" (admin only)
router.post("/revenue/snapshot", authorizeAdmin, async (req, res) => {
    try {
        await updateMonthlyRevenue();

        return res.status(200).json({ success: true, message: "Revenue snapshot saved for current month" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Routes 7: SEED PLANS  (call once to populate the Plan collection) by POST "/api/plans/seed" (admin only)
router.post("/seed", authorizeAdmin, async (req, res) => {
    try {
        const existing = await Plan.countDocuments();

        // If plans already exist, do not seed again to prevent duplicates
        if (existing > 0) {
            return res.status(400).json({ success: false, error: "Plans already seeded" });
        }

        // Define default plans to seed into the database
        const defaultPlans = [
            {
                name: "Free",
                price: 0,
                color: "#64748b",
                features: ["2 counters", "100 tokens/day", "Basic analytics"],
                maxCounters: 2,
                maxTokensPerDay: 100,
                smsAlerts: false,
                apiAccess: false,
                fullAnalytics: false,
                whiteLabel: false,
                prioritySupport: false,
            },
            {
                name: "Starter",
                price: 499,
                color: "#00C9A7",
                features: ["5 counters", "500 tokens/day", "SMS alerts", "Priority support"],
                maxCounters: 5,
                maxTokensPerDay: 500,
                smsAlerts: true,
                apiAccess: false,
                fullAnalytics: false,
                whiteLabel: false,
                prioritySupport: true,
            },
            {
                name: "Pro",
                price: 1999,
                color: "#fbbf24",
                features: ["15 counters", "Unlimited tokens", "Full analytics", "API access"],
                maxCounters: 15,
                maxTokensPerDay: -1,
                smsAlerts: true,
                apiAccess: true,
                fullAnalytics: true,
                whiteLabel: false,
                prioritySupport: true,
            },
            {
                name: "Enterprise",
                price: 4999,
                color: "#a78bfa",
                features: ["Unlimited counters", "Unlimited tokens", "Dedicated support", "White-label"],
                maxCounters: -1,
                maxTokensPerDay: -1,
                smsAlerts: true,
                apiAccess: true,
                fullAnalytics: true,
                whiteLabel: true,
                prioritySupport: true,
            },
        ];

        // Insert default plans into the database
        await Plan.insertMany(defaultPlans);

        return res.status(200).json({ success: true, message: "Plans seeded successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;