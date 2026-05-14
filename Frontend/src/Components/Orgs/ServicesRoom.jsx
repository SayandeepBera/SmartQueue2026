import React from 'react';
import { motion } from 'framer-motion';
import { RiHotelBedLine } from 'react-icons/ri';

const ServicesRoom = ({ services }) => {
    return (
        <div className="rounded-[20px] overflow-hidden bg-white/4 border border-white/8 backdrop-blur-xl">
            <div className="flex items-center justify-between px-5 py-4.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 className="font-bold text-lg" style={{ fontFamily: "'serif', 'fangsong'", color: "#E8EDF5" }}>Service Rooms Status</h3>
                <span className="text-[11px] px-2.5 py-0.75 rounded-full" style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>Live</span>
            </div>
            <div>
                {services.length > 0 ? (
                    services.map((s, i) => {
                        const { total = 0, served = 0, skipped = 0, noShows = 0 } = s.stats || {};
                        const waiting = Math.max(0, total - served - skipped - noShows);
                        const pct = total > 0 ? Math.round((served / total) * 100) : 0;
                        const statusLabel = s.isActive ? "OPEN" : s.status === "paused" ? "PAUSED" : "CLOSED";
                        const statusColor = s.isActive ? "#00C9A7" : s.status === "paused" ? "#FFC75F" : "#F96167";
                        const statusBg = s.isActive ? "rgba(0,201,167,0.12)" : s.status === "paused" ? "rgba(255,199,95,0.12)" : "rgba(249,97,103,0.12)";
                        const statusBdr = s.isActive ? "rgba(0,201,167,0.3)" : s.status === "paused" ? "rgba(255,199,95,0.3)" : "rgba(249,97,103,0.3)";

                        return (
                            <div
                                key={s._id}
                                className="flex items-center gap-3.5 px-5 py-3.5 transition-colors duration-150 anim-slideInL"
                                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", animationDelay: `${i * 0.06}s`, background: "transparent", fontFamily: "'serif', 'fangsong'" }}
                                onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                                onMouseOut={e => e.currentTarget.style.background = "transparent"}
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shrink-0" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>{s.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-sm font-semibold truncate" style={{ color: "#E8EDF5" }}>{s.name}</span>
                                        <span className="text-xs shrink-0 ml-2" style={{ color: "rgba(255,255,255,0.4)" }}>{served}/{total}</span>
                                    </div>
                                    <div className="h-1.25 rounded-[3px] overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                                        <div className="bar-grow h-full rounded-[3px]" style={{ "--w": `${pct}%`, background: `linear-gradient(90deg,${s.color},${s.color}88)` }} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{waiting} waiting</span>
                                    <div className="px-2 py-0.5 rounded-md text-[11px] font-bold" style={{ background: statusBg, color: statusColor, border: `1px solid ${statusBdr}` }}>
                                        {statusLabel}
                                    </div>
                                </div>
                            </div>
                        );
                    })

                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 opacity-20"
                    >
                        <RiHotelBedLine size={48} className="mb-3" />
                        <p className="text-sm italic">No service data available</p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default ServicesRoom
