require('dotenv').config();
const https = require('https');

const sendEmail = async (to, subject, message) => {
  try {
    const data = JSON.stringify({
      sender: { name: 'ProHealth Nexus', email: process.env.BREVO_USER },
      to: [{ email: to }],
      subject: subject,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">ProHealth Nexus</h2>
          <p>${message}</p>
          <hr />
          <p style="color: #9ca3af; font-size: 12px;">This is an automated message from ProHealth Nexus. Please do not reply.</p>
        </div>
      `
    });

    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log('Email sent to', to);
        } else {
          console.error('Email error:', body);
        }
      });
    });

    req.on('error', err => console.error('Email error:', err.message));
    req.write(data);
    req.end();

  } catch (err) {
    console.error('Email error:', err.message);
  }
};

module.exports = sendEmail;