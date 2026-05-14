import React, { useState, useContext } from 'react';
import { ImSpinner9 } from 'react-icons/im';
import ServicesContext from '../../Context/Services/ServicesContext';

const ICONS = ["🩺", "🩸", "🫁", "💊", "❤️", "🧪", "🏦", "💳", "📈", "🪪", "🚗", "📋", "🛂", "🔄", "⚡", "🔬", "🎛️", "📝", "🏛️", "🎟️"];
const COLORS = ["#00C9A7", "#4DA8DA", "#845EC2", "#FF6B6B", "#FFC75F", "#F96167"];

const AddServiceModal = ({ orgId, onClose, onAdded }) => {
    const { createService } = useContext(ServicesContext);

    const [name, setName] = useState('');
    const [icon, setIcon] = useState('🎛️');
    const [counter, setCounter] = useState('');
    const [color, setColor] = useState('#00C9A7');
    const [maxQ, setMaxQ] = useState('50');
    const [avgWait, setAvgWait] = useState('10');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);

    const inputStyle = {
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12, color: "#E8EDF5", fontFamily: "inherit", outline: "none",
        width: "100%", padding: "11px 14px", fontSize: 14
    };

    // Handle form submission to create a new service
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) { setErr("Service name is required"); return; }
        if (!counter.trim()) { setErr("Counter ID is required"); return; }

        setLoading(true);
        const result = await createService({
            orgId,
            name: name.trim(),
            counter: counter.trim().toUpperCase(),
            icon, color,
            maxQueueSize: parseInt(maxQ) || 50,
            avgWait: parseInt(avgWait) || 10,
        });
        setLoading(false);

        if (result.success) {
            onAdded(result.service);
            onClose();
        } else {
            setErr(result.error || 'Failed to create service');
        }
    };

    return (
        <div
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-[#0F172A]/80 p-5"
            style={{ backdropFilter: "blur(8px)" }}
        >
            <div className="anim-modalIn relative top-0 custom-scrollbar w-full max-w-120 rounded-3xl p-8 overflow-y-auto bg-white/4 border border-white/8 backdrop-blur-xl"
                style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.7)", maxHeight: "80vh" }}>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-extrabold text-xl" style={{ fontFamily: "'serif', 'fangsong'", color: "#E8EDF5" }}>Add Service Room</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-[16px] cursor-pointer"
                        style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>✕</button>
                </div>

                {err && (
                    <div className="mb-3.5 px-3 py-2 rounded-lg text-[12px]"
                        style={{ background: "rgba(249,97,103,0.1)", border: "1px solid rgba(249,97,103,0.3)", color: "#F96167" }}>
                        ⚠ {err}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ fontFamily: "'serif', 'fangsong'" }}>

                    <div>
                        <label className="block text-[12px] font-semibold uppercase tracking-[0.5px] mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Service Name *</label>
                        <input value={name} onChange={e => { setName(e.target.value); setErr(''); }} placeholder="e.g. OPD Registration" style={inputStyle} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[12px] font-semibold uppercase tracking-[0.5px] mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Counter ID *</label>
                            <input value={counter} onChange={e => { setCounter(e.target.value); setErr(''); }} placeholder="e.g. H-G" style={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold uppercase tracking-[0.5px] mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Max Queue Size</label>
                            <input value={maxQ} onChange={e => setMaxQ(e.target.value)} type="number" min="1" max="500" style={inputStyle} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[12px] font-semibold uppercase tracking-[0.5px] mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Avg Wait Time (min)</label>
                        <input value={avgWait} onChange={e => setAvgWait(e.target.value)} type="number" min="1" style={inputStyle} />
                    </div>

                    {/* Icon picker */}
                    <div>
                        <label className="block text-[12px] font-semibold uppercase tracking-[0.5px] mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>Service Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {ICONS.map(ic => (
                                <button key={ic} type="button" onClick={() => setIcon(ic)}
                                    className="w-9.5 h-9.5 rounded-[10px] text-[18px] cursor-pointer transition-all duration-150"
                                    style={{ border: `2px solid ${icon === ic ? "#00C9A7" : "rgba(255,255,255,0.1)"}`, background: icon === ic ? "rgba(0,201,167,0.12)" : "rgba(255,255,255,0.04)" }}>
                                    {ic}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color picker */}
                    <div>
                        <label className="block text-[12px] font-semibold uppercase tracking-[0.5px] mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>Accent Color</label>
                        <div className="flex gap-2.5">
                            {COLORS.map(c => (
                                <div key={c} onClick={() => setColor(c)} className="w-8 h-8 rounded-full cursor-pointer transition-all duration-150"
                                    style={{ background: c, border: `3px solid ${color === c ? "#E8EDF5" : "transparent"}`, boxShadow: color === c ? `0 0 12px ${c}80` : "none" }} />
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-[14px]" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
                        <div className="w-10.5 h-10.5 rounded-xl flex items-center justify-center text-[20px]" style={{ background: `${color}20`, border: `1.5px solid ${color}35` }}>{icon}</div>
                        <div>
                            <div className="font-bold text-[14px]" style={{ color: "#E8EDF5" }}>{name || "Service Name"}</div>
                            <div className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Counter {counter || "X-X"} · Max {maxQ} tokens</div>
                        </div>
                    </div>

                    <div className="flex gap-2.5 mt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-[16px] font-medium cursor-pointer"
                            style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", fontFamily: "inherit" }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="py-3 rounded-xl border-none text-black text-[16px] font-extrabold cursor-pointer transition-all hover:brightness-110 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2"
                            style={{ flex: 2, background: "linear-gradient(135deg,#00C9A7,#4DA8DA)", fontFamily: "inherit" }}>
                            {loading ? <><ImSpinner9 className="animate-spin h-4 w-4" /> Creating…</> : "Create Service Room →"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddServiceModal;