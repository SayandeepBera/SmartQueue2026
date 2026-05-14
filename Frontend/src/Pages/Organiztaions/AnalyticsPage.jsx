import React, { useEffect, useState, useContext } from 'react';
import { ImSpinner9 } from 'react-icons/im';
import WeeklyBar from '../../Components/Orgs/WeeklyBar';
import HourlyChart from '../../Components/Orgs/HourlyChart';
import ServicesContext from '../../Context/Services/ServicesContext';

// Predefined colors for service breakdown bars
const COLORS = ["#FF6B6B", "#00C9A7", "#4DA8DA", "#FFC75F", "#845EC2", "#F96167", "#00B4D8", "#E9C46A"];

// Simple skeleton loader component
const Skeleton = ({ className = "" }) => (
    <div className={`rounded-xl bg-white/4 animate-pulse ${className}`} />
);

const AnalyticsPage = ({ orgId, services }) => {
    const { getAnalytics } = useContext(ServicesContext);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch analytics data on mount or when orgId changes
    useEffect(() => {
        if (!orgId) return;
        setLoading(true);

        getAnalytics(orgId).then(result => {
            if (result.success) {
                setData(result);
                setError(null);
            } else {
                setError(result.error || "Failed to load analytics");
            }
            setLoading(false);
        });
    }, [orgId, getAnalytics]);

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col gap-6 anim-fadeUp">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-56" />
                    <Skeleton className="h-56" />
                </div>
                <Skeleton className="h-48" />
            </div>
        );
    }

    // Error state with retry button
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <span className="text-4xl">⚠️</span>
                <p className="text-white/40 text-sm">{error}</p>
                <button
                    onClick={() => { setLoading(true); getAnalytics(orgId).then(r => { if (r.success) { setData(r); setError(null); } setLoading(false); }); }}
                    className="mt-2 px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer"
                    style={{ background: "rgba(0,201,167,0.15)", color: "#00C9A7", border: "1px solid rgba(0,201,167,0.3)" }}
                >
                    Retry
                </button>
            </div>
        );
    }

    // Destructure data for easy access
    const { kpis, weekly, hourly, serviceBreakdown } = data;
    const maxBreakdown = Math.max(...serviceBreakdown.map(s => s.value), 1);

    // KPI cards
    const kpiCards = [
        ["📊", "Token Completion", kpis.completionRate, "%", "#00C9A7"],
        ["⏱️", "Peak Wait Time", kpis.peakWait, " min", "#FFC75F"],
        ["🔄", "Avg Daily Tokens", kpis.avgDailyTokens, "", "#4DA8DA"],
        ["⏰", "Avg Wait Today", kpis.avgWaitToday, " min", "#845EC2"],
    ];

    return (
        <div className="flex flex-col gap-6 anim-fadeUp mb-20">

            {/* KPI row */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map(([ic, lb, v, su, co], i) => (
                    <div
                        key={i}
                        className="rounded-2xl px-5 py-5 bg-white/4 border border-white/8 backdrop-blur-xl"
                        style={{ animationDelay: `${i * 0.08}s`, fontFamily: "'serif', 'fangsong'" }}
                    >
                        <div className="text-[24px] mb-2">{ic}</div>
                        <div className="text-[32px] font-extrabold leading-none" style={{ color: co }}>{v}{su}</div>
                        <div className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>{lb}</div>
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WeeklyBar
                    bars={weekly.bars}
                    days={weekly.days}
                    maxB={Math.max(...weekly.bars, 1)}
                />
                <HourlyChart
                    hours={hourly.hours}
                    traffic={hourly.traffic}
                    maxT={Math.max(...hourly.traffic, 1)}
                />
            </div>

            {/* Service-wise breakdown */}
            <div className="rounded-[20px] p-6 bg-white/4 border border-white/8 backdrop-blur-xl">
                <h3 className="font-bold text-lg mb-6" style={{ fontFamily: "'serif', 'fangsong'", color: "#E8EDF5" }}>
                    Service-wise Breakdown
                    <span className="ml-2 text-xs font-normal" style={{ color: "rgba(255,255,255,0.3)" }}>— tokens served today</span>
                </h3>

                {serviceBreakdown.length === 0 ? (
                    <p className="text-xs text-center py-6" style={{ color: "rgba(255,255,255,0.25)" }}>No data yet today</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {serviceBreakdown.map(({ name, value, color }, i) => {
                            const col = color || COLORS[i % COLORS.length];
                            return (
                                <div key={i} className="flex items-center gap-4 anim-slideInL" style={{ animationDelay: `${i * 0.07}s` }}>
                                    <div className="text-xs sm:text-sm text-right shrink-0 truncate w-24 sm:w-36"
                                        style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'serif', 'fangsong'" }}>
                                        {name}
                                    </div>
                                    <div className="flex-1 h-2 rounded-sm overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                                        <div
                                            className="bar-grow h-full rounded-sm"
                                            style={{ "--w": `${(value / maxBreakdown) * 100}%`, background: col }}
                                        />
                                    </div>
                                    <div className="text-sm font-bold text-right shrink-0 w-10"
                                        style={{ fontFamily: "'serif', 'fangsong'", color: col }}>
                                        {value}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;