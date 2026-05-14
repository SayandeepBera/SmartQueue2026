import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create an Axios instance for reuse
const api = axios.create({
    baseURL: `${API_URL}/api/public`,
});

// ── API 1: Fetch all public services with filters & pagination
export const GetPublicServices = async (params = {}) => {
    try {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null) query.append(k, v);
        });

        const response = await api.get(`/all?${query.toString()}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching public services" };
    }
};

// ── API 2: Fetch featured/recent services for home page
export const GetFeaturedServices = async (limit = 8) => {
    try {
        const response = await api.get(`/featured?limit=${limit}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching featured services" };
    }
};

// ── API 3: Fetch public stats for the dashboard
export const GetPublicStats = async () => {
    try {
        const response = await api.get('/stats');
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching public stats" };
    }
};

// ── API 4: Fetch available filters for public services (areas, org types) ───────────────────────────────────────────────
export const GetPublicFilters = async () => {
    try {
        const response = await api.get('/filters');
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching public filters" };
    }
};