import React from 'react';
import { ImSpinner9 } from 'react-icons/im';
import { toast } from 'react-toastify';
import { BsCheck2All } from 'react-icons/bs';

const QueueList = ({ queue, actionId, moveToFront }) => {

    const handleAnnounce = () => {
        toast.info("Announcement sent to all waiting tokens", { theme: 'colored' });
    };

    return (
        <div className="rounded-[20px] overflow-hidden bg-white/4 border border-white/8 backdrop-blur-xl">

            {/* Header */}
            <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 gap-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
                <h3 className="font-bold text-lg" style={{ fontFamily: "'serif', 'fangsong'", color: "#E8EDF5" }}>
                    Waiting Queue · {queue.length} token{queue.length !== 1 ? 's' : ''}
                </h3>
                {queue.length > 0 && (
                    <button
                        onClick={handleAnnounce}
                        className="text-xs px-3 py-1 rounded-lg cursor-pointer font-semibold"
                        style={{ background: "rgba(132,94,194,0.12)", border: "1px solid rgba(132,94,194,0.3)", color: "#845EC2", fontFamily: "'serif', 'fangsong'" }}
                    >
                        📢 Announce All
                    </button>
                )}
            </div>

            {/* Horizontally scrollable table on mobile */}
            {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-5 anim-fadeIn">
                    <div className="w-16 h-16 rounded-full bg-[#00C9A7]/5 border border-[#00C9A7]/20 flex items-center justify-center mb-4">
                        <BsCheck2All className="text-[#00C9A7] text-2xl" />
                    </div>
                    <p className="text-[15px] font-bold text-white/60 mb-1" style={{ fontFamily: "'serif', 'fangsong'" }}>All caught up!</p>
                    <p className="text-xs text-white/20" style={{ fontFamily: "'serif', 'fangsong'" }}>No tokens currently waiting in this room.</p>
                </div>
            ) : (
                <div className="overflow-x-auto custom-scrollbar">
                    <div className="min-w-125">
                        {/* Column headers */}
                        <div
                            className="grid gap-2 px-5 py-2.5 text-[11px] uppercase tracking-[1px] font-semibold"
                            style={{
                                fontFamily: "'serif', 'fangsong'",
                                gridTemplateColumns: "100px 1fr 90px 80px 110px",
                                color: "rgba(255,255,255,0.35)",
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                            }}
                        >
                            <span>Token</span>
                            <span>Name</span>
                            <span>Booked</span>
                            <span>Wait</span>
                            <span>Action</span>
                        </div>

                        {/* Rows */}
                        <div className="overflow-y-auto" style={{ maxHeight: 320, fontFamily: "'serif', 'fangsong'" }}>
                            {queue.map((q, i) => {
                                const isBusy = actionId === q._id;
                                const isNext = i === 0;
                                const bookedTime = q.bookedAt
                                    ? new Date(q.bookedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                    : '—';
                                const wait = q.estimatedWait || 0;

                                return (
                                    <div
                                        key={q._id}
                                        className={`grid items-center gap-2 px-5 py-3 anim-fadeIn transition-opacity duration-200 ${isBusy ? 'opacity-50 pointer-events-none' : ''}`}
                                        style={{
                                            gridTemplateColumns: "100px 1fr 90px 80px 110px",
                                            borderBottom: "1px solid rgba(255,255,255,0.03)",
                                            background: isNext ? "rgba(0,201,167,0.04)" : "transparent",
                                            animationDelay: `${i * 0.04}s`,
                                        }}
                                    >
                                        {/* Token number */}
                                        <span
                                            className="text-sm font-extrabold truncate"
                                            style={{ color: isNext ? "#00C9A7" : "rgba(255,255,255,0.7)" }}
                                        >
                                            {q.tokenNumber}
                                        </span>

                                        {/* Name */}
                                        <span className="text-sm font-semibold truncate" style={{ color: "#E8EDF5" }}>
                                            {q.name}
                                        </span>

                                        {/* Booked at */}
                                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                                            {bookedTime}
                                        </span>

                                        {/* Estimated wait */}
                                        <span
                                            className="text-[13px] font-bold"
                                            style={{ color: wait <= 5 ? "#00C9A7" : wait <= 15 ? "#FFC75F" : "#FF6B6B" }}
                                        >
                                            {wait > 0 ? `~${wait}m` : '—'}
                                        </span>

                                        {/* Action */}
                                        <div>
                                            {isBusy ? (
                                                <ImSpinner9 className="animate-spin h-3.5 w-3.5 text-white/40" />
                                            ) : isNext ? (
                                                <span
                                                    className="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                                                    style={{ color: "#00C9A7", background: "rgba(0,201,167,0.1)", border: "1px solid rgba(0,201,167,0.25)" }}
                                                >
                                                    NEXT
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => moveToFront(q._id, q.tokenNumber)}
                                                    className="text-[10px] px-1.75 py-0.5 rounded-md cursor-pointer font-semibold"
                                                    style={{ background: "rgba(77,168,218,0.1)", border: "1px solid rgba(77,168,218,0.25)", color: "#4DA8DA" }}
                                                >
                                                    ↑ Front
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {queue.length === 0 && (
                                <div className="text-center py-8 text-sm" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'serif', 'fangsong'" }}>
                                    No tokens in queue
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QueueList;