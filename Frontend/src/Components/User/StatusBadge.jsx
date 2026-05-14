import React from 'react'

const StatusBadge = ({ status }) => {
    const map = {
        waiting: { label: "Waiting", bg: "rgba(255,199,95,0.12)", border: "rgba(255,199,95,0.3)", color: "#FFC75F" },
        next: { label: "Up Next", bg: "rgba(0,201,167,0.15)", border: "rgba(0,201,167,0.4)", color: "#00C9A7" },
        serving: { label: "Serving", bg: "rgba(77,168,218,0.15)", border: "rgba(77,168,218,0.4)", color: "#4DA8DA" },
        served: { label: "Served", bg: "rgba(0,201,167,0.08)", border: "rgba(0,201,167,0.2)", color: "#00C9A7" },
        skipped: { label: "Skipped", bg: "rgba(249,97,103,0.08)", border: "rgba(249,97,103,0.2)", color: "#F96167" },
        no_show: { label: "No Show", bg: "rgba(249,97,103,0.08)", border: "rgba(249,97,103,0.2)", color: "#F96167" },
    };

    const s = map[status] || map.waiting;

    return (
        <span className="px-2.5 py-0.75 rounded-lg text-[10px] font-bold tracking-[0.8px]"
            style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
            {["waiting", "next", "serving"].includes(status) && "● "}{s.label}
        </span>
    );
};

export default StatusBadge
