import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Building2,
    Settings,
    Users,
    LineChart,
} from 'lucide-react';
import OrgsStories from '../../Components/User/OrgsStories';
import OrgsHowItWorks from '../../Components/User/OrgsHowItWorks';
import HelpAndSupport from '../../Components/User/HelpAndSupport';
import OrgsRegistrationForm from '../../Components/User/OrgsRegistrationForm';

import HeroOrgs from '../../assets/Images/HeroOrgs.avif';
import WorkFlow1 from '../../assets/Images/WorkFlow1.avif';
import WorkFlow2 from '../../assets/Images/WorkFlow2.avif';
import WorkFlow3 from '../../assets/Images/WorkFlow3.avif';
import WorkFlow4 from '../../assets/Images/WorkFlow4.avif';

// 2. How it works Data (Organization workflow)
const steps = [
    { id: 1, title: "Register Your Organization", desc: "Sign up with your official details. Set up your organizational profile, add branch locations, and define the specific service counters you want to offer.", icon: <Building2 className="w-8 h-8" />, img: WorkFlow1 },
    { id: 2, title: "Configure Services", desc: "Customize your workflow. Define your service types, estimate handling times, and set up counter availability to match your exact operational needs.", icon: <Settings className="w-8 h-8" />, img: WorkFlow2 },
    { id: 3, title: "Manage Live Queues", desc: "Start issuing digital tokens. Your customers can book online, while your administrators easily call, skip, or transfer tokens via an intuitive dashboard.", icon: <Users className="w-8 h-8" />, img: WorkFlow3 },
    { id: 4, title: "Analyze & Optimize", desc: "Access detailed analytics on waiting times and service efficiency. Use real-time insights to optimize staff allocation and improve customer satisfaction.", icon: <LineChart className="w-8 h-8" />, img: WorkFlow4 },
];

const OrganizationRegistration = () => {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="text-white min-h-screen overflow-x-hidden">

            <AnimatePresence>{showForm && <OrgsRegistrationForm setShowForm={setShowForm} />}</AnimatePresence>

            {/* --- SECTION 1: HERO --- */}
            <section className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 text-center lg:text-left"
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                        Eliminate Waiting. <br />
                        <span className="text-[#00C4CC] drop-shadow-[0_0_10px_rgba(0,196,204,0.5)]">Streamline Services.</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0">
                        Join thousands of hospitals, banks, and government offices using our Smart Queue Management System to reduce wait times and boost efficiency.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button onClick={() => setShowForm(true)} className="px-8 py-4 bg-[#00C4CC] cursor-pointer hover:bg-cyan-500 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_20px_#0ef] transform hover:scale-105">
                            Register Organization
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="flex-1 relative"
                >
                    <div className="relative z-10 rounded-2xl overflow-hidden border-2 border-[#00C4CC]/30 p-2 bg-[#16213e]/50 backdrop-blur-sm">
                        <img
                            src={HeroOrgs}
                            alt="Team working efficiently"
                            className="w-full h-auto rounded-xl transform hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    {/* Animated Glow Background */}
                    <div className="absolute -top-10 -right-10 w-48 h-48 md:w-72 md:h-72 bg-[#00C4CC] opacity-10 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 md:w-72 md:h-72 bg-[#00C4CC] opacity-10 rounded-full blur-[100px] animate-pulse z-1"></div>
                </motion.div>
            </section>

            {/* --- SECTION 2: PARTNER STORIES (CUSTOM SLIDER) --- */}
            <OrgsStories showForm={showForm} />

            {/* --- SECTION 3: HOW IT WORKS --- */}
            <OrgsHowItWorks steps={steps} />

            {/* --- EXTRA SECTION: HELP & SUPPORT --- */}
            <HelpAndSupport />
        </div>
    );
};

export default OrganizationRegistration;