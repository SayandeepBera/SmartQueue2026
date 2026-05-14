import React from 'react'
import SupportContext from './SupportContext';
import { 
    FetchChannels, FetchAdminChannels, UpdateChannel, 
    SubmitSupportInquiry, FetchMyInquiries, FetchAllInquiries, UpdateInquiryStatus, 
    DeleteInquiry, StartChat, FetchMyChat, 
    SendChatMessage, PollChatMessages, FetchAllChats, 
    FetchChatMessages, SendAdminChatMessage, UpdateChatStatus, 
    PollAdminChatMessages, SubmitReport, FetchMyReports, 
    FetchAllReports, UpdateReport, DeleteReport, UploadChatFile,
} from "../../Api/SupportAPI";

const SupportState = (props) => {
    // ------ Channels Related Functions ------

    // Function 1: Fetch all support channels
    const fetchChannels = async () => {
        try {
            const result = await FetchChannels();
            console.log("Fetch Channels Result:", result);

            if (result.success) {
                return { success: true, channels: result.channels };
            }

            return { success: false, error: result.error || "Failed to fetch channels" };
        } catch (error) {
            console.error("Error fetching channels:", error);
            return { success: false, error: "Failed to fetch channels" };
        }
    };

    // Function 2: Admin - Fetch all support channels
    const fetchAdminChannels = async () => {
        try {
            const result = await FetchAdminChannels();
            console.log("Fetch Admin Channels Result:", result);

            if (result.success) {
                return { success: true, channels: result.channels };
            }

            return { success: false, error: result.error || "Failed to fetch admin channels" };
        } catch (error) {
            console.error("Error fetching admin channels:", error);
            return { success: false, error: "Failed to fetch admin channels" };
        }
    };

    // Function 3: Admin - Update channel status
    const updateChannel = async (channelId, updateData) => {
        try {
            const result = await UpdateChannel(channelId, updateData);
            console.log("Update Channel Result:", result);

            if (result.success) {
                return { success: true, channel: result.channel };
            }

            return { success: false, error: result.error || "Failed to update channel" };
        } catch (error) {
            console.error("Error updating channel:", error);
            return { success: false, error: "Failed to update channel" };
        }
    };

    // ------ Inquiries Related Functions ------

    // Function 1: Submit a support inquiry
    const submitInquiry = async (inquiryData) => {
        try {
            const result = await SubmitSupportInquiry(inquiryData);
            console.log("Submit Inquiry Result:", result);

            if (result.success) {
                return { success: true, message: result.message };
            }

            return { success: false, error: result.error || "Failed to submit inquiry" };
        } catch (error) {
            console.error("Error submitting inquiry:", error);
            return { success: false, error: "Failed to submit inquiry" };
        }
    };

    // Function 2: Fetch user's own inquiries
    const fetchMyInquiries = async () => {
        try {
            const result = await FetchMyInquiries();
            console.log("Fetch My Inquiries Result:", result);

            if (result.success) {
                return { success: true, inquiries: result.inquiries };
            }

            return { success: false, error: result.error || "Failed to fetch inquiries" };
        } catch (error) {
            console.error("Error fetching inquiries:", error);
            return { success: false, error: "Failed to fetch inquiries" };
        }
    };

    // Function 3: Admin - Fetch all support inquiries
    const fetchInquiries = async (params = {}) => {
        try {
            const result = await FetchAllInquiries(params);
            console.log("Fetch Inquiries Result:", result);

            if (result.success) {
                return { success: true, inquiries: result.inquiries };
            }

            return { success: false, error: result.error || "Failed to fetch inquiries" };
        } catch (error) {
            console.error("Error fetching inquiries:", error);
            return { success: false, error: "Failed to fetch inquiries" };
        }
    };

    // Function 4: Admin - Update inquiry status
    const updateInquiryStatus = async (inquiryId, updateData) => {
        try {
            const result = await UpdateInquiryStatus(inquiryId, updateData);
            console.log("Update Inquiry Status Result:", result);

            if (result.success) {
                return { success: true, message: result.message };
            }

            return { success: false, error: result.error || "Failed to update inquiry status" };
        } catch (error) {
            console.error("Error updating inquiry status:", error);
            return { success: false, error: "Failed to update inquiry status" };
        }
    };

    // Function 5: Admin - Delete an inquiry
    const deleteInquiry = async (inquiryId) => {
        try {
            const result = await DeleteInquiry(inquiryId);
            console.log("Delete Inquiry Result:", result);

            if (result.success) {
                return { success: true, message: result.message };
            }

            return { success: false, error: result.error || "Failed to delete inquiry" };
        } catch (error) {
            console.error("Error deleting inquiry:", error);
            return { success: false, error: "Failed to delete inquiry" };
        }
    };

    // ------ Reports Related Functions (To be implemented) ------

    // Function 1: Submit a report (bug report or feature request)
    const submitReport = async (reportData) => {
        try {
            const result = await SubmitReport(reportData);
            console.log("Submit Report Result:", result);

            if (result.success) {
                return { success: true, message: result.message, report: result.report };
            }

            return { success: false, error: result.error || "Failed to submit report" };
        } catch (error) {
            console.error("Error submitting report:", error);
            return { success: false, error: "Failed to submit report" };
        }
    };

    // Function 2: Fetch user's own reports
    const fetchMyReports = async () => {
        try {
            const result = await FetchMyReports();
            console.log("Fetch My Reports Result:", result);

            if (result.success) {
                return { success: true, reports: result.reports, total: result.total };
            }

            return { success: false, error: result.error || "Failed to fetch reports" };
        } catch (error) {
            console.error("Error fetching reports:", error);
            return { success: false, error: "Failed to fetch reports" };
        }
    };

    // Function 3: Admin - Fetch all reports
    const fetchAllReports = async (params = {}) => {
        try {
            const result = await FetchAllReports(params);
            console.log("Fetch All Reports Result:", result);

            if (result.success) {
                return { success: true, reports: result.reports, total: result.total };
            }

            return { success: false, error: result.error || "Failed to fetch reports" };
        } catch (error) {
            console.error("Error fetching reports:", error);
            return { success: false, error: "Failed to fetch reports" };
        }
    };

    // Function 4: Admin - Update a report status or details
    const updateReport = async (reportId, updateData) => {
        try {
            const result = await UpdateReport(reportId, updateData);
            console.log("Update Report Result:", result);

            if (result.success) {
                return { success: true, report: result.report };
            }

            return { success: false, error: result.error || "Failed to update report" };
        } catch (error) {
            console.error("Error updating report:", error);
            return { success: false, error: "Failed to update report" };
        }
    };

    // Function 5: Admin - Delete a report
    const deleteReport = async (reportId) => {
        try {
            const result = await DeleteReport(reportId);
            console.log("Delete Report Result:", result);

            if (result.success) {
                return { success: true, message: result.message };
            }

            return { success: false, error: result.error || "Failed to delete report" };
        } catch (error) {
            console.error("Error deleting report:", error);
            return { success: false, error: "Failed to delete report" };
        }
    };

    // ------ Chat Related Functions (To be implemented) ------

    // Function 1: Start a live chat session
    const startChat = async (payload) => {
        try {
            const result = await StartChat(payload);
            console.log("Start Chat Result:", result);

            if (result.success) {
                return { success: true, conversation: result.conversation };
            }

            return { success: false, error: result.error || "Failed to start chat" };
        } catch (error) {
            console.error("Error starting chat:", error);
            return { success: false, error: "Failed to start chat" };
        }
    };

    // Function 2: User fetches their own conversation + messages
    const fetchMyChat = async () => {
        try {
            const result = await FetchMyChat();
            console.log("Fetch My Chat Result:", result);

            if (result.success) {
                return { success: true, conversation: result.conversation, messages: result.messages };
            }

            return { success: false, error: result.error || "Failed to fetch your chats" };
        } catch (error) {
            console.error("Error fetching my chats:", error);
            return { success: false, error: "Failed to fetch your chats" };
        }
    };

    // Function 3: Send a message in a chat conversation
    const sendChatMessage = async (payload) => {
        try {
            const result = await SendChatMessage(payload);
            console.log("Send Chat Message Result:", result);

            if (result.success) {
                return { success: true, message: result.message };
            }

            return { success: false, error: result.error || "Failed to send message" };
        } catch (error) {
            console.error("Error sending chat message:", error);
            return { success: false, error: "Failed to send message" };
        }
    };

    // Function 4: Poll chat messages for a conversation
    const pollChatMessages = async (conversationId, since) => {
        try {
            const result = await PollChatMessages(conversationId, since);
            console.log("Poll Chat Messages Result:", result);

            if (result.success) {
                return { success: true, messages: result.messages };
            }

            return { success: false, error: result.error || "Failed to poll chat messages" };
        } catch (error) {
            console.error("Error polling chat messages:", error);
            return { success: false, error: "Failed to poll chat messages" };
        }
    };

    // Function 5: Upload a file in chat conversation
    const uploadChatFile = async (file) => {
        try {
            const result = await UploadChatFile(file);
            console.log("Upload Chat File Result:", result);

            if (result.success) {
                return { success: true, attachment: result.attachment, messageType: result.messageType };
            }

            return { success: false, error: result.error || "Failed to upload chat file" };
        } catch (error) {
            console.error("Error uploading chat file:", error);
            return { success: false, error: "Failed to upload chat file" };
        }
    };

    // ------ Admin Chat Related Functions (To be implemented) ------

    // Function 1: Admin - Fetch all chat conversations
    const fetchAllChats = async (params = {}) => {
        try {
            const result = await FetchAllChats(params);
            console.log("Fetch All Chats Result:", result);

            if (result.success) {
                return { success: true, conversations: result.conversations };
            }

            return { success: false, error: result.error || "Failed to fetch all chats" };
        } catch (error) {
            console.error("Error fetching all chats:", error);
            return { success: false, error: "Failed to fetch all chats" };
        }
    };

    // Function 2: Admin - Fetch all chat messages for a conversation
    const fetchChatMessages = async (conversationId) => {
        try {
            const result = await FetchChatMessages(conversationId);
            console.log("Fetch Chat Messages Result:", result);

            if (result.success) {
                return { success: true, messages: result.messages, conversation: result.conversation };
            }

            return { success: false, error: result.error || "Failed to fetch chat messages" };
        } catch (error) {
            console.error("Error fetching chat messages:", error);
            return { success: false, error: "Failed to fetch chat messages" };
        }
    };

    // Function 3: Admin - Send a message in a chat conversation
    const sendAdminChatMessage = async (conversationId, message) => {
        try {
            const result = await SendAdminChatMessage(conversationId, message);
            console.log("Send Admin Chat Message Result:", result);

            if (result.success) {
                return { success: true, message: result.message };
            }

            return { success: false, error: result.error || "Failed to send admin message" };
        } catch (error) {
            console.error("Error sending admin chat message:", error);
            return { success: false, error: "Failed to send admin message" };
        }
    };

    // Function 4: Admin - Update chat conversation status
    const updateChatStatus = async (conversationId, status) => {
        try {
            const result = await UpdateChatStatus(conversationId, status);
            console.log("Update Chat Status Result:", result);

            if (result.success) {
                return { success: true, conversation: result.conversation };
            }

            return { success: false, error: result.error || "Failed to update chat status" };
        } catch (error) {
            console.error("Error updating chat status:", error);
            return { success: false, error: "Failed to update chat status" };
        }
    };

    // Function 5: Admin - Poll new messages for a conversation
    const pollAdminChatMessages = async (conversationId, since) => {
        try {
            const result = await PollAdminChatMessages(conversationId, since);
            console.log("Poll Admin Chat Messages Result:", result);

            if (result.success) {
                return { success: true, messages: result.messages, conversation: result.conversation };
            }

            return { success: false, error: result.error || "Failed to poll admin chat messages" };
        } catch (error) {
            console.error("Error polling admin chat messages:", error);
            return { success: false, error: "Failed to poll admin chat messages" };
        }
    }

    const value = {
        // channels related functions
        fetchChannels,
        fetchAdminChannels,
        updateChannel,

        // inquiries related functions
        submitInquiry,
        fetchMyInquiries,
        fetchInquiries,
        updateInquiryStatus,
        deleteInquiry,

        // reports related functions
        submitReport,
        fetchMyReports,
        fetchAllReports,
        updateReport,
        deleteReport,

        // chat related functions
        startChat,
        fetchMyChat,
        sendChatMessage,
        pollChatMessages,
        uploadChatFile,

        // admin chat related functions
        fetchAllChats,
        fetchChatMessages,
        sendAdminChatMessage,
        updateChatStatus,
        pollAdminChatMessages
    };

    return (
        <SupportContext.Provider value={value}>
            {props.children}
        </SupportContext.Provider>
    )
}

export default SupportState
