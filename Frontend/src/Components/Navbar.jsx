import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../Context/Authentication/AuthContext';
import { LuUserRound, LuHistory, LuUserRoundPen } from "react-icons/lu";
import { TbLogout } from "react-icons/tb";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/Images/SQLogo1.png';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    
    const { authToken, userLogout, username, userRole } = useContext(AuthContext);

    const isLoggedin = !!authToken;
    const isAdmin = userRole === "admin";
    const isGuide = userRole === "approved_guide" || userRole === "pending_guide";
    const capitalizedUsername = username ? username.charAt(0).toUpperCase() + username.slice(1) : "User";

    // Navigation items based on user role
    const navItems = [
        { name: isAdmin || isGuide ? "Dashboard" : "Home", path: "/" },
        { name: "Services", path: "/services" },
        { name: "Organizations", path: "/organizations" },
        ...(!isGuide && !isAdmin ? [{ name: "My Tokens", path: "/my-tokens" }] : []),
        { name: "Support", path: "/support" },
    ];

    const subMenuItems = [
        { name: "Profile", icon: <LuUserRound size={18} className="mr-2.5" />, path: "/profile" },
        { name: "Edit Profile", icon: <LuUserRoundPen size={18} className="mr-2.5" />, path: "/editprofile" },
        { name: "Support History", icon: <LuHistory size={18} className="mr-2.5" />, path: "/history" }
    ];

    const handleLogout = () => {
        userLogout();
        closeMenus();
        toast.success("Logged out successfully.", {
            style: { borderRadius: '10px', background: '#03C203', color: '#fff' }
        });
        navigate('/');
    };

    const closeMenus = () => {
        setMenuOpen(false);
        setIsVisible(false);
        setMobileDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 left-0 w-full z-2000 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 font-[fangsong]">
            <div className="max-w-300 mx-auto px-6 h-20 flex items-center justify-between gap-4">
                
                {/* Logo */}
                <Link to="#" className="flex items-center gap-2.5 shrink-0" onClick={closeMenus}>
                    <img src={logo} alt="SmartQueue Logo" className="h-11.25 md:h-12.5" />
                </Link>

                {/* Desktop links */}
                <ul className="hidden lg:flex gap-8 flex-1 justify-center items-center">
                    {navItems.map(item => (
                        <li key={item.path}>
                            <Link 
                                to={item.path} 
                                className={`relative text-[17px] font-semibold transition-all duration-300 py-2 px-1.5
                                    ${location.pathname === item.path ? "text-[#00C4CC]" : "text-gray-400 hover:text-white"}
                                    after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:bg-[#00C4CC] after:transition-all after:duration-300
                                    ${location.pathname === item.path ? "after:w-full" : "after:w-0 hover:after:w-full"}
                                `}
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Right Side Action Area */}
                <div className="flex items-center gap-4 shrink-0">
                    {isLoggedin ? (
                        <div className="relative" ref={dropdownRef}>
                            <div 
                                className="flex items-center gap-3 cursor-pointer group p-1 pr-3 rounded-full hover:bg-white/5 transition-all"
                                onClick={() => setIsVisible(!isVisible)}
                            >
                                <div className="relative w-9 h-9 rounded-full bg-linear-to-br from-[#845EC2] to-[#4DA8DA] flex items-center justify-center text-[13px] font-bold border-2 border-white/10 group-hover:border-[#00C4CC]/50 transition-all">
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

                    {/* Hamburger Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Backdrop */}
            <AnimatePresence>
                {menuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMenus}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-1001 lg:hidden"
                        />
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-auto w-70 bg-[#0F172A] border-l border-white/5 z-1002 lg:hidden p-6 shadow-2xl border-b-3 border-b-[#00C4CC]/50 rounded-b-2xl"
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-center mb-10 pb-4 border-b border-white/5">
                                    <h5 className="text-xl font-bold text-white tracking-tight">SmartQueue</h5>
                                    <button onClick={closeMenus} className="text-gray-400 hover:text-white transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <ul className="flex flex-col gap-2">
                                    {navItems.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                to={item.path}
                                                onClick={closeMenus}
                                                className={`block px-4 py-3 rounded-xl text-lg font-semibold transition-all
                                                    ${location.pathname === item.path ? "bg-[#00C4CC]/10 text-[#00C4CC]" : "text-gray-400 hover:bg-white/5"}
                                                `}
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto pt-6 border-t border-white/5">
                                    {isLoggedin ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl mb-4">
                                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#845EC2] to-[#4DA8DA] flex items-center justify-center font-bold">
                                                    {capitalizedUsername.charAt(0)}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-bold text-white truncate">{capitalizedUsername}</p>
                                                    <p className="text-xs text-gray-500 uppercase tracking-tighter">{userRole}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500/10 text-red-400 rounded-xl font-bold transition-all active:scale-95"
                                            >
                                                <TbLogout size={20} /> Sign Out
                                            </button>
                                        </div>
                                    ) : (
                                        <Link
                                            to="/login"
                                            onClick={closeMenus}
                                            className="block w-full text-center px-4 py-3.5 bg-[#00C4CC] text-[#0F172A] rounded-xl font-bold active:scale-95 transition-all"
                                        >
                                            Sign In
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;