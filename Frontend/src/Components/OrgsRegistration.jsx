import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const OrgsRegistration = () => {
    const navigate = useNavigate();

    const handleOrgPortal = () => {
        navigate('/organizations');

        // Scroll to top when switching views
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <div className="py-16 md:py-18 lg:py-20 bg-[#0F172A] border-y border-gray-800 px-4">
            <div className="max-w-8xl mx-auto px-6 sm:px-10 lg:px-20">
                <div className="flex flex-col lg:flex-row items-center justify-between">
                    <div className="lg:w-2/3 text-center lg:text-left mb-8 lg:mb-0 p-5">
                        <motion.h2
                            initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="text-[1.65rem] md:text-[2rem] lg:text-[2.45rem] font-extrabold text-white mb-2 font-['serif']"
                        >
                            Optimize Your Workflow. <span className="text-[#00C4CC]">Join the Smart Queue</span> Network.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-base md:text-lg lg:text-[22px] text-gray-400 max-w-3xl font-['serif']"
                        >
                            Register your organization to eliminate physical queues, manage service counters, and provide real-time updates to your customers.
                        </motion.p>
                    </div>
                    <div className="lg:w-1/3 flex justify-center lg:justify-end">
                        <button
                            type="button"
                            className="font-bold text-lg lg:text-xl rounded-full px-6 py-3 md:px-8 lg:px-10 lg:py-4 cursor-pointer bg-[#00C4CC] text-[#121827] shadow-lg shadow-[#00C4CC]/50 hover:bg-cyan-400 transition duration-150 transform hover:scale-105 font-['serif']"
                            onClick={handleOrgPortal}
                        >
                            Organization Portal <span className="ml-1 text-base">&rarr;</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrgsRegistration
