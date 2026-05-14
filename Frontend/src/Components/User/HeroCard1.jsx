import React from 'react'

const HeroCard1 = ({ currentService, card1Visible, featuredServices, serviceIdx, occupancyPct, occupancyColor, cardTransition }) => {

    return (
        <div
            className="absolute top-0 right-0 w-64 p-6 glass rounded-3xl border-white/10 animate-float"
            style={{ animationDelay: '0s', boxShadow: `0 20px 40px -15px ${currentService?.color || '#00C9A7'}30` }}
        >
            {/* Background Ambient Glow that matches service color */}
            <div
                className="absolute -top-10 -right-10 w-32 h-32 blur-[50px] rounded-full transition-colors duration-1000 -z-10"
                style={{ background: `${currentService?.color || '#00C9A7'}15` }}
            />
            <div style={cardTransition(card1Visible)}>
                {currentService ? (
                    <>
                        <div className="flex justify-between items-start mb-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                style={{
                                    background: `linear-gradient(135deg, ${currentService.color}30, ${currentService.color}10)`,
                                    border: `1px solid ${currentService.color}40`
                                }}
                            >
                                {currentService.icon}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span
                                    className="text-[10px] font-black uppercase tracking-widest"
                                    style={{ color: currentService.color }}
                                >
                                    Active
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-white/30 font-bold uppercase mb-1 truncate">
                            {currentService.orgShort} · {currentService.city}
                        </p>
                        <p className="text-xl font-bold text-white mb-1 truncate">
                            {currentService.name}
                        </p>
                        <p className="text-[11px] text-white/30 mb-3">
                            Counter {currentService.counter} · ~{currentService.avgWait} min avg
                        </p>
                        {/* Occupancy bar */}
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ 
                                        width: `${occupancyPct}%`, 
                                        background: `linear-gradient(90deg, ${occupancyColor}aa, ${occupancyColor})`,
                                        boxShadow: `0 0 10px ${occupancyColor}40`
                                    }}
                                />
                            </div>
                            <span className="text-[10px] font-mono" style={{ color: occupancyColor }}>
                                {currentService.currentQueue}/{currentService.maxQueueSize}
                            </span>
                        </div>
                        {/* Dots indicator */}
                        {featuredServices.length > 1 && (
                            <div className="flex gap-1 mt-3 justify-center">
                                {featuredServices.slice(0, Math.min(featuredServices.length, 6)).map((_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-full transition-all duration-300"
                                        style={{
                                            width: i === serviceIdx % Math.min(featuredServices.length, 6) ? 16 : 5,
                                            height: 5,
                                            background: i === serviceIdx % Math.min(featuredServices.length, 6)
                                                ? currentService.color
                                                : "rgba(255,255,255,0.15)",
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    /* Skeleton while loading */
                    <>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
                            <div className="w-12 h-4 rounded bg-white/5 animate-pulse" />
                        </div>
                        <div className="h-3 w-20 rounded bg-white/5 animate-pulse mb-2" />
                        <div className="h-5 w-36 rounded bg-white/5 animate-pulse mb-3" />
                        <div className="h-1.5 w-full rounded-full bg-white/5 animate-pulse" />
                    </>
                )}
            </div>
        </div>
    )
}

export default HeroCard1
