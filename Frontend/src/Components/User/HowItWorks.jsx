import React from 'react';
import RevealSection from '../../Hooks/RevealSection';

const HOW_STEPS = [
    { step: "01", icon: "🏢", title: "Find an Organization", desc: "Browse hospitals, banks, clinics & govt offices near you on the live map.", color: "#00C9A7" },
    { step: "02", icon: "🎛️", title: "Choose a Service", desc: "Pick the specific counter — each shows live queue size and wait time.", color: "#4DA8DA" },
    { step: "03", icon: "✍️", title: "Enter Your Name", desc: "Provide your name so staff can identify you when your token is called.", color: "#845EC2" },
    { step: "04", icon: "🚶", title: "Walk In On Time", desc: "Track live position. Get notified 2 ahead — walk in right on time.", color: "#FFC75F" },
];

const HowItWorks = () => {
    return (
        <RevealSection delay={0.05}>
            <div className="py-16 md:py-18 lg:py-20">
                <div className="text-center mb-11" style={{ fontFamily: "serif, fangsong" }}>
                    <p className="text-xs font-bold tracking-[2.5px] uppercase mb-2.5" style={{ color: "#00C9A7" }}>Simple Process</p>
                    <h2 className="font-extrabold text-4xl tracking-[-0.8px]">How It Works</h2>
                    <p className="mt-2.5 text-white/40 text-sm max-w-115 mx-auto leading-7">
                        SmartQueue works across any organization. Find one, book a slot, and walk in when it's your turn.
                    </p>
                </div>

                <div className="grid gap-8 relative" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
                    {/* Connector */}
                    <div className="step-connector absolute top-9 left-[12.5%] right-[12.5%] h-px z-0" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="glow-line absolute inset-0 rounded-sm" style={{ background: "linear-gradient(90deg,#00C9A7,#4DA8DA,#845EC2,#FFC75F)" }} />
                    </div>
                    {HOW_STEPS.map((s, i) => (
                        <div key={i} className="px-3 text-center relative z-1" style={{ animation: `stepFadeUp .65s ${0.08 + i * 0.1}s cubic-bezier(.22,1,.36,1) both` }}>
                            <div className="glow-card w-18 h-18 rounded-full mx-auto mb-5 flex items-center justify-center text-[26px] relative" style={{
                                background: `linear-gradient(135deg,${s.color}22,${s.color}06)`,
                                border: `1.5px solid ${s.color}40`,
                                '--glow-color': `${s.color}60`,
                                '--glow-bright': `${s.color}40`,
                                '--glow-dim': `${s.color}20`,
                                animationDelay: `${i * 0.5}s`
                            }}>
                                {s.icon}
                                <div className="absolute -top-1.25 -right-1.25 w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold text-black" style={{ background: s.color, fontFamily: "serif, fangsong", boxShadow: `0 4px 10px ${s.color}60` }}>{s.step}</div>
                            </div>
                            <h3 className="text-lg font-bold mb-2.25 tracking-[-0.3px]" style={{ fontFamily: "'serif', fangsong" }}>{s.title}</h3>
                            <p className="text-sm text-white/40 leading-7" style={{ fontFamily: "'serif', fangsong" }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </RevealSection>
    );
}

export default HowItWorks
