import React from 'react';
import ContactForm from './ContactForm';

const ContactTab = ({ formRef }) => {
    return (
        <div
            ref={formRef}
            style={{ animation: "fadeUp .4s both" }}
        >
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
                <div className="glass rounded-2xl p-6"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 16, marginBottom: 8,
                    }}
                >
                    {[
                        { icon: "⚡", label: "Average Response", value: "< 4 hours", color: "#00C9A7" },
                        { icon: "📅", label: "Support Hours", value: "Mon–Sat, 9–6", color: "#a78bfa" },
                        { icon: "🌐", label: "Languages", value: "EN, HI, BN", color: "#fbbf24" },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            style={{
                                padding: "16px", borderRadius: 14, textAlign: "center",
                                background: `${stat.color}08`,
                                border: `1px solid ${stat.color}18`,
                                animation: `fadeUp .4s ${i * 0.1}s both`,
                            }}
                        >
                            <div style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</div>
                            <div style={{ fontSize: 18, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="glass rounded-2xl p-6">
                    <ContactForm />
                </div>
            </div>
        </div>
    )
}

export default ContactTab
