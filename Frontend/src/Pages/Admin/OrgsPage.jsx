import React, { useState, useEffect, useContext, useCallback } from 'react';
import OrgsTable from '../../Components/Admin/OrgsTable';
import DetailModal from '../../Components/Admin/DetailModal';
import ReasonModal from '../../Components/Admin/ReasonModal';
import DeleteConfirmation from '../../Components/DeleteConfirmation';
import { BsInfoCircleFill } from "react-icons/bs";
import { toast } from 'react-toastify';
import { ImSpinner9 } from 'react-icons/im';
import OrgContext from '../../Context/Organization/OrgContext';
import AnimatedNumber from '../../Hooks/AnimatedNumber';
import OrgFilter from '../../Components/Admin/OrgFilter';

/* Debounce hook */
const useDebounce = (value, delay = 400) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
};

/* Build stats */
const buildStats = (orgs, total) => [
    {
        label: 'Total',
        value: total,
        color: '#fbbf24'
    },
    {
        label: 'Approved',
        value: orgs.filter(o => o.status === 'approved').length,
        color: '#34d399'
    },
    {
        label: 'Pending',
        value: orgs.filter(o => o.status === 'pending').length,
        color: '#f97316'
    },
    {
        label: 'Suspended',
        value: orgs.filter(o => o.status === 'rejected' || o.status === 'suspended').length,
        color: '#f43f5e'
    },
];

const OrgsPage = ({ onMutate }) => {
    const { getAllOrganizations, updateOrganizationStatus, deleteOrganization, reactivateOrganization } = useContext(OrgContext);

    const [orgs, setOrgs] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);   // action in progress
    const [loadingId, setLoadingId] = useState(null);    // which row is busy

    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState('all');
    const [typeF, setTypeF] = useState('all');
    const [planF, setPlanF] = useState('all');
    const [page, setPage] = useState(1);
    const LIMIT = 1000;

    const debouncedSearch = useDebounce(search, 400);

    // Modal state
    const [detail, setDetail] = useState(null);
    const [reasonModal, setReasonModal] = useState(null); // { org, action: 'reject'|'suspend' }

    // Fetch orgs whenever filters change
    const fetchOrgs = useCallback(async () => {
        setLoading(true);
        const result = await getAllOrganizations({
            search: debouncedSearch,
            status: statusF,
            type: typeF,
            plan: planF,
            page,
            limit: LIMIT,
        });

        if (result.success) {
            setOrgs(result.orgs);
            setTotal(result.total);
            setPages(result.pages);
        } else {
            toast.error(result.error || 'Failed to load organizations', { theme: 'colored' });
        }
        setLoading(false);
    }, [debouncedSearch, statusF, typeF, planF, page, getAllOrganizations]);

    useEffect(() => { 
        fetchOrgs(); 
    }, [fetchOrgs]);

    // Reset to page 1 when filters change
    useEffect(() => { 
        setPage(1); 
    }, [debouncedSearch, statusF, typeF, planF]);

    // Loading state
    const startLoading = (id) => { setIsLoading(true); setLoadingId(id); };
    const stopLoading = () => { setIsLoading(false); setLoadingId(null); };

    // Verify (approve) a pending org
    const verifyOrg = async (id) => {
        const o = orgs.find(x => x._id === id);
        startLoading(id);
        const result = await updateOrganizationStatus(id, 'approved');

        if (result.success) {
            setOrgs(prev => prev.map(x => x._id === id ? { ...x, status: 'approved' } : x));
            toast.success(`${o.orgName} has been verified & approved ✓`, { style: { borderRadius: '10px', background: '#03C203', color: '#fff' } });
            setDetail(null);
            onMutate(); // Notify parent component of data change
        } else {
            toast.error(result.error || 'Failed to verify', { theme: 'colored' });
        }
        stopLoading();
    };

    // Update org status (suspend/reject or restore)
    const updateStatus = async (id, status, reason = '') => {
        const o = orgs.find(x => x._id === id);
        startLoading(id);

        const result = await updateOrganizationStatus(id, status, reason);

        if (result.success) {
            setOrgs(prev => prev.map(x =>
                x._id === id ? { ...x, status, ...(reason ? { rejectionReason: reason } : {}) } : x
            ));

            toast.success(`${o.orgName} status has been updated to ${status}`, {
                style: { borderRadius: '10px', background: '#03C203', color: '#fff' }
            });
            setDetail(null);
            setReasonModal(null);
            onMutate(); // Notify parent component of data change
        } else {
            toast.error(result.error || 'Failed to update status', { theme: 'colored' });
        }
        stopLoading();
    };

    // Delete organization
    const proceedWithDelete = async (id, o) => {
        startLoading(id);
        const result = await deleteOrganization(id);

        if (result.success) {
            setOrgs(prev => prev.filter(x => x._id !== id));
            setTotal(t => t - 1);
            toast.warn(`${o.orgName} has been scheduled for deletion`, { theme: 'colored' });
            fetchOrgs(); // refresh list to reflect deletion
            setDetail(null);
            onMutate(); // Notify parent component of data change
        } else {
            toast.error(result.error || 'Failed to remove', { theme: 'colored' });
        }
        stopLoading();
    };

    // Show delete confirmation modal
    const deleteOrg = (id) => {
        const o = orgs.find(x => x._id === id);

        const toastId = toast.info(
            <div className='flex gap-1 items-start'>
                <div className='text-xl mt-3 shrink-0'><BsInfoCircleFill /></div>
                <DeleteConfirmation
                    message={`Are you sure you want to delete ${o.orgName}?`}
                    onCancel={() => toast.dismiss(toastId)}
                    onConfirm={() => { toast.dismiss(toastId); proceedWithDelete(id, o); }}
                />
            </div>,
            {
                icon: false, position: 'top-center', autoClose: false,
                closeOnClick: false, draggable: false,
                style: { width: '95vw', maxWidth: '550px', borderRadius: '15px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderBottom: '4px solid #707c7c', margin: '0 auto' }
            }
        );
    };

    // Reactivate organization
    const reactivateOrg = async (id) => {
        const o = orgs.find(x => x._id === id);
        startLoading(id);
        const result = await reactivateOrganization(id);

        if (result.success) {
            setOrgs(prev => prev.map(x => x._id === id ? { ...x, status: 'approved' } : x));
            toast.success(`${o.orgName} has been reactivated ✓`, { style: { borderRadius: '10px', background: '#03C203', color: '#fff' } });
            setDetail(null);
            onMutate();
        } else {
            toast.error(result.error || 'Failed to reactivate', { theme: 'colored' });
        }

        stopLoading();
    };

    // Show reason modal
    const handleReasonConfirm = async (reason) => {
        if (!reasonModal) return;
        const { org, action } = reasonModal;
        await updateStatus(org._id, action === 'reject' ? 'rejected' : 'suspended', reason);
    };

    const stats = buildStats(orgs, total);
    const types = ['all', 'Hospital', 'Bank', 'Government', 'Clinic', 'Diagnostic', 'Other'];
    const statuses = ['all', 'approved', 'pending', 'rejected', 'suspended', 'scheduled_for_deletion'];
    const plans = ['all', 'Free', 'Starter', 'Pro', 'Enterprise'];

    return (
        <div className="flex flex-col gap-5 h-full" style={{ animation: 'fadeUp .5s both' }}>

            {/* Stats Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.map(({ label, value, color }, i) => (
                    <div key={label} className="glass rounded-2xl p-4"
                        style={{ animation: `fadeUp .5s ${i * 0.07}s both`, fontFamily: "'serif', 'fangsong'" }}>
                        <div className="text-2xl font-extrabold mb-0.5" style={{ color }}>
                            <AnimatedNumber value={value} />
                        </div>
                        <div className="text-[13px] text-white/40">{label}</div>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <OrgFilter
                search={search}
                setSearch={setSearch}
                typeF={typeF}
                setTypeF={setTypeF}
                statusF={statusF}
                setStatusF={setStatusF}
                total={total}
                types={types}
                statuses={statuses}
                plans={plans}
                planF={planF}
                setPlanF={setPlanF}
            />

            {/* Organization Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <ImSpinner9 className="animate-spin h-9 w-9 text-[#fbbf24]" />
                    <p className="text-white/25 text-xs tracking-widest uppercase">Loading organizations…</p>
                </div>
            ) : (
                <OrgsTable
                    filtered={orgs}
                    setDetail={setDetail}
                    verifyOrg={verifyOrg}
                    updateStatus={updateStatus}
                    deleteOrg={deleteOrg}
                    reactivateOrg={reactivateOrg}
                    isLoading={isLoading}
                    loadingId={loadingId}
                    onRejectClick={(org) => setReasonModal({ org, action: 'reject' })}
                    onSuspendClick={(org) => setReasonModal({ org, action: 'suspend' })}
                />
            )}

            {/* Pagination */}
            {!loading && pages > 1 && (
                <div className="flex items-center justify-center gap-2 pb-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white/50 disabled:opacity-30 transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        ← Prev
                    </button>

                    {/* Page number buttons — show up to 5 pages */}
                    {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                        const startPage = Math.max(1, page - 2);
                        const p = startPage + i;
                        if (p > pages) return null;
                        return (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className="w-9 h-9 rounded-xl text-sm font-semibold transition-all"
                                style={p === page
                                    ? { background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24' }
                                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
                                }
                            >
                                {p}
                            </button>
                        );
                    })}

                    <button
                        disabled={page === pages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white/50 disabled:opacity-30 transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Detail modal */}
            {detail && (
                <DetailModal
                    detail={detail}
                    setDetail={setDetail}
                    verifyOrg={verifyOrg}
                    updateStatus={updateStatus}
                    deleteOrg={deleteOrg}
                    reactivateOrg={reactivateOrg}
                    isLoading={isLoading}
                />
            )}

            {/* Reason modal */}
            {reasonModal && (
                <ReasonModal
                    action={reasonModal.action}
                    orgName={reasonModal.org.orgName}
                    isLoading={isLoading}
                    onConfirm={handleReasonConfirm}
                    onCancel={() => setReasonModal(null)}
                />
            )}
        </div>
    );
};

export default OrgsPage;