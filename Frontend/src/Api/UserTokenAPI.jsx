import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create an Axios instance for reuse
const api = axios.create({
    baseURL: `${API_URL}/api/my-tokens`,
});

// ── API 1: Get all tokens booked by the user with their current status 
export const GetMyTokens = async ({ userId,email, phone, page = 1, limit = 20 }) => {
    try {
        // Build query parameters
        const params = new URLSearchParams({ page, limit });
        if (userId) params.append("userId", userId);
        if (email) params.append("email", email);
        if (phone) params.append("phone", phone);

        const response = await api.get(`/?${params.toString()}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching tokens" };
    }
};

// ── API 2: Get live status of a single token (position, estimated wait, etc.) 
export const GetTokenStatus = async (tokenId) => {
    try {
        const response = await api.get(`/token-status/${tokenId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching token status" };
    }
};