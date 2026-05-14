import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../Context/Authentication/AuthContext';
import { LuUserRound, LuHistory, LuUserRoundPen } from "react-icons/lu";
import { TbLogout } from "react-icons/tb";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Labels for the topbar based on the active page
const orgs_labels = {
    overview: "Overview",
    queue: "Queue Manager",
    services: "Service Rooms",
    analytics: "Analytics",
    settings: "Settings"
};

const admin_labels = {
    overview: "Platform Overview",
    orgs: "Manage Organizations",
    users: "Manage Users",
    plans: "Plans & Revenue",
    activity: "Activity Log",
};

const Topbar = ({ active, time, pendingCount, collapsed, setCollapsed, onAddService, onMenuToggle }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const { authToken, userLogout, username, userRole } = useContext(AuthContext);

    const isLoggedin = !!authToken;
    const capitalizedUsername = username ? username.charAt(0).toUpperCase() + username.slice(1) : "User";

    // Labels for the topbar based on the active page
    const labels = userRole === "admin" ? admin_labels : orgs_labels;

    const isAdmin = userRole === "admin";

    // Define submenu items for the user dropdown
    const subMenuItems = [
        { name: "Profile", icon: <LuUserRound size={18} className="mr-2.5" />, path: "/profile" },
        { name: "Edit Profile", icon: <LuUserRoundPen size={18} className="mr-2.5" />, path: "/editprofile" },
        ...(!isAdmin ? [{ name: "Support", icon: <LuHistory size={18} className="mr-2.5" />, path: "/support" }] : []),
    ];

    // Handle user logout
    const handleLogout = () => {
        userLogout();
        closeMenus();
        toast.success("Logged out successfully.", {
            style: { borderRadius: '10px', background: '#03C203', color: '#fff' }
        });
        navigate('/');
    };

    // Function to close all dropdowns/menus
    const closeMenus = () => {
        setMenuOpen(false);
        setIsVisible(false);
        setMobileDropdownOpen(false);
    };

    // Close dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Function to handle adding a service
    const handleAddService = () => {
        if (userRole !== "approved_org") {
            toast.error("Only approved organizations can add services. Please contact support.", { theme: 'colored' });
            return;
        }

        onAddService();
    };

    return (
        <header
            className="sticky top-0 z-20 flex items-center justify-between gap-4 px-5 h-16 anim-fadeIn bg-[#0F172A]/80"
            style={{ backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
            <div className="flex items-center gap-3">
                {/* Hamburger */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden w-9 h-9 rounded-[9px] flex items-center justify-center text-[18px] shrink-0 cursor-pointer"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)" }}
                >☰</button>

                <div>
                    <h1 className="font-bold text-xl" style={{ fontFamily: "'serif', fangsong", color: "#E8EDF5", letterSpacing: "-0.3px" }}>
                        {labels[active]}
                    </h1>

                    <p className="text-[12px] mt-px" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'serif', fangsong" }}>
                        {time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="hide-sm text-[12px] font-mono tracking-[1px]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'serif', fangsong" }}>
                    {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>

                {isAdmin ? (
                    (pendingCount > 0) && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-400 cursor-pointer transition-all hover:bg-amber-400/15"
                            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)" }}>
                            <div className="relative">
                                <div className="w-2 h-2 rounded-full bg-amber-400 anim-pulse-dot" />
                                <div className="absolute inset-0 rounded-full bg-amber-400 opacity-40" style={{ animation: "ping 1.4s ease-out infinite" }} />
                            </div>
                            <span className="hide-sm font-['serif'] text-[13px]">{pendingCount} Pending</span>
                        </div>
                    )
                ) : ((active === "services" || active === "overview") && (
                    <button
                        onClick={handleAddService}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border-none text-black text-sm font-bold cursor-pointer transition-all duration-200 hover:brightness-110 hover:scale-[1.03] active:scale-[0.97]"
                        style={{ background: "linear-gradient(135deg,#00C9A7,#4DA8DA)", fontFamily: "'serif', fangsong" }}
                    >
                        <span className="font-extrabold text-[15px]">+</span><span className="hide-sm">New Service</span>
                    </button>
                ))}

                {/* Right Side Action Area */}
                <div className="flex items-center gap-4 shrink-0">
                    {isLoggedin ? (
                        <div className="relative" ref={dropdownRef}>
                            <div
                                className="flex items-center gap-3 cursor-pointer group p-1 pr-3 rounded-full hover:bg-white/5 transition-all"
                                style={{ fontFamily: "'serif', fangsong'" }}
                                onClick={() => setIsVisible(!isVisible)}
                            >
                                <div className="relative w-9 h-9 rounded-full bg-linear-to-br from-[#845EC2] to-[#4DA8DA] flex items-center justify-center text-sm font-bold border-2 border-white/10 group-hover:border-[#00C4CC]/50 transition-all">
                                    {capitalizedUsername.charAt(0)}
                                    <div className="pulse-dot absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00C9A7] border-2 border-[#060A12]" />
                                </div>
                                <span className="text-gray-300 font-semibold group-hover:text-[#00C4CC] transition-colors hidden md:block">
                                    {capitalizedUsername}
                                </span>
                            </div>

                            {/* User Dropdown Menu */}
                            <AnimatePresence>
                                {isVisible && (
                                    <motion.ul
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-3 w-52 bg-[#1A2437] border border-white/10 shadow-2xl rounded-2xl overflow-hidden p-1.5"
                                    >
                                        <div className="px-4 py-3 border-b border-white/5 mb-1 lg:hidden">
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Account</p>
                                            <p className="text-sm text-white truncate">{capitalizedUsername}</p>
                                        </div>
                                        {subMenuItems.map((item) => (
                                            <li key={item.name}>
                                                <Link
                                                    to={item.path}
                                                    onClick={() => setIsVisible(false)}
                                                    className="flex items-center px-4 py-2.5 text-[15px] text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                                >
                                                    {item.icon} {item.name}
                                                </Link>
                                            </li>
                                        ))}
                                        <li className="mt-1 border-t border-white/5 pt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2.5 text-[15px] text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                            >
                                                <TbLogout size={20} className="mr-2.5" />Sign Out
                                            </button>
                                        </li>
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="px-6 py-2.5 bg-[#00C4CC] text-[#0F172A] text-[15px] font-bold rounded-xl hover:bg-[#00DDE6] transition-all shadow-lg shadow-[#00C4CC]/20 active:scale-95"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Topbar
