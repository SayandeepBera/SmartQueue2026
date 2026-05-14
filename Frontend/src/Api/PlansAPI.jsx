import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create an Axios instance for reuse
const api = axios.create({
    baseURL: `${API_URL}/api/plans`,
});

// This interceptor will add the token to the request headers if it exists in localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
        config.headers['auth-token'] = token;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// ── API 1: Get all plans with live org counts 
export const GetAllPlans = async () => {
    try {
        const response = await api.get("/");
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || "Failed to fetch plans",
        };
    }
};


// ── API 2: Get single plan by name 
export const GetPlanByName = async (name) => {
    try {
        const response = await api.get(`/${name}`);
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || "Failed to fetch plan",
        };
    }
};


// ── API 3: Update plan settings (Admin only) 
export const UpdatePlan = async (name, updateData) => {
    try {
        const response = await api.put(`/${name}`, updateData);
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error
                || error.response?.data?.errors?.[0]?.msg
                || "Failed to update plan",
        };
    }
};


// ── API 4: Change an organization's plan (Admin only) 
export const ChangeOrgPlan = async (orgId, plan) => {
    try {
        const response = await api.patch(`/org/${orgId}`, { plan });
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || "Failed to change organization plan",
        };
    }
};

// ── API 5: Get last-7-months revenue chart data (Admin only) 
export const GetRevenueChart = async () => {
    try {
        const response = await api.get("/revenue/chart");
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || "Failed to fetch revenue data",
        };
    }
};


// ── API 6: Take a revenue snapshot for the current month (Admin only) 
export const TakeRevenueSnapshot = async () => {
    try {
        const response = await api.post("/revenue/snapshot");
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || "Failed to take revenue snapshot",
        };
    }
};


// ── API 7: Seed default plans (call once on first deploy) (Admin only) 
export const SeedPlans = async () => {
    try {
        const response = await api.post("/seed");
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || "Failed to seed plans",
        };
    }
};