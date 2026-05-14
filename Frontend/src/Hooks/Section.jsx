import React from 'react'

const Section = ({ title, icon: Icon, children }) => (
    <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2.5 px-5 py-4 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(0,201,167,0.1)", border: "1px solid rgba(0,201,167,0.2)" }}>
                <Icon size={13} className="text-[#00C9A7]" />
            </div>
            <h3 className="text-sm font-bold text-white/75 uppercase tracking-widest"
                style={{ fontFamily: "'fangsong'" }}>{title}</h3>
        </div>
        <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
);

export default Section
