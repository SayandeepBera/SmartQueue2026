import React from 'react'
import { motion } from 'framer-motion';

const OrgStatusBanner = ({ status, reason }) => {
    const map = {
        pending: { msg: "Your organization is under review. You'll be notified by email once verified.", color: "#fbbf24", icon: "⏳" },
        rejected: { msg: reason ? `Rejected: ${reason}` : "Your organization was rejected. Check your email for details.", color: "#f43f5e", icon: "❌" },
        suspended: { msg: reason ? `Suspended: ${reason}` : "Your organization has been suspended. Contact support.", color: "#f97316", icon: "🛑" },
    };

    const b = map[status];
    
    if (!b) {
        return null;
    }
    
    return (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 px-5 py-4 rounded-2xl text-sm font-medium"
            style={{ background: `${b.color}10`, border: `1px solid ${b.color}30`, color: b.color }}>
            <span className="text-base shrink-0 mt-0.5">{b.icon}</span>
            <span className="leading-relaxed">{b.msg}</span>
        </motion.div>
    );
}

export default OrgStatusBanner
