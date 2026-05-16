import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import RevealSection from '../../Hooks/RevealSection';
import ActiveTokenPanel from '../../Components/User/ActiveTokenPanel';
import AuthContext from '../../Context/Authentication/AuthContext';
import PublicContext from '../../Context/Public/PublicContext';
import TokenCard from './TokenCard';
import GuestGate from './GuestGate';

const DONE_STATUSES = ["served", "skipped", "no_show"];

// Build the booked-panel shape from a raw token object (from getMyTokens response)
const buildPanelData = (token) => {
    if (!token) return null;
    const svc = token.serviceId || {};
    const org = token.orgId || {};
    console.log("Org:", org);
    return {
        tokenId: token._id,
        orgId: org._id || org,
        name: svc.name,
        icon: svc.icon,
        color: svc.color || "#00C9A7",
        counter: svc.counter,
        token: token.tokenNumber,
        position: token.position,
        wait: token.estimatedWait,
        bookedName: token.name,
        org: org,
        // Pass final status so the panel can render done states properly
        finalStatus: DONE_STATUSES.includes(token.status) ? token.status : undefined,
    };
};

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

    // Used to track which token the user clicked ──────────────────────────
    const [selectedToken, setSelectedToken] = useState(null);

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
            // Clear selected if it no longer exists
            if (selectedToken) {
                const still = (result.tokens || []).find(t => t._id === selectedToken._id);
                if (still) setSelectedToken(still);
            }
        } else {
            setError(result.error);
            setTokens([]);
        }
        setLoading(false);
    }, [userId, bookingEmail, phone, page, getMyTokens, selectedToken]);

    useEffect(() => {
        if (userId || email) {
            setBookingEmail(email || "");
            fetchTokens(email || "", "", 1);
        }
    }, [userId, email]);

    // Listen for "sq:tokenBooked" event to auto-refresh (dispatched by booking flow)
    useEffect(() => {
        const handler = () => {
            if (email || bookingEmail) fetchTokens(email || bookingEmail, phone, 1);
        };
        window.addEventListener("sq:tokenBooked", handler);
        return () => window.removeEventListener("sq:tokenBooked", handler);
    }, [email, bookingEmail, phone, fetchTokens]);

    // Auto-refresh every 30s ─────────────────────────────────────────────
    useEffect(() => {
        if (!searched) return;
        const interval = setInterval(() => {
            if (email || bookingEmail) fetchTokens(email || bookingEmail, phone, page);
        }, 30_000);
        return () => clearInterval(interval);
    }, [searched, email, bookingEmail, phone, page, fetchTokens]);

    // Refresh a single token's status (used by "Active Token Panel")
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
    const historyTokens = tokens.filter(t => DONE_STATUSES.includes(t.status));
    const displayTokens = activeTab === "active" ? activeTokens : historyTokens;

    // ── Panel data: selected token takes priority over latest active ───────
    const latestActive = activeTokens[0];
    const panelToken = selectedToken || latestActive;
    const bookedForPanel = buildPanelData(panelToken);

    // Static mode = user clicked a history token OR manually selected a non-active one
    const panelIsStatic = !!(selectedToken && DONE_STATUSES.includes(selectedToken.status));

    // Show panel when: something to show + not dismissed (unless user explicitly selected)
    const showPanel = bookedForPanel && (selectedToken ? true : !panelDismissed);

    const handleTokenClick = (token) => {
        // If clicking the already-selected token → deselect (close panel)
        if (selectedToken?._id === token._id) {
            setSelectedToken(null);
            return;
        }
        setSelectedToken(token);
        setPanelDismissed(false);
        // Scroll to top of page smoothly so panel is visible
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePanelDismiss = () => {
        if (selectedToken) {
            // User closed a manually-selected panel → just deselect
            setSelectedToken(null);
        } else {
            // User dismissed the auto-shown latest active panel
            setPanelDismissed(true);
        }
    };

    return (
        <div className="min-h-screen px-1.25 py-17.5">

            {/* ── Header ── */}
            <RevealSection delay={0}>
                <div className="relative mb-10 overflow-hidden">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#845EC2]/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 relative z-10">
                        <div className="flex-1">
                            <nav className="flex items-center gap-4 pt-6.25 mb-6 anim-fadeUp" style={{ animationDelay: '0s' }}>
                                <button onClick={() => navigate(-1)}
                                    className="group flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-all"
                                    style={{ color: "rgba(255,255,255,0.3)" }}>
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full border border-white/5 bg-white/2 group-hover:bg-[#00C9A7]/10 group-hover:border-[#00C9A7]/20 group-hover:text-[#00C9A7] transition-all">←</span>
                                    Back
                                </button>
                                <div className="h-4 w-px bg-white/10" />
                            </nav>

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

            {/* ── Guest gate ── */}
            {!isLoggedIn && <GuestGate />}

            {/* ── Active Token Panel ── */}
            {isLoggedIn && showPanel && (
                <ActiveTokenPanel
                    key={panelToken?._id} // re-mount when switching tokens
                    booked={bookedForPanel}
                    onDismiss={handlePanelDismiss}
                    staticMode={panelIsStatic}
                />
            )}

            {/* ── "Viewing" context hint ── */}
            {isLoggedIn && selectedToken && (
                <div className="mb-4 flex items-center gap-2 text-xs text-white/30"
                    style={{ fontFamily: "'serif', fangsong" }}>
                    <span>Viewing token</span>
                    <span className="font-bold px-2 py-0.5 rounded-lg"
                        style={{
                            background: `${selectedToken.serviceId?.color || "#00C9A7"}15`,
                            color: selectedToken.serviceId?.color || "#00C9A7",
                            border: `1px solid ${selectedToken.serviceId?.color || "#00C9A7"}30`,
                        }}>
                        {selectedToken.tokenNumber}
                    </span>
                    <button onClick={() => setSelectedToken(null)}
                        className="ml-1 hover:text-white/60 transition-colors">
                        × clear
                    </button>
                </div>
            )}

            {/* ── Tabs + token list ── */}
            {isLoggedIn && searched && !loading && (
                <RevealSection delay={0.06}>
                    <div className="flex gap-1 p-1 rounded-[14px] mb-6 w-fit"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        {[
                            { key: "active", label: `Active (${activeTokens.length})`, color: "#00C9A7" },
                            { key: "history", label: `History (${historyTokens.length})`, color: "#845EC2" },
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className="px-5 py-2 rounded-[11px] text-sm font-semibold transition-all duration-200"
                                style={{
                                    background: activeTab === tab.key ? `${tab.color}18` : "transparent",
                                    border: `1px solid ${activeTab === tab.key ? tab.color + "40" : "transparent"}`,
                                    color: activeTab === tab.key ? tab.color : "rgba(255,255,255,0.4)",
                                }}>
                                {tab.label}
                            </button>
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
                                <button onClick={() => navigate('/services')}
                                    className="btn inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-xl text-sm font-bold"
                                    style={{ background: "rgba(0,201,167,0.15)", border: "1px solid rgba(0,201,167,0.3)", color: "#00C9A7" }}>
                                    Browse Services →
                                </button>
                            )}
                        </div>
                    )}

                    {/* Token cards */}
                    {displayTokens.length > 0 && (
                        <div className="grid gap-4 mb-8"
                            style={{ gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))" }}>
                            {displayTokens.map((token, i) => (
                                <div key={token._id}
                                    style={{ animation: `cardIn .5s ${i * .05}s cubic-bezier(.22,1,.36,1) both` }}>
                                    <TokenCard
                                        token={token}
                                        onRefresh={["waiting", "next", "serving"].includes(token.status) ? refreshToken : null}
                                        onClick={() => handleTokenClick(token)}
                                        isSelected={selectedToken?._id === token._id}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {activeTab === "history" && totalPages > 1 && (
                        <div className="flex justify-center gap-2 mb-8">
                            <button onClick={() => { const p = page - 1; setPage(p); fetchTokens(bookingEmail, phone, p); }}
                                disabled={page === 1}
                                className="btn px-4 py-2 rounded-xl text-sm disabled:opacity-30"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8EDF5" }}>
                                ← Prev
                            </button>
                            <span className="self-center text-sm text-white/40">Page {page} of {totalPages}</span>
                            <button onClick={() => { const p = page + 1; setPage(p); fetchTokens(bookingEmail, phone, p); }}
                                disabled={page === totalPages}
                                className="btn px-4 py-2 rounded-xl text-sm disabled:opacity-30"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8EDF5" }}>
                                Next →
                            </button>
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