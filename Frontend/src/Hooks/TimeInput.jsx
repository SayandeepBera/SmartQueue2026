import React from 'react';
import { Clock } from 'lucide-react';

const TimeInput = ({ label, value, onChange }) => {
    return (
        <div className="relative group">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5 ml-1">
                {label}
            </p>
            <div className="relative">
                {/* Visual Icon */}
                <Clock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal-400 transition-colors z-10 pointer-events-none"
                />

                <input
                    type="time"
                    value={value}
                    onChange={onChange}
                    className="custom-time-input w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all cursor-pointer [scheme:dark]"
                />
            </div>
        </div>
    )
}

export default TimeInput
