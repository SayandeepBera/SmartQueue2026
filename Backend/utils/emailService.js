import { BrevoClient } from '@getbrevo/brevo';

const client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

export const sendNotificationEmail = async (email, subject, htmlContent) => {
    try {
        const response = await client.transactionalEmails.sendTransacEmail({
            subject: subject,
            htmlContent: htmlContent,
            sender: {
                name: 'SmartQueue Support',
                email: process.env.EMAIL_USER
            },
            to: [{ email }]
        });

        console.log('Email sent successfully:', response);
    } catch (error) {
        console.error('Brevo error:', error.response?.body || error);
        throw new Error('Failed to send email');
    }
};