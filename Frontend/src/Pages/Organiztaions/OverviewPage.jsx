import React, { useContext, useEffect, useState } from 'react'
import ServicesRoom from '../../Components/Orgs/ServicesRoom';
import OPDQueue from '../../Components/Orgs/OPDQueue';
import StatCard from '../../Components/Orgs/StatCard';
import ServicesContext from '../../Context/Services/ServicesContext';
import AuthContext from '../../Context/Authentication/AuthContext';

const OverviewPage = ({ services, queue, activity }) => {
    const { getAnalytics } = useContext(ServicesContext);
    const { orgId } = useContext(AuthContext);

    // ── Analytics sub-labels and progress-bar percentages ────────────────
    const [subs, setSubs] = useState({
        totalTokens: "Loading…",
        served: "Loading…",
        waiting: "Across all counters",
        activeCounters: "Live right now",
        avgWait: "Loading…",
    });

    const [pcts, setPcts] = useState({
        totalTokens: 70, served: 70, waiting: 30, activeCounters: 70, avgWait: 50,
    });

    // Fetch analytics data on mount (for StatCard sub labels and progress bars)
    useEffect(() => {
        if (!orgId) return;

        getAnalytics(orgId).then(result => {
            if (result.success) {
                setSubs(result.statCardSubs);
                setPcts(result.statCardPct);
            }
        });
    }, [orgId, getAnalytics]);

    // ── Derive KPI values for StatCards from services data ─────────────────
    const totalTokens = services.reduce((a, s) => a + (s.stats?.total || 0), 0);
    const totalServed = services.reduce((a, s) => a + (s.stats?.served || 0), 0);
    const totalWaiting = services.reduce((a, s) => {
        const { total = 0, served = 0, skipped = 0, noShows = 0 } = s.stats || {};
        return a + Math.max(0, total - served - skipped - noShows);
    }, 0);
    const activeCount = services.filter(s => s.isActive).length;
    const avgWait = services.length > 0 ? Math.round(services.reduce((a, s) => a + (s.avgWait || 0), 0) / services.length) : 0;

    return (
        <div className="flex flex-col gap-6 anim-fadeUp">
            {/* Stat cards */}
            <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))" }}>
                <StatCard icon="🎟️" label="Total Tokens Today" value={totalTokens} color="#00C9A7" delay={0} sub={subs.totalTokens} pct={pcts.totalTokens} />
                <StatCard icon="✅" label="Served Today" value={totalServed} color="#4DA8DA" delay={0.06} sub={subs.served} pct={pcts.served} />
                <StatCard icon="⏳" label="Currently Waiting" value={totalWaiting} color="#FFC75F" delay={0.12} sub={subs.waiting} pct={pcts.waiting} />
                <StatCard icon="🎛️" label="Active Counters" value={activeCount} suffix={`/${services.length}`} color="#845EC2" delay={0.18} sub={subs.activeCounters} pct={pcts.activeCounters ?? 70} />
                <StatCard icon="⏱️" label="Avg Wait Time" value={avgWait} suffix=" min" color="#FF6B6B" delay={0.24} sub={subs.avgWait} pct={pcts.avgWait} />
            </div>

            <div className="grid gap-4 mb-20" style={{ gridTemplateColumns: "1fr 340px" }}>
                {/* Service rooms table */}
                <ServicesRoom services={services} />

                {/* Right panel */}
                <div className="flex flex-col gap-3.5">
                    {/* OPD Queue */}
                    <OPDQueue queue={queue} />

                    {/* Recent Activity */}
                    <div className="rounded-[20px] p-4.5 bg-white/4 border border-white/8 backdrop-blur-xl">
                        <h3 className="font-bold text-[17px] mb-3.5" style={{ fontFamily: "'serif', 'fangsong'", color: "#E8EDF5" }}>Recent Activity</h3>
                        <div className="flex flex-col gap-2.5">
                            {activity.length > 0 ? (
                                activity.slice(0, 4).map((a, i) => (
                                    <div key={a._id || i} className="flex gap-2.5 items-start anim-slideInR" style={{ animationDelay: `${i * 0.06}s` }}>
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] shrink-0" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>{a.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[12px] font-medium truncate" style={{ color: "#E8EDF5" }}>{a.msg}</div>
                                            <div className="text-[10px] mt-px" style={{ color: "rgba(255,255,255,0.35)" }}>{a.time}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-4">
                                    <div className="relative mb-4">
                                        {/* Background Glow */}
                                        <div className="absolute inset-0 bg-[#845EC2]/10 blur-xl rounded-full animate-pulse" />

                                        {/* Central Icon Container */}
                                        <div className="relative w-12 h-12 rounded-2xl bg-white/3 border border-white/10 flex items-center justify-center backdrop-blur-md">
                                            <div className="flex flex-col gap-1 opacity-20">
                                                <div className="w-5 h-1 bg-white rounded-full" />
                                                <div className="w-3 h-1 bg-white rounded-full" />
                                            </div>
                                            {/* Little "Listening" Dot */}
                                            <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[#845EC2] animate-pulse" />
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-[11px] font-bold tracking-widest text-white/40 uppercase mb-1" style={{ fontFamily: "'serif', 'fangsong'" }}>
                                            System Quiet
                                        </p>
                                        <p className="text-[10px] text-white/25 italic">
                                            Logs will appear as soon as<br />tokens are processed.
                                        </p>
                                    </div>

                                    {/* Decorative Timeline line */}
                                    <div className="mt-5 w-px h-10 bg-linear-to-b from-white/10 to-transparent opacity-20" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OverviewPage
