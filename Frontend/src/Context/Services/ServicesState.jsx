import React from 'react';
import ServiceContext from './ServicesContext';
import {
    GetAllServices,
    CreateService,
    EditService,
    UpdateServiceStatus,
    DeleteService,
    ResetServiceStats,
    GetFeaturedServices
} from '../../Api/ServiceAPI';

import {
    GetQueueDetails,
    BookToken,
    MarkTokenServed,
    SkipNextToken,
    PromoteTokenToNext,
    MarkTokenNoShow,
    GetMyActiveTokens
} from '../../Api/QueueAPI';

import { GetAnalytics } from '../../Api/AnalyticsAPI';
import { GetActivityLogs } from '../../Api/ActivityAPI';
import { useContext } from 'react';

const ServicesState = (props) => {
    // --------- Services Related Functions ---------
    
    // Function 1: Fetch all services for the organization
    const getServices = async (orgId) => {
        try {
            const result = await GetAllServices(orgId);
            console.log("Get Services Result:", result);

            if (result.success) {
                return { success: true, services: result.services };
            }

            return { success: false, error: result.error || "Failed to fetch services" };
        } catch (error) {
            console.error("Error in getServices:", error);
            return { success: false, error: "An unexpected error occurred while fetching services. Please try again later." };
        }
    }

    // Function 2: Create a new service
    const createService = async (serviceData) => {
        try {
            const result = await CreateService(serviceData);
            console.log("Create Service Result:", result);

            if (result.success) {
                return { success: true, service: result.service, message: result.message };
            }

            return { success: false, error: result.error || "Failed to create service" };
        } catch (error) {
            console.error("Error in createService:", error);
            return { success: false, error: "An unexpected error occurred while creating the service. Please try again later." };
        }
    }

    // Function 3: Edit service details
    const updateService = async (serviceId, updateData) => {
        try {
            const result = await EditService(serviceId, updateData);
            console.log("Edit Service Result:", result);

            if (result.success) {
                return { success: true, service: result.service };
            }

            return { success: false, error: result.error || "Failed to update service" };
        } catch (error) {
            console.error("Error in updateService:", error);
            return { success: false, error: "An unexpected error occurred while updating the service. Please try again later." };
        }
    }

    // Function 4: Update service status (active/paused/closed)
    const updateServiceStatus = async (serviceId, status) => {
        try {
            const result = await UpdateServiceStatus(serviceId, status);
            console.log("Update Service Status Result:", result);

            if (result.success) {
                return { success: true, service: result.service, message: result.message };
            }

            return { success: false, error: result.error || "Failed to update service status" };
        } catch (error) {
            console.error("Error in updateServiceStatus:", error);
            return { success: false, error: "An unexpected error occurred while updating the service status. Please try again later." };
        }
    }

    // Function 5: Delete a service
    const deleteService = async (serviceId) => {
        try {
            const result = await DeleteService(serviceId);
            console.log("Delete Service Result:", result);

            if (result.success) {
                return { success: true, message: result.message };
            }

            return { success: false, error: result.error || "Failed to delete service" };
        } catch (error) {
            console.error("Error in deleteService:", error);
            return { success: false, error: "An unexpected error occurred while deleting the service. Please try again later." };
        }
    }

    // Function 6: Reset daily stats for a service
    const resetServiceStats = async (serviceId) => {
        try {
            const result = await ResetServiceStats(serviceId);
            console.log("Reset Service Stats Result:", result);

            if (result.success) {
                return { success: true, message: result.message, service: result.service };
            }

            return { success: false, error: result.error || "Failed to reset service stats" };
        } catch (error) {
            console.error("Error in resetServiceStats:", error);
            return { success: false, error: "An unexpected error occurred while resetting the service stats. Please try again later." };
        }
    }

    // Function 7: Get featured active services for hero cards
    const getFeaturedServices = async () => {
        try {
            const result = await GetFeaturedServices();
            console.log("Get Featured Services Result:", result);

            if (result.success) {
                return { success: true, services: result.services };
            }

            return { success: false, error: result.error || "Failed to fetch featured services" };
        } catch (error) {
            console.error("Error in getFeaturedServices:", error);
            return { success: false, error: "An unexpected error occurred while fetching featured services. Please try again later." };
        }
    }

    // --------- Queue Related Functions ---------

    // Function 1: Get queue details for a service
    const getQueue = async (serviceId) => {
        try {
            const result = await GetQueueDetails(serviceId);
            console.log("Get Queue Details Result:", result);

            if (result.success) {
                return { success: true, queue: result.queue, count: result.count };
            }

            return { success: false, error: result.error || "Failed to fetch queue details" };
        } catch (error) {
            console.error("Error in getQueue:", error);
            return { success: false, error: "An unexpected error occurred while fetching queue details. Please try again later." };
        }
    }

    // Function 2: Book a new token for a service
    const bookToken = async (serviceId, { name, phone, email, userId }) => {
        try {
            const result = await BookToken(serviceId, { name, phone, email, userId });
            console.log("Book Token Result:", result);

            if (result.success) {
                return { success: true, token: result.token, message: result.message };
            }

                return { success: false, error: result.error || "Failed to book token" };
        } catch (error) {
            console.error("Error in bookToken:", error);
            return { success: false, error: "An unexpected error occurred while booking a token. Please try again later." };
        }
    }

    // Function 3: Mark the current serving token as served
    const markDone = async (tokenId) => {
        try {
            const result = await MarkTokenServed(tokenId);
            console.log("Mark Token Served Result:", result);

            if (result.success) {
                return { success: true, token: result.token, message: result.message };
            }

            return { success: false, error: result.error || "Failed to mark token as served" };
        } catch (error) {
            console.error("Error in markDone:", error);
            return { success: false, error: "An unexpected error occurred while marking the token as served. Please try again later." };
        }
    }

    // Function 4: Skip the current next token and move it to end of queue
    const skipToken = async (tokenId) => {
        try {
            const result = await SkipNextToken(tokenId);
            console.log("Skip Next Token Result:", result);

            if (result.success) {
                return { success: true, token: result.token, message: result.message };
            }

            return { success: false, error: result.error || "Failed to skip token" };
        } catch (error) {
            console.error("Error in skipToken:", error);
            return { success: false, error: "An unexpected error occurred while skipping the token. Please try again later." };
        }
    }

    // Function 5: Promote a specific waiting token to position 1 (next)
    const moveToFront = async (tokenId) => {
        try {
            const result = await PromoteTokenToNext(tokenId);
            console.log("Promote Token to Next Result:", result);

            if (result.success) {
                return { success: true, token: result.token, message: result.message };
            }

            return { success: false, error: result.error || "Failed to promote token to next" };
        } catch (error) {
            console.error("Error in moveToFront:", error);
            return { success: false, error: "An unexpected error occurred while promoting the token to next. Please try again later." };
        }
    }

    // Function 6: Mark a token as no-show
    const noShow = async (tokenId) => {
        try {
            const result = await MarkTokenNoShow(tokenId);
            console.log("Mark Token No-Show Result:", result);

            if (result.success) {
                return { success: true, message: result.message };
            }

            return { success: false, error: result.error || "Failed to mark token as no-show" };
        } catch (error) {
            console.error("Error in noShow:", error);
            return { success: false, error: "An unexpected error occurred while marking the token as no-show. Please try again later." };
        }
    }

    // Function 7: Get all active tokens for a user
    const getMyActiveTokens = async () => {
        try {
            const result = await GetMyActiveTokens();
            console.log("Get My Active Tokens Result:", result);

            if (result.success) {
                return { success: true, tokens: result.tokens };
            }

            return { success: false, error: result.error || "Failed to fetch active tokens" };
        } catch (error) {
            console.error("Error in getMyActiveTokens:", error);
            return { success: false, error: "An unexpected error occurred while fetching active tokens. Please try again later." };
        }
    }

    // --------- Analytics & Activity Logs Functions ---------

    // Function 1: Fetch analytics data for the organization
    const getAnalytics = async (orgId) => {
        try {
            const result = await GetAnalytics(orgId);
            console.log("Get Analytics Result:", result);

            if (result.success) {
                return { success: true, ...result };
            }

            return { success: false, error: result.error || "Failed to fetch analytics data" };
        } catch (error) {
            console.error("Error in getAnalytics:", error);
            return { success: false, error: "An unexpected error occurred while fetching analytics data. Please try again later." };
        }
    }

    // Function 2: Fetch recent activity logs for the organization
    const getActivityLogs = async (orgId, limit = 20) => {
        try {
            const result = await GetActivityLogs(orgId, limit);
            console.log("Get Activity Logs Result:", result);

            if (result.success) {
                return { success: true, activity: result.activity };
            }

            return { success: false, error: result.error || "Failed to fetch activity logs" };
        } catch (error) {
            console.error("Error in getActivityLogs:", error);
            return { success: false, error: "An unexpected error occurred while fetching activity logs. Please try again later." };
        }
    }

    const value = {
        // Services
        getServices,
        createService,
        updateService,
        updateServiceStatus,
        deleteService,
        resetServiceStats,
        getFeaturedServices,

        // Queue
        getQueue,
        bookToken,
        markDone,
        skipToken,
        moveToFront,
        noShow,
        getMyActiveTokens,

        // Analytics & Activity Logs
        getAnalytics,
        getActivityLogs,

    }
    return (
        <ServiceContext.Provider value={value}>
            {props.children}
        </ServiceContext.Provider>
    )
}

export default ServicesState
