import React, { useState, useEffect, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Quote,
    ChevronLeft,
    ChevronRight,
    Building2
} from 'lucide-react';
import OrgContext from '../../Context/Organization/OrgContext';
import { ImSpinner9 } from "react-icons/im";
import hospitalImg from '../../assets/Images/hospital.webp';
import bankImg from '../../assets/Images/bank.jpg';
import governmentImg from '../../assets/Images/govt.jpg';
import clinicImg from '../../assets/Images/clinic.avif';
import diagnosticImg from '../../assets/Images/diagnostic.jpg';
import otherImg from '../../assets/Images/other.jpg';

const OrgsStories = ({ showForm }) => {
    // Repeating Stories Text Data
    const storyTexts = [
        { text: "Implementing this system reduced our patient wait times by 50%. The live tracking is a game-changer for our staff!" },
        { text: "Our branches are much less crowded now. Customers love booking digital tokens from home before they even arrive." },
        { text: "Managing public service queues used to be chaotic. Now, our administrators have complete control and real-time visibility." },
        { text: "The booking system is so seamless that we can focus entirely on providing the best customer service experience." },
        { text: "Transparency in queue management has significantly increased our customer satisfaction scores this quarter." }
    ];

    const FALLBACK_IMAGES = {
        Hospital: hospitalImg,
        Bank: bankImg,
        Government: governmentImg,
        Clinic: clinicImg,
        Diagnostic: diagnosticImg,
        Other: otherImg,
        Default: otherImg
    };

    // Custom Slider State
    const [activeStory, setActiveStory] = useState(0);
    const { getApprovedOrganizations } = useContext(OrgContext);
    const [approvedOrgs, setApprovedOrgs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch approved organizations
    useEffect(() => {
        const fetchOrgs = async () => {
            setIsLoading(true);

            // Fetch all orgs and filter for approved ones
            const result = await getApprovedOrganizations();

            if (result.success) {
                setApprovedOrgs(result.orgs);
            }

            setIsLoading(false);
        };

        fetchOrgs();
    }, []);

    // Auto-advance stories every 6 seconds
    useEffect(() => {
        if (!showForm && approvedOrgs.length > 0) {
            const timer = setInterval(() => {
                setActiveStory((prev) => (prev + 1) % approvedOrgs.length);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [showForm, approvedOrgs.length]);

    // If loading or no approved orgs, show placeholder
    if (isLoading || approvedOrgs.length === 0) {
        return (
            <div className="py-24 bg-[#0F172A] text-center border-y border-gray-800">
                <ImSpinner9 className="animate-spin mx-auto text-[#00C4CC]" size={40} />
                <p className="text-gray-500 mt-4 font-bold italic text-sm uppercase tracking-widest">Loading Partner Success Stories...</p>
            </div>
        );
    }

    // Next/Prev Story Logic
    const nextStory = () => setActiveStory((prev) => (prev + 1) % approvedOrgs.length);
    const prevStory = () => setActiveStory((prev) => (prev - 1 + approvedOrgs.length) % approvedOrgs.length);

    // Get active organization data
    const currentOrg = approvedOrgs[activeStory];

    // Repeat text logic: Use modulo to cycle through storyTexts regardless of how many orgs exist
    const currentText = storyTexts[activeStory % storyTexts.length].text;

    return (
        <section className="py-24 bg-[#0F172A] border-y border-gray-800 relative">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories from Partners</h2>
                    <div className="w-24 h-1 bg-[#00C4CC] mx-auto rounded-full"></div>
                </div>

                <div className="relative group">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStory}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="bg-[#1f2937] p-8 md:p-12 rounded-3xl flex flex-col md:flex-row items-center shadow-2xl shadow-[#00C4CC]/25 gap-8 border border-gray-700/50 hover:border-[#00C4CC]/50 transition-colors"
                        >
                            <motion.div whileHover={{ scale: 1.05, rotate: -2 }} className="relative shrink-0">
                                <img
                                    src={currentOrg?.logo?.url || FALLBACK_IMAGES[currentOrg?.orgType] || FALLBACK_IMAGES.Default}
                                    alt={currentOrg.orgName}
                                    className="w-40 h-40 rounded-2xl object-cover border-2 border-[#00C4CC] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]"
                                    // Standardize look in case of broken links
                                    onError={(e) => { e.target.src = FALLBACK_IMAGES.Default; }}
                                />

                                <div className="absolute -top-4 -left-4 text-[#00C4CC] opacity-50">
                                    <Quote size={40} fill="currentColor" />
                                </div>
                            </motion.div>

                            <div className="flex-1 text-center md:text-left">
                                <p className="text-xl md:text-2xl italic text-gray-200 mb-6 leading-relaxed">
                                    "{currentText}"
                                </p>
                                <h4 className="text-[#00C4CC] font-bold text-xl">{currentOrg.orgName}</h4>
                                <p className="text-gray-500 font-medium">{currentOrg.city}, {currentOrg.state}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    <button
                        onClick={prevStory}
                        className="absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 p-3 bg-[#1f2937] rounded-full border border-gray-700 hover:border-[#00C4CC] transition-all opacity-0 group-hover:opacity-100 hidden md:block"
                    >
                        <ChevronLeft className="text-[#00C4CC]" />
                    </button>
                    <button
                        onClick={nextStory}
                        className="absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 p-3 bg-[#1f2937] rounded-full border border-gray-700 hover:border-[#00C4CC] transition-all opacity-0 group-hover:opacity-100 hidden md:block"
                    >
                        <ChevronRight className="text-[#00C4CC]" />
                    </button>

                    {/* Progressive Dots Slider */}
                    <div className="flex justify-center items-center gap-3 mt-12">
                        {approvedOrgs.map((_, idx) => {
                            const maxVisible = 5;
                            const half = Math.floor(maxVisible / 2);

                            let start = activeStory - half;
                            let end = activeStory + half;

                            if (start < 0) {
                                start = 0;
                                end = maxVisible - 1;
                            }
                            if (end >= approvedOrgs.length) {
                                end = approvedOrgs.length - 1;
                                start = Math.max(0, approvedOrgs.length - maxVisible);
                            }

                            if (idx < start || idx > end) return null;

                            const isEdge = idx === start || idx === end;
                            const sizeClass = isEdge && approvedOrgs.length > maxVisible ? 'scale-75 opacity-50' : 'scale-100 opacity-100';

                            return (
                                <motion.button
                                    layout
                                    key={idx}
                                    onClick={() => setActiveStory(idx)}
                                    className={`h-2 rounded-full transition-all duration-500 ${sizeClass} ${activeStory === idx
                                        ? 'w-10 bg-[#00C4CC]'
                                        : 'w-2 bg-gray-700 hover:bg-gray-500'
                                        }`}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OrgsStories;