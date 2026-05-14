import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RevealSection from '../../Hooks/RevealSection';
import FilterBar from '../../Components/User/FilterBar';
import ServicesGrid from '../../Components/User/ServicesGrid';
import BookingModal, { buildBookedData, broadcastBooking } from '../../Components/User/BookingModal';
import PublicContext from '../../Context/Public/PublicContext';

const ITEMS_PER_PAGE = 12;

const ServicesPage = () => {
    const navigate = useNavigate();
    const { getPublicServices, getPublicFilters } = useContext(PublicContext);

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [dynamicFilters, setDynamicFilters] = useState(null);
    const [selected, setSelected] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const topRef = useRef();

    const [filters, setFilters] = useState({
        search: "",
        category: "All",
        area: "All Areas",
        sort: "default",
        onlyAvail: false,
        maxWait: 999,
    });

    // Fetch dynamic filter options
    useEffect(() => {
        const load = async () => {
            const result = await getPublicFilters();
            if (result.success) setDynamicFilters({ categories: result.categories, areas: result.areas });
        };
        load();
    }, []);

    // Fetch services whenever filters or page changes
    const fetchServices = useCallback(async (page = 1) => {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const params = {
            page,
            limit: ITEMS_PER_PAGE,
            sort: filters.sort,
            onlyAvail: filters.onlyAvail,
            maxWait: filters.maxWait,
        };
        if (filters.search) params.search = filters.search;
        if (filters.category !== "All") params.category = filters.category;
        if (filters.area !== "All Areas") params.area = filters.area;

        const result = await getPublicServices(params);
        if (result.success) {
            setServices(result.services);
            setTotal(result.total);
            setPages(result.pages || 1);
        } else {
            setServices([]);
            setTotal(0);
            setPages(1);
        }
        setLoading(false);
    }, [filters, getPublicServices]);

    useEffect(() => {
        setCurrentPage(1);
        fetchServices(1);
    }, [filters]);

    const handlePageChange = (p) => {
        setCurrentPage(p);
        fetchServices(p);
    };

    const showClear = filters.search || filters.category !== "All" || filters.area !== "All Areas" || filters.onlyAvail || filters.maxWait !== 999;
    const clearAll = () => setFilters({ search: "", category: "All", area: "All Areas", sort: "default", onlyAvail: false, maxWait: 999 });

    // When a booking is confirmed in ServicesPage, persist + broadcast so dashboard updates
    const handleConfirm = ({ name, token }) => {
        if (selected) {
            const bookedData = buildBookedData(selected, token, name);
            broadcastBooking(bookedData);
        }
        setModalOpen(false);
    };

    return (
        <div className="min-h-screen px-1.25 py-17.5" ref={topRef}>
            {/* Page header */}
            <RevealSection delay={0}>
                <header className="relative mb-10 overflow-hidden">
                    {/* 1. Navigation & Breadcrumbs */}
                    <nav className="flex items-center gap-4 mb-6 anim-fadeUp" style={{ animationDelay: '0s' }}>
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-all"
                            style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                            <span className="flex items-center justify-center w-8 h-8 rounded-full border border-white/5 bg-white/2 group-hover:bg-[#00C9A7]/10 group-hover:border-[#00C9A7]/20 group-hover:text-[#00C9A7] transition-all">
                                ←
                            </span>
                            Back
                        </button>
                        <div className="h-4 w-px bg-white/10" />
                    </nav>

                    {/* 2. Main Title & Meta Row */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="anim-fadeUp" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="px-2.5 py-1 rounded-md bg-[#00C9A7]/10 border border-[#00C9A7]/20 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00C9A7] animate-pulse" />
                                    <span className="text-[10px] font-bold text-[#00C9A7] tracking-wider uppercase">Live Directory</span>
                                </div>
                                {filters.category !== "All" && (
                                    <span className="text-[10px] font-bold text-white/30 tracking-wider uppercase">
                                        Sorted by {filters.category}
                                    </span>
                                )}
                            </div>

                            <h1 className="font-extrabold tracking-[-1.5px] leading-tight"
                                style={{
                                    fontFamily: "'serif', fangsong",
                                    fontSize: "clamp(32px, 5vw, 56px)",
                                    background: "linear-gradient(to bottom, #FFFFFF 0%, #94A3B8 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}>
                                Discover <span className="shimmer">Services</span>
                            </h1>

                            <p className="mt-2 text-white/40 text-sm max-w-lg leading-relaxed">
                                Browse through registered organizations and check live wait times.
                                Secure your spot in the digital queue with a single tap.
                            </p>
                        </div>

                        {/* 3. Dynamic Results Counter Widget */}
                        <div className="anim-fadeUp shrink-0" style={{ animationDelay: '0.2s' }}>
                            <div className="px-5 py-4 rounded-2xl bg-white/2 border border-white/5 backdrop-blur-md flex items-center gap-5">
                                <div className="text-right">
                                    <div className="text-xs text-white/20 font-medium uppercase tracking-tighter mb-1">Total Available</div>
                                    <div className="text-2xl font-bold text-white tabular-nums">
                                        {loading ? "—" : total}
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div className="flex -space-x-2">
                                    {/* Visual representation of service icons */}
                                    {['🏥', '🏦', '🏛️'].map((emoji, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full bg-[#1A2235] border border-[#121827] flex items-center justify-center text-sm">
                                            {emoji}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Background Element */}
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#00C9A7]/5 blur-[100px] pointer-events-none" />
                </header>
            </RevealSection>

            {/* Filter bar — full mode with area chips inside */}
            <FilterBar
                filters={filters}
                setFilters={setFilters}
                total={total}
                filtered={services.length}
                compact={false}
                dynamicFilters={dynamicFilters}
            />

            {/* Results summary */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <p className="text-sm text-white/40">
                    {loading ? "Loading…" : `Showing ${services.length} of ${total} service${total !== 1 ? "s" : ""}`}
                    {currentPage > 1 ? ` · Page ${currentPage} of ${pages}` : ""}
                </p>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid gap-5 mb-14 py-6" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                        <div key={i} className="glass rounded-[20px] p-6 animate-pulse"
                            style={{ minHeight: 220, animationDelay: `${i * 0.04}s` }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-4 w-24 rounded-md" style={{ background: "rgba(255,255,255,0.07)" }} />
                                <div className="h-4 w-12 rounded-md ml-auto" style={{ background: "rgba(255,255,255,0.07)" }} />
                            </div>
                            <div className="flex gap-3 mb-3">
                                <div className="w-12 h-12 rounded-[14px]" style={{ background: "rgba(255,255,255,0.07)" }} />
                                <div className="flex-1">
                                    <div className="h-4 w-32 rounded mb-2" style={{ background: "rgba(255,255,255,0.07)" }} />
                                    <div className="h-3 w-20 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
                                </div>
                            </div>
                            <div className="h-3 w-48 rounded mb-4" style={{ background: "rgba(255,255,255,0.05)" }} />
                            <div className="flex justify-between items-center">
                                <div className="h-8 w-20 rounded" style={{ background: "rgba(255,255,255,0.07)" }} />
                                <div className="h-9 w-28 rounded-xl" style={{ background: "rgba(255,255,255,0.07)" }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <ServicesGrid
                    services={services}
                    onBook={s => { setSelected(s); setModalOpen(true); }}
                />
            )}

            {/* Pagination */}
            {!loading && pages > 1 && (
                <div className="flex justify-center items-center gap-2 mb-12 flex-wrap">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="btn px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-30"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8EDF5" }}
                    >← Prev</button>

                    {Array.from({ length: pages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === pages || Math.abs(p - currentPage) <= 2)
                        .reduce((acc, p, idx, arr) => {
                            if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...');
                            acc.push(p);
                            return acc;
                        }, [])
                        .map((p, i) =>
                            p === '...' ? (
                                <span key={`ellipsis-${i}`} className="text-white/25 px-2">…</span>
                            ) : (
                                <button
                                    key={p}
                                    onClick={() => handlePageChange(p)}
                                    className="btn w-9 h-9 rounded-xl text-sm font-bold"
                                    style={{
                                        background: p === currentPage ? "rgba(0,201,167,0.2)" : "rgba(255,255,255,0.05)",
                                        border: `1px solid ${p === currentPage ? "rgba(0,201,167,0.5)" : "rgba(255,255,255,0.1)"}`,
                                        color: p === currentPage ? "#00C9A7" : "#E8EDF5"
                                    }}
                                >{p}</button>
                            )
                        )
                    }

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pages}
                        className="btn px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-30"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8EDF5" }}
                    >Next →</button>
                </div>
            )}

            {/* Booking modal */}
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

export default ServicesPage;