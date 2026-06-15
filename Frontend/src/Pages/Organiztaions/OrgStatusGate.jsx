import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, XCircle, ShieldOff, Trash2, LogOut,
    Mail, ExternalLink, CheckCircle2, AlertCircle,
    Building2, ChevronRight, RefreshCw, CalendarX
} from 'lucide-react';
import { ImSpinner9 } from 'react-icons/im';
import AuthContext from '../../Context/Authentication/AuthContext';
import { Link } from 'react-router-dom';
import OrgContext from '../../Context/Organization/OrgContext';
import ReactivatedScreen from '../../Components/Orgs/ReactivatedScreen';

const API_URL = import.meta.env.VITE_API_URL;

/* ── Status config ─────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
    pending: {
        Icon: Clock,
        color: "#fbbf24",
        colorDim: "rgba(251,191,36,0.12)",
        colorBorder: "rgba(251,191,36,0.25)",
        glow: "rgba(251,191,36,0.08)",
        badge: "PENDING REVIEW",
        title: "Application Under Review",
        subtitle: "Your organization registration has been submitted and is currently being reviewed by our team.",
    },
    scheduled_for_deletion: {
        Icon: Trash2,
        color: "#f43f5e",
        colorDim: "rgba(244,63,94,0.12)",
        colorBorder: "rgba(244,63,94,0.25)",
        glow: "rgba(244,63,94,0.08)",
        badge: "SCHEDULED FOR DELETION",
        title: "Account Scheduled for Deletion",
        subtitle: "Your organization account has been scheduled for permanent deletion. Contact us immediately to cancel.",
    },
    rejected: {
        Icon: XCircle,
        color: "#f43f5e",
        colorDim: "rgba(244,63,94,0.12)",
        colorBorder: "rgba(244,63,94,0.25)",
        glow: "rgba(244,63,94,0.08)",
        badge: "APPLICATION REJECTED",
        title: "Application Not Approved",
        subtitle: "Your organization registration was reviewed but could not be approved at this time.",
    },
    suspended: {
        Icon: ShieldOff,
        color: "#f97316",
        colorDim: "rgba(249,115,22,0.12)",
        colorBorder: "rgba(249,115,22,0.25)",
        glow: "rgba(249,115,22,0.08)",
        badge: "ACCOUNT SUSPENDED",
        title: "Organization Suspended",
        subtitle: "Your organization account has been temporarily suspended by an administrator.",
    },
};

/* ── Animated blob ──────────────────────────────────────────────────────── */
const Blob = ({ style }) => (
    <div className="absolute rounded-full pointer-events-none" style={{ filter: "blur(80px)", ...style }} />
);

/* ── Progress step (for pending status) ────────────────────────────────── */
const Step = ({ n, label, done, active, color }) => (
    <div className="flex flex-col items-center gap-2 flex-1">
        <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 shrink-0"
            style={{
                background: done || active ? `${color}20` : "rgba(255,255,255,0.04)",
                border: `2px solid ${done || active ? color : "rgba(255,255,255,0.1)"}`,
                color: done || active ? color : "rgba(255,255,255,0.25)",
            }}
        >
            {done ? <CheckCircle2 size={16} /> : n}
        </div>
        <span className="text-[11px] text-center font-semibold"
            style={{ color: done || active ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)" }}>
            {label}
        </span>
    </div>
);

const StepConnector = ({ done, color }) => (
    <div className="flex-1 h-0.5 mb-5 mt-4 rounded-full transition-all duration-700"
        style={{ background: done ? color : "rgba(255,255,255,0.08)" }} />
);

/* ── Info row ───────────────────────────────────────────────────────────── */
const InfoRow = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
        <div className="flex items-center gap-2.5">
            <Icon size={13} style={{ color }} />
            <span className="text-[12px] text-white/40">{label}</span>
        </div>
        <span className="text-[12px] font-semibold text-white/70">{value}</span>
    </div>
);

/* ── Main component ─────────────────────────────────────────────────────── */
const OrgStatusGate = () => {
    const { userRole, orgId, logoutUser } = useContext(AuthContext);
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const { getOrganizationDetails } = useContext(OrgContext);

    // Fetch organization details on mount
    useEffect(() => {
        (async () => {
            if (!orgId) {
                setLoading(false);
                return;
            }

            setLoading(true);

            const result = await getOrganizationDetails(orgId);

            if (result.success) {
                setOrg(result.org);
            } else {
                console.error("Failed to fetch organization details:", result.error);
            }

            setLoading(false);
        })();
    }, [orgId, getOrganizationDetails]);

    // Handle logout
    const handleLogout = () => {
        try {
            if (typeof logoutUser === 'function')
                logoutUser();
        }
        catch (_) { }

        localStorage.clear();
        window.location.href = '/login';
    };

    // If the org is approved, show the reactivated screen
    if (org?.status === 'approved') {
        return <ReactivatedScreen orgName={org?.orgName} onLogout={handleLogout} />;
    }

    // Determine real status
    const rawStatus = org?.status || (
        userRole === 'rejected_org' ? 'rejected' :
            userRole === 'suspended_org' ? 'suspended' : 'pending'
    );

    console.log("Determined organization status:", rawStatus);

    const cfg = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.pending;
    const { Icon, color, colorDim, colorBorder, glow, badge, title, subtitle } = cfg;

    if (loading) return (
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#090e1a" }}>
            <div className="flex flex-col items-center gap-3">
                <ImSpinner9 className="animate-spin w-9 h-9 text-[#00C9A7]" />
                <p className="text-white/30 text-xs tracking-widest uppercase">Loading…</p>
            </div>
        </div>
    );

    const submittedDate = org?.createdAt
        ? new Date(org.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "—";

    const deletionDate = org?.deletionExpiredAt
        ? new Date(org.deletionExpiredAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
        : null;

    return (
        <div className="fixed inset-0 overflow-y-auto overflow-x-hidden" style={{ background: "#090e1a", fontFamily: "'serif','fangsong'" }}>

            {/* Background blobs */}
            <Blob style={{ top: "-10%", left: "-5%", width: 500, height: 500, background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }} />
            <Blob style={{ bottom: "-10%", right: "-5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(0,201,167,0.04) 0%, transparent 70%)" }} />
            <Blob style={{ top: "40%", right: "10%", width: 300, height: 300, background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }} />

            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />

            <div className="min-h-screen flex flex-col items-center justify-center p-4 py-8 md:p-6 md:py-12">

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-2.5 mb-10"
                >
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center font-extrabold text-[17px] text-black shrink-0"
                        style={{ background: "linear-gradient(135deg, #00C9A7, #4DA8DA)", fontFamily: "'Space Grotesk', sans-serif" }}>
                        Q
                    </div>
                    <span className="font-bold text-white text-xl">SmartQueue</span>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 28, stiffness: 280, delay: 0.1 }}
                    className="w-full max-w-[90%] md:max-w-[60%]"
                    style={{
                        background: "rgba(15,23,42,0.9)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 24,
                        backdropFilter: "blur(20px)",
                        boxShadow: `0 40px 80px rgba(0,0,0,0.4), 0 0 80px ${glow}`,
                    }}
                >
                    {/* Card header */}
                    <div className="p-7 border-b border-white/5 text-center">

                        {/* Badge */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.25, type: "spring" }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                            style={{ background: colorDim, border: `1px solid ${colorBorder}` }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, animation: "pulse 2s infinite" }} />
                            <span className="text-[10px] font-bold tracking-[1.8px] uppercase" style={{ color }}>{badge}</span>
                        </motion.div>

                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: "spring", damping: 18 }}
                            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5"
                            style={{ background: colorDim, border: `1px solid ${colorBorder}` }}
                        >
                            <Icon size={30} style={{ color }} />
                        </motion.div>

                        <h1 className="text-2xl font-black text-white mb-2">{title}</h1>
                        <p className="text-[14px] text-white/45 leading-relaxed">{subtitle}</p>
                    </div>

                    {/* Card body */}
                    <div className="p-7 flex flex-col gap-5">

                        {/* ── PENDING: Progress steps ───────────────────── */}
                        {rawStatus === 'pending' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">Application Progress</p>
                                <div className="flex items-start">
                                    <Step n="1" label="Submitted" done color={color} />
                                    <StepConnector done color={color} />
                                    <Step n="2" label="Under Review" active color={color} />
                                    <StepConnector done={false} color={color} />
                                    <Step n="3" label="Decision" color={color} />
                                </div>
                                <div className="mt-5 p-4 rounded-2xl" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.12)" }}>
                                    <div className="flex items-start gap-3">
                                        <Clock size={15} style={{ color, flexShrink: 0, marginTop: 1 }} />
                                        <div>
                                            <p className="text-[13px] font-semibold text-white/70 mb-1">Expected Timeline</p>
                                            <p className="text-[12px] text-white/40 leading-relaxed">
                                                Our team reviews applications within <strong className="text-white/60">1–2 business days</strong>. You'll receive an email notification with the outcome.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {org && (
                                    <div className="mt-4 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                        <InfoRow icon={Building2} label="Organization" value={org.orgName || "—"} color={color} />
                                        <InfoRow icon={Clock} label="Submitted On" value={submittedDate} color={color} />
                                        <InfoRow icon={Mail} label="Notification Email" value={org.email || "—"} color={color} />
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ── SCHEDULED FOR DELETION ───────────────────── */}
                        {rawStatus === 'scheduled_for_deletion' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                {deletionDate && (
                                    <div className="p-4 rounded-2xl mb-4"
                                        style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <CalendarX size={14} style={{ color }} />
                                            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color }}>Deletion Date</span>
                                        </div>
                                        <p className="text-xl font-extrabold" style={{ color }}>{deletionDate}</p>
                                        <p className="text-[12px] text-white/40 mt-1">Contact us immediately to cancel deletion and reactivate your account.</p>
                                    </div>
                                )}
                                <div className="flex flex-col gap-2 p-4 rounded-2xl"
                                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                    {[
                                        { icon: CheckCircle2, label: "Your data is temporarily preserved", ok: true },
                                        { icon: XCircle, label: "Queue services are deactivated", ok: false },
                                        { icon: XCircle, label: "Users cannot book tokens", ok: false },
                                        { icon: AlertCircle, label: "All data will be permanently deleted on the date shown", ok: false },
                                    ].map(({ icon: Ic, label, ok }) => (
                                        <div key={label} className="flex items-center gap-2.5">
                                            <Ic size={13} style={{ color: ok ? "#34d399" : color, flexShrink: 0 }} />
                                            <span className="text-[12px] text-white/50">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ── REJECTED ──────────────────────────────────── */}
                        {rawStatus === 'rejected' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                {(org?.rejectionReason) && (
                                    <div className="p-4 rounded-2xl mb-4"
                                        style={{ background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.18)" }}>
                                        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color }}>Reason for Rejection</p>
                                        <p className="text-[13px] text-white/60 leading-relaxed">{org.rejectionReason}</p>
                                    </div>
                                )}
                                <div className="p-4 rounded-2xl"
                                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">Next Steps</p>
                                    {[
                                        "Review the rejection reason carefully",
                                        "Gather correct and updated documents",
                                        "Ensure your GST & registration numbers match",
                                        "Submit a fresh registration application",
                                    ].map((step, i) => (
                                        <div key={i} className="flex items-start gap-3 mb-2.5 last:mb-0">
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                                                style={{ background: colorDim, color }}>
                                                {i + 1}
                                            </div>
                                            <span className="text-[12px] text-white/50 leading-relaxed">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ── SUSPENDED ─────────────────────────────────── */}
                        {rawStatus === 'suspended' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                {(org?.rejectionReason) && (
                                    <div className="p-4 rounded-2xl mb-4"
                                        style={{ background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.18)" }}>
                                        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color }}>Reason</p>
                                        <p className="text-[13px] text-white/60 leading-relaxed">{org.rejectionReason}</p>
                                    </div>
                                )}
                                <div className="p-4 rounded-2xl"
                                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">What This Means</p>
                                    {[
                                        { icon: XCircle, label: "Your queue services are paused", ok: false },
                                        { icon: XCircle, label: "Users cannot book new tokens", ok: false },
                                        { icon: CheckCircle2, label: "All your data remains safe", ok: true },
                                        { icon: CheckCircle2, label: "Suspension can be lifted by our admin team", ok: true },
                                    ].map(({ icon: Ic, label, ok }) => (
                                        <div key={label} className="flex items-center gap-2.5 mb-2 last:mb-0">
                                            <Ic size={13} style={{ color: ok ? "#34d399" : color, flexShrink: 0 }} />
                                            <span className="text-[12px] text-white/50">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ── Action buttons ────────────────────────────── */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55 }}
                            className="flex flex-col gap-2.5 pt-1"
                        >
                            {/* Re-register button for rejected */}
                            {rawStatus === 'rejected' && (
                                <a href="/organizations"
                                    className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
                                    style={{ background: color, color: "#000", textDecoration: "none" }}>
                                    <RefreshCw size={15} /> Register Again
                                </a>
                            )}

                            {/* Contact Support */}
                            <Link to="/support"
                                className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all hover:opacity-80"
                                style={{
                                    background: colorDim,
                                    border: `1px solid ${colorBorder}`,
                                    color,
                                    textDecoration: "none",
                                }}>
                                <Mail size={15} />
                                {rawStatus === 'scheduled_for_deletion' ? "Contact Us Urgently" : "Contact Support"}
                                <ExternalLink size={12} />
                            </Link>

                            {/* Logout */}
                            <button onClick={handleLogout}
                                className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all hover:bg-white/5"
                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)", fontFamily: "inherit", cursor: "pointer" }}>
                                <LogOut size={15} /> Sign Out
                            </button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Footer note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 text-[11px] text-white/20 text-center"
                >
                    SmartQueue Platform · support@smartqueue.app · v3.0.0
                </motion.p>
            </div>
        </div>
    );
};

export default OrgStatusGate;