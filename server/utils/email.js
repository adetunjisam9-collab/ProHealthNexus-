const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, message) => {
  try {
    await sgMail.send({
      to,
      from: process.env.EMAIL_USER,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">ProHealth Nexus</h2>
          <p>${message}</p>
          <hr />
          <p style="color: #9ca3af; font-size: 12px;">This is an automated message from ProHealth Nexus. Please do not reply.</p>
        </div>
      `,
    });
    console.log('Email sent to', to);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

module.exports = sendEmail;