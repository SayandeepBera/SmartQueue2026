import React from 'react';
import { motion } from 'framer-motion';
import { MdOutlinePeopleAlt } from 'react-icons/md';

const OPDQueue = ({ queue }) => {
    return (
        <div className="rounded-[20px] p-4.5 flex-1 bg-white/4 border border-white/8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3.5">
                <h3 className="font-bold text-[17px]" style={{ fontFamily: "'serif', 'fangsong'", color: "#E8EDF5" }}>OPD Queue</h3>
                <div className="flex items-center gap-1.5" style={{ fontFamily: "'serif', 'fangsong'" }}>
                    <div className="w-1.75 h-1.75 rounded-full anim-pulse-dot" style={{ background: "#00C9A7" }} />
                    <span className="text-[11px] font-semibold" style={{ color: "#00C9A7" }}>LIVE</span>
                </div>
            </div>
            <div className="flex flex-col gap-2" style={{ fontFamily: "'serif', 'fangsong'" }}>
                {queue.length > 0 ? (
                    queue.slice(0, 4).map((q, i) => {
                        const isNext = q.status === "next";

                        return (
                            <div
                                key={q._id || i}
                                className="flex items-center gap-2.5 px-3 py-2.25 rounded-[10px] anim-tokenIn"
                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", animationDelay: `${i * 0.07}s` }}
                            >
                                <div className="text-[13px] font-extrabold w-15" style={{ fontFamily: "'serif', 'fangsong'", color: isNext ? "#00C9A7" : "rgba(255,255,255,0.5)" }}>{q.tokenNumber}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-semibold truncate" style={{ color: "#E8EDF5" }}>{q.name || "Walk-in"}</div>
                                    <div className="text-[11px] mt-px" style={{ color: "rgba(255,255,255,0.35)" }}>~{q.estimatedWait ?? "—"} min</div>
                                </div>
                                {isNext && (
                                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0" style={{ color: "#00C9A7", background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.3)" }}>NEXT</span>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center opacity-25"
                    >
                        <MdOutlinePeopleAlt size={32} className="mb-2" />
                        <p className="text-[12px] italic">Queue is currently empty</p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default OPDQueue
