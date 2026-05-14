import React from 'react'

const InfoRow = ({ icon: Icon, label, value }) =>
    value ? (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Icon size={14} className="text-white/40" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] text-white/28 uppercase tracking-widest font-bold">{label}</p>
                <p className="text-sm text-white/80 mt-0.5 wrap-break-words">{value}</p>
            </div>
        </div>
    ) : null;

export default InfoRow
