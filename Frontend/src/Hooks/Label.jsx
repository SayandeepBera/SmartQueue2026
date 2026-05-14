import React from 'react';

const Label = ({ children, required }) => {
  return (
    <label className="block text-xs font-semibold uppercase tracking-widest mb-2 text-white/50 font-satoshi">
      {children}{required && <span className="text-teal-400 ml-1">*</span>}
    </label>
  );
}

export default Label;
