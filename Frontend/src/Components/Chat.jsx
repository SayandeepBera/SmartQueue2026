import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCheck, Maximize2, Minimize2, X, Send, Loader2, Paperclip, Image as ImageIcon, FileText } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import SupportContext from '../Context/Support/SupportContext';
import AuthContext from '../Context/Authentication/AuthContext';

const POLL_INTERVAL = 4000;

// Predefined welcome messages to start the conversation with
const WELCOME_MESSAGES = [
    {
        _id: "welcome-1",
        message: "👋 Hello! Welcome to SmartQueue Support.",
        sender: "admin",
        senderName: "Support Team",
        createdAt: new Date().toISOString(),
        isRead: true,
        messageType: "text",
    },
    {
        _id: "welcome-2",
        message: "We're here to help with token bookings, organization queries, technical issues, and anything else. How can we assist you today?",
        sender: "admin",
        senderName: "Support Team",
        createdAt: new Date(Date.now() + 800).toISOString(),
        isRead: true,
        messageType: "text",
    },
];

const Chat = ({ isFloating = true, onClose }) => {
    const { startChat, fetchMyChat, sendChatMessage, pollChatMessages, uploadChatFile } = useContext(SupportContext);
    const { username, email, userRole: role } = useContext(AuthContext);

    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isFullScreen, setIsFullScreen] = useState(!isFloating);
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [filePreview, setFilePreview] = useState(null);

    const scrollRef = useRef(null);
    const pollRef = useRef(null);
    const lastMessageTimeRef = useRef(null);
    const fileInputRef = useRef(null);

    const initiatorType = role;

    // Fetch existing conversation or start a new one on mount
    useEffect(() => {
        (async () => {
            setLoading(true);
            const existing = await fetchMyChat();
            
            if (existing.success && existing.conversation) {
                setConversation(existing.conversation);
                if (existing.messages?.length > 0) {
                    setMessages(existing.messages);
                    lastMessageTimeRef.current = existing.messages[existing.messages.length - 1].createdAt;
                } else {
                    setMessages(WELCOME_MESSAGES);
                }
            } else {
                const started = await startChat({
                    initiatorType,
                    initiatorName: username || email || "User",
                });
                if (started.success) {
                    setConversation(started.conversation);
                    setMessages(WELCOME_MESSAGES);
                } else {
                    setError("Failed to start chat. Please try again.");
                }
            }

            setLoading(false);
        })();

        return () => { 
            if (pollRef.current) 
                clearInterval(pollRef.current); 
            };
    }, []);

    // Poll for new messages every few seconds
    useEffect(() => {
        if (!conversation) return;
        const poll = async () => {
            const since = lastMessageTimeRef.current;
            const result = await pollChatMessages(conversation._id, since);
            
            if (result.success && result.messages?.length > 0) {
                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => m._id));
                    const newOnes = result.messages.filter(m => !existingIds.has(m._id));
                    if (newOnes.length === 0) return prev;
                    lastMessageTimeRef.current = newOnes[newOnes.length - 1].createdAt;
                    return [...prev, ...newOnes];
                });
            }
        };

        pollRef.current = setInterval(poll, POLL_INTERVAL);
        return () => clearInterval(pollRef.current);
    }, [conversation]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        if (!showPicker) return;
        const handler = (e) => {
            if (!e.target.closest('.emoji-picker-container') && !e.target.closest('.emoji-trigger-btn')) {
                setShowPicker(false);
            }
        };

        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showPicker]);

    // Handle file selection and upload
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !conversation) return;
        if (file.size > 10 * 1024 * 1024) {
            return alert("File must be under 10MB.");
        }

        setUploadingFile(true);
        
        const isImage = file.type.startsWith("image/");
        
        if (isImage) {
            const reader = new FileReader();
            reader.onload = () => setFilePreview({ url: reader.result, name: file.name, isImage: true });
            reader.readAsDataURL(file);
        } else {
            setFilePreview({ name: file.name, isImage: false });
        }

        const result = await uploadChatFile(file);
        setUploadingFile(false);

        if (result.success) {
            // Auto-send the file message
            const tempId = `temp-file-${Date.now()}`;
            const optimistic = {
                _id: tempId,
                message: "",
                sender: initiatorType,
                senderName: username || "You",
                createdAt: new Date().toISOString(),
                isRead: false,
                messageType: result.messageType,
                attachment: result.attachment,
            };

            setMessages(prev => [...prev, optimistic]);
            setFilePreview(null);

            const sendResult = await sendChatMessage({
                conversationId: conversation._id,
                message: "",
                senderName: username || email || "User",
                messageType: result.messageType,
                attachment: result.attachment,
            });

            if (sendResult.success) {
                setMessages(prev => prev.map(m => m._id === tempId ? { ...sendResult.message } : m));
                lastMessageTimeRef.current = sendResult.message.createdAt;
            } else {
                setMessages(prev => prev.filter(m => m._id !== tempId));
            }
        } else {
            setFilePreview(null);
            alert("Upload failed. Please try again.");
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Handle sending a new text message
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversation || sending) return;
        const text = newMessage.trim();
        setNewMessage("");
        setSending(true);
        
        const tempId = `temp-${Date.now()}`;
        const optimistic = {
            _id: tempId, message: text, sender: initiatorType,
            senderName: username || "You", createdAt: new Date().toISOString(),
            isRead: false, messageType: "text",
        };

        setMessages(prev => [...prev, optimistic]);
        
        const result = await sendChatMessage({
            conversationId: conversation._id, message: text,
            senderName: username || email || "User", messageType: "text",
        });

        if (result.success) {
            setMessages(prev => prev.map(m => m._id === tempId ? { ...result.message } : m));
            lastMessageTimeRef.current = result.message.createdAt;
        } else {
            setMessages(prev => prev.filter(m => m._id !== tempId));
            setNewMessage(text);
        }

        setSending(false);
    };

    // Format date and time
    const formatTime = (dateStr) => {
        try { return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
        catch { return ""; }
    };

    // Render attachment
    const renderAttachment = (msg) => {
        if (msg.messageType === 'image' && msg.attachment?.url) {
            return (
                <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer">
                    <img src={msg.attachment.url} alt={msg.attachment.name || "image"}
                        className="max-w-full rounded-xl mt-1 cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ maxHeight: 200, objectFit: "cover" }} />
                </a>
            );
        }

        // File attachment rendering
        if (msg.messageType === 'file' && msg.attachment?.url) {
            return (
                <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 mt-1 px-3 py-2 rounded-xl hover:opacity-80 transition-opacity"
                    style={{ background: "rgba(255,255,255,0.1)", textDecoration: "none" }}>
                    <FileText size={16} className="shrink-0 text-blue-300" />
                    <div className="min-w-0">
                        <div className="text-xs font-semibold text-white/80 truncate">{msg.attachment.name}</div>
                        {msg.attachment.size && <div className="text-[10px] text-white/40">{(msg.attachment.size / 1024).toFixed(0)} KB</div>}
                    </div>
                </a>
            );
        }
        return null;
    };

    // Animated container that smoothly transitions between fullscreen and floating
    const chatVariants = {
        floating: {
            width: 380,
            height: 500,
            bottom: 24,
            right: 24,
            borderRadius: "1.5rem",
            opacity: 1,
            scale: 1
        },
        fullscreen: {
            width: "100vw",
            height: "90vh",
            bottom: "20px",
            right: 0,
            borderRadius: 0,
            opacity: 1,
            scale: 1
        },
        initial: {
            opacity: 0,
            scale: 0.95,
            y: 20
        }
    };

    return (
        <motion.div
            layout
            initial="initial"
            animate={isFullScreen ? "fullscreen" : "floating"}
            variants={chatVariants}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            animate={isFullScreen ? "fullscreen" : "floating"}
            variants={chatVariants}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed z-999 bg-[#0F172A] border border-white/10 shadow-2xl flex flex-col overflow-hidden text-white"
            style={{ fontFamily: "fangsong, serif" }}
        >
            {/* Header */}
            <header className={`${isFullScreen ? "py-4 px-10" : "p-4"} border-b border-white/10 bg-white/2 backdrop-blur-md flex items-center justify-between sticky top-0 z-10`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00C4CC] flex items-center justify-center font-bold text-slate-900 text-sm shrink-0">SQ</div>
                    <div>
                        <h3 className="font-bold text-sm md:text-base">SmartQueue Support</h3>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            Online · Replies in ~2 mins
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-1.5 hover:bg-white/10 rounded-md transition">
                        {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-md transition text-red-400">
                            <X size={18} />
                        </button>
                    )}
                </div>
            </header>

            {/* Messages */}
            <main className={`flex-1 overflow-y-auto ${isFullScreen ? "py-6 px-10" : "p-4"} space-y-3`}>
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin text-[#00C4CC] w-6 h-6" />
                    </div>
                ) : error ? (
                    <div className="text-center py-10 text-red-400 text-sm">{error}</div>
                ) : (
                    <>
                        <div className="text-center py-4">
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Beginning of conversation</p>
                        </div>
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => {
                                const isMe = msg.sender !== "admin";
                                return (
                                    <motion.div
                                        key={msg._id}
                                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ type: "spring", damping: 24, stiffness: 300 }}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {!isMe && (
                                            <div className="w-6 h-6 rounded-full bg-[#00C4CC] flex items-center justify-center text-[9px] font-bold text-slate-900 mr-2 shrink-0 mt-1">SQ</div>
                                        )}
                                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-lg ${isMe
                                            ? 'bg-[#00C4CC] text-slate-900 rounded-tr-none font-medium'
                                            : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                                            }`}>
                                            {!isMe && msg.senderName && (
                                                <p className="text-[9px] font-bold text-[#00C4CC] mb-1 uppercase tracking-wider">{msg.senderName}</p>
                                            )}
                                            {msg.message && <p className="leading-relaxed">{msg.message}</p>}
                                            {renderAttachment(msg)}
                                            <div className={`flex items-center gap-1 justify-end text-[9px] mt-1 opacity-60`}>
                                                {formatTime(msg.createdAt)}
                                                {isMe && (msg.isRead ? <CheckCheck size={12} /> : <Check size={12} />)}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {uploadingFile && (
                            <div className="flex justify-end">
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#00C4CC]/40 text-slate-900 text-sm">
                                    <Loader2 size={14} className="animate-spin" />
                                    Uploading…
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className={`${isFullScreen ? "py-4 px-10" : "p-4"} bg-[#0F172A] border-t border-white/10 relative`}>
                {/* Emoji Picker */}
                <AnimatePresence>
                    {showPicker && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ type: "spring", damping: 24, stiffness: 300 }}
                            className="absolute bottom-full left-0 mb-2 emoji-picker-container"
                            style={{ zIndex: 50 }}
                        >
                            <EmojiPicker
                                theme="dark"
                                height={350}
                                width={isFullScreen ? 360 : 310}
                                onEmojiClick={(emojiData) => {
                                    setNewMessage(prev => prev + emojiData.emoji);
                                    setShowPicker(false);
                                }}
                                searchDisabled={false}
                                skinTonesDisabled
                                previewConfig={{ showPreview: false }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2">

                    {/* Emoji + input */}
                    <div className="flex-1 flex items-center bg-white/[0.05] border border-white/10 rounded-2xl px-3 py-1 focus-within:border-[#00C4CC]/50 transition-all">
                        <button type="button"
                            className="p-2 text-white/30 hover:text-white/70 transition-colors emoji-trigger-btn"
                            onClick={() => setShowPicker(v => !v)}>
                            😊
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message…"
                            disabled={loading || !!error}
                            className="flex-1 bg-transparent border-none outline-none py-2.5 px-1 text-sm placeholder:text-gray-500 disabled:opacity-40"
                        />

                        <div>
                            {/* File upload button */}
                            <input ref={fileInputRef} type="file" className="hidden"
                                accept="image/*,.pdf,.doc,.docx,.txt"
                                onChange={handleFileSelect} />
                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                disabled={loading || !!error || uploadingFile}
                                className="p-2.5 text-white/30 hover:text-white/70 transition-colors disabled:opacity-30 rounded-xl hover:bg-white/5">
                                <Paperclip size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Send */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={!newMessage.trim() || sending || loading || !!error}
                        className="bg-[#00C4CC] text-slate-900 p-3.5 rounded-2xl shadow-[0_0_20px_rgba(0,196,204,0.3)] transition-all hover:bg-[#00e1eb] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </motion.button>
                </form>
            </footer>
        </motion.div>
    );
};

export default Chat;