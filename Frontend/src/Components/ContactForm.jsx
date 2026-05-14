import React, { useState, useContext } from 'react'
import { ImSpinner9 } from 'react-icons/im';
import AuthContext from '../Context/Authentication/AuthContext';
import SupportContext from '../Context/Support/SupportContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const USER_CATEGORIES = ["General", "Token Booking", "Technical Issue", "Account Issue", "Other"];
const ORG_CATEGORIES = ["General", "Queue Management", "Billing & Plans", "Technical Issue", "Analytics", "Other"];
const DEFAULT_CATEGORIES = ["General", "Token Booking", "Technical Issue", "Organization Registration", "Other"];

const ContactForm = () => {
    const { authToken, email: userEmail, username: userName, userRole } = useContext(AuthContext);
    const isUser = userRole === "user";

    const [form, setForm] = useState({
        name: userName || "",
        email: userEmail || "",
        category: "General",
        message: ""
    });

    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const navigate = useNavigate();

    const { submitInquiry } = useContext(SupportContext);

    let categories = [];

    if (!authToken) {
        categories = DEFAULT_CATEGORIES;
    } else {
        categories = isUser ? USER_CATEGORIES : ORG_CATEGORIES;
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!authToken) {
            toast.warn("Please login to submit your inquiry.");
            navigate("/login");
            return;
        }

        setSending(true);

        const result = await submitInquiry(form);

        if (result.success) {
            setSent(true);
        } else {
            toast.error("Failed to submit your inquiry.");
        }
        setSending(false);
    };

    // Common input styles
    const inputStyle = {
        width: "100%", background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
        padding: "11px 14px", color: "#E8EDF5", fontSize: 14,
        fontFamily: "inherit", outline: "none", boxSizing: "border-box",
        transition: "border-color .2s",
    };

    // If message is sent, show confirmation UI
    if (sent) return (
        <div
            className="flex flex-col items-center justify-center py-16 text-center"
            style={{ animation: "fadeUp .5s both" }}
        >
            <div className="text-5xl mb-4">✅</div>
            <h4 className="text-xl font-bold text-white mb-2">Message Received!</h4>
            <p className="text-white/45 text-sm max-w-xs">
                Our team will get back to you within 24 hours at <span className="text-[#00C9A7]">{form.email}</span>
            </p>
            <button
                onClick={() => { setSent(false); setForm({ name: "", email: "", category: "General", message: "" }); }}
                className="mt-6 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-80"
                style={{ background: "#00C9A7", color: "#000", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
                Send Another
            </button>
        </div>
    );

    return (
        <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "rgba(255,255,255,0.9)", marginBottom: 20, marginTop: 0 }}>
                Send us a message
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1">Your Name</label>
                        <input
                            required
                            style={inputStyle}
                            placeholder="Arjun Sharma"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            onFocus={e => e.target.style.borderColor = "#00C9A7"}
                            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1">Email Address</label>
                        <input
                            required type="email"
                            style={inputStyle}
                            placeholder="arjun@example.com"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            onFocus={e => e.target.style.borderColor = "#00C9A7"}
                            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1">Category</label>
                    <select
                        style={{ ...inputStyle, cursor: "pointer" }}
                        value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    >
                        {categories.map(c => (
                            <option key={c} value={c} style={{ background: "#121827" }}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1">Your Message</label>
                    <textarea
                        required rows={5}
                        style={{ ...inputStyle, resize: "vertical", minHeight: 110 }}
                        placeholder="Describe your issue or question in detail…"
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = "#00C9A7"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                </div>

                <button
                    type="submit"
                    disabled={sending}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-[15px] transition-all duration-300"
                    style={{
                        background: sending ? "rgba(0,201,167,0.4)" : "#00C9A7",
                        color: "#000",
                        border: "none",
                        cursor: sending ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        boxShadow: sending ? "none" : "0 16px 40px rgba(0,201,167,0.2)",
                        transform: sending ? "scale(0.98)" : "scale(1)",
                    }}
                >
                    {sending ? (
                        <span>
                            <ImSpinner9 className="animate-spin inline mr-1.5" /> Sending…
                        </span>
                    ) : "Send Message →"}
                </button>
            </form>
        </div>
    );
}

export default ContactForm
