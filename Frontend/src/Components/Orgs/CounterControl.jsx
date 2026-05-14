import React from 'react';
import { ImSpinner9 } from 'react-icons/im';
import { BsShopWindow } from 'react-icons/bs';
import { IoReloadCircle } from "react-icons/io5";
import { FaPlayCircle } from "react-icons/fa";
import { FaCirclePause } from "react-icons/fa6";
import { IoMdCloseCircle } from "react-icons/io";

/* ── color cycle for counter rows ─────────────────────────────────────────── */
const COUNTER_COLORS = ["#00C9A7", "#FF6B6B", "#4DA8DA", "#845EC2", "#FFC75F", "#F96167"];

const CounterControl = ({ services, onStatusChange, loading }) => {
    // Show up to 4 services; the rest still exist but aren't shown here
    const visible = services.slice(0, 4);

    return (
        <div className="rounded-[20px] p-5 bg-white/4 border border-white/8 backdrop-blur-xl">
            <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "'serif', 'fangsong'", color: "#E8EDF5" }}>
                Counter Controls
            </h3>

            {visible.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center opacity-30">
                    <BsShopWindow size={32} className="mb-2 text-white" />
                    <p className="text-xs" style={{ fontFamily: "'serif', 'fangsong'" }}>No active counters</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {visible.map((svc, i) => {
                        const accentColor = COUNTER_COLORS[i % COUNTER_COLORS.length];

                        // Status-based styles
                        const statusMap = {
                            active: { label: "OPEN", color: "#00C9A7", bg: "rgba(0,201,167,0.1)", border: "rgba(0,201,167,0.25)" },
                            paused: { label: "PAUSED", color: "#FFC75F", bg: "rgba(255,199,95,0.1)", border: "rgba(255,199,95,0.25)" },
                            closed: { label: "CLOSED", color: "#F96167", bg: "rgba(249,97,103,0.1)", border: "rgba(249,97,103,0.25)" },
                        };
                        const s = statusMap[svc.status] || statusMap.closed;

                        return (
                            <div
                                key={svc._id}
                                className="flex flex-wrap items-center justify-between py-3 gap-2"
                                style={{
                                    borderBottom: i < visible.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                                    fontFamily: "'serif', 'fangsong'",
                                }}
                            >
                                {/* Counter info */}
                                <div className="min-w-30">
                                    <div className="text-sm font-bold" style={{ color: accentColor }}>
                                        {svc.counter}
                                    </div>
                                    <div className="text-[11px] mt-px truncate" style={{ color: "rgba(255,255,255,0.4)", maxWidth: 140 }}>
                                        {svc.name}
                                    </div>
                                </div>

                                {/* Status + action buttons */}
                                <div className="flex gap-1.5 items-center">
                                    {/* Status badge */}
                                    <span
                                        className="text-[12px] font-bold px-1.75 py-0.75 rounded-[5px]"
                                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                                    >
                                        {s.label}
                                    </span>

                                    {/* Pause — only if active */}
                                    {svc.status === 'active' && (
                                        <button
                                            onClick={() => onStatusChange(svc, 'paused')}
                                            title="Pause counter"
                                            disabled={loading}
                                            className="px-4.25 py-1 rounded-[7px] cursor-pointer transition-all hover:brightness-125 flex items-center justify-center"
                                            style={{ border: "1px solid rgba(255,199,95,0.3)", background: "rgba(255,199,95,0.1)", color: "#FFC75F" }}
                                        >
                                            {loading ? <ImSpinner9 size={16} /> : <FaCirclePause size={16} />}
                                        </button>
                                    )}

                                    {/* Resume — only if paused */}
                                    {svc.status === 'paused' && (
                                        <button
                                            onClick={() => onStatusChange(svc, 'active')}
                                            title="Resume counter"
                                            disabled={loading}
                                            className="px-4.25 py-1 rounded-[7px] cursor-pointer transition-all hover:brightness-125 flex items-center justify-center"
                                            style={{ border: "1px solid rgba(0,201,167,0.3)", background: "rgba(0,201,167,0.1)", color: "#00C9A7" }}
                                        >
                                            {loading ? <ImSpinner9 size={16} /> : <FaPlayCircle size={16} />}
                                        </button>
                                    )}

                                    {/* Close */}
                                    {svc.status !== 'closed' && (
                                        <button
                                            onClick={() => onStatusChange(svc, 'closed')}
                                            title="Close counter"
                                            disabled={loading}
                                            className="px-4.25 py-1 rounded-[7px] cursor-pointer transition-all hover:brightness-125 flex items-center justify-center"
                                            style={{ border: "1px solid rgba(249,97,103,0.3)", background: "rgba(249,97,103,0.1)", color: "#F96167" }}
                                        >
                                            {loading ? <ImSpinner9 size={16} /> : <IoMdCloseCircle size={16} />}
                                        </button>
                                    )}

                                    {/* Reopen — only if closed */}
                                    {svc.status === 'closed' && (
                                        <button
                                            onClick={() => onStatusChange(svc, 'active')}
                                            title="Reopen counter"
                                            disabled={loading}
                                            className="px-4.25 py-1 rounded-[7px] cursor-pointer transition-all hover:brightness-125 flex items-center justify-center"
                                            style={{ border: "1px solid rgba(0,201,167,0.3)", background: "rgba(0,201,167,0.1)", color: "#00C9A7" }}
                                        >
                                            {loading ? <ImSpinner9 size={16} /> : <IoReloadCircle size={16} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}


            {services.length === 0 && (
                <p className="text-[13px] text-white/25 text-center py-4" style={{ fontFamily: "'serif', 'fangsong'" }}>
                    No service counters yet
                </p>
            )}
        </div>
    );
};

export default CounterControl;