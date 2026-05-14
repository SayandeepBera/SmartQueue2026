import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create an Axios instance for reuse
const api = axios.create({
    baseURL: `${API_URL}/api/queue`,
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

// ── API 1: Get live queue details for a service 
export const GetQueueDetails = async (serviceId) => {
    try {
        const response = await api.get(`/live/${serviceId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching live queue details" };
    }
};

// ── API 2: Book a new token for a service 
export const BookToken = async (serviceId, {name, phone, email, userId}) => {
    try {
        const response = await api.post(`/new-token/${serviceId}`, { name, phone, email, userId });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while booking a token" };
    }
};

// ── API 3: Mark current "serving" token as "served" and promote the next token 
export const MarkTokenServed = async (tokenId) => {
    try {
        const response = await api.patch(`/mark-served/${tokenId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while marking the token as served" };
    }
};

// ── API 4: Skip the current "next" token and move it to end of queue 
export const SkipNextToken = async (tokenId) => {
    try {
        const response = await api.patch(`/skip-next/${tokenId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while skipping the next token" };
    }
};

// ── API 5: Promote a specific waiting token to position 1 (next)
export const PromoteTokenToNext = async (tokenId) => {
    try {
        const response = await api.patch(`/promote/${tokenId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while promoting the token to next" };
    }
};

// ── API 6: Mark a token as no-show 
export const MarkTokenNoShow = async (tokenId) => {
    try {
        const response = await api.patch(`/no-show/${tokenId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while marking the token as no-show" };
    }
};

// ── API 7: Get all active tokens for a user 
export const GetMyActiveTokens = async () => {
    try {
        const response = await api.get('/my-tokens');
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "Failed to fetch active tokens" };
    }
};
