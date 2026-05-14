import React, { useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ImSpinner9 } from 'react-icons/im';
import { Search, Trash2, ChevronDown, ChevronUp, Send, X, Paperclip, ExternalLink, Bug, Lightbulb } from 'lucide-react';
import SupportContext from '../../Context/Support/SupportContext';
import { BsInfoCircleFill } from 'react-icons/bs';
import DeleteConfirmation from '../DeleteConfirmation';

const TYPE_META = {
    bug: { label: "Bug", icon: <Bug size={12} />, color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)" },
    idea: { label: "Idea", icon: <Lightbulb size={12} />, color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)" },
};

const STATUS_META = {
    open: { color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)" },
    in_review: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)" },
    planned: { color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.25)" },
    resolved: { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)" },
    closed: { color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.25)" },
};

const PRIORITY_META = {
    low: { color: "#34d399", label: "Low" },
    medium: { color: "#fbbf24", label: "Medium" },
    high: { color: "#f97316", label: "High" },
    critical: { color: "#f43f5e", label: "Critical" },
};

const STATUSES = ["all", "open", "in_review", "planned", "resolved", "closed"];
const TYPES = ["all", "bug", "idea"];
const PRIORITIES = ["all", "low", "medium", "high", "critical"];

const useDebounce = (value, delay = 400) => {
    const [d, setD] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setD(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return d;
};

const ReportsPanel = ({ onStatsChange }) => {
    const { fetchAllReports, updateReport, deleteReport } = useContext(SupportContext);

    const [reports, setReports] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const [replyId, setReplyId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [replyStatus, setReplyStatus] = useState("in_review");

    const [search, setSearch] = useState("");
    const [typeF, setTypeF] = useState("all");
    const [statusF, setStatusF] = useState("all");
    const [priorityF, setPriorityF] = useState("all");

    const dSearch = useDebounce(search);

    const load = useCallback(async () => {
        setLoading(true);
        const result = await fetchAllReports({ search: dSearch, type: typeF, status: statusF, priority: priorityF, limit: 100 });
        if (result.success) { setReports(result.reports); setTotal(result.total); }
        setLoading(false);
    }, [dSearch, typeF, statusF, priorityF, fetchAllReports]);

    useEffect(() => { load(); }, [load]);

    const handleReply = async (id) => {
        if (!replyText.trim()) return;
        setActionId(id);
        const result = await updateReport(id, { status: replyStatus, adminResponse: replyText });
        if (result.success) {
            setReports(prev => prev.map(r => r._id === id ? { ...r, status: replyStatus, adminResponse: replyText } : r));
            toast.success("Response sent!", { theme: "colored" });
            setReplyId(null);
            setReplyText("");
            onStatsChange?.();
        } else {
            toast.error(result.error || "Failed to respond", { theme: "colored" });
        }
        setActionId(null);
    };

    // Delete flow with confirmation
    const proceedWithDelete = async (id, title) => {
        setActionId(id);
        
        const result = await deleteReport(id);
        if (result.success) {
            setReports(prev => prev.filter(r => r._id !== id));
            setTotal(t => t - 1);
            toast.warn("Report '" + title + "' has been deleted", { theme: "colored" });
            onStatsChange?.();
        } else {
            toast.error(result.error || "Failed to delete", { theme: "colored" });
        }
        setActionId(null);
    };

    const handleDelete = async (id, title) => {
        const toastId = toast.info(
            <div className='flex gap-1 items-start'>
                <div className='text-xl mt-3 shrink-0'><BsInfoCircleFill /></div>
                <DeleteConfirmation
                    message="Are you sure you want to delete this report? This action cannot be undone."
                    onCancel={() => toast.dismiss(toastId)}
                    onConfirm={() => { toast.dismiss(toastId); proceedWithDelete(id, title); }}
                />
            </div>,
            {
                icon: false, position: 'top-center', autoClose: false,
                closeOnClick: false, draggable: false,
                style: { width: '95vw', maxWidth: '550px', borderRadius: '15px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderBottom: '4px solid #707c7c', margin: '0 auto' }
            }
        )
    };

    const selectStyle = {
        background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, padding: "6px 10px", fontSize: 12, color: "rgba(255,255,255,0.7)",
        outline: "none", cursor: "pointer", fontFamily: "'serif','fangsong'",
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Filters */}
            <div className="glass rounded-2xl p-4 flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 flex-1 min-w-45 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
                    <Search size={14} className="text-white/30 shrink-0" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search reports…"
                        className="bg-transparent border-none outline-none text-sm text-white/80 placeholder:text-white/25 w-full"
                        style={{ fontFamily: "'serif','fangsong'" }} />
                </div>
                <select value={typeF} onChange={e => setTypeF(e.target.value)} style={selectStyle}>
                    {TYPES.map(t => <option key={t} value={t} style={{ background: "#1e293b" }}>{t === "all" ? "All Types" : t === "bug" ? "🐛 Bugs" : "💡 Ideas"}</option>)}
                </select>
                <select value={statusF} onChange={e => setStatusF(e.target.value)} style={selectStyle}>
                    {STATUSES.map(s => <option key={s} value={s} style={{ background: "#1e293b" }}>{s === "all" ? "All Statuses" : s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                </select>
                <select value={priorityF} onChange={e => setPriorityF(e.target.value)} style={selectStyle}>
                    {PRIORITIES.map(p => <option key={p} value={p} style={{ background: "#1e293b" }}>{p === "all" ? "All Priorities" : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
                <span className="text-xs text-white/30 ml-auto">{total} result{total !== 1 ? "s" : ""}</span>
            </div>

            {/* Table */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="hidden md:grid px-5 py-2.5 text-[11px] text-white/30 uppercase tracking-widest font-semibold border-b border-white/6"
                    style={{ gridTemplateColumns: "1fr 80px 110px 100px 120px 180px", fontFamily: "'serif','fangsong'" }}>
                    <span>Report</span><span>Type</span><span>Category</span><span>Priority</span><span>Status</span><span>Actions</span>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <ImSpinner9 className="animate-spin h-8 w-8 text-[#00C9A7]" />
                            <p className="text-white/25 text-xs tracking-widest uppercase">Loading reports…</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-12 text-white/35 text-sm" style={{ fontFamily: "'serif'" }}>
                            No reports match your filters
                        </div>
                    ) : (
                        reports.map((rep, i) => {
                            const tm = TYPE_META[rep.type] || TYPE_META.bug;
                            const sm = STATUS_META[rep.status] || STATUS_META.open;
                            const pm = PRIORITY_META[rep.priority] || PRIORITY_META.medium;
                            const isExpanded = expanded === rep._id;
                            const isReplying = replyId === rep._id;
                            const isBusy = actionId === rep._id;
                            const date = new Date(rep.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

                            return (
                                <div key={rep._id} style={{ animation: `fadeIn .3s ${i * 0.03}s both`, fontFamily: "'serif','fangsong'" }}
                                    className="border-b border-white/4 last:border-0">
                                    <div className="flex flex-col md:grid px-5 py-3.5 gap-3 md:gap-0 items-start md:items-center"
                                        style={{ gridTemplateColumns: "1fr 80px 110px 100px 120px 180px" }}>
                                        {/* Title & submitter */}
                                        <div className="min-w-0">
                                            <div className="text-[14px] font-semibold text-white truncate">{rep.title}</div>
                                            <div className="text-[11px] text-white/35 truncate">{rep.submitterName} · {date}</div>
                                        </div>
                                        {/* Type */}
                                        <div className="inline-flex items-center gap-1 px-2 py-1 mr-3 rounded-lg text-[11px] font-bold"
                                            style={{ background: tm.bg, border: `1px solid ${tm.border}`, color: tm.color }}>
                                            {tm.icon} {tm.label}
                                        </div>
                                        {/* Category */}
                                        <div className="text-[12px] text-white/50">{rep.category}</div>
                                        {/* Priority */}
                                        <div className="text-[12px] font-bold" style={{ color: pm.color }}>{pm.label}</div>
                                        {/* Status */}
                                        <div className="inline-flex px-2.5 py-1 mr-4 rounded-lg text-[11px] font-bold uppercase tracking-wider"
                                            style={{ background: sm.bg, border: `1px solid ${sm.border}`, color: sm.color }}>
                                            {rep.status.replace("_", " ")}
                                        </div>
                                        {/* Actions */}
                                        <div className="flex gap-1.5 flex-wrap">
                                            <button onClick={() => { setExpanded(isExpanded ? null : rep._id); setReplyId(null); }}
                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-400 flex items-center gap-1 cursor-pointer"
                                                style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)" }}>
                                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />} View
                                            </button>
                                            <button onClick={() => { setReplyId(isReplying ? null : rep._id); setExpanded(rep._id); setReplyText(rep.adminResponse || ""); setReplyStatus(rep.status === "open" ? "in_review" : rep.status); }}
                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#00C9A7] flex items-center gap-1 cursor-pointer"
                                                style={{ background: "rgba(0,201,167,0.1)", border: "1px solid rgba(0,201,167,0.25)" }}>
                                                <Send size={11} /> Reply
                                            </button>
                                            <button onClick={() => handleDelete(rep._id, rep.title)} disabled={isBusy}
                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-400 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                                                style={{ background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.2)" }}>
                                                {isBusy ? <ImSpinner9 className="animate-spin" /> : <Trash2 size={11} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 border-t border-white/5" style={{ animation: "fadeUp .2s both" }}>
                                            {/* Description */}
                                            <div className="mt-4 p-4 rounded-xl bg-white/3 border border-white/6">
                                                <p className="text-xs text-white/30 uppercase tracking-widest font-bold mb-2">Description</p>
                                                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{rep.description}</p>
                                            </div>

                                            {/* Attachments */}
                                            {rep.attachments?.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {rep.attachments.map((att, j) => (
                                                        <a key={j} href={att.url} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:opacity-80 transition-opacity"
                                                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none" }}>
                                                            <Paperclip size={12} className="text-white/40" />
                                                            <span className="text-xs text-white/60 max-w-37.5 truncate">{att.name}</span>
                                                            <ExternalLink size={10} className="text-white/30" />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Admin response */}
                                            {rep.adminResponse && (
                                                <div className="mt-3 p-4 rounded-xl border" style={{ background: "rgba(0,201,167,0.04)", borderColor: "rgba(0,201,167,0.15)" }}>
                                                    <p className="text-xs text-[#00C9A7] uppercase tracking-widest font-bold mb-2">Our Response</p>
                                                    <p className="text-sm text-white/60 leading-relaxed">{rep.adminResponse}</p>
                                                </div>
                                            )}

                                            {/* Reply form */}
                                            {isReplying && (
                                                <div className="mt-3 flex flex-col gap-3">
                                                    <select value={replyStatus} onChange={e => setReplyStatus(e.target.value)}
                                                        className="w-fit bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-sm text-white/70 outline-none"
                                                        style={{ fontFamily: "'serif','fangsong'", background: "#1e293b" }}>
                                                        {STATUSES.filter(s => s !== "all").map(s => (
                                                            <option key={s} value={s} style={{ background: "#1e293b" }}>
                                                                {s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <textarea rows={3} value={replyText} onChange={e => setReplyText(e.target.value)}
                                                        placeholder="Write your response…"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 outline-none resize-none focus:border-[#00C9A7]/50 transition-colors"
                                                        style={{ fontFamily: "'serif','fangsong'" }} />
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleReply(rep._id)} disabled={isBusy || !replyText.trim()}
                                                            className="px-5 py-2 rounded-xl text-sm font-bold text-black flex items-center gap-2 disabled:opacity-50"
                                                            style={{ background: "#00C9A7" }}>
                                                            {isBusy ? <ImSpinner9 className="animate-spin" /> : <Send size={13} />}
                                                            {isBusy ? "Sending…" : "Send Response"}
                                                        </button>
                                                        <button onClick={() => setReplyId(null)}
                                                            className="px-4 py-2 rounded-xl text-sm font-semibold text-white/40 flex items-center gap-1"
                                                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                                            <X size={13} /> Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsPanel;