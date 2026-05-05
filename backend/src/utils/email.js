const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@minerprices.com',
      to,
      subject,
      html,
    });
    console.log('📧 Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('📧 Email error:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (email, companyName, approvalUrl) => {
  const html = `
    <h2>Welcome to Miner Prices!</h2>
    <p>Hi ${companyName},</p>
    <p>Your account has been created successfully. Your profile is currently pending admin approval before it becomes visible on the platform.</p>
    <p>We'll notify you as soon as your account is approved. If you have any questions, contact us at admin@minerprices.com</p>
    <p>Best regards,<br/>The Miner Prices Team</p>
  `;
  return sendEmail(to, 'Welcome to Miner Prices', html);
};

const sendApprovalNotificationEmail = async (email, companyName, status) => {
  const html = `
    <h2>Account Status Update</h2>
    <p>Hi ${companyName},</p>
    <p>Your Miner Prices account has been ${status === 'approved' ? 'approved and is now live!' : 'rejected'}.</p>
    ${status === 'approved' ? '<p>You can now log in and add your hosting locations.</p>' : ''}
    <p>Best regards,<br/>The Miner Prices Team</p>
  `;
  return sendEmail(email, `Account ${status}`, html);
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const html = `
    <h2>Reset Your Password</h2>
    <p>Click the link below to reset your password (valid for 24 hours):</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>If you didn't request this, ignore this email.</p>
  `;
  return sendEmail(email, 'Reset Your Password', html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendApprovalNotificationEmail,
  sendPasswordResetEmail,
};
