import React from 'react';
import { motion } from 'framer-motion';

const OrgsHowItWorks = ({ steps }) => {
    return (
        <section className="max-w-7xl mx-auto px-6 py-28">
            <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">How It Works</h2>
                <p className="text-gray-400 text-lg">Your path to delivering a frictionless queuing experience in four simple steps.</p>
            </div>

            <div className="space-y-32">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24`}
                    >
                        {/* Text Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-6 mb-6">
                                <motion.div
                                    whileInView={{ rotate: 360 }}
                                    transition={{ duration: 1 }} 
                                    className="w-16 h-16 rounded-2xl bg-[#00C4CC]/10 flex items-center justify-center text-[#00C4CC] shadow-[0_0_15px_rgba(0,196,204,0.2)]"
                                >
                                    {step.icon}
                                </motion.div>
                                <span className="text-6xl font-black text-white/5">{step.id}</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-4">{step.title}</h3>
                            <p className="text-gray-400 text-lg leading-relaxed md:pr-10">
                                {step.desc}
                            </p>
                        </div>

                        {/* Image Visual */}
                        <div className="flex-1 w-full relative">
                            <div className={`absolute inset-0 bg-linear-to-tr ${index % 2 === 0 ? 'from-[#00C4CC]/20' : 'from-blue-600/20'} to-transparent rounded-3xl -rotate-3 scale-105 -z-10`}></div>
                            <img
                                src={step.img}
                                alt={step.title}
                                className="rounded-3xl shadow-2xl w-full h-87.5 object-cover border border-white/10 transform hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}

export default OrgsHowItWorks
