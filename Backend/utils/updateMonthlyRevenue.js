import Organization from "../models/Organization.js";
import Revenue from "../models/Revenue.js";

export const updateMonthlyRevenue = async () => {
    // Get current month in "YYYY-MM" format and label (e.g. "Jul")
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const label = now.toLocaleString("en", { month: "short" });

    const planPrices = {
        Free: 0,
        Starter: 499,
        Pro: 1999,
        Enterprise: 4999,
    }

    // Get org counts for each plan
    const counts = await Organization.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: "$plan", count: { $sum: 1 } } }
    ]);

    // Create a map of plan name to org count for easy lookup
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

    // Update org counts and breakdown based on aggregation results
    counts.forEach(c => {
        if (orgCounts[c._id] !== undefined) {
            orgCounts[c._id] = c.count;
            breakdown[c._id] = c.count * planPrices[c._id] || 0;
        }
    });

    // Calculate total revenue as sum of all plans
    const totalRevenue = Object.values(breakdown).reduce((a, b) => a + b, 0);

    // Upsert the revenue document for the current month
    await Revenue.findOneAndUpdate(
        { month: key },
        { month: key, label: label, totalRevenue, breakdown, orgCounts },
        { upsert: true, new: true }
    );
}