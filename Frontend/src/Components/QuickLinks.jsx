import React, { useContext, useEffect, useState } from 'react';
import { ExternalLink, MessageCircle, Mail, Phone, Bug, Lightbulb, BookOpenText } from 'lucide-react';
import { motion } from 'framer-motion';
import SupportContext from '../Context/Support/SupportContext';
import FeedbackModal from './FeedbackModal';
import { ImSpinner9 } from 'react-icons/im';
import AuthContext from '../Context/Authentication/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

/* Map channel key → icon & color */
const CHANNEL_META = {
    live_chat: { icon: <MessageCircle className="text-emerald-400" />, color: "text-emerald-400" },
    email_support: { icon: <Mail className="text-[#00C4CC]" />, color: "text-[#00C4CC]" },
    phone_support: { icon: <Phone className="text-purple-400" />, color: "text-purple-400" },
    report_bug: { icon: <Bug className="text-orange-400" />, color: "text-orange-400" },
    feature_request: { icon: <Lightbulb className="text-yellow-400" />, color: "text-yellow-400" },
    documentation: { icon: <BookOpenText className="text-blue-400" />, color: "text-blue-400" },
};

const QuickLinks = ({ onStartLiveChat, onOpenDocs }) => {
    const { fetchChannels } = useContext(SupportContext);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedbackModal, setFeedbackModal] = useState(null);
    const { authToken } = useContext(AuthContext);
    const navigate = useNavigate();

    // Fetch channels on mount
    useEffect(() => {
        (async () => {
            const result = await fetchChannels();
            if (result.success) setChannels(result.channels);
            setLoading(false);
        })();
    }, []);

    // Handle channel actions
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    };

    // Animation for each item
    const itemVariants = {
        hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: "easeOut" } },
    };

    // Handle channel action based on key
    const handleAction = (channel) => {
        if (!authToken) {
            toast.warn("Please login to access support channels", { theme: "colored" });
            navigate("/login");
            return;
        }

        if (channel.key === "live_chat") {
            onStartLiveChat();
        } else if (channel.key === "report_bug") {
            setFeedbackModal("bug");
        } else if (channel.key === "feature_request") {
            setFeedbackModal("idea");
        } else if (channel.key === "documentation") {
            onOpenDocs?.();
        } else if (channel.link && channel.link !== "null") {
            window.location.href = channel.link;
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-80">
                <ImSpinner9 className="animate-spin h-11 w-11 text-[#00C9A7] mb-4" />
                <p className="text-white/30 text-sm font-medium tracking-widest uppercase">Loading Data...</p>
            </div>
        );
    }

    return (
        <>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="py-12 px-6"
            >
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {channels.map((item, i) => {
                        const meta = CHANNEL_META[item.key] || { icon: <ExternalLink className="text-white/40" />, color: "text-white/40" };
                        return (
                            <motion.div
                                key={item._id}
                                variants={itemVariants}
                                whileHover={{ y: -8, backgroundColor: "rgba(255,255,255,0.04)" }}
                                className="p-8 rounded-[2.5rem] bg-white/2 border border-white/5 flex flex-col items-center text-center group shadow-lg shadow-[#00C4CC]/30"
                            >
                                <div
                                    className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                                    style={{ animation: `float ${3 + i * 0.4}s ease-in-out infinite` }}
                                >
                                    {meta.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                                <p className="text-gray-500 text-sm mb-6">{item.description}</p>
                                <button
                                    onClick={() => handleAction(item)}
                                    className={`text-xs font-black uppercase tracking-widest ${meta.color} flex items-center gap-2 hover:gap-3 transition-all cursor-pointer`}
                                >
                                    {item.actionLabel} <ExternalLink size={14} />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Feedback Modal */}
            {feedbackModal && (
                <FeedbackModal type={feedbackModal} onClose={() => setFeedbackModal(null)} />
            )}
        </>
    );
};

export default QuickLinks;