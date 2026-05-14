import React from 'react'

const StepIndicator = ({ steps, current }) => {
    return (
        <div className="flex items-center gap-0 w-full">
            {steps.map((s, i) => {
                const done = current > s.id;
                const active = current === s.id;
                const pctLine = i < steps.length - 1;
                return (
                    <div key={s.id} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className="step-dot relative w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border-2 shrink-0"
                                style={{
                                    background: done ? "linear-gradient(135deg,#14b8a6,#0891b2)" : active ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.05)",
                                    borderColor: done ? "#14b8a6" : active ? "rgba(20,184,166,0.8)" : "rgba(255,255,255,0.12)",
                                    color: done ? "#000" : active ? "#14b8a6" : "rgba(255,255,255,0.3)",
                                    boxShadow: active ? "0 0 0 4px rgba(20,184,166,0.15), 0 0 16px rgba(20,184,166,0.25)" : "none",
                                }}
                            >
                                {done ? (
                                    <svg className="w-4 h-4 check-bounce" viewBox="0 0 16 16" fill="none">
                                        <path d="M3 8l4 4 6-7" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                                            strokeDasharray="100" strokeDashoffset="0" />
                                    </svg>
                                ) : (
                                    <span className="text-[11px]">{s.id}</span>
                                )}
                                {active && (
                                    <div className="absolute inset-0 rounded-full border border-teal-400/40" style={{ animation: "pulse-ring 1.8s ease-out infinite" }} />
                                )}
                            </div>
                            <span className={`text-[9px] font-semibold tracking-wider uppercase whitespace-nowrap hidden lg:block ${active ? "text-teal-400" : done ? "text-white/50" : "text-white/20"}`}>
                                {s.label}
                            </span>
                        </div>
                        {pctLine && (
                            <div className="flex-1 mx-1 h-0.5 rounded-full bg-white/6 overflow-hidden">
                                <div className="step-line h-full bg-linear-to-r from-teal-500 to-cyan-400 rounded-full" style={{ width: done ? "100%" : "0%" }} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default StepIndicator
