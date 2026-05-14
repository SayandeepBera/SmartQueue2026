import React from 'react';
import Badge from './Badge';
import PlanBadge from './PlanBadge';

const RecentOrgs = ({ orgs }) => {
    const isEmpty = !orgs || orgs.length === 0;

    return (
        <div className="glass rounded-2xl overflow-hidden flex flex-col">
            {/* Header: Fixed at top */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/6 shrink-0">
                <h3 className="font-bold text-lg text-white" style={{ fontFamily: "'serif', 'fangsong'" }}>
                    Recent Organizations
                </h3>
                <span className="text-xs text-white/35 bg-white/5 px-2.5 py-1 rounded-full border border-white/8" style={{ fontFamily: "'serif', 'fangsong'" }}>
                    {orgs.length} total
                </span>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col">
                {isEmpty ? (
                    /* ─── Sophisticated Empty State ──────────────────────────────── */
                    <div className="flex-1 flex flex-col items-center justify-center py-20 px-10 text-center relative overflow-hidden">
                        
                        {/* 1. Animated Sonar Ripple (Entering first) */}
                        <div 
                            className="absolute rounded-full border border-teal-500/10 pointer-events-none"
                            style={{ 
                                width: '200px', height: '200px', 
                                animation: "sonarRipple 2.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite" 
                            }}
                        />
                        
                        {/* 2. The Icon (Scale-up entry) */}
                        <div 
                            className="relative mb-6"
                            style={{ animation: "scaleUp .5s .15s both cubic-bezier(.34,1.56,.64,1)" }}
                        >
                            <div className="absolute inset-0 bg-teal-500/15 blur-2xl rounded-full" />
                            <div className="relative w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-2xl">
                                🏢
                            </div>
                        </div>
                        
                        {/* 3. Text & Context (Slide-up & Fade-in entry) */}
                        <div style={{ animation: "fadeUp .5s .3s both" }}>
                            <h4 className="text-white/80 font-bold text-base mb-1.5" style={{ fontFamily: "'serif', 'fangsong'" }}>
                                No Organizations Found
                            </h4>
                            <p className="text-white/30 text-xs leading-relaxed max-w-60">
                                New registrations will appear here once they join the platform.
                            </p>
                        </div>
                        
                        {/* Decorative footer element (Fades in last) */}
                        <div className="mt-8 flex gap-1.5" style={{ animation: "fadeIn .8s .6s both" }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                            <div className="w-10 h-1.5 rounded-full bg-white/5" />
                            <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                        </div>
                    </div>
                ) : (
                    orgs.map((o, i) => {
                        const pct = Math.min(100, Math.round((o.tokens / 55000) * 100));
                        return (
                            <div 
                                key={o._id} 
                                className="tbl-row flex items-center gap-3 px-5 py-3.5 border-b border-white/3 last:border-0"
                                style={{ 
                                    animation: `slideInL .4s ${i * 0.06}s both`, 
                                    fontFamily: "'serif', 'fangsong'" 
                                }}
                            >
                                <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-[17px] bg-white/4 border border-white/7">
                                    {o.logo?.url ? <img src={o.logo.url} alt="" className="w-full h-full object-cover rounded-xl" /> : "🏢"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[16px] font-semibold text-white truncate">{o.orgName}</span>
                                        {o.status === "approved" && <span className="text-xs text-[#60a5fa] shrink-0">✓</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1 w-24 bg-white/6 rounded-full overflow-hidden">
                                            <div className="bar-grow h-full rounded-full" style={{ "--w": `${pct}%`, background: "#fbbf24" }} />
                                        </div>
                                        <span className="text-xs text-white/35">0 tokens</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0">
                                    <PlanBadge plan={o.plan} />
                                    <Badge status={o.status} />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default RecentOrgs;