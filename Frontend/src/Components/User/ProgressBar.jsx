import React from 'react'

const ProgressBar = ({ step, total }) => {
    const pct = ((step - 1) / (total - 1)) * 100;
    return (
        <div className="w-full h-0.75 bg-white/6 rounded-full overflow-hidden">
            <div
                className="h-full rounded-full bg-linear-to-r from-teal-500 to-cyan-400 progress-bar"
                style={{ "--pw": `${pct}%`, width: `${pct}%` }}
            />
        </div>
    );
}

export default ProgressBar
