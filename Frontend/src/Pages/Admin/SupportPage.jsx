import React, { useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ImSpinner9 } from 'react-icons/im';
import SupportContext from '../../Context/Support/SupportContext';
import InquiriesPanel from '../../Components/Admin/InquiriesPanel';
import ChatPanel from '../../Components/Admin/ChatPanel';
import ChannelsPanel from '../../Components/Admin/ChannelsPanel';
import ReportsPanel from '../../Components/Admin/ReportsPanel';
import AnimatedNumber from '../../Hooks/AnimatedNumber';
import { MessageSquare, Inbox, Settings2, Flag } from 'lucide-react';

const TABS = [
    { id: "inquiries", label: "Inquiries", icon: <Inbox size={16} /> },
    { id: "reports", label: "Reports & Ideas", icon: <Flag size={16} /> },
    { id: "chats", label: "Live Chats", icon: <MessageSquare size={16} /> },
    { id: "channels", label: "Channels", icon: <Settings2 size={16} /> },
];

const SupportPage = () => {
    const { fetchInquiries, fetchAllChats, fetchAllReports } = useContext(SupportContext);
    const [activeTab, setActiveTab] = useState("inquiries");
    const [stats, setStats] = useState({
        totalInquiries: 0, openInquiries: 0,
        totalReports: 0, openReports: 0,
        activeChats: 0, resolvedChats: 0
    });
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        const [inqResult, chatResult, repResult] = await Promise.all([
            fetchInquiries({ limit: 1000 }),
            fetchAllChats(),
            fetchAllReports({ limit: 1000 }),
        ]);

        const inquiries = inqResult.success ? inqResult.inquiries : [];
        const chats = chatResult.success ? chatResult.conversations : [];
        const reports = repResult.success ? repResult.reports : [];

        setStats({
            totalInquiries: inquiries.length,
            openInquiries: inquiries.filter(i => i.status?.toLowerCase() === "open").length,
            totalReports: reports.length,
            openReports: reports.filter(r => ["open", "in_review"].includes(r.status?.toLowerCase())).length,
            activeChats: chats.filter(c => ["open", "in_progress"].includes(c.status?.toLowerCase())).length,
            resolvedChats: chats.filter(c => c.status?.toLowerCase() === "resolved").length,
        });
        setLoading(false);
    }, [fetchInquiries, fetchAllChats, fetchAllReports]);

    useEffect(() => { loadStats(); }, [loadStats]);

    const statCards = [
        { label: "Total Inquiries", value: stats.totalInquiries, color: "#a78bfa" },
        { label: "Open Inquiries", value: stats.openInquiries, color: "#f97316" },
        { label: "Reports & Ideas", value: stats.totalReports, color: "#fbbf24" },
        { label: "Under Review", value: stats.openReports, color: "#f43f5e" },
        { label: "Active Chats", value: stats.activeChats, color: "#00C9A7" },
        { label: "Resolved Chats", value: stats.resolvedChats, color: "#34d399" },
    ];

    return (
        <div className="flex flex-col gap-5 h-full" style={{ animation: "fadeUp .5s both" }}>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {statCards.map(({ label, value, color }, i) => (
                    <div key={label} className="glass rounded-2xl p-4"
                        style={{ animation: `fadeUp .5s ${i * 0.06}s both`, fontFamily: "'serif','fangsong'" }}>
                        <div className="text-2xl font-extrabold mb-0.5" style={{ color }}>
                            {loading ? <ImSpinner9 className="animate-spin inline" /> : <AnimatedNumber value={value} />}
                        </div>
                        <div className="text-[12px] text-white/40 leading-tight">{label}</div>
                    </div>
                ))}
            </div>

            {/* Tab bar */}
            <div className="glass rounded-2xl p-1.5 flex gap-1 w-fit flex-wrap">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{
                            background: activeTab === tab.id ? "rgba(0,201,167,0.12)" : "transparent",
                            border: activeTab === tab.id ? "1px solid rgba(0,201,167,0.3)" : "1px solid transparent",
                            color: activeTab === tab.id ? "#00C9A7" : "rgba(255,255,255,0.4)",
                            fontFamily: "'serif','fangsong'",
                        }}>
                        <span style={{ color: activeTab === tab.id ? "#00C9A7" : "rgba(255,255,255,0.3)" }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 min-h-0">
                {activeTab === "inquiries" && <InquiriesPanel onStatsChange={loadStats} />}
                {activeTab === "reports" && <ReportsPanel onStatsChange={loadStats} />}
                {activeTab === "chats" && <ChatPanel />}
                {activeTab === "channels" && <ChannelsPanel />}
            </div>
        </div>
    );
};

export default SupportPage;