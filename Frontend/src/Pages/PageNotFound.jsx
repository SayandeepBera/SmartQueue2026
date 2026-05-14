import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Map, Compass, Home, ArrowLeft } from 'lucide-react';

const PageNotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen flex items-center justify-center px-6 font-[fangsong] bg-[#121827]">
            <div className="relative max-w-2xl w-full text-center">

                {/* Background Decorative Element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00C4CC]/10 blur-[120px] rounded-full -z-10" />

                {/* Animated Icon Group */}
                <div className="relative flex justify-center mb-8">
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative z-10 p-6 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl"
                    >
                        <Map size={80} className="text-[#00C4CC]" strokeWidth={1} />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-2 -right-2 p-3 bg-[#1E293B] rounded-2xl border border-white/10 shadow-lg"
                        >
                            <Compass size={24} className="text-white" />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-8xl md:text-9xl font-black text-white italic tracking-tighter opacity-20 select-none">
                        404
                    </h1>
                    <div className="relative -mt-12 md:-mt-16 mb-8">
                        <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tight">
                            You've Wandered <span className="text-[#00C4CC]">Off-Track</span>
                        </h2>
                        <p className="text-gray-500 mt-4 text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed">
                            The service counter you're looking for has moved, or your digital token has expired. Let's get you back to the main queue.
                        </p>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-3 bg-[#00C4CC] text-[#0F172A] px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/10"
                    >
                        <Home size={18} />
                        Back to Dashboard
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-3 bg-white/5 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                        <ArrowLeft size={18} />
                        Previous Coordinates
                    </button>
                </motion.div>

                {/* Footer Tip */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]"
                >
                    SmartQueue | Invalid Token Protocol 404
                </motion.p>
            </div>
        </div>
    );
};

export default PageNotFound;