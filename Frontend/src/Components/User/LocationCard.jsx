import React from 'react';

const LocationCard = ({ org, booked }) => {
    if (!org) return null;

    // Normalise name: populated docs use orgName; map-shaped docs use name
    const displayName = org.orgName || org.name || "Organization";
    const displayAddress = org.address || "Address not available";
    const displayIcon = org.icon || "🏢";
    const displayColor = org.color || "#00C9A7";
    const lat = org.lat ?? null;
    const lng = org.lng ?? null;

    return (
        <div className="glass rounded-[22px] p-6">
            <p
                className="text-sm tracking-[2px] text-white/30 uppercase mb-4 font-semibold"
                style={{ fontFamily: "'serif', fangsong" }}
            >
                Location Details
            </p>

            <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
                {/* Org name + address */}
                <div className="flex gap-3 items-start">
                    <div
                        className="w-10.5 h-10.5 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style={{
                            background: `${displayColor}18`,
                            border: `1px solid ${displayColor}30`
                        }}
                    >
                        {displayIcon}
                    </div>
                    <div style={{ fontFamily: "'serif', fangsong" }}>
                        <div className="font-bold text-base mb-0.5">{displayName}</div>
                        <div className="text-[13px] text-white/45">📍 {displayAddress}</div>
                    </div>
                </div>

                {/* Room / Counter and Directions — only shown when available */}
                {[
                    ["ROOM / COUNTER", booked?.room],
                    ["DIRECTIONS", booked?.dir],
                ].map(([k, val]) => val ? (
                    <div
                        key={k}
                        className="px-3.5 py-2.5 rounded-xl"
                        style={{
                            fontFamily: "'serif', fangsong",
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)"
                        }}
                    >
                        <div className="text-xs text-white/35 mb-1 tracking-wider">{k}</div>
                        <div className="text-[13px] text-white/65 leading-[1.55]">{val}</div>
                    </div>
                ) : null)}

                {/* Open in Maps — only when we have coordinates */}
                {lat !== null && lng !== null ? (
                    <a
                        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=17`}
                        target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-semibold no-underline transition-all duration-200"
                        style={{
                            fontFamily: "'serif', fangsong",
                            background: "rgba(0,201,167,0.1)",
                            border: "1px solid rgba(0,201,167,0.25)",
                            color: "#00C9A7"
                        }}
                    >
                        🗺️ Open in Maps ↗
                    </a>
                ) : (
                    <div
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm text-white/25"
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)"
                        }}
                    >
                        📍 Location coordinates not available
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationCard;