import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import AuthContext from '../Context/Authentication/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ImSpinner9 } from "react-icons/im";
import { FaEyeSlash, FaEye } from 'react-icons/fa';
import ForgotPassword from '../Components/ForgotPassword';
import { useGoogleLogin } from '@react-oauth/google';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [credentials, setCredentials] = useState({ username: "", loginIdentifier: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { userLogin, userRegister, googleLogin, isLoading } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    // Toggle function for password
    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    }

    // Handle form submission for both login and registration
    const handleAuthenticationForm = async (e) => {
        e.preventDefault();

        let result = null;

        // Call the appropriate function based on whether it's login or registration
        if (isLogin) {
            result = await userLogin(credentials.loginIdentifier, credentials.password);
        } else {
            result = await userRegister(credentials.username, credentials.loginIdentifier, credentials.password);
        }

        if (result?.success) {
            toast.success(result.msg, {
                style: { borderRadius: '10px', background: '#03C203', color: '#fff' }
            })

            navigate('/');
        } else {
            toast.error(result?.msg || "Invalid credentials. Please try again.", {
                theme: "colored"
            })
        }
    }

    // Handle input changes for both login and registration forms
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Prevent spaces in username and loginIdentifier fields
        if ((name === "username" || name === "loginIdentifier") && value.includes(" ")) {
            return;
        }

        setCredentials({ ...credentials, [name]: value });
    }

    // Google Login
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (authResult) => {
            const googleLoginResult = await googleLogin(authResult);
            console.log("Google Login Result in Component:", googleLoginResult);

            if (googleLoginResult.success) {
                toast.success(googleLoginResult.msg, {
                    style: { borderRadius: '10px', background: '#03C203', color: '#fff' }
                })

                // Allows React/browser time to fully process the state update
                setTimeout(() => {
                    window.location.replace('/');
                }, 3000);
            } else {
                toast.error(googleLoginResult.msg || "Something went wrong in Google login. Please try again.", {
                    theme: "colored"
                })

                console.error("Google Login error:", googleLoginResult.error);
            }
        },

        // Handle Google login errors
        onError: (error) => {
            toast.error("Google authentication failed. Please try again.", {
                theme: "colored"
            })

            console.error("Google Login error:", error);
        },

        // Google login scope
        flow: 'auth-code',
    });

    return (
        <>
            <div className="flex justify-center bg-[#121827] pt-21.5 pb-10">
                <div className="min-h-screen bg-[#060A12] font-['DM Sans'] text-[#E8EDF5] flex flex-col lg:flex-row overflow-hidden rounded-[20px] shadow-2xl shadow-black/30 md:w-[90%]">

                    {/* ── LEFT SIDE: THE VALUE PROPOSITION (Exact same as your provided code) ── */}
                    <div className="hidden lg:flex lg:w-[55%] bg-[#0A0F1C] relative flex-col justify-evenly p-8 md:px-12 md:py-10 lg:px-14 lg:py-12 overflow-hidden border-r border-white/5">
                        <div className="absolute top-[-10%] left-[-10%] w-150 h-150 rounded-full bg-[#00C9A7]/5 blur-[120px] animate-pulse" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 rounded-full bg-[#4DA8DA]/5 blur-[100px]" />

                        <div className="relative z-10" style={{ fontFamily: "'serif', 'fangsong'" }}>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-5xl font-extrabold leading-[1.1] mb-6 max-w-lg"
                            >
                                Stop waiting in lines. <br />
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00C9A7] to-[#4DA8DA]">Start living your life.</span>
                            </motion.h1>
                            <p className="text-white/40 text-lg max-w-md leading-relaxed">
                                The intelligent SaaS platform for hospitals, banks, and clinics. Join 10,000+ users skipping the queue daily.
                            </p>
                        </div>

                        <div className="relative z-10 grid grid-cols-2 gap-4 max-w-xl">
                            <FeatureCard icon="🏥" title="Multiple Organizations" desc="Connected across India" />
                            <FeatureCard icon="⚡" title="Live Updates" desc="Real-time position tracking" />
                            <FeatureCard icon="📱" title="Zero Hardware" desc="Book right from your phone" />
                            <FeatureCard icon="🔒" title="Secure Data" desc="Enterprise-grade privacy" />
                        </div>
                    </div>

                    {/* ── RIGHT SIDE: UPDATED COLOR & BACKGROUND ── */}
                    {/* Changed to a Radial Gradient for depth and a slightly cooler, darker tone */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 md:px-12 md:py-10 lg:px-14 lg:py-12 relative bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-[#0A1221] via-[#060A12] to-[#04070D]">

                        {/* Subtle Ambient Glow behind the card to make it pop */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#00C9A7]/5 blur-[100px] pointer-events-none" />

                        <motion.div
                            layout
                            className="w-full max-w-105 z-10"
                        >
                            <div className="mb-10 text-center lg:text-left" style={{ fontFamily: "'serif', 'fangsong'" }}>
                                <h2 className="text-3xl font-bold mb-2 tracking-tight">
                                    {isLogin ? 'Welcome back' : 'Create an account'}
                                </h2>
                                <p className="text-white/30 text-sm">
                                    {isLogin ? 'Glad to see you again! Please sign in.' : 'Start your journey towards a wait-free life.'}
                                </p>
                            </div>

                            {/* Card updated with a more solid "Obsidian" glass effect */}
                            <form onSubmit={handleAuthenticationForm} className="bg-[#0D1321]/40 border border-white/8 backdrop-blur-3xl rounded-4xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={isLogin ? 'login' : 'signup'}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="space-y-5">
                                            {!isLogin && (
                                                <InputField label="USERNAME" name="username" type="text" placeholder="JohnDoe" icon="👤" value={credentials.username} handleChange={handleChange} />
                                            )}

                                            <InputField
                                                label={`${isLogin ? 'USERNAME OR EMAIL' : 'EMAIL ADDRESS'}`}
                                                name="loginIdentifier"
                                                type={`${isLogin ? 'text' : 'email'}`}
                                                placeholder="john@example.com"
                                                icon="📧"
                                                value={credentials.loginIdentifier}
                                                handleChange={handleChange}
                                            />

                                            <InputField
                                                label="PASSWORD"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                icon="🔒"
                                                value={credentials.password}
                                                handleChange={handleChange}
                                                minLength={6}
                                                isPassword={true}
                                                showPassword={showPassword}
                                                togglePassword={togglePassword}
                                            />

                                            {isLogin && (
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsModalOpen(true)}
                                                        className="text-xs text-[#00C9A7] font-semibold hover:text-[#4DA8DA] transition-all cursor-pointer"
                                                    >
                                                        Forgot Password?
                                                    </button>
                                                </div>
                                            )}

                                            <button type="submit" disabled={isLoading} className="w-full py-3 rounded-2xl bg-linear-to-br from-[#00C9A7] to-[#4DA8DA] text-[#060A12] font-black text-lg mt-2 hover:brightness-110 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-xl shadow-[#00C9A7]/10 cursor-pointer" style={{ fontFamily: "'serif', 'fangsong'" }}>
                                                {isLoading ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <ImSpinner9 className="animate-spin" /> {isLogin ? 'Signing In...' : 'Creating Account...'}
                                                    </span>
                                                ) : (
                                                    <>
                                                        {isLogin ? 'Sign In' : 'Create Account'}
                                                    </>
                                                )}


                                            </button>
                                        </div>

                                        <div className="relative my-8 text-center" style={{ fontFamily: "'serif', 'fangsong'" }}>
                                            {/* Divider color adjusted for the darker background */}
                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                                            <span className="relative px-4 bg-[#0A1221] text-xs text-white/25 tracking-[0.2em] font-bold">OR</span>
                                        </div>

                                        <div className="grid gap-4">
                                            <SocialButton provider="Continue with Google" handleGoogleLogin={handleGoogleLogin} />
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </form>

                            <div className="mt-8 text-center">
                                <p className="text-sm text-white/30">
                                    {isLogin ? "New to SmartQueue?" : "Already a member?"}
                                    <button
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setCredentials({ username: "", loginIdentifier: "", password: "" });
                                        }}
                                        className="ml-2 text-[#00C9A7] font-bold hover:text-white transition-all"
                                        style={{ fontFamily: "'serif', 'fangsong'" }}
                                    >
                                        {isLogin ? 'Create account' : 'Sign in'}
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            <ForgotPassword
                isVisible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

// ─── SUB-COMPONENTS (Exact same logic as your code) ───

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-5 rounded-2xl bg-white/3 border border-white/5 hover:border-[#00C9A7]/30 transition-all group" style={{ fontFamily: "'serif', 'fangsong'" }}>
        <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="font-bold text-[15px] mb-1">{title}</h3>
        <p className="text-[13px] text-white/30 leading-relaxed">{desc}</p>
    </div>
);

const InputField = ({ label, name, type, placeholder, icon, value, handleChange, minLength, isPassword, showPassword, togglePassword }) => (
    <div className="group">
        <label className="text-[10px] font-bold text-[#00C4CC] tracking-widest mb-2 block group-focus-within:text-[#00C9A7] transition-colors" style={{ fontFamily: "'serif', 'fangsong'" }}>
            {label}
        </label>
        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 group-focus-within:text-[#00C9A7] transition-all">
                {icon}
            </span>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                required
                className="w-full bg-white/2 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#00C9A7]/50 focus:ring-4 focus:ring-[#00C9A7]/5 transition-all text-sm placeholder:text-white/25"
                value={value}
                onChange={handleChange}
                minLength={minLength}
            />

            {isPassword && (
                <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#00C9A7] transition-colors focus:outline-none"
                >
                    {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                </button>
            )}
        </div>
    </div >
);

const SocialButton = ({ provider, handleGoogleLogin }) => (
    <button 
        className="py-3 flex items-center justify-center px-4 bg-white/3 border border-white/10 rounded-xl hover:bg-white/8 hover:text-[#00C9A7] cursor-pointer transition-all font-bold text-xs text-white/40 uppercase tracking-widest" 
        style={{ fontFamily: "'serif', 'fangsong'" }}
        onClick={handleGoogleLogin}
    >
        <FcGoogle className="mr-3 text-2xl" /> {provider}
    </button>
);

export default AuthPage;