import React, { useState } from 'react';
import Badge from './Badge';
import PlanBadge from './PlanBadge';
import DocCard from './DocCard';
import { ImSpinner9 } from "react-icons/im";

/* ----- tiny helpers ----- */
const Row = ({ label, value }) => (
    value ? (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-widest text-white/25 font-bold">{label}</span>
            <span className="text-[13px] text-white/80 font-medium wrap-break-words">{value}</span>
        </div>
    ) : null
);

const SectionTitle = ({ icon, title }) => (
    <div className="flex items-center gap-2 mb-3 mt-1">
        <span className="text-base">{icon}</span>
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/35">{title}</h4>
        <div className="flex-1 h-px bg-white/6" />
    </div>
);

/* ----- Inline reason input used inside footer ----- */
const ReasonInput = ({ label, placeholder, value, onChange }) => (
    <div className="w-full">
        <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1.5">
            {label} <span className="normal-case text-white/25">(optional)</span>
        </label>
        <textarea
            rows={2}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm text-white/80 bg-white/5 border border-white/10 outline-none resize-none transition-all"
            style={{ fontFamily: "inherit" }}
            onFocus={e => { e.target.style.borderColor = "rgba(251,191,36,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(251,191,36,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
        />
    </div>
);

/* ----- main modal ----- */
const DetailModal = ({ detail, setDetail, verifyOrg, updateStatus, deleteOrg, reactivateOrg, isLoading }) => {
    const o = detail;
    if (!o) return null;

    // Local state for inline reason inputs inside the footer
    const [rejectReason,  setRejectReason]  = useState("");
    const [suspendReason, setSuspendReason] = useState("");

    // Which inline action form is expanded in the footer
    // "reject" | "suspend" | null
    const [activeAction, setActiveAction] = useState(null);

    const fullAddress = [o.address, o.area, o.city, o.state, o.pincode]
        .filter(Boolean).join(', ');

    /* ── handlers ── */
    const handleVerify = () => verifyOrg(o._id);

    const handleRejectConfirm = () => {
        updateStatus(o._id, "rejected", rejectReason.trim());
        setActiveAction(null);
        setRejectReason("");
    };

    const handleSuspendConfirm = () => {
        updateStatus(o._id, "suspended", suspendReason.trim());
        setActiveAction(null);
        setSuspendReason("");
    };

    const handleRestore = () => reactivateOrg(o._id);

    const handleDelete = () => deleteOrg(o._id);

    const Spinner = () => <ImSpinner9 className="animate-spin inline mr-1.5" />;

    return (
        <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-[#0D1321]/75 p-3 sm:p-6 md:p-8 overflow-hidden"
            style={{ backdropFilter: "blur(20px)" }}
            onClick={e => { if (e.target === e.currentTarget) setDetail(null); }}
        >
            <div
                className="relative flex flex-col w-full max-w-2xl bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl max-h-full"
                style={{
                    animation: "modalIn .3s cubic-bezier(.34,1.4,.64,1) both",
                    fontFamily: "'serif', 'fangsong'",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* ----- Header ----- */}
                <div className="sticky top-0 z-20 px-5 py-4 sm:px-7 sm:pt-7 sm:pb-5 border-b border-white/6 bg-[#0B1120]/80 backdrop-blur-md rounded-t-3xl">
                    <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight truncate">
                                    {o.orgName}
                                </h2>
                                {o.status === "approved" && (
                                    <span className="text-[9px] sm:text-[10px] font-bold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full">
                                        ✓ Verified
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge status={o.status} />
                                <PlanBadge plan={o.plan} />
                                <span className="text-[11px] text-white/35">
                                    {o.orgType} · {o.city}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setDetail(null)}
                            className="shrink-0 w-8 h-8 rounded-full border border-white/10 bg-white/6
                                       text-white/50 hover:text-white hover:bg-white/10
                                       flex items-center justify-center text-sm transition-all shadow-lg cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* ----- Scrollable Body ----- */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-6 sm:px-7 flex flex-col gap-6 bg-[#0B1120]/40">

                    {/* 1. Basic Info */}
                    <div>
                        <SectionTitle icon="🏢" title="Organization Details" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
                            <Row label="Full Name"      value={o.orgName} />
                            <Row label="Short Name"     value={o.shortName} />
                            <Row label="Type"           value={o.orgType} />
                            <Row label="Reg. Number"    value={o.regNumber} />
                            <Row label="GST Number"     value={o.gstNumber} />
                            <Row label="Established"    value={o.estYear} />
                            <Row label="Staff Count"    value={o.staffCount} />
                            <Row label="Working Hours"  value={`${o.workStart || '09:00'} – ${o.workEnd || '18:00'}`} />
                            <Row label="Plan"           value={o.plan} />
                        </div>
                        {o.description && (
                            <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-white/3 border border-white/6">
                                <span className="text-[10px] uppercase tracking-widest text-white/25 font-bold block mb-1">About</span>
                                <p className="text-[13px] text-white/65 leading-relaxed">{o.description}</p>
                            </div>
                        )}
                    </div>

                    {/* 2. Contact & Location */}
                    <div>
                        <SectionTitle icon="📞" title="Contact & Location" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
                            <Row label="Admin Name"   value={o.adminName} />
                            <Row label="Designation"  value={o.designation} />
                            <Row label="Email"        value={o.email} />
                            <Row label="Phone"        value={o.phone} />
                            <Row label="City"         value={o.city} />
                            <Row label="State"        value={o.state} />
                            <Row label="PIN Code"     value={o.pincode} />
                            {o.website && <Row label="Website" value={o.website} />}
                        </div>
                        {fullAddress && (
                            <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-white/3 border border-white/6">
                                <span className="text-[10px] uppercase tracking-widest text-white/25 font-bold block mb-1">Full Address</span>
                                <p className="text-[13px] text-white/65">{fullAddress}</p>
                            </div>
                        )}
                    </div>

                    {/* 3. Documents */}
                    <div>
                        <SectionTitle icon="📄" title="Submitted Documents" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <DocCard label="Registration Certificate" doc={o.docRegCert}      required />
                            <DocCard label="GST Certificate"          doc={o.docGst}           required />
                            <DocCard label="Owner ID Proof"           doc={o.docIdProof}       required />
                            <DocCard label="Address Proof"            doc={o.docAddressProof}  required={false} />
                            <DocCard label="Organization Logo"        doc={o.logo}             required={false} />
                        </div>
                    </div>

                    {/* 4. Meta */}
                    <div>
                        <SectionTitle icon="📊" title="Account Info" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
                            <Row label="Status"       value={o.status} />
                            <Row label="Registered"   value={o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null} />
                            <Row label="Last Updated" value={o.updatedAt ? new Date(o.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null} />
                            {o.rejectionReason && <Row label="Rejection Reason" value={o.rejectionReason} />}
                        </div>
                    </div>
                </div>

                {/* ----- Action Footer ----- */}
                <div className="sticky bottom-0 px-5 py-4 sm:px-7 sm:py-5 border-t border-white/6 bg-[#121827]/95 backdrop-blur-md flex flex-col gap-3 rounded-b-3xl">

                    {/* ── Inline reason form for Reject ──────────────────── */}
                    {activeAction === "reject" && (
                        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/15">
                            <ReasonInput
                                label="Reason for Rejection"
                                placeholder="e.g. Documents are unclear or invalid…"
                                value={rejectReason}
                                onChange={setRejectReason}
                            />
                            <div className="flex gap-2.5">
                                <button
                                    onClick={() => { setActiveAction(null); setRejectReason(""); }}
                                    className="flex-1 py-2 rounded-xl text-sm font-semibold text-white/50 transition-all cursor-pointer border border-white/10 bg-white/5 hover:bg-white/8 active:scale-95"
                                    style={{ fontFamily: "inherit" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRejectConfirm}
                                    disabled={isLoading}
                                    className="flex-2 py-2 rounded-xl text-sm font-bold text-white transition-all cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                                    style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)", fontFamily: "inherit" }}
                                >
                                    {isLoading ? <><Spinner />Processing…</> : "Confirm Reject"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Inline reason form for Suspend ─────────────────── */}
                    {activeAction === "suspend" && (
                        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/15">
                            <ReasonInput
                                label="Reason for Suspension"
                                placeholder="e.g. Policy violation, pending review…"
                                value={suspendReason}
                                onChange={setSuspendReason}
                            />
                            <div className="flex gap-2.5">
                                <button
                                    onClick={() => { setActiveAction(null); setSuspendReason(""); }}
                                    className="flex-1 py-2 rounded-xl text-sm font-semibold text-white/50 transition-all cursor-pointer border border-white/10 bg-white/5 hover:bg-white/8 active:scale-95"
                                    style={{ fontFamily: "inherit" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSuspendConfirm}
                                    disabled={isLoading}
                                    className="flex-2 py-2 rounded-xl text-sm font-bold text-white transition-all cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                                    style={{ background: "linear-gradient(135deg,#ea580c,#c2410c)", fontFamily: "inherit" }}
                                >
                                    {isLoading ? <><Spinner />Processing…</> : "Confirm Suspend"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Main action buttons row ─────────────────────────── */}
                    {activeAction === null && (
                        <div className="flex gap-2.5 flex-wrap">

                            {/* PENDING → Verify + Reject */}
                            {o.status === "pending" && (<>
                                <button
                                    onClick={handleVerify}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all active:scale-95 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                                    style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", fontFamily: "inherit" }}
                                >
                                    {isLoading ? <><Spinner />Processing…</> : "✓ Verify & Approve"}
                                </button>
                                <button
                                    onClick={() => setActiveAction("reject")}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-red-400 transition-all border border-rose-500/30 bg-rose-500/10 active:scale-95 cursor-pointer disabled:opacity-60"
                                    style={{ fontFamily: "inherit" }}
                                >
                                    ✕ Reject
                                </button>
                            </>)}

                            {/* APPROVED → Suspend */}
                            {o.status === "approved" && (
                                <button
                                    onClick={() => setActiveAction("suspend")}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-orange-400 transition-all border border-orange-500/30 bg-orange-500/10 active:scale-95 cursor-pointer disabled:opacity-60"
                                    style={{ fontFamily: "inherit" }}
                                >
                                    🛑 Suspend
                                </button>
                            )}

                            {/* REJECTED / SUSPENDED / SCHEDULED_FOR_DELETION → Restore */}
                            {(o.status === "rejected" || o.status === "suspended" || o.status === "scheduled_for_deletion") && (
                                <button
                                    onClick={handleRestore}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-emerald-400 transition-all border border-emerald-500/30 bg-emerald-500/10 active:scale-95 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                                    style={{ fontFamily: "inherit" }}
                                >
                                    {isLoading ? <><Spinner />Processing…</> : "♻️ Restore"}
                                </button>
                            )}

                            {/* Delete — always present */}
                            {(o.status !== "scheduled_for_deletion" && o.status !== "pending") && (<button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="py-2.5 px-5 rounded-xl text-sm font-semibold text-red-400 transition-all border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 active:scale-95 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                                style={{ fontFamily: "inherit" }}
                            >
                                {isLoading ? <><Spinner />…</> : "🗑 Remove"}
                            </button>)}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailModal;