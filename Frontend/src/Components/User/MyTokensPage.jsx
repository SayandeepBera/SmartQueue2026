import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import RevealSection from '../../Hooks/RevealSection';
import ActiveTokenPanel from '../../Components/User/ActiveTokenPanel';
import AuthContext from '../../Context/Authentication/AuthContext';
import PublicContext from '../../Context/Public/PublicContext';
import TokenCard from './TokenCard';

// ── Guest gate shown when user is not logged in ───────────────────────────────
import GuestGate from './GuestGate';

// ── Main Page ─────────────────────────────────────────────────────────────────
const MyTokensPage = () => {
    const navigate = useNavigate();
    const { getMyTokens, getTokenStatus } = useContext(PublicContext);
    const { email, userId, authToken } = useContext(AuthContext);

    const [bookingEmail, setBookingEmail] = useState(email || "");
    const [phone, setPhone] = useState("");
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);
    const [activeTab, setActiveTab] = useState("active");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [panelDismissed, setPanelDismissed] = useState(false);

    const isLoggedIn = !!authToken;

    const fetchTokens = useCallback(async (em = bookingEmail, ph = phone, p = page) => {
        if (!em && !ph) {
            setError("Please enter your email or phone to find your tokens.");
            return;
        }

        setLoading(true);
        setError(null);
        setSearched(true);
        setPanelDismissed(false);

        const result = await getMyTokens({
            userId: userId || undefined,
            email: em || undefined,
            phone: ph || undefined,
            page: p,
            limit: 20,
        });

        if (result.success) {
            setTokens(result.tokens || []);
            setTotal(result.total || 0);
            setTotalPages(result.pages || 1);
        } else {
            setError(result.error);
            setTokens([]);
        }

        setLoading(false);
    }, [userId, bookingEmail, phone, page, getMyTokens]);

    // Auto-fetch on mount if email in auth context
    useEffect(() => {
        if (userId || email) {
            setBookingEmail(email || "");
            fetchTokens(email || "", "", 1);
        }
    }, [userId, email]);

    // Re-fetch when a new token is booked anywhere in the app
    useEffect(() => {
        const handler = () => {
            if (email || bookingEmail) fetchTokens(email || bookingEmail, phone, 1);
        };
        window.addEventListener("sq:tokenBooked", handler);
        return () => window.removeEventListener("sq:tokenBooked", handler);
    }, [email, bookingEmail, phone, fetchTokens]);

    // Auto-refresh active tokens every 30 s
    useEffect(() => {
        if (!searched) return;
        const interval = setInterval(() => {
            if (email || bookingEmail) fetchTokens(email || bookingEmail, phone, page);
        }, 30_000);
        return () => clearInterval(interval);
    }, [searched, email, bookingEmail, phone, page, fetchTokens]);

    const refreshToken = async (tokenId) => {
        const result = await getTokenStatus(tokenId);
        if (result.success) {
            setTokens(prev => prev.map(t =>
                t._id === tokenId
                    ? { ...t, status: result.token.status, position: result.token.position, estimatedWait: result.token.estimatedWait }
                    : t
            ));
        }
    };

    const activeTokens = tokens.filter(t => ["waiting", "next", "serving"].includes(t.status));
    const historyTokens = tokens.filter(t => ["served", "skipped", "no_show"].includes(t.status));
    const displayTokens = activeTab === "active" ? activeTokens : historyTokens;

    const latestActive = activeTokens[0];
    const bookedForPanel = latestActive ? {
        tokenId: latestActive._id,
        orgId: latestActive.orgId?._id || latestActive.orgId,
        name: latestActive.serviceId?.name,
        icon: latestActive.serviceId?.icon,
        color: latestActive.serviceId?.color || "#00C9A7",
        counter: latestActive.serviceId?.counter,
        token: latestActive.tokenNumber,
        position: latestActive.position,
        wait: latestActive.estimatedWait,
        bookedName: latestActive.name,
        org: latestActive.orgId,
    } : null;

    const showPanel = bookedForPanel && !panelDismissed;

    return (
        <div className="min-h-screen px-1.25 py-17.5">

            {/* ── Header ── */}
            <RevealSection delay={0}>
                <div className="relative mb-10 overflow-hidden">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#845EC2]/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 relative z-10">
                        <div className="flex-1">
                            <button
                                onClick={() => navigate(-1)}
                                className="group flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white/30 hover:text-[#845EC2] transition-all duration-300 mb-6"
                            >
                                <span className="inline-block transform group-hover:-translate-x-1 transition-transform">←</span>
                                Back
                            </button>

                            <h1 className="font-extrabold leading-tight tracking-tight mb-3"
                                style={{
                                    fontFamily: "serif, fangsong",
                                    fontSize: "clamp(32px, 5vw, 52px)",
                                    background: "linear-gradient(to bottom, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}>
                                <span className="shimmer inline-block">Your Queue</span> <br />
                                <span className="text-white/30 italic font-medium">History & Status</span>
                            </h1>

                            <p className="text-white/40 text-[15px] max-w-md leading-relaxed border-l border-white/10 pl-4">
                                Manage your current standing in
                                <span className="text-white/80 mx-1">live queues</span>
                                and review your complete service history.
                            </p>
                        </div>

                        <div className="hidden sm:flex items-center gap-4 bg-white/3 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold">Total Activity</p>
                                <p className="text-2xl font-black text-white/90 leading-none mt-1">
                                    {total} <span className="text-[13px] font-medium text-white/40">Tokens</span>
                                </p>
                            </div>
                            <div className="h-10 w-px bg-white/10 mx-1" />
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-[#845EC2]/20 border border-[#845EC2]/30 text-xl">
                                🎟️
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px mt-8 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                </div>
            </RevealSection>

            {/* ── Guest gate: not logged in ── */}
            {!isLoggedIn && <GuestGate />}

            {/* ── Active Token Panel ── */}
            {isLoggedIn && showPanel && (
                <ActiveTokenPanel booked={bookedForPanel} onDismiss={() => setPanelDismissed(true)} />
            )}

            {/* ── Tabs + token list (only for logged-in users) ── */}
            {isLoggedIn && searched && !loading && (
                <RevealSection delay={0.06}>
                    <div className="flex gap-1 p-1 rounded-[14px] mb-6 w-fit"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        {[
                            { key: "active", label: `Active (${activeTokens.length})`, color: "#00C9A7" },
                            { key: "history", label: `History (${historyTokens.length})`, color: "#845EC2" },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className="px-5 py-2 rounded-[11px] text-sm font-semibold transition-all duration-200"
                                style={{
                                    background: activeTab === tab.key ? `${tab.color}18` : "transparent",
                                    border: `1px solid ${activeTab === tab.key ? tab.color + "40" : "transparent"}`,
                                    color: activeTab === tab.key ? tab.color : "rgba(255,255,255,0.4)",
                                }}
                            >{tab.label}</button>
                        ))}
                    </div>

                    {/* Empty state */}
                    {displayTokens.length === 0 && (
                        <div className="text-center py-16 text-white/35">
                            <div className="text-5xl mb-3">{activeTab === "active" ? "🎟️" : "📋"}</div>
                            <p className="font-semibold text-white/50 mb-1">
                                {activeTab === "active" ? "No active tokens" : "No booking history yet"}
                            </p>
                            <p className="text-[13px]">
                                {activeTab === "active"
                                    ? "Book a service from the dashboard to get started"
                                    : "Your past tokens will appear here"}
                            </p>
                            {activeTab === "active" && (
                                <button
                                    onClick={() => navigate('/services')}
                                    className="btn inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-xl text-sm font-bold"
                                    style={{ background: "rgba(0,201,167,0.15)", border: "1px solid rgba(0,201,167,0.3)", color: "#00C9A7" }}
                                >
                                    Browse Services →
                                </button>
                            )}
                        </div>
                    )}

                    {/* Token cards */}
                    {displayTokens.length > 0 && (
                        <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))" }}>
                            {displayTokens.map((token, i) => (
                                <div key={token._id} style={{ animation: `cardIn .5s ${i * .05}s cubic-bezier(.22,1,.36,1) both` }}>
                                    <TokenCard
                                        token={token}
                                        onRefresh={["waiting", "next", "serving"].includes(token.status) ? refreshToken : null}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* History pagination */}
                    {activeTab === "history" && totalPages > 1 && (
                        <div className="flex justify-center gap-2 mb-8">
                            <button
                                onClick={() => { const p = page - 1; setPage(p); fetchTokens(bookingEmail, phone, p); }}
                                disabled={page === 1}
                                className="btn px-4 py-2 rounded-xl text-sm disabled:opacity-30"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8EDF5" }}
                            >← Prev</button>
                            <span className="self-center text-sm text-white/40">Page {page} of {totalPages}</span>
                            <button
                                onClick={() => { const p = page + 1; setPage(p); fetchTokens(bookingEmail, phone, p); }}
                                disabled={page === totalPages}
                                className="btn px-4 py-2 rounded-xl text-sm disabled:opacity-30"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8EDF5" }}
                            >Next →</button>
                        </div>
                    )}

                    {total > 0 && (
                        <p className="text-center text-xs text-white/25 mb-4">
                            {total} total token{total !== 1 ? "s" : ""} found
                        </p>
                    )}
                </RevealSection>
            )}

            {/* Loading skeleton */}
            {isLoggedIn && loading && (
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))" }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="glass rounded-[20px] p-5 animate-pulse" style={{ minHeight: 140 }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl" style={{ background: "rgba(255,255,255,0.07)" }} />
                                <div className="flex-1">
                                    <div className="h-4 w-28 rounded mb-2" style={{ background: "rgba(255,255,255,0.07)" }} />
                                    <div className="h-3 w-20 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
                                </div>
                            </div>
                            <div className="h-7 w-24 rounded" style={{ background: "rgba(255,255,255,0.07)" }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTokensPage;