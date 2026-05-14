import React from 'react'
import { ImSpinner9 } from 'react-icons/im';

// Icon color map for the live activity feed
const ACTIVITY_TYPE_COLORS = {
    org_registered: "#34d399",
    org_approved: "#22d3ee",
    org_rejected: "#f43f5e",
    org_suspended: "#f97316",
    org_deleted: "#f43f5e",
    org_reactivated: "#34d399",
    user_registered: "#60a5fa",
    user_suspended: "#f97316",
    user_restored: "#34d399",
    user_deleted: "#f43f5e",
    plan_changed: "#a78bfa",
};

const RecentActivity = ({ activityLoading, activityLog, loadActivityLog }) => {
    return (
        <div className="glass rounded-2xl p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
                <h3
                    className="font-bold text-lg text-white"
                    style={{ fontFamily: "'serif','fangsong'" }}
                >
                    Live Activity
                </h3>
                <div className="flex items-center gap-2">
                    {activityLoading ? (
                        <ImSpinner9
                            className="animate-spin text-emerald-400"
                            style={{ width: 13, height: 13 }}
                        />
                    ) : (
                        <>
                            <div
                                className="w-2 h-2 rounded-full bg-emerald-400"
                                style={{ animation: "pulse 2s ease infinite" }}
                            />
                            <span className="text-[13px] text-emerald-400 font-semibold">Live</span>
                        </>
                    )}
                </div>
            </div>

            {/* Feed items */}
            <div className="flex flex-col gap-2.5">
                {activityLoading ? (
                    // Skeleton rows
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-2.5 items-start animate-pulse">
                            <div className="w-7 h-7 shrink-0 rounded-lg bg-white/5" />
                            <div className="flex-1 flex flex-col gap-1.5 pt-0.5">
                                <div className="h-3 bg-white/5 rounded-lg w-full" />
                                <div className="h-2.5 bg-white/4 rounded-lg w-20" />
                            </div>
                        </div>
                    ))
                ) : activityLog.length === 0 ? (
                    <div className="text-center py-6 text-white/20 text-sm">
                        No recent activity
                    </div>
                ) : (
                    activityLog.map((a, i) => {
                        const color = ACTIVITY_TYPE_COLORS[a.type] || "#94a3b8";
                        return (
                            <div
                                key={a._id}
                                className="flex gap-2.5 items-start"
                                style={{
                                    animation: `slideInR .35s ${i * 0.06}s both`,
                                    fontFamily: "'serif','fangsong'",
                                }}
                            >
                                <div
                                    className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-[15px]"
                                    style={{
                                        background: `${color}10`,
                                        border: `1px solid ${color}20`,
                                    }}
                                >
                                    {a.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[13px] text-white/75 leading-snug">
                                        {a.msg}
                                    </div>
                                    <div className="text-[11px] text-white/30 mt-0.5 font-mono">
                                        {a.time}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* View all link */}
            {!activityLoading && activityLog.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/5 text-center">
                    <span className="text-[11px] text-white/25 font-medium">
                        Showing last {activityLog.length} events ·{" "}
                        <button
                            onClick={loadActivityLog}
                            className="text-[#00C9A7] hover:opacity-70 transition-opacity bg-transparent border-0 cursor-pointer p-0"
                            style={{ fontFamily: "inherit", fontSize: "inherit" }}
                        >
                            Refresh
                        </button>
                    </span>
                </div>
            )}
        </div>
    )
}

export default RecentActivity
