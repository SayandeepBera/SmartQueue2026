import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create an Axios instance for reuse
const api = axios.create({
    baseURL: `${API_URL}/api/orgs`,
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

// API 1: Create a new organization
export const RegisterOrganization = async (orgsData) => {
    try {
        const response = await api.post("/register", orgsData);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || "An error occurred while registering the organization" };
    }
}

// API 2: Get organization details by ID
export const GetOrganizationById = async (orgId) => {
    try {
        const response = await api.get(`org-details/${orgId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching organization details" };
    }
}

// API 3: Get all organizations (for admin dashboard)
export const GetAllOrganizations = async (params = {}) => {
    try {
        // Build query parameters
        const query = new URLSearchParams({
            search: params.search || '',
            status: params.status || 'all',
            type: params.type || 'all',
            plan: params.plan || 'all',
            page: params.page || 1,
            limit: params.limit || 25,
        }).toString();

        const response = await api.get(`/?${query}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching organizations" };
    }
}

// API 4: Update organization status
export const UpdateOrganizationStatus = async (orgId, status, reason) => {
    try {
        const response = await api.patch(`/update-status/${orgId}`, { status, reason });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while updating organization status" };
    }
}

// API 5: Delete an organization
export const DeleteOrganization = async (orgId) => {
    try {
        const response = await api.delete(`/delete/${orgId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while deleting the organization" };
    }
}

// API 6: Reactivate a rejected organization
export const ReactivateOrganization = async (orgId) => {
    try {
        const response = await api.patch(`/reactivate/${orgId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while reactivating the organization" };
    }
}

// API 7: Returns lightweight org cards with lat/lng, icon, color, service count etc.
export const GetPublicMapOrgs = async (params = {}) => {
    try {
        const query = new URLSearchParams();
        if (params.city) query.set("city", params.city);
        if (params.area) query.set("area", params.area);

        const response = await api.get(`/public/map?${query.toString()}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching map organizations" };
    }
}

// API 8: Get recent activity for the logged-in user (served/skipped/no-show tokens)
export const GetRecentActivity = async (params = {}) => {
    try {
        const query = new URLSearchParams({ limit: params.limit || 5 });
        
        const response = await api.get(`/public/activity?${query.toString()}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching recent activity" };
    }
}

// API 9: Get all approved organizations for public listing (e.g. on homepage)
export const GetApprovedOrganizations = async () => {
    try {
        const response = await api.get(`/public/approved-orgs`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching approved organizations" };
    }
}
