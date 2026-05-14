import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { ImSpinner9 } from 'react-icons/im';
import { Edit2, Save, X, ToggleLeft, ToggleRight, ExternalLink, MessageCircle, Mail, Phone, Bug, Lightbulb, BookOpenText } from 'lucide-react';
import SupportContext from '../../Context/Support/SupportContext';

const CHANNEL_META = {
    live_chat: { icon: <MessageCircle size={20} className="text-emerald-400" />, label: "Live Chat", hint: "No link needed — opens chat widget" },
    email_support: { icon: <Mail size={20} className="text-[#00C4CC]" />, label: "Email Support", hint: 'e.g. mailto:support@yoursite.com?subject=...' },
    phone_support: { icon: <Phone size={20} className="text-purple-400" />, label: "Phone Support", hint: 'e.g. tel:+18001234567' },
    report_bug: { icon: <Bug size={20} className="text-orange-400" />, label: "Report a Bug", hint: 'e.g. https://github.com/yourorg/repo/issues' },
    feature_request: { icon: <Lightbulb size={20} className="text-yellow-400" />, label: "Feature Request", hint: 'e.g. https://feedback.yoursite.com' },
    documentation: { icon: <BookOpenText size={20} className="text-blue-400" />, label: "Documentation", hint: 'e.g. https://docs.yoursite.com' },
};

const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "9px 13px",
    color: "#E8EDF5",
    fontSize: 13,
    fontFamily: "'serif', 'fangsong'",
    outline: "none",
    boxSizing: "border-box",
};

const ChannelRow = ({ channel, onSave }) => {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        title: channel.title,
        description: channel.description,
        actionLabel: channel.actionLabel,
        link: channel.link || "",
        isEnabled: channel.isEnabled,
        order: channel.order,
    });
    const [saving, setSaving] = useState(false);

    const meta = CHANNEL_META[channel.key] || { icon: <ExternalLink size={20} className="text-white/40" />, label: channel.key };

    // Handle save when channel prop changes (e.g. after saving or external update)
    const handleSave = async () => {
        setSaving(true);
        await onSave(channel._id, { ...form, link: form.link || null });
        setSaving(false);
        setEditing(false);
    };

    // Handle enable/disable toggle
    const handleToggle = async () => {
        setSaving(true);
        await onSave(channel._id, { ...form, isEnabled: !form.isEnabled });
        setForm(f => ({ ...f, isEnabled: !f.isEnabled }));
        setSaving(false);
    };

    return (
        <div className="glass rounded-2xl overflow-hidden" style={{ fontFamily: "'serif', 'fangsong'" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center">
                        {meta.icon}
                    </div>
                    <div>
                        <div className="font-semibold text-white text-[15px]">{meta.label}</div>
                        <div className="text-[11px] text-white/30 font-mono">{channel.key}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Enable/Disable toggle */}
                    <button onClick={handleToggle} disabled={saving} className="flex items-center gap-1.5 text-xs font-semibold transition-all disabled:opacity-50">
                        {saving
                            ? <ImSpinner9 className="animate-spin text-white/40 w-4 h-4" />
                            : form.isEnabled
                                ? <ToggleRight size={22} className="text-[#00C9A7]" />
                                : <ToggleLeft size={22} className="text-white/30" />
                        }
                        <span style={{ color: form.isEnabled ? "#00C9A7" : "rgba(255,255,255,0.3)" }}>
                            {form.isEnabled ? "Enabled" : "Disabled"}
                        </span>
                    </button>

                    {editing ? (
                        <>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-black disabled:opacity-50"
                                style={{ background: "#00C9A7" }}>
                                {saving ? <ImSpinner9 className="animate-spin" /> : <Save size={13} />}
                                {saving ? "Saving…" : "Save"}
                            </button>
                            <button onClick={() => setEditing(false)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/40"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                <X size={13} /> Cancel
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setEditing(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-400"
                            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)" }}>
                            <Edit2 size={13} /> Edit
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
                {editing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: "Title", key: "title", placeholder: "e.g. Live Chat" },
                            { label: "Description / Subtitle", key: "description", placeholder: "e.g. Average response: 2 mins" },
                            { label: "Button Label", key: "actionLabel", placeholder: "e.g. Start Chat" },
                            { label: "Order (0 = first)", key: "order", placeholder: "0", type: "number" },
                        ].map(({ label, key, placeholder, type }) => (
                            <div key={key} className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-semibold text-white/30 uppercase tracking-wider ml-1">{label}</label>
                                <input
                                    type={type || "text"}
                                    style={inputStyle}
                                    value={form[key]}
                                    placeholder={placeholder}
                                    onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                                />
                            </div>
                        ))}

                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-[11px] font-semibold text-white/30 uppercase tracking-wider ml-1">
                                Link / URL
                                <span className="ml-2 text-white/20 normal-case font-normal">{meta.hint}</span>
                            </label>
                            <input
                                style={inputStyle}
                                value={form.link}
                                placeholder={meta.hint}
                                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {[
                            { label: "Title", value: channel.title },
                            { label: "Description", value: channel.description || "—" },
                            { label: "Button", value: channel.actionLabel },
                            { label: "Link", value: channel.link || "—" },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <div className="text-[10px] text-white/25 uppercase tracking-widest font-bold mb-1">{label}</div>
                                <div className="text-white/65 truncate text-[13px]">{value}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ChannelsPanel = () => {
    const { fetchAdminChannels, updateChannel } = useContext(SupportContext);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const result = await fetchAdminChannels();
            if (result.success) setChannels(result.channels);
            setLoading(false);
        })();
    }, []);

    const handleSave = async (id, data) => {
        const result = await updateChannel(id, data);
        if (result.success) {
            setChannels(prev => prev.map(c => c._id === id ? result.channel : c));
            toast.success("Channel updated!", { theme: "colored" });
        } else {
            toast.error(result.error || "Failed to update channel", { theme: "colored" });
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <ImSpinner9 className="animate-spin text-[#00C9A7] w-8 h-8" />
        </div>
    );

    return (
        <div className="flex flex-col gap-4" style={{ animation: "fadeUp .4s both" }}>
            <div className="flex items-center justify-between">
                <p className="text-sm text-white/40" style={{ fontFamily: "'serif', 'fangsong'" }}>
                    Manage what your users see in the Support Centre's quick-links section.
                </p>
            </div>
            {channels.map(ch => (
                <ChannelRow key={ch._id} channel={ch} onSave={handleSave} />
            ))}
        </div>
    );
};

export default ChannelsPanel;