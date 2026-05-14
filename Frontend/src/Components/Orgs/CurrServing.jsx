import React from 'react';
import { ImSpinner9 } from 'react-icons/im';
import { HiOutlineUserGroup, HiOutlineRefresh } from 'react-icons/hi';

const CurrServing = ({ serving, service, actionId, queueLength = 0, markDone, skipToken, noShow }) => {
    const isBusy = actionId === serving?._id;

    // Skip only makes sense when there is another token to promote
    const canSkip = queueLength > 1;

    // Format booked time
    const bookedTime = serving?.bookedAt
        ? new Date(serving.bookedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : null;

    return (
        <div
            className="rounded-[20px] p-6 relative overflow-hidden transition-all duration-500"
            style={{
                background: serving
                    ? "linear-gradient(135deg, rgba(0,201,167,0.08), rgba(77,168,218,0.05))"
                    : "rgba(255, 255, 255, 0.02)",
                border: serving
                    ? "1px solid rgba(0,201,167,0.2)"
                    : "1px solid rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                fontFamily: "'serif', 'fangsong'",
            }}
        >
            {/* Glow blob */}
            <div className="absolute -top-7.5 -right-7.5 w-35 h-35 rounded-full pointer-events-none" style={{ background: "rgba(0,201,167,0.07)" }} />

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <p className="text-[10px] tracking-[2px] uppercase font-black mb-1" style={{ color: serving ? "#00C9A7" : "rgba(255,255,255,0.3)" }}>
                        {serving ? "Now Serving" : "System Standby"} — Counter {service?.counter || '—'}
                    </p>
                    <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                        {service?.name || 'Select a service'}
                    </p>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-colors"
                    style={{
                        background: serving ? "rgba(0,201,167,0.1)" : "rgba(255,255,255,0.05)",
                        border: serving ? "1px solid rgba(0,201,167,0.2)" : "1px solid rgba(255,255,255,0.1)",
                        color: serving ? "#00C9A7" : "rgba(255,255,255,0.4)"
                    }}>
                    <div className={`w-1.5 h-1.5 rounded-full ${serving ? 'bg-[#00C9A7] animate-pulse' : 'bg-white/20'}`} />
                    {serving ? "LIVE" : "IDLE"}
                </div>
            </div>

            {/* Serving card */}
            {serving ? (
                <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-5 transition-opacity duration-200 ${isBusy ? 'opacity-60 pointer-events-none' : ''}`}>

                    {/* Spinning token ring */}
                    <div className="relative w-24 h-24 shrink-0">
                        <svg className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite]" viewBox="0 0 90 90">
                            <circle cx="45" cy="45" r="42" fill="none" stroke="url(#grad1)" strokeWidth="2" strokeDasharray="5 15" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{ stopColor: "#00C9A7", stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: "#4DA8DA", stopOpacity: 1 }} />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-2 rounded-full flex flex-col items-center justify-center bg-[#0F172A] border border-white/10 shadow-inner">
                            <div className="text-[9px] tracking-[1px] text-white/30 font-bold">TOKEN</div>
                            <div className="text-sm font-black text-[#00C9A7]">{serving.tokenNumber}</div>
                        </div>
                    </div>

                    {/* Details + actions */}
                    <div className="flex-1 text-center sm:text-left">
                        <div className="text-[18px] font-bold mb-1" style={{ color: "#E8EDF5" }}>{serving.name}</div>
                        <div className="text-[12px] mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {serving.phone ? `${serving.phone} · ` : ''}
                            {bookedTime ? `Booked ${bookedTime}` : ''}
                            {serving.estimatedWait > 0 ? ` · ~${serving.estimatedWait} min wait` : ''}
                        </div>

                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                            <button
                                onClick={markDone}
                                disabled={isBusy}
                                className="px-4 py-2 rounded-[10px] border-none text-black text-[13px] font-bold cursor-pointer transition-all hover:brightness-110 disabled:opacity-60 flex items-center gap-1.5"
                                style={{ background: "linear-gradient(135deg,#00C9A7,#00C9A7CC)", fontFamily: "inherit" }}
                            >
                                {isBusy ? <ImSpinner9 className="animate-spin h-3.5 w-3.5" /> : '✅ Mark Done'}
                            </button>

                            {canSkip && (
                                <button
                                    onClick={skipToken}
                                    disabled={isBusy}
                                    className="px-4 py-2 rounded-[10px] text-[13px] font-bold cursor-pointer transition-all disabled:opacity-60 flex items-center gap-1.5"
                                    style={{ background: "rgba(255,199,95,0.12)", border: "1px solid rgba(255,199,95,0.3)", color: "#FFC75F", fontFamily: "inherit" }}
                                >
                                    {isBusy ? <ImSpinner9 className="animate-spin h-3.5 w-3.5" /> : '⏭️ Skip'} 
                                </button>
                            )}

                            <button
                                onClick={noShow}
                                disabled={isBusy}
                                className="px-4 py-2 rounded-[10px] text-[13px] font-bold cursor-pointer transition-all disabled:opacity-60"
                                style={{ background: "rgba(249,97,103,0.12)", border: "1px solid rgba(249,97,103,0.3)", color: "#F96167", fontFamily: "inherit" }}
                            >
                                {isBusy ? <ImSpinner9 className="animate-spin h-3.5 w-3.5" /> : '🚫 No Show'} 
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 anim-fadeUp">
                    <div className="relative mb-6">
                        {/* Animated background rings */}
                        <div className="absolute inset-0 scale-150 bg-[#00C9A7]/5 blur-3xl rounded-full" />
                        <div className="relative w-20 h-20 rounded-[26px] bg-white/3 border border-white/10 flex items-center justify-center group-hover:border-[#00C9A7]/30 transition-all duration-500">
                            <HiOutlineUserGroup className="text-4xl text-white/10 animate-pulse" />
                        </div>

                        {/* Orbiting dots decoration */}
                        <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
                            <div className="h-2 w-2 rounded-full bg-[#00C9A7]/40 absolute -top-1 left-1/2" />
                        </div>
                    </div>

                    <div className="text-center max-w-xs">
                        <h3 className="text-lg font-bold text-white/80 mb-2">Queue is Clear</h3>
                        <p className="text-xs text-white/30 leading-relaxed mb-6">
                            All tokens have been served. Take a moment to breathe or prepare for the next arrival.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrServing;