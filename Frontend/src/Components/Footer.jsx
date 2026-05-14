import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../Context/Authentication/AuthContext';

// Column definitions for user dashboard
const USER_COLS = [
    {
        title: "Explore",
        links: [
            { label: "Dashboard", to: "/" },
            { label: "Browse Services", to: "/services" },
            { label: "My Tokens", to: "/my-tokens" },
            { label: "Support Centre", to: "/support" },
            { label: "My History", to: "/history" },
        ]
    },
    {
        title: "Organizations",
        links: [
            { label: "Register Your Org", to: "/organizations" },
            { label: "How It Works", to: "/support" },
            { label: "Plans & Pricing", to: "/organizations" },
            { label: "Find a Service", to: "/services" },
            { label: "Book a Token", to: "/services" },
        ]
    },
    {
        title: "Company",
        links: [
            { label: "About SmartQueue", to: "/support" },
            { label: "Contact Us", to: "/support" },
            { label: "Privacy Policy", to: "/support" },
            { label: "Terms of Use", to: "/support" },
            { label: "Help Center", to: "/support" },
        ]
    },
];

// Column definitions for organization dashboard
const ORG_COLS = [
    {
        title: "Dashboard",
        links: [
            { label: "Overview", to: "/" },
            { label: "Queue Manager", to: "/queue" },
            { label: "Service Rooms", to: "/services" },
            { label: "Analytics", to: "/analytics" },
            { label: "Support", to: "/support" },
        ]
    },
    {
        title: "Manage",
        links: [
            { label: "Add New Counter", to: "/services" },
            { label: "Live Queue View", to: "/queue" },
            { label: "Token History", to: "/analytics" },
            { label: "Staff Controls", to: "/queue" },
            { label: "Reset Daily Stats", to: "/queue" },
        ]
    },
    {
        title: "Account",
        links: [
            { label: "My Profile", to: "/profile" },
            { label: "Edit Profile", to: "/editprofile" },
            { label: "Plan & Billing", to: "/support" },
            { label: "Help Center", to: "/support" },
            { label: "Contact Support", to: "/support" },
        ]
    },
];

const SOCIAL = [
    { label: "𝕏", href: "#" },
    { label: "in", href: "#" },
    { label: "f", href: "#" },
    { label: "▶", href: "#" },
];

const Footer = () => {
    const { userRole, username, authToken } = useContext(AuthContext);

    const isOrg = userRole?.includes("org");
    const isLoggedIn = !!authToken;

    const COLS = isOrg ? ORG_COLS : USER_COLS;

    // Accent colors per role
    const accent = isOrg ? "#a78bfa" : "#00C9A7";
    const accentAlt = isOrg ? "#818cf8" : "#4DA8DA";
    const accentBg = isOrg ? "rgba(167,139,250,0.08)" : "rgba(0,201,167,0.08)";
    const accentBord = isOrg ? "rgba(167,139,250,0.2)" : "rgba(0,201,167,0.2)";

    return (
        <footer
            className="relative border-t border-white/6 px-6 pt-14 pb-8"
            style={{ background: "#0B1120", fontFamily: "'serif','fangsong'", zIndex: 1 }}
        >
            {/* Subtle gradient top-glow */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-px pointer-events-none"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }}
            />

            <div className="max-w-7xl mx-auto">

                {/* Grid container */}
                <div
                    className="grid gap-12 mb-12"
                    style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}
                >

                    {/* Brand column */}
                    <div className="min-w-50">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5 mb-5">
                            <div
                                className="w-9 h-9 rounded-[10px] flex items-center justify-center font-extrabold text-[17px] text-black shrink-0"
                                style={{ background: `linear-gradient(135deg, ${accent}, ${accentAlt})`, fontFamily: "'Space Grotesk',sans-serif" }}
                            >Q</div>
                            <span className="font-bold text-white text-xl">SmartQueue</span>
                        </div>

                        {/* Role-specific tagline */}
                        {isOrg ? (
                            <p className="text-sm text-white/35 leading-[1.85] max-w-65">
                                Your organization dashboard. Manage service counters, track queues in real-time, and serve your customers efficiently.
                            </p>
                        ) : (
                            <p className="text-sm text-white/35 leading-[1.85] max-w-65">
                                Skip the wait. Book tokens at hospitals, banks, clinics, and government offices — instantly from your phone.
                            </p>
                        )}

                        {/* Logged-in user badge */}
                        {isLoggedIn && (
                            <div
                                className="inline-flex items-center gap-2 mt-5 px-3 py-1.5 rounded-full"
                                style={{ background: accentBg, border: `1px solid ${accentBord}` }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>
                                    {isOrg ? "Organisation Portal" : `Hi, ${username || "User"}`}
                                </span>
                            </div>
                        )}

                        {/* Social icons */}
                        <div className="flex gap-2 mt-5">
                            {SOCIAL.map(s => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white/35 transition-all duration-200 hover:text-white cursor-pointer"
                                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}50`; e.currentTarget.style.color = accent; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
                                >
                                    {s.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Nav columns */}
                    {COLS.map(col => (
                        <div key={col.title}>
                            <p className="text-[11px] font-bold text-white/40 tracking-[1.8px] uppercase mb-4">
                                {col.title}
                            </p>
                            <ul className="flex flex-col gap-2.5">
                                {col.links.map(link => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.to}
                                            className="text-[13.5px] text-white/40 transition-all duration-200 flex items-center gap-1.5 group w-fit"
                                            style={{ textDecoration: "none" }}
                                            onMouseEnter={e => e.currentTarget.style.color = accent}
                                            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
                                        >
                                            <span
                                                className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200 text-[10px]"
                                                style={{ color: accent }}
                                            >→</span>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom grid */}
                <div
                    className="border-t border-white/5 pt-6 flex flex-wrap justify-between items-center gap-4"
                >
                    <span className="text-[12px] text-white/25">
                        © 2026 SmartQueue Systems. All rights reserved.
                    </span>

                    {/* System status pill */}
                    <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                        style={{ background: "rgba(0,201,167,0.06)", border: "1px solid rgba(0,201,167,0.15)" }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: "#00C9A7", boxShadow: "0 0 6px #00C9A7", animation: "pulse 2s infinite" }}
                        />
                        <span className="text-[11px] text-white/40 font-medium">All systems operational</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Role badge */}
                        {isLoggedIn && (
                            <span
                                className="text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider"
                                style={{ background: accentBg, color: accent, border: `1px solid ${accentBord}` }}
                            >
                                {isOrg ? "🏢 Org Admin" : "👤 User"}
                            </span>
                        )}
                        <span className="text-[12px] text-white/25">
                            v3.0.0 · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                    </div>
                </div>
            </div>
        </footer >
    );
};

export default Footer;