import React from 'react'

const SidePanel = ({ step, formData }) => {
    const benefits = [
        { icon: "🎯", text: "Reduce physical queues by 80%" },
        { icon: "📊", text: "Real-time analytics & insights" },
        { icon: "📱", text: "Customers track live from anywhere" },
        { icon: "🔔", text: "Automatic SMS & push notifications" },
        { icon: "⚡", text: "Setup in less than 10 minutes" },
    ];

    return (
        <div className="side-panel font-['serif'] relative hidden lg:flex flex-col w-105 shrink-0 overflow-hidden"
            style={{ background: "linear-gradient(160deg, #040d14 0%, #071620 50%, #040d14 100%)" }}>

            {/* Ambient blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-80 h-80 rounded-full -top-20 -left-20 opacity-30"
                    style={{ background: "radial-gradient(circle,rgba(20,184,166,0.35) 0%,transparent 65%)", animation: "blob-a 18s ease-in-out infinite" }} />
                <div className="absolute w-72 h-72 rounded-full -bottom-16 -right-16 opacity-25"
                    style={{ background: "radial-gradient(circle,rgba(6,182,212,0.3) 0%,transparent 65%)", animation: "blob-b 22s ease-in-out infinite" }} />
                <div className="absolute w-48 h-48 rounded-full top-1/2 left-1/3 opacity-20"
                    style={{ background: "radial-gradient(circle,rgba(129,140,248,0.25) 0%,transparent 65%)", animation: "blob-a 28s ease-in-out 4s infinite" }} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full px-10 py-14">
                {/* Headline */}
                <div className="mb-8" style={{ animation: "fadeUp .7s .1s both" }}>
                    <h2 className="text-[32px] font-bold leading-tight mb-3 text-white" style={{ fontFamily: "'serif', fangsong" }}>
                        Join the smarter<br />
                        <span className="anim-shimmer">queue revolution</span>
                    </h2>
                    <p className="text-sm text-white/45 leading-relaxed">
                        Register your organization and start managing queues digitally. Verified orgs go live within 24 hours.
                    </p>
                </div>

                {/* Benefits */}
                <div className="flex flex-col gap-3 mb-8">
                    {benefits.map((b, i) => (
                        <div key={i} className="flex items-center gap-3" style={{ animation: `slideRight .5s ${0.2 + i * 0.07}s both` }}>
                            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-base shrink-0">{b.icon}</div>
                            <span className="text-sm text-white/60">{b.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SidePanel
