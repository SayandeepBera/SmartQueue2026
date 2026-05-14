import React from 'react'

const Badge = ({ status }) => {
    const map = {
        approved: {
            bg: "rgba(52,211,153,0.12)",
            border: "rgba(52,211,153,0.3)",
            color: "#34d399",
            label: "Approved"
        },
        pending: {
            bg: "rgba(251,191,36,0.12)",
            border: "rgba(251,191,36,0.35)",
            color: "#fbbf24",
            label: "Pending"
        },
        rejected: {
            bg: "rgba(244,63,94,0.12)",
            border: "rgba(244,63,94,0.3)",
            color: "#f43f5e",
            label: "Rejected"
        },
        suspended: {
            bg: "rgba(167,139,250,0.12)",
            border: "rgba(167,139,250,0.3)",
            color: "#a78bfa",
            label: "Suspended"
        },
        scheduled_for_deletion: {
            bg: "rgba(148,163,184,0.1)",
            border: "rgba(148,163,184,0.25)",
            color: "#94a3b8",
            label: "Scheduled for deletion"
        }
    };

    const s = map[status] || {
        bg: "rgba(255,255,255,0.05)",
        border: "rgba(255,255,255,0.1)",
        color: "#64748b",
        label: status || "Unknown"
    };

    return (
        <span className="text-[11px] font-bold tracking-wide px-2 py-0.5 rounded-full" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
            {s.label}
        </span>
    );
}

export default Badge;
