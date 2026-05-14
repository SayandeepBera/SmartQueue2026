import React from 'react';
import { motion } from 'framer-motion';
import {
    LogOut, Mail, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Icon imports
const Blob = ({ style }) => (
    <div className="absolute rounded-full pointer-events-none" style={{ filter: "blur(80px)", ...style }} />
);

const ReactivatedScreen = ({ orgName, onLogout }) => {
    return (
        <div className="fixed inset-0 overflow-y-auto overflow-x-hidden" style={{ background: "#090e1a", fontFamily: "'serif','fangsong'" }}>
            <Blob style={{ top: "-10%", left: "-5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(0,201,167,0.08) 0%, transparent 70%)" }} />
            <Blob style={{ bottom: "-10%", right: "-5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(0,201,167,0.05) 0%, transparent 70%)" }} />
            <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,201,167,0.5), transparent)" }} />

            <div className="min-h-screen flex flex-col items-center justify-center p-4 py-8 md:p-6 md:py-12">
                {/* Logo */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="flex items-center gap-2.5 mb-10">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center font-extrabold text-[17px] text-black shrink-0"
                        style={{ background: "linear-gradient(135deg, #00C9A7, #4DA8DA)", fontFamily: "'Space Grotesk', sans-serif" }}>Q</div>
                    <span className="font-bold text-white text-xl">SmartQueue</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 28, stiffness: 280, delay: 0.1 }}
                    className="w-full max-w-[90%] md:max-w-[60%]"
                    style={{
                        background: "rgba(15,23,42,0.9)",
                        border: "1px solid rgba(0,201,167,0.15)",
                        borderRadius: 24,
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 40px 80px rgba(0,0,0,0.4), 0 0 80px rgba(0,201,167,0.06)",
                    }}
                >
                    {/* Top teal accent */}
                    <div className="h-0.75 rounded-t-3xl"
                        style={{ background: "linear-gradient(90deg, #00C9A7, #4DA8DA)" }} />

                    <div className="p-8 text-center">
                        {/* Badge */}
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.25, type: "spring" }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                            style={{ background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.25)" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00C9A7]" style={{ animation: "pulse 2s infinite" }} />
                            <span className="text-[10px] font-bold tracking-[1.8px] uppercase text-[#00C9A7]">ACCOUNT REACTIVATED</span>
                        </motion.div>

                        {/* Icon */}
                        <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: "spring", damping: 18 }}
                            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5"
                            style={{ background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.25)" }}>
                            <CheckCircle2 size={30} style={{ color: "#00C9A7" }} />
                        </motion.div>

                        <h1 className="text-2xl font-black text-white mb-2">
                            {orgName ? `${orgName} is Live Again!` : "Account Reactivated!"}
                        </h1>
                        <p className="text-[14px] text-white/45 leading-relaxed max-w-sm mx-auto">
                            Your organization account has been successfully reactivated by an administrator.
                            To access your full dashboard, please sign in again so your session is refreshed.
                        </p>

                        {/* Info box */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                            className="mt-6 p-4 rounded-2xl text-left"
                            style={{ background: "rgba(0,201,167,0.05)", border: "1px solid rgba(0,201,167,0.15)" }}>
                            <div className="flex items-start gap-3">
                                <AlertCircle size={14} className="text-[#00C9A7] shrink-0 mt-0.5" />
                                <p className="text-[12px] text-white/45 leading-relaxed">
                                    Your current session has an outdated role. Signing in again takes just a moment
                                    and will immediately restore access to your Queue Manager, Services, and Analytics.
                                </p>
                            </div>
                        </motion.div>

                        {/* What's restored */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                            className="mt-4 p-4 rounded-2xl text-left"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            {[
                                { label: "Queue services are active again", ok: true },
                                { label: "Users can book tokens at your counters", ok: true },
                                { label: "All your data is fully intact", ok: true },
                                { label: "Full dashboard access restored", ok: true },
                            ].map(({ label, ok }) => (
                                <div key={label} className="flex items-center gap-2.5 mb-2 last:mb-0">
                                    <CheckCircle2 size={13} style={{ color: "#34d399", flexShrink: 0 }} />
                                    <span className="text-[12px] text-white/55">{label}</span>
                                </div>
                            ))}
                        </motion.div>

                        {/* Actions */}
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55 }}
                            className="flex flex-col gap-2.5 mt-6">
                            <button onClick={onLogout}
                                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-[15px] transition-all hover:brightness-110 hover:scale-[1.01] active:scale-[0.98]"
                                style={{
                                    background: "linear-gradient(135deg, #00C9A7, #4DA8DA)",
                                    color: "#000", border: "none", cursor: "pointer", fontFamily: "inherit",
                                    boxShadow: "0 16px 40px rgba(0,201,167,0.25)",
                                }}>
                                <LogOut size={15} /> Sign In Again to Continue →
                            </button>
                            <Link to="/support"
                                className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all hover:opacity-80"
                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                                <Mail size={13} /> Contact Support
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                    className="mt-8 text-[11px] text-white/20 text-center">
                    SmartQueue Platform · support@smartqueue.app · v3.0.0
                </motion.p>
            </div>
        </div>
    )
}

export default ReactivatedScreen
