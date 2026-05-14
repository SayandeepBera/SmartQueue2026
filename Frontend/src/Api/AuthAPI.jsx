import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create an Axios instance with the base URL and default headers
const api = axios.create({
    baseURL: `${API_BASE_URL}/api/auth`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a response interceptor to handle 401 Unauthorized errors globally
api.interceptors.response.use(
    (response) => response,

    (error) => {
        // If the error is a 401 Unauthorized, it likely means the user's session has expired
        if(error.response && error.response?.status === 401) {
            // Clear any stored user data (e.g., tokens) here if needed
            localStorage.clear();

            // Redirect the user to the login page (prevent multiple redirects if already on login)
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?reason=session_expired';
            }
        }

        return Promise.reject(error);
    }
);

// Register api
export const Register = async (username, email, password) => {
    try {
        const response = await api.post('/register', { username, email, password });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred during registration." };
    }
};

// Login api
export const Login = async (loginIdentifier, password) => {
    try {
        // Convert username or email to lowercase and trim whitespace for consistency
        const sanitizedIdentifier = loginIdentifier.toLowerCase().trim();

        const response = await api.post('/login', { loginIdentifier: sanitizedIdentifier, password: password });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred during login." };
    }
};

// Forgot password api
export const ForgotPassword = async (email) => {
    try {
        const response = await api.post('/forgot-password', { email });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred during password reset." };
    }
};

// Verify OTP api
export const VerifyOTP = async (email, otp) => {
    try {
        const response = await api.post('/verify-otp', { email, otp });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred during OTP verification." };
    }
};

// Reset password api
export const ResetPassword = async (email, newPassword) => {
    try {
        const response = await api.post('/reset-password', { email, newPassword });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred during password reset." };
    }
};

// Google login
export const GoogleLogin = async (code) => {
    try {
        const response = await api.get(`/google-login?code=${code}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred during Google login." };
    }
}