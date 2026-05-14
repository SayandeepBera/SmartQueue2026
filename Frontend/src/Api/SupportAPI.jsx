import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create an Axios instance for reuse
const api = axios.create({
    baseURL: `${API_URL}/api/support`,
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

/* ----- Channels APIs ----- */

// ── API 1: Fetch all support channels 
export const FetchChannels = async () => {
    try {
        const response = await api.get("/channels");
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching channels" };
    }
};

// ── API 2: Admin - Fetch all support channels 
export const FetchAdminChannels = async () => {
    try {
        const response = await api.get("/admin/channels");
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching channels" };
    }
};

// ── API 3: Admin - Update channel status (active/paused/closed) 
export const UpdateChannel = async (channelId, updateData) => {
    try {
        const response = await api.put(`/admin/channels/${channelId}`, updateData);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while updating the channel" };
    }
};

/* ----- Inquiry APIs ----- */

// ── API 1: Submit a support inquiry 
export const SubmitSupportInquiry = async (inquiryData) => {
    try {
        const response = await api.post("/submit", inquiryData);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while submitting the inquiry" };
    }
};

// ─── API 2: Fetch user's support inquiries 
export const FetchMyInquiries = async () => {
    try {
        const response = await api.get("/my/inquiries");
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching your inquiries" };
    }
};

// ── API 3: Admin - Fetch all support inquiries 
export const FetchAllInquiries = async (params = {}) => {
    try {
        const response = await api.get("/admin/all", { params });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching inquiries" };
    }
};

// ── API 4: Admin - Update inquiry status and response 
export const UpdateInquiryStatus = async (inquiryId, updateData) => {
    try {
        const response = await api.put(`/admin/update/${inquiryId}`, updateData);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while updating the inquiry" };
    }
};

// ── API 5: Admin - Delete a support inquiry 
export const DeleteInquiry = async (inquiryId) => {
    try {
        const response = await api.delete(`/admin/delete/${inquiryId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while deleting the inquiry" };
    }
};

/* ----- Reports (Bug / Idea) ----- */

// ── API 1: Submit a bug report or idea suggestion 
export const SubmitReport = async (reportData) => {
    try {
        const response = await api.post("/report", reportData);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while submitting the report" };
    }
};

// ── API 2: Fetch user's submitted reports 
export const FetchMyReports = async () => {
    try {
        const response = await api.get("/my/reports");
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching your reports" };
    }
};

// ── API 3: Admin - Fetch all reports (bugs and ideas) 
export const FetchAllReports = async (params = {}) => {
    try {
        const response = await api.get("/admin/reports", { params });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching reports" };
    }
};

// ── API 4: Admin - Update report status and response 
export const UpdateReport = async (reportId, updateData) => {
    try {
        const response = await api.put(`/admin/reports/${reportId}`, updateData);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while updating the report" };
    }
};

// ── API 5: Admin - Delete a report 
export const DeleteReport = async (reportId) => {
    try {
        const response = await api.delete(`/admin/reports/${reportId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while deleting the report" };
    }
};

/* ----- Live Chat APIs ----- */

// ── API 1: Start a live chat session 
export const StartChat = async (payload) => {
    try {
        const response = await api.post("/chat/start", payload);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while starting the chat" };
    }
}

// ── API 2: Fetch user's chat conversations 
export const FetchMyChat = async () => {
    try {
        const response = await api.get("/chat/my");
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching your chats" };
    }
};

// ── API 3: Send a message in a chat conversation 
export const SendChatMessage = async (payload) => {
    try {
        const response = await api.post("/chat/message", payload);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while sending the message" };
    }
};

// ── API 4: Poll chat messages for a conversation 
export const PollChatMessages = async (conversationId, since) => {
    try {
        const response = await api.get(`/chat/poll/${conversationId}`, { params: { since } });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while polling chat messages" };
    }
};

// ── API 5: Upload an attachment in a chat conversation 
export const UploadChatFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post("/chat/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        });
        
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while uploading the file" };
    }
};

/* ── Live Chat (Admin side) ──────────────────────────────────────── */

// ── API 1: Admin - Fetch all chat conversations 
export const FetchAllChats = async (params = {}) => {
    try {
        const response = await api.get("/admin/chats", { params }); 
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching chat conversations" };
    }
};

// ── API 2: Admin - Fetch chat messages for a conversation 
export const FetchChatMessages = async (conversationId) => {
    try {
        const response = await api.get(`/admin/chats/${conversationId}`);
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while fetching chat messages" };
    }
};

// ── API 3: Admin - Send a message in a chat conversation 
export const SendAdminChatMessage = async (conversationId, message) => {
    try {
        const response = await api.post(`/admin/chats/${conversationId}/message`, { message });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while sending the admin message" };
    }
};

// ── API 4: Admin - Update chat conversation status (open/in_progress/resolved/closed) 
export const UpdateChatStatus = async (conversationId, status) => {
    try {
        const response = await api.put(`/admin/chats/${conversationId}/status`, { status });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while updating the chat status" };
    }
};

// ── API 5: Admin - Poll chat messages for a conversation 
export const PollAdminChatMessages = async (conversationId, since) => {
    try {
        const response = await api.get(`/admin/chats/${conversationId}/poll`, { params: { since } });
        return response.data;
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "An error occurred while polling admin chat messages" };
    }
};