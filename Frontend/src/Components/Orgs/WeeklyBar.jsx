import React from 'react'

const WeeklyBar = ({ bars, days, maxB }) => {
    return (
        <div className="rounded-[20px] p-6 bg-white/4 border border-white/8 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg" style={{ fontFamily: "'serif', 'fangsong'", color: "#E8EDF5" }}>Weekly Token Volume</h3>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'serif', 'fangsong'" }}>This Week</span>
            </div>
            
            {/* Scroll wrapper for mobile */}
            <div className="overflow-x-auto custom-scrollbar">
                <div className="flex items-end gap-2 min-w-75" style={{ height: 160 }}>
                    {bars.map((v, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
                            <span className="text-[10px] font-semibold mt-auto shrink-0" style={{ color: "rgba(255,255,255,0.5)" }}>{v}</span>
                            <div className="w-full rounded-t-md overflow-hidden shrink-0" style={{ height: `${(v / maxB) * 100}%`, background: "rgba(255,255,255,0.06)" }}>
                                <div className="w-full h-full rounded-t-md anim-fadeUp" style={{ animationDelay: `${i * 0.07}s`, background: i === 3 ? "linear-gradient(180deg,#00C9A7,#4DA8DA)" : "rgba(0,201,167,0.35)" }} />
                            </div>
                            <span className="text-[10px] shrink-0" style={{ color: i === 3 ? "#00C9A7" : "rgba(255,255,255,0.4)", fontWeight: i === 3 ? 700 : 400 }}>{days[i]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default WeeklyBar;