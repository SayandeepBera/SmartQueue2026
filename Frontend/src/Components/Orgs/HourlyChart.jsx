import React from 'react'

const HourlyChart = ({ hours, traffic, maxT }) => {
    return (
        <div className="rounded-[20px] p-6 bg-white/4 border border-white/8 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg" style={{ fontFamily: "'serif', 'fangsong'", color: "#E8EDF5" }}>Today's Hourly Traffic</h3>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'serif', 'fangsong'" }}>Today</span>
            </div>

            {/* Scroll wrapper for mobile */}
            <div className="overflow-x-auto custom-scrollbar">
                <div className="relative min-w-100" style={{ height: 180 }}>
                    {[0, 1, 2, 3].map(l => (
                        <div key={l} className="absolute left-0 right-0 h-px" style={{ bottom: `${l * 33.3}%`, background: "rgba(255,255,255,0.05)" }} />
                    ))}
                    
                    <svg className="w-full h-40 overflow-visible" viewBox={`0 0 ${(hours.length - 1) * 40} 160`} preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4DA8DA" stopOpacity=".4" />
                                <stop offset="100%" stopColor="#4DA8DA" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path d={`M ${traffic.map((v, i) => `${i * 40} ${160 - (v / maxT) * 130}`).join(" L ")} L ${(traffic.length - 1) * 40} 160 L 0 160 Z`} fill="url(#lineGrad)" />
                        <polyline points={traffic.map((v, i) => `${i * 40},${160 - (v / maxT) * 130}`).join(" ")} fill="none" stroke="#4DA8DA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        {traffic.map((v, i) => (
                            <circle key={i} cx={i * 40} cy={160 - (v / maxT) * 130} r="4" fill="#4DA8DA" stroke="#07090f" strokeWidth="2" />
                        ))}
                    </svg>

                    <div className="flex justify-between mt-3 px-1">
                        {hours.map(h => <span key={h} className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{h}</span>)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HourlyChart;