import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { ImSpinner9 } from 'react-icons/im';
import OrgContext from '../../Context/Organization/OrgContext';
import UserTable from '../../Components/Admin/UserTable';
import AnimatedNumber from '../../Hooks/AnimatedNumber';
import DeleteConfirmation from '../../Components/DeleteConfirmation';
import { BsInfoCircleFill } from 'react-icons/bs';
import UserFilter from '../../Components/Admin/UserFilter';

// Debounce hook to limit how often we call the API when typing in search
const useDebounce = (value, delay = 400) => {
    const [debounced, setDebounced] = useState(value);
    
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);

    return debounced;
};

// Build stats for the top cards based on current user data
const buildStats = (users) => [
    {
        label: 'Total Users',
        value: users.length,
        color: '#a78bfa',
    },
    {
        label: 'Active',
        value: users.filter(u => u.role === 'user').length,
        color: '#34d399',
    },
    {
        label: 'Suspended',
        value: users.filter(u => u.role === 'suspended_user').length,
        color: '#f43f5e',
    },
    {
        label: 'Avg Tokens',
        value: users.length
            ? Math.round(users.reduce((a, u) => a + (u.totalTokens || 0), 0) / users.length)
            : 0,
        color: '#fbbf24',
    },
];

const UsersPage = ({ onMutate }) => {
    const { getAllUsers, updateUserStatus, deleteUser } = useContext(OrgContext);

    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null); // id of row currently processing
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState('all');  // 'all' | 'active' | 'suspended'
    const [page, setPage] = useState(1);
    const LIMIT = 1000;

    const debouncedSearch = useDebounce(search, 400);

    // Fetch users whenever search, filter, or page changes
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const result = await getAllUsers({
            search: debouncedSearch,
            status: statusF,
            page,
            limit: LIMIT,
        });
        
        if (result.success) {
            setUsers(result.users);
            setTotal(result.total);
        } else {
            toast.error(result.error || 'Failed to load users', { theme: 'colored' });
        }
        setLoading(false);
    }, [debouncedSearch, statusF, page, getAllUsers]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Reset to page 1 when search / filter changes
    useEffect(() => { setPage(1); }, [debouncedSearch, statusF]);

    // Handle user status toggles
    const handleToggleStatus = async (userId) => {
        const user = users.find(u => u._id === userId);
        const action = user.role === 'suspended_user' ? 'restore' : 'suspend';
        const label = user.fullName || user.username;

        setActionId(userId);
        const result = await updateUserStatus(userId, action);
        setActionId(null);

        if (result.success) {
            // Optimistic update — flip the role locally
            setUsers(prev =>
                prev.map(u => u._id === userId ? { ...u, role: result.newRole } : u)
            );
            action === 'suspend'
                ? toast.info(`${label} has been suspended`, { theme: 'colored' })
                : toast.success(`${label} has been restored`, { theme: 'colored' });

            onMutate(); // Notify parent component of data change (to trigger refresh in OverviewPage)
        } else {
            toast.error(result.error || 'Action failed', { theme: 'colored' });
        }
    };

    const proceedWithDelete = async (userId, user, label) => {
        setActionId(userId);
        
        const result = await deleteUser(userId);
        setActionId(null);

        if (result.success) {
            setUsers(prev => prev.filter(u => u._id !== userId));
            setTotal(t => t - 1);
            toast.warn(`${label} has been removed from the platform`, { theme: 'colored' });
            onMutate(); // Notify parent component of data change (to trigger refresh in OverviewPage)
        } else {
            toast.error(result.error || 'Delete failed', { theme: 'colored' });
        }
    }
    // Handle user deletion
    const handleDeleteUser = async (userId) => {
        const user = users.find(u => u._id === userId);
        const label = user.fullName || user.username;

        const toastId = toast.info(
            <div className='flex gap-1 items-start'>
                <div className='text-xl mt-3 shrink-0'>
                    <BsInfoCircleFill />
                </div>

                <DeleteConfirmation
                    message={`Are you sure you want to delete ${label} account?`}
                    onCancel={() => toast.dismiss(toastId)} // Close if user clicks cancel
                    onConfirm={() => {
                        toast.dismiss(toastId);
                        proceedWithDelete(userId, user, label);
                    }}
                />
            </div>,

            {
                icon: false,
                position: "top-center",
                autoClose: false, // Wait for user action
                closeOnClick: false,
                draggable: false,
                style: { width: '95vw', maxWidth: '550px', borderRadius: '15px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderBottom: '4px solid #707c7c', margin: '0 auto' }
            }
        )
    };

    // Derived stats (from current page data for display) ────────────────────
    const stats = buildStats(users);
    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="flex flex-col gap-5" style={{ animation: 'fadeUp .5s both' }}>

            {/* Stats Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.map(({ label, value, color }, i) => (
                    <div
                        key={label}
                        className="glass rounded-2xl p-4"
                        style={{ animation: `fadeUp .5s ${i * 0.07}s both`, fontFamily: "'serif', 'fangsong'" }}
                    >
                        <div className="text-2xl font-extrabold mb-0.5" style={{ color }}>
                            <AnimatedNumber value={value} />
                        </div>
                        <div className="text-[13px] text-white/40">{label}</div>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <UserFilter search={search} setSearch={setSearch} statusF={statusF} setStatusF={setStatusF} total={total} />

            {/* Users Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <ImSpinner9 className="animate-spin h-9 w-9 text-[#a78bfa]" />
                    <p className="text-white/25 text-xs tracking-widest uppercase">Loading users…</p>
                </div>
            ) : (
                <UserTable
                    users={users}
                    actionId={actionId}
                    onToggleStatus={handleToggleStatus}
                    onDeleteUser={handleDeleteUser}
                />
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pb-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white/50 disabled:opacity-30 transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        ← Prev
                    </button>

                    <span className="text-[13px] text-white/35 font-mono px-3">
                        {page} / {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white/50 disabled:opacity-30 transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
};

export default UsersPage;