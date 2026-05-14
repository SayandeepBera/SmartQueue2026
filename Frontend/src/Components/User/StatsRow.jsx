import React, { useEffect, useState, useContext, useCallback } from 'react';
import RevealSection from '../../Hooks/RevealSection';
import AnimatedNumber from '../../Hooks/AnimatedNumber';
import PublicContext from '../../Context/Public/PublicContext';

const StatsRow = () => {
    const { getPublicStats } = useContext(PublicContext);
    const [statsData, setStatsData] = useState({
        totalOrgs: 0,
        totalServices: 0,
        tokensToday: 0,
        servedToday: 0,
    });
    const [loading, setLoading] = useState(true);

    // Fetch stats with useCallback to prevent unnecessary re-renders
    const fetchStats = useCallback(async () => {
        const result = await getPublicStats();
        if (result.success) setStatsData(result.stats);
        setLoading(false);
    }, [getPublicStats]);

    // Initial fetch + auto-refresh every 30 seconds
    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000);

        const onTokenBooked = () => {
            setTimeout(fetchStats, 800);
        };
        window.addEventListener("sq:tokenBooked", onTokenBooked);

        return () => {
            clearInterval(interval);
            window.removeEventListener("sq:tokenBooked", onTokenBooked);
        };
    }, [fetchStats]);

    const stats = [
        { label: "Organizations", value: statsData.totalOrgs, icon: "🏢", color: "#00C9A7", d: "0s" },
        { label: "Active Services", value: statsData.totalServices, icon: "🎛️", color: "#4DA8DA", d: "0.1s" },
        { label: "Tokens Today", value: statsData.tokensToday, icon: "🎟️", color: "#845EC2", d: "0.2s" },
        { label: "Served Today", value: statsData.servedToday, icon: "✅", color: "#FFC75F", d: "0.3s" },
    ];

    // Calculate max value for proportional bars, ensuring no division by zero
    const maxVal = Math.max(...stats.map(s => s.value), 1);

    return (
        <RevealSection delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((s, i) => {
                    const percentage = Math.min((s.value / maxVal) * 100, 100);

                    return (
                        <div
                            key={i}
                            className="group relative bg-white/[0.03] backdrop-blur-xl rounded-[24px] p-6 border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] overflow-hidden"
                            style={{ animationDelay: s.d }}
                        >
                            {/* Decorative Background Glow */}
                            <div
                                className="absolute -right-8 -bottom-8 w-32 h-32 blur-[50px] rounded-full transition-opacity duration-500 opacity-20 group-hover:opacity-40"
                                style={{ background: s.color }}
                            />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/5"
                                        style={{ background: `${s.color}15` }}
                                    >
                                        {s.icon}
                                    </div>

                                    {/* Mini Trend Indicator (Visual Only) */}
                                    <div className="flex gap-1 items-end h-6">
                                        {[0.4, 0.7, 0.5, 0.9].map((h, idx) => (
                                            <div
                                                key={idx}
                                                className="w-1 rounded-full transition-all duration-1000"
                                                style={{
                                                    height: `${h * 100}%`,
                                                    background: s.color,
                                                    opacity: 0.3 + (idx * 0.2)
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <div className="text-xs font-bold uppercase tracking-[2px] text-white/30 mb-1">
                                        {s.label}
                                    </div>

                                    <div
                                        className="text-4xl font-black tracking-tight flex items-baseline gap-1"
                                        style={{ color: s.color, fontFamily: "serif, fangsong" }}
                                    >
                                        {loading ? (
                                            <div className="h-10 w-24 bg-white/5 animate-pulse rounded-lg" />
                                        ) : (
                                            <>
                                                <AnimatedNumber value={s.value} />
                                                <span className="text-lg opacity-50">+</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Modern Progress bar with Glow */}
                                <div className="mt-6 relative">
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-[1.5s] cubic-bezier(0.22, 1, 0.36, 1)"
                                            style={{
                                                width: `${loading ? 0 : percentage}%`,
                                                background: `linear-gradient(90deg, ${s.color}88, ${s.color})`,
                                                boxShadow: `0 0 15px ${s.color}55`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Injected CSS for the custom animations */}
            <style jsx>{`
                @keyframes shine {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
                .group:hover::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
                    animation: shine 1.5s infinite;
                }
            `}</style>
        </RevealSection>
    );
};

export default StatsRow;