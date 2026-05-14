import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create an Axios instance for reuse
const api = axios.create({
    baseURL: `${API_URL}/api/profile`,
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

// ── API 1: Get full profile by GET /api/profile/me
export const GetMyProfile = async (userId) => {
    try {
        const response = await api.get(`/me/${userId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching profile" };
    }
};

// ── API 2: Update profile by PUT /api/profile/update-details
export const UpdateProfileDetails = async (userId, updateData) => {
    try {
        const response = await api.put(`/update-details/${userId}`, updateData);
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || "An error occurred while updating profile details",
        };
    }
};

// ── API 3: Update username by PUT /api/profile/username
export const UpdateUsername = async (userId, newUsername) => {
    try {
        const response = await api.put(`/username/${userId}`, { username: newUsername });
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || "An error occurred while updating username",
        };
    }
};

// ── API 4: Update password by PUT /api/profile/password
export const UpdatePassword = async (userId, currentPassword, newPassword) => {
    try {
        const response = await api.put(`/password/${userId}`, { currentPassword, newPassword });
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || "An error occurred while updating password",
        };
    }
};

// ── API 5: Update avatar by PUT /api/profile/avatar
export const UpdateAvatar = async (userId, avatarFile) => {
    try {
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        const response = await api.put(`/avatar/${userId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || "An error occurred while updating avatar",
        };
    }
};

// ── API 6: Delete avatar by DELETE /api/profile/delete-avatar
export const DeleteAvatar = async (userId) => {
    try {
        const response = await api.delete(`/delete-avatar/${userId}`);
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || "An error occurred while deleting avatar",
        };
    }
};
