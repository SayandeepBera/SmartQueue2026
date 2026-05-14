import React from 'react'

const AccordionItem = ({ item, idx, isOpen, onToggle, accentColor }) => {
    return (
        <div
            className="border-b border-white/5 last:border-0"
            style={{ animation: `fadeUp .4s ${idx * 0.06 + 0.1}s both` }}
        >
            <button
                onClick={onToggle}
                className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left group"
                style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
                <span
                    className="text-[15px] font-semibold leading-snug transition-colors duration-200"
                    style={{ color: isOpen ? accentColor : "rgba(255,255,255,0.8)" }}
                >
                    {item.q}
                </span>
                <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                    style={{
                        background: isOpen ? accentColor + "20" : "rgba(255,255,255,0.05)",
                        color: isOpen ? accentColor : "rgba(255,255,255,0.3)",
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                        border: `1px solid ${isOpen ? accentColor + "40" : "rgba(255,255,255,0.08)"}`,
                    }}
                >
                    +
                </span>
            </button>
            <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isOpen ? 300 : 0, opacity: isOpen ? 1 : 0 }}
            >
                <p className="px-5 pb-5 text-[14px] text-white/55 leading-relaxed text-left">
                    {item.a}
                </p>
            </div>
        </div>
    )
}

export default AccordionItem
