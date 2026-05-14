import cron from "node-cron";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { sendNotificationEmail } from "../utils/emailService.js";
import { getOrgDeactivationTemplate } from "../utils/emailTemplates.js";

// Utility function to delete all associated files of an organization from Cloudinary
const deleteOrgFiles = async (org) => {
    const fields = ["docRegCert", "docGst", "docAddressProof", "logo"];

    // Delete all associated files from Cloudinary
    for (const field of fields) {
        if (org[field]?.public_id) {
            await deleteFromCloudinary(org[field].public_id);
        }
    }
}

const startGuideCleanupTask = () => {
    // Schedule the task to run every day at midnight
    cron.schedule("0 0 * * *", async () => {
        try {
            const now = new Date();

            // Find organizations that are scheduled for deletion and have expired
            const expiredOrganizations = await Organization.find({
                status: "scheduled_for_deletion",
                deletionExpiredAt: { $lt: now },
            }).populate("userId");

            for (const org of expiredOrganizations) {
                // Delete all associated files from Cloudinary
                await deleteOrgFiles(org);

                // Update the associated user's role back to "pending_org" if they exist
                if(org.userId) {
                    await User.findByIdAndUpdate(org.userId, { role: "pending_org" });
                }

                // Send notification email to the organization owner about the deactivation
                const finalEmailHtml = getOrgDeactivationTemplate(org.orgName);
                if(org.userId?.email) {
                    await sendNotificationEmail(org.userId.email, "Update: Your Organization Profile has been Deactivated", finalEmailHtml);
                }

                // Finally, update the organization's status to "rejected" and clear all sensitive data
                await Organization.findByIdAndUpdate(org._id, {
                    $set: {
                        status: "rejected",
                        rejectionReason: "This organization profile has been deactivated as per our data retention policy. If you wish to re-register, please contact support.",
                        docRegCert: null,
                        docGst: null,
                        docAddressProof: null,
                        logo: null,
                        deletionExpiredAt: null
                    }
                });

                console.log(`Organization ${org.orgName} has been deactivated.`);
            }
        } catch (error) {
            console.error("Error occurred while cleaning up expired organizations:", error);
        }
    });
}

export default startGuideCleanupTask;