import React, { useEffect, useRef } from 'react';

const LeafletMap = ({ orgs, center, active, setActive }) => {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef({}); 
    const activeRef = useRef(active);

    // Keep activeRef in sync for the event listener closure
    useEffect(() => { activeRef.current = active; }, [active]);

    // ── Helper: validate a color string ───────────────────────────────
    const isValidColor = (color) => /^#[0-9A-Fa-f]{6}$/.test(color);

    // ── Helper: build a DivIcon for an org ───────────────────────────────
    const buildIcon = (L, org, isActive) => {
        const color = isValidColor(org.color) ? org.color : '#00C9A7'; // fallback color

        const html = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                cursor: pointer;
            ">
                ${isActive ? `
                <div style="
                    position: absolute;
                    bottom: 12px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 2px solid ${color};
                    animation: pingRing 1.5s ease-out infinite;
                    pointer-events: none;
                "></div>` : ''}
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 10px;
                    border-radius: 12px;
                    border: 2px solid ${color};
                    background: ${isActive ? color : '#0D1321'};
                    box-shadow: 0 4px 16px ${color}60;
                    transform: ${isActive ? 'scale(1.15) translateY(-5px)' : 'scale(1)'};
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                ">
                    <span style="font-size:14px;">${org.icon}</span>
                    <span style="font-size:11px; font-weight:800; color:${isActive ? '#000' : '#E8EDF5'};">
                        ${org.short}
                    </span>
                </div>
                <div style="
                    width: 4px;
                    height: 10px;
                    background: ${color};
                    box-shadow: 0 0 8px ${color};
                    border-radius: 2px;
                    margin-top: -2px;
                "></div>
            </div>
        `;

        return L.divIcon({
            html,
            className: 'custom-sq-pin',
            iconSize: [0, 0], // Size is handled by internal HTML
            iconAnchor: [0, 10], // Points the bottom of the pin to the lat/lng
        });
    };

    // ── Bootstrap Leaflet ────────────────────────────────────────────
    useEffect(() => {
        if (!containerRef.current) return;

        // Solution for "Map container already initialized"
        if (mapRef.current) return;

        let L;

        const init = async () => {
            const Leaflet = await import('leaflet');
            L = Leaflet.default;
            
            // Critical: Check again if map was created while we were importing
            if (mapRef.current || !containerRef.current) return;

            const map = L.map(containerRef.current, {
                center: [center.lat, center.lng],
                zoom: 13,
                zoomControl: false, // Cleaner UI
                attributionControl: false,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

            mapRef.current = map;

            // Initial Marker Render
            orgs.forEach(org => {
                const marker = L.marker([org.lat, org.lng], { 
                    icon: buildIcon(L, org, activeRef.current === org.id) 
                })
                .addTo(map)
                .on('click', () => {
                    setActive(org.id === activeRef.current ? null : org.id);
                });
                markersRef.current[org.id] = marker;
            });
        };

        init();

        return () => {
            if (mapRef.current) {
                mapRef.current.off();
                mapRef.current.remove();
                mapRef.current = null;
                markersRef.current = {};
            }
        };
    }, []); // Empty dependency array ensures one-time bootstrap

    // ── Sync Marker States (Active/Orgs) ──────────────────────────────────
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        import('leaflet').then(({ default: L }) => {
            const currentIds = new Set(orgs.map(o => o.id));

            // Remove stale
            Object.keys(markersRef.current).forEach(id => {
                if (!currentIds.has(id)) {
                    markersRef.current[id].remove();
                    delete markersRef.current[id];
                }
            });

            // Update/Add
            orgs.forEach(org => {
                const isActive = active === org.id;
                let marker = markersRef.current[org.id];

                if (!marker) {
                    marker = L.marker([org.lat, org.lng])
                        .addTo(map)
                        .on('click', () => {
                            setActive(org.id === activeRef.current ? null : org.id);
                        });
                    markersRef.current[org.id] = marker;
                }

                marker.setIcon(buildIcon(L, org, isActive));
                
                if (isActive) {
                    marker.setZIndexOffset(1000);
                    map.panTo([org.lat, org.lng], { animate: true, duration: 1 });
                } else {
                    marker.setZIndexOffset(0);
                }
            });
        });
    }, [orgs, active, center.lat, center.lng]);

    return (
        <div className="w-full h-full relative overflow-hidden" style={{ minHeight: 400 }}>
            {/* Dark Filter Layer */}
            <div 
                ref={containerRef} 
                className="absolute inset-0 z-0" 
                style={{ 
                    filter: "invert(0.9) hue-rotate(180deg) brightness(0.82) saturate(0.85)",
                    background: "#0D1321" 
                }}
            />
            
            {/* Custom CSS for the ping animation */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes pingRing {
                    0% { transform: translateX(-50%) scale(0.5); opacity: 1; }
                    100% { transform: translateX(-50%) scale(1.5); opacity: 0; }
                }
                .leaflet-container { background: #0D1321 !important; outline: none; }
            `}} />
        </div>
    );
};

export default LeafletMap;