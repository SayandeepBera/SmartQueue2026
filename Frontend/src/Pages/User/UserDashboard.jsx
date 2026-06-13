import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import StatsRow from '../../Components/User/StatsRow';
import BrowseServices from '../../Components/User/BrowseServices';
import LiveOrgMap from '../../Components/User/LiveOrgMap';
import HowItWorks from '../../Components/User/HowItWorks';
import BottomSection from '../../Components/User/BottomSection';
import BookingModal from '../../Components/User/BookingModal';
import { buildBookedData, broadcastBooking } from '../../Components/User/BookingModal';
import ActiveTokenPanel from '../../Components/User/ActiveTokenPanel';
import AuthContext from '../../Context/Authentication/AuthContext';
import OrgsRegistration from '../../Components/OrgsRegistration';
import ServicesContext from '../../Context/Services/ServicesContext';
import HeroCard1 from '../../Components/User/HeroCard1';
import HeroCard2 from '../../Components/User/HeroCard2';

const UserDashboard = () => {
    const [orgFilter, setOrgFilter] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [booked, setBooked] = useState(null);
    const { username, authToken, userId } = useContext(AuthContext);
    const servicesRef = useRef(null);
    const mapRef = useRef(null);

    const [filters, setFilters] = useState({
        search: "",
        category: "All",
        area: "All Areas",
        sort: "default",
        onlyAvail: false,
        maxWait: 999
    });

    const { getFeaturedServices, getMyActiveTokens } = useContext(ServicesContext);

    // Hero Card 1: Featured Services
    const [featuredServices, setFeaturedServices] = useState([]);
    const [serviceIdx, setServiceIdx] = useState(0);
    const [card1Visible, setCard1Visible] = useState(true);

    // Hero Card 2: User's Active Tokens
    const [activeTokens, setActiveTokens] = useState([]);
    const [tokenIdx, setTokenIdx] = useState(0);
    const [card2Visible, setCard2Visible] = useState(true);

    useEffect(() => {
        setTimeout(() => setMounted(true), 60);
    }, []);

    // Restore active token from localStorage on page reload
    useEffect(() => {
        try {
            const saved = localStorage.getItem("sq_active_token");
            if (saved) setBooked(JSON.parse(saved));
        } catch (_) { }
    }, []);

    // ── Listen for bookings from ANY page (ServicesPage, BrowseServices, etc.) ──
    useEffect(() => {
        const handler = (e) => {
            if (e.detail) setBooked(e.detail);
        };
        window.addEventListener("sq:tokenBooked", handler);
        return () => window.removeEventListener("sq:tokenBooked", handler);
    }, []);

    // Fetch featured services for Hero Card 1, with auto-refresh every 5 minutes
    useEffect(() => {
        const fetch = async () => {
            const result = await getFeaturedServices();

            if (result.success && result.services.length > 0) {
                setFeaturedServices(result.services);
            }
        };

        fetch();

        // Refresh featured services every 5 minutes
        const interval = setInterval(fetch, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [getFeaturedServices]);

    // Fetch user's active tokens for Hero Card 2, with auto-refresh every 1 minute
    const fetchMyTokens = useCallback(async () => {
        if (!authToken) return;

        const result = await getMyActiveTokens();

        if (result.success) {
            setActiveTokens(result.tokens);
        }
    }, [authToken, getMyActiveTokens]);

    useEffect(() => {
        fetchMyTokens();

        // Refresh active tokens every 30 seconds to keep in sync with any changes
        const interval = setInterval(fetchMyTokens, 30_000);
        return () => clearInterval(interval);
    }, [fetchMyTokens]);

    // Whenever a new booking is made (either from this page or elsewhere), refresh the active tokens to reflect the new booking
    useEffect(() => {
        if (booked) {
            fetchMyTokens(); // Refresh active tokens after a new booking
        }
    }, [booked, fetchMyTokens]);

    // Cycle through featured services for Hero Card 1 every 4 seconds, with a fade transition
    useEffect(() => {
        if (featuredServices.length <= 1) {
            return; // No services to display
        }

        // Set up interval to cycle through featured services every 4 seconds
        const interval = setInterval(() => {
            setCard1Visible(false);
            setTimeout(() => {
                setServiceIdx((idx) => (idx + 1) % featuredServices.length);
                setCard1Visible(true);
            }, 500);
        }, 4500); // Change service every 4 seconds

        return () => clearInterval(interval);
    }, [featuredServices.length]);

    // Cycle through user's active tokens for Hero Card 2 every 3.5 seconds, with a fade transition
    useEffect(() => {
        if (activeTokens.length <= 1) {
            return; // No need to cycle if 0 or 1 tokens
        }

        // Set up interval to cycle through active tokens every 3.5 seconds
        const interval = setInterval(() => {
            setCard2Visible(false);
            setTimeout(() => {
                setTokenIdx((idx) => (idx + 1) % activeTokens.length);
                setCard2Visible(true);
            }, 350);
        }, 3500); // Change token every 3.5 seconds

        return () => clearInterval(interval);
    }, [activeTokens.length]);

    // Called by BrowseServices when an org is selected
    const handleOrgBrowse = id => {
        setOrgFilter(id);
        setFilters(f => ({ ...f, category: "All", area: "All Areas", search: "" }));
        setTimeout(() => {
            servicesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
    };

    // Called by BookingModal after successful booking
    const handleConfirm = ({ name, token }) => {
        const bookedData = buildBookedData(selected, token, name);
        broadcastBooking(bookedData);   // saves to localStorage + fires event
        setBooked(bookedData);
        setModalOpen(false);
    };

    const handleDismissToken = () => {
        setBooked(null);
        localStorage.removeItem("sq_active_token");
    };

    // Get the currently displayed featured service and active token based on the current indices
    const currentService = featuredServices[serviceIdx] || null;
    const currentToken = activeTokens[tokenIdx] || null;

    // Calculate occupancy percentage for the current featured service to visualize in Hero Card 1
    const occupancyPct = currentService
        ? Math.min(100, Math.round((currentService.currentQueue / (currentService.maxQueueSize || 50)) * 100))
        : 65; // fallback for skeleton state

    const occupancyColor = occupancyPct < 50 ? "#00C9A7" : occupancyPct < 80 ? "#fbbf24" : "#f43f5e";

    const cardTransition = (visible) => ({
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px) scale(1)" : "translateY(-20px) scale(0.95)",
        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
    });

    return (
        <div className="min-h-screen px-1.25 py-17.5">

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <div className="relative min-h-[70vh] flex flex-col justify-center mb-16 pt-10">

                {/* Background glows */}
                <div className="absolute top-0 right-0 w-125 h-125 bg-[#00C9A7]/5 blur-[120px] rounded-full -z-10 animate-pulse" />
                <div className="absolute -bottom-20 -left-20 w-100 h-100 bg-[#845EC2]/5 blur-[100px] rounded-full -z-10" />

                <div className="grid lg:grid-cols-[1.2fr_1fr] items-center gap-12">

                    {/* Left: Heading */}
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/3 border border-white/10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C9A7] opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C9A7]" />
                            </span>
                            <span className="text-[10px] font-bold tracking-[2px] uppercase text-white/50">
                                {username ? (
                                    <>Welcome back, <span className="text-white">{username}</span>
                                        <span className="mx-2 text-white/10">|</span>
                                        <span className="text-[#00C9A7]">Live Sync Active</span></>
                                ) : (
                                    <>Mode: <span className="text-white/80">Guest Discovery</span>
                                        <span className="mx-2 text-white/10">|</span>
                                        <span className="text-[#00C9A7]">System Operational</span></>
                                )}
                            </span>
                        </div>

                        <h1
                            className="text-6xl md:text-8xl font-extrabold tracking-[-4px] leading-[0.9] mb-8"
                            style={{ fontFamily: "serif, fangsong" }}
                        >
                            <span className="hero-word" style={{ animationDelay: "0s" }}>Skip&nbsp;</span>
                            <span className="hero-word" style={{ animationDelay: "0.08s" }}>the&nbsp;</span>
                            <span className="hero-word" style={{ animationDelay: "0.16s" }}>wait,&nbsp;</span>
                            <span className="shimmer hero-word" style={{ animationDelay: "0.24s" }}>anywhere.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/40 max-w-lg leading-relaxed mb-10 font-medium">
                            The modern standard for digital entry. Secure your spot in any queue with a single tap,
                            <span className="text-white/80"> powered by SmartQueue Real-Time Sync.</span>
                        </p>

                        <div className="flex flex-wrap items-center gap-5">
                            <button
                                onClick={() => servicesRef.current?.scrollIntoView({ behavior: "smooth" })}
                                className="px-10 py-3.5 rounded-2xl bg-[#00C9A7] text-black font-extrabold text-[15px] hover:bg-[#00C9A7]/80 hover:scale-105 transition-all duration-300 shadow-[0_20px_40px_rgba(0,201,167,0.2)]"
                            >
                                Book a Token
                            </button>
                            <button
                                className="group flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-[15px] hover:bg-white/10 transition-all"
                                onClick={() => mapRef.current?.scrollIntoView({ behavior: "smooth" })}
                            >
                                Explore Map
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Floating Data Cards */}
                    <div className="hidden lg:block relative h-100">

                        {/* ── Card 1: Live Service Counter (cycles through active services) ── */}
                        <HeroCard1 currentService={currentService} card1Visible={card1Visible} featuredServices={featuredServices} serviceIdx={serviceIdx} occupancyPct={occupancyPct} occupancyColor={occupancyColor} cardTransition={cardTransition} />

                        {/* ── Card 2: Personal Token (cycles or shows guest/empty state) ── */}
                        <HeroCard2 card2Visible={card2Visible} authToken={authToken} activeTokens={activeTokens} currentToken={currentToken} cardTransition={cardTransition} tokenIdx={tokenIdx} />

                        {/* ── Card 3: System Analytics (static) ── */}
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 p-5 glass rounded-3xl animate-float"
                            style={{
                                animationDelay: '0.7s',
                                border: '1px solid rgba(132,94,194,0.3)',
                                background: 'linear-gradient(135deg, rgba(132,94,194,0.1), transparent)'
                            }}
                        >
                            <p className="text-[10px] text-white/30 font-bold uppercase mb-2">Wait Time Reduced</p>
                            <p className="text-3xl font-bold text-[#845EC2]">-42%</p>
                            <div className="mt-3 flex gap-1 items-end">
                                {[4, 8, 12, 16, 20].map((h, i) => (
                                    <div
                                        key={i}
                                        className="w-1 bg-[#845EC2]/40 rounded-full"
                                        style={{ height: `${h}px` }}
                                    />
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Stats row */}
            <StatsRow />

            {/* Active Token Panel */}
            <ActiveTokenPanel booked={booked} onDismiss={handleDismissToken} />

            {/* Browse services */}
            <div ref={servicesRef}>
                <BrowseServices
                    orgFilter={orgFilter} setOrgFilter={setOrgFilter}
                    filters={filters} setFilters={setFilters}
                    setSelected={setSelected} setModalOpen={setModalOpen}
                />
            </div>

            {/* Live Org Map */}
            <div ref={mapRef}>
                <LiveOrgMap onBookOrg={handleOrgBrowse} />
            </div>

            {/* Org Registration */}
            <OrgsRegistration />

            {/* How It Works */}
            <HowItWorks />

            {/* Bottom Section */}
            <BottomSection />

            {/* Booking Modal */}
            {modalOpen && (
                <BookingModal
                    selected={selected}
                    onClose={() => setModalOpen(false)}
                    onConfirm={handleConfirm}
                />
            )}
        </div>
    );
};

export default UserDashboard;