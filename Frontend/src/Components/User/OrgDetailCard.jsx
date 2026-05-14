import React from 'react'

const OrgDetailCard = ({ sel, setActive, onBookOrg }) => {
    return (
        <div className="rounded-2xl p-4 shrink-0 mb-1" style={{
            background: `linear-gradient(135deg,${sel.color}12,rgba(255,255,255,0.02))`,
            border: `1px solid ${sel.color}28`
        }}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9.5 h-9.5 rounded-[11px] flex items-center justify-center text-[18px] shrink-0" style={{ background: `${sel.color}18`, border: `1px solid ${sel.color}30` }}>{sel.icon}</div>
                    <div className="min-w-0" style={{ fontFamily: "'serif', fangsong" }}>
                        <div className="font-bold text-sm overflow-hidden text-ellipsis whitespace-nowrap">{sel.name}</div>
                        <div className="text-xs font-semibold" style={{ color: sel.color }}>{sel.type}{sel.verified ? " · ✓ Verified" : ""}</div>
                    </div>
                </div>
                <button className="btn w-6.5 h-6.5 rounded-full flex items-center justify-center text-[13px] shrink-0 text-white/60" onClick={() => setActive(null)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>✕</button>
            </div>
            <p className="text-xs text-white/50 mb-3">📍 {sel.address}</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
                {[["Services", sel.count], ["Area", sel.area]].map(([k, v]) => (
                    <div key={k} className="text-center p-1.75 rounded-[10px]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="text-[10px] text-white/35 mb-0.5">{k}</div>
                        <div className="font-bold text-sm" style={{ fontFamily: "'serif', fangsong", color: k === "Services" ? sel.color : "#E8EDF5" }}>{v}</div>
                    </div>
                ))}
            </div>
            <div className="flex gap-3.5">
                <a
                    href={`https://www.openstreetmap.org/?mlat=${sel.lat}&mlon=${sel.lng}&zoom=17`}
                    target="_blank" rel="noreferrer"
                    className="flex-1 text-center py-2 rounded-[10px] text-sm font-semibold text-white/70 no-underline transition-all duration-200"
                    style={{ fontFamily: "'serif', fangsong", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                    🗺️ Directions
                </a>
                <button className="btn flex-2 py-2 rounded-[10px] text-sm font-extrabold text-black" onClick={() => onBookOrg(sel.id)} style={{ fontFamily: "'serif', fangsong", background: `linear-gradient(135deg,${sel.color},${sel.color}AA)` }}>
                    Browse Services →
                </button>
            </div>
        </div>
    )
}

export default OrgDetailCard
