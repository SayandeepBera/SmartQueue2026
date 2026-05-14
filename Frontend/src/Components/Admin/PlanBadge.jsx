import React from 'react'

const PlanBadge = ({ plan }) => {
    const map = { Free: "#8595AE", Starter: "#00C9A7", Pro: "#fbbf24", Enterprise: "#a78bfa" };
    const c = map[plan] || "#64748b";
    
    return (
        <span className="text-[11px] font-bold tracking-wide px-2 py-0.5 rounded-full" style={{ background: `${c}18`, border: `1px solid ${c}40`, color: c }}>
            {plan}
        </span>
    );
}

export default PlanBadge
