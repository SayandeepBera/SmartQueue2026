import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create an Axios instance for reuse
const api = axios.create({
    baseURL: `${API_URL}/api/activity`,
});


// Fetch recent activity logs for the org
export const GetActivityLogs = async (orgId, limit = 20) => {
    try {
        const response = await api.get(`/${orgId}`, { params: { limit } });
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || "Failed to fetch activity logs",
        };
    }
};
