import React from 'react';
import PlanBadge from './PlanBadge';
import Badge from './Badge';
import { ImSpinner9 } from 'react-icons/im';

const OrgsTable = ({ filtered, setDetail, verifyOrg, updateStatus, deleteOrg, reactivateOrg, isLoading, loadingId, onRejectClick, onSuspendClick }) => {
    const gridLayout = "md:grid-cols-[1fr_100px_80px_80px_90px_150px_200px]";

    return (
        <div className="glass rounded-2xl overflow-hidden">

            {/* ── Desktop Header ───────────────────────────────────────── */}
            <div
                className={`hidden md:grid px-5 py-2.5 text-[11px] text-white/30 uppercase tracking-widest font-semibold border-b border-white/6 ${gridLayout}`}
                style={{ fontFamily: "'serif', 'fangsong'" }}
            >
                <span>Organization</span>
                <span>Type</span>
                <span>City</span>
                <span>Plan</span>
                <span>Est. Year</span>
                <span>Status</span>
                <span>Actions</span>
            </div>

            {/* ──── Rows ─────────────────────────────────────────────── */}
            <div className="max-h-130 overflow-y-auto">
                {filtered.map((o, i) => {
                    const isBusy = isLoading && loadingId === o._id;

                    return (
                        <div
                            key={o._id}
                            className={`tbl-row flex flex-col md:grid px-5 py-4 md:py-3.5 border-b border-white/3 items-start md:items-center last:border-0 gap-3 md:gap-0 ${gridLayout}`}
                            style={{ animation: `fadeIn .3s ${i * 0.03}s both`, fontFamily: "'serif', 'fangsong'" }}
                        >
                            {/* 1. Org info */}
                            <div className="flex items-center gap-2.5 min-w-0 w-full">
                                <div className="w-8 h-8 shrink-0 rounded-lg bg-white/4 border border-white/7 overflow-hidden flex items-center justify-center text-[15px]">
                                    {o.logo?.url
                                        ? <img src={o.logo.url} alt="" className="w-full h-full object-cover" />
                                        : "🏢"
                                    }
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[14px] text-wrap font-semibold text-white truncate flex items-center gap-1">
                                        {o.orgName}
                                        {o.status === "approved" && <span className="text-[10px] text-[#60a5fa]">✓</span>}
                                    </div>
                                    <div className="text-[11px] text-white/35 truncate">
                                        {o.adminName}{o.designation ? ` · ${o.designation}` : ''}
                                    </div>
                                </div>
                            </div>

                            {/* 2. Type */}
                            <div className="flex md:block justify-between w-full">
                                <span className="md:hidden text-[10px] uppercase text-white/20 font-bold">Type</span>
                                <span className="text-[13px] text-white/60">{o.orgType}</span>
                            </div>

                            {/* 3. City */}
                            <div className="flex md:block justify-between w-full">
                                <span className="md:hidden text-[10px] uppercase text-white/20 font-bold">City</span>
                                <span className="text-[13px] text-white/60">{o.city}</span>
                            </div>

                            {/* 4. Plan */}
                            <div className="flex md:block justify-between w-full">
                                <span className="md:hidden text-[10px] uppercase text-white/20 font-bold">Plan</span>
                                <PlanBadge plan={o.plan} />
                            </div>

                            {/* 5. Est. Year */}
                            <div className="flex md:block justify-between w-full">
                                <span className="md:hidden text-[10px] uppercase text-white/20 font-bold">Est. Year</span>
                                <span className="text-[13px] font-mono text-white/60">{o.estYear || '—'}</span>
                            </div>

                            {/* 6. Status */}
                            <div className="flex md:block justify-between w-full">
                                <span className="md:hidden text-[10px] uppercase text-white/20 font-bold">Status</span>
                                <Badge status={o.status} />
                            </div>

                            {/* 7. Actions — logic depends on status */}
                            <div className="flex flex-wrap gap-1.5 w-full md:w-auto pt-2 md:pt-0 border-t border-white/5 md:border-0">

                                {/* View — always present */}
                                <button
                                    onClick={() => setDetail(o)}
                                    className="btn flex-1 md:flex-none px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-400 text-center"
                                    style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)" }}
                                >
                                    View
                                </button>

                                {/* ── PENDING: Verify + Reject ─────────────────────────── */}
                                {o.status === "pending" && (<>
                                    <button
                                        onClick={() => verifyOrg(o._id)}
                                        disabled={isBusy}
                                        className="btn flex-1 md:flex-none px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-400 text-center flex items-center justify-center gap-1 disabled:opacity-60"
                                        style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)" }}
                                    >
                                        {isBusy ? <ImSpinner9 className="animate-spin" /> : "Verify"}
                                    </button>
                                    <button
                                        onClick={() => onRejectClick(o)}
                                        disabled={isBusy}
                                        className="btn flex-1 md:flex-none px-2.5 py-1 rounded-lg text-xs font-semibold text-red-400 text-center flex items-center justify-center gap-1 disabled:opacity-60"
                                        style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)" }}
                                    >
                                        {isBusy ? <ImSpinner9 className="animate-spin" /> : "Reject"}
                                    </button>
                                </>)}

                                {/* ── APPROVED: Suspend ───────────────────────────────── */}
                                {o.status === "approved" && (
                                    <button
                                        onClick={() => onSuspendClick(o)}
                                        disabled={isBusy}
                                        className="btn flex-1 md:flex-none px-2.5 py-1 rounded-lg text-xs font-semibold text-red-400 text-center flex items-center justify-center gap-1 disabled:opacity-60"
                                        style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)" }}
                                    >
                                        {isBusy ? <ImSpinner9 className="animate-spin" /> : "Suspend"}
                                    </button>
                                )}

                                {/* ── REJECTED / SUSPENDED: Restore ──────────────────── */}
                                {(o.status === "rejected" || o.status === "suspended") && (
                                    <button
                                        onClick={() => reactivateOrg(o._id)}
                                        disabled={isBusy}
                                        className="btn flex-1 md:flex-none px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-400 text-center flex items-center justify-center gap-1 disabled:opacity-60"
                                        style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)" }}
                                    >
                                        {isBusy ? <ImSpinner9 className="animate-spin" /> : "Restore"}
                                    </button>
                                )}

                                {/* ── SCHEDULED FOR DELETION: Restore ────────────────── */}
                                {o.status === "scheduled_for_deletion" && (
                                    <button
                                        onClick={() => reactivateOrg(o._id)}
                                        disabled={isBusy}
                                        className="btn flex-1 md:flex-none px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-400 text-center flex items-center justify-center gap-1 disabled:opacity-60"
                                        style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)" }}
                                    >
                                        {isBusy ? <ImSpinner9 className="animate-spin" /> : "Restore"}
                                    </button>
                                )}

                                {/* ── Delete — always present ─────────────────────────── */}
                                {(o.status !== "scheduled_for_deletion" && o.status !== "pending") && (<button
                                    onClick={() => deleteOrg(o._id)}
                                    disabled={isBusy}
                                    className="btn flex-1 md:flex-none px-2.5 py-1 rounded-lg text-xs font-semibold text-red-400 text-center flex items-center justify-center gap-1 disabled:opacity-60"
                                    style={{ background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.2)" }}
                                >
                                    {isBusy ? <ImSpinner9 className="animate-spin" /> : "🗑"}
                                </button>
                                )}

                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-white/35 text-[15px]" style={{ fontFamily: "'serif'" }}>
                        No organizations match your filters
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrgsTable;