import React from 'react';
import AccordionItem from './AccordionItem';

const FAQ = ({ FAQS, faqRef, expandedCat, setExpandedCat, toggleFaq, openFaqs }) => {
    return (
        <div
            ref={faqRef}
            className="flex flex-col gap-5"
            style={{ animation: "fadeUp .4s both" }}
        >
            {FAQS.map((cat, catIdx) => (
                <div
                    key={cat.category}
                    className="glass rounded-2xl overflow-hidden"
                    style={{
                        borderColor: `${cat.color}15`,
                        animation: `fadeUp .5s ${catIdx * 0.1}s both`,
                    }}
                >
                    {/* Category header */}
                    <button
                        onClick={() => setExpandedCat(expandedCat === catIdx ? null : catIdx)}
                        style={{
                            width: "100%", display: "flex", alignItems: "center",
                            justifyContent: "space-between", padding: "18px 20px",
                            background: "transparent", border: "none",
                            borderBottom: expandedCat === catIdx ? "1px solid rgba(255,255,255,0.06)" : "none",
                            cursor: "pointer", fontFamily: "inherit",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                                background: `${cat.color}12`, border: `1px solid ${cat.color}25`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 18,
                            }}>{cat.icon}</div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.9)" }}>
                                    {cat.category}
                                </div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2, textAlign: "left" }}>
                                    {cat.items.length} questions
                                </div>
                            </div>
                        </div>
                        <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: expandedCat === catIdx ? `${cat.color}15` : "rgba(255,255,255,0.05)",
                            border: `1px solid ${expandedCat === catIdx ? cat.color + "40" : "rgba(255,255,255,0.08)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 14, fontWeight: 800,
                            color: expandedCat === catIdx ? cat.color : "rgba(255,255,255,0.3)",
                            transition: "all .25s",
                            transform: expandedCat === catIdx ? "rotate(180deg)" : "rotate(0deg)",
                        }}>
                            ↓
                        </div>
                    </button>

                    {/* Items */}
                    <div style={{
                        maxHeight: expandedCat === catIdx ? 9999 : 0,
                        overflow: "hidden",
                        transition: "max-height .4s ease",
                    }}>
                        {cat.items.map((item, itemIdx) => (
                            <AccordionItem
                                key={itemIdx}
                                item={item}
                                idx={itemIdx}
                                isOpen={!!openFaqs[`${catIdx}-${itemIdx}`]}
                                onToggle={() => toggleFaq(catIdx, itemIdx)}
                                accentColor={cat.color}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default FAQ
