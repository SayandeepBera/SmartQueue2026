import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { ImSpinner9 } from 'react-icons/im';
import { Send, Loader2, Check, CheckCheck, Circle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SupportContext from '../../Context/Support/SupportContext';
import { toast } from 'react-toastify';

const STATUS_META = {
    open: { label: "Open", color: "#f97316" },
    in_progress: { label: "In Progress", color: "#fbbf24" },
    resolved: { label: "Resolved", color: "#34d399" },
    closed: { label: "Closed", color: "#64748b" },
};

const POLL_INTERVAL = 3500;

const ChatPanel = () => {
    const { fetchAllChats, fetchChatMessages, sendAdminChatMessage, updateChatStatus, pollAdminChatMessages } = useContext(SupportContext);

    const [conversations, setConversations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");

    const scrollRef = useRef(null);
    const pollRef = useRef(null);
    const lastTimeRef = useRef(null);

    /* Load conversations */
    const loadConversations = useCallback(async () => {
        const result = await fetchAllChats({ status: statusFilter });
        if (result.success) setConversations(result.conversations);
        setLoading(false);
    }, [fetchAllChats, statusFilter]);

    useEffect(() => { loadConversations(); }, [loadConversations]);

    /* Poll for new conversations every 10s */
    useEffect(() => {
        const id = setInterval(loadConversations, 10000);
        return () => clearInterval(id);
    }, [loadConversations]);

    /* Load messages for selected conversation */
    const loadMessages = useCallback(async (convId) => {
        setMsgLoading(true);
        const result = await fetchChatMessages(convId);
        if (result.success) {
            setMessages(result.messages);
            if (result.messages.length > 0) {
                lastTimeRef.current = result.messages[result.messages.length - 1].createdAt;
            }
            // Update unread count in list
            setConversations(prev => prev.map(c => c._id === convId ? { ...c, unreadByAdmin: 0 } : c));
        }
        setMsgLoading(false);
    }, [fetchChatMessages]);

    useEffect(() => {
        if (!selected) return;
        loadMessages(selected._id);
    }, [selected?._id]);

    /* Poll messages for selected conversation */
    useEffect(() => {
        if (!selected) { clearInterval(pollRef.current); return; }

        const poll = async () => {
            const since = lastTimeRef.current;
            const result = await pollAdminChatMessages(selected._id, since);
            if (result.success && result.messages?.length > 0) {
                setMessages(prev => {
                    const ids = new Set(prev.map(m => m._id));
                    const newOnes = result.messages.filter(m => !ids.has(m._id));
                    if (!newOnes.length) return prev;
                    lastTimeRef.current = newOnes[newOnes.length - 1].createdAt;
                    return [...prev, ...newOnes];
                });
                // Refresh conversation list for unread counts
                loadConversations();
            }
        };

        pollRef.current = setInterval(poll, POLL_INTERVAL);
        return () => clearInterval(pollRef.current);
    }, [selected?._id]);

    /* Auto-scroll */
    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    /* Send message */
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selected || sending) return;

        const text = newMessage.trim();
        setNewMessage("");
        setSending(true);

        // Optimistic
        const tempId = `temp-${Date.now()}`;
        setMessages(prev => [...prev, {
            _id: tempId, message: text, sender: "admin",
            senderName: "Support Team", createdAt: new Date().toISOString(), isRead: false,
        }]);

        const result = await sendAdminChatMessage(selected._id, text);
        if (result.success) {
            setMessages(prev => prev.map(m => m._id === tempId ? result.message : m));
            lastTimeRef.current = result.message.createdAt;
            setConversations(prev => prev.map(c => c._id === selected._id
                ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() }
                : c
            ));
        } else {
            setMessages(prev => prev.filter(m => m._id !== tempId));
            setNewMessage(text);
            toast.error("Failed to send message", { theme: "colored" });
        }
        setSending(false);
    };

    // Handle chat status change
    const handleStatusChange = async (convId, status) => {
        const result = await updateChatStatus(convId, status);
        if (result.success) {
            setConversations(prev => prev.map(c => c._id === convId ? { ...c, status } : c));
            if (selected?._id === convId) setSelected(prev => ({ ...prev, status }));
            toast.success(`Chat marked as ${status.replace("_", " ")}`, { theme: "colored" });
        }
    };

    // Format time as "02:45 PM"
    const formatTime = (str) => {
        try { return new Date(str).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch { return ""; }
    };

    // Format date as "12 Jan"
    const formatDate = (str) => {
        try { return new Date(str).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); } catch { return ""; }
    };

    // Filter conversations based on status
    const filtered = conversations.filter(c => statusFilter === "all" || c.status === statusFilter);

    return (
        <div className="glass rounded-2xl overflow-hidden flex" style={{ height: "65vh" }}>
            {/* Sidebar: conversation list */}
            <div className="w-72 shrink-0 border-r border-white/6 flex flex-col">
                {/* Filter */}
                <div className="p-3 border-b border-white/6">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-xs text-white/70 outline-none"
                        style={{ fontFamily: "'serif', 'fangsong'", background: "#1e293b" }}>
                        <option value="all" style={{ background: "#1e293b" }}>All Chats</option>
                        {Object.entries(STATUS_META).map(([k, v]) => (
                            <option key={k} value={k} style={{ background: "#1e293b" }}>{v.label}</option>
                        ))}
                    </select>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <ImSpinner9 className="animate-spin text-[#00C9A7] w-5 h-5" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-10 text-white/30 text-sm" style={{ fontFamily: "'serif'" }}>No chats</div>
                    ) : (
                        filtered.map(conv => {
                            const sm = STATUS_META[conv.status] || STATUS_META.open;
                            const isActive = selected?._id === conv._id;
                            return (
                                <button key={conv._id} onClick={() => setSelected(conv)}
                                    className="w-full text-left px-4 py-3.5 border-b border-white/4 transition-all hover:bg-white/3"
                                    style={{ background: isActive ? "rgba(0,201,167,0.06)" : "transparent", borderLeft: isActive ? "2px solid #00C9A7" : "2px solid transparent" }}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-semibold text-white truncate">{conv.initiatorName}</span>
                                                {conv.unreadByAdmin > 0 && (
                                                    <span className="shrink-0 text-[10px] font-bold bg-[#00C9A7] text-black rounded-full w-4 h-4 flex items-center justify-center">
                                                        {conv.unreadByAdmin}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-white/30 truncate mt-0.5">{conv.lastMessage || "No messages yet"}</div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: sm.color }}>{sm.label}</div>
                                            <div className="text-[10px] text-white/25 mt-0.5">{formatDate(conv.lastMessageAt || conv.createdAt)}</div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-white/20 mt-1 capitalize">{conv.initiatorType}</div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main: message view */}
            {!selected ? (
                <div className="flex-1 flex items-center justify-center text-white/20 text-sm" style={{ fontFamily: "'serif'" }}>
                    Select a conversation to start replying
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Chat header */}
                    <div className="px-5 py-3 border-b border-white/6 flex items-center justify-between bg-white/[0.01]">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{selected.initiatorName}</span>
                                <span className="text-[10px] text-white/30 capitalize bg-white/5 px-2 py-0.5 rounded-full">{selected.initiatorType}</span>
                            </div>
                            <div className="text-xs text-white/30 mt-0.5">Started {formatDate(selected.createdAt)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <select value={selected.status}
                                onChange={e => handleStatusChange(selected._id, e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none cursor-pointer"
                                style={{ fontFamily: "'serif', 'fangsong'", background: "#1e293b", color: STATUS_META[selected.status]?.color || "#fff" }}>
                                {Object.entries(STATUS_META).map(([k, v]) => (
                                    <option key={k} value={k} style={{ background: "#1e293b", color: "#fff" }}>{v.label}</option>
                                ))}
                            </select>
                            <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition text-white/40">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-3">
                        {msgLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="animate-spin text-[#00C9A7] w-5 h-5" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-10 text-white/25 text-sm" style={{ fontFamily: "'serif'" }}>No messages yet</div>
                        ) : (
                            <>
                                {messages.map(msg => {
                                    const isAdmin = msg.sender === "admin";
                                    return (
                                        <motion.div key={msg._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                                            {!isAdmin && (
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-[9px] font-bold text-white mr-2 shrink-0 mt-1">
                                                    {(msg.senderName || "?")[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isAdmin
                                                ? "bg-[#00C4CC] text-slate-900 font-medium rounded-tr-none"
                                                : "bg-white/10 text-white rounded-tl-none border border-white/6"
                                                }`}>
                                                {!isAdmin && <p className="text-[9px] font-bold text-violet-300 mb-1 uppercase tracking-wider">{msg.senderName}</p>}
                                                <p className="leading-relaxed">{msg.message}</p>
                                                <div className="flex items-center gap-1 justify-end text-[9px] mt-1 opacity-60">
                                                    {formatTime(msg.createdAt)}
                                                    {isAdmin && (msg.isRead ? <CheckCheck size={11} /> : <Check size={11} />)}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/6 bg-[#0F172A]">
                        <form onSubmit={handleSend} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Type your reply…"
                                disabled={selected.status === "closed" || selected.status === "resolved"}
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white/80 outline-none placeholder:text-white/25 focus:border-[#00C4CC]/40 transition-colors disabled:opacity-40"
                                style={{ fontFamily: "'serif', 'fangsong'" }}
                            />
                            <button type="submit" disabled={!newMessage.trim() || sending || selected.status === "closed" || selected.status === "resolved"}
                                className="bg-[#00C4CC] text-slate-900 p-3 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-[#00d4dc]">
                                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </form>
                        {(selected.status === "closed" || selected.status === "resolved") && (
                            <p className="text-xs text-white/25 text-center mt-2" style={{ fontFamily: "'serif'" }}>
                                This chat is {selected.status}. Change status to reply.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPanel;