import React from 'react'

const OrgFilter = ({ search, setSearch, typeF, setTypeF, statusF, setStatusF, total, types, statuses, plans, planF, setPlanF }) => {
    // Style for filter chips
    const chip = (active, clr = '#fbbf24') => ({
        padding: '5px 13px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
        border: `1px solid ${active ? clr + '55' : 'rgba(255,255,255,0.08)'}`,
        background: active ? clr + '15' : 'rgba(255,255,255,0.04)',
        color: active ? clr : 'rgba(255,255,255,0.45)',
        transition: 'all .15s', fontFamily: 'inherit',
    });
    
    return (
        <div className="glass rounded-2xl p-4">
            <div className="flex gap-3 mb-3 flex-wrap">
                <div className="relative flex-1 min-w-50">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] opacity-40 pointer-events-none">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name, city, admin or email…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full py-2.5 pl-9 pr-3 bg-white/5 border border-white/10 rounded-xl text-[15px] text-slate-200 outline-none transition-all"
                        style={{ fontFamily: "'serif', 'fangsong'" }}
                    />
                </div>
                <span className="self-center text-[13px] text-white/30 shrink-0" style={{ fontFamily: "'serif'" }}>
                    {total} org{total !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="flex gap-2 flex-wrap items-center mb-2" style={{ fontFamily: "'serif', 'fangsong'" }}>
                <span className="text-xs text-white/30 shrink-0">Type:</span>
                {types.map(t => (
                    <button key={t} style={chip(typeF === t)} onClick={() => setTypeF(t)}>
                        {t === 'all' ? 'All' : t}
                    </button>
                ))}
            </div>

            <div className="flex gap-2 flex-wrap items-center mb-2" style={{ fontFamily: "'serif', 'fangsong'" }}>
                <span className="text-xs text-white/30 shrink-0">Status:</span>
                {statuses.map(s => (
                    <button key={s} style={chip(statusF === s)} onClick={() => setStatusF(s)}>
                        {s === 'all' ? 'All' : s}
                    </button>
                ))}
            </div>

            <div className="flex gap-2 flex-wrap items-center" style={{ fontFamily: "'serif', 'fangsong'" }}>
                <span className="text-xs text-white/30 shrink-0">Plan:</span>
                {plans.map(p => (
                    <button key={p} style={chip(planF === p, '#a78bfa')} onClick={() => setPlanF(p)}>
                        {p === 'all' ? 'All' : p}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default OrgFilter
