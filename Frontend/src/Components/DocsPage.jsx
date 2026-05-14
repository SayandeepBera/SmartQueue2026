import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, BookOpen, Users, Building2, LayoutGrid, BarChart3, Shield, HelpCircle, Zap, Search } from 'lucide-react';

// Section definitions for sidebar and content structure
const SECTIONS = [
    { id: "overview", label: "Overview", icon: <BookOpen size={14} /> },
    { id: "getting-started", label: "Getting Started", icon: <Zap size={14} /> },
    { id: "for-users", label: "For Users", icon: <Users size={14} /> },
    { id: "for-organizations", label: "For Organizations", icon: <Building2 size={14} /> },
    { id: "queue-management", label: "Queue Management", icon: <LayoutGrid size={14} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={14} /> },
    { id: "security", label: "Security & Privacy", icon: <Shield size={14} /> },
    { id: "faq", label: "FAQ", icon: <HelpCircle size={14} /> },
];

// Reusable components for consistent styling across the docs
const Heading = ({ children, id }) => (
    <h2 id={id} style={{ fontSize: 22, fontWeight: 900, color: "#E8EDF5", marginBottom: 12, marginTop: 32, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 10 }}>
        {children}
    </h2>
);

// Subheading, paragraph, callout, step item, and table components for structured content
const SubHeading = ({ children }) => (
    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#00C9A7", marginBottom: 8, marginTop: 24 }}>{children}</h3>
);

const P = ({ children }) => (
    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.85, marginBottom: 12 }}>{children}</p>
);

const Callout = ({ type = "info", children }) => {
    const styles = {
        info: { bg: "rgba(0,201,167,0.06)", border: "rgba(0,201,167,0.2)", icon: "💡", label: "Note" },
        warning: { bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.25)", icon: "⚠️", label: "Important" },
        tip: { bg: "rgba(167,139,250,0.06)", border: "rgba(167,139,250,0.25)", icon: "✨", label: "Tip" },
    }[type];
    return (
        <div style={{ background: styles.bg, border: `1px solid ${styles.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                {styles.icon} {styles.label}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{children}</p>
        </div>
    );
};

const StepItem = ({ n, title, children }) => (
    <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#00C9A7", flexShrink: 0 }}>{n}</div>
        <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#E8EDF5", marginBottom: 3 }}>{title}</div>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{children}</p>
        </div>
    </div>
);

const Table = ({ headers, rows }) => (
    <div style={{ overflowX: "auto", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
                <tr style={{ background: "rgba(0,201,167,0.06)" }}>
                    {headers.map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#00C9A7", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid rgba(0,201,167,0.2)" }}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        {row.map((cell, j) => (
                            <td key={j} style={{ padding: "10px 14px", color: "rgba(255,255,255,0.6)", verticalAlign: "top" }}>{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const DocsPage = ({ onClose }) => {
    const [activeSection, setActiveSection] = useState("overview");
    const [searchDoc, setSearchDoc] = useState("");

    // Scroll spy
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
            },
            { rootMargin: "-20% 0px -70% 0px" }
        );
        SECTIONS.forEach(s => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSection(id);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 inset-0 z-9998"
            style={{ background: "#0a0f1e", fontFamily: "'serif','fangsong'" }}
        >
            {/* Topbar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/6"
                style={{ background: "rgba(10,15,30,0.95)", backdropFilter: "blur(12px)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.2)" }}>
                        <BookOpen size={16} className="text-[#00C9A7]" />
                    </div>
                    <div>
                        <span className="font-bold text-white text-base">SmartQueue Docs</span>
                        <span className="ml-2 text-[10px] text-[#00C9A7] font-bold uppercase tracking-widest border border-[#00C9A7]/30 rounded px-1.5 py-0.5">v1.0</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-3 py-2">
                        <Search size={14} className="text-white/30" />
                        <input value={searchDoc} onChange={e => setSearchDoc(e.target.value)} placeholder="Search docs…"
                            className="bg-transparent w-40 md:w-60 border-none outline-none text-sm text-white/70 placeholder:text-white/25"
                            style={{ fontFamily: "inherit" }} />
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/8 transition text-white/40 hover:text-white">
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="flex" style={{ height: "calc(100vh - 65px)" }}>
                {/* Sidebar */}
                <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-white/6 py-6 px-3 overflow-y-auto">
                    <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest px-3 mb-3">Contents</p>
                    {SECTIONS.map(s => (
                        <button key={s.id} onClick={() => scrollTo(s.id)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all mb-0.5 w-full"
                            style={{
                                background: activeSection === s.id ? "rgba(0,201,167,0.08)" : "transparent",
                                border: `1px solid ${activeSection === s.id ? "rgba(0,201,167,0.2)" : "transparent"}`,
                                color: activeSection === s.id ? "#00C9A7" : "rgba(255,255,255,0.4)",
                                fontSize: 13, fontWeight: activeSection === s.id ? 700 : 500,
                                fontFamily: "inherit",
                            }}>
                            <span style={{ color: activeSection === s.id ? "#00C9A7" : "rgba(255,255,255,0.25)" }}>{s.icon}</span>
                            {s.label}
                            {activeSection === s.id && <ChevronRight size={12} className="ml-auto" />}
                        </button>
                    ))}
                </aside>

                {/* Content */}
                <main className="flex-1 overflow-y-auto">
                    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>

                        {/* Overview */}
                        <section id="overview">
                            <Heading id="overview">📋 SmartQueue Overview</Heading>
                            <P>SmartQueue is a full-stack queue management platform designed to eliminate physical waiting lines. Organizations can create virtual service counters, and users can book tokens digitally — getting real-time updates on their queue position without standing in line.</P>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                                {[
                                    { icon: "🏥", label: "Hospitals & Clinics", desc: "Patient flow management across OPD, labs, and billing" },
                                    { icon: "🏦", label: "Banks & Government", desc: "Customer service counters with priority queue support" },
                                    { icon: "🎛️", label: "Any Service Business", desc: "Configurable for any multi-counter service environment" },
                                ].map(c => (
                                    <div key={c.label} style={{ padding: 18, borderRadius: 14, background: "rgba(0,201,167,0.04)", border: "1px solid rgba(0,201,167,0.12)" }}>
                                        <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "#E8EDF5", marginBottom: 4 }}>{c.label}</div>
                                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{c.desc}</div>
                                    </div>
                                ))}
                            </div>
                            <Callout type="info">SmartQueue supports three user types: regular Users (token bookers), Organization Admins (queue managers), and Super Admins (platform managers).</Callout>
                        </section>

                        {/* Getting Started */}
                        <section id="getting-started">
                            <Heading id="getting-started">⚡ Getting Started</Heading>
                            <SubHeading>For Users</SubHeading>
                            <StepItem n="1" title="Create an Account">Visit the SmartQueue portal and register with your email and phone number. Verification is instant.</StepItem>
                            <StepItem n="2" title="Find a Service">Browse the map or search for nearby organizations offering the service you need.</StepItem>
                            <StepItem n="3" title="Book a Token">Select the service counter, enter your details, and receive your token number immediately.</StepItem>
                            <StepItem n="4" title="Track in Real-time">Monitor your queue position and estimated wait time from the dashboard. Arrive just in time.</StepItem>
                            <SubHeading>For Organizations</SubHeading>
                            <StepItem n="1" title="Register Your Organization">Submit your organization details and required documents (Registration Certificate, GST, ID Proof) via the registration form.</StepItem>
                            <StepItem n="2" title="Await Approval">Our admin team reviews submissions within 1–2 business days. You'll receive credentials via email upon approval.</StepItem>
                            <StepItem n="3" title="Set Up Service Counters">Log in and create service rooms with customized names, icons, queue limits, and wait time estimates.</StepItem>
                            <StepItem n="4" title="Go Live">Your counters are immediately visible to users on the map and can start accepting bookings right away.</StepItem>
                        </section>

                        {/* For Users */}
                        <section id="for-users">
                            <Heading id="for-users">👤 For Users</Heading>
                            <SubHeading>Dashboard Overview</SubHeading>
                            <P>Your user dashboard shows active tokens, nearby organizations, recent activity, and live chat support access. The map view shows all approved organizations in your area with their current service status.</P>
                            <SubHeading>Booking Tokens</SubHeading>
                            <P>You can hold up to 2 active tokens per service simultaneously. Across different services and organizations, there's no limit. Tokens are automatically invalidated after a service counter is closed for the day.</P>
                            <Table
                                headers={["Token Status", "Meaning", "Action Available"]}
                                rows={[
                                    ["Waiting", "In queue, not yet called", "View position & ETA"],
                                    ["Called", "It's your turn at the counter", "Proceed immediately"],
                                    ["Served", "Completed successfully", "Rate experience (coming soon)"],
                                    ["No Show", "You missed your turn", "Book a new token"],
                                    ["Skipped", "Moved to back of queue", "Re-enter queue"],
                                ]}
                            />
                            <Callout type="tip">Enable browser notifications to get alerted when your turn is approaching. Go to Settings → Notifications in your dashboard.</Callout>
                            <SubHeading>Activity History</SubHeading>
                            <P>Your recent queue activity (served, skipped, no-shows) is visible on your dashboard's activity panel. This helps you track which organizations you've visited and services you've used.</P>
                        </section>

                        {/* For Organizations */}
                        <section id="for-organizations">
                            <Heading id="for-organizations">🏢 For Organizations</Heading>
                            <SubHeading>Registration Requirements</SubHeading>
                            <Table
                                headers={["Document", "Required?", "Purpose"]}
                                rows={[
                                    ["Registration Certificate", "Yes", "Verifies legal existence of the organization"],
                                    ["GST Certificate", "Yes", "Tax identification and legitimacy"],
                                    ["Owner/Director ID Proof", "Yes", "Identity verification of admin contact"],
                                    ["Address Proof", "Optional", "Physical location verification"],
                                    ["Organization Logo", "Optional", "Displayed on public map and token emails"],
                                ]}
                            />
                            <Callout type="warning">Documents must be clear, legible, and match the information entered in the registration form. Mismatched details are the most common rejection reason.</Callout>
                            <SubHeading>Plan Limits</SubHeading>
                            <Table
                                headers={["Plan", "Service Counters", "Daily Tokens", "Analytics"]}
                                rows={[
                                    ["Free", "Up to 2", "100/day", "Basic"],
                                    ["Starter", "Up to 5", "500/day", "Standard"],
                                    ["Pro", "Up to 15", "2000/day", "Advanced"],
                                    ["Enterprise", "Unlimited", "Unlimited", "Full + Export"],
                                ]}
                            />
                            <SubHeading>Organization Status Flow</SubHeading>
                            <P>After registration, your organization moves through: Pending → Approved (or Rejected). If rejected, you can resubmit with corrected documents. Approved organizations can be suspended or scheduled for deletion by the platform admin.</P>
                        </section>

                        {/* Queue Management */}
                        <section id="queue-management">
                            <Heading id="queue-management">🎛️ Queue Management</Heading>
                            <SubHeading>Service Counter States</SubHeading>
                            <Table
                                headers={["State", "Effect on Queue", "Visible to Users?"]}
                                rows={[
                                    ["Active", "New tokens accepted, serving in progress", "Yes — bookable"],
                                    ["Paused", "Queue preserved, no new serving", "Yes — visible but paused"],
                                    ["Closed", "Counter ended for the day", "Yes — unavailable"],
                                ]}
                            />
                            <SubHeading>Token Lifecycle</SubHeading>
                            <StepItem n="1" title="Waiting">Token is placed in queue. Position and ETA are visible to the user.</StepItem>
                            <StepItem n="2" title="Called / Serving">Staff advances to the next token. The user is notified it's their turn.</StepItem>
                            <StepItem n="3" title="Served / No Show / Skipped">The token is marked with a final status. Stats are updated instantly.</StepItem>
                            <SubHeading>Priority Management</SubHeading>
                            <P>The "Move to Front" feature instantly elevates any waiting token to the next position. All other tokens shift down by one. This is designed for priority cases: elderly patients, VIP customers, or emergency situations.</P>
                            <Callout type="tip">Reset daily stats at the start of each working day. This clears the token sequence counter and serves statistics, giving you a fresh view each morning.</Callout>
                            <SubHeading>Daily Reset Best Practices</SubHeading>
                            <P>Stats are NOT automatically reset. Organization admins should manually reset at the start of each working day. Resetting clears: token sequence number, served/skipped/no-show counts. It does NOT delete historical data used in Analytics.</P>
                        </section>

                        {/* Analytics */}
                        <section id="analytics">
                            <Heading id="analytics">📈 Analytics</Heading>
                            <SubHeading>Available Metrics</SubHeading>
                            <Table
                                headers={["Metric", "Description", "Available On"]}
                                rows={[
                                    ["Daily Served", "Total tokens served per day", "All plans"],
                                    ["Average Wait Time", "Mean time from booking to being served", "All plans"],
                                    ["Peak Hours", "Hours with highest token bookings", "Starter+"],
                                    ["Queue Efficiency", "Ratio of served vs. no-shows", "Starter+"],
                                    ["Trend Comparison", "Week-over-week service comparisons", "Pro+"],
                                    ["Service Breakdown", "Per-counter performance analytics", "Pro+"],
                                    ["Data Export", "CSV/PDF export of all analytics data", "Enterprise"],
                                ]}
                            />
                            <Callout type="info">Analytics data is aggregated nightly. Changes made during the day may take up to 24 hours to fully appear in trend charts.</Callout>
                        </section>

                        {/* Security */}
                        <section id="security">
                            <Heading id="security">🔒 Security & Privacy</Heading>
                            <SubHeading>Data Protection</SubHeading>
                            <P>All uploaded documents (registration certificates, ID proofs, GST certificates) are stored encrypted on Cloudinary with restricted access. No document is publicly accessible without a private URL.</P>
                            <SubHeading>Authentication</SubHeading>
                            <P>SmartQueue uses JWT (JSON Web Tokens) for session management. Tokens expire after a set period and must be refreshed. Passwords are hashed using bcrypt with salt rounds before storage — plain text passwords are never stored.</P>
                            <SubHeading>Activity Logging</SubHeading>
                            <P>Admin actions (organization approvals, status changes, plan updates) are logged with timestamps, actor identity, and affected entity. Activity logs auto-delete after 30 days to minimize data retention.</P>
                            <Table
                                headers={["Data Type", "Storage", "Retention"]}
                                rows={[
                                    ["User passwords", "bcrypt hash only", "Until account deletion"],
                                    ["Organization documents", "Cloudinary (encrypted)", "Until org deletion"],
                                    ["Queue tokens", "MongoDB", "Indefinite (for analytics)"],
                                    ["Admin activity logs", "MongoDB", "30 days rolling"],
                                    ["Chat messages", "MongoDB", "Until conversation closed"],
                                ]}
                            />
                            <Callout type="warning">If your organization is permanently deleted, all uploaded documents are irrecoverably removed from Cloudinary. This action cannot be undone.</Callout>
                        </section>

                        {/* FAQ */}
                        <section id="faq">
                            <Heading id="faq">❓ Frequently Asked Questions</Heading>
                            {[
                                { q: "Can I use SmartQueue without creating an account?", a: "You can browse the public map and view organizations. However, booking tokens requires a registered account." },
                                { q: "How does the wait time estimate work?", a: "Wait time is calculated as: (your queue position - 1) × average service time per token for that counter. The organization sets the average service time when creating the counter." },
                                { q: "What happens to my token if the counter is paused?", a: "Your token remains in the queue in its current position. When the counter resumes, tokens continue to be served in order. Your wait time estimate is paused as well." },
                                { q: "How do I contact support?", a: "Use the Contact Us tab on this Support page to send a message, or start a Live Chat for immediate assistance. Our team responds within 4 hours during Mon–Sat, 9 AM – 6 PM." },
                                { q: "Can organizations issue tokens manually?", a: "Currently, tokens are booked by users through the app. Manual token issuance by organization staff is on the roadmap for future releases." },
                                { q: "Is there an API for integration with existing hospital systems?", a: "Enterprise plan users can request API access for integration with existing HIS/EMR systems. Contact our enterprise sales team at enterprise@smartqueue.app." },
                            ].map((item, i) => (
                                <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 16, marginBottom: 16 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#E8EDF5", marginBottom: 6 }}>Q: {item.q}</div>
                                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>A: {item.a}</div>
                                </div>
                            ))}
                        </section>

                    </div>
                </main>
            </div>
        </motion.div>
    );
};

export default DocsPage;