import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import AuthContext from '../Context/Authentication/AuthContext';
import Footer from './Footer';

const Layout = ({ children }) => {
    const location = useLocation();
    const { userRole } = useContext(AuthContext);

    const isAdmin = userRole === "admin";
    const isApprovedOrg = userRole === "approved_org";
    const isNonApprovedOrg = (
        userRole === "pending_org" ||
        userRole === "rejected_org" ||
        userRole === "suspended_org"
    );
    const isSuspendedUser = userRole === "suspended_user";

    // Org dashboard known paths
    const orgKnownPaths = [
        "/", "/queue", "/services", "/analytics",
        "/support", "/profile", "/editprofile", "/history",
    ];

    // User known paths
    const userKnownPaths = [
        "/", "/organizations", "/services", "/my-tokens",
        "/support", "/profile", "/editprofile", "/history", "/login",
    ];

    // Routes where footer is hidden for approved org admins
    const hideFooterApprovedOrgRoutes = [
        "/profile", "/editprofile", "/history",
    ];

    // Routes where footer is hidden for regular users
    const hideFooterUserRoutes = [
        "/login", "/register", "/profile", "/editprofile", "/history",
    ];

    let hideFooter = false;

    if (isAdmin) {
        // Admins never see the footer
        hideFooter = true;

    } else if (isNonApprovedOrg) {
        // Pending / rejected / suspended orgs → OrgStatusGate takes the whole screen
        // Footer should never appear for these statuses
        hideFooter = true;

    } else if (isSuspendedUser) {
        // Suspended users → SuspendedUserPage takes the whole screen
        hideFooter = true;

    } else if (isApprovedOrg) {
        // Approved orgs: hide footer on specific routes or unknown paths (404)
        const isUnknown = !orgKnownPaths.includes(location.pathname);
        hideFooter = isUnknown || hideFooterApprovedOrgRoutes.includes(location.pathname);

    } else {
        // Regular users / guests: hide footer on auth/profile routes or unknown paths (404)
        const isUnknown = !userKnownPaths.includes(location.pathname);
        hideFooter = isUnknown || hideFooterUserRoutes.includes(location.pathname);
    }

    return (
        <>
            {children}

            {!hideFooter && <Footer />}
        </>
    );
};

export default Layout;