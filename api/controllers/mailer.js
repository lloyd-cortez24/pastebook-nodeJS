import { createTransport } from 'nodemailer';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Insert oAuth2 setup here

export const sendVerificationEmail = async (email, verificationToken) => {
    const mailOptions = {
        from: 'lloydcortez91@gmail.com',
        to: email,
        subject: 'Account Verification',
        html: `<p>Please click <a href="http://localhost:3000/login">here</a> to verify your account.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};