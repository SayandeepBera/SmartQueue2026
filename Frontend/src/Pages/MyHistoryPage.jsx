import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImSpinner9 } from 'react-icons/im';
import {
    MessageSquare, Bug, Lightbulb, Clock, CheckCircle2,
    AlertCircle, RefreshCw, Paperclip, ExternalLink, ChevronDown, ChevronUp,
    Inbox, FileText
} from 'lucide-react';
import SupportContext from '../Context/Support/SupportContext';
import AuthContext from '../Context/Authentication/AuthContext';

/* ── Status config ──────────────────────────────────────────────────────────── */
const INQUIRY_STATUS = {
    open: { label: "Open", color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)", icon: <AlertCircle size={12} /> },
    "in-progress": { label: "In Progress", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)", icon: <RefreshCw size={12} /> },
    resolved: { label: "Resolved", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)", icon: <CheckCircle2 size={12} /> },
};

const REPORT_STATUS = {
    open: { label: "Open", color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)" },
    in_review: { label: "In Review", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)" },
    planned: { label: "Planned", color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.25)" },
    resolved: { label: "Resolved", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)" },
    closed: { label: "Closed", color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.25)" },
};

const PRIORITY_META = {
    low: { color: "#34d399", label: "Low" },
    medium: { color: "#fbbf24", label: "Medium" },
    high: { color: "#f97316", label: "High" },
    critical: { color: "#f43f5e", label: "Critical" },
};

const TABS = [
    { id: "all", label: "All", icon: <Inbox size={14} /> },
    { id: "inquiries", label: "Inquiries", icon: <MessageSquare size={14} /> },
    { id: "bugs", label: "Bug Reports", icon: <Bug size={14} /> },
    { id: "ideas", label: "Feature Ideas", icon: <Lightbulb size={14} /> },
];

const formatDate = (str) => {
    try {
        return new Date(str).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch { return ""; }
};

const formatTime = (str) => {
    try {
        return new Date(str).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
};

/* ── Individual card ──────────────────────────────────────────────────────── */
const HistoryCard = ({ item, type }) => {
    const [expanded, setExpanded] = useState(false);

    const isInquiry = type === "inquiry";
    const isBug = type === "bug";
    const isIdea = type === "idea";

    const statusMeta = isInquiry
        ? (INQUIRY_STATUS[item.status] || INQUIRY_STATUS.open)
        : (REPORT_STATUS[item.status] || REPORT_STATUS.open);

    const hasResponse = !!(isInquiry ? item.adminResponse : item.adminResponse);

    const accentColor = isBug ? "#f97316" : isIdea ? "#fbbf24" : "#a78bfa";
    const accentBg = isBug ? "rgba(249,115,22,0.06)" : isIdea ? "rgba(251,191,36,0.06)" : "rgba(167,139,250,0.06)";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${accentColor}18`, fontFamily: "'serif','fangsong'" }}
        >
            {/* Card header */}
            <div className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Left: type badge + title */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: accentBg, border: `1px solid ${accentColor}25` }}>
                            {isInquiry ? <MessageSquare size={16} style={{ color: accentColor }} />
                                : isBug ? <Bug size={16} style={{ color: accentColor }} />
                                    : <Lightbulb size={16} style={{ color: accentColor }} />}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest"
                                    style={{ color: accentColor }}>
                                    {isInquiry ? "Inquiry" : isBug ? "Bug Report" : "Feature Idea"}
                                </span>
                                {!isInquiry && item.priority && (
                                    <span className="text-[10px] font-bold"
                                        style={{ color: PRIORITY_META[item.priority]?.color || "#fbbf24" }}>
                                        · {PRIORITY_META[item.priority]?.label}
                                    </span>
                                )}
                                {item.category && (
                                    <span className="text-[10px] text-white/30 font-medium">· {item.category}</span>
                                )}
                            </div>
                            <h3 className="text-[15px] font-bold text-white/90 leading-snug">
                                {isInquiry ? item.message?.slice(0, 80) + (item.message?.length > 80 ? "…" : "") : item.title}
                            </h3>
                            <p className="text-[11px] text-white/30 mt-1">
                                {formatDate(item.createdAt)} at {formatTime(item.createdAt)}
                            </p>
                        </div>
                    </div>

                    {/* Right: status + response indicator */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider"
                            style={{ background: statusMeta.bg, border: `1px solid ${statusMeta.border}`, color: statusMeta.color }}>
                            {statusMeta.icon && <span>{statusMeta.icon}</span>}
                            {statusMeta.label}
                        </span>
                        {hasResponse && (
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 size={10} /> Response received
                            </span>
                        )}
                    </div>
                </div>

                {/* Expand toggle */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1.5 mt-4 text-xs text-white/35 hover:text-white/60 transition-colors"
                    style={{ fontFamily: "inherit", background: "none", border: "none", cursor: "pointer" }}
                >
                    {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {expanded ? "Show less" : "Show details"}
                </button>
            </div>

            {/* Expanded content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        style={{ overflow: "hidden" }}
                    >
                        <div className="px-5 pb-5 border-t border-white/5 pt-4 flex flex-col gap-4">

                            {/* Original message / description */}
                            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2">
                                    {isInquiry ? "Your Message" : "Description"}
                                </p>
                                <p className="text-[13px] text-white/60 leading-relaxed whitespace-pre-line">
                                    {isInquiry ? item.message : item.description}
                                </p>
                            </div>

                            {/* Attachments (reports only) */}
                            {!isInquiry && item.attachments?.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2">
                                        Attachments ({item.attachments.length})
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {item.attachments.map((att, i) => (
                                            <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:opacity-80 transition-opacity"
                                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none" }}>
                                                {att.format?.match(/jpg|jpeg|png|gif|webp/) ? (
                                                    <img src={att.url} alt={att.name} className="w-5 h-5 rounded object-cover" />
                                                ) : (
                                                    <FileText size={14} className="text-blue-300" />
                                                )}
                                                <span className="text-xs text-white/60 max-w-30 truncate">{att.name}</span>
                                                <ExternalLink size={10} className="text-white/30 shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Admin response */}
                            {hasResponse ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ background: "rgba(0,201,167,0.06)", border: "1px solid rgba(0,201,167,0.2)", borderRadius: 12, padding: "16px 18px" }}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-full bg-[#00C9A7] flex items-center justify-center text-[9px] font-bold text-black">SQ</div>
                                        <div>
                                            <p className="text-[12px] font-bold text-[#00C9A7]">SmartQueue Support</p>
                                            {item.respondedAt && (
                                                <p className="text-[10px] text-white/25">{formatDate(item.respondedAt)} at {formatTime(item.respondedAt)}</p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[13px] text-white/75 leading-relaxed">{item.adminResponse}</p>
                                </motion.div>
                            ) : (
                                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 18px" }}
                                    className="flex items-center gap-3">
                                    <Clock size={16} className="text-white/20 shrink-0" />
                                    <p className="text-[12px] text-white/30">
                                        {item.status === "resolved" || item.status === "closed"
                                            ? "This has been resolved by our team."
                                            : "Awaiting response from our support team…"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

/* ── Empty state ──────────────────────────────────────────────────────────── */
const EmptyState = ({ label }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
    >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Inbox size={28} className="text-white/20" />
        </div>
        <h3 className="text-base font-bold text-white/40 mb-1">No {label} yet</h3>
        <p className="text-sm text-white/25 max-w-xs">
            When you submit inquiries, bug reports, or feature ideas, they'll appear here along with any responses from our team.
        </p>
    </motion.div>
);

/* ── Main Component ───────────────────────────────────────────────────────── */
const MyHistoryPage = () => {
    const { fetchMyInquiries, fetchMyReports } = useContext(SupportContext);
    const { userRole } = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState("all");
    const [inquiries, setInquiries] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const [inqResult, repResult] = await Promise.all([
                fetchMyInquiries(),
                fetchMyReports(),
            ]);
            if (inqResult.success) setInquiries(inqResult.inquiries);
            if (repResult.success) setReports(repResult.reports);
            setLoading(false);
        })();
    }, []);

    // Combine and sort all items for "All" tab
    const allItems = [
        ...inquiries.map(i => ({ ...i, _type: "inquiry" })),
        ...reports.filter(r => r.type === "bug").map(r => ({ ...r, _type: "bug" })),
        ...reports.filter(r => r.type === "idea").map(r => ({ ...r, _type: "idea" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const bugs = reports.filter(r => r.type === "bug");
    const ideas = reports.filter(r => r.type === "idea");

    const displayItems = {
        all: allItems,
        inquiries: inquiries.map(i => ({ ...i, _type: "inquiry" })),
        bugs: bugs.map(r => ({ ...r, _type: "bug" })),
        ideas: ideas.map(r => ({ ...r, _type: "idea" })),
    }[activeTab] || [];

    const counts = {
        all: allItems.length,
        inquiries: inquiries.length,
        bugs: bugs.length,
        ideas: ideas.length,
    };

    const pendingResponses = allItems.filter(i => !i.adminResponse && i.status !== "resolved" && i.status !== "closed").length;
    const resolvedCount = allItems.filter(i => i.status === "resolved").length;

    const LABEL_MAP = { all: "submissions", inquiries: "inquiries", bugs: "bug reports", ideas: "feature ideas" };

    return (
        <div className="flex flex-col relative top-25 px-6 gap-6" style={{ animation: "fadeUp .4s both", fontFamily: "'serif','fangsong'" }}>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-2xl font-black text-white mb-1">My Support History</h2>
                    <p className="text-sm text-white/40">
                        Track all your inquiries, bug reports, and feature ideas — along with responses from our team.
                    </p>
                </div>
                {/* Stats strip */}
                <div className="flex gap-3 flex-wrap">
                    {[
                        { label: "Total", value: allItems.length, color: "#a78bfa" },
                        { label: "Pending", value: pendingResponses, color: "#f97316" },
                        { label: "Resolved", value: resolvedCount, color: "#34d399" },
                    ].map(s => (
                        <div key={s.label} className="glass rounded-xl px-4 py-2.5 text-center min-w-17.5">
                            <div className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                            <div className="text-[10px] text-white/35 uppercase tracking-wider">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tab bar */}
            <div className="glass rounded-2xl p-1.5 flex gap-1 w-fit flex-wrap">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all relative"
                        style={{
                            background: activeTab === tab.id ? "rgba(0,201,167,0.12)" : "transparent",
                            border: `1px solid ${activeTab === tab.id ? "rgba(0,201,167,0.3)" : "transparent"}`,
                            color: activeTab === tab.id ? "#00C9A7" : "rgba(255,255,255,0.4)",
                            fontFamily: "inherit",
                        }}>
                        <span style={{ color: activeTab === tab.id ? "#00C9A7" : "rgba(255,255,255,0.25)" }}>{tab.icon}</span>
                        {tab.label}
                        {counts[tab.id] > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                    background: activeTab === tab.id ? "rgba(0,201,167,0.2)" : "rgba(255,255,255,0.08)",
                                    color: activeTab === tab.id ? "#00C9A7" : "rgba(255,255,255,0.4)",
                                }}>
                                {counts[tab.id]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <ImSpinner9 className="animate-spin h-8 w-8 text-[#00C9A7]" />
                    <p className="text-white/25 text-xs tracking-widest uppercase">Loading your history…</p>
                </div>
            ) : displayItems.length === 0 ? (
                <EmptyState label={LABEL_MAP[activeTab]} />
            ) : (
                <div className="flex flex-col gap-3">
                    <AnimatePresence mode="popLayout">
                        {displayItems.map((item) => (
                            <HistoryCard
                                key={`${item._type}-${item._id}`}
                                item={item}
                                type={item._type}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default MyHistoryPage;