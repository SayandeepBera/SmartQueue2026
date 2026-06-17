import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ImSpinner9 } from 'react-icons/im';
import ActivityContext from '../../Context/AdminActivitys/ActivityContext';

const TYPE_META = {
    all: { color: "#fbbf24", label: "All" },

    // Org-related events
    org_registered: { color: "#34d399", label: "New Org" },
    org_approved: { color: "#22d3ee", label: "Approved Org" },
    org_rejected: { color: "#f43f5e", label: "Rejected Org" },
    org_suspended: { color: "#f97316", label: "Suspended Org" },
    org_deleted: { color: "#f43f5e", label: "Deleted Org" },
    org_reactivated: { color: "#34d399", label: "Reactivated Org" },

    // User-related events
    user_registered: { color: "#60a5fa", label: "New User" },
    user_suspended: { color: "#f97316", label: "Suspended User" },
    user_restored: { color: "#34d399", label: "Restored User" },
    user_deleted: { color: "#f43f5e", label: "Deleted User" },

    // Plan-related events
    plan_changed: { color: "#a78bfa", label: "Plan" },
};

const FILTER_TYPES = Object.keys(TYPE_META);

const ActivityPage = () => {
    const [activityLog, setActivityLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [lastRefresh, setLastRefresh] = useState(null);
    const { fetchAdminActivity } = useContext(ActivityContext);

    const fetchActivity = useCallback(async () => {
        setLoading(true);
        const result = await fetchAdminActivity(60);

        if (result.success) {
            setActivityLog(result.activity);
            setLastRefresh(new Date());
        }

        setLoading(false);
    }, [fetchAdminActivity]);

    useEffect(() => {
        fetchActivity();
        const interval = setInterval(fetchActivity, 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchActivity]);

    const filtered = filter === "all"
        ? activityLog
        : activityLog.filter(a => a.type === filter);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <ImSpinner9 className="animate-spin h-10 w-10 text-[#00C9A7] mb-3" />
                <p className="text-white/30 text-sm tracking-widest uppercase">Loading Activity…</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5" style={{ animation: "fadeUp .5s both", fontFamily: "'serif','fangsong'" }}>

            {/* Filter Bar */}
            <div className="glass rounded-2xl p-4 flex gap-2 flex-wrap items-center">
                <span className="text-xs text-white/30 shrink-0">Filter:</span>
                {FILTER_TYPES.map(t => {
                    const meta = TYPE_META[t];
                    const active = filter === t;
                    return (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            style={{
                                padding: "5px 13px", borderRadius: 20, fontSize: 12,
                                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                transition: "all .15s",
                                border: `1px solid ${active ? meta.color + "55" : "rgba(255,255,255,0.08)"}`,
                                background: active ? meta.color + "15" : "rgba(255,255,255,0.04)",
                                color: active ? meta.color : "rgba(255,255,255,0.45)",
                            }}
                        >
                            {meta.label}
                        </button>
                    );
                })}

                <div className="ml-auto flex items-center gap-3">
                    <span className="text-[13px] text-white/30">{filtered.length} events</span>
                    <button
                        onClick={fetchActivity}
                        className="text-[12px] text-[#00C9A7] font-semibold hover:opacity-70 transition-opacity"
                        title="Refresh"
                    >
                        ↻ Refresh
                    </button>
                    {lastRefresh && (
                        <span className="text-[11px] text-white/20 font-mono">
                            {lastRefresh.toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Activity List */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
                    <h3 className="font-bold text-lg text-white">Platform Activity Log</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ animation: "pulse 2s ease infinite" }} />
                        <span className="text-[13px] text-emerald-400 font-semibold">Live</span>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-white/20">
                        <div className="text-4xl mb-3">📭</div>
                        <p className="text-sm font-medium">No events found</p>
                        <p className="text-xs mt-1">Activity will appear here as platform events occur</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/3">
                        {filtered.map((a, i) => {
                            const meta = TYPE_META[a.type] || TYPE_META.system_event;
                            return (
                                <div
                                    key={a._id}
                                    className="tbl-row flex items-start gap-3.5 px-5 py-4"
                                    style={{ animation: `slideInL .3s ${i * 0.04}s both` }}
                                >
                                    <div
                                        className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-[17px]"
                                        style={{ background: `${meta.color}10`, border: `1px solid ${meta.color}25` }}
                                    >
                                        {a.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[15px] text-white/80 leading-snug">{a.msg}</div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[11px] text-white/30 font-mono">{a.time}</span>
                                            <span
                                                className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded"
                                                style={{ background: `${meta.color}15`, color: meta.color }}
                                            >
                                                {meta.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ActivityPage
