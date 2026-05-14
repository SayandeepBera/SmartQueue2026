import React, { useState, useEffect, useContext } from 'react';
import RevealSection from '../../Hooks/RevealSection';
import AuthContext from '../../Context/Authentication/AuthContext';
import OrgContext from '../../Context/Organization/OrgContext';

// Format a date into a human-readable relative string
const formatRelativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (mins < 2) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
};

// Status → color mapping
const STATUS_COLORS = {
    Completed: "#00C9A7",
    Skipped: "#F9A826",
    "No Show": "#FF6B6B",
};

// These are universal product tips — no need for an API endpoint
const TIPS = [
    { tip: "Book from home — walk in only when you're near the front", icon: "📱" },
    { tip: "Check live queue counts before heading out to save time", icon: "👁️" },
    { tip: "Enable notifications to get alerted 2 slots before turn", icon: "🔔" },
    { tip: "Cancel or reschedule your token up to 15 min before slot", icon: "🔁" },
];

// Skeleton loader row
const SkeletonRow = () => (
    <div
        className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl animate-pulse"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
        <div className="w-9.5 h-9.5 rounded-[11px] shrink-0" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="flex-1">
            <div className="h-3.5 w-32 rounded mb-1.5" style={{ background: "rgba(255,255,255,0.07)" }} />
            <div className="h-2.5 w-48 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
        </div>
        <div className="h-5 w-16 rounded-md" style={{ background: "rgba(255,255,255,0.06)" }} />
    </div>
);

const BottomSection = () => {
    const { getRecentActivity } = useContext(OrgContext);
    const { userId } = useContext(AuthContext);

    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        const fetchActivity = async () => {
            setLoading(true);
            const result = await getRecentActivity({ limit: 5 });
            if (cancelled) return;

            if (result.success) {
                setActivity(result.activity || []);
            } else {
                setError(result.error);
            }
            setLoading(false);
        };

        fetchActivity();

        // Re-fetch when a new booking is made
        const handler = () => fetchActivity();
        window.addEventListener("sq:tokenBooked", handler);

        return () => {
            cancelled = true;
            window.removeEventListener("sq:tokenBooked", handler);
        };
    }, [userId]);

    return (
        <RevealSection delay={0.05}>
            <div
                className="grid gap-4 mb-12 pt-6"
                style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}
            >
                {/* Recent Activity */}
                <div className="glass rounded-[20px] p-6.5">
                    <div
                        className="flex justify-between items-center mb-5"
                        style={{ fontFamily: "'serif', 'fangsong'" }}
                    >
                        <h3 className="font-bold text-xl">Recent Activity</h3>
                        <a
                            href="/my-tokens"
                            className="text-sm no-underline transition-colors"
                            style={{ color: "#00C9A7" }}
                        >
                            View all →
                        </a>
                    </div>

                    <div className="flex flex-col gap-3" style={{ fontFamily: "'serif', 'fangsong'" }}>
                        {/* Skeleton while loading */}
                        {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}

                        {/* Error */}
                        {!loading && error && (
                            <p className="text-xs text-white/30 text-center py-4">
                                ⚠️ Could not load activity
                            </p>
                        )}

                        {/* Empty state — not logged in */}
                        {!loading && !error && !userId && (
                            <div className="text-center py-6 text-white/30">
                                <div className="text-3xl mb-2">🔒</div>
                                <p className="text-xs">Log in to see your recent bookings</p>
                            </div>
                        )}

                        {/* Empty state — logged in but no activity yet */}
                        {!loading && !error && userId && activity.length === 0 && (
                            <div className="text-center py-6 text-white/30">
                                <div className="text-3xl mb-2">🎟️</div>
                                <p className="text-xs">No completed bookings yet</p>
                            </div>
                        )}

                        {/* Real activity rows */}
                        {!loading && activity.map((r, i) => {
                            const statusColor = STATUS_COLORS[r.status] || "#A0AEC0";
                            return (
                                <div
                                    key={i}
                                    className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl"
                                    style={{
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.05)"
                                    }}
                                >
                                    <div
                                        className="w-9.5 h-9.5 rounded-[11px] flex items-center justify-center text-base shrink-0"
                                        style={{
                                            background: `${statusColor}15`,
                                            border: `1px solid ${statusColor}30`
                                        }}
                                    >
                                        {r.icon || "🎟️"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[15px] font-semibold">{r.service}</div>
                                        <div className="text-xs text-white/35 mt-px overflow-hidden text-ellipsis whitespace-nowrap">
                                            {r.org} · {r.token} · {formatRelativeTime(r.time)}
                                        </div>
                                    </div>
                                    <div
                                        className="rounded-md px-2.5 py-0.75 text-xs font-semibold shrink-0"
                                        style={{
                                            background: `${statusColor}18`,
                                            border: `1px solid ${statusColor}30`,
                                            color: statusColor
                                        }}
                                    >
                                        {r.status}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-3.5">
                    {/* Quick Tips */}
                    <div className="glass rounded-[20px] p-5.5 flex-1" style={{ fontFamily: "'serif', 'fangsong'" }}>
                        <h3 className="text-xl font-bold mb-3.5">⚡ Quick Tips</h3>
                        <div className="flex flex-col gap-2.75">
                            {TIPS.map((t, i) => (
                                <div key={i} className="flex gap-2.5 items-start">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] shrink-0"
                                        style={{
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.07)"
                                        }}
                                    >
                                        {t.icon}
                                    </div>
                                    <span className="text-sm text-white/45 leading-[1.6]">{t.tip}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile App CTA */}
                    <div
                        className="rounded-[20px] p-5.5 overflow-hidden relative"
                        style={{
                            background: "linear-gradient(135deg,rgba(0,201,167,0.12),rgba(77,168,218,0.1))",
                            border: "1px solid rgba(0,201,167,0.2)"
                        }}
                    >
                        <div
                            className="absolute -top-7 -right-7 w-27.5 h-27.5 rounded-full pointer-events-none"
                            style={{ background: "rgba(0,201,167,0.08)" }}
                        />
                        <p
                            className="text-[11px] font-bold tracking-[2px] uppercase mb-1.5"
                            style={{ color: "#00C9A7" }}
                        >
                            Mobile App
                        </p>
                        <h4
                            className="text-[15px] font-bold mb-1.5"
                            style={{ fontFamily: "'Space Grotesk',sans-serif" }}
                        >
                            Queue from anywhere
                        </h4>
                        <p className="text-xs text-white/40 mb-3.5 leading-[1.6]">
                            Find orgs, book tokens, and track live queue positions on the go.
                        </p>
                        <div className="flex gap-2.5">
                            {["App Store", "Google Play"].map(p => (
                                <button
                                    key={p}
                                    className="btn px-3.5 py-2 rounded-[10px] text-xs font-semibold"
                                    style={{
                                        background: "rgba(255,255,255,0.08)",
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        color: "#E8EDF5"
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </RevealSection>
    );
};

export default BottomSection;