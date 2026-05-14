import React from 'react'

const Input = ({ ...props }) => {
    return (
        <input
            {...props}
            className="w-full px-4 py-3 rounded-xl text-sm text-white/90 bg-white/4 border border-white/10 focus-within:border-[#00C9A7] outline-none font-satoshi"
        />
    );
}

export default Input;
