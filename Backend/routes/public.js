import express from 'express';
import Service from '../models/Service.js';
import QueueToken from '../models/QueueToken.js';
import Organization from '../models/Organization.js';

const router = express.Router();

const ORG_ICONS = {
    Hospital: "🏥",
    Bank: "🏦",
    Government: "🏛️",
    Clinic: "🩺",
    Diagnostic: "🔬",
    Other: "🏢",
};

// Route 1: Get all public active services (for user dashboard, services page)
router.get("/all", async (req, res) => {
    try {
        const {
            page = 1,
            limit = 8,
            category,
            area,
            search,
            sort = "default",
            onlyAvail = "false",
            maxWait = 999,
            orgId,
        } = req.query;

        // Get all approved org IDs
        const approvedOrgQuery = { status: "approved" };
        if (category && category !== "All") approvedOrgQuery.orgType = category;
        if (area && area !== "All Areas") approvedOrgQuery.area = area;
        if (search && search.trim()) {
            approvedOrgQuery.$or = [
                { orgName: { $regex: search.trim(), $options: "i" } },
                { area: { $regex: search.trim(), $options: "i" } },
                { city: { $regex: search.trim(), $options: "i" } },
            ];
        }

        const approvedOrgs = await Organization.find(approvedOrgQuery)
            .select("_id orgName shortName orgType address area city lat lng verified logo icon")
            .lean();

        const approvedOrgIds = approvedOrgs.map(o => o._id);
        const orgMap = {};
        approvedOrgs.forEach(o => {
            orgMap[o._id.toString()] = {
                ...o,
                icon: ORG_ICONS[o.orgType] || "🏢",
            };
        });

        // Build service query
        const svcQuery = {
            orgId: { $in: approvedOrgIds },
            isActive: true,
            status: "active",
        };

        if (orgId) svcQuery.orgId = orgId;

        if (search && search.trim()) {
            svcQuery.$or = [
                { name: { $regex: search.trim(), $options: "i" } },
                { counter: { $regex: search.trim(), $options: "i" } },
            ];
        }

        // Filter by max wait
        if (parseInt(maxWait) < 999) {
            svcQuery.avgWait = { $lte: parseInt(maxWait) };
        }

        let services = await Service.find(svcQuery).lean();

        // Enrich with live queue counts
        const enriched = await Promise.all(services.map(async (svc) => {
            const liveCount = await QueueToken.countDocuments({
                serviceId: svc._id,
                status: { $in: ["waiting", "next"] }
            });

            const org = orgMap[svc.orgId.toString()];
            return {
                ...svc,
                active: liveCount,
                wait: svc.avgWait,
                org: org || null,
            };
        }));

        // Apply onlyAvail filter (active <= 15 means not too busy)
        let filtered = enriched;
        if (onlyAvail === "true") {
            filtered = filtered.filter(s => s.active <= 15);
        }

        // Sorting
        if (sort === "wait_asc") filtered.sort((a, b) => a.wait - b.wait);
        else if (sort === "wait_desc") filtered.sort((a, b) => b.wait - a.wait);
        else if (sort === "queue_asc") filtered.sort((a, b) => a.active - b.active);

        // Pagination
        const total = filtered.length;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginated = filtered.slice(skip, skip + parseInt(limit));

        return res.json({
            success: true,
            services: paginated,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
        });
    } catch (error) {
        console.error("Error fetching public services:", error);
        return res.status(500).json({ success: false, error: "An error occurred while fetching public services" });
    }
});

// Route 2: Get featured/recent services for home page (limit 8, randomized from active)
router.get("/featured", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;

        const approvedOrgs = await Organization.find({ status: "approved" })
            .select("_id orgName shortName orgType address area city verified")
            .lean();

        const approvedOrgIds = approvedOrgs.map(o => o._id);
        const orgMap = {};
        approvedOrgs.forEach(o => {
            orgMap[o._id.toString()] = {
                ...o,
                icon: ORG_ICONS[o.orgType] || "🏢",
            };
        });
        
        // Get recently created active services
        const services = await Service.find({
            orgId: { $in: approvedOrgIds },
            isActive: true,
            status: "active",
        })
            .sort({ createdAt: -1 })
            .limit(limit * 3) // over-fetch to randomize
            .lean();

        // Enrich with live queue counts
        const enriched = await Promise.all(services.map(async (svc) => {
            const liveCount = await QueueToken.countDocuments({
                serviceId: svc._id,
                status: { $in: ["waiting", "next"] }
            });
            return {
                ...svc,
                active: liveCount,
                wait: svc.avgWait,
                org: orgMap[svc.orgId.toString()] || null,
            };
        }));

        // Shuffle and take limit
        const shuffled = enriched.sort(() => Math.random() - 0.5).slice(0, limit);

        return res.json({ success: true, services: shuffled, total: shuffled.length });
    } catch (error) {
        console.error("Error fetching featured services:", error);
        return res.status(500).json({ success: false, error: "An error occurred while fetching featured services" });
    }
});

// Route 3: Get public stats (total orgs, services, tokens today, served today)
router.get("/stats", async (req, res) => {
    try {
        const [totalOrgs, totalServices, tokensToday, servedToday] = await Promise.all([
            Organization.countDocuments({ status: "approved" }),
            Service.countDocuments({ isActive: true, status: "active" }),
            QueueToken.countDocuments({
                bookedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            QueueToken.countDocuments({
                status: "served",
                servedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
        ]);

        return res.json({
            success: true,
            stats: { totalOrgs, totalServices, tokensToday, servedToday }
        });
    } catch (error) {
        console.error("Error fetching public stats:", error);
        return res.status(500).json({ success: false, error: "An error occurred while fetching public stats" });
    }
});

// Route 4: Get all available filter options (categories and areas from approved orgs)
router.get("/filters", async (req, res) => {
    try {
        const orgs = await Organization.find({ status: "approved" })
            .select("orgType area")
            .lean();

        const categories = [...new Set(orgs.map(o => o.orgType).filter(Boolean))];
        const areas = [...new Set(orgs.map(o => o.area).filter(Boolean))];

        return res.json({ success: true, categories, areas });
    } catch (error) {
        console.error("Error fetching filter options:", error);
        return res.status(500).json({ success: false, error: "An error occurred while fetching filter options" });
    }
});

export default router;