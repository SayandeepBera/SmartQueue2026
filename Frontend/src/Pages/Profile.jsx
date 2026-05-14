// Pages/Profile.jsx
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
    LuUserRound, LuMail, LuPhone, LuMapPin,
    LuCalendar, LuShield, LuBuilding2, LuBadgeCheck,
    LuTrendingUp, LuPencil, LuKey, LuUsers
} from "react-icons/lu";
import { MdOutlineArrowCircleLeft } from "react-icons/md";
import { ImSpinner9 } from "react-icons/im";
import ProfileContext from "../Context/Profile/ProfileContext";
import AuthContext from "../Context/Authentication/AuthContext";
import InfoRow from "../Hooks/InfoRow";
import StatBox from "../Hooks/StatBox";
import Section from "../Hooks/Section";
import Avatar from "../Hooks/Avatar";
import OrgStatusBanner from "../Hooks/OrgStatusBanner";

/* ─── constants ─────────────────────────────────────────────────────── */
const ROLE_META = {
    user: { label: "User", color: "#00C9A7", bg: "rgba(0,201,167,0.1)", border: "rgba(0,201,167,0.25)" },
    pending_org: { label: "Org · Pending", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)" },
    approved_org: { label: "Org · Approved", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)" },
    rejected_org: { label: "Org · Rejected", color: "#f43f5e", bg: "rgba(244,63,94,0.1)", border: "rgba(244,63,94,0.25)" },
    suspended_org: { label: "Org · Suspended", color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)" },
    suspended_user: { label: "Suspended", color: "#f43f5e", bg: "rgba(244,63,94,0.1)", border: "rgba(244,63,94,0.25)" },
    admin: { label: "Super Admin", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)" },
};

const fmt = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const Profile = () => {
    const { getMyProfile, profileData } = useContext(ProfileContext);
    const { userRole, userId } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);

    // Fetch profile
    useEffect(() => {
        (async () => {
            const result = await getMyProfile(userId);

            if (!result.success) {
                toast.error(result.error, { theme: "colored" });
            }

            setLoading(false);
        })();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A]/80">
            <ImSpinner9 className="animate-spin text-[#00C9A7] text-3xl" />
        </div>
    );

    const { user, profile, org } = profileData || {};
    if (!user) return null;

    const roleMeta = ROLE_META[user.role] || ROLE_META.user;
    const isOrgRole = ["pending_org", "approved_org", "rejected_org", "suspended_org"].includes(user.role);
    const isAdmin = user.role === "admin";

    const fullAddress = org
        ? [org.address, org.area, org.city, org.state, org.pincode].filter(Boolean).join(", ")
        : null;

    const fadeUp = (delay = 0) => ({
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
    });

    return (
        <div className="min-h-screen pt-28 pb-16 px-4 bg-[#0F172A]/80"
            style={{ fontFamily: "'fangsong'" }}>

            {/* Back to dasboard button */}
            <div className="inline-block">
                <Link to="/" className="flex items-center gap-1 text-sm text-white/50 mb-6 ml-7 transition-all hover:text-white">
                    <MdOutlineArrowCircleLeft className="text-2xl" /> Back to dashboard
                </Link>
            </div>

            {/* Ambient blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute rounded-full"
                    style={{
                        top: "-10%", left: "-5%", width: 500, height: 500, opacity: 0.065,
                        background: "radial-gradient(circle,#00C9A7,transparent 65%)",
                        animation: "blobA 18s ease-in-out infinite"
                    }} />
                <div className="absolute rounded-full"
                    style={{
                        bottom: "-8%", right: "-5%", width: 420, height: 420, opacity: 0.055,
                        background: "radial-gradient(circle,#845EC2,transparent 65%)",
                        animation: "blobB 22s ease-in-out infinite"
                    }} />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-6">

                {/* Org status banner */}
                {isOrgRole && org && (
                    <OrgStatusBanner status={org.status} reason={org.rejectionReason} />
                )}

                {/* ── Hero card ────────────────────────────────────────── */}
                <motion.div {...fadeUp(0)} className="rounded-3xl overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.09)" }}>

                    {/* Cover */}
                    <div className="h-28 relative"
                        style={{ background: `linear-gradient(135deg,${roleMeta.color}28,rgba(255,255,255,0.02) 70%)` }}>
                        <div className="absolute inset-0 opacity-[0.04]"
                            style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
                    </div>

                    <div className="px-6 pb-6">
                        {/* Avatar + action buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-5">
                            <Avatar user={user} profile={profile} />
                            <div className="flex gap-2.5 sm:mb-1">
                                <Link to="/editprofile"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white/70 transition-all hover:text-white active:scale-95"
                                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                    <LuPencil size={14} /> Edit Profile
                                </Link>
                                <Link to="/editprofile?tab=security"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                                    style={{ background: `${roleMeta.color}15`, border: `1px solid ${roleMeta.color}30`, color: roleMeta.color }}>
                                    <LuKey size={14} /> Security
                                </Link>
                            </div>
                        </div>

                        {/* Name, username, badges */}
                        <div className="mb-4">
                            <div className="flex items-center gap-2.5 flex-wrap mb-1">
                                <h1 className="text-xl font-extrabold text-white"
                                    style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                                    {profile?.fullName || user.username}
                                </h1>
                                {isAdmin && <LuBadgeCheck size={18} className="text-[#a78bfa]" />}
                                {isOrgRole && org?.status === "approved" && <LuBadgeCheck size={18} className="text-[#34d399]" />}
                            </div>
                            <p className="text-sm text-white/38 mb-3 font-mono">@{user.username}</p>

                            <div className="flex flex-wrap gap-2">
                                <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                                    style={{ background: roleMeta.bg, border: `1px solid ${roleMeta.border}`, color: roleMeta.color }}>
                                    {roleMeta.label}
                                </span>
                                {isOrgRole && org?.plan && (
                                    <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                                        style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}>
                                        {org.plan} Plan
                                    </span>
                                )}
                                {profile?.gender && (
                                    <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}>
                                        {profile.gender}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Bio */}
                        {profile?.bio && (
                            <p className="text-sm text-white/50 leading-relaxed mb-4 max-w-xl">{profile.bio}</p>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatBox value={new Date(user.createdAt).getFullYear()} label="Member since" color={roleMeta.color} />
                            {!isOrgRole && !isAdmin && (
                                <StatBox value={profile?.totalTokens ?? 0} label="Tokens booked" color="#00C9A7" />
                            )}
                            {isOrgRole && org && (
                                <>
                                    <StatBox value={org.plan || "Free"} label="Current plan" color="#fbbf24" />
                                    <StatBox value={`${org.workStart || "09:00"}–${org.workEnd || "18:00"}`} label="Working hours" color="#4DA8DA" />
                                </>
                            )}
                            {isAdmin && (
                                <StatBox value="Full" label="Access level" color="#a78bfa" />
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ── Personal info ──────────────────────────────────────── */}
                <motion.div {...fadeUp(0.08)}>
                    <Section title="Personal Information" icon={LuUserRound}>
                        {/* From profile collection */}
                        <InfoRow icon={LuUserRound} label="Full Name" value={profile?.fullName} />
                        <InfoRow icon={LuUsers} label="Gender" value={profile?.gender} />
                        <InfoRow icon={LuPhone} label="Phone" value={profile?.phone} />
                        <InfoRow icon={LuMapPin} label="City" value={profile?.city} />
                        <InfoRow icon={LuMapPin} label="State" value={profile?.state} />
                        {/* From user collection */}
                        <InfoRow icon={LuMail} label="Email" value={user.email} />
                        <InfoRow icon={LuCalendar} label="Joined" value={fmt(user.createdAt)} />
                        <InfoRow icon={LuShield} label="Role" value={roleMeta.label} />
                    </Section>
                </motion.div>

                {/* ── Organisation info (org roles only) ────────────────── */}
                {isOrgRole && org && (<>
                    <motion.div {...fadeUp(0.14)}>
                        <Section title="Organisation Details" icon={LuBuilding2}>
                            <InfoRow icon={LuBuilding2} label="Organisation Name" value={org.orgName} />
                            <InfoRow icon={LuBuilding2} label="Short Name" value={org.shortName} />
                            <InfoRow icon={LuBuilding2} label="Type" value={org.orgType} />
                            <InfoRow icon={LuCalendar} label="Established" value={org.estYear ? String(org.estYear) : null} />
                            <InfoRow icon={LuMail} label="Org Email" value={org.email} />
                            <InfoRow icon={LuPhone} label="Org Phone" value={org.phone} />
                            <InfoRow icon={LuUserRound} label="Admin Contact" value={org.adminName} />
                            <InfoRow icon={LuUserRound} label="Designation" value={org.designation} />
                        </Section>
                    </motion.div>

                    {/* Full address */}
                    {fullAddress && (
                        <motion.div {...fadeUp(0.18)}
                            className="flex items-start gap-3 px-5 py-4 rounded-2xl"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <LuMapPin size={16} className="text-[#00C9A7] shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] text-white/28 uppercase tracking-widest font-bold mb-0.5">Full Address</p>
                                <p className="text-sm text-white/65">{fullAddress}</p>
                            </div>
                        </motion.div>
                    )}
                </>)}

                {/* ── Admin panel ────────────────────────────────────────── */}
                {isAdmin && (
                    <motion.div {...fadeUp(0.14)}>
                        <Section title="Admin Information" icon={LuShield}>
                            <InfoRow icon={LuShield} label="Access Level" value="Super Admin — Full platform control" />
                            <InfoRow icon={LuCalendar} label="Account Since" value={fmt(user.createdAt)} />
                            <InfoRow icon={LuTrendingUp} label="Dashboard" value="Accessible via sidebar navigation" />
                        </Section>
                    </motion.div>
                )}

            </div>
        </div>
    );
}

export default Profile