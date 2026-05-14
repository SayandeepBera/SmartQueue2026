import React from "react";
import { toast } from "react-toastify";
import Badge from "./Badge";

const PendingVerification = ({ pendingOrgs }) => {
    return (
        <div className="glass-card-amber rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-400/10">
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-amber-400 amber-pulse" />
                        <div className="absolute inset-0 rounded-full bg-amber-400 opacity-50" style={{ animation: "ping 1.4s ease-out infinite" }} />
                    </div>
                    <h3 className="font-bold text-lg text-white" style={{ fontFamily: "'serif', 'fangsong'" }}>Pending Verifications</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold text-amber-400" style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", fontFamily: "'serif', 'fangsong'" }}>{pendingOrgs.length}</span>
                </div>
            </div>
            {pendingOrgs.map((o, i) => (
                <div key={o._id} className="tbl-row flex items-center gap-3 px-5 py-3.5 border-b border-amber-400/6 last:border-0"
                    style={{ animation: `slideInL .4s ${i * 0.08}s both`, fontFamily: "'serif', 'fangsong'" }}>
                    <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-[17px]" style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)" }}>🏢</div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[16px] font-semibold text-white truncate">{o.orgName}</div>
                        <div className="text-[12px] text-white/40 mt-0.5">{o.orgType} · {o.city} · Establish {o.estYear}</div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                        <Badge status="pending" />
                        <button onClick={() => toast.success(`${o.orgName} verified successfully ✓`)}
                            className="btn px-3 py-1.5 rounded-lg text-xs font-bold text-black"
                            style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)" }}>✓ Verify</button>
                        <button onClick={() => toast.error(`${o.orgName} rejected`)}
                            className="btn px-3 py-1.5 rounded-lg text-xs font-semibold text-[#f43f5e]"
                            style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)" }}>✕ Reject</button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default PendingVerification;