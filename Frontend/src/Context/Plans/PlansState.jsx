import React from 'react'
import PlansContext from "./PlansContext";
import {
    GetAllPlans,
    GetPlanByName,
    UpdatePlan,
    ChangeOrgPlan,
    GetRevenueChart,
    TakeRevenueSnapshot,
} from "../../Api/PlansAPI";

const PlansState = (props) => {
  // ── Get all plans with live org counts 
    const getAllPlans = async () => {
        try {
            const result = await GetAllPlans();
            
            if (result.success) {
                return { success: true, plans: result.plans };
            }

            return { success: false, error: result.error || "Failed to fetch plans" };
        } catch (error) {
            console.error("Error in getAllPlans:", error);
            return { success: false, error: "An unexpected error occurred while fetching plans." };
        }
    };
 
    // ── Get single plan by name 
    const getPlanByName = async (name) => {
        try {
            const result = await GetPlanByName(name);
            
            if (result.success) {
                return { success: true, plan: result.plan };
            }

            return { success: false, error: result.error || "Failed to fetch plan" };
        } catch (error) {
            console.error("Error in getPlanByName:", error);
            return { success: false, error: "An unexpected error occurred while fetching plan." };
        }
    };
 
    // ── Update plan details (Admin only) 
    const updatePlan = async (name, updateData) => {
        try {
            const result = await UpdatePlan(name, updateData);
            
            if (result.success) {
                return { success: true, plan: result.plan, message: result.message };
            }
            
            return { success: false, error: result.error || "Failed to update plan" };
        } catch (error) {
            console.error("Error in updatePlan:", error);
            return { success: false, error: "An unexpected error occurred while updating plan." };
        }
    };
 
    // ── Change org plan (Admin only)
    const changeOrgPlan = async (orgId, plan) => {
        try {
            const result = await ChangeOrgPlan(orgId, plan);
            
            if (result.success) {
                return { success: true, message: result.message, org: result.org };
            }

            return { success: false, error: result.error || "Failed to change plan" };
        } catch (error) {
            console.error("Error in changeOrgPlan:", error);
            return { success: false, error: "An unexpected error occurred while changing plan." };
        }
    };
 
    // ── Get revenue chart data 
    const getRevenueChart = async () => {
        try {
            const result = await GetRevenueChart();
            
            if (result.success) {
                return { success: true, chart: result.chart };
            }

            return { success: false, error: result.error || "Failed to fetch revenue data" };
        } catch (error) {
            console.error("Error in getRevenueChart:", error);
            return { success: false, error: "An unexpected error occurred while fetching revenue." };
        }
    };
 
    // ── Take revenue snapshot 
    const takeRevenueSnapshot = async () => {
        try {
            const result = await TakeRevenueSnapshot();
            
            return result.success
                ? { success: true, message: result.message }
                : { success: false, error: result.error };
        } catch (error) {
            console.error("Error in takeRevenueSnapshot:", error);
            return { success: false, error: "An unexpected error occurred." };
        }
    };
 
    const value = {
        getAllPlans,
        getPlanByName,
        updatePlan,
        changeOrgPlan,
        getRevenueChart,
        takeRevenueSnapshot,
    };
 
    return (
        <PlansContext.Provider value={value}>
            {props.children}
        </PlansContext.Provider>
    );
}

export default PlansState
