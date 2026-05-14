import React, { useContext, useEffect, useState, useCallback } from 'react';
import OrgContext from '../../Context/Organization/OrgContext';
import AnimatedNumber from '../../Hooks/AnimatedNumber';
import PendingVerification from '../../Components/Admin/PendingVerification';
import RecentOrgs from '../../Components/Admin/RecentOrgs';
import RevenuePlan from '../../Components/Admin/RevenuePlan';
import { ImSpinner9 } from 'react-icons/im';
import PlansContext from '../../Context/Plans/PlansContext';
import ActivityContext from '../../Context/AdminActivitys/ActivityContext';
import RecentActivity from '../../Components/Admin/RecentActivity';

const OverviewPage = ({ orgs }) => {
    const { getAllUsers } = useContext(OrgContext);
    const { getRevenueChart } = useContext(PlansContext);
    const { fetchAdminActivity } = useContext(ActivityContext);

    const [userStats, setUserStats] = useState({
        total: 0, active: 0, suspended: 0, totalTokens: 0,
    });
    const [usersLoading, setUsersLoading] = useState(true);

    const [monthlyRevenue, setMonthlyRevenue] = useState(0);
    const [revenueLoading, setRevenueLoading] = useState(true);

    const [activityLog, setActivityLog] = useState([]);
    const [activityLoading, setActivityLoading] = useState(true);

    // Fetch Revenue specifically for the current month
    useEffect(() => {
        const fetchMonthlyRevenue = async () => {
            setRevenueLoading(true);
            const result = await getRevenueChart();

            if (result.success) {
                const chartData = result.chart || [];
                // The API returns months from 6 months ago to current month (last item in array)
                if (chartData.length > 0) {
                    const currentMonthData = chartData[chartData.length - 1];
                    // Divide by 1000 if your top card displays in "k" (e.g., 5000 -> 5)
                    setMonthlyRevenue(currentMonthData.totalRevenue / 1000);
                }
            }
            setRevenueLoading(false);
        };
        fetchMonthlyRevenue();
    }, [getRevenueChart]);

    // Fetch user stats on mount to populate the top cards
    const fetchUserStats = useCallback(async () => {
        setUsersLoading(true);

        const result = await getAllUsers({ status: 'all', limit: 25 });

        if (result.success) {
            const all = result.users;
            setUserStats({
                total: all.length,
                active: all.filter(u => u.role === 'user').length,
                suspended: all.filter(u => u.role === 'suspended_user').length,
                totalTokens: all.reduce((acc, u) => acc + (u.totalTokens || 0), 0),
            });
        }
        setUsersLoading(false);
    }, [getAllUsers]);

    useEffect(() => {
        fetchUserStats();
    }, [fetchUserStats]);

    // Fetch the live activity log (most recent 6 events) and set up periodic refresh
    const loadActivityLog = useCallback(async () => {
        setActivityLoading(true);
        const result = await fetchAdminActivity({ limit: 6 });

        if (result.success) {
            setActivityLog(result.activity || []);
        }

        setActivityLoading(false);
    }, [fetchAdminActivity]);

    // Initial load + periodic refresh of the live activity feed
    useEffect(() => {
        loadActivityLog();

        const interval = setInterval(loadActivityLog, 60 * 1000); // Refresh every 60 seconds
        return () => clearInterval(interval);

    }, [loadActivityLog]);

    // Build stats for the top cards based on current org + user data
    const buildStats = (orgs, userStats) => [
        {
            label: "Total Organizations",
            value: orgs.length,
            icon: "🏢",
            color: "#fbbf24",
            sub: `${orgs.filter(o => o.status === "approved").length} active`,
        },
        {
            label: "Registered Users",
            value: userStats.total,
            icon: "👥",
            color: "#a78bfa",
            sub: `${userStats.active} active`,
        },
        {
            label: "Tokens Issued",
            value: userStats.totalTokens,
            icon: "🎟️",
            color: "#34d399",
            sub: "All time",
        },
        {
            label: "Pending Verifications",
            value: orgs.filter(o => o.status === "pending").length,
            icon: "🔔",
            color: "#f97316",
            sub: "Needs review",
        },
        {
            label: "Monthly Revenue",
            value: monthlyRevenue,
            icon: "💰",
            color: "#22d3ee",
            sub: "This month",
            prefix: "₹",
            suffix: "k",
        },
        {
            label: "Suspended Accounts",
            value: orgs.filter(o => o.status === "rejected").length + userStats.suspended,
            icon: "🚫",
            color: "#f43f5e",
            sub: "Orgs + users",
        },
    ];

    /* Build stats */
    const stats = buildStats(orgs, userStats);
    const pendingOrgs = orgs.filter(o => o.status === "pending");

    // Get 5 most recent orgs for the Recent Organizations widget
    const recentOrgs = [...orgs]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return (
        <div className="flex flex-col gap-6" style={{ animation: "fadeUp .5s both" }}>

            {/* Top cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {stats.map((s, i) => (
                    <div
                        key={i}
                        className="glass relative overflow-hidden rounded-2xl p-4"
                        style={{
                            animation: `fadeUp .55s ${i * 0.07}s both`,
                            fontFamily: "'serif', 'fangsong'",
                        }}
                    >
                        {/* Background ghost icon */}
                        <div className="absolute -top-3 -right-3 text-[44px] opacity-[0.055] pointer-events-none select-none">
                            {s.icon}
                        </div>

                        <div className="text-xl mb-2">{s.icon}</div>

                        {/* Value — show spinner while user stats are loading */}
                        <div
                            className="text-[25px] font-extrabold leading-none tracking-tight mb-1"
                            style={{ fontFamily: "'serif', 'fangsong'", color: s.color }}
                        >
                            {/* Only the two user-derived cards need the loader */}
                            {usersLoading && (i === 1 || i === 2 || i === 5) || (revenueLoading && i === 4) ? (
                                <ImSpinner9
                                    className="animate-spin inline-block"
                                    style={{ width: 20, height: 20, color: s.color, opacity: 0.5 }}
                                />
                            ) : (
                                <AnimatedNumber value={s.value} prefix={s.prefix} suffix={s.suffix} />
                            )}
                        </div>

                        <div className="text-xs text-white/40 font-medium">{s.label}</div>
                        <div className="text-[11px] mt-1 font-semibold" style={{ color: s.color }}>
                            {s.sub}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main content  */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">

                {/* Left column */}
                <div className="flex flex-col gap-5">
                    {pendingOrgs.length > 0 && (
                        <PendingVerification pendingOrgs={pendingOrgs} />
                    )}
                    <RecentOrgs orgs={recentOrgs} />
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-5">
                    <RevenuePlan orgs={orgs} />

                    {/* Live Activity Feed */}
                    <RecentActivity activityLoading={activityLoading} activityLog={activityLog} loadActivityLog={loadActivityLog} />
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;