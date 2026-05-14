import React, { useContext, useState, useEffect } from 'react'
import AuthContext from '../../Context/Authentication/AuthContext';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import OrgContext from '../../Context/Organization/OrgContext';

// Navigation items with icons and labels
const ORG_NAV = [
    { id: "overview", label: "Overview", icon: "📊", path: "/" },
    { id: "queue", label: "Queue Manager", icon: "🎟️", path: "/queue" },
    { id: "services", label: "Service Rooms", icon: "🎛️", path: "/services" },
    { id: "analytics", label: "Analytics", icon: "📈", path: "/analytics" },
    { id: "support", label: "Support", icon: "🛠️", path: "/support" },
];

const ADMIN_NAV = [
    { id: "overview", label: "Overview", icon: "📊", path: "/" },
    { id: "orgs", label: "Organizations", icon: "🏢", path: "/orgs" },
    { id: "users", label: "Users", icon: "👥", path: "/users" },
    { id: "plans", label: "Plans & Revenue", icon: "💰", path: "/plans" },
    { id: "activity", label: "Activity Log", icon: "📋", path: "/activity" },
    { id: "support", label: "Support", icon: "🛠️", path: "/support" },
];

// Map org status to a short readable label + colour
const STATUS_META = {
    approved: { label: "Verified ✓", color: "#00C9A7" },
    pending: { label: "Pending Review", color: "#fbbf24" },
    rejected: { label: "Rejected", color: "#f43f5e" },
    suspended: { label: "Suspended", color: "#f97316" },
    scheduled_for_deletion: { label: "Deletion Scheduled", color: "#f43f5e" },
};

// Map org type to an emoji icon
const TYPE_ICON = {
    Hospital: "🏥",
    Bank: "🏦",
    Clinic: "🩺",
    Government: "🏛️",
    University: "🎓",
    Other: "🏢",
};

const Sidebar = ({ active, setActive, collapsed, setCollapsed, isMobile, onClose }) => {
    const showLabels = isMobile || !collapsed;
    const { userRole, username, email, orgId } = useContext(AuthContext);
    const { getOrganizationDetails } = useContext(OrgContext);

    const location = useLocation();

    const [orgData, setOrgData] = useState(null);

    const isAdmin = userRole === "admin";
    const isOrgRole = ['pending_org', 'approved_org', 'rejected_org', 'suspended_org'].includes(userRole);

    // Fetch org details once when sidebar mounts and the user is an org role
    useEffect(() => {
        if (!isOrgRole || !orgId) return;

        let cancelled = false;

        const fetchOrg = async () => {
            const result = await getOrganizationDetails(orgId);
            if (!cancelled && result.success) {
                setOrgData(result.org);
            }
        };

        fetchOrg();
        return () => { cancelled = true; };
    }, [isOrgRole, orgId, getOrganizationDetails]);

    const NAV_ITEMS = isAdmin ? ADMIN_NAV : ORG_NAV;

    // Determine active page based on current URL path
    const currentPath = location.pathname;

    // Determine which nav item is active based on current path

    // Admin
    const adminInitials = (username || 'SA').slice(0, 2).toUpperCase();
    const adminEmail = email || 'admin@smartqueue.io';

    // Org
    const orgName = orgData?.orgName || 'Your Organization';
    const orgType = orgData?.orgType || 'Other';
    const orgTypeIcon = TYPE_ICON[orgType] ?? '🏢';
    const orgStatusKey = orgData?.status || 'pending';
    const orgStatus = STATUS_META[orgStatusKey] ?? STATUS_META.pending;
    const orgLogo = orgData?.logo?.url || null;
    const orgInitials = orgName.slice(0, 2).toUpperCase();

    return (
        <aside
            className={`
                bg-[#0F172A] border-r border-white/5 flex flex-col overflow-hidden h-screen z-30
                ${isMobile ? 'relative w-60' : 'sticky top-0'}
                ${!isMobile && (collapsed ? 'w-18' : 'w-60')}
                ${!isMobile ? 'transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]' : 'transition-none'}
            `}
        >
            {/* Logo Section */}
            <div className="p-[20px_16px] border-b border-white/5 flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-[10px] ${isAdmin ? "bg-linear-to-br from-amber-400 to-amber-500" : "bg-linear-to-br from-[#00C9A7] to-[#4DA8DA]"} flex items-center justify-center font-['Space_Grotesk'] font-extrabold text-[18px] text-black shrink-0`}>
                    Q
                </div>
                {showLabels && (
                    <div className="min-w-0">
                        <div className="font-['Serif'] font-bold text-lg tracking-[-0.4px] text-[#E8EDF5] whitespace-nowrap">
                            SmartQueue
                        </div>

                        {isAdmin && (
                            <div className="text-[10px] text-amber-400/70 font-semibold tracking-[1.5px] uppercase">
                                Super Admin
                            </div>
                        )}

                        {isOrgRole && (
                            <div className="text-[10px] text-[#00C9A7]/70 font-semibold tracking-[1.5px] uppercase">
                                Organization
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Organisation Badge */}
            {showLabels && (
                isAdmin ? (
                    // Super Admin Badge (Yellow/Amber Theme)
                    <div className="mx-3 mt-3 mb-1 px-3 py-2.5 rounded-xl bg-amber-400/5 border border-amber-400/15 font-['Serif']">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[13px] font-bold text-black bg-linear-to-br from-amber-400 to-violet-400">
                                {adminInitials}
                            </div>
                            <div className="min-w-0">
                                <div className="text-[13px] capitalize font-semibold text-white truncate">
                                    {username || 'Super Admin'}
                                </div>
                                <div className="text-[11px] text-amber-400/60 truncate">
                                    {adminEmail}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : isOrgRole ? (
                    // Organization Badge (Teal Theme with status)
                    <div className="m-[12px_12px_4px] p-[10px_12px] bg-[#00C9A7]/5 border border-[#00C9A7]/20 rounded-xl font-serif">
                        <div className="flex items-center gap-2.5 mb-2">
                            {/* Live org logo or initials fallback */}
                            {orgLogo ? (
                                <img
                                    src={orgLogo}
                                    alt={orgName}
                                    className="w-8 h-8 rounded-lg object-cover shrink-0 border border-white/10"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[12px] font-bold text-black bg-linear-to-br from-[#00C9A7] to-[#4DA8DA] select-none">
                                    {orgInitials}
                                </div>
                            )}
                            <div className="min-w-0">
                                {/* Live org name from OrgContext */}
                                <div className="text-[13px] font-semibold text-[#E8EDF5] truncate">
                                    {orgName}
                                </div>
                                {/* Live org type + status */}
                                <div className="text-[11px] mt-px flex items-center gap-1">
                                    <span>{orgTypeIcon} {orgType}</span>
                                    <span className="mx-0.5 text-white/20">·</span>
                                    <span style={{ color: orgStatus.color }}>{orgStatus.label}</span>
                                </div>
                            </div>
                        </div>

                        {/* Username line below the card */}
                        <div className="text-[11px] text-white/35 truncate border-t border-white/6 pt-1.5 mt-0.5">
                            @{username || '—'}
                        </div>
                    </div>

                ) : null
            )}

            {/* Navigation */}
            <nav className="flex-1 p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar mt-2 font-['Serif']">
                {NAV_ITEMS.map((item) => {
                    const isActive = currentPath === item.path;

                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            onClick={isMobile ? onClose : undefined}
                            className={`
                                flex items-center group transition-all duration-200 rounded-xl border-none cursor-pointer w-full font-medium text-[14px] no-underline
                                ${showLabels ? 'px-4 py-3 gap-3 justify-start' : 'p-3 justify-center'}
                                ${isActive
                                    ? (isAdmin ? "text-amber-400 bg-amber-400/10 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.2)]" : "text-[#00C9A7] bg-[#00C9A7]/10 shadow-[inset_0_0_0_1px_rgba(0,201,167,0.2)]")
                                    : 'text-white/40 hover:bg-white/3 hover:text-white/70'}
                            `}
                        >
                            <span className={`text-xl shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                                {item.icon}
                            </span>
                            {showLabels && (
                                <span className="whitespace-nowrap tracking-tight">
                                    {item.label}
                                </span>
                            )}

                            {showLabels && isActive && (
                                <div className={`ml-auto w-1 h-4 rounded-full ${isAdmin ? "bg-amber-400" : "bg-teal-400"}`} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Toggle Button — Desktop Only */}
            {!isMobile && (
                <button
                    onClick={() => setCollapsed((c) => !c)}
                    className="m-[8px_12px_16px] p-2 rounded-[10px] border border-white/10 bg-white/5 text-white/50 cursor-pointer text-[16px] transition-all hover:bg-white/10 hover:text-white"
                >
                    {collapsed ? "→" : "←"}
                </button>
            )}
        </aside>
    );
}

export default Sidebar
