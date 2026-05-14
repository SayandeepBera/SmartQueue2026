import React from 'react';
import { motion } from 'framer-motion';
import {
    Headphones,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpAndSupport = () => {
    const navigate = useNavigate();

    // Handle Support
    const handleSupport = () => {
        navigate("/support");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <section className="py-20 px-6">
            <div className="max-w-5xl mx-auto bg-linear-to-br from-[#16213e] to-[#0b0f1a] border border-[#00C4CC]/30 p-10 md:p-16 rounded-4xl text-center shadow-2xl">
                <motion.div 
                    whileInView={{ rotate: 360 }}
                    transition={{ duration: 1 }}
                    className="inline-block p-4 rounded-full bg-[#00C4CC]/10 text-[#00C4CC] mb-6"
                >
                    <Headphones size={48} />
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise Support, 24/7</h2>
                <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                    Whether you need help setting up your service counters, onboarding administrators, or integrating APIs, our dedicated enterprise support team is always here for you.
                </p>
                <button onClick={handleSupport} className="px-10 py-4 text-base border-2 border-[#00C4CC] text-[#00C4CC] hover:bg-[#00C4CC] hover:shadow-[0_0_20px_#0ef] hover:text-white rounded-full font-bold transition-all duration-300">
                    Contact Support Team
                </button>
            </div>
        </section>
    )
}

export default HelpAndSupport
