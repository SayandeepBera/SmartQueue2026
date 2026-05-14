import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create an Axios instance for reuse
const api = axios.create({
    baseURL: `${API_URL}/api/admin`,
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

// Fetch recent admin activity logs
export const GetAdminActivity = async (limit = 50, type = "all") => {
    try {
        const params = { limit };
        if (type !== "all") params.type = type;

        const response = await api.get("/activity", { params });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "Failed to fetch activity" };
    }
};
