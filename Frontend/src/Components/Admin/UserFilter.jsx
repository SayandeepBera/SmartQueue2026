import React from 'react'

const UserFilter = ({ search, setSearch, statusF, setStatusF, total }) => {
    return (
        <div className="glass rounded-2xl p-4">
            <div className="flex gap-3 flex-wrap items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-48">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[17px] opacity-40 pointer-events-none">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name, email or city…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full py-2.5 pl-9 pr-3 bg-white/5 border border-white/10 rounded-xl text-[15px] text-slate-200 outline-none transition-all"
                        style={{ fontFamily: "'serif', 'fangsong'" }}
                    />
                </div>

                {/* Status filter chips */}
                <div className="flex gap-2 flex-wrap">
                    {[['all', 'All'], ['active', 'Active'], ['suspended', 'Suspended']].map(([val, lbl]) => (
                        <button
                            key={val}
                            onClick={() => setStatusF(val)}
                            style={{
                                padding: '6px 14px', borderRadius: 20, fontSize: 12,
                                fontWeight: 600, cursor: 'pointer', fontFamily: "'serif', 'fangsong'",
                                transition: 'all .15s',
                                border: `1px solid ${statusF === val ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                background: statusF === val ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.04)',
                                color: statusF === val ? '#a78bfa' : 'rgba(255,255,255,0.45)',
                            }}
                        >
                            {lbl}
                        </button>
                    ))}
                </div>

                {/* Count */}
                <span className="text-[13px] text-white/30 shrink-0" style={{ fontFamily: "'serif'" }}>
                    {total} user{total !== 1 ? 's' : ''}
                </span>
            </div>
        </div>
    )
}

export default UserFilter
