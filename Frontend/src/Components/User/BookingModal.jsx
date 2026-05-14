import React, { useState, useContext } from 'react';
import ServiceContext from '../../Context/Services/ServicesContext';
import AuthContext from '../../Context/Authentication/AuthContext';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// Helper: build booked data shape for ActiveTokenPanel + localStorage
export const buildBookedData = (selected, token, name) => ({
    orgId: selected.orgId?._id || selected.orgId,
    name: selected.name,
    icon: selected.icon,
    color: selected.color || "#00C9A7",
    counter: selected.counter,
    token: token.tokenNumber,
    tokenId: token._id,
    position: token.position,
    wait: token.estimatedWait,
    bookedName: token.name || name,
    org: selected.org || null,
});

// Persist + broadcast so dashboard & stats update immediately (even from ServicesPage)
export const broadcastBooking = (bookedData) => {
    try {
        localStorage.setItem("sq_active_token", JSON.stringify(bookedData));
    } catch (_) { }
    window.dispatchEvent(new CustomEvent("sq:tokenBooked", { detail: bookedData }));
};

const BookingModal = ({ selected, onClose, onConfirm }) => {
    const { bookToken } = useContext(ServiceContext);
    const { email, userId } = useContext(AuthContext);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [bookingEmail, setBookingEmail] = useState(email || "");
    const [done, setDone] = useState(false);
    const [err, setErr] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    const org = selected?.org || null;

    // Validation function to check required fields and formats before booking
    const validate = () => {
        const errors = {};
        if (!name.trim()) errors.name = "Please enter your name to continue.";
        if (!phone) errors.phone = "Phone number is required.";
        if (!bookingEmail.trim()) errors.bookingEmail = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingEmail))
            errors.bookingEmail = "Enter a valid email address.";
        return errors;
    };

    // Confirm booking after validation, handle API response, and broadcast result
    const confirm = async () => {
        const errors = validate();
        if (Object.keys(errors).length) { setErr(errors); return; }
        setErr({});
        setLoading(true);
        setApiError(null);

        // Attempt to book token via API
        try {
            const serviceId = selected._id || selected.id;
            let result;

            if (serviceId && typeof serviceId === 'string' && serviceId.length === 24) {
                result = await bookToken(serviceId, {
                    name: name.trim(),
                    phone: phone.trim(),
                    email: bookingEmail.trim(),
                    userId: userId || undefined,
                });
            } else {
                // Dummy data fallback for demo
                result = {
                    success: true,
                    token: {
                        tokenNumber: `${selected.counter}-0${Math.floor(40 + Math.random() * 20)}`,
                        position: Math.floor(3 + Math.random() * 5),
                        estimatedWait: selected.wait,
                        name: name.trim(),
                        _id: 'demo-' + Date.now(),
                    }
                };
            }

            if (!result.success) {
                setApiError(result.error || "Booking failed. Please try again.");
                setLoading(false);
                return;
            }

            // Build booked data and broadcast globally
            const bookedData = buildBookedData(selected, result.token, name.trim());
            broadcastBooking(bookedData);

            setDone(true);
            setTimeout(() => {
                onConfirm({ name: name.trim(), token: result.token, tokenId: result.token._id });
            }, 1900);
        } catch (e) {
            setApiError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    if (!selected) return null;

    const address = org?.address;
    const orgName = org?.orgName || org?.name;
    const orgIcon = org?.icon;
    const orgVerified = org?.verified;
    const orgLat = org?.lat;
    const orgLng = org?.lng;

    return (
        <div
            className="fixed inset-0 z-200 flex items-center justify-center p-5 bg-[#0B1120]/80"
            style={{ backdropFilter: "blur(10px)" }}
            onClick={e => { if (e.target === e.currentTarget && !loading) onClose(); }}
        >
            <div
                className="modal-enter relative top-10 rounded-3xl p-9 w-115 max-w-full overflow-y-auto"
                style={{
                    background: "#0B1120",
                    maxHeight: "80vh",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 50px 120px rgba(0,0,0,0.7)"
                }}
            >
                {!done ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center gap-3.5 mb-5.5">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-[26px] shrink-0"
                                style={{ background: `${selected.color}18`, border: `1.5px solid ${selected.color}40` }}
                            >{selected.icon}</div>
                            <div style={{ fontFamily: "'serif', 'fangsong'" }}>
                                <h3 className="font-extrabold text-xl tracking-[-0.4px] mb-1">{selected.name}</h3>
                                <p className="text-sm text-white/40 flex items-center gap-1.25 flex-wrap">
                                    {orgIcon} {orgName}
                                    {orgVerified && <span className="text-[11px]" style={{ color: "#00C9A7" }}>✓ Verified</span>}
                                </p>
                            </div>
                        </div>

                        {/* 2-token limit notice */}
                        <div className="mb-4 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2"
                            style={{ background: "rgba(0,201,167,0.06)", border: "1px solid rgba(0,201,167,0.15)", color: "rgba(255,255,255,0.4)" }}>
                            <span style={{ color: "#00C9A7" }}>ⓘ</span>
                            Max 2 active tokens per person per service to ensure fairness.
                        </div>

                        {/* API Error */}
                        {apiError && (
                            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
                                style={{ background: "rgba(249,97,103,0.12)", border: "1px solid rgba(249,97,103,0.3)", color: "#F96167" }}>
                                ⚠ {apiError}
                            </div>
                        )}

                        {/* Name */}
                        <div className="mb-3.5" style={{ fontFamily: "'serif', 'fangsong'" }}>
                            <label className="block text-xs text-white/50 font-semibold tracking-[0.5px] mb-2">
                                YOUR FULL NAME <span style={{ color: "#F96167" }}>*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">👤</span>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g. Rahul Sharma"
                                    value={name}
                                    onChange={e => { setName(e.target.value); if (e.target.value.trim()) setErr(v => ({ ...v, name: null })); }}
                                    onKeyDown={e => { if (e.key === "Enter") confirm(); }}
                                    disabled={loading}
                                    className="w-full py-3.25 pr-3.5 pl-10.5 text-sm outline-none transition-all duration-200"
                                    style={{
                                        background: "rgba(255,255,255,0.05)",
                                        border: `1.5px solid ${err.name ? "#F96167" : "rgba(255,255,255,0.1)"}`,
                                        borderRadius: 12, color: "#E8EDF5", fontFamily: "'serif', 'fangsong'"
                                    }}
                                    onFocus={e => { e.target.style.borderColor = "rgba(0,201,167,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,201,167,0.15)"; }}
                                    onBlur={e => { e.target.style.borderColor = err.name ? "#F96167" : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                                />
                            </div>
                            {err.name && <p className="text-xs mt-1.5" style={{ color: "#F96167" }}>⚠ {err.name}</p>}
                        </div>

                        {/* Email — pre-filled from auth, editable */}
                        <div className="mb-3.5" style={{ fontFamily: "'serif', 'fangsong'" }}>
                            <label className="block text-xs text-white/50 font-semibold tracking-[0.5px] mb-2">
                                EMAIL <span style={{ color: "#F96167" }}>*</span>
                                {email && <span className="text-white/25 font-normal ml-1">(pre-filled from your account)</span>}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">✉️</span>
                                <input
                                    type="email"
                                    placeholder="e.g. rahul@gmail.com"
                                    value={bookingEmail}
                                    onChange={e => { setBookingEmail(e.target.value); setErr(v => ({ ...v, bookingEmail: null })); }}
                                    disabled={loading}
                                    className="w-full py-3.25 pr-3.5 pl-10.5 text-sm outline-none transition-all duration-200"
                                    style={{
                                        background: email ? "rgba(0,201,167,0.04)" : "rgba(255,255,255,0.05)",
                                        border: `1.5px solid ${err.bookingEmail ? "#F96167" : email ? "rgba(0,201,167,0.25)" : "rgba(255,255,255,0.1)"}`,
                                        borderRadius: 12, color: "#E8EDF5", fontFamily: "'serif', 'fangsong'"
                                    }}
                                    onFocus={e => { e.target.style.borderColor = "rgba(0,201,167,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,201,167,0.15)"; }}
                                    onBlur={e => { e.target.style.borderColor = err.bookingEmail ? "#F96167" : email ? "rgba(0,201,167,0.25)" : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                                />
                            </div>
                            {err.bookingEmail && <p className="text-xs mt-1.5" style={{ color: "#F96167" }}>⚠ {err.bookingEmail}</p>}
                            <p className="text-xs text-white/30 mt-1.5">A confirmation email will be sent with your token details.</p>
                        </div>

                        {/* Phone — required */}
                        <div className="mb-4.5" style={{ fontFamily: "'serif', 'fangsong'" }}>
                            <label className="block text-xs text-white/50 font-semibold tracking-[0.5px] mb-2">
                                PHONE <span style={{ color: "#F96167" }}>*</span>
                            </label>
                            <div className="relative">
                                <div
                                    className="custom-phone-container"
                                    style={{
                                        border: `1.5px solid ${err.phone ? "#F96167" : "rgba(255,255,255,0.1)"}`,
                                        borderRadius: 12,
                                        overflow: "hidden",
                                        background: "rgba(255,255,255,0.05)",
                                    }}
                                >
                                    <PhoneInput
                                        international
                                        defaultCountry="IN"
                                        placeholder="Enter phone number"
                                        value={phone}
                                        onChange={val => { setPhone(val || ""); if (val) setErr(v => ({ ...v, phone: null })); }}
                                        disabled={loading}
                                        className="smart-phone-input"
                                    />
                                </div>
                            </div>
                            {err.phone && <p className="text-xs mt-1.5" style={{ color: "#F96167" }}>⚠ {err.phone}</p>}
                        </div>

                        {/* Details grid */}
                        <div className="rounded-xl p-4 mb-4 grid grid-cols-2 gap-3.5"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                            {[
                                ["Counter", selected.counter],
                                ["Est. Wait", `${selected.wait || selected.avgWait} min`],
                                ["In Queue", `${selected.active || 0} tokens`],
                                ["Date", new Date().toLocaleDateString()]
                            ].map(([k, v]) => (
                                <div key={k} style={{ fontFamily: "'serif', 'fangsong'" }}>
                                    <div className="text-xs text-white/30 mb-0.75">{k}</div>
                                    <div className="text-sm font-semibold">{v}</div>
                                </div>
                            ))}
                        </div>

                        {/* Location hint */}
                        {(address || selected.dir) && (
                            <div
                                className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-[11px] mb-5"
                                style={{ background: `${selected.color}0D`, border: `1px solid ${selected.color}22` }}
                            >
                                <span className="text-base">📍</span>
                                <div style={{ fontFamily: "'serif', 'fangsong'" }}>
                                    <div className="text-[13px] font-semibold mb-0.75" style={{ color: selected.color }}>
                                        {address} {selected.room ? `· ${selected.room}` : ''}
                                    </div>
                                    {selected.dir && <div className="text-xs text-white/40 leading-[1.55]">{selected.dir}</div>}
                                    {(orgLat && orgLng) && (
                                        <a
                                            href={`https://www.openstreetmap.org/?mlat=${orgLat}&mlon=${orgLng}&zoom=17`}
                                            target="_blank" rel="noreferrer"
                                            className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold no-underline"
                                            style={{ color: "#4DA8DA" }}
                                        >
                                            🗺️ View on live map ↗
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3" style={{ fontFamily: "'serif', 'fangsong'" }}>
                            <button
                                className="btn flex-1 py-3.25 rounded-xl text-base font-bold"
                                onClick={onClose}
                                disabled={loading}
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#E8EDF5" }}
                            >Cancel</button>
                            <button
                                className="btn flex-2 py-3.25 rounded-xl text-base font-extrabold text-black flex items-center justify-center gap-2"
                                onClick={confirm}
                                disabled={loading}
                                style={{ background: `linear-gradient(135deg,${selected.color},${selected.color}AA)`, opacity: loading ? 0.7 : 1 }}
                            >
                                {loading ? (
                                    <>
                                        <span className="inline-block w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                                        Booking...
                                    </>
                                ) : "Confirm Booking →"}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-6" style={{ fontFamily: "'serif', 'fangsong'" }}>
                        <div className="text-[62px] mb-4">🎉</div>
                        <h3 className="font-extrabold text-2xl mb-2" style={{ color: "#00C9A7" }}>Token Booked!</h3>
                        <p className="text-white/50 text-sm mb-1">Welcome, <strong className="text-white/90">{name}</strong>!</p>
                        <p className="text-[13px] text-white/35 mb-1">Confirmation sent to <span style={{ color: "#4DA8DA" }}>{bookingEmail}</span></p>
                        <p className="text-[13px] text-white/35">Redirecting to dashboard…</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingModal;