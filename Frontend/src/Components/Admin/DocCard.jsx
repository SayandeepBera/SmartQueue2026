import React, { useState } from 'react'

/* ---- document preview card ---- */
const DocCard = ({ label, doc, required }) => {
    const [enlarged, setEnlarged] = useState(false);

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] sm:text-[11px] text-white/45 font-semibold uppercase tracking-wider">{label}</span>
                {required && !doc && (
                    <span className="text-[8px] font-bold text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded-md border border-rose-400/10">
                        Required
                    </span>
                )}
            </div>

            {doc ? (
                <>
                    {/* Thumbnail Container */}
                    <div
                        onClick={() => setEnlarged(true)}
                        className="relative group cursor-zoom-in rounded-2xl overflow-hidden border border-white/10 bg-white/5 transition-all hover:border-teal-500/30 shadow-lg"
                        style={{ height: 100 }}
                    >
                        <img
                            src={doc.url}
                            alt={label}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Glass Overlay on Hover */}
                        <div className="absolute inset-0 bg-[#0F172A]/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-300 flex items-center justify-center">
                            <div className="text-white text-[11px] font-bold bg-teal-400 rounded-full py-1.5 px-3 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                🔍 View Document
                            </div>
                        </div>
                    </div>

                    {/* Lightbox - Premium Glassmorphism UI */}
                    {enlarged && (
                        <div
                            className="fixed inset-0 flex items-center justify-center z-10001 p-4 sm:p-8 md:p-12"
                            style={{ 
                                backgroundColor: "rgba(15, 23, 42, 0.9)", // Matches your UI Theme #0F172A
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)"
                            }}
                            onClick={() => setEnlarged(false)}
                        >
                            {/* Close Button Top Right */}
                            <button
                                onClick={() => setEnlarged(false)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-50 shadow-2xl"
                            >
                                ✕ 
                            </button>

                            <div 
                                className="relative w-full h-full max-w-6xl flex flex-col items-center justify-center gap-4"
                                onClick={e => e.stopPropagation()}
                            >
                                {/* The Image - Optimized to fill screen but maintain aspect ratio */}
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img
                                        src={doc.url}
                                        alt={label}
                                        className="max-w-full max-h-full object-contain rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10"
                                        style={{ 
                                            animation: "modalIn .4s cubic-bezier(0.16, 1, 0.3, 1) both"
                                        }}
                                    />
                                </div>

                                {/* Bottom Info Bar */}
                                <div className="bg-white/5 border border-white/10 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-6 animate-pulse-slow">
                                    <div className="flex flex-col">
                                        <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Document Type</span>
                                        <span className="text-white text-sm font-medium">{label}</span>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-teal-400 hover:text-teal-300 text-sm font-bold flex items-center gap-2 transition-colors"
                                    >
                                        <span>Download</span>
                                        <span className="text-xs">↗</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div
                    className="rounded-2xl border-2 border-dashed border-white/5 bg-white/2 flex flex-col items-center justify-center gap-2"
                    style={{ height: 100 }}
                >
                    <span className="text-[20px] opacity-20">📂</span>
                    <span className="text-white/20 text-[10px] font-medium uppercase tracking-tighter">No File Uploaded</span>
                </div>
            )}
        </div>
    );
}

export default DocCard;