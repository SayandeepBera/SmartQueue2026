const Field = ({ label, required, error, hint, children }) => (
    <div>
        <label className="block text-[11px] text-white/38 uppercase tracking-widest font-bold mb-1.5">
            {label}{required && <span className="text-[#f43f5e] ml-1">*</span>}
        </label>
        {children}
        {hint && !error && <p className="text-[11px] text-white/22 mt-1">{hint}</p>}
        {error && <p className="text-xs text-[#f43f5e] mt-1.5 flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
);

export default Field;