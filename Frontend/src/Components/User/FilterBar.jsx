import React, { useEffect, useState, useContext, useRef } from 'react';
import RevealSection from '../../Hooks/RevealSection';
import PublicContext from '../../Context/Public/PublicContext';

const DEFAULT_CATEGORIES = ["All", "Hospital", "Bank", "Government", "Clinic", "Diagnostic", "Other"];
const DEFAULT_AREAS = ["All Areas"];

const CAT_ICONS = {
    All: "✦", Hospital: "🏥", Bank: "🏦", Government: "🏛️",
    Clinic: "🩺", Diagnostic: "🔬", Other: "🏢",
};

const FilterBar = ({ filters, setFilters, total, filtered, compact = false, dynamicFilters = null }) => {
    const { getPublicFilters } = useContext(PublicContext);
    const [search, setSearch] = useState(filters.search || "");
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [areas, setAreas] = useState(DEFAULT_AREAS);
    const [advOpen, setAdvOpen] = useState(false);
    const inputRef = useRef();

    // Fetch dynamic filters from API (or use passed-in ones)
    useEffect(() => {
        if (dynamicFilters) {
            setCategories(["All", ...dynamicFilters.categories]);
            setAreas(["All Areas", ...dynamicFilters.areas]);
            return;
        }
        let cancelled = false;
        const load = async () => {
            const result = await getPublicFilters();
            if (!cancelled && result.success) {
                if (result.categories?.length) setCategories(["All", ...result.categories]);
                if (result.areas?.length) setAreas(["All Areas", ...result.areas]);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [dynamicFilters]);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setFilters(f => ({ ...f, search })), 280);
        return () => clearTimeout(t);
    }, [search]);

    // Sync if parent resets filters
    useEffect(() => {
        setSearch(filters.search || "");
    }, [filters.search]);

    const activeFilterCount = [
        filters.category !== "All",
        filters.area !== "All Areas",
        filters.onlyAvail,
        filters.maxWait !== 999,
        filters.sort !== "default",
    ].filter(Boolean).length;

    return (
        <RevealSection delay={0.03}>
            <div className="mb-7">

                {/* ── Top bar: search + sort + advanced toggle ── */}
                <div className="flex gap-3 mb-4 flex-wrap items-center">

                    {/* Search */}
                    <div className="flex-[1_1_200px] relative group">
                        <span
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-40 pointer-events-none transition-opacity duration-200 group-focus-within:opacity-80"
                        >🔍</span>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search services or organizations…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full py-2.75 pr-9 pl-10 text-sm outline-none transition-all duration-200"
                            style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 14,
                                color: "#E8EDF5",
                                fontFamily: "'DM Sans',sans-serif",
                            }}
                            onFocus={e => {
                                e.target.style.borderColor = "rgba(0,201,167,0.5)";
                                e.target.style.boxShadow = "0 0 0 3px rgba(0,201,167,0.1)";
                                e.target.style.background = "rgba(0,201,167,0.04)";
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = "rgba(255,255,255,0.1)";
                                e.target.style.boxShadow = "none";
                                e.target.style.background = "rgba(255,255,255,0.05)";
                            }}
                        />
                        {search && (
                            <button
                                onClick={() => { setSearch(""); inputRef.current?.focus(); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-sm"
                            >✕</button>
                        )}
                    </div>

                    {/* Sort */}
                    <select
                        value={filters.sort}
                        onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                        className="py-2.75 px-4 text-[13px] cursor-pointer outline-none flex-[0_1_170px] transition-all duration-200"
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            border: `1px solid ${filters.sort !== "default" ? "rgba(77,168,218,0.4)" : "rgba(255,255,255,0.1)"}`,
                            borderRadius: 14,
                            color: filters.sort !== "default" ? "#4DA8DA" : "#E8EDF5",
                            fontFamily: "'DM Sans',sans-serif",
                        }}
                    >
                        <option value="default" style={{ background: "#0D1321" }}>⟳ Recommended</option>
                        <option value="wait_asc" style={{ background: "#0D1321" }}>⬆ Wait: Low → High</option>
                        <option value="wait_desc" style={{ background: "#0D1321" }}>⬇ Wait: High → Low</option>
                        <option value="queue_asc" style={{ background: "#0D1321" }}>↑ Queue: Smallest</option>
                    </select>

                    {/* Result count */}
                    <span className="text-xs text-white/30 self-center whitespace-nowrap hidden sm:block">
                        {filtered} / {total} results
                    </span>

                    {/* Advanced toggle — hidden in compact mode */}
                    {!compact && (
                        <button
                            onClick={() => setAdvOpen(v => !v)}
                            className="flex items-center gap-2 px-3.5 py-2.75 rounded-[14px] text-[13px] font-semibold transition-all duration-200 relative"
                            style={{
                                background: advOpen ? "rgba(132,94,194,0.15)" : "rgba(255,255,255,0.05)",
                                border: `1px solid ${advOpen ? "rgba(132,94,194,0.4)" : "rgba(255,255,255,0.1)"}`,
                                color: advOpen ? "#845EC2" : "rgba(255,255,255,0.5)",
                            }}
                        >
                            <span style={{ fontSize: 15 }}>⚙</span>
                            Filters
                            {activeFilterCount > 0 && (
                                <span
                                    className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full text-[10px] font-bold flex items-center justify-center text-black"
                                    style={{ background: "#845EC2" }}
                                >{activeFilterCount}</span>
                            )}
                        </button>
                    )}
                </div>

                {/* ── Category chips row ── */}
                <div className="flex gap-2 flex-wrap items-center mb-3 overflow-x-auto pb-1 scrollbar-hide">
                    {categories.map((c, i) => {
                        const active = filters.category === c;
                        return (
                            <button
                                key={c}
                                onClick={() => setFilters(f => ({ ...f, category: c }))}
                                className="flex items-center gap-1.5 transition-all duration-200 shrink-0"
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: 20,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    border: `1px solid ${active ? "rgba(0,201,167,0.5)" : "rgba(255,255,255,0.08)"}`,
                                    background: active ? "rgba(0,201,167,0.15)" : "rgba(255,255,255,0.04)",
                                    color: active ? "#00C9A7" : "rgba(255,255,255,0.5)",
                                    boxShadow: active ? "0 0 12px rgba(0,201,167,0.2)" : "none",
                                    animation: `chipIn 0.3s ${i * 0.03}s cubic-bezier(.22,1,.36,1) both`,
                                }}
                            >
                                <span style={{ fontSize: 11 }}>{CAT_ICONS[c] || "●"}</span>
                                {c}
                            </button>
                        );
                    })}

                    {/* Quick toggles always visible */}
                    <div className="ml-auto flex gap-2 flex-wrap shrink-0">
                        <button
                            onClick={() => setFilters(f => ({ ...f, onlyAvail: !f.onlyAvail }))}
                            className="transition-all duration-200"
                            style={{
                                padding: "6px 14px",
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                border: `1px solid ${filters.onlyAvail ? "rgba(0,201,167,0.5)" : "rgba(255,255,255,0.08)"}`,
                                background: filters.onlyAvail ? "rgba(0,201,167,0.15)" : "rgba(255,255,255,0.04)",
                                color: filters.onlyAvail ? "#00C9A7" : "rgba(255,255,255,0.5)",
                                boxShadow: filters.onlyAvail ? "0 0 12px rgba(0,201,167,0.15)" : "none",
                            }}
                        >✅ Available</button>
                        <button
                            onClick={() => setFilters(f => ({ ...f, maxWait: f.maxWait === 30 ? 999 : 30 }))}
                            className="transition-all duration-200"
                            style={{
                                padding: "6px 14px",
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                border: `1px solid ${filters.maxWait === 30 ? "rgba(132,94,194,0.55)" : "rgba(255,255,255,0.08)"}`,
                                background: filters.maxWait === 30 ? "rgba(132,94,194,0.18)" : "rgba(255,255,255,0.04)",
                                color: filters.maxWait === 30 ? "#845EC2" : "rgba(255,255,255,0.5)",
                                boxShadow: filters.maxWait === 30 ? "0 0 12px rgba(132,94,194,0.15)" : "none",
                            }}
                        >⏱ &lt;30 min</button>
                    </div>
                </div>

                {/* ── Advanced: Area chips (collapsible, hidden in compact) ── */}
                {!compact && (
                    <div
                        className="overflow-hidden transition-all duration-300"
                        style={{
                            maxHeight: advOpen ? "200px" : "0px",
                            opacity: advOpen ? 1 : 0,
                        }}
                    >
                        <div
                            className="rounded-[16px] p-4 mt-1"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                            <p className="text-[11px] text-white/30 font-semibold tracking-wider uppercase mb-3">📍 Area</p>
                            <div className="flex gap-2 flex-wrap overflow-x-auto pb-1">
                                {areas.map(a => {
                                    const active = filters.area === a;
                                    return (
                                        <button
                                            key={a}
                                            onClick={() => setFilters(f => ({ ...f, area: a }))}
                                            className="transition-all duration-200 shrink-0"
                                            style={{
                                                padding: "5px 13px",
                                                borderRadius: 20,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                border: `1px solid ${active ? "rgba(77,168,218,0.55)" : "rgba(255,255,255,0.08)"}`,
                                                background: active ? "rgba(77,168,218,0.18)" : "rgba(255,255,255,0.04)",
                                                color: active ? "#4DA8DA" : "rgba(255,255,255,0.5)",
                                                boxShadow: active ? "0 0 10px rgba(77,168,218,0.15)" : "none",
                                            }}
                                        >📍 {a}</button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Active filter summary tags */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 items-center">
                        <span className="text-[11px] text-white/30">Active:</span>
                        {filters.category !== "All" && (
                            <ActiveTag label={filters.category} onRemove={() => setFilters(f => ({ ...f, category: "All" }))} color="#00C9A7" />
                        )}
                        {filters.area !== "All Areas" && (
                            <ActiveTag label={filters.area} onRemove={() => setFilters(f => ({ ...f, area: "All Areas" }))} color="#4DA8DA" />
                        )}
                        {filters.onlyAvail && (
                            <ActiveTag label="Available only" onRemove={() => setFilters(f => ({ ...f, onlyAvail: false }))} color="#00C9A7" />
                        )}
                        {filters.maxWait !== 999 && (
                            <ActiveTag label="< 30 min" onRemove={() => setFilters(f => ({ ...f, maxWait: 999 }))} color="#845EC2" />
                        )}
                        {filters.sort !== "default" && (
                            <ActiveTag
                                label={{ wait_asc: "Wait ↑", wait_desc: "Wait ↓", queue_asc: "Queue ↑" }[filters.sort]}
                                onRemove={() => setFilters(f => ({ ...f, sort: "default" }))}
                                color="#4DA8DA"
                            />
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes chipIn {
                    from { opacity: 0; transform: translateY(6px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </RevealSection>
    );
};

const ActiveTag = ({ label, onRemove, color }) => (
    <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold animate-fade-in"
        style={{
            background: `${color}18`,
            border: `1px solid ${color}40`,
            color,
        }}
    >
        {label}
        <button
            onClick={onRemove}
            className="opacity-60 hover:opacity-100 transition-opacity leading-none"
            style={{ fontSize: 11 }}
        >✕</button>
    </span>
);

export default FilterBar;