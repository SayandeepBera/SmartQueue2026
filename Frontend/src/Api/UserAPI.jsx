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

// ── API 1: Get all users (admin only) by GET /api/admin/users
export const GetAllUsers = async (params = {}) => {
    try {
        // Build query parameters
        const query = new URLSearchParams({
            search: params.search || '',
            status: params.status || 'all',
            page:   params.page   || 1,
            limit:  params.limit  || 25,
        }).toString();

        const response = await api.get(`/users?${query}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching users" };
    }
};

// ── API 2: Get single user details by GET /api/admin/users/:id
export const GetUserDetails = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching user details" };
    }
};

// ── API 3: Update user status (suspend/activate) by PATCH /api/admin/update-users/:id/status
export const UpdateUserStatus = async (userId, action) => {
    try {
        const response = await api.patch(`/update-users/${userId}/status`, { action });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while updating user status" };
    }
};

// ── API 4: Permanently delete user by DELETE /api/admin/delete-users/:id (admin only) 
export const DeleteUser = async (userId) => {
    try {
        const response = await api.delete(`/delete-users/${userId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while deleting user" };
    }
};
