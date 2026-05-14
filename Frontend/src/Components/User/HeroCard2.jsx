import React from 'react'

// Status colors for dynamic styling (e.g., in StatsRow or ActiveTokenPanel)
const STATUS_COLORS = {
    next: "#22d3ee",
    serving: "#00C9A7",
    waiting: "#a78bfa",
};

const HeroCard2 = ({ card2Visible, authToken, activeTokens, currentToken, cardTransition, tokenIdx }) => {
    
    return (
        <div
            className="absolute bottom-10 left-0 w-56 p-6 glass rounded-3xl border-white/10 animate-float"
            style={{ animationDelay: '1.5s' }}
        >
            <div style={cardTransition(card2Visible)}>
                {!authToken ? (
                    /* Guest state */
                    <>
                        <p className="text-[10px] text-white/30 font-bold uppercase mb-3 tracking-tighter">
                            Your Token
                        </p>
                        <div className="text-3xl mb-2">🔒</div>
                        <p className="text-[13px] text-white/50 font-semibold mb-1">Sign in to track</p>
                        <p className="text-[11px] text-white/25 leading-snug">
                            Book tokens and see your live position here
                        </p>
                    </>
                ) : activeTokens.length === 0 ? (
                    /* Logged in but no active tokens */
                    <>
                        <p className="text-[10px] text-white/30 font-bold uppercase mb-3 tracking-tighter">
                            Your Token
                        </p>
                        <div className="text-3xl mb-2">🎟️</div>
                        <p className="text-[13px] text-white/50 font-semibold mb-1">No active tokens</p>
                        <p className="text-[11px] text-white/25 leading-snug">
                            Book a service below to see your position here
                        </p>
                    </>
                ) : currentToken ? (
                    /* Active token data */
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">
                                Your Position
                            </p>
                            {activeTokens.length > 1 && (
                                <span className="text-[10px] text-white/25 font-mono">
                                    {tokenIdx + 1}/{activeTokens.length}
                                </span>
                            )}
                        </div>

                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-5xl font-light text-white">
                                {String(currentToken.position).padStart(2, '0')}
                            </span>
                            <div className="mb-2">
                                <span
                                    className="text-sm font-bold"
                                    style={{ color: STATUS_COLORS[currentToken.status] || "#a78bfa" }}
                                >
                                    {currentToken.status === "next"
                                        ? "You're next!"
                                        : currentToken.status === "serving"
                                            ? "Being served"
                                            : `in queue`}
                                </span>
                            </div>
                        </div>

                        <p className="text-[12px] text-white/40 font-medium truncate mb-1">
                            {currentToken.serviceIcon} {currentToken.serviceName}
                        </p>
                        <p className="text-[11px] font-mono font-bold" style={{ color: STATUS_COLORS[currentToken.status] || "#a78bfa" }}>
                            {currentToken.tokenNumber}
                            {currentToken.status === "waiting" && currentToken.estimatedWait > 0
                                ? ` · ~${currentToken.estimatedWait} min`
                                : ""}
                        </p>

                        {/* Multi-token dots */}
                        {activeTokens.length > 1 && (
                            <div className="flex gap-1 mt-3">
                                {activeTokens.map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-1 rounded-full transition-all duration-300"
                                        style={{
                                            width: i === tokenIdx ? 16 : 5,
                                            background: i === tokenIdx
                                                ? (STATUS_COLORS[currentToken.status] || "#a78bfa")
                                                : "rgba(255,255,255,0.15)",
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : null}
            </div>
        </div>
    )
}

export default HeroCard2
