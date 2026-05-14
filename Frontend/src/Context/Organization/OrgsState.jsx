import React from 'react';
import OrgContext from './OrgContext';
import { RegisterOrganization, GetOrganizationById, GetAllOrganizations, UpdateOrganizationStatus, DeleteOrganization, ReactivateOrganization, GetPublicMapOrgs, GetRecentActivity, GetApprovedOrganizations } from '../../Api/OrganizationAPI';
import { GetAllUsers, GetUserDetails, UpdateUserStatus, DeleteUser } from '../../Api/UserAPI';

const OrgsState = (props) => {
    // ----- Organization Management Functions -----

    // Function to register a new organization
    const registerOrganization = async (orgsData) => {
        try {
            const result = await RegisterOrganization(orgsData);
            console.log("Organization Registration Result:", result);

            if (result.success) {
                return { success: true, message: result.message };
            } else {
                return { success: false, error: result.error || "Failed to register organization" };
            }
        } catch (error) {
            console.error("Error in registerOrganization:", error);
            return { success: false, error: "An unexpected error occurred while registering the organization. Please try again later." };  
        }
    }

    // Get organization details by ID
    const getOrganizationDetails = async (orgId) => {
        try {
            const result = await GetOrganizationById(orgId);
            console.log("Get Organization Details Result:", result);

            if (result.success) {
                return { success: true, org: result.org };
            } else {
                return { success: false, error: result.error || "Failed to fetch organization details" };
            }
        } catch (error) {
            console.error("Error in getOrganizationDetails:", error);
            return { success: false, error: "An unexpected error occurred while fetching organization details. Please try again later." };  
        }
    }

    // Get all organizations (for admin dashboard)
    const getAllOrganizations = async (params = {}) => {
        try {
            const result = await GetAllOrganizations(params);
            console.log("Get All Organizations Result:", result);

            if (result.success) {
                return { success: true, orgs: result.orgs, total: result.total, page: result.page, pages: result.pages };
            } else {
                return { success: false, error: result.error || "Failed to fetch organizations" };
            }
        } catch (error) {
            console.error("Error in getAllOrganizations:", error);
            return { success: false, error: "An unexpected error occurred while fetching organizations. Please try again later." };  
        }
    }

    // Update organization status
    const updateOrganizationStatus = async (orgId, status, reason) => {
        try {
            const result = await UpdateOrganizationStatus(orgId, status, reason);
            console.log("Update Organization Status Result:", result);

            if (result.success) {
                return { success: true, message: result.message };
            } else {
                return { success: false, error: result.error || "Failed to update organization status" };
            }
        } catch (error) {
            console.error("Error in updateOrganizationStatus:", error);
            return { success: false, error: "An unexpected error occurred while updating organization status. Please try again later." };  
        }
    }

    // Delete an organization
    const deleteOrganization = async (orgId) => {
        try {
            const result = await DeleteOrganization(orgId);
            console.log("Delete Organization Result:", result);

            if (result.success) {
                return { success: true, message: result.message };
            } else {
                return { success: false, error: result.error || "Failed to delete organization" };
            }
        } catch (error) {
            console.error("Error in deleteOrganization:", error);
            return { success: false, error: "An unexpected error occurred while deleting the organization. Please try again later." };  
        }
    }

    // Reactivate a rejected organization
    const reactivateOrganization = async (orgId) => {
        try {
            const result = await ReactivateOrganization(orgId);
            console.log("Reactivate Organization Result:", result);

            if (result.success) {
                return { success: true, message: result.message };
            } else {
                return { success: false, error: result.error || "Failed to reactivate organization" };
            }
        } catch (error) {
            console.error("Error in reactivateOrganization:", error);
            return { success: false, error: "An unexpected error occurred while reactivating the organization. Please try again later." };  
        }
    }

    // Get public map organizations
    const getMapOrgs = async (params = {}) => {
        try {
            const result = await GetPublicMapOrgs(params);
            console.log("Get Map Organizations Result:", result);

            if (result.success) {
                return { success: true, orgs: result.orgs };
            }

            return { success: false, error: result.error || "Failed to fetch map organizations" };
        } catch (error) {
            console.error("Error in getMapOrgs:", error);
            return { success: false, error: "An unexpected error occurred while fetching map organizations. Please try again later." };  
        }
    }

    // Get approved organizations for public listing
    const getApprovedOrganizations = async () => {
        try {
            const result = await GetApprovedOrganizations();
            console.log("Get Approved Organizations Result:", result);

            if (result.success) {
                return { success: true, orgs: result.approvedOrgs };
            }

            return { success: false, error: result.error || "Failed to fetch approved organizations" };
        } catch (error) {
            console.error("Error in getApprovedOrganizations:", error);
            return { success: false, error: "An unexpected error occurred while fetching approved organizations. Please try again later." };
        }
    }

    // Get recent activity for logged-in user (served/skipped/no-show tokens)
    const getRecentActivity = async (params = {}) => {
        try {
            const result = await GetRecentActivity(params);
            console.log("Get Recent Activity Result:", result);

            if (result.success) {
                return { success: true, activity: result.activity };
            }

            return { success: false, error: result.error || "Failed to fetch recent activity" };
        } catch (error) {
            console.error("Error in getRecentActivity:", error);
            return { success: false, error: "An unexpected error occurred while fetching recent activity. Please try again later." };
        }
    }

    // ----- User Management Functions (for admin dashboard) -----

    // Get all users (for admin dashboard)
    const getAllUsers = async (params = {}) => {
        try {
            const result = await GetAllUsers(params);
            console.log("Get All Users Result:", result);

            if (result.success) {
                return { success: true, users: result.users, total: result.total };
            }

            return { success: false, error: result.error || "Failed to fetch users" };
        } catch (error) {
            console.error("Error in getAllUsers:", error);
            return { success: false, error: "An unexpected error occurred while fetching users. Please try again later." };
        }
    }

    // Get single user details by ID (for admin dashboard)
    const getUserDetails = async (userId) => {
        try {
            const result = await GetUserDetails(userId);
            console.log("Get User Details Result:", result);

            if (result.success) {
                return { success: true, user: result.user, profile: result.profile };
            }

            return { success: false, error: result.error || "Failed to fetch user details" };
        } catch (error) {
            console.error("Error in getUserDetails:", error);
            return { success: false, error: "An unexpected error occurred while fetching user details. Please try again later." };
        }
    }

    // Update user status (suspend/activate) (for admin dashboard)
    const updateUserStatus = async (userId, action) => {
        try {
            const result = await UpdateUserStatus(userId, action);
            console.log("Update User Status Result:", result);

            if (result.success) {
                return { success: true, message: result.message, newRole: result.newRole };
            } else {
                return { success: false, error: result.error || "Failed to update user status" };
            }
        } catch (error) {
            console.error("Error in updateUserStatus:", error);
            return { success: false, error: "An unexpected error occurred while updating user status. Please try again later." };  
        }
    }

    // Permanently delete a user (for admin dashboard)
    const deleteUser = async (userId) => {
        try {
            const result = await DeleteUser(userId);
            console.log("Delete User Result:", result);

            if (result.success) {
                return { success: true, message: result.message };
            } else {
                return { success: false, error: result.error || "Failed to delete user" };
            }
        } catch (error) {
            console.error("Error in deleteUser:", error);
            return { success: false, error: "An unexpected error occurred while deleting the user. Please try again later." };  
        }
    }

    const value = {
        // Organization
        registerOrganization,
        getOrganizationDetails,
        getAllOrganizations,
        updateOrganizationStatus,
        deleteOrganization,
        reactivateOrganization,
        getApprovedOrganizations,

        // Public Map & Activity
        getMapOrgs,
        getRecentActivity,

        // User
        getAllUsers,
        getUserDetails,
        updateUserStatus,
        deleteUser
    }

  return (
    <OrgContext.Provider value={value}>
        {props.children}
    </OrgContext.Provider>
  )
}

export default OrgsState
