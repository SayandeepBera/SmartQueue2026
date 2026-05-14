import React, { useEffect, useState, useContext } from 'react';
import RevealSection from '../../Hooks/RevealSection';
import LocationCard from './LocationCard';
import PublicContext from '../../Context/Public/PublicContext';

// Statuses that mean the token is no longer "active"
const DONE_STATUSES = ["served", "skipped", "no_show"];

const ActiveTokenPanel = ({ booked, onDismiss }) => {
    const { getTokenStatus } = useContext(PublicContext);
    const [validating, setValidating] = useState(true);
    const [valid, setValid] = useState(false);
    const [liveData, setLiveData] = useState(null); // refreshed position/wait from API

    // Validate token on mount — check if it's still active and fetch live position/wait
    useEffect(() => {
        if (!booked?.tokenId) {
            // No tokenId stored → nothing to validate, dismiss immediately
            setValidating(false);
            setValid(false);
            onDismiss?.();
            return;
        }

        let cancelled = false;

        // Validation function to check token status and update live data
        const validate = async () => {
            setValidating(true);
            try {
                const result = await getTokenStatus(booked.tokenId);

                if (cancelled) return;

                if (!result.success) {
                    // Token not found in DB (deleted) → dismiss
                    setValid(false);
                    onDismiss?.();
                    return;
                }

                const status = result.token?.status;

                if (DONE_STATUSES.includes(status)) {
                    // Token was served / skipped / no-show → auto-dismiss
                    setValid(false);
                    onDismiss?.();
                    return;
                }

                // Token is still active — update live position & wait
                setLiveData({
                    position: result.token?.position ?? booked.position,
                    wait: result.token?.estimatedWait ?? booked.wait,
                    status,
                });
                setValid(true);
            } catch {
                // Network error etc. — still show the panel (don't auto-dismiss on network failure)
                setValid(true);
            } finally {
                if (!cancelled) setValidating(false);
            }
        };

        validate();

        // Re-validate every 30 s so panel disappears when token gets served elsewhere
        const interval = setInterval(validate, 30_000);
        return () => { cancelled = true; clearInterval(interval); };
    }, [booked?.tokenId]);

    // Also listen for new bookings — revalidate when a new token is broadcast
    useEffect(() => {
        const handler = () => {
            setValidating(false);
            setValid(true);
        };
        window.addEventListener("sq:tokenBooked", handler);
        return () => window.removeEventListener("sq:tokenBooked", handler);
    }, []);

    // While validating show nothing (avoids flash)
    if (validating) return null;
    if (!booked || !valid) return null;

    const org = booked.org || {};
    const position = liveData?.position ?? booked.position;
    const wait = liveData?.wait ?? booked.wait;
    const pct = Math.max(10, 100 - (position / 10) * 100);

    return (
        <RevealSection delay={0}>
            <div className="grid gap-4 mb-9" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>

                {/* ── Token card ──────────────────────────────────────── */}
                <div
                    className="rounded-[22px] p-7 relative overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg,${booked.color}14,rgba(255,255,255,0.02))`,
                        border: `1px solid ${booked.color}35`
                    }}
                >
                    {/* Ambient glow */}
                    <div
                        className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
                        style={{ background: `${booked.color}08` }}
                    />

                    {/* Header row */}
                    <div className="flex justify-between items-start mb-5">
                        <div style={{ fontFamily: "'serif', fangsong" }}>
                            <p className="text-xs tracking-[2.5px] font-bold uppercase mb-1" style={{ color: booked.color }}>
                                Your Active Token
                            </p>
                            <p className="text-base font-semibold text-white/70">{booked.bookedName}</p>
                            <p className="text-xs text-white/40 mt-0.5">
                                {org.icon} {org.orgName || org.name}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* LIVE badge */}
                            <div
                                className="rounded-lg px-3 py-1 text-[11px] font-bold flex items-center gap-1.5"
                                style={{
                                    background: `${booked.color}18`,
                                    border: `1px solid ${booked.color}50`,
                                    color: booked.color
                                }}
                            >
                                <span
                                    className="pulse-dot inline-block w-1.5 h-1.5 rounded-full"
                                    style={{ background: booked.color }}
                                />
                                LIVE
                            </div>

                            {/* Dismiss button */}
                            <button
                                onClick={onDismiss}
                                title="Dismiss token"
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 transition-colors text-sm"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >✕</button>
                        </div>
                    </div>

                    {/* Token circle + queue info */}
                    <div className="flex items-center gap-6 md:relative md:top-8">

                        {/* Orbiting token badge */}
                        <div className="relative w-22.5 h-22.5 md:w-26 md:h-26 shrink-0">
                            <svg className="orbit absolute inset-0 w-full h-full" viewBox="0 0 90 90">
                                <circle cx="45" cy="45" r="42" fill="none" stroke={`${booked.color}30`} strokeWidth="1.5" strokeDasharray="4 4" />
                                <circle cx="45" cy="3" r="5" fill={booked.color} />
                            </svg>
                            <div
                                className="absolute inset-1.5 rounded-full flex flex-col items-center justify-center"
                                style={{ background: "#0A0F1C", border: `2px solid ${booked.color}60` }}
                            >
                                <div className="text-[10px] text-white/35 tracking-wider">TOKEN</div>
                                <div
                                    className="text-[15px] font-extrabold leading-tight text-center px-1 break-all"
                                    style={{ fontFamily: "'Space Grotesk',sans-serif", color: booked.color }}
                                >
                                    {booked.token}
                                </div>
                            </div>
                        </div>

                        {/* Queue details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-1.75 text-sm" style={{ fontFamily: "'serif', fangsong" }}>
                                <span className="text-white/40">Ahead of you</span>
                                <span className="font-bold">{position} tokens</span>
                            </div>

                            {/* Progress bar */}
                            <div className="rounded-md h-1.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                                <div
                                    className="fill-bar h-full rounded-md"
                                    style={{ "--w": `${pct}%`, background: `linear-gradient(90deg,${booked.color},#4DA8DA)` }}
                                />
                            </div>

                            {/* Meta row */}
                            <div className="mt-3 flex gap-3.5 flex-wrap">
                                {[
                                    ["Est. Wait", `${wait} min`],
                                    ["Counter", booked.counter],
                                    ["Booked for", booked.bookedName],
                                ].map(([k, val]) => (
                                    <div key={k} style={{ fontFamily: "'serif', fangsong" }}>
                                        <div className="text-xs text-white/35 mb-0.5">{k}</div>
                                        <div
                                            className="font-bold text-sm"
                                            style={k === "Booked for" ? { color: booked.color } : {}}
                                        >
                                            {val}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Location card ────────────────────────────────────── */}
                <LocationCard org={org} booked={booked} />
            </div>
        </RevealSection>
    );
};

export default ActiveTokenPanel;