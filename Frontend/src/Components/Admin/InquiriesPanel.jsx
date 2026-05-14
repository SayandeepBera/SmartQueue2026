import React, { useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ImSpinner9 } from 'react-icons/im';
import { Search, Trash2, ChevronDown, ChevronUp, Send, X } from 'lucide-react';
import SupportContext from '../../Context/Support/SupportContext';
import DeleteConfirmation from '../DeleteConfirmation';
import { BsInfoCircleFill } from 'react-icons/bs';

const STATUS_COLORS = {
    "Open": { bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)", text: "#f97316" },
    "In Progress": { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", text: "#fbbf24" },
    "Resolved": { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", text: "#34d399" },
};

const CATEGORY_COLORS = {
    "General": "#a78bfa",
    "Token Booking": "#00C9A7",
    "Organization Registration": "#60a5fa",
    "Technical Issue": "#f43f5e",
    "Billing & Plans": "#fbbf24",
    "Other": "#94a3b8",
};

const useDebounce = (value, delay = 400) => {
    const [d, setD] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setD(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return d;
};

const InquiriesPanel = ({ onStatsChange }) => {
    const { fetchInquiries, updateInquiryStatus, deleteInquiry } = useContext(SupportContext);

    const [inquiries, setInquiries] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const [replyId, setReplyId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [replyStatus, setReplyStatus] = useState("In Progress");

    const [search, setSearch] = useState("");
    const [statusF, setStatusF] = useState("all");
    const [categoryF, setCategoryF] = useState("all");

    const dSearch = useDebounce(search, 400);

    // Load inquiries with current filters
    const load = useCallback(async () => {
        setLoading(true);
        const result = await fetchInquiries({ search: dSearch, status: statusF, category: categoryF, limit: 100 });
        if (result.success) {
            setInquiries(result.inquiries);
            setTotal(result.total);
        }
        setLoading(false);
    }, [dSearch, statusF, categoryF, fetchInquiries]);

    useEffect(() => { load(); }, [load]);

    // Handle reply submission
    const handleReply = async (id) => {
        if (!replyText.trim()) return;
        setActionId(id);
        const result = await updateInquiryStatus(id, { status: replyStatus, adminResponse: replyText });
        if (result.success) {
            setInquiries(prev => prev.map(i => i._id === id
                ? { ...i, status: replyStatus, adminResponse: replyText }
                : i
            ));
            toast.success("Reply sent!", { theme: "colored" });
            setReplyId(null);
            setReplyText("");
            onStatsChange?.();
        } else {
            toast.error(result.error || "Failed to send reply", { theme: "colored" });
        }
        setActionId(null);
    };

    // Delete flow without confirmation (used internally after confirmation)
    const proceedWithDelete = async (id, name) => {
        setActionId(id);
        
        const result = await deleteInquiry(id);
        
        if (result.success) {
            setInquiries(prev => prev.filter(i => i._id !== id));
            setTotal(t => t - 1);
            toast.warn("Inquiry '" + name + "' has been deleted", { theme: "colored" });
            onStatsChange?.();
        } else {
            toast.error(result.error || "Failed to delete", { theme: "colored" });
        }
        setActionId(null);
    };

    const handleDelete = async (id, name) => {
        const toastId = toast.info(
            <div className='flex gap-1 items-start'>
                <div className='text-xl mt-3 shrink-0'><BsInfoCircleFill /></div>
                <DeleteConfirmation
                    message="Are you sure you want to delete this inquiry? This action cannot be undone."
                    onCancel={() => toast.dismiss(toastId)}
                    onConfirm={() => { toast.dismiss(toastId); proceedWithDelete(id, name); }}
                />
            </div>,
            {
                icon: false, position: 'top-center', autoClose: false,
                closeOnClick: false, draggable: false,
                style: { width: '95vw', maxWidth: '550px', borderRadius: '15px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderBottom: '4px solid #707c7c', margin: '0 auto' }
            }
        );
    };

    const STATUSES = ["all", "Open", "In Progress", "Resolved"];
    const CATEGORIES = ["all", "General", "Token Booking", "Organization Registration", "Technical Issue", "Billing & Plans", "Other"];

    return (
        <div className="flex flex-col gap-4">
            {/* Filters */}
            <div className="glass rounded-2xl p-4 flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 flex-1 min-w-45 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
                    <Search size={14} className="text-white/30 shrink-0" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search inquiries…"
                        className="bg-transparent border-none outline-none text-sm text-white/80 placeholder:text-white/25 w-full"
                        style={{ fontFamily: "'serif', 'fangsong'" }}
                    />
                </div>

                {[
                    { value: statusF, setValue: setStatusF, options: STATUSES, label: "Status" },
                    { value: categoryF, setValue: setCategoryF, options: CATEGORIES, label: "Category" },
                ].map(({ value, setValue, options, label }) => (
                    <select key={label}
                        value={value} onChange={e => setValue(e.target.value)}
                        className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-sm text-white/70 outline-none cursor-pointer"
                        style={{ fontFamily: "'serif', 'fangsong'", background: "#1e293b" }}
                    >
                        {options.map(o => <option key={o} value={o} style={{ background: "#1e293b" }}>{o === "all" ? `All ${label}s` : o}</option>)}
                    </select>
                ))}

                <span className="text-xs text-white/30 ml-auto">{total} result{total !== 1 ? "s" : ""}</span>
            </div>

            {/* Table */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="hidden md:grid px-5 py-2.5 text-[11px] text-white/30 uppercase tracking-widest font-semibold border-b border-white/6"
                    style={{ gridTemplateColumns: "1fr 160px 140px 130px 180px", fontFamily: "'serif', 'fangsong'" }}>
                    <span>Sender</span><span>Category</span><span>Date</span><span>Status</span><span>Actions</span>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <ImSpinner9 className="animate-spin h-8 w-8 text-[#00C9A7]" />
                            <p className="text-white/25 text-xs tracking-widest uppercase">Loading inquiries…</p>
                        </div>
                    ) : inquiries.length === 0 ? (
                        <div className="text-center py-12 text-white/35 text-sm" style={{ fontFamily: "'serif'" }}>
                            No inquiries match your filters
                        </div>
                    ) : (
                        inquiries.map((inq, i) => {
                            const sc = STATUS_COLORS[inq.status] || STATUS_COLORS["Open"];
                            const catColor = CATEGORY_COLORS[inq.category] || "#94a3b8";
                            const isExpanded = expanded === inq._id;
                            const isReplying = replyId === inq._id;
                            const isBusy = actionId === inq._id;
                            const date = new Date(inq.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

                            return (
                                <div key={inq._id} style={{ animation: `fadeIn .3s ${i * 0.03}s both`, fontFamily: "'serif', 'fangsong'" }}
                                    className="border-b border-white/4 last:border-0">
                                    {/* Row */}
                                    <div className="flex flex-col md:grid px-5 py-3.5 gap-3 md:gap-0 items-start md:items-center"
                                        style={{ gridTemplateColumns: "1fr 160px 140px 130px 180px" }}>

                                        {/* Sender */}
                                        <div className="min-w-0">
                                            <div className="text-[14px] font-semibold text-white truncate">{inq.name}</div>
                                            <div className="text-[11px] text-white/35 truncate">{inq.email}</div>
                                        </div>

                                        {/* Category */}
                                        <div className="text-[12px] font-semibold" style={{ color: catColor }}>{inq.category}</div>

                                        {/* Date */}
                                        <div className="text-[12px] text-white/50 font-mono">{date}</div>

                                        {/* Status */}
                                        <div className="inline-flex px-2.5 py-1 mr-4 rounded-lg text-[11px] font-bold uppercase tracking-wider"
                                            style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>
                                            {inq.status}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-1.5 flex-wrap">
                                            <button
                                                onClick={() => { setExpanded(isExpanded ? null : inq._id); setReplyId(null); }}
                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-400 flex items-center gap-1 cursor-pointer"
                                                style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)" }}
                                            >
                                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />} View
                                            </button>
                                            <button
                                                onClick={() => { setReplyId(isReplying ? null : inq._id); setExpanded(inq._id); setReplyText(inq.adminResponse || ""); setReplyStatus(inq.status === "Open" ? "In Progress" : inq.status); }}
                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#00C9A7] flex items-center gap-1 cursor-pointer"
                                                style={{ background: "rgba(0,201,167,0.1)", border: "1px solid rgba(0,201,167,0.25)" }}
                                            >
                                                <Send size={11} /> Reply
                                            </button>
                                            <button
                                                onClick={() => handleDelete(inq._id, inq.name)}
                                                disabled={isBusy}
                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-400 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                                                style={{ background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.2)" }}
                                            >
                                                {isBusy ? <ImSpinner9 className="animate-spin" /> : <Trash2 size={11} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded body */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 border-t border-white/5" style={{ animation: "fadeUp .2s both" }}>
                                            <div className="mt-4 p-4 rounded-xl bg-white/3 border border-white/6">
                                                <p className="text-xs text-white/30 uppercase tracking-widest font-bold mb-2">Message</p>
                                                <p className="text-sm text-white/70 leading-relaxed">{inq.message}</p>
                                            </div>

                                            {inq.adminResponse && (
                                                <div className="mt-3 p-4 rounded-xl border" style={{ background: "rgba(0,201,167,0.04)", borderColor: "rgba(0,201,167,0.15)" }}>
                                                    <p className="text-xs text-[#00C9A7] uppercase tracking-widest font-bold mb-2">Admin Response</p>
                                                    <p className="text-sm text-white/60 leading-relaxed">{inq.adminResponse}</p>
                                                </div>
                                            )}

                                            {isReplying && (
                                                <div className="mt-3 flex flex-col gap-3">
                                                    <select value={replyStatus} onChange={e => setReplyStatus(e.target.value)}
                                                        className="w-fit bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-sm text-white/70 outline-none"
                                                        style={{ fontFamily: "'serif', 'fangsong'", background: "#1e293b" }}>
                                                        {["Open", "In Progress", "Resolved"].map(s => (
                                                            <option key={s} value={s} style={{ background: "#1e293b" }}>{s}</option>
                                                        ))}
                                                    </select>
                                                    <textarea
                                                        rows={3}
                                                        value={replyText}
                                                        onChange={e => setReplyText(e.target.value)}
                                                        placeholder="Write your response…"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 outline-none resize-none focus:border-[#00C9A7]/50 transition-colors"
                                                        style={{ fontFamily: "'serif', 'fangsong'" }}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleReply(inq._id)} disabled={isBusy || !replyText.trim()}
                                                            className="px-5 py-2 rounded-xl text-sm font-bold text-black flex items-center gap-2 disabled:opacity-50"
                                                            style={{ background: "#00C9A7" }}>
                                                            {isBusy ? <ImSpinner9 className="animate-spin" /> : <Send size={13} />}
                                                            {isBusy ? "Sending…" : "Send Reply"}
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

export default InquiriesPanel;