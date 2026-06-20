import React from 'react';
import FieldError from '../../Hooks/FieldError';

const ORG_TYPES = [
    { id: "Hospital", icon: "🏥", label: "Hospital", desc: "Multi-specialty or general", color: "#f43f5e" },
    { id: "Bank", icon: "🏦", label: "Bank", desc: "Banking & financial services", color: "#f59e0b" },
    { id: "Government", icon: "🏛️", label: "Government", desc: "Govt offices & departments", color: "#3b82f6" },
    { id: "Clinic", icon: "🩺", label: "Clinic", desc: "Private clinic or specialist", color: "#8b5cf6" },
    { id: "Diagnostic", icon: "🔬", label: "Diagnostic", desc: "Labs & diagnostic centres", color: "#06b6d4" },
    { id: "Other", icon: "🏢", label: "Other", desc: "Any other service org", color: "#14b8a6" },
];

const REQUIRED_DOCS = [
    { id: "reg_cert", label: "Registration Certificate", required: true, desc: "Official certificate of incorporation or registration" },
    { id: "gst", label: "GST Certificate", required: true, desc: "Valid GST registration document" },
    { id: "id_proof", label: "Owner ID Proof", required: true, desc: "Aadhaar / PAN / Passport of authorized person" },
    { id: "address_proof", label: "Address Proof", required: false, desc: "Utility bill or lease agreement" },
    { id: "logo", label: "Organization Logo", required: false, desc: "PNG or SVG logo, min 200×200px" },
];

const PLANS = [
    { id: "Free", price: 0, period: "", color: "#64748b", features: ["2 service counters", "100 tokens/day", "Basic analytics", "Email support"], recommended: false },
    { id: "Starter", price: 999, period: "/month", color: "#14b8a6", features: ["5 service counters", "500 tokens/day", "SMS alerts", "Priority support", "Custom branding"], recommended: false },
    { id: "Pro", price: 2999, period: "/month", color: "#f59e0b", features: ["15 service counters", "Unlimited tokens", "Full analytics", "API access", "Dedicated manager"], recommended: true },
    { id: "Enterprise", price: 7999, period: "/month", color: "#8b5cf6", features: ["Unlimited counters", "Unlimited tokens", "White-label", "SLA guarantee", "Custom integrations"], recommended: false },
];

const FormSlide6 = ({ data, setData, errors }) => {
    const selectedPlan = PLANS.find(p => p.id === data.plan);
    const selectedType = ORG_TYPES.find(t => t.id === data.orgType);
    const docsUploaded = Object.keys(data.docs || {}).length;

    const ReviewRow = ({ label, value, mono }) => (
        <div className="flex items-start justify-between py-2.5 border-b border-white/5 last:border-0">
            <span className="text-xs text-white/35 shrink-0 w-36">{label}</span>
            <span className={`text-sm font-medium text-white/85 text-right ${mono ? "font-mono text-xs" : ""}`}>{value || <span className="text-white/20">—</span>}</span>
        </div>
    );

    return (
        <div className="step-enter">
            <div className="mb-8">
                <p className="text-[11px] text-teal-400 font-semibold tracking-[2px] uppercase mb-2">Step 6 of 6</p>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'serif', fangsome" }}>Review & submit</h3>
                <p className="text-sm text-white/40">Please review all details before submitting. You can go back to edit.</p>
            </div>

            <div className="flex flex-col gap-4">
                {/* Org identity */}
                <div className="glass rounded-2xl p-5" style={{ animation: "fadeUp .4s .05s both" }}>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-base">{selectedType?.icon}</span>
                        <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">Organization Identity</h4>
                    </div>
                    <ReviewRow label="Type" value={`${selectedType?.icon || "🏢"} ${data.orgType}`} />
                    <ReviewRow label="Full Name" value={data.orgName} />
                    <ReviewRow label="Short Name" value={data.shortName} />
                    <ReviewRow label="Reg. Number" value={data.regNumber} mono />
                    <ReviewRow label="GST" value={data.gstNumber} mono />
                    <ReviewRow label="Established" value={data.estYear} />
                    <ReviewRow label="Working Hours" value={`${data.workStart || "09:00"} – ${data.workEnd || "18:00"}`} />
                </div>

                {/* Contact */}
                <div className="glass rounded-2xl p-5" style={{ animation: "fadeUp .4s .1s both" }}>
                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Contact & Location</h4>
                    <ReviewRow label="Admin" value={`${data.adminName} (${data.designation})`} />
                    <ReviewRow label="Email" value={data.email} />
                    <ReviewRow label="Phone" value={data.phone} />
                    <ReviewRow label="Address" value={[data.address, data.area, data.city, data.state, data.pincode].filter(Boolean).join(", ")} />
                    <ReviewRow label="Website" value={data.website} />
                </div>

                {/* Documents */}
                <div className="glass rounded-2xl p-5" style={{ animation: "fadeUp .4s .15s both" }}>
                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Documents</h4>
                    {REQUIRED_DOCS.map(doc => {
                        const file = data.docs?.[doc.id];
                        return (
                            <div key={doc.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <span className="text-xs text-white/35">{doc.label}</span>
                                {file ? (
                                    <span className="text-[10px] text-teal-400 font-semibold bg-teal-400/10 px-2 py-0.5 rounded-full border border-teal-400/20">✓ {file.name.slice(0, 20)}{file.name.length > 20 ? "…" : ""}</span>
                                ) : (
                                    <span className="text-[10px] text-white/20">{doc.required ? "⚠ Missing" : "Not uploaded"}</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Plan */}
                <div className="rounded-2xl p-5 border" style={{ background: `${selectedPlan?.color}0A`, borderColor: `${selectedPlan?.color}30`, animation: "fadeUp .4s .2s both" }}>
                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Selected Plan</h4>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-base font-bold mb-0.5" style={{ color: selectedPlan?.color, fontFamily: "'serif', fangsome" }}>{selectedPlan?.id}</div>
                            <div className="text-xs text-white/40">{selectedPlan?.features?.slice(0, 2).join(" · ")}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-extrabold text-white" style={{ fontFamily: "'serif', fangsome" }}>
                                {selectedPlan?.price === 0 ? "Free" : `₹${selectedPlan?.price?.toLocaleString()}`}
                            </div>
                            {selectedPlan?.period && <div className="text-[11px] text-white/30">{selectedPlan.period}</div>}
                        </div>
                    </div>
                </div>

                {/* T&C */}
                <div className="glass rounded-2xl p-4" style={{ animation: "fadeUp .4s .25s both" }}>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <div className="relative mt-0.5 shrink-0">
                            <input type="checkbox" required className="sr-only peer" id="terms" checked={data.acceptedTerms} onChange={(e) => setData({...data, acceptedTerms: e.target.checked})} />
                            <div className="w-5 h-5 rounded-md border-2 border-white/20 peer-checked:border-teal-400 peer-checked:bg-teal-400/90 transition-all flex items-center justify-center">
                                <svg className="w-3 h-3 text-black opacity-0 peer-checked:opacity-100" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-xs text-white/45 leading-relaxed">
                            I confirm all provided information is accurate and I agree to SmartQueue's{" "}
                            <span className="text-teal-400 cursor-pointer hover:underline">Terms of Service</span>,{" "}
                            <span className="text-teal-400 cursor-pointer hover:underline">Privacy Policy</span>, and{" "}
                            <span className="text-teal-400 cursor-pointer hover:underline">Organization Guidelines</span>.
                        </p>
                    </label>
                    <FieldError msg={errors.acceptedTerms} />
                </div>
            </div>
        </div>
    );
}

export default FormSlide6
