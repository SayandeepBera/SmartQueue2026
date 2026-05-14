import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessScreen = ({ data }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center text-center mt-15 py-8 px-4" style={{ animation: "scaleUp .5s both" }}>
            {/* Animated checkmark */}
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl bg-teal-500/15 border-2 border-teal-400/40 check-bounce">✅</div>
                <div className="absolute inset-0 rounded-full border-2 border-teal-400/25" style={{ animation: "pulse-ring 2s ease-out infinite" }} />
                <div className="absolute inset-0 rounded-full border border-teal-400/10" style={{ animation: "pulse-ring 2s ease-out .5s infinite" }} />
            </div>

            <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'serif', fangsome" }}>
                Application Submitted!
            </h2>
            <p className="text-white/50 text-sm mb-2 max-w-md leading-relaxed">
                <span className="text-teal-400 font-semibold">{data.orgName}</span> has been successfully registered. Our team will review your documents and verify within 24–48 hours.
            </p>
            <p className="text-white/30 text-xs mb-10">A confirmation email has been sent to <span className="text-white/60">{data.email}</span></p>

            <div className="glass rounded-2xl p-5 w-full max-w-sm mb-8 text-left">
                <div className="text-xs font-bold text-teal-400/70 uppercase tracking-widest mb-4">What happens next?</div>
                {[
                    { n: "1", t: "Document Review", d: "Our team reviews your documents (24–48 hrs)", done: false },
                    { n: "2", t: "Verification Call", d: "A brief verification call with your admin", done: false },
                    { n: "3", t: "Account Activation", d: "Your dashboard goes live", done: false },
                ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                        <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold text-black mt-0.5"
                            style={{ background: "linear-gradient(135deg,#14b8a6,#0891b2)" }}>{step.n}</div>
                        <div>
                            <div className="text-sm font-semibold text-white">{step.t}</div>
                            <div className="text-[11px] text-white/35 mt-0.5">{step.d}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-3">
                <button className="btn-primary px-6 py-3 rounded-xl text-sm font-bold text-black border-none" onClick={() => navigate('/login')}>
                    Go to Dashboard →
                </button>
                <button className="btn-ghost px-6 py-3 rounded-xl text-sm font-semibold text-white/70 border-none" onClick={() => navigate('/')}>
                    Back to Home
                </button>
            </div>
        </div>
    );
}

export default SuccessScreen
