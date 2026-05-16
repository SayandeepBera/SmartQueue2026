import React from 'react';
import StatusBadge from './StatusBadge';

const TokenCard = ({ token, onRefresh, onClick, isSelected }) => {
    const svc = token.serviceId || {};
    const org = token.orgId || {};
    const color = svc.color || "#00C9A7";
    const active = ["waiting", "next", "serving"].includes(token.status);

    const bookedDate = new Date(token.bookedAt);
    const dateStr = bookedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const timeStr = bookedDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    return (
        <div
            onClick={onClick}
            className="glass rounded-[20px] p-5 relative overflow-hidden transition-all duration-200"
            style={{
                borderColor: isSelected ? `${color}60` : `${color}22`,
                background: isSelected
                    ? `linear-gradient(135deg,${color}15,rgba(255,255,255,0.03))`
                    : active
                        ? `linear-gradient(135deg,${color}08,rgba(255,255,255,0.01))`
                        : undefined,
                cursor: onClick ? "pointer" : "default",
                boxShadow: isSelected ? `0 0 0 1.5px ${color}40, 0 8px 24px ${color}12` : undefined,
                transform: isSelected ? "translateY(-2px)" : undefined,
            }}
        >
            {/* Selected indicator */}
            {isSelected && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ background: color }} />
            )}

            {active && !isSelected && (
                <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                    style={{ boxShadow: `inset 0 0 0 1px ${color}30` }} />
            )}

            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ background: `${color}18`, border: `1.5px solid ${color}30` }}>
                        {svc.icon || "🎛️"}
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-bold truncate" style={{ fontFamily: "'serif', fangsong" }}>
                            {svc.name || "Service"}
                        </h4>
                        <p className="text-xs text-white/40 truncate">{org.orgName || "Organization"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg"
                            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                            Viewing
                        </span>
                    )}
                    <StatusBadge status={token.status} />
                </div>
            </div>

            <div className="flex items-end justify-between gap-3">
                <div>
                    <div className="text-[10px] text-white/30 font-semibold tracking-wider mb-0.5">TOKEN</div>
                    <div className="text-[22px] font-extrabold leading-none tracking-tight"
                        style={{ color, fontFamily: "'Space Grotesk',sans-serif" }}>
                        {token.tokenNumber}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[11px] text-white/35">{dateStr} · {timeStr}</div>
                    <div className="text-xs text-white/25 mt-0.5">Counter {svc.counter} · ~{token.estimatedWait} min wait</div>
                </div>
            </div>

            {active && (
                <div className="mt-3.5 pt-3.5 border-t flex items-center justify-between gap-2 flex-wrap"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex gap-4">
                        <div>
                            <div className="text-[10px] text-white/30 mb-0.5">Status</div>
                            <div className="text-xs font-semibold capitalize" style={{ color }}>
                                {token.status.replace("_", " ")}
                            </div>
                        </div>
                        {token.position != null && (
                            <div>
                                <div className="text-[10px] text-white/30 mb-0.5">Position</div>
                                <div className="text-xs font-semibold">#{token.position}</div>
                            </div>
                        )}
                    </div>
                    {onRefresh && (
                        <button
                            onClick={e => { e.stopPropagation(); onRefresh(token._id); }}
                            className="btn px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
                            ↻ Refresh
                        </button>
                    )}
                </div>
            )}

            {token.status === "served" && token.servedAt && (
                <div className="mt-3 pt-3 border-t text-xs text-white/30"
                    style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    Served at {new Date(token.servedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </div>
            )}

            {/* Click hint — only shown when clickable and not selected */}
            {onClick && !isSelected && (
                <div className="mt-2 text-[10px] text-white/20 flex items-center gap-1"
                    style={{ fontFamily: "'serif', fangsong" }}>
                    <span>↗</span> Click to view details
                </div>
            )}
        </div>
    );
};

export default TokenCard;