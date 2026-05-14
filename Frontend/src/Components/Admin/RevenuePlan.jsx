import React, { useContext, useEffect, useState } from 'react';
import PlansContext from '../../Context/Plans/PlansContext';
import { ImSpinner9 } from 'react-icons/im';

const RevenuePlan = ({ orgs }) => {
    const { getAllPlans } = useContext(PlansContext);
    const [plans, setPlans]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const result = await getAllPlans();
            if (result.success) setPlans(result.plans);
            setLoading(false);
        };
        fetch();
    }, [getAllPlans]);

    // Recalculate whenever orgs prop changes (e.g. after approval/plan change)
    const enriched = plans.map(p => ({
        ...p,
        count: orgs.filter(o => o.plan === p.name).length,
        rev:   orgs.filter(o => o.plan === p.name).length * (p.price ?? 0),
    }));

    const maxRev = Math.max(...enriched.map(p => p.rev), 1);

    return (
        <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3
                    className="font-bold text-lg text-white"
                    style={{ fontFamily: "'serif', 'fangsong'" }}
                >
                    Revenue by Plan
                </h3>
                {loading && (
                    <ImSpinner9
                        className="animate-spin text-amber-400"
                        style={{ width: 14, height: 14 }}
                    />
                )}
            </div>

            {loading ? (
                // Skeleton
                <div className="flex flex-col gap-3.5">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="animate-pulse">
                            <div className="flex justify-between mb-1.5">
                                <div className="h-3 w-24 bg-white/8 rounded-lg" />
                                <div className="h-3 w-16 bg-white/8 rounded-lg" />
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full" />
                        </div>
                    ))}
                </div>
            ) : enriched.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-4">No plan data available</p>
            ) : (
                enriched.map((p, i) => (
                    <div
                        key={p.name}
                        className="mb-3.5 last:mb-0"
                        style={{ fontFamily: "'serif', 'fangsong'" }}
                    >
                        <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: p.color }}
                                />
                                <span className="text-sm font-semibold text-white/70">
                                    {p.name}
                                </span>
                                <span className="text-xs text-white/30">({p.count} orgs)</span>
                            </div>
                            <span
                                className="text-sm font-bold font-mono"
                                style={{ color: p.color }}
                            >
                                ₹{p.rev.toLocaleString()}
                            </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="bar-grow h-full rounded-full"
                                style={{
                                    "--w": `${Math.max(4, (p.rev / maxRev) * 100)}%`,
                                    background: p.color,
                                }}
                            />
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default RevenuePlan;