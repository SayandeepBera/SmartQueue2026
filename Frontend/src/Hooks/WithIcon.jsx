import React from "react";

const WithIcon = ({ icon: Icon, children }) => (
    <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
        {React.cloneElement(children, { className: `${children.props.className || inputCls} pl-10` })}
    </div>
);

export default WithIcon;