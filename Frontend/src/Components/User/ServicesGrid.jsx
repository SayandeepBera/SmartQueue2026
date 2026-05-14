import React, { useContext, useState } from 'react';
import AuthContext from '../../Context/Authentication/AuthContext';
import { useNavigate } from 'react-router-dom';

const ServicesGrid = ({ services, onBook }) => {
    const [hov, setHov] = useState(null);
    const { authToken, userRole } = useContext(AuthContext);
    const navigate = useNavigate();

    // Show empty state if no services available
    if (!services || !services.length) return (
        <div className="text-center py-16 px-5 text-white/35 mb-14">
            <div className="text-5xl mb-3.5">🔍</div>
            <p className="text-base font-semibold text-white/55 mb-1.5">No services found</p>
            <p className="text-[13px]">Try adjusting your filters or search terms</p>
        </div>
    );

    return (
        <div className="grid gap-5 mb-14 py-6" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
            {services.map((s, i) => {
                // Support both API shape (s.org populated) and dummy data shape (s.orgId string + ORGS array)
                const org = s.org || null;
                const orgName = org?.orgName || org?.name || "";
                const orgIcon = org?.icon || "🏢";
                const orgVerified = org?.verified ?? true;
                const orgAddress = org?.address || "";
                const room = s.room || "";

                const active = s.active ?? 0;
                const wait = s.wait || s.avgWait || 0;
                const color = s.color || "#00C9A7";
                const busy = active > 15;
                const id = s._id || s.id;

                return (
                    <div
                        key={id || i}
                        className="svc-card glass flex flex-col justify-evenly rounded-[20px] p-6 cursor-pointer relative overflow-hidden"
                        style={{
                            "--cg": color,
                            borderColor: `${color}1A`,
                            animation: `cardIn .5s ${i * .04}s cubic-bezier(.22,1,.36,1) both`
                        }}
                        onMouseEnter={() => setHov(id)}
                        onMouseLeave={() => setHov(null)}
                        onClick={authToken && userRole === "user" ? () => onBook(s) : () => navigate('/login')}
                    >
                        {/* Org + status */}
                        <div className="flex items-center justify-between gap-2 mb-3.5">
                            <div
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg min-w-0"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                            >
                                <span className="text-[13px] shrink-0">{orgIcon}</span>
                                <span className="text-[11px] text-white/50 font-medium overflow-hidden text-ellipsis whitespace-nowrap">{orgName}</span>
                                {orgVerified && <span className="text-[10px] shrink-0" style={{ color: "#00C9A7" }}>✓</span>}
                            </div>
                            <div
                                className="px-2.5 py-0.75 rounded-lg text-[10px] font-bold tracking-[0.8px] shrink-0"
                                style={{
                                    background: busy ? "rgba(249,97,103,0.12)" : "rgba(0,201,167,0.1)",
                                    border: `1px solid ${busy ? "rgba(249,97,103,0.3)" : "rgba(0,201,167,0.25)"}`,
                                    color: busy ? "#F96167" : "#00C9A7"
                                }}
                            >
                                {busy ? "● BUSY" : "● OPEN"}
                            </div>
                        </div>

                        {/* Icon + name */}
                        <div className="flex items-center gap-3 mb-2.5">
                            <div
                                className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px] shrink-0 transition-transform duration-300"
                                style={{
                                    background: `${color}18`,
                                    border: `1.5px solid ${color}30`,
                                    transform: hov === id ? "scale(1.15) rotate(-5deg)" : "scale(1)",
                                    transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)"
                                }}
                            >{s.icon || "🎛️"}</div>
                            <div style={{ fontFamily: "'serif', fangsong" }}>
                                <h3 className="text-lg font-semibold tracking-[-0.2px] mb-0.5">{s.name}</h3>
                                <p className="text-xs text-white/35">Counter {s.counter} · {active} in queue</p>
                            </div>
                        </div>

                        {/* Location chip */}
                        {(orgAddress || room) && (
                            <div
                                className="inline-flex items-center gap-1.25 rounded-[7px] px-2.5 py-1.25 mb-3.5 text-[11px] text-white/45 max-w-full overflow-hidden"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                            >
                                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                                    📍 {orgAddress}{room ? ` · ${room.split(",")[0]}` : ""}
                                </span>
                            </div>
                        )}

                        {/* Wait + book */}
                        <div className="flex justify-between items-center gap-3 mt-3">
                            <div>
                                <div className="text-[11px] text-white/30 mb-0.5">Est. wait</div>
                                <div
                                    className="text-[22px] font-extrabold leading-none"
                                    style={{ fontFamily: "'Space Grotesk',sans-serif", color }}
                                >
                                    {wait}<span className="text-xs font-normal text-white/35 ml-0.75">min</span>
                                </div>
                            </div>
                            <button
                                className="btn rounded-xl px-5 py-2.5 text-sm font-bold text-black shrink-0"
                                style={{ fontFamily: "'serif', fangsong", background: `linear-gradient(135deg,${color},${color}BB)` }}
                            >
                                Book Token →
                            </button>
                        </div>

                        {/* Queue bar */}
                        <div className="mt-3.5 rounded-sm h-1 overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                            <div
                                className="fill-bar h-full rounded-sm"
                                style={{
                                    "--w": `${Math.min((active / 30) * 100, 100)}%`,
                                    background: `linear-gradient(90deg,${color},${color}66)`
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ServicesGrid;