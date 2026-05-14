import React from 'react';
import FieldError from '../../Hooks/FieldError';
import { motion } from 'framer-motion';

/* ─── DATA ───────────────────────────────────────────────────────────────── */
const ORG_TYPES = [
    { id: "Hospital", icon: "🏥", label: "Hospital", desc: "Multi-specialty or general", color: "#f43f5e" },
    { id: "Bank", icon: "🏦", label: "Bank", desc: "Banking & financial services", color: "#f59e0b" },
    { id: "Government", icon: "🏛️", label: "Government", desc: "Govt offices & departments", color: "#3b82f6" },
    { id: "Clinic", icon: "🩺", label: "Clinic", desc: "Private clinic or specialist", color: "#8b5cf6" },
    { id: "Diagnostic", icon: "🔬", label: "Diagnostic", desc: "Labs & diagnostic centres", color: "#06b6d4" },
    { id: "Other", icon: "🏢", label: "Other", desc: "Any other service org", color: "#14b8a6" },
];

const FormSlide1 = ({ data, setData, errors }) => {
    return (
        <div className="step-enter">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <p className="text-[11px] text-teal-400 font-semibold tracking-[2px] uppercase mb-2">
                    Step 1 of 6
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
                    What type of organization?
                </h3>
                <p className="text-sm text-white/40">
                    This helps us customize your dashboard and queue settings.
                </p>
            </div>

            {/* Org type grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {ORG_TYPES.map((t, i) => {
                    const sel = data.orgType === t.id;
                    return (
                        <motion.div
                            key={t.id}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className={`relative rounded-2xl p-3 sm:p-4 border-2 overflow-hidden cursor-pointer
                                        ${sel ? "selected" : ""}`}
                            style={{
                                background: sel ? `${t.color}12` : "rgba(255,255,255,0.03)",
                                borderColor: sel ? `${t.color}70` : "rgba(255,255,255,0.08)",
                                boxShadow: sel ? `0 0 28px ${t.color}22` : "none",
                                animation: `scaleUp .4s ${i * 0.06}s both`,
                            }}
                            onClick={() => setData({ ...data, orgType: t.id })}
                        >
                            {/* Radial glow when selected */}
                            {sel && (
                                <div
                                    className="absolute inset-0 opacity-[0.07] rounded-2xl pointer-events-none"
                                    style={{ background: `radial-gradient(circle at 30% 30%,${t.color},transparent 70%)` }}
                                />
                            )}

                            <div className="relative">
                                {/* Icon */}
                                <div
                                    className="text-2xl sm:text-3xl mb-2 sm:mb-3 float-icon"
                                    style={{ animationDelay: `${i * 0.4}s` }}
                                >
                                    {t.icon}
                                </div>

                                {/* Label */}
                                <div className="text-xs sm:text-sm font-bold text-white mb-0.5">
                                    {t.label}
                                </div>

                                {/* Description */}
                                <div className="text-[10px] sm:text-[11px] text-white/35 leading-snug">
                                    {t.desc}
                                </div>

                                {/* Check badge */}
                                {sel && (
                                    <div
                                        className="absolute top-0 right-0 w-5 h-5 rounded-full flex items-center justify-center
                                                   text-[10px] font-bold text-black check-bounce"
                                        style={{ background: `linear-gradient(135deg,${t.color},${t.color}BB)` }}
                                    >
                                        ✓
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <FieldError msg={errors.orgType} />
        </div>
    );
};

export default FormSlide1;