import React, { useContext, useState } from 'react'
import SidePanel from './SidePanel'
import StepIndicator from './StepIndicator';
import ProgressBar from './ProgressBar';
import FormSlide1 from './FormSlide1';
import FormSlide2 from './FormSlide2';
import FormSlide3 from './FormSlide3';
import FormSlide4 from './FormSlide4';
import FormSlide5 from './FormSlide5';
import FormSlide6 from './FormSlide6';
import { motion, AnimatePresence } from 'framer-motion';
import SuccessScreen from './SuccessScreen';
import OrgContext from '../../Context/Organization/OrgContext';
import { toast } from "react-toastify";
import { ImSpinner9 } from "react-icons/im";

const STEPS = [
    { id: 1, label: "Org Type", icon: "🏢", desc: "What kind of organization?" },
    { id: 2, label: "Basic Info", icon: "📋", desc: "Organization details" },
    { id: 3, label: "Contact", icon: "📞", desc: "Contact & location info" },
    { id: 4, label: "Documents", icon: "📄", desc: "Upload verification docs" },
    { id: 5, label: "Plan", icon: "💎", desc: "Choose your subscription" },
    { id: 6, label: "Review", icon: "✅", desc: "Review & submit" },
];

const REQUIRED_DOCS = [
    { id: "reg_cert", label: "Registration Certificate", required: true, desc: "Official certificate of incorporation or registration" },
    { id: "gst", label: "GST Certificate", required: true, desc: "Valid GST registration document" },
    { id: "id_proof", label: "Owner ID Proof", required: true, desc: "Aadhaar / PAN / Passport of authorized person" },
    { id: "address_proof", label: "Address Proof", required: false, desc: "Utility bill or lease agreement" },
    { id: "logo", label: "Organization Logo", required: false, desc: "PNG or SVG logo, min 200×200px" },
];

// Organization types with icons and descriptions for selection in Step 1
const validateStep = (step, data) => {
    const errs = {};
    if (step === 1) {
        if (!data.orgType) errs.orgType = "Please select your organization type";
    }
    if (step === 2) {
        if (!data.orgName?.trim()) errs.orgName = "Organization name is required";
        if (!data.regNumber?.trim()) errs.regNumber = "Registration number is required";
        if (!data.gstNumber?.trim()) errs.gstNumber = "GST number is required";
    }
    if (step === 3) {
        if (!data.adminName?.trim()) errs.adminName = "Admin contact name is required";
        if (!data.email?.trim() || !/\S+@\S+\.\S+/.test(data.email)) errs.email = "Valid email is required";
        if (!data.phone?.trim()) errs.phone = "Phone number is required";
        if (!data.address?.trim()) errs.address = "Address is required";
        if (!data.city?.trim()) errs.city = "City is required";
    }
    if (step === 4) {
        const required = REQUIRED_DOCS.filter(d => d.required).map(d => d.id);
        const missing = required.filter(id => !data.docs?.[id]);
        if (missing.length > 0) errs.docs = `Please upload: ${missing.join(", ")}`;
    }
    if (step === 5) {
        if (!data.plan) errs.plan = "Please select a plan";
    }
    if (step === 6) {
        if (!data.acceptedTerms) errs.acceptedTerms = "You must accept the terms and conditions";
    }
    return errs;
};

const OrgsRegistrationForm = ({ setShowForm }) => {
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const { registerOrganization } = useContext(OrgContext);

    const TOTAL = 6;

    const [formData, setFormData] = useState({
        orgType: "", orgName: "", shortName: "",
        regNumber: "", gstNumber: "", description: "",
        estYear: "", staffCount: "", workStart: "09:00",
        workEnd: "18:00", adminName: "", designation: "",
        email: "", phone: "", address: "",
        area: "", city: "", state: "",
        pincode: "", website: "", docs: {},
        plan: "Free", acceptedTerms: false,
    });

    // Navigate to the next step after validation, or submit if it's the last step
    const goNext = () => {
        const errs = validateStep(step, formData);
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setErrors({});
        if (step < TOTAL) setStep(s => s + 1);
        else handleSubmit();
    };

    // Navigate back to the previous step and clear any existing errors
    const goBack = () => { setErrors({}); setStep(s => s - 1); };

    // Handle final form submission with API call and feedback
    const handleSubmit = async () => {
        setSubmitting(true);

        // Create FormData object for file uploads
        const data = new FormData();

        // Append all form fields except files
        Object.keys(formData).forEach((key) => {
            if (key !== "docs") {
                data.append(key, formData[key]);
            }
        });

        if (formData.docs.reg_cert) data.append("docRegCert", formData.docs.reg_cert);
        if (formData.docs.gst) data.append("docGst", formData.docs.gst);
        if (formData.docs.id_proof) data.append("docIdProof", formData.docs.id_proof);
        if (formData.docs.address_proof) data.append("docAddressProof", formData.docs.address_proof);
        if (formData.docs.logo) data.append("logo", formData.docs.logo);

        try {
            // Call the registerOrganization function from context, which handles API interaction
            const result = await registerOrganization(data);

            if (result.success) {
                toast.success(result.message, {
                    style: { borderRadius: '10px', background: '#03C203', color: '#fff' }
                })

                setSubmitted(true);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Connection failed while registering the organization. Please check your internet connection and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Function to render the current step's form slide
    const renderStep = () => {
        switch (step) {
            case 1:
                return <FormSlide1 data={formData} setData={setFormData} errors={errors} />;
            case 2:
                return <FormSlide2 data={formData} setData={setFormData} errors={errors} />;
            case 3:
                return <FormSlide3 data={formData} setData={setFormData} errors={errors} />;
            case 4:
                return <FormSlide4 data={formData} setData={setFormData} errors={errors} />;
            case 5:
                return <FormSlide5 data={formData} setData={setFormData} errors={errors} />;
            case 6:
                return <FormSlide6 data={formData} setData={setFormData} errors={errors} />;
            default:
                return null;
        }
    };

    return (
        /* ── Overlay that starts right below the navbar (h-20 = 5rem) ── */
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-999 flex flex-col lg:flex-row overflow-hidden"
            style={{
                top: "5rem",          /* sits flush below the 80px navbar */
                background: "#060e17",
            }}
        >
            {/* ── Side Panel (desktop only) ── */}
            {!submitted && <SidePanel step={step} formData={formData} />}

            {/* ── Main form column ── */}
            <div
                className={`relative flex-1 flex flex-col min-h-0 overflow-hidden ${submitted ? "items-center justify-center" : ""}`}
                style={{ background: "linear-gradient(160deg,#080f18 0%,#060d15 100%)" }}
            >
                {/* ── Close button ───────────────────────────────────────────── */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(false)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-5 z-50
                               w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center
                               rounded-full border border-white/10
                               bg-white/5 text-white/40
                               hover:bg-red-500/20 hover:text-red-400
                               transition-all duration-200 shrink-0"
                    aria-label="Close"
                >
                    <span className="text-base sm:text-lg font-bold leading-none">✕</span>
                </motion.button>

                {submitted ? (
                    /* ── Success screen ── */
                    <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto w-full">
                        <SuccessScreen data={formData} />
                    </div>
                ) : (
                    /* ── Normal multi-step layout ── */
                    <div className="flex flex-col flex-1 min-h-0">

                        {/* ── Sticky top-bar: step indicator + progress bar ──
                            pr-12 on small screens so the close button never
                            overlaps the last step dot.                          */}
                        <div
                            className="shrink-0 px-4 sm:px-10 md:px-19 py-6
                                       border-b border-white/6
                                       bg-[#060d15]/90 backdrop-blur-md pr-14 md:pr-17.5
                    "
                        >
                            <StepIndicator current={step} steps={STEPS} />
                            <div className="mt-3">
                                <ProgressBar step={step} total={TOTAL} />
                            </div>
                        </div>

                        {/* ── Scrollable form content ── */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-6">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={step}
                                        initial={{ opacity: 0, x: 28 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -28 }}
                                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        {renderStep()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* ── Sticky bottom navigation bar ─────────────────── */}
                        <div
                            className="shrink-0 border-t border-white/6 px-4 sm:px-6 md:px-8 py-3 sm:py-4"
                            style={{ background: "rgba(6,14,23,0.92)", backdropFilter: "blur(16px)" }}
                        >
                            <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 sm:gap-4">

                                {/* Left: back + step counter */}
                                <div className="flex items-center gap-2 min-w-0">
                                    {step > 1 && (
                                        <button
                                            onClick={goBack}
                                            className="btn-ghost flex items-center gap-1.5 px-3 sm:px-5 py-2.5 rounded-xl
                                                       text-xs sm:text-sm font-semibold text-white/55 border-none whitespace-nowrap"
                                        >
                                            ← <span className="hidden xs:inline">Back</span>
                                        </button>
                                    )}
                                    <span className="text-[10px] sm:text-xs text-white/20 font-mono whitespace-nowrap">
                                        {step} / {TOTAL}
                                    </span>
                                </div>

                                {/* Right: save draft + continue/submit */}
                                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                    <button className="btn-ghost hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl
                                                       text-xs font-semibold text-white/30 border-none">
                                        💾 <span className="hidden md:inline">Save Draft</span>
                                    </button>

                                    <button
                                        onClick={goNext}
                                        disabled={submitting}
                                        className="btn-primary flex items-center gap-2 px-4 sm:px-7 py-2.5 rounded-xl
                                                   text-xs sm:text-sm font-bold text-black border-none
                                                   disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="flex items-center justify-center gap-2">
                                                    <ImSpinner9 className="animate-spin" /> Submitting...
                                                </span>
                                            </>
                                        ) : step === TOTAL ? (
                                            <>Submit 🚀</>
                                        ) : (
                                            <>Continue →</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Step hint line */}
                            <div className="max-w-2xl mx-auto mt-1.5 flex items-center justify-between">
                                <p className="text-[10px] sm:text-[11px] text-white/18 truncate">
                                    {STEPS[step - 1]?.desc}
                                </p>
                                <p className="text-[10px] sm:text-[11px] text-white/14 whitespace-nowrap ml-4">
                                    {TOTAL - step} step{TOTAL - step !== 1 ? "s" : ""} left
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default OrgsRegistrationForm;