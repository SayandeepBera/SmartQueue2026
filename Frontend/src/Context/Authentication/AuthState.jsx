import React, { useState, useCallback, useEffect } from 'react';
import AuthContext from './AuthContext';
import { Register, Login, ForgotPassword, VerifyOTP, ResetPassword, GoogleLogin } from '../../Api/AuthAPI';

// Helper function to decode JWT and extract payload
const decodeJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
    if (!token) return true;
    const decoded = decodeJWT(token);
    if (!decoded?.exp) return true;
    // Give a 30-second buffer so we log out slightly before the server rejects
    return decoded.exp * 1000 < Date.now() + 30_000;
};

const AuthState = (props) => {
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState(localStorage.getItem('userId'));
    const [email, setEmail] = useState(localStorage.getItem('email'));

    const [orgId, setOrgId] = useState(localStorage.getItem('orgId')); // New state for orgId

    // Helper to store the token and role in both state and localStorage
    const setAuthData = (token, role, username, userId, email, orgId = null) => {
        setAuthToken(token);
        setUserRole(role);
        setUsername(username);
        setUserId(userId);
        setEmail(email);
        setOrgId(orgId);

        // Storing token, role, username and userId in localStorage for session persistence
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('username', username);
        localStorage.setItem('userId', userId);
        localStorage.setItem('email', email);

        if (orgId) {
            localStorage.setItem('orgId', orgId);
        } else {
            localStorage.removeItem('orgId');
        }
    }

    // Helper to clear auth data from state and localStorage
    const clearAuthData = useCallback(() => {
        setAuthToken(null);
        setUserRole(null);
        setUsername(null);
        setEmail(null);
        setUserId(null);
        setOrgId(null);
        localStorage.clear();
    }, []);

    // Check token expiry on mount and every 60 seconds
    useEffect(() => {
        const performExpiryCheck = () => {
            const storedToken = localStorage.getItem('authToken');

            // No token → nothing to check
            if (!storedToken) return;

            if (isTokenExpired(storedToken)) {
                clearAuthData();

                // Only redirect if we're not already on /login
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login?reason=session_expired';
                }
            }
        };

        // Run immediately on mount
        performExpiryCheck();

        // Then check every 60 seconds
        const intervalId = setInterval(performExpiryCheck, 60_000);
        return () => clearInterval(intervalId);
    }, [clearAuthData]);

    // Login handle
    const userLogin = async (loginIdentifier, password) => {
        setIsLoading(true);

        try {
            const result = await Login(loginIdentifier, password);
            console.log(result);

            if (result.success) {
                // Store token AND role
                setAuthData(result.authToken, result.role, result.username, result.userId, result.email, result.orgId || null);

                // return message after succesful login of user
                return { success: true, msg: "You’ve successfully logged in. Let's get started!", role: result.role };

            } else {
                return { success: false, msg: result.error };
            }

        } catch (error) {
            console.error(error);
            return { success: false, msg: "Something went wrong in Log in. Please try again." };
        } finally {
            setIsLoading(false);
        }
    }

    // Register handle
    const userRegister = async (username, email, password) => {
        setIsLoading(true);

        try {
            const result = await Register(username, email, password);
            console.log(result);

            if (result.success) {
                // Store token AND role (default will be 'tourist')
                setAuthData(result.authToken, result.role, result.username, result.userId, result.email);

                // return message after succesful register of user
                return { success: true, msg: <span>Welcome, <strong>{result.username}!</strong> Your account was successfully created</span>, role: result.role };

            } else {
                return { success: false, msg: result.error };
            }

        } catch (error) {
            console.error(error);
            return { success: false, msg: "Something went wrong in Register. Please try again." };
        } finally {
            setIsLoading(false);
        }
    }

    // Forgot Password handle
    const forgotPassword = async (email) => {
        setIsLoading(true);

        try {
            const result = await ForgotPassword(email);
            console.log(result);

            if (result.success) {
                return { success: true, msg: result.message };
            } else {
                return { success: false, msg: result.error };
            }
        } catch (error) {
            console.error(error);
            return { success: false, msg: "Something went wrong in forgot password. Please try again." };
        } finally {
            setIsLoading(false);
        }
    }

    // Verify OTP handle
    const verifyOTP = async (email, otp) => {
        setIsLoading(true);

        try {
            const result = await VerifyOTP(email, otp);
            console.log(result);

            if (result.success) {
                return { success: true, msg: result.message };
            } else {
                return { success: false, msg: result.error };
            }
        } catch (error) {
            console.error(error);
            return { success: false, msg: "Something went wrong in verify OTP. Please try again." };
        } finally {
            setIsLoading(false);
        }
    }

    // Reset Password handle
    const resetPassword = async (email, newPassword) => {
        setIsLoading(true);

        try {
            const result = await ResetPassword(email, newPassword);
            console.log(result);

            if (result.success) {
                return { success: true, msg: result.message };
            } else {
                return { success: false, msg: result.error };
            }
        } catch (error) {
            console.error(error);
            return { success: false, msg: "Something went wrong in reset password. Please try again." };
        } finally {
            setIsLoading(false);
        }
    }

    // Google Login handle
    const googleLogin = async (authResult) => {
        setIsLoading(true);

        try {
            console.log("Google Auth Result:", authResult);

            if (!authResult.code) {
                throw new Error("Google authentication failed. No authorization code received.");
            }

            const result = await GoogleLogin(authResult.code);
            console.log("Google Login API Result:", result);

            if (result.success) {
                // Store token AND role
                setAuthData(result.authToken, result.role, result.username, result.userId, result.email);

                // return message after succesful login of user
                return { success: true, msg: "You’ve successfully logged in. Let's get started!", role: result.role };
            } else {
                return { success: false, msg: result.error };
            }

        } catch (error) {
            console.error("Google Login Error:", error);
            return { success: false, msg: "Something went wrong in Google login. Please try again." };
        } finally {
            setIsLoading(false);
        }
    }

    // Logout handle
    const userLogout = () => {
        setAuthToken(null);
        setUserRole(null);
        setUsername(null);
        setEmail(null);
        setUserId(null);
        setOrgId(null);
        localStorage.clear();
    }

    // Value to be passed to context consumers
    const value = {
        userLogin,
        userRegister,
        userLogout,
        forgotPassword,
        verifyOTP,
        resetPassword,
        googleLogin,
        userRole,
        authToken,
        username,
        userId,
        email,
        isLoading,
        orgId
    }

    return (
        <AuthContext.Provider value={value}>
            {props.children}
        </AuthContext.Provider>
    )
}

export default AuthState
