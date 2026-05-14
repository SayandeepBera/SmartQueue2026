import express from 'express';
import QueueToken from '../models/QueueToken.js';
import authorizeOrg from '../middleware/authorizeOrg.js';
import { todayRange, yesterdayRange, weekStart } from '../utils/analyticsHelper.js';
import Service from '../models/Service.js';

const router = express.Router();

// Route 1: Get analytics data for the dashboard by GET /api/analytics/:orgId
router.get('/:orgId', authorizeOrg, async (req, res) => {
    try {
        const { orgId } = req.params;
        const { start: todayStart, end: todayEnd } = todayRange();
        const { start: yStart, end: yEnd } = yesterdayRange();
        const wStart = weekStart();

        // Total tokens booked today and yesterday
        const [todayTokens, yesterdayTokens] = await Promise.all([
            QueueToken.countDocuments({ orgId, bookedAt: { $gte: todayStart, $lte: todayEnd } }),
            QueueToken.countDocuments({ orgId, bookedAt: { $gte: yStart, $lte: yEnd } }),
        ]);

        // Served tokens are those that completed the lifecycle with status "served"
        const [todayServed, yesterdayServed] = await Promise.all([
            QueueToken.countDocuments({ orgId, status: "served", servedAt: { $gte: todayStart, $lte: todayEnd } }),
            QueueToken.countDocuments({ orgId, status: "served", servedAt: { $gte: yStart, $lte: yEnd } }),
        ]);

        // Skipped tokens are those that were called but not served, and later marked as skipped
        const todaySkipped = await QueueToken.countDocuments({
            orgId, status: "skipped", updatedAt: { $gte: todayStart, $lte: todayEnd }
        });

        // No-shows are tokens that were called but not served, and later marked as no-show
        const todayNoShows = await QueueToken.countDocuments({
            orgId, status: "no_show", updatedAt: { $gte: todayStart, $lte: todayEnd }
        });

        // Completion rate = served / (served + skipped + no_show)  × 100
        const completionDenominator = todayServed + todaySkipped + todayNoShows;
        const completionRate = completionDenominator > 0
            ? Math.round((todayServed / completionDenominator) * 100)
            : 0;

        // Avg wait time today (minutes) — difference between bookedAt and calledAt for served tokens
        const servedToday = await QueueToken.find({
            orgId,
            status: "served",
            calledAt: { $ne: null },
            servedAt: { $gte: todayStart, $lte: todayEnd }
        }).select("bookedAt calledAt");

        const avgWaitToday = servedToday.length > 0
            ? Math.round(
                servedToday.reduce((acc, t) => {
                    return acc + (new Date(t.calledAt) - new Date(t.bookedAt)) / 60000;
                }, 0) / servedToday.length
            )
            : 0;

        // Peak wait time = max of those same tokens
        const peakWait = servedToday.length > 0
            ? Math.round(Math.max(...servedToday.map(t =>
                (new Date(t.calledAt) - new Date(t.bookedAt)) / 60000
            )))
            : 0;

        // Weekly distribution of bookings (for the past 7 days, including today)
        const weeklyRaw = await QueueToken.aggregate([
            {
                $match: {
                    orgId: new (await import("mongoose")).default.Types.ObjectId(orgId),
                    bookedAt: { $gte: wStart }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$bookedAt" }, // 1=Sun … 7=Sat
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert aggregation result to an array of 7 counts indexed by day of week (Monday-first)
        const weeklyBars = [0, 0, 0, 0, 0, 0, 0]; // Mon–Sun
        weeklyRaw.forEach(({ _id, count }) => {
            // Convert to 0-indexed Monday-first
            const idx = _id === 1 ? 6 : _id - 2; // Sun→6, Mon→0 … Sat→5
            weeklyBars[idx] = count;
        });

        const hourlyRaw = await QueueToken.aggregate([
            {
                $match: {
                    orgId: new (await import("mongoose")).default.Types.ObjectId(orgId),
                    bookedAt: { $gte: todayStart, $lte: todayEnd }
                }
            },
            {
                $group: {
                    _id: { $hour: "$bookedAt" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert to a map for easy lookup
        const HOURS_RANGE = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
        const HOUR_LABELS = ["8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM"];
        const hourMap = {};

        // Initialize all hours to 0
        hourlyRaw.forEach(({ _id, count }) => {
            hourMap[_id] = count;
        });

        // Create an array of counts for the defined hours range, defaulting to 0 if no data for that hour
        const hourlyTraffic = HOURS_RANGE.map(hr => hourMap[hr] || 0);

        // Service-wise breakdown of served tokens today
        const services = await Service.find({ orgId }).select("name color stats");
        const serviceBreakdown = services.map(s => ({
            name: s.name,
            color: s.color,
            value: s.stats?.served || 0
        }));

        //  % change strings for StatCard sub labels
        const pctChange = (today, yesterday) => {
            // Handle edge cases for display
            if (yesterday === 0) {
                return today > 0 ? "+100% vs yesterday" : "No data yesterday";
            }

            // Calculate percentage change
            const diff = Math.round(((today - yesterday) / yesterday) * 100);
            return (diff >= 0 ? `+${diff}%` : `${diff}%`) + " vs yesterday";
        };

        // Avg daily tokens over the past 7 days 
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const last7Total = await QueueToken.countDocuments({ orgId, bookedAt: { $gte: sevenDaysAgo } });
        const avgDailyTokens = Math.round(last7Total / 7);

        return res.status(200).json({
            success: true,
            kpis: {
                completionRate,       // %
                peakWait,             // minutes
                avgDailyTokens,
                avgWaitToday,         // minutes
            },

            // Sub labels for StatCards
            statCardSubs: {
                totalTokens: pctChange(todayTokens, yesterdayTokens),
                served: pctChange(todayServed, yesterdayServed),
                waiting: "Across all counters",
                activeCounters: "Live right now",
                avgWait: avgWaitToday > 0 ? `~${avgWaitToday} min avg` : "No data yet",
            },

            // Progress bar percentages for StatCards (0–100)
            statCardPct: {
                totalTokens: todayTokens > 0 ? Math.min(100, Math.round((todayTokens / Math.max(todayTokens, yesterdayTokens, 1)) * 100)) : 0,
                served: todayTokens > 0 ? Math.round((todayServed / todayTokens) * 100) : 0,
                waiting: completionDenominator > 0 ? Math.round(((todaySkipped + todayNoShows) / completionDenominator) * 100) : 0,
                avgWait: peakWait > 0 ? Math.min(100, Math.round((avgWaitToday / peakWait) * 100)) : 0,
            },

            // Data for charts
            weekly: {
                bars: weeklyBars,
                days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            },
            hourly: {
                traffic: hourlyTraffic,
                hours: HOUR_LABELS
            },
            serviceBreakdown,
        });

    } catch (error) {
        console.error("Error fetching analytics data:", error);
        return res.status(500).json({ success: false, message: "Server error fetching analytics data" });
    }
});

export default router;