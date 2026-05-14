import React, { useState, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bug, Lightbulb, Upload, Loader2, Check, Paperclip } from 'lucide-react';
import { ImSpinner9 } from 'react-icons/im';
import SupportContext from '../Context/Support/SupportContext';
import AuthContext from '../Context/Authentication/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Predefined bug and idea categories
const BUG_CATEGORIES = ["UI/UX", "Performance", "Queue Management", "Token Booking", "Organization", "Security", "Other"];
const IDEA_CATEGORIES = ["Queue Management", "UI/UX", "Organization", "Token Booking", "Analytics", "Integrations", "Other"];
const PRIORITIES = [
    { value: "low", label: "Low", color: "#34d399" },
    { value: "medium", label: "Medium", color: "#fbbf24" },
    { value: "high", label: "High", color: "#f97316" },
    { value: "critical", label: "Critical", color: "#f43f5e" },
];

// Common input styles
const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "11px 14px",
    color: "#E8EDF5",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .2s",
};

const FeedbackModal = ({ type: initialType, onClose }) => {
    const { authToken, username, userRole } = useContext(AuthContext);
    const { submitReport } = useContext(SupportContext);
    const navigate = useNavigate();
    const fileRef = useRef(null);

    const [activeType, setActiveType] = useState(initialType || 'bug');
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "Other",
        priority: "medium",
    });
    const [files, setFiles] = useState([]);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const categories = activeType === 'bug' ? BUG_CATEGORIES : IDEA_CATEGORIES;

    // Handle file addition with validation
    const handleFileAdd = (incoming) => {
        const valid = Array.from(incoming).filter(f => f.size < 5 * 1024 * 1024);
        if (valid.length < incoming.length) toast.warn("Some files exceeded 5MB and were skipped.");
        setFiles(prev => [...prev, ...valid].slice(0, 3));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!authToken) {
            toast.warn("Please log in to submit.");
            onClose();
            navigate("/login");
            return;
        }

        setSending(true);
        const formData = new FormData();
        formData.append("type", activeType);
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("category", form.category);
        formData.append("priority", form.priority);
        files.forEach(f => formData.append("attachments", f));

        const result = await submitReport(formData);
        if (result.success) {
            setSent(true);
        } else {
            toast.error(result.error || "Submission failed. Please try again.");
        }
        setSending(false);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-9999 flex items-center justify-center p-4"
                style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 20 }}
                    transition={{ type: "spring", damping: 28, stiffness: 350 }}
                    className="relative top-7.5 w-full max-w-lg max-h-[80vh] overflow-y-auto"
                    style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, fontFamily: "'serif','fangsong'" }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/6"
                        style={{ background: "#0F172A", borderRadius: "24px 24px 0 0" }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: activeType === 'bug' ? "rgba(249,115,22,0.12)" : "rgba(251,191,36,0.12)" }}>
                                {activeType === 'bug' ? <Bug size={18} className="text-orange-400" /> : <Lightbulb size={18} className="text-yellow-400" />}
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-base">
                                    {activeType === 'bug' ? 'Report a Bug' : 'Submit an Idea'}
                                </h2>
                                <p className="text-[11px] text-white/35">
                                    {activeType === 'bug' ? 'Help us fix what\'s broken' : 'Share your vision with us'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/8 transition text-white/40 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>

                    {sent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-16 px-8 text-center"
                        >
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                                style={{ background: "rgba(0,201,167,0.1)", border: "2px solid rgba(0,201,167,0.3)" }}>
                                <Check size={28} className="text-[#00C9A7]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {activeType === 'bug' ? 'Bug Report Submitted!' : 'Idea Submitted!'}
                            </h3>
                            <p className="text-white/45 text-sm max-w-xs leading-relaxed mb-6">
                                {activeType === 'bug'
                                    ? "Our engineering team will review your report. You'll receive an email confirmation shortly."
                                    : "Our product team loves new ideas! We'll review yours and keep you updated."}
                            </p>
                            <button onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold"
                                style={{ background: "#00C9A7", color: "#000", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                                Done
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                            {/* Type toggle */}
                            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                {[
                                    { id: 'bug', label: 'Report a Bug', icon: <Bug size={14} />, color: "text-orange-400", activeColor: "rgba(249,115,22,0.1)", activeBorder: "rgba(249,115,22,0.3)" },
                                    { id: 'idea', label: 'Submit an Idea', icon: <Lightbulb size={14} />, color: "text-yellow-400", activeColor: "rgba(251,191,36,0.1)", activeBorder: "rgba(251,191,36,0.3)" },
                                ].map(t => (
                                    <button key={t.id} type="button" onClick={() => { setActiveType(t.id); setForm(f => ({ ...f, category: "Other" })); }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all`}
                                        style={{
                                            background: activeType === t.id ? t.activeColor : "transparent",
                                            border: `1px solid ${activeType === t.id ? t.activeBorder : "transparent"}`,
                                            color: activeType === t.id ? "white" : "rgba(255,255,255,0.35)",
                                            fontFamily: "inherit",
                                        }}>
                                        <span className={activeType === t.id ? t.color : ""}>{t.icon}</span>
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Title */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-white/35 uppercase tracking-wider ml-1">
                                    {activeType === 'bug' ? 'Bug Title' : 'Idea Title'} <span className="text-red-400">*</span>
                                </label>
                                <input required style={inputStyle}
                                    placeholder={activeType === 'bug' ? "e.g. Token counter shows wrong position" : "e.g. Add SMS notifications for token updates"}
                                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    onFocus={e => e.target.style.borderColor = "#00C9A7"}
                                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Category */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-white/35 uppercase tracking-wider ml-1">Category</label>
                                    <select style={{ ...inputStyle, cursor: "pointer" }} value={form.category}
                                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                        {categories.map(c => <option key={c} value={c} style={{ background: "#0F172A" }}>{c}</option>)}
                                    </select>
                                </div>

                                {/* Priority (bugs only) */}
                                {activeType === 'bug' && (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-white/35 uppercase tracking-wider ml-1">Priority</label>
                                        <select style={{ ...inputStyle, cursor: "pointer", color: PRIORITIES.find(p => p.value === form.priority)?.color || "#E8EDF5" }}
                                            value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                                            {PRIORITIES.map(p => <option key={p.value} value={p.value} style={{ background: "#0F172A", color: p.color }}>{p.label}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-white/35 uppercase tracking-wider ml-1">
                                    {activeType === 'bug' ? 'Steps to Reproduce / Description' : 'Describe your idea'} <span className="text-red-400">*</span>
                                </label>
                                <textarea required rows={4}
                                    style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
                                    placeholder={activeType === 'bug'
                                        ? "1. Go to Queue page\n2. Click on a token\n3. The counter shows..."
                                        : "Describe what you'd like to see and why it would help users..."}
                                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    onFocus={e => e.target.style.borderColor = "#00C9A7"}
                                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                            </div>

                            {/* File attachment */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-white/35 uppercase tracking-wider ml-1">
                                    Attachments <span className="text-white/20 normal-case font-normal">(up to 3, max 5MB each)</span>
                                </label>
                                <div
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFileAdd(e.dataTransfer.files); }}
                                    onClick={() => fileRef.current?.click()}
                                    className="flex items-center justify-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
                                    style={{
                                        border: `1.5px dashed ${dragOver ? "#00C9A7" : "rgba(255,255,255,0.1)"}`,
                                        background: dragOver ? "rgba(0,201,167,0.04)" : "rgba(255,255,255,0.02)",
                                    }}>
                                    <Upload size={16} className="text-white/30" />
                                    <span className="text-xs text-white/35">Drag & drop or click to attach screenshots, logs…</span>
                                </div>
                                <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.txt,.log" className="hidden"
                                    onChange={e => handleFileAdd(e.target.files)} />
                                {files.length > 0 && (
                                    <div className="flex flex-col gap-1.5 mt-1">
                                        {files.map((f, i) => (
                                            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg"
                                                style={{ background: "rgba(0,201,167,0.06)", border: "1px solid rgba(0,201,167,0.15)" }}>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Paperclip size={12} className="text-[#00C9A7] shrink-0" />
                                                    <span className="text-xs text-white/70 truncate">{f.name}</span>
                                                    <span className="text-[10px] text-white/30 shrink-0">({(f.size / 1024).toFixed(0)}KB)</span>
                                                </div>
                                                <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                                                    className="text-white/30 hover:text-red-400 transition ml-2 shrink-0">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={sending}
                                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-[15px] transition-all duration-300 mt-1"
                                style={{
                                    background: sending ? "rgba(0,201,167,0.4)" : "#00C9A7",
                                    color: "#000", border: "none",
                                    cursor: sending ? "not-allowed" : "pointer",
                                    fontFamily: "inherit",
                                    boxShadow: sending ? "none" : "0 16px 40px rgba(0,201,167,0.2)",
                                }}>
                                {sending
                                    ? <><ImSpinner9 className="animate-spin" /> Submitting…</>
                                    : activeType === 'bug' ? "Submit Bug Report →" : "Submit Idea →"}
                            </button>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FeedbackModal;