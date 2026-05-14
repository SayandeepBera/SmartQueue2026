import React from 'react'

const Select = ({ children, ...props }) => {
    return (
        <select
            {...props}
            className="w-full px-4 py-3 rounded-xl text-sm text-white/90 bg-white/4 border border-white/10 outline-none cursor-pointer font-satoshi"
        >
            {children}
        </select>
    );
}

export default Select;
