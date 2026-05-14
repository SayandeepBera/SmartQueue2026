import React, { useState } from 'react';
import { ImSpinner9 } from 'react-icons/im';

const ReasonModal = ({ action, orgName, isLoading, onConfirm, onCancel }) => {
    const [reason, setReason] = useState("");

    const isReject  = action === "reject";
    const accentClr = isReject ? "#f43f5e" : "#f97316";     // red for reject, orange for suspend
    const accentBg  = isReject
        ? "linear-gradient(135deg,#dc2626,#b91c1c)"
        : "linear-gradient(135deg,#ea580c,#c2410c)";

    const title       = isReject ? "Reject Organization"  : "Suspend Organization";
    const description = isReject
        ? `Are you sure you want to reject "${orgName}"? This will notify the organization via email.`
        : `Are you sure you want to suspend "${orgName}"? The organization will lose dashboard access.`;
    const placeholder = isReject
        ? "e.g. Documents are unclear or invalid…"
        : "e.g. Policy violation, pending review…";
    const confirmLabel = isReject ? "Confirm Reject" : "Confirm Suspend";

    return (
        <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-[#0D1321]/75 p-4"
            style={{ backdropFilter: "blur(20px)" }}
            onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div
                className="w-full max-w-md bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                style={{
                    animation: "modalIn .3s cubic-bezier(.34,1.4,.64,1) both",
                    fontFamily: "'serif', 'fangsong'",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="px-6 py-5 border-b border-white/6"
                    style={{ background: `${accentClr}0A` }}
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                                style={{ background: `${accentClr}18`, border: `1px solid ${accentClr}30` }}
                            >
                                {isReject ? "✕" : "🛑"}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">{title}</h3>
                                <p className="text-[11px] text-white/35 mt-0.5 truncate max-w-60">{orgName}</p>
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            className="w-8 h-8 rounded-full border border-white/10 bg-white/6 text-white/50 hover:text-white
                                       hover:bg-white/10 flex items-center justify-center text-sm transition-all cursor-pointer shrink-0"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-4">
                    <p className="text-[13px] text-white/55 leading-relaxed">{description}</p>

                    {/* Reason textarea */}
                    <div>
                        <label className="block text-[11px] text-white/35 uppercase tracking-widest font-semibold mb-2">
                            Reason <span className="normal-case text-white/20">(optional)</span>
                        </label>
                        <textarea
                            rows={3}
                            placeholder={placeholder}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white/80 bg-white/5 border border-white/10 outline-none resize-none transition-all"
                            style={{ fontFamily: "inherit" }}
                            onFocus={e => {
                                e.target.style.borderColor = `${accentClr}55`;
                                e.target.style.boxShadow = `0 0 0 3px ${accentClr}12`;
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = "rgba(255,255,255,0.1)";
                                e.target.style.boxShadow = "none";
                            }}
                        />
                        <p className="text-[11px] text-white/20 mt-1.5">
                            This reason will be included in the notification email sent to the organization.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-2.5">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/50 transition-all cursor-pointer
                                   border border-white/10 bg-white/5 hover:bg-white/8 active:scale-95 disabled:opacity-60"
                        style={{ fontFamily: "inherit" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(reason.trim())}
                        disabled={isLoading}
                        className="flex-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer
                                   active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                        style={{ background: accentBg, fontFamily: "inherit" }}
                    >
                        {isLoading
                            ? <><ImSpinner9 className="animate-spin" /> Processing…</>
                            : confirmLabel
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReasonModal;