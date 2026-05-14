import React from 'react';
import PublicContext from './PublicContext';
import { GetPublicStats, GetFeaturedServices, GetPublicServices, GetPublicFilters } from '../../Api/PublicAPI';
import { GetMyTokens, GetTokenStatus } from '../../Api/UserTokenAPI';

const PublicState = (props) => {

    // --------- Public Related Functions ---------

    // Function 1: Fetch public stats for the dashboard
    const getPublicStats = async () => {
        try {
            const result = await GetPublicStats();
            console.log("Public Stats Result:", result);

            if (result.success) {
                return { success: true, stats: result.stats };
            }

            return { success: false, error: result.error || "Failed to fetch public stats" };
        } catch (error) {
            console.error("Error in getPublicStats:", error);
            return { success: false, error: "An unexpected error occurred while fetching public stats. Please try again later." };
        }
    }

    // Function 2: Fetch all services for the organization
    const getPublicServices = async (params = {}) => {
        try {
            const result = await GetPublicServices(params);
            console.log("Public Services Result:", result);

            if (result.success) {
                return { success: true, services: result.services, total: result.total, page: result.page, pages: result.pages };
            }

            return { success: false, error: result.error || "Failed to fetch public services" };
        } catch (error) {
            console.error("Error in getPublicServices:", error);
            return { success: false, error: "An unexpected error occurred while fetching public services. Please try again later." };
        }
    }

    // Function 3: Fetch featured/recent services for home page
    const getFeaturedServices = async (limit = 8) => {
        try {
            const result = await GetFeaturedServices(limit);
            console.log("Featured Services Result:", result);

            if (result.success) {
                return { success: true, services: result.services };
            }

            return { success: false, error: result.error || "Failed to fetch featured services" };
        } catch (error) {
            console.error("Error in getFeaturedServices:", error);
            return { success: false, error: "An unexpected error occurred while fetching featured services. Please try again later." };
        }
    }

    // Function 4: Fetch available filters for public services (areas, org types)
    const getPublicFilters = async () => {
        try {
            const result = await GetPublicFilters();
            console.log("Public Filters Result:", result);

            if (result.success) {
                return { success: true, categories: result.categories, areas: result.areas };
            }

            return { success: false, error: result.error || "Failed to fetch public filters" };
        } catch (error) {
            console.error("Error in getPublicFilters:", error);
            return { success: false, error: "An unexpected error occurred while fetching public filters. Please try again later." };
        }
    }

    // -------- User Token Related Functions (for public users to view their tokens) ---------

    // Function 1: Fetch all tokens booked by the user for the token listing page
    const getMyTokens = async ({ userId, email, phone, page = 1, limit = 20 }) => {
        try {
            const result = await GetMyTokens({ userId, email, phone, page, limit });
            console.log("My Tokens Result:", result);

            if (result.success) {
                return { success: true, tokens: result.tokens, total: result.total, pages: result.pages };
            }

            return { success: false, error: result.error || "Failed to fetch my tokens" };
        } catch (error) {
            console.error("Error in getMyTokens:", error);
            return { success: false, error: "An unexpected error occurred while fetching my tokens. Please try again later." };
        }
    }

    // Function 2: Fetch live status of a single token (position, estimated wait, etc.) for the token details page
    const getTokenStatus = async (tokenId) => {
        try {
            const result = await GetTokenStatus(tokenId);
            console.log("Token Status Result:", result);

            if (result.success) {
                return { success: true, token: result.token, ahead: result.ahead };
            }

            return { success: false, error: result.error || "Failed to fetch token status" };
        } catch (error) {
            console.error("Error in getTokenStatus:", error);
            return { success: false, error: "An unexpected error occurred while fetching token status. Please try again later." };
        }
    }

    const value = {
        // Public Related
        getPublicStats,
        getPublicServices,
        getFeaturedServices,
        getPublicFilters,

        // User Token Related
        getMyTokens,
        getTokenStatus,
    }

    return (
        <PublicContext.Provider value={value}>
            {props.children}
        </PublicContext.Provider>
    )
}

export default PublicState
