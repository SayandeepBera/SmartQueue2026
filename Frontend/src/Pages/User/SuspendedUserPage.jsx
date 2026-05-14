import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ShieldOff, LogOut, Mail, ExternalLink, XCircle, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import AuthContext from '../../Context/Authentication/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Blob = ({ style }) => (
    <div className="absolute rounded-full pointer-events-none" style={{ filter: "blur(80px)", ...style }} />
);

const SuspendedUserPage = () => {
    const { username, email, logoutUser } = useContext(AuthContext);

    const handleLogout = () => {
        try {
            if (typeof logoutUser === 'function')
                logoutUser();
        }
        catch (_) { }
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div
            className="fixed inset-0 overflow-y-auto overflow-x-hidden"
            style={{ background: "#090e1a", fontFamily: "'serif','fangsong'" }}
        >
            {/* Background blobs */}
            <Blob style={{ top: "-5%", left: "-5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(244,63,94,0.07) 0%, transparent 70%)" }} />
            <Blob style={{ bottom: "-5%", right: "-5%", width: 450, height: 450, background: "radial-gradient(circle, rgba(244,63,94,0.05) 0%, transparent 70%)" }} />

            {/* Top accent */}
            <div className="absolute top-0 inset-x-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(244,63,94,0.5), transparent)" }} />

            <div className="min-h-screen flex flex-col items-center justify-center p-6 py-12">

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-2.5 mb-10"
                >
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center font-extrabold text-[17px] text-black"
                        style={{ background: "linear-gradient(135deg, #00C9A7, #4DA8DA)", fontFamily: "'Space Grotesk',sans-serif" }}>
                        Q
                    </div>
                    <span className="font-bold text-white text-xl">SmartQueue</span>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 28, stiffness: 280, delay: 0.1 }}
                    className="w-full max-w-[90%] md:max-w-2/3"
                    style={{
                        background: "rgba(15,23,42,0.9)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 24,
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 40px 80px rgba(0,0,0,0.4), 0 0 60px rgba(244,63,94,0.06)",
                    }}
                >
                    {/* Header */}
                    <div className="p-7 border-b border-white/5 text-center">
                        {/* Badge */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.25, type: "spring" }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                            style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)" }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" style={{ animation: "pulse 2s infinite" }} />
                            <span className="text-[10px] font-bold tracking-[1.8px] uppercase text-[#f43f5e]">ACCOUNT SUSPENDED</span>
                        </motion.div>

                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: "spring", damping: 18 }}
                            className="w-18 h-18 rounded-full flex items-center justify-center mx-auto mb-5"
                            style={{
                                width: 72, height: 72,
                                background: "rgba(244,63,94,0.1)",
                                border: "2px solid rgba(244,63,94,0.25)",
                            }}
                        >
                            <ShieldOff size={32} className="text-[#f43f5e]" />
                        </motion.div>

                        <h1 className="text-2xl font-black text-white mb-2">Account Suspended</h1>
                        <p className="text-[14px] text-white/40 leading-relaxed">
                            {username ? (
                                <>Hi <strong className="text-white/60">{username}</strong>, your account has been temporarily suspended by an administrator.</>
                            ) : (
                                "Your account has been temporarily suspended by an administrator."
                            )}
                        </p>
                    </div>

                    {/* Body */}
                    <div className="p-7 flex flex-col gap-5">

                        {/* What this means */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">
                                What This Means
                            </p>
                            <div className="flex flex-col gap-2.5 p-4 rounded-2xl"
                                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                {[
                                    { icon: XCircle, label: "You cannot log in to SmartQueue services", ok: false },
                                    { icon: XCircle, label: "Token booking and queue access is disabled", ok: false },
                                    { icon: CheckCircle2, label: "Your token history remains intact", ok: true },
                                    { icon: CheckCircle2, label: "Suspension can be lifted by contacting support", ok: true },
                                ].map(({ icon: Ic, label, ok }) => (
                                    <div key={label} className="flex items-center gap-2.5">
                                        <Ic size={13} style={{ color: ok ? "#34d399" : "#f43f5e", flexShrink: 0 }} />
                                        <span className="text-[12.5px] text-white/50">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Account info */}
                        {email && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.45 }}
                                className="flex items-center gap-3 p-3.5 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                            >
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white/60 shrink-0"
                                    style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)" }}>
                                    {username?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[12px] font-semibold text-white/60 truncate">{username}</p>
                                    <p className="text-[11px] text-white/30 truncate">{email}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Appeal info */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="p-4 rounded-2xl flex items-start gap-3"
                            style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.15)" }}
                        >
                            <AlertCircle size={14} className="text-[#f43f5e] shrink-0 mt-0.5" />
                            <p className="text-[12px] text-white/45 leading-relaxed">
                                If you believe this was a mistake or would like to appeal, please contact our support team. We typically respond within 24 hours.
                            </p>
                        </motion.div>

                        {/* Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55 }}
                            className="flex flex-col gap-2.5"
                        >
                            <a
                                href="mailto:allinoneadmin4002@gmai.com?subject=Account%20Suspension%20Appeal"
                                className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
                                style={{ background: "#f43f5e", color: "#fff", textDecoration: "none" }}
                            >
                                <Mail size={15} /> Appeal Suspension
                            </a>

                            <Link
                                to="/support"
                                className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all hover:opacity-80"
                                style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.22)", color: "#f43f5e", textDecoration: "none" }}
                            >
                                <MessageSquare size={15} /> Contact Support <ExternalLink size={11} />
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all hover:bg-white/5"
                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)", fontFamily: "inherit", cursor: "pointer" }}
                            >
                                <LogOut size={15} /> Sign Out
                            </button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 text-[11px] text-white/20 text-center"
                >
                    SmartQueue Platform · allinoneadmin4002@gmai.com
                </motion.p>
            </div>
        </div>
    );
};

export default SuspendedUserPage;