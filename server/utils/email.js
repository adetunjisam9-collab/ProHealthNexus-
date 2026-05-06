const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

const sendEmail = async (to, subject, message) => {
  try {
    await transporter.sendMail({
      from: `"ProHealth Nexus" <${process.env.BREVO_USER}>`,
      to,
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