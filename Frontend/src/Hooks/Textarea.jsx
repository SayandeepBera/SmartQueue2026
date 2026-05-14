import React from 'react'

const Textarea = ({ ...props }) => {
    return (
        <textarea
            {...props}
            className="w-full px-4 py-3 rounded-xl text-sm text-white/90 bg-white/4 border border-white/10 outline-none resize-none font-satoshi"
        />
    );
}

export default Textarea;
