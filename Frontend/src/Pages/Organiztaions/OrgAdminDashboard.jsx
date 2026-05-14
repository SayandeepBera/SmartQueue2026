import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ImSpinner9 } from 'react-icons/im';

import Sidebar from '../../Components/Orgs/Sidebar';
import Topbar from '../../Components/Orgs/Topbar';
import OverviewPage from './OverviewPage';
import QueuePage from './QueuePage';
import ServicesPage from './ServicesPage';
import AnalyticsPage from './AnalyticsPage';
import Profile from '../Profile';
import EditProfile from '../EditProfile';
import AddServiceModal from '../../Components/Orgs/AddServiceModal';

import AuthContext from '../../Context/Authentication/AuthContext';
import ServicesContext from '../../Context/Services/ServicesContext';
import Support from '../Support';
import MyHistoryPage from '../MyHistoryPage';
import PageNotFound from '../PageNotFound';
import OrgStatusGate from "./OrgStatusGate";

const ACTIVITY_POLL = 30000;
const STATS_POLL = 60000;

// All valid org dashboard route paths
const ORG_KNOWN_PATHS = [
  "/", "/queue", "/services", "/analytics",
  "/support", "/profile", "/editprofile", "/history",
];

const OrgAdminDashboard = () => {
  const { getServices, getQueue, getActivityLogs } = useContext(ServicesContext);
  const { orgId, userRole } = useContext(AuthContext);
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [page, setPage] = useState("overview");
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [services, setServices] = useState([]);
  const [queue, setQueue] = useState([]);
  const [activity, setActivity] = useState([]);

  // Check if current path is unknown → show fullscreen 404
  const isNotFound = !ORG_KNOWN_PATHS.includes(location.pathname);

  // ── Clock ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Close mobile sidebar on desktop resize ────────────────────────────
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // ── Fetch activity logs ───────────────────────────────────────────────
  const fetchActivity = useCallback(async () => {
    if (!orgId) return;
    const result = await getActivityLogs(orgId, 20);
    if (result.success) setActivity(result.activity);
  }, [orgId, getActivityLogs]);

  // ── Fetch services ────────────────────────────────────────────────────
  const fetchInitialData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const svcResult = await getServices(orgId);
    if (svcResult.success) {
      setServices(svcResult.services);
      if (svcResult.services.length === 0) { setLoading(false); return; }
      const first = svcResult.services.find(s => s.isActive);
      if (first) {
        const qResult = await getQueue(first._id);
        if (qResult.success) setQueue(qResult.queue);
      }
    } else {
      toast.error(svcResult.error || 'Failed to load services', { theme: 'colored' });
    }
    setLoading(false);
  }, [orgId, getServices, getQueue]);

  const fetchServicesOnly = useCallback(async () => {
    if (!orgId) return;
    const svcResult = await getServices(orgId);
    if (svcResult.success) setServices(svcResult.services);
  }, [orgId, getServices]);

  useEffect(() => { fetchInitialData(); fetchActivity(); }, [fetchInitialData, fetchActivity]);

  useEffect(() => {
    const interval = setInterval(() => fetchActivity(), ACTIVITY_POLL);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  useEffect(() => {
    const id = setInterval(fetchServicesOnly, STATS_POLL);
    return () => clearInterval(id);
  }, [fetchServicesOnly]);

  const handleAdded = (newSvc) => { setServices(prev => [...prev, newSvc]); fetchActivity(); };
  const handleAddedFromTopbar = (newSvc) => { setServices(prev => [...prev, newSvc]); toast.success(`${newSvc.name} has been Created successfully`, { theme: 'colored' }); fetchActivity(); };
  const handleEdited = (updatedSvc) => { setServices(prev => prev.map(s => s._id === updatedSvc._id ? updatedSvc : s)); fetchActivity(); };
  const handleDeleted = (deletedId) => { setServices(prev => prev.filter(s => s._id !== deletedId)); fetchActivity(); };

  const Loader = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-80">
      <ImSpinner9 className="animate-spin h-11 w-11 text-[#00C9A7] mb-4" />
      <p className="text-white/30 text-sm font-medium tracking-widest uppercase">Loading dashboard…</p>
    </div>
  );

  // ── Fullscreen 404 — no sidebar/topbar ────────────────────────────────
  if (isNotFound) {
    return <PageNotFound />;
  }

  // Org status gate: only allow approved_org to access most pages 
  const SUPPORT_ONLY_PATHS = ["/support", "/profile", "/editprofile", "/history"];
  if (userRole !== "approved_org" && !SUPPORT_ONLY_PATHS.includes(location.pathname)) {
    return <OrgStatusGate />;
  }

  return (
    <div className="min-h-screen flex overflow-hidden relative bg-[#121827]" style={{ color: "#E8EDF5" }}>

      {/* Ambient blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full anim-blobA" style={{ top: "-20%", left: "-10%", width: 600, height: 600, background: "radial-gradient(circle,rgba(0,201,167,0.06) 0%,transparent 65%)" }} />
        <div className="absolute rounded-full anim-blobB" style={{ bottom: "-10%", right: "-5%", width: 500, height: 500, background: "radial-gradient(circle,rgba(132,94,194,0.06) 0%,transparent 65%)" }} />
      </div>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }} onClick={() => setMobileOpen(false)}>
          <div className="absolute top-0 left-0 h-full anim-slideInL" onClick={e => e.stopPropagation()}>
            <Sidebar active={page} setActive={setPage} collapsed={false} setCollapsed={() => { }} isMobile={true} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="sidebar-desktop">
        <Sidebar active={page} setActive={setPage} collapsed={collapsed} setCollapsed={setCollapsed} isMobile={false} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-1 min-w-0">
        <Topbar active={page} time={time} onAddService={() => setShowAddModal(true)} onMenuToggle={() => setMobileOpen(o => !o)} />

        <main className="flex-1 overflow-y-auto px-5 py-6">
          <div className="max-w-350 h-full mx-auto">
            {loading ? <Loader /> : (
              <Routes>
                <Route path="/" element={<OverviewPage services={services} queue={queue} activity={activity} />} />
                <Route path="/queue" element={<QueuePage services={services} setServices={setServices} activity={activity} onAction={fetchActivity} onRefreshServices={fetchInitialData} />} />
                <Route path="/services" element={<ServicesPage orgId={orgId} onAdded={handleAdded} onEdited={handleEdited} onDeleted={handleDeleted} />} />
                <Route path="/analytics" element={<AnalyticsPage orgId={orgId} services={services} />} />
                <Route path="/support" element={<Support />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/editprofile" element={<EditProfile />} />
                <Route path="/history" element={<MyHistoryPage />} />
              </Routes>
            )}
          </div>
        </main>
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <AddServiceModal orgId={orgId} onClose={() => setShowAddModal(false)} onAdded={handleAddedFromTopbar} />
      )}
    </div>
  );
};

export default OrgAdminDashboard;