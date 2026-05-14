import React, { useState } from "react";
import { ImSpinner9 } from "react-icons/im";

const EditPlanModal = ({ plan, isLoading, onSave, onClose }) => {
    const [price, setPrice] = useState(String(plan.price));
    const [color, setColor] = useState(plan.color);
    const [features, setFeatures] = useState(plan.features.join("\n"));
    const [maxCounters, setMaxCounters] = useState(String(plan.maxCounters ?? 2));
    const [maxTokensPerDay, setMaxTokensPerDay] = useState(String(plan.maxTokensPerDay ?? 100));
    const [smsAlerts, setSmsAlerts] = useState(plan.smsAlerts ?? false);
    const [apiAccess, setApiAccess] = useState(plan.apiAccess ?? false);
    const [fullAnalytics, setFullAnalytics] = useState(plan.fullAnalytics ?? false);
    const [whiteLabel, setWhiteLabel] = useState(plan.whiteLabel ?? false);
    const [prioritySupport, setPrioritySupport] = useState(plan.prioritySupport ?? false);

    const handleSave = () => {
        const featArr = features
            .split("\n")
            .map(f => f.trim())
            .filter(Boolean);

        onSave(plan.name, {
            price: Number(price),
            color,
            features: featArr,
            maxCounters: Number(maxCounters),
            maxTokensPerDay: Number(maxTokensPerDay),
            smsAlerts,
            apiAccess,
            fullAnalytics,
            whiteLabel,
            prioritySupport,
        });
    };

    // Re-usable toggle row
    const ToggleRow = ({ label, value, set }) => (
        <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
            <span className="text-[13px] text-white/65">{label}</span>
            <div
                onClick={() => set(v => !v)}
                className="cursor-pointer relative shrink-0 transition-all duration-250"
                style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: value ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.08)",
                    border: `1.5px solid ${value ? "rgba(251,191,36,0.55)" : "rgba(255,255,255,0.12)"}`,
                }}
            >
                <div
                    className="absolute top-0.75 w-3.5 h-3.5 rounded-full transition-all duration-250"
                    style={{
                        left: value ? 22 : 3,
                        background: value ? "#fbbf24" : "rgba(255,255,255,0.35)",
                        boxShadow: value ? "0 0 8px rgba(251,191,36,0.6)" : "none",
                    }}
                />
            </div>
        </div>
    );

    const inputCls = "w-full py-2.5 px-3.5 bg-white/5 border border-white/10 rounded-xl text-[13px] text-white/85 outline-none transition-all";
    const focusStyle = {
        onFocus: e => { e.target.style.borderColor = `${plan.color}70`; e.target.style.boxShadow = `0 0 0 3px ${plan.color}15`; },
        onBlur: e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; },
    };

    return (
        <div
            className="fixed inset-0 z-9999 flex items-start justify-center bg-[#0D1321]/75 p-3 sm:p-6"
            style={{ backdropFilter: "blur(20px)" }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="relative flex flex-col w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl max-h-[80vh]"
                style={{ animation: "modalIn .3s cubic-bezier(.34,1.4,.64,1) both", fontFamily: "'serif', 'fangsong'" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="px-6 py-5 border-b border-white/6 rounded-t-3xl flex items-center justify-between"
                    style={{ background: `${plan.color}0A` }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold text-black"
                            style={{ background: `linear-gradient(135deg,${plan.color},${plan.color}BB)` }}
                        >
                            {plan.name[0]}
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Edit {plan.name} Plan</h3>
                            <p className="text-[11px] text-white/30 mt-0.5">
                                Changes apply to all orgs on this plan
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full border border-white/10 bg-white/6 text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center text-sm transition-all cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

                    {/* Price + Color */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] text-white/35 uppercase tracking-widest font-bold mb-1.5">
                                Price (₹/month)
                            </label>
                            <input
                                type="number" min="0" value={price}
                                onChange={e => setPrice(e.target.value)}
                                className={inputCls} {...focusStyle}
                                style={{ fontFamily: "inherit" }}
                            />
                            {plan.name === "Free" && (
                                <p className="text-[10px] text-white/20 mt-1">Free plan price should stay 0</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-[10px] text-white/35 uppercase tracking-widest font-bold mb-1.5">
                                Accent Color
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color" value={color}
                                    onChange={e => setColor(e.target.value)}
                                    className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                                    style={{ padding: 2 }}
                                />
                                <input
                                    type="text" value={color}
                                    onChange={e => setColor(e.target.value)}
                                    className={`${inputCls} flex-1`} {...focusStyle}
                                    style={{ fontFamily: "monospace", fontSize: 12 }}
                                    placeholder="#fbbf24"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Limits */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] text-white/35 uppercase tracking-widest font-bold mb-1.5">
                                Max Counters (-1 = unlimited)
                            </label>
                            <input
                                type="number" min="-1" value={maxCounters}
                                onChange={e => setMaxCounters(e.target.value)}
                                className={inputCls} {...focusStyle}
                                style={{ fontFamily: "inherit" }}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-white/35 uppercase tracking-widest font-bold mb-1.5">
                                Max Tokens/Day (-1 = unlimited)
                            </label>
                            <input
                                type="number" min="-1" value={maxTokensPerDay}
                                onChange={e => setMaxTokensPerDay(e.target.value)}
                                className={inputCls} {...focusStyle}
                                style={{ fontFamily: "inherit" }}
                            />
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <label className="block text-[10px] text-white/35 uppercase tracking-widest font-bold mb-1.5">
                            Features (one per line)
                        </label>
                        <textarea
                            rows={4} value={features}
                            onChange={e => setFeatures(e.target.value)}
                            className={inputCls} style={{ fontFamily: "inherit", resize: "none" }}
                            {...focusStyle}
                            placeholder={"e.g.\n5 counters\n500 tokens/day\nSMS alerts"}
                        />
                    </div>

                    {/* Feature flags */}
                    <div className="bg-white/2 border border-white/6 rounded-2xl px-4 py-2">
                        <p className="text-[10px] text-white/25 uppercase tracking-widest font-bold mb-1">Feature Flags</p>
                        <ToggleRow label="SMS Alerts" value={smsAlerts} set={setSmsAlerts} />
                        <ToggleRow label="API Access" value={apiAccess} set={setApiAccess} />
                        <ToggleRow label="Full Analytics" value={fullAnalytics} set={setFullAnalytics} />
                        <ToggleRow label="White-label" value={whiteLabel} set={setWhiteLabel} />
                        <ToggleRow label="Priority Support" value={prioritySupport} set={setPrioritySupport} />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 pt-4 border-t border-white/6 flex gap-2.5">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/50 border border-white/10 bg-white/5 hover:bg-white/8 active:scale-95 cursor-pointer transition-all"
                        style={{ fontFamily: "inherit" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-2 py-2.5 rounded-xl text-sm font-bold text-black active:scale-95 cursor-pointer transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        style={{ background: `linear-gradient(135deg,${plan.color},${plan.color}BB)`, fontFamily: "inherit" }}
                    >
                        {isLoading
                            ? <><ImSpinner9 className="animate-spin" /> Saving…</>
                            : "Save Changes"
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPlanModal;