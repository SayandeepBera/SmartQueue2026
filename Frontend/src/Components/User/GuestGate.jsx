import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import RevealSection from '../../Hooks/RevealSection';

const GuestGate = () => {
    const navigate = useNavigate();

    const features = [
        { icon: "🎟️", label: "Track live queue position" },
        { icon: "⏱️", label: "See real-time wait times" },
        { icon: "📋", label: "View complete booking history" },
        { icon: "🔔", label: "Get notified when it's your turn" },
    ];

    return (
        <RevealSection delay={0.04}>
            <div className="flex flex-col items-center justify-center py-12 px-2 md:py-16 md:px-4">

                {/* Ambient glow */}
                <div className="absolute w-80 h-80 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(132,94,194,0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />

                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 28, stiffness: 260 }}
                    className="relative w-full max-w-[95%] md:max-w-[65%] z-10"
                    style={{
                        background: "rgba(13,19,33,0.7)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 24,
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 40px 80px rgba(0,0,0,0.35), 0 0 60px rgba(132,94,194,0.06)",
                        overflow: "hidden",
                    }}
                >
                    {/* Top accent bar */}
                    <div className="h-0.75 w-full"
                        style={{ background: "linear-gradient(90deg, #845EC2, #4DA8DA, #00C9A7)" }} />

                    <div className="p-8">

                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -8 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.15, type: "spring", damping: 16 }}
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                            style={{
                                background: "rgba(132,94,194,0.12)",
                                border: "1px solid rgba(132,94,194,0.25)",
                            }}
                        >
                            <span className="text-3xl">🎟️</span>
                        </motion.div>

                        {/* Heading */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center mb-6"
                        >
                            <h2 className="text-2xl font-black text-white mb-2"
                                style={{ fontFamily: "'serif','fangsong'" }}>
                                Your Tokens Await
                            </h2>
                            <p className="text-[14px] text-white/40 leading-relaxed max-w-xs mx-auto">
                                Sign in to view your active queue positions, track live wait times,
                                and browse your full booking history.
                            </p>
                        </motion.div>

                        {/* Feature list */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.28 }}
                            className="grid grid-cols-2 gap-2.5 mb-7"
                        >
                            {features.map(({ icon, label }, i) => (
                                <motion.div
                                    key={label}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.06 }}
                                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                                    style={{
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                    }}
                                >
                                    <span className="text-base shrink-0">{icon}</span>
                                    <span className="text-[12px] text-white/50 font-medium leading-snug">{label}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* CTA buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.48 }}
                            className="flex flex-col gap-2.5"
                        >
                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-[15px] transition-all hover:brightness-110 hover:scale-[1.01] active:scale-[0.98]"
                                style={{
                                    background: "linear-gradient(135deg, #845EC2, #4DA8DA)",
                                    color: "#fff",
                                    textDecoration: "none",
                                    boxShadow: "0 16px 40px rgba(132,94,194,0.25)",
                                    fontFamily: "'serif','fangsong'",
                                }}
                            >
                                Sign In to View Tokens
                                <span className="text-lg">→</span>
                            </Link>

                            <Link
                                to="/services"
                                className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all hover:bg-white/5"
                                style={{
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    color: "rgba(255,255,255,0.45)",
                                    textDecoration: "none",
                                    fontFamily: "'serif','fangsong'",
                                }}
                            >
                                Browse Services First
                            </Link>
                        </motion.div>
                    </div>

                    {/* Bottom hint */}
                    <div className="px-8 pb-6 text-center">
                        <p className="text-[11px] text-white/20">
                            New here?{" "}
                            <Link to="/login" style={{ color: "#845EC2", textDecoration: "none", fontWeight: 700 }}>
                                Create a free account
                            </Link>
                            {" "}— it takes 30 seconds.
                        </p>
                    </div>
                </motion.div>
            </div>
        </RevealSection>
    );
};

export default GuestGate;