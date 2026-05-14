import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import RevealSection from '../../Hooks/RevealSection';
import ServicesGrid from './ServicesGrid';
import PublicContext from '../../Context/Public/PublicContext';

const BrowseServices = ({ orgFilter, setOrgFilter, filters, setFilters, setSelected, setModalOpen }) => {
    const navigate = useNavigate();
    const { getFeaturedServices } = useContext(PublicContext);

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchText, setSearchText] = useState("");

    // Fetch featured services
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            const result = await getFeaturedServices(16);
            if (!cancelled) {
                setServices(result.success ? result.services : []);
                setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [getFeaturedServices]);

    // Debounce search input
    useEffect(() => {
        const t = setTimeout(() => setFilters(f => ({ ...f, search: searchText })), 300);
        return () => clearTimeout(t);
    }, [searchText, setFilters]);

    // Filter logic
    useEffect(() => {
        let list = [...services];
        if (orgFilter) {
            list = list.filter(s => (s.orgId?._id || s.orgId) === orgFilter);
        }
        if (filters.search?.trim()) {
            const q = filters.search.toLowerCase();
            list = list.filter(s => 
                s.name?.toLowerCase().includes(q) || 
                s.org?.orgName?.toLowerCase().includes(q)
            );
        }
        setFilteredServices(list);
    }, [services, orgFilter, filters]);

    const orgName = orgFilter 
        ? services.find(s => (s.orgId?._id || s.orgId) === orgFilter)?.org?.orgName 
        : null;

    return (
        <div className="py-8">
            {/* --- Enhanced Professional Header --- */}
            <div className="relative mb-12 overflow-hidden">
                <RevealSection delay={0.1}>
                    <div className="flex flex-col items-center text-center">
                        {/* Decorative Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C9A7] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C9A7]"></span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-white/50">
                                {orgFilter ? "Organization Services" : "Live Marketplace"}
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4" 
                            style={{ fontFamily: "'serif', fangsong", lineHeight: 1.2 }}>
                            {orgFilter ? (
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
                                    {orgName || "Loading..."}
                                </span>
                            ) : (
                                <>
                                    Queue <span style={{ color: "#00C9A7" }}>Smarter</span>
                                </>
                            )}
                        </h2>

                        {/* Integrated Minimal Search Bar */}
                        <div className="relative w-full max-w-md mt-2 group">
                            <div className="absolute inset-0 bg-[#00C9A7]/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <div className="relative flex items-center glass rounded-2xl border border-white/10 px-4 py-2.5 transition-all duration-300 focus-within:border-[#00C9A7]/50 focus-within:bg-white/[0.05]">
                                <span className="text-lg mr-3">🔍</span>
                                <input 
                                    type="text"
                                    placeholder="Search specific services or counters..."
                                    className="bg-transparent border-none outline-none w-full text-sm text-white placeholder:text-white/20"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                                {searchText && (
                                    <button 
                                        onClick={() => setSearchText("")}
                                        className="text-white/20 hover:text-white/60 transition-colors"
                                    >✕</button>
                                )}
                            </div>
                        </div>
                    </div>
                </RevealSection>
            </div>

            {/* --- Content Area --- */}
            {loading ? (
                <div className="grid gap-6 py-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="glass rounded-[24px] p-6 animate-pulse border border-white/5" style={{ minHeight: 200 }}>
                            <div className="w-12 h-12 rounded-2xl bg-white/5 mb-4" />
                            <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
                            <div className="h-3 w-1/2 bg-white/5 rounded" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="relative">
                    {filteredServices.length > 0 ? (
                        <ServicesGrid
                            services={filteredServices.slice(0, 8)}
                            onBook={s => { setSelected(s); setModalOpen(true); }}
                        />
                    ) : (
                        <div className="text-center py-20 glass rounded-[32px] border border-dashed border-white/10">
                            <p className="text-white/30 text-lg">No services matching your current filters</p>
                            <button 
                                onClick={() => {setSearchText(""); setOrgFilter(null);}}
                                className="mt-4 text-[#00C9A7] text-sm font-bold border-b border-[#00C9A7]/30"
                            >Reset all filters</button>
                        </div>
                    )}
                </div>
            )}

            {/* --- View All CTA --- */}
            {!loading && filteredServices.length > 0 && (
                <RevealSection delay={0.2}>
                    <div className="text-center mt-12 mb-6">
                        <button
                            onClick={() => navigate('/services')}
                            className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold transition-all duration-300 overflow-hidden"
                            style={{ background: "#0D1321", border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#00C9A7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-[#00C9A7] tracking-wide uppercase text-xs">Explore Full Catalog</span>
                            <span className="text-[#00C9A7] group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </RevealSection>
            )}
        </div>
    );
};

export default BrowseServices;