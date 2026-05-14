import React, { useContext, useEffect, useState, useCallback } from 'react';
import Sidebar from '../../Components/Orgs/Sidebar';
import Topbar from '../../Components/Orgs/Topbar';
import OverviewPage from './OverviewPage';
import OrgsPage from './OrgsPage';
import UsersPage from './UsersPage';
import ActivityPage from './ActivityPage';
import PlansPage from './PlansPage';
import OrgContext from '../../Context/Organization/OrgContext';
import { ImSpinner9 } from 'react-icons/im';
import { Route, Routes, useLocation } from 'react-router-dom';
import Profile from '../Profile';
import EditProfile from '../EditProfile';
import SupportPage from './SupportPage';
import PageNotFound from '../PageNotFound';

// All valid super admin dashboard route paths
const ADMIN_KNOWN_PATHS = [
    "/", "/orgs", "/users", "/plans", "/activity",
    "/support", "/profile", "/editprofile",
];

const SuperAdminDashboard = () => {
    const [page, setPage] = useState('overview');
    const [pendingCount, setPendingCount] = useState(0);
    const [time, setTime] = useState(new Date());
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // This refreshTick is a simple way to trigger re-fetching of data in child components (like OverviewPage) after actions that change the data (e.g., approving an org, changing user status). Whenever we want to signal that data should be refreshed, we call triggerRefresh(), which increments refreshTick. We can then pass refreshTick
    const [refreshTick, setRefreshTick] = useState(0);
    const triggerRefresh = useCallback(() => setRefreshTick(t => t + 1), []);

    // OverviewPage still needs the full org list for its stat cards + widgets
    const [overviewOrgs, setOverviewOrgs] = useState([]);

    const { getAllOrganizations } = useContext(OrgContext);

    const location = useLocation();

    // Check if current path is unknown → show fullscreen 404
    const isNotFound = !ADMIN_KNOWN_PATHS.includes(location.pathname);

    // Live clock
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // Fetch orgs for overview + pending count on mount
    const fetchOverviewData = useCallback(async () => {
        setLoading(true);
        const result = await getAllOrganizations({ limit: 1000 });

        if (result.success) {
            setOverviewOrgs(result.orgs);
            setPendingCount(result.orgs.filter(o => o.status === 'pending').length);
        }
        setLoading(false);
    }, [getAllOrganizations]);

    useEffect(() => {
        fetchOverviewData();
    }, [fetchOverviewData, refreshTick]);

    // Loader component
    const Loader = () => (
        <div className="flex flex-col items-center justify-center h-full min-h-100">
            <ImSpinner9 className="animate-spin h-12 w-12 text-[#00C9A7] mb-4" />
            <p className="text-white/30 text-sm font-medium tracking-widest uppercase">
                Fetching Platform Data…
            </p>
        </div>
    );

    // ── Fullscreen 404 — no sidebar/topbar ────────────────────────────────
    if (isNotFound) {
        return <PageNotFound />;
    }

    return (
        <div className="min-h-screen flex overflow-hidden relative bg-[#121827]" style={{ color: '#E8EDF5' }}>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-50 lg:hidden"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}
                    onClick={() => setMobileOpen(false)}
                >
                    <div
                        className="absolute top-0 left-0 h-full"
                        style={{ animation: 'slideL .28s cubic-bezier(.22,1,.36,1) both' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <Sidebar
                            active={page} setActive={setPage}
                            collapsed={false} setCollapsed={() => { }}
                            isMobile={true} onClose={() => setMobileOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="sidebar-desktop">
                <Sidebar
                    active={page} setActive={setPage}
                    collapsed={collapsed} setCollapsed={setCollapsed}
                    isMobile={false}
                />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
                <Topbar
                    active={page}
                    time={time}
                    pendingCount={pendingCount}
                    onMenuToggle={() => setMobileOpen(o => !o)}
                />

                <main className="flex-1 overflow-y-auto px-5 py-6">
                    <div className="max-w-350 h-full mx-auto">
                        {loading ? (
                            <Loader />
                        ) : (
                            <Routes>
                                <Route path="/" element={<OverviewPage orgs={overviewOrgs} />} />
                                <Route path="/orgs" element={<OrgsPage onMutate={triggerRefresh} />} />
                                <Route path="/users" element={<UsersPage onMutate={triggerRefresh} />} />
                                <Route path="/plans" element={<PlansPage orgs={overviewOrgs} />} />
                                <Route path="/activity" element={<ActivityPage />} />
                                <Route path="/support" element={<SupportPage />} />

                                <Route path="/profile" element={<Profile />} />
                                <Route path="/editprofile" element={<EditProfile />} />
                            </Routes>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;