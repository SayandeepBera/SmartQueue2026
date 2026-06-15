import React, { useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ImSpinner9 } from 'react-icons/im';
import AddServiceModal from '../../Components/Orgs/AddServiceModal';
import EditServiceModal from '../../Components/Orgs/EditServiceModal';
import DeleteConfirmation from '../../Components/DeleteConfirmation';
import { BsInfoCircleFill, BsPlusLg } from 'react-icons/bs';
import ServicesContext from '../../Context/Services/ServicesContext';

const ServicesPage = ({ orgId, onAdded, onEdited, onDeleted }) => {
    const { getServices, updateServiceStatus, deleteService } = useContext(ServicesContext);

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null); // service to edit

    // Fetch services on mount and when orgId changes
    const fetchServices = useCallback(async () => {
        if (!orgId) return;
        setLoading(true);
        const result = await getServices(orgId);

        if (result.success)
            setServices(result.services);
        else
            toast.error(result.error || 'Failed to load services', { theme: 'colored' });

        setLoading(false);
    }, [orgId, getServices]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    // Toggle active/paused status
    const handleToggle = async (svc) => {
        const newStatus = svc.isActive ? 'paused' : 'active';
        setActionId(svc._id);
        const result = await updateServiceStatus(svc._id, newStatus);

        setActionId(null);
        if (result.success) {
            const updated = { ...svc, ...result.service };

            setServices(prev => prev.map(s =>
                s._id === svc._id ? updated : s
            ));

            // Notify parent page (Overview) to update if currently showing this service's data
            if (onEdited) {
                onEdited(updated);
            }
            
            toast.info(result.message, { theme: 'colored' });
        } else {
            toast.error(result.error || 'Failed to update status', { theme: 'colored' });
        }
    };

    // Delete service with confirmation
    const handleDelete = (svc) => {
        const toastId = toast.info(
            <div className='flex gap-1 items-start'>
                <div className='text-xl mt-3 shrink-0'>
                    <BsInfoCircleFill />
                </div>
                <DeleteConfirmation
                    message={`Are you sure you want to delete "${svc.name}"? All queue tokens will also be removed.`}
                    onCancel={() => toast.dismiss(toastId)}
                    onConfirm={async () => {
                        toast.dismiss(toastId);
                        setLoading(true);
                        setActionId(svc._id);
                        const result = await deleteService(svc._id);
                        setActionId(null);
                        if (result.success) {
                            setServices(prev => prev.filter(s => s._id !== svc._id));
                            setLoading(false);
                            // Notify parent page (Overview) to update if currently showing this service's data
                            if (onDeleted) {
                                onDeleted(svc._id);
                            }

                            toast.warn(`${svc.name} has been successfully removed`, { theme: 'colored' });
                        } else {
                            toast.error(result.error || 'Delete failed', { theme: 'colored' });
                        }

                        setLoading(false);
                    }}
                />
            </div>,

            {
                icon: false, position: 'top-center', autoClose: false,
                closeOnClick: false, draggable: false,
                style: {
                    width: '95vw', maxWidth: '550px', borderRadius: '15px',
                    background: '#1e293b', color: '#fff',
                    border: '1px solid #334155', borderBottom: '4px solid #707c7c',
                    margin: '0 auto'
                }
            }
        );
    };

    // Notify parent page (Overview) about added/edited service so it can update if currently showing this service's data
    const handleAdded = (newSvc) => {
        setServices(prev => [...prev, newSvc]);

        // Notify parent page (Overview) to update if currently showing this service's data
        if (onAdded) {
            onAdded(newSvc);
        }

        toast.success(`${newSvc.name} has been successfully created`, { theme: 'colored' });
    };

    const handleEdited = (updatedSvc) => {
        setServices(prev => prev.map(s => s._id === updatedSvc._id ? updatedSvc : s));
        
        // Notify parent page (Overview) to update if currently showing this service's data
        if (onEdited) {
            onEdited(updatedSvc);
        }

        toast.success(`${updatedSvc.name} has been successfully updated`, { theme: 'colored' });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <ImSpinner9 className="animate-spin h-9 w-9 text-[#00C9A7]" />
                <p className="text-white/25 text-xs tracking-widest uppercase">Loading services…</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 anim-fadeUp h-full mb-20">
            {services.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white/2 rounded-4xl border border-dashed border-white/10 mt-2">
                    <div className="relative mb-8">
                        <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-[#00C9A7]/20 to-[#4DA8DA]/20 flex items-center justify-center text-5xl shadow-2xl animate-bounce duration-3000">
                            🏢
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#00C9A7] flex items-center justify-center text-black font-bold border-4 border-[#0F172A]">
                            +
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-[#E8EDF5] mb-3" style={{ fontFamily: "'serif', 'fangsong'" }}>Setup Your Service Rooms</h2>
                    <p className="text-white/40 max-w-md mb-8 text-[14px] leading-relaxed" style={{ fontFamily: "'serif', 'fangsong'" }}>
                        It looks like you haven't created any service counters yet. Create rooms for your staff to manage tokens and serve customers efficiently.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="group flex items-center gap-3 px-8 py-4 bg-linear-to-r from-[#00C9A7] to-[#4DA8DA] text-black font-extrabold rounded-2xl hover:scale-105 transition-all shadow-xl shadow-[#00C9A7]/20 cursor-pointer active:scale-95"
                        style={{ fontFamily: "'serif', 'fangsong'" }}
                    >
                        <BsPlusLg className="group-hover:rotate-90 transition-transform" />
                        Add Your First Service Room
                    </button>
                </div>
            ) : (
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))" }}>

                    {services.map((s, i) => {
                        const isBusy = actionId === s._id;
                        const pct = s.stats.total > 0 ? Math.round((s.stats.served / s.stats.total) * 100) : 0;

                        return (
                            <div
                                key={s._id}
                                className={`rounded-[20px] p-5.5 cursor-default transition-all duration-250 hover:-translate-y-0.75 hover:scale-[1.02] bg-white/4 backdrop-blur-xl anim-fadeUp ${isBusy ? 'opacity-60 pointer-events-none' : ''}`}
                                style={{ border: `1px solid ${s.color}18`, animationDelay: `${i * 0.07}s`, boxShadow: "none" }}
                                onMouseOver={e => e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)"}
                                onMouseOut={e => e.currentTarget.style.boxShadow = "none"}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11.5 h-11.5 rounded-[14px] flex items-center justify-center text-[22px]"
                                            style={{ background: `${s.color}18`, border: `1.5px solid ${s.color}30` }}>
                                            {s.icon}
                                        </div>
                                        <div style={{ fontFamily: "'serif', 'fangsong'" }}>
                                            <h3 className="text-[16px] font-bold mb-0.5" style={{ color: "#E8EDF5" }}>{s.name}</h3>
                                            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                                                Counter {s.counter} · Avg {s.avgWait} min
                                            </p>
                                        </div>
                                    </div>

                                    {/* Active toggle */}
                                    <div
                                        onClick={() => !isBusy && handleToggle(s)}
                                        className="cursor-pointer relative shrink-0 transition-all duration-250"
                                        style={{ width: 44, height: 24, borderRadius: 12, background: s.isActive ? "rgba(0,201,167,0.2)" : "rgba(255,255,255,0.1)", border: `1.5px solid ${s.isActive ? "rgba(0,201,167,0.5)" : "rgba(255,255,255,0.15)"}` }}
                                    >
                                        {isBusy ? (
                                            <ImSpinner9 className="animate-spin absolute inset-0 m-auto h-3 w-3 text-white/50" />
                                        ) : (
                                            <div className="absolute top-0.75 w-3.5 h-3.5 rounded-full transition-all duration-250"
                                                style={{ left: s.isActive ? 22 : 3, background: s.isActive ? "#00C9A7" : "rgba(255,255,255,0.4)", boxShadow: s.isActive ? "0 0 8px rgba(0,201,167,0.6)" : "none" }} />
                                        )}
                                    </div>
                                </div>

                                {/* Stats grid */}
                                <div className="grid grid-cols-3 gap-2 mb-3.5" style={{ fontFamily: "'serif', 'fangsong'" }}>
                                    {[["Total", s.stats.total], ["Served", s.stats.served], ["Waiting", s.stats.total - s.stats.served - s.stats.skipped - s.stats.noShows]].map(([k, v]) => (
                                        <div key={k} className="text-center p-2 rounded-[10px]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                            <div className="text-[18px] font-extrabold" style={{ color: s.color }}>{Math.max(0, v)}</div>
                                            <div className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{k}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress */}
                                <div className="mb-3.5">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>Completion</span>
                                        <span className="text-[12px] font-bold" style={{ color: s.color }}>{pct}%</span>
                                    </div>
                                    <div className="h-1.25 rounded-[3px] overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                                        <div className="h-full rounded-[3px] transition-all duration-500"
                                            style={{ width: `${pct}%`, background: `linear-gradient(90deg,${s.color},${s.color}88)` }} />
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditTarget(s)}
                                        className="flex-1 py-2 rounded-[10px] text-[13px] cursor-pointer font-semibold"
                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontFamily: "'serif', 'fangsong'" }}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(s)}
                                        className="py-2 px-3.5 rounded-[10px] text-[13px] cursor-pointer font-semibold"
                                        style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e", fontFamily: "'serif', 'fangsong'" }}
                                    >
                                        {loading ? <ImSpinner9 className="animate-spin" /> : '🗑'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add new service card */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="rounded-[20px] p-5.5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200"
                        style={{ border: "2px dashed rgba(0,201,167,0.25)", background: "rgba(0,201,167,0.04)", minHeight: 220, fontFamily: "'serif', 'fangsong'" }}
                        onMouseOver={e => { e.currentTarget.style.background = "rgba(0,201,167,0.08)"; e.currentTarget.style.borderColor = "rgba(0,201,167,0.5)"; }}
                        onMouseOut={e => { e.currentTarget.style.background = "rgba(0,201,167,0.04)"; e.currentTarget.style.borderColor = "rgba(0,201,167,0.25)"; }}
                    >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[26px]" style={{ background: "rgba(0,201,167,0.12)", border: "1.5px solid rgba(0,201,167,0.3)" }}>+</div>
                        <div>
                            <div className="text-[15px] font-bold text-center" style={{ color: "#00C9A7" }}>Add Service Room</div>
                            <div className="text-[12px] mt-1 text-center" style={{ color: "rgba(255,255,255,0.4)" }}>Create a new counter for any task</div>
                        </div>
                    </button>

                </div>
            )}

            {/* Modals */}
            {showAddModal && (
                <AddServiceModal
                    orgId={orgId}
                    onClose={() => setShowAddModal(false)}
                    onAdded={handleAdded}
                />
            )}
            {editTarget && (
                <EditServiceModal
                    service={editTarget}
                    onClose={() => setEditTarget(null)}
                    onEdited={handleEdited}
                />
            )}
        </div>
    );
};

export default ServicesPage;