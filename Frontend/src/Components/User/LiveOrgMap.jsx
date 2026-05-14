import React, { useState, useEffect, useContext } from 'react';
import RevealSection from '../../Hooks/RevealSection';
import OrgDetailCard from './OrgDetailCard';
import OrgListItem from './OrgListItem';
import OrgContext from '../../Context/Organization/OrgContext';
import LeafletMap from './LeafletMap';

// Default map center (Kolkata — adjust to your city or derive from user location)
const DEFAULT_CENTER = { lat: 22.555, lng: 88.385 };

const LiveOrgMap = ({ onBookOrg }) => {
    const { getMapOrgs } = useContext(OrgContext);

    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [active, setActive] = useState(null);
    
    // Compute map center from loaded orgs (average of all geocoded pins),
    // or fall back to the default centre.
    const center = orgs.length
        ? {
            lat: orgs.reduce((s, o) => s + o.lat, 0) / orgs.length,
            lng: orgs.reduce((s, o) => s + o.lng, 0) / orgs.length,
        }
        : DEFAULT_CENTER;

    useEffect(() => {
        let cancelled = false;

        const fetchOrgs = async () => {
            setLoading(true);
            setError(null);
            const result = await getMapOrgs();
            if (cancelled) return;

            if (result.success) {
                setOrgs(result.orgs || []);
            } else {
                setError(result.error);
            }
            setLoading(false);
        };

        fetchOrgs();
        return () => { cancelled = true; };
    }, []);

    const sel = orgs.find(o => o.id === active);

    return (
        <RevealSection delay={0.05}>
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
            />

            <div className="mb-14">
                {/* Header */}
                {/* --- Enhanced Live Map Header --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                    <div className="relative">
                        {/* Decorative Badge */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C9A7] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C9A7]"></span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#00C9A7]">
                                Real-Time Network
                            </span>
                        </div>

                        <h2 className="font-bold text-4xl md:text-5xl tracking-tight text-white"
                            style={{ fontFamily: "'serif', fangsong" }}>
                            Explore <span className="text-white/40">Local Services</span>
                        </h2>

                        {/* Dynamic Map Info Bar */}
                        <div className="flex items-center gap-4 mt-4">
                            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                                <span className="text-xs font-medium text-white/60">
                                    <span className="text-white font-bold">{orgs.length}</span> Active Locations
                                </span>
                            </div>
                            <div className="h-1 w-1 rounded-full bg-white/20" />
                            <p className="text-sm text-white/30 italic">Tap pins to view live wait times</p>
                        </div>
                    </div>

                    {/* Professional Full Map Link */}
                    <div className="flex items-center gap-3">
                        <a
                            href={`https://www.openstreetmap.org/#map=13/${center.lat}/${center.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center gap-2.5 px-5 py-2.5 rounded-2xl transition-all duration-300"
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                color: "#E8EDF5"
                            }}
                        >
                            <span className="text-sm font-bold tracking-wide group-hover:text-[#00C9A7] transition-colors">
                                Launch Full Map
                            </span>
                            <span className="text-lg group-hover:rotate-45 transition-transform duration-300">↗</span>
                        </a>
                    </div>
                </div>

                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
                    <div
                        className="glass rounded-[20px] overflow-hidden relative"
                        style={{ minHeight: 400, gridColumn: "1 / -1" }}
                    >
                        {/* Loading state */}
                        {loading && (
                            <div
                                className="flex flex-col items-center justify-center gap-3"
                                style={{ minHeight: 400, background: "#0D1321" }}
                            >
                                <div className="text-4xl animate-pulse">🗺️</div>
                                <div className="text-[13px] text-white/40">Fetching organizations…</div>
                            </div>
                        )}

                        {/* Error state */}
                        {!loading && error && (
                            <div
                                className="flex flex-col items-center justify-center gap-3"
                                style={{ minHeight: 400, background: "#0D1321" }}
                            >
                                <div className="text-4xl">⚠️</div>
                                <div className="text-[13px] text-white/40">{error}</div>
                            </div>
                        )}

                        {/* Map grid */}
                        {!loading && !error && (
                            <div
                                className="map-inner-grid"
                                style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 0, minHeight: 400 }}
                            >
                                <LeafletMap
                                    orgs={orgs}
                                    center={center}
                                    active={active}
                                    setActive={setActive}
                                />

                                {/* Sidebar */}
                                <div
                                    className="custom-scrollbar border-l border-white/6 flex flex-col gap-2.5 p-6 overflow-y-auto"
                                    style={{ maxHeight: 400 }}
                                >
                                    {orgs.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full gap-2 text-white/30">
                                            <div className="text-3xl">🏢</div>
                                            <p className="text-xs text-center">No organizations found in this area yet.</p>
                                        </div>
                                    )}

                                    {sel && (
                                        <OrgDetailCard sel={sel} setActive={setActive} onBookOrg={onBookOrg} />
                                    )}

                                    {orgs.map(org => (
                                        <OrgListItem key={org.id} org={org} active={active} setActive={setActive} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RevealSection>
    );
};

export default LiveOrgMap;