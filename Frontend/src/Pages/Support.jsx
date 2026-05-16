import React, { useState, useEffect, useRef } from 'react'
import QuickLinks from '../Components/QuickLinks';
import FAQ from '../Components/FAQ';
import ContactTab from '../Components/ContactTab';
import { Send, ShieldQuestionMark } from 'lucide-react';
import { color } from 'framer-motion';
import Chat from '../Components/Chat';
import { useContext } from 'react';
import AuthContext from '../Context/Authentication/AuthContext';
import DocsPage from '../Components/DocsPage';

const DEFAULT_FAQS = [
    {
        category: "Getting Started",
        color: "#00C9A7",
        icon: "🚀",
        items: [
            { q: "What is SmartQueue?", a: "SmartQueue is a digital queue management platform that helps organizations manage service counters efficiently and lets users book tokens for services without waiting in physical lines." },
            { q: "How do I create an account?", a: "Click 'Sign Up' on the home page, enter your name, email, and password, then verify your email via the OTP sent to you. Once verified, you're ready to book tokens or register your organization." },
            { q: "Is SmartQueue free to use?", a: "SmartQueue is free for individual users booking tokens. Organizations are offered multiple plans (Starter, Pro, Enterprise) based on counter limits and daily token capacity. Visit our Plans page for details." },
            { q: "Which devices and browsers are supported?", a: "SmartQueue works on any modern browser (Chrome, Firefox, Safari, Edge) on desktop, tablet, and mobile. A dedicated mobile app is on our roadmap." },
        ]
    },
    {
        category: "Tokens & Booking",
        color: "#a78bfa",
        icon: "🎟️",
        items: [
            { q: "Do I need an account to book a token?", a: "You need to be logged in to book and track tokens. Creating a free account takes under a minute — just an email and password." },
            { q: "How do I find services near me?", a: "After logging in, use the 'Browse Services' section on your dashboard. Services are listed by organization and category. You can search by name or filter by service type." },
            { q: "What happens after I book a token?", a: "You instantly receive a token number and an estimated wait time. You can monitor your position in the queue in real-time from the 'My Tokens' panel on your dashboard." },
        ]
    },
    {
        category: "Organization Registration",
        color: "#fbbf24",
        icon: "🏢",
        items: [
            { q: "How do I register my organization on SmartQueue?", a: "Click 'Register Your Organization' on the home page. You'll need your Registration Certificate, GST Certificate, and Owner ID Proof. Our team reviews submissions within 2–3 business days." },
            { q: "What documents are required for registration?", a: "Required: Registration Certificate, GST Certificate, Owner/Director ID Proof. Optional but recommended: Address Proof and your organization's logo. All documents are securely stored on Cloudinary." },
            { q: "How long does organization approval take?", a: "Our team typically reviews and approves organization registrations within 2–3 business days. You'll receive a confirmation email once approved, along with your admin credentials." },
        ]
    },
    {
        category: "Account & Security",
        color: "#f43f5e",
        icon: "🔒",
        items: [
            { q: "How do I reset my password?", a: "Use the 'Forgot Password' link on the login page. Enter your registered email to receive an OTP, then set a new password. OTPs expire in 10 minutes." },
            { q: "Is my personal data secure?", a: "Yes. Passwords are hashed with bcrypt before storage. API routes are protected by JWT-based middleware. Activity logs auto-delete after 30 days to minimize data retention." },
        ]
    },
    {
        category: "Live Support",
        color: "#60a5fa",
        icon: "💬",
        items: [
            { q: "How can I contact the SmartQueue support team?", a: "You can reach us via the Contact Us tab on this page, or start a live chat. Our team is available Mon–Sat, 9 AM – 6 PM." },
            { q: "How does live chat work?", a: "Click 'Start Chat' in the Support section. Our support team typically responds within 2 minutes during business hours (Mon–Sat, 9 AM – 6 PM)." },
        ]
    },
];

const USER_FAQS = [
    {
        category: "Tokens & Booking",
        color: "#00C9A7",
        icon: "🎟️",
        items: [
            { q: "How do I book a token for a service?", a: "Navigate to the Browse Services section on your dashboard. Find the service you need, click 'Book Token', fill in your name, phone, and optional email, then confirm. You'll receive a token number with your estimated wait time instantly." },
            { q: "Can I book multiple tokens at the same time?", a: "Yes — you can hold up to 2 active tokens per service simultaneously. Across different services, there's no limit. All your active tokens appear in the 'My Tokens' panel on your dashboard." },
            { q: "What happens if I miss my turn?", a: "If you don't show up when called, the staff can mark your token as 'No Show'. Your token is then moved out of the queue. You'll need to book a new token to re-enter." },
            { q: "Can I cancel a token I've already booked?", a: "Token cancellation is currently handled at the service counter. Contact the organization's staff and they can remove you from the queue. Self-cancellation from the app is on our roadmap." },
        ]
    },
    {
        category: "Account & Profile",
        color: "#f43f5e",
        icon: "🔒",
        items: [
            { q: "How do I reset my password?", a: "Use the 'Forgot Password' link on the login page. Enter your registered email to receive an OTP, then set a new password. OTPs expire in 10 minutes." },
            { q: "Is my personal data secure?", a: "Yes. Passwords are hashed with bcrypt before storage. API routes are protected by JWT-based middleware. Activity logs auto-delete after 30 days to minimize data retention." },
            { q: "How do I update my profile information?", a: "Go to your Profile page from the dashboard. You can update your display name, email, and other details. Some fields may require re-verification." },
        ]
    },
    {
        category: "Live Support",
        color: "#a78bfa",
        icon: "💬",
        items: [
            { q: "How does live chat work?", a: "Click 'Start Chat' in the Support section to open a live chat window. Our support team typically responds within 2 minutes during business hours (Mon–Sat, 9 AM – 6 PM)." },
            { q: "Can I send files in the live chat?", a: "Yes! You can attach images and documents (PDF, etc.) directly in the chat window. Click the attachment icon next to the message input to upload files." },
        ]
    },
];

const ORG_FAQS = [
    {
        category: "Organization Registration",
        color: "#a78bfa",
        icon: "🏢",
        items: [
            { q: "How do I register my organization on SmartQueue?", a: "Click 'Register Your Organization' on the home page. You'll need your Registration Certificate, GST Certificate, and Owner ID Proof. Complete the multi-step form and our team will review within 2–3 business days." },
            { q: "What documents are required for registration?", a: "Required: Registration Certificate, GST Certificate, Owner/Director ID Proof. Optional but recommended: Address Proof document and your organization's logo. All documents are securely stored on Cloudinary." },
            { q: "Why was my organization's registration rejected?", a: "Common reasons include mismatched document details, an already-registered email or GST number, or incomplete information. Check the rejection email for the specific reason and resubmit with corrected documents." },
            { q: "How do I upgrade my organization's plan?", a: "Contact our support team or ask your SuperAdmin to update the plan from the Admin Dashboard → Plans page. Plan changes take effect immediately and affect your counter limits and daily token capacity." },
        ]
    },
    {
        category: "Queue Management",
        color: "#fbbf24",
        icon: "📋",
        items: [
            { q: "How do I set up a service counter?", a: "Log into your Organization Dashboard, go to Services, and click 'Create New Service'. Provide the counter name, icon, color, maximum queue size, and average wait time per person. Your counter goes live immediately." },
            { q: "What's the difference between 'Paused' and 'Closed' status?", a: "'Paused' temporarily stops new tokens from being served while keeping the queue intact — useful for short breaks. 'Closed' ends the counter for the day. Stats remain, but the counter appears unavailable to users." },
            { q: "How does the 'Promote to Front' feature work?", a: "Selecting 'Move to Front' on any waiting token instantly places that person as next to be served. All other positions shift down by one. Use this for priority cases like elderly patients or VIP customers." },
            { q: "When should I reset daily stats?", a: "Reset stats at the start of each working day to clear the token sequence and counters (served, skipped, no-shows). Stats are not automatically reset by the system." },
        ]
    },
    {
        category: "Account & Security",
        color: "#f43f5e",
        icon: "🔒",
        items: [
            { q: "How do I reset my organization admin password?", a: "Your organization admin credentials were emailed when your registration was approved. Use the 'Forgot Password' flow on the login page to receive an OTP at your registered email, then set a new password." },
            { q: "Is my data secure on SmartQueue?", a: "Yes. All documents are stored encrypted on Cloudinary. Passwords are hashed with bcrypt. API routes are protected by JWT-based middleware. Activity logs auto-delete after 30 days." },
        ]
    },
    {
        category: "Analytics & Reporting",
        color: "#00C9A7",
        icon: "📈",
        items: [
            { q: "What analytics are available for my organization?", a: "Your Analytics page shows daily served tokens, average wait times, peak hours, queue performance per service, and trend comparisons over time." },
            { q: "Can I export my queue data?", a: "Analytics export is on our roadmap for Pro and Enterprise plan users. Currently, stats are viewable in the dashboard. Contact support for custom data exports." },
        ]
    },
];

// Function to get FAQs based on user role
const getFaqs = (userRole) => {
    if (userRole === "user") return USER_FAQS;
 
    if (userRole && userRole !== "user") return ORG_FAQS;
 
    return DEFAULT_FAQS;
};

const Support = () => {
    const { userRole } = useContext(AuthContext);

    const FAQS = getFaqs(userRole);

    const [search, setSearch] = useState("");
    const [openFaqs, setOpenFaqs] = useState({});
    const [activeTab, setActiveTab] = useState("faq");
    const [activeChat, setActiveChat] = useState(false);
    const [expandedCat, setExpandedCat] = useState(null);
    const [searchResult, setSearchResult] = useState([]);
    const [showDocs, setShowDocs] = useState(false);
    const heroRef = useRef(null);
    const faqRef = useRef(null);
    const formRef = useRef(null);

    /* ── Search logic ────────────────────────────────────────────────── */
    useEffect(() => {
        if (!search.trim()) { setSearchResult([]); return; }
        const q = search.toLowerCase();
        const results = [];
        FAQS.forEach(cat => {
            cat.items.forEach(item => {
                if (item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)) {
                    results.push({ ...item, category: cat.category, color: cat.color, icon: cat.icon });
                }
            });
        });
        setSearchResult(results);
    }, [search]);

    // Handle live chat
    const handleStartLiveChat = () => {
        setActiveChat(true);
    };

    // Toggle FAQ item
    const toggleFaq = (catIdx, itemIdx) => {
        const key = `${catIdx}-${itemIdx}`;
        setOpenFaqs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    return (
        <div className="min-h-screen"
            style={{
                background: "#121827",
                color: "#E8EDF5",
                fontFamily: "'serif','fangsong'",
            }}
        >
            <div className="relative" style={{ zIndex: 1 }}>
                {/* Documentation Page */}
                {showDocs && (
                    <DocsPage onClose={() => setShowDocs(false)} />
                )}

                {/* ── Hero Section ─────────────────────────────────────────── */}
                <div ref={heroRef} style={{ padding: "80px 24px 64px" }}>
                    <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>

                        {/* Badge */}
                        <div
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                            style={{
                                background: "rgba(0,201,167,0.08)",
                                border: "1px solid rgba(0,201,167,0.2)",
                                animation: "fadeIn .8s both",
                            }}
                        >
                            <span className="relative flex" style={{ width: 7, height: 7 }}>
                                <span className="absolute inline-flex rounded-full" style={{ width: 7, height: 7, background: "#00C9A7", animation: "ping 2s infinite", opacity: .7 }} />
                                <span className="relative inline-flex rounded-full" style={{ width: 7, height: 7, background: "#00C9A7" }} />
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#00C9A7" }}>
                                Support Centre
                            </span>
                        </div>

                        {/* Heading */}
                        <h1
                            style={{
                                fontSize: "clamp(2.6rem, 6vw, 4.2rem)",
                                fontWeight: 900,
                                lineHeight: 1.05,
                                letterSpacing: "-2.5px",
                                marginBottom: 20,
                                animation: "fadeUp .7s .1s both",
                            }}
                        >
                            How can we{" "}
                            <span className="shimmer-text">help you</span>
                            <span style={{ color: "#E8EDF5" }}>?</span>
                        </h1>

                        <p style={{
                            fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 480,
                            margin: "0 auto 40px", lineHeight: 1.7, fontWeight: 500,
                            animation: "fadeUp .7s .18s both",
                        }}>
                            Search our knowledge base, browse FAQs, or reach out to our team — we're here around the clock.
                        </p>

                        {/* Search Bar */}
                        <div
                            className="search-glow"
                            style={{
                                position: "relative", maxWidth: 800, margin: "0 auto",
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 18, display: "flex", alignItems: "center",
                                padding: "8px 5px 8px 18px",
                                animation: "fadeUp .7s .26s both",
                            }}
                        >
                            <span style={{ fontSize: 18, opacity: .4, marginRight: 10, flexShrink: 0 }}>🔍</span>
                            <input
                                className="search-input text-[14px] md:text-[16px]"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search questions, topics, features…"
                                style={{
                                    flex: 1, background: "transparent", border: "none",
                                    color: "#E8EDF5", fontFamily: "inherit",
                                    padding: "10px 0",
                                }}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    style={{
                                        background: "rgba(255,255,255,0.07)", border: "none",
                                        color: "rgba(255,255,255,0.5)", borderRadius: 10,
                                        padding: "6px 12px", cursor: "pointer", fontSize: 13,
                                        fontFamily: "inherit", marginRight: 4,
                                    }}
                                >✕</button>
                            )}
                            <button
                                style={{
                                    background: "#00C9A7", border: "none", borderRadius: 14,
                                    color: "#000", fontWeight: 800, fontSize: 14,
                                    padding: "10px 22px", cursor: "pointer", fontFamily: "inherit",
                                    flexShrink: 0,
                                }}
                            >Search</button>
                        </div>

                        {/* Search results */}
                        {search && (
                            <div
                                className="glass rounded-2xl mt-3 text-left overflow-hidden"
                                style={{
                                    maxWidth: 800, margin: "12px auto 0",
                                    animation: "fadeUp .25s both",
                                    maxHeight: 320, overflowY: "auto",
                                }}
                            >
                                {searchResult.length === 0 ? (
                                    <div style={{ padding: "24px 20px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                                        No results found for "<strong style={{ color: "rgba(255,255,255,0.5)" }}>{search}</strong>"
                                    </div>
                                ) : (
                                    searchResult.map((r, i) => (
                                        <div key={i} className="tbl-row" style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                                    background: `${r.color}15`, border: `1px solid ${r.color}25`,
                                                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                                                }}>{r.icon}</div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 2 }}>{r.q}</div>
                                                    <div style={{ fontSize: 11, color: r.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{r.category}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick links */}
                <QuickLinks onStartLiveChat={handleStartLiveChat} onOpenDocs={() => setShowDocs(true)} />
                {activeChat && (
                    <Chat onClose={() => setActiveChat(false)} />
                )}

                {/* Tabs and content */}
                <div style={{ padding: "0 24px 80px" }}>
                    <div style={{ maxWidth: 900, margin: "50px auto", textAlign: "center" }}>
                        <div
                            className="glass rounded-2xl p-1.5 flex gap-1 mb-8 max-w-75"
                            style={{
                                display: "inline-flex",
                                animation: "fadeIn .6s .2s both",
                            }}
                        >
                            {[
                                { id: "faq", label: "FAQ", icon: <ShieldQuestionMark />, color: "#FF6B6B" },
                                { id: "contact", label: "Contact Us", icon: <Send />, color: "#00C9A7" },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        padding: "9px 18px", borderRadius: 12,
                                        border: "1px solid transparent",
                                        color: activeTab === tab.id ? "#00C9A7" : "rgba(255,255,255,0.4)",
                                        fontSize: 18, fontWeight: 700, cursor: "pointer",
                                        background: "transparent", fontFamily: "inherit",
                                        display: "flex", alignItems: "center", gap: 7,
                                    }}
                                >
                                    <span style={{ fontSize: 15, color: tab.color }}>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* FAQ Tab Content */}
                        {activeTab === "faq" && (
                            <FAQ FAQS={FAQS} faqRef={faqRef} expandedCat={expandedCat} setExpandedCat={setExpandedCat} toggleFaq={toggleFaq} openFaqs={openFaqs} />
                        )}

                        {/* Contact Tab Content */}
                        {activeTab === "contact" && (
                            <ContactTab formRef={formRef} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Support
