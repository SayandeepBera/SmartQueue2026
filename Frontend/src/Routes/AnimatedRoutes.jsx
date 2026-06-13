import React, { useState, useContext, useEffect } from 'react'
import AuthContext from '../Context/Authentication/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import OrgAdminDashboard from '../Pages/Organiztaions/OrgAdminDashboard';
import { ToastContainer, toast } from "react-toastify";
import AuthPage from '../Pages/AuthPage';
import Navbar from '../Components/Navbar';
import { AnimatePresence, m } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import UserDashboard from '../Pages/User/UserDashboard';
import SuperAdminDashboard from '../Pages/Admin/SuperAdminDashboard';
import BecomeAOrganization from '../Pages/User/BecomeAOrganization';
import Profile from '../Pages/Profile';
import EditProfile from '../Pages/EditProfile';
import ServicesPage from '../Components/User/ServicesPage';
import MyTokensPage from '../Components/User/MyTokensPage';
import Support from '../Pages/Support';
import MyHistoryPage from '../Pages/MyHistoryPage';
import PageNotFound from '../Pages/PageNotFound';
import SuspendedUserPage from '../Pages/User/SuspendedUserPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Log an error if the Google Client ID is missing
if (!GOOGLE_CLIENT_ID) {
    console.error('Missing VITE_GOOGLE_CLIENT_ID environment variable');
}

const GoogleAuthWrapper = () => (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthPage />
    </GoogleOAuthProvider>
);

// Custom hook to show session expired notice if redirected with ?reason=session_expired
const useSessionExpiredNotice = () => {
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const reason = params.get('reason');

        if (reason === 'session_expired') {
            // Small delay so the page and ToastContainer are fully mounted
            const id = setTimeout(() => {
                toast.warn(
                    "Your session has expired. Please sign in again to continue.",
                    {
                        toastId: "session_expired", // prevent duplicates
                        autoClose: 5000,
                        theme: "colored",
                        icon: "🔒",
                    }
                );

                // Clean the query param from the URL without reloading
                const clean = window.location.pathname;
                window.history.replaceState({}, '', clean);
            }, 300);

            return () => clearTimeout(id);
        }
    }, [location.search]);
};

// Component to show for suspended users when they try to access support page
const SuspendedSupportShell = () => (
    <main className="bg-[#121827] text-white min-h-screen px-4 py-4 font-[fangsong]">
        <Support />
    </main>
);

const AnimatedRoutes = () => {
    const { userRole } = useContext(AuthContext);

    // Use the custom hook to handle session expired notices
    useSessionExpiredNotice();

    const isOrgs = userRole === "pending_org" || userRole === "approved_org" || userRole === "rejected_org" || userRole === "suspended_org";
    const isAdmin = userRole === "admin";
    const isSuspendedUser = userRole === "suspended_user";

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                pauseOnHover={false}
                theme="colored"
            />

            <AnimatePresence mode='wait'>
                <Routes>
                    {/* For Admin */}
                    {isAdmin && (
                        <Route path="/*" element={<SuperAdminDashboard />} />
                    )}

                    {/* For Orgs */}
                    {isOrgs && (
                        <Route path="/*" element={<OrgAdminDashboard />} />
                    )}

                    {/* For Suspended Users */}
                    {isSuspendedUser && (
                        <>
                            <Route path="/support" element={<SuspendedSupportShell />} />
                            <Route path="/login" element={<GoogleAuthWrapper />} />
                            <Route path="/*" element={<SuspendedUserPage />} />
                        </>
                    )}

                    <Route path="/*" element={
                        <>
                            <Navbar />
                            <main className="bg-[#121827] text-white min-h-screen px-4 py-4 font-[fangsong]">
                                <Routes>
                                    <Route path="/" element={<UserDashboard />} />
                                    <Route path="/organizations" element={<BecomeAOrganization />} />
                                    <Route path="/services" element={<ServicesPage />} />
                                    <Route path="/my-tokens" element={<MyTokensPage />} />
                                    <Route path="/support" element={<Support />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/editprofile" element={<EditProfile />} />
                                    <Route path="/history" element={<MyHistoryPage />} />
                                    <Route path="/login" element={<GoogleAuthWrapper />} />

                                    <Route path="*" element={<PageNotFound />} />
                                </Routes>
                            </main>
                        </>
                    } />
                </Routes>
            </AnimatePresence>

        </>
    );
}

export default AnimatedRoutes
