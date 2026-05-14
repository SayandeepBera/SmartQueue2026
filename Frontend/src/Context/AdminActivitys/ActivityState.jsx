import React from 'react'
import ActivityContext from './ActivityContext';
import { GetAdminActivity } from '../../Api/AdminActivityAPI';

const ActivityState = (props) => {
    // ── Get admin activity logs ───────────────────────────────────────────────
    const fetchAdminActivity = async (limit = 50, type = "all") => {
        try {
            const result = await GetAdminActivity(limit, type);
            console.log("Admin Activity Result:", result);

            if (result.success) {
                return { success: true, activity: result.activity, total: result.total };
            }

            return { success: false, error: result.error || "Failed to fetch activity" };
        } catch (error) {
            console.error("Error in fetchAdminActivity:", error);
            return { success: false, error: "An unexpected error occurred while fetching activity. Please try again later." };
        }
    };

    const value = {
        fetchAdminActivity,
    };

    return (
        <ActivityContext.Provider value={value}>
            {props.children}
        </ActivityContext.Provider>
    )
}

export default ActivityState
