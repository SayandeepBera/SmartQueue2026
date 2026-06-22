import React, { useContext, useState } from 'react'
import AuthContext from '../Context/Authentication/AuthContext';
import { ImSpinner9 } from "react-icons/im";
import { MdEmail } from "react-icons/md";
import { FaKey, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = ({ isVisible, onClose }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
    const [showPass, setShowPass] = useState(false);
    const [message, setMessage] = useState({ text: "", isSuccess: false });

    const { forgotPassword, verifyOTP, resetPassword, isLoading } = useContext(AuthContext);

    // Close modal and reset all states
    const handleClose = () => {
        setStep(1);
        setEmail("");
        setOtp("");
        setPasswords({ newPassword: "", confirmPassword: "" });
        setMessage({ text: "", isSuccess: false });
        onClose();
    };

    // Handle send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setMessage({ text: "", isSuccess: false });
        
        try {
            const result = await forgotPassword(email);
            
            if (result.success) {
                setMessage({ text: result.msg, isSuccess: true });
                setStep(2);
            } else {
                setMessage({ text: result.error, isSuccess: false });
            }
        } catch (error) {
            setMessage({ text: "Error sending OTP.", isSuccess: false });
        }
    };

    // Handle verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        
        // Basic client-side validation
        if (otp.length !== 6 || !/^\d{6}$/.test(otp)) return setMessage({ text: "Enter valid 6-digit OTP", isSuccess: false });
        
        try {
            const result = await verifyOTP(email, otp);
            
            if (result.success) {
                setMessage({ text: result.msg, isSuccess: true });
                setStep(3);
            } else {
                setMessage({ text: result.error, isSuccess: false });
            }
        } catch (error) {
            setMessage({ text: "Error verifying OTP.", isSuccess: false });
        }
    };

    // Handle reset password
    const handleReset = async (e) => {
        e.preventDefault();
        
        // Basic client-side validation
        if (passwords.newPassword !== passwords.confirmPassword) {
            return setMessage({ text: "Passwords do not match", isSuccess: false });
        }
        
        try {
            const result = await resetPassword(email, passwords.newPassword);
            
            if (result.success) {
                setMessage({ text: result.msg, isSuccess: true });
                setTimeout(() => handleClose(), 1500);
            } else {
                setMessage({ text: result.error, isSuccess: false });
            }
        } catch (error) {
            setMessage({ text: "Reset failed.", isSuccess: false });
        }
    };

    // If not visible, don't render anything
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md z-1000 bg-[#0D1321]/50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#0D1321] border border-white/10 rounded-4xl p-8 w-full max-w-105 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00C9A7]/10 blur-[80px] pointer-events-none" />

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-2xl font-bold font-['Space_Grotesk']" style={{ fontFamily: "'serif', 'fangsong'" }}>
                        {step === 1 && "Reset Password"}
                        {step === 2 && "Verify OTP"}
                        {step === 3 && "New Password"}
                    </h2>
                    <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors text-3xl">&times;</button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {step === 1 && (
                            <form onSubmit={handleSendOTP} className="space-y-6">
                                <p className="text-white/40 text-sm">Enter your email to receive a verification code.</p>
                                <ModalInput label="EMAIL ADDRESS" type="email" icon={<MdEmail/>} value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="john@example.com" />
                                <SubmitButton isLoading={isLoading} text="Send OTP" />
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <p className="text-white/40 text-sm">Code sent to <span className="text-[#00C9A7] font-bold">{email}</span></p>
                                <ModalInput label="6-DIGIT OTP" type="text" icon={<FaKey/>} value={otp} onChange={(e)=>setOtp(e.target.value)} maxLength={6} placeholder="123456" />
                                <SubmitButton isLoading={isLoading} text="Verify OTP" />
                                <p className="text-center text-xs text-[#00C9A7] cursor-pointer hover:underline font-bold" onClick={handleSendOTP}>Resend Code</p>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleReset} className="space-y-5">
                                <div className="relative">
                                    <ModalInput label="NEW PASSWORD" type={showPass ? "text" : "password"} icon={<FaKey/>} value={passwords.newPassword} minLength={6} onChange={(e)=>setPasswords({...passwords, newPassword: e.target.value})} placeholder="••••••••" />
                                    <span onClick={() => setShowPass(!showPass)} className="absolute right-4 top-10.5 text-white/20 cursor-pointer hover:text-[#00C9A7] z-10">
                                        {showPass ? <FaEye /> : <FaEyeSlash />}
                                    </span>
                                </div>
                                <ModalInput label="CONFIRM PASSWORD" type="password" icon={<FaKey/>} value={passwords.confirmPassword} onChange={(e)=>setPasswords({...passwords, confirmPassword: e.target.value})} placeholder="••••••••" />
                                <SubmitButton isLoading={isLoading} text="Reset Password" />
                            </form>
                        )}
                    </motion.div>
                </AnimatePresence>

                {message.text && (
                    <motion.p 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`mt-6 text-center text-[13px] font-bold py-3 rounded-xl bg-white/5 border border-white/5 ${message.isSuccess ? "text-green-400" : "text-red-400"}`}
                        style={{ fontFamily: "'serif', 'fangsong'" }}
                    >
                        {message.text}
                    </motion.p>
                )}
            </motion.div>
        </div>
    )
}

const SubmitButton = ({ isLoading, text }) => (
    <button 
        type="submit" 
        disabled={isLoading}
        className="w-full py-3 rounded-2xl bg-linear-to-br from-[#00C9A7] to-[#4DA8DA] text-[#060A12] font-black text-lg shadow-lg shadow-[#00C9A7]/10 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ fontFamily: "'serif', 'fangsong'" }}
    >
        {isLoading ? <ImSpinner9 className="animate-spin text-xl" /> : text}
    </button>
)

const ModalInput = ({ label, type, icon, value, minLength, onChange, placeholder, maxLength }) => (
    <div className="group">
        <label className="text-[10px] font-bold text-[#00C4CC] tracking-widest mb-2 block group-focus-within:text-[#00C9A7] transition-colors font-serif">
            {label}
        </label>
        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00C9A7] transition-all z-10 pointer-events-none">
                {icon}
            </span>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                maxLength={maxLength}
                minLength={minLength}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#00C9A7]/50 focus:bg-white/[0.07] transition-all text-sm placeholder:text-white/10"
            />
        </div>
    </div>
);

export default ForgotPassword