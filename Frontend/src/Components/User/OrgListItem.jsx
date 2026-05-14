import React from 'react'

const OrgListItem = ({ org, active, setActive }) => {
    return (
        <div
            key={org.id}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 shrink-0"
            onClick={() => setActive(active === org.id ? null : org.id)}
            style={{
                background: active === org.id ? `${org.color}10` : "rgba(255,255,255,0.03)",
                border: `1px solid ${active === org.id ? org.color + "30" : "rgba(255,255,255,0.06)"}`
            }}
        >
            <div className="w-8.5 h-8.5 rounded-[9px] flex items-center justify-center text-[17px] shrink-0" style={{ background: `${org.color}18`, border: `1px solid ${org.color}28` }}>{org.icon}</div>
            <div className="flex-1 min-w-0" style={{ fontFamily: "'serif', fangsong" }}>
                <div className="text-sm font-semibold flex items-center gap-1">
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">{org.name}</span>
                    {org.verified && <span className="text-[10px] shrink-0" style={{ color: "#00C9A7" }}>✓</span>}
                </div>
                <div className="text-[11px] text-white/40 mt-px overflow-hidden text-ellipsis whitespace-nowrap">📍 {org.address}</div>
            </div>
            <div className="flex flex-col items-end gap-0.75 shrink-0">
                <span className="text-[10px] font-bold px-1.75 py-0.5 rounded-md" style={{ background: `${org.color}15`, color: org.color }}>{org.type}</span>
                <span className="text-[10px] text-white/35">{org.count} svcs</span>
            </div>
        </div>
    )
}

export default OrgListItem
