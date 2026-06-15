import React, { useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ImSpinner9 } from 'react-icons/im';
import { BsTerminal } from 'react-icons/bs';

import CurrServing from '../../Components/Orgs/CurrServing';
import QueueList from '../../Components/Orgs/QueueList';
import CounterControl from '../../Components/Orgs/CounterControl';
import ServicesContext from '../../Context/Services/ServicesContext';

/* ── auto-refresh interval (ms) ─────────────────────────────────────────── */
const POLL_INTERVAL = 15000; // refresh queue every 15 s

const QueuePage = ({ services, setServices, activity, onAction, onRefreshServices }) => {
    const { getQueue, markDone, skipToken, moveToFront, noShow, updateServiceStatus } = useContext(ServicesContext);

    // Default to first active service
    const [selectedId, setSelectedId] = useState(() => {
        const first = services.find(s => s.isActive);
        return first?._id || services[0]?._id || null;
    });

    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null); // tokenId being processed

    const selectedService = services.find(s => s._id === selectedId);
    const serving = queue.find(t => t.status === 'next') || queue[0] || null;

    // Whenever services list changes (e.g. new service added, or current service deleted), ensure selectedId is valid
    useEffect(() => {
        if (services.length === 0) {
            setSelectedId(null);
            setQueue([]);
            setLoading(false);

            return;
        }

        const stillExists = services.some(s => s._id === selectedId);
        if (!stillExists) {
            const first = services.find(s => s.isActive);
            setSelectedId(first?._id || services[0]._id || null);
        }
    }, [services, selectedId]);


    // Fetch queue for selected service, with optional silent mode (no loading spinner) for auto-refresh
    const fetchQueue = useCallback(async (silent = false) => {
        if (!selectedId) {
            setQueue([]);
            setLoading(false);
            return;
        }

        if (!silent)
            setLoading(true);

        const result = await getQueue(selectedId);
        if (result.success)
            setQueue(result.queue);

        setLoading(false);
    }, [selectedId, getQueue]);

    useEffect(() => {
        fetchQueue();
        // Poll for new tokens
        const interval = setInterval(() => fetchQueue(true), POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchQueue]);

    // Callback to trigger after any action that modifies the queue, to refresh data and activity log
    const afterAction = () => {
        fetchQueue(true);
        if (onAction) onAction(); // triggers parent to re-fetch activity log
        if (onRefreshServices) onRefreshServices(); // triggers parent to re-fetch services (for stats update)
    };

    // Queue actions: mark done, skip, no-show, move to front
    const handleMarkDone = async () => {
        if (!serving) { toast.info("Queue is empty"); return; }
        setActionId(serving._id);
        
        const result = await markDone(serving._id);
        setActionId(null);

        if (result.success) {
            toast.success(`${serving.tokenNumber} marked as served ✓`, { theme: 'colored' });
            afterAction();
        } else {
            toast.error(result.error || 'Failed to mark done', { theme: 'colored' });
        }
    };

    const handleSkipToken = async () => {
        if (!serving) { toast.info("Queue is empty"); return; }
        if (queue.length <= 1) {
            toast.info("Only one token in queue");
            return;
        }
        setActionId(serving._id);
        const result = await skipToken(serving._id);
        setActionId(null);

        if (result.success) {
            toast.info(result.message, { theme: 'colored' });
            afterAction();
        } else {
            toast.error(result.error || 'Failed to skip token', { theme: 'colored' });
        }
    };

    const handleNoShow = async () => {
        if (!serving) { 
            toast.info("Queue is empty"); 
            return; 
        }

        setActionId(serving._id);
        const result = await noShow(serving._id);
 
        setActionId(null);
 
        if (result.success) {
            toast.warning(`${serving.tokenNumber} marked as no-show`, { theme: 'colored' });
            afterAction();
        } else {
            toast.error(result.error || 'Failed to mark no-show', { theme: 'colored' });
        }
    };

    const handleMoveToFront = async (tokenId, tokenNumber) => {
        setActionId(tokenId);
        const result = await moveToFront(tokenId);
        setActionId(null);

        if (result.success) {
            toast.success(`${tokenNumber} moved to front`, { theme: 'colored' });
            afterAction();
        } else {
            toast.error(result.error || 'Failed to move token', { theme: 'colored' });
        }
    };

    // Counter status change (open/close)

    const handleCounterStatus = async (svc, newStatus) => {
        setLoading(true);
        try {
            const result = await updateServiceStatus(svc._id, newStatus);
            if (result.success) {
                setServices(prev => prev.map(s => s._id === svc._id ? { ...s, ...result.service } : s));
                toast.info(result.message, { theme: 'colored' });
                afterAction();
            } else {
                toast.error(result.error || 'Failed to update counter', { theme: 'colored' });
            }
        } catch (error) {
            toast.error('An error occurred while updating counter', { theme: 'colored' });
        } finally {
            setLoading(false);
        }
    };

    // Today's progress from selected service stats 
    const stats = selectedService?.stats || { total: 0, served: 0, skipped: 0, noShows: 0 };

    // EMPTY STATE FOR NO SERVICES
    if (services.length === 0 && !loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6 anim-fadeUp text-center">
                <div className="relative mb-12 flex items-center justify-center">
                    {/* 1. Background Aura Glow */}
                    <div className="absolute w-32 h-32 bg-[#00C9A7]/15 blur-[50px] rounded-full animate-pulse" />

                    {/* 2. Floating Rotating Rings */}
                    <div className="absolute w-36 h-36 border border-white/5 rounded-full animate-[spin_8s_linear_infinite]" />
                    <div className="absolute w-36 h-36 border-t border-[#00C9A7]/20 rounded-full animate-[spin_4s_linear_infinite]" />

                    {/* 3. The Emoji Container (Glassmorphism) */}
                    <div className="relative w-28 h-28 rounded-[38px] bg-white/3 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md animate-smoothFloat">

                        {/* The Emoji with subtle drop shadow */}
                        <span className="text-6xl drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] select-none">
                            👋
                        </span>

                        {/* 4. Small "Ready" indicator */}
                        <div className="absolute bottom-4 right-4 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C9A7] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00C9A7]"></span>
                        </div>
                    </div>

                    {/* 5. Dynamic Shadow (Scales with the float) */}
                    <div className="absolute -bottom-8 w-16 h-2 bg-black/40 blur-md rounded-[100%] animate-shadowScale" />
                </div>
                <h2 className="text-2xl font-bold text-[#E8EDF5] mb-2" style={{ fontFamily: "'serif', 'fangsong'" }}>
                    Welcome to Queue Manager
                </h2>
                <p className="text-white/40 max-w-sm mb-8 text-sm" style={{ fontFamily: "'serif', 'fangsong'" }}>
                    You haven't created any Service Rooms yet. Head over to the Service Rooms page to set up your first counter.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 anim-fadeUp">

            {/* ── Service switcher ────────────────────────────────────────── */}
            {services.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                    {services.map(s => (
                        <button
                            key={s._id}
                            onClick={() => setSelectedId(s._id)}
                            className="px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                            style={{
                                background: selectedId === s._id ? `${s.color}20` : "rgba(255,255,255,0.04)",
                                border: `1px solid ${selectedId === s._id ? s.color + "50" : "rgba(255,255,255,0.1)"}`,
                                color: selectedId === s._id ? s.color : "rgba(255,255,255,0.45)",
                                fontFamily: "'serif', 'fangsong'",
                            }}
                        >
                            {s.icon} {s.counter} — {s.name}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <ImSpinner9 className="animate-spin h-9 w-9 text-[#00C9A7]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mb-20">

                    {/* Left column */}
                    <div className="flex flex-col gap-4">
                        <CurrServing
                            serving={serving}
                            service={selectedService}
                            actionId={actionId}
                            queueLength={queue.length}
                            markDone={handleMarkDone}
                            skipToken={handleSkipToken}
                            noShow={handleNoShow}
                        />
                        <QueueList
                            queue={queue}
                            actionId={actionId}
                            moveToFront={handleMoveToFront}
                        />
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-4">
                        <CounterControl
                            services={services}
                            onStatusChange={handleCounterStatus}
                            loading={loading}
                        />

                        {/* Today's Progress */}
                        <div className="rounded-[20px] p-5 bg-white/4 border border-white/8 backdrop-blur-xl">
                            <h3 className="font-bold text-lg mb-3.5" style={{ fontFamily: "'serif', 'fangsong'", color: "#E8EDF5" }}>
                                Today's Progress
                            </h3>
                            {[
                                ["Served", stats.served, stats.total, "#00C9A7"],
                                ["Skipped", stats.skipped, stats.total, "#FFC75F"],
                                ["No-shows", stats.noShows, stats.total, "#F96167"],
                            ].map(([label, value, total, color]) => (
                                <div key={label} className="mb-3">
                                    <div className="flex justify-between mb-1.25" style={{ fontFamily: "'serif', 'fangsong'" }}>
                                        <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
                                        <span className="text-[12px] font-bold" style={{ color }}>{value}/{total || 0}</span>
                                    </div>
                                    <div className="h-1.25 rounded-[3px] overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                                        <div
                                            className="h-full rounded-[3px] transition-all duration-500"
                                            style={{ width: total > 0 ? `${(value / total) * 100}%` : '0%', background: color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Activity Log */}
                        <div className="rounded-[20px] p-5 lg:flex-1 bg-white/4 border border-white/8 backdrop-blur-xl min-h-50">
                            <h3 className="font-bold text-lg mb-3.5 text-[#E8EDF5]" style={{ fontFamily: "'serif', 'fangsong'" }}>Activity Log</h3>
                            <div className="flex flex-col gap-2.25 overflow-y-auto max-h-75 custom-scrollbar" style={{ fontFamily: "'serif', 'fangsong'" }}>
                                {activity.length > 0 ? activity.map((a, i) => (
                                    <div key={a._id || i} className="flex gap-2.5 anim-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
                                        <span className="text-[15px] shrink-0">{a.icon}</span>
                                        <div>
                                            <div className="text-[13px] text-[#E8EDF5]">{a.msg}</div>
                                            <div className="text-[11px] mt-px text-white/30">{a.time}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
                                        <div className="relative mb-4">
                                            {/* Pulsing rings to indicate "listening" for live updates */}
                                            <div className="absolute inset-0 bg-[#00C9A7]/10 blur-xl rounded-full animate-pulse" />
                                            <div className="relative w-12 h-12 rounded-full border border-white/5 flex items-center justify-center bg-white/2">
                                                <BsTerminal className="text-[#00C9A7]/40 animate-pulse" size={20} />
                                            </div>
                                        </div>

                                        <div className="text-center space-y-1">
                                            <p className="text-[13px] font-medium text-white/40 tracking-wide uppercase">
                                                Waiting for logs
                                            </p>
                                            <p className="text-[11px] text-white/20 italic">
                                                Live actions will appear here in real-time
                                            </p>
                                        </div>

                                        {/* Decorative timeline skeleton */}
                                        <div className="mt-6 w-full space-y-3 opacity-[0.03] select-none pointer-events-none">
                                            <div className="flex gap-3 items-center">
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                                <div className="h-2 w-3/4 bg-white rounded-full" />
                                            </div>
                                            <div className="flex gap-3 items-center">
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                                <div className="h-2 w-1/2 bg-white rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QueuePage;