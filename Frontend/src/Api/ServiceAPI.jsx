import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create an Axios instance for reuse
const api = axios.create({
    baseURL: `${API_URL}/api/services`,
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

// ── API 1: Get all services for the org 
export const GetAllServices = async (orgId) => {
    try {
        const response = await api.get(`/${orgId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching services" };
    }
};

// ── API 2: Create a new service room 
export const CreateService = async (serviceData) => {
    try {
        const response = await api.post("/new-service", serviceData);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while creating the service" };
    }
};

// ── API 3: Edit service details 
export const EditService = async (serviceId, updateData) => {
    try {
        const response = await api.put(`/edit-service/${serviceId}`, updateData);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while updating the service" };
    }
};

// ── API 4: Update service status (active/paused/closed) 
export const UpdateServiceStatus = async (serviceId, status) => {
    try {
        const response = await api.patch(`/update-status/${serviceId}`, { status });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while updating the service status" };
    }
};

// ── API 5: Delete a service room 
export const DeleteService = async (serviceId) => {
    try {
        const response = await api.delete(`/delete-service/${serviceId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while deleting the service" };
    }
};

// ── API 6: Reset daily stats for a service 
export const ResetServiceStats = async (serviceId) => {
    try {
        const response = await api.post(`/reset-stats/${serviceId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while resetting the service stats" };
    }
};

// ── API 7: Featured active services for hero cards
export const GetFeaturedServices = async () => {
    try {
        const response = await api.get('/public/featured');
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching featured services" };
    }
};
