import React from 'react';
import AnimatedNumber from '../../Hooks/AnimatedNumber';

const StatCard = ({ icon, label, value, sub, color, delay, suffix = "", pct = 70 }) => {
    return (
        <div
            className="relative overflow-hidden rounded-[18px] p-5 bg-white/4 border border-white/8 backdrop-blur-xl anim-fadeUp"
            style={{ animationDelay: `${delay}s`, fontFamily: "'serif', 'fangsong'" }}
        >
            {/* bg icon watermark */}
            <div className="absolute -top-4 -right-4 text-[52px] opacity-[0.06] pointer-events-none select-none">{icon}</div>

            <div className="text-[22px] mb-2.5">{icon}</div>
            <div style={{ fontFamily: "'serif', 'fangsong'", fontSize: 30, fontWeight: 900, color, lineHeight: 1, letterSpacing: "-1px" }}>
                <AnimatedNumber value={typeof value === "number" ? value : 0} />{suffix}
            </div>
            
            <div className="text-[14px] mt-1 font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
            
            {sub && <div className="text-[12px] mt-1.5 font-semibold" style={{ color }}>{sub}</div>}
            
            <div className="mt-3 h-[3.75px] rounded-sm" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="bar-grow h-full rounded-sm" style={{ "--w": `${Math.min(100, Math.max(0, pct))}%`, background: color }} />
            </div>
        </div>
    );
}

export default StatCard
