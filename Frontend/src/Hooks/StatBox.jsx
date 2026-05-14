import React from 'react'

const StatBox = ({ value, label, color }) => (
    <div className="text-center px-4 py-3 rounded-2xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="text-xl font-extrabold" style={{ color, fontFamily: "'Space Grotesk',sans-serif" }}>{value}</div>
        <div className="text-[11px] text-white/35 mt-0.5">{label}</div>
    </div>
);

export default StatBox
