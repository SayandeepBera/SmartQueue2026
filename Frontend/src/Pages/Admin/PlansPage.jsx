import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ImSpinner9 } from 'react-icons/im';

import PlanBadge from '../../Components/Admin/PlanBadge';
import EditPlanModal from '../../Components/Admin/EditPlanModal';
import PlansContext from '../../Context/Plans/PlansContext';

const PlansPage = ({ orgs, setOrgs }) => {

    const { getAllPlans, updatePlan, changeOrgPlan, getRevenueChart } = useContext(PlansContext);

    const [plans, setPlans] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(true);
    const [editModal, setEditModal] = useState(null);   // plan object | null
    const [savingPlan, setSavingPlan] = useState(false);
    const [changingPlanId, setChangingPlanId] = useState(null); // orgId being updated

    // ── Fetch on mount 
    useEffect(() => {
        fetchPlans();
        fetchChart();
    }, []);

    // ── Fetch plans
    const fetchPlans = async () => {
        setPlansLoading(true);
        const result = await getAllPlans();
        if (result.success) {
            setPlans(result.plans);
        } else {
            toast.error(result.error || "Failed to fetch plans", { theme: "colored" });
        }
        setPlansLoading(false);
    };

    // ── Fetch chart
    const fetchChart = async () => {
        setChartLoading(true);
        const result = await getRevenueChart();
        if (result.success) {
            setChartData(result.chart);
        } else {
            toast.error(result.error || "Failed to fetch revenue chart", { theme: "colored" });
        }
        setChartLoading(false);
    };

    // ── Edit plan save ─────────────────────────────────────────────────
    const handleSavePlan = async (name, updateData) => {
        setSavingPlan(true);
        const result = await updatePlan(name, updateData);
        
        if (result.success) {
            // Update local plans state
            setPlans(prev =>
                prev.map(p => p.name === name ? { ...p, ...result.plan } : p)
            );
            
            toast.success(`${name} plan is successfully updated ✓`, { theme: "colored" });
            setEditModal(null);
        } else {
            toast.error(result.error || "Failed to update plan", { theme: "colored" });
        }
        setSavingPlan(false);
    };

    // ── Change org plan from table dropdown ────────────────────────────
    const handleOrgPlanChange = async (orgId, newPlan, orgName) => {
        setChangingPlanId(orgId);
        const result = await changeOrgPlan(orgId, newPlan);
        
        if (result.success) {
            // Update local orgs state in parent
            setOrgs(prev =>
                prev.map(o => o._id === orgId ? { ...o, plan: newPlan } : o)
            );
            // Re-fetch plans to get updated org counts + revenue
            await fetchPlans();
            await fetchChart();
            
            toast.success(`${orgName} plan is successfully updated to ${newPlan} ✓`, { theme: "colored" });
        } else {
            toast.error(result.error || "Failed to change plan", { theme: "colored" });
        }
        setChangingPlanId(null);
    };

    // ── Chart helpers ──────────────────────────────────────────────────
    const revValues = chartData.map(d => d.totalRevenue);
    const maxR = Math.max(...revValues, 1);

    // ── Loading skeleton ───────────────────────────────────────────────
    const Skeleton = () => (
        <div className="glass rounded-2xl p-5 animate-pulse">
            <div className="h-4 bg-white/8 rounded-lg mb-3 w-1/3" />
            <div className="h-8 bg-white/8 rounded-lg mb-2 w-1/2" />
            <div className="h-3 bg-white/5 rounded-lg w-2/3" />
        </div>
    );

    return (
        <div className="flex flex-col gap-5" style={{ animation: "fadeUp .5s both" }}>

            {/* ── Plan Cards ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {plansLoading
                    ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
                    : plans.map((p, i) => (
                        <div
                            key={p.name}
                            className="glass org-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
                            style={{ borderColor: `${p.color}20`, animation: `modalIn .5s ${i * 0.08}s both` }}
                        >
                            {/* Decorative circle */}
                            <div
                                className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
                                style={{ background: `${p.color}10` }}
                            />

                            {/* Plan name + price */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div
                                        className="text-xs font-bold tracking-wider uppercase mb-1"
                                        style={{ color: p.color }}
                                    >
                                        {p.name}
                                    </div>
                                    <div
                                        className="text-2xl font-extrabold text-white"
                                        style={{ fontFamily: "'Syne',sans-serif" }}
                                    >
                                        {p.price === 0 ? "Free" : `₹${p.price.toLocaleString()}`}
                                    </div>
                                    {p.price > 0 && (
                                        <div className="text-[10px] text-white/35 mt-0.5">/month per org</div>
                                    )}
                                </div>
                                {/* Live org count */}
                                <div className="text-center">
                                    <div
                                        className="text-2xl font-extrabold"
                                        style={{ fontFamily: "'Syne',sans-serif", color: p.color }}
                                    >
                                        {p.orgCount ?? 0}
                                    </div>
                                    <div className="text-[10px] text-white/35">orgs</div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="flex flex-col gap-1.5 mb-4">
                                {p.features.map((f, j) => (
                                    <div key={j} className="flex items-center gap-2 text-xs text-white/55">
                                        <span style={{ color: p.color }}>✓</span>{f}
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-white/6 mb-3" />

                            {/* Revenue */}
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-white/35">Monthly rev</span>
                                <span
                                    className="text-sm font-extrabold font-mono"
                                    style={{ color: p.color }}
                                >
                                    ₹{(p.monthlyRevenue ?? 0).toLocaleString()}
                                </span>
                            </div>

                            {/* Fill bar */}
                            <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="bar-grow h-full rounded-full"
                                    style={{
                                        "--w": `${Math.max(5, ((p.orgCount ?? 0) / Math.max(...plans.map(x => x.orgCount ?? 0), 1)) * 100)}%`,
                                        background: p.color,
                                    }}
                                />
                            </div>

                            {/* Edit button */}
                            <button
                                onClick={() => setEditModal(p)}
                                className="btn mt-4 w-full py-2 rounded-xl text-xs font-bold"
                                style={{
                                    background: `${p.color}15`,
                                    border: `1px solid ${p.color}30`,
                                    color: p.color,
                                    fontFamily: "inherit",
                                }}
                            >
                                Edit Plan →
                            </button>
                        </div>
                    ))
                }
            </div>

            {/* ── Revenue Chart ──────────────────────────────────────────────── */}
            <div className="glass rounded-2xl p-5">
                <div className="flex justify-between items-center mb-5">
                    <h3
                        className="font-bold text-sm text-white"
                        style={{ fontFamily: "'Syne',sans-serif" }}
                    >
                        Monthly Revenue Trend
                    </h3>
                    <div className="flex items-center gap-3">
                        {chartLoading && <ImSpinner9 className="animate-spin text-amber-400 text-sm" />}
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="text-xs text-white/40">
                                {new Date().getFullYear()}
                            </span>
                        </div>
                        {/* Refresh button */}
                        <button
                            onClick={fetchChart}
                            className="text-[11px] text-white/30 hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-0 p-0"
                            title="Refresh chart"
                            style={{ fontFamily: "inherit" }}
                        >
                            ↻
                        </button>
                    </div>
                </div>

                {chartLoading ? (
                    <div className="h-44 flex items-center justify-center">
                        <ImSpinner9 className="animate-spin text-amber-400 text-xl" />
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-44 flex items-center justify-center text-white/30 text-sm">
                        No revenue data available
                    </div>
                ) : (
                    <div className="flex items-end gap-3 h-44">
                        {chartData.map((d, i) => {
                            const isLast = i === chartData.length - 1;
                            return (
                                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full group relative">
                                    {/* Tooltip */}
                                    <div
                                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1e293b] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                                    >
                                        ₹{d.totalRevenue.toLocaleString()}
                                    </div>

                                    <span className="text-[9px] text-white/40 font-mono mt-auto shrink-0">
                                        ₹{(d.totalRevenue / 1000).toFixed(0)}k
                                    </span>
                                    <div
                                        className="w-full rounded-t-lg overflow-hidden shrink-0 cursor-pointer"
                                        style={{
                                            height: `${(d.totalRevenue / maxR) * 75}%`,
                                            background: "rgba(255,255,255,0.05)",
                                            minHeight: 4,
                                        }}
                                    >
                                        <div
                                            className="w-full h-full rounded-t-lg"
                                            style={{
                                                background: isLast
                                                    ? "linear-gradient(180deg,#fbbf24,#f59e0b)"
                                                    : "rgba(251,191,36,0.35)",
                                                animation: `fadeUp .5s ${i * 0.07}s both`,
                                            }}
                                        />
                                    </div>
                                    <span
                                        className="text-[10px] shrink-0"
                                        style={{
                                            color: isLast ? "#fbbf24" : "rgba(255,255,255,0.35)",
                                            fontWeight: isLast ? 700 : 400,
                                        }}
                                    >
                                        {d.month}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Organization Plan Management Table ─────────────────────────── */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
                    <h3
                        className="font-bold text-sm text-white"
                        style={{ fontFamily: "'Syne',sans-serif" }}
                    >
                        Organization Plan Management
                    </h3>
                    <span className="text-[11px] text-white/30">{orgs.length} organizations</span>
                </div>

                <div className="max-h-64 overflow-y-auto">
                    {orgs.length === 0 ? (
                        <div className="text-center py-10 text-white/30 text-sm">
                            No organizations found
                        </div>
                    ) : (
                        orgs.map((o, i) => {
                            const isBusy = changingPlanId === o._id;
                            return (
                                <div
                                    key={o._id}
                                    className="tbl-row flex items-center gap-3 px-5 py-3 border-b border-white/3 last:border-0"
                                    style={{ animation: `fadeIn .3s ${i * 0.04}s both` }}
                                >
                                    {/* Org info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                                            {o.orgName}
                                            {o.status === "approved" && (
                                                <span className="text-[10px] text-[#60a5fa]">✓</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-white/35">
                                            {o.orgType} · {o.city}
                                        </div>
                                    </div>

                                    {/* Current plan badge */}
                                    <PlanBadge plan={o.plan} />

                                    {/* Plan change dropdown */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {isBusy ? (
                                            <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                                                <ImSpinner9 className="animate-spin" />
                                                <span>Saving…</span>
                                            </div>
                                        ) : (
                                            <select
                                                value={o.plan}
                                                onChange={e => handleOrgPlanChange(o._id, e.target.value, o.orgName)}
                                                className="py-1.5 px-3 bg-white/5 border border-white/10 rounded-lg text-xs text-white outline-none cursor-pointer transition-all"
                                                style={{ fontFamily: "'DM Sans',sans-serif" }}
                                            >
                                                {["Free", "Starter", "Pro", "Enterprise"].map(p => (
                                                    <option key={p} className="bg-[#0c1220]">{p}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── Edit Plan Modal ────────────────────────────────────────────── */}
            {editModal && (
                <EditPlanModal
                    plan={editModal}
                    isLoading={savingPlan}
                    onSave={handleSavePlan}
                    onClose={() => setEditModal(null)}
                />
            )}
        </div>
    );
};

export default PlansPage;