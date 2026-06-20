import React from 'react';
import FieldError from '../../Hooks/FieldError';

const PLANS = [
    { id: "Free", price: 0, period: "", color: "#64748b", features: ["2 service counters", "100 tokens/day", "Basic analytics", "Email support"], recommended: false },
    { id: "Starter", price: 999, period: "/month", color: "#14b8a6", features: ["5 service counters", "500 tokens/day", "SMS alerts", "Priority support", "Custom branding"], recommended: false },
    { id: "Pro", price: 2999, period: "/month", color: "#f59e0b", features: ["15 service counters", "Unlimited tokens", "Full analytics", "API access", "Dedicated manager"], recommended: true },
    { id: "Enterprise", price: 7999, period: "/month", color: "#8b5cf6", features: ["Unlimited counters", "Unlimited tokens", "White-label", "SLA guarantee", "Custom integrations"], recommended: false },
];

const FormSlide5 = ({ data, setData, errors }) => {
    return (
        <div className="step-enter">
            <div className="mb-8">
                <p className="text-[11px] text-teal-400 font-semibold tracking-[2px] uppercase mb-2">Step 5 of 6</p>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'serif', fangsong" }}>Choose your plan</h3>
                <p className="text-sm text-white/40">Start free, upgrade anytime. No credit card required for Free plan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PLANS.map((p, i) => {
                    const sel = data.plan === p.id;
                    return (
                        <div key={p.id}
                            className={`card-hover relative rounded-2xl p-5 border-2 cursor-pointer overflow-hidden`}
                            style={{
                                background: sel ? `${p.color}0E` : "rgba(255,255,255,0.03)",
                                borderColor: sel ? `${p.color}65` : "rgba(255,255,255,0.08)",
                                boxShadow: sel ? `0 0 32px ${p.color}20` : "none",
                                animation: `scaleUp .4s ${i * 0.08}s both`,
                            }}
                            onClick={() => setData({ ...data, plan: p.id })}
                        >
                            {p.recommended && (
                                <div className="absolute top-4 right-4 text-[9px] font-bold text-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                                    style={{ background: `linear-gradient(135deg,${p.color},${p.color}BB)` }}>
                                    Recommended
                                </div>
                            )}
                            {sel && (
                                <div className="absolute inset-0 opacity-[0.06] rounded-2xl" style={{ background: `radial-gradient(circle at 20% 20%,${p.color},transparent 60%)` }} />
                            )}

                            <div className="relative">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="text-base font-bold mb-0.5" style={{ fontFamily: "'serif', fangsong", color: p.color }}>{p.id}</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-extrabold text-white" style={{ fontFamily: "'serif', fangsong" }}>
                                                {p.price === 0 ? "Free" : `₹${p.price.toLocaleString()}`}
                                            </span>
                                            {p.period && <span className="text-xs text-white/35">{p.period}</span>}
                                        </div>
                                    </div>
                                    {sel && (
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-black shrink-0 check-bounce"
                                            style={{ background: `linear-gradient(135deg,${p.color},${p.color}AA)` }}>✓</div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    {p.features.map((f, j) => (
                                        <div key={j} className="flex items-center gap-2 text-xs text-white/55">
                                            <span style={{ color: p.color }}>✓</span>{f}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    className="mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
                                    style={{
                                        background: sel ? `linear-gradient(135deg,${p.color},${p.color}BB)` : `${p.color}12`,
                                        border: `1px solid ${p.color}${sel ? "66" : "28"}`,
                                        color: sel ? "#000" : p.color,
                                        fontFamily: "'serif'",
                                    }}
                                    onClick={() => setData({ ...data, plan: p.id })}
                                >
                                    {sel ? "Selected ✓" : "Select Plan"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <FieldError msg={errors.plan} />
        </div>
    );
}

export default FormSlide5
