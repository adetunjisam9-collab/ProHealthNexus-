const sendEmail = require('../utils/email');
const auditLog = require('../utils/auditLog');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const validatePassword = (password) => {
  
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*]/.test(password)) return 'Password must contain at least one special character (!@#$%^&*)';
  return null;
};
const validateEmail = (email) => {
  // Check basic format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email format';

  // Check for common fake/disposable domains
  const blockedDomains = [
    'fakeemail.com', 'fake.com', 'test.com', 'example.com',
    'mailinator.com', 'guerrillamail.com', 'tempmail.com',
    'throwam.com', 'yopmail.com', 'sharklasers.com',
    'guerrillamailblock.com', 'grr.la', 'spam4.me',
    'trashmail.com', 'dispostable.com', 'maildrop.cc',
    'temp-mail.org', 'getnada.com', 'tempr.email',
  ];

  const domain = email.split('@')[1].toLowerCase();
  if (blockedDomains.includes(domain)) {
    return 'Please use a valid email address. Disposable or fake emails are not allowed';
  }

  // Check for valid TLD (at least 2 characters)
  const tld = domain.split('.').pop();
  if (tld.length < 2) return 'Invalid email domain';

  return null;
};

// Register
router.post('/register', async (req, res) => {
  const { full_name, email, password, role } = req.body;
  // Block admin registration from public endpoint
if (role === 'admin') {
  return res.status(403).json({ error: 'Admin accounts cannot be created from this page' });
}
const emailError = validateEmail(email);
if (emailError) {
  return res.status(400).json({ error: emailError });
}
  const passwordError = validatePassword(password);
if (passwordError) {
  return res.status(400).json({ error: passwordError });
}

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to database
    const newUser = await pool.query(
      'INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role',
      [full_name, email, hashedPassword, role]
    );

    // Create JWT token
    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Generate verification token
const crypto = require('crypto');
const verificationToken = crypto.randomBytes(32).toString('hex');

// Save verification token to database
await pool.query(
  'UPDATE users SET verification_token = $1 WHERE id = $2',
  [verificationToken, newUser.rows[0].id]
);

// Send verification email
const verificationLink = `${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`;
await sendEmail(
  email,
  'Verify your ProHealth Nexus account',
  `Dear ${full_name},<br><br>
  Welcome to ProHealth Nexus! Please verify your email address by clicking the link below:<br><br>
  <a href="${verificationLink}" style="background:#2563eb; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">
    Verify My Email
  </a><br><br>
  This link expires in 24 hours.<br><br>
  If you did not create this account please ignore this email.`
);

// Log the registration
await auditLog(newUser.rows[0].id, 'REGISTER', `New ${role} account created for ${email}`, req.ip);

res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login - Step 1: Verify credentials and send OTP
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

   // Check if email is verified
if (!user.rows[0].is_verified) {
  return res.status(400).json({ error: 'Please verify your email address before logging in. Check your inbox for the verification link.' });
}

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Store OTP in database
    await pool.query(
      'UPDATE users SET otp = $1, otp_expiry = $2 WHERE id = $3',
      [otp, otpExpiry, user.rows[0].id]
    );

    // Send OTP email
    await sendEmail(
      user.rows[0].email,
      'Your ProHealth Nexus Login Code',
      `Dear ${user.rows[0].full_name},<br><br>
      Your login verification code is:<br><br>
      <h1 style="color:#2563eb; letter-spacing: 8px;">${otp}</h1>
      <br>This code expires in 3 minutes.<br><br>
      If you did not request this code please ignore this email.`
    );

    res.json({ message: 'OTP sent to your email', userId: user.rows[0].id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login - Step 2: Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE id = $1', [userId]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check OTP
    if (user.rows[0].otp !== otp) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Check OTP expiry
    if (new Date() > new Date(user.rows[0].otp_expiry)) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    // Clear OTP
    await pool.query(
      'UPDATE users SET otp = NULL, otp_expiry = NULL WHERE id = $1',
      [user.rows[0].id]
    );

    // Create JWT token
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log the login
    await auditLog(user.rows[0].id, 'LOGIN', `User ${user.rows[0].email} logged in with 2FA`, req.ip);

    res.json({ token, user: { id: user.rows[0].id, full_name: user.rows[0].full_name, email: user.rows[0].email, role: user.rows[0].role } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await pool.query(
      "SELECT id, full_name, email FROM users WHERE role = 'doctor'"
    );
    res.json(doctors.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await pool.query(
      'SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Get current user profile
router.get('/profile', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    const user = await pool.query(
      'SELECT id, full_name, email, role, created_at FROM users WHERE id = $1',
      [decoded.id]
    );
    res.json(user.rows[0]);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  const { full_name, email, password } = req.body;

  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);

    let query, values;

    if (password) {
  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }
  const hashedPassword = await require('bcryptjs').hash(password, 10);
      query = 'UPDATE users SET full_name = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, full_name, email, role';
      values = [full_name, email, hashedPassword, decoded.id];
    } else {
      query = 'UPDATE users SET full_name = $1, email = $2 WHERE id = $3 RETURNING id, full_name, email, role';
      values = [full_name, email, decoded.id];
    }

    const updated = await pool.query(query, values);

    // Log the profile update
    await auditLog(decoded.id, 'PROFILE_UPDATE', `User updated their profile`, req.ip);

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Get all patients
router.get('/patients', async (req, res) => {
  try {
    const patients = await pool.query(
      "SELECT id, full_name, email FROM users WHERE role = 'patient' ORDER BY full_name ASC"
    );
    res.json(patients.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Get audit logs (admin only)
router.get('/audit-logs', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const logs = await pool.query(
      `SELECT a.*, u.full_name, u.email, u.role as user_role 
       FROM audit_logs a 
       LEFT JOIN users u ON a.user_id = u.id 
       ORDER BY a.created_at DESC 
       LIMIT 100`
    );
    res.json(logs.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Create admin account (existing admin only)
router.post('/create-admin', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const { full_name, email, password } = req.body;

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await require('bcryptjs').hash(password, 10);
    const newAdmin = await pool.query(
      'INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role',
      [full_name, email, hashedPassword, 'admin']
    );

    await auditLog(decoded.id, 'CREATE_ADMIN', `Admin created new admin account for ${email}`, req.ip);

    res.status(201).json(newAdmin.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Verify email
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE verification_token = $1',
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).send(`
        <html>
          <body style="font-family:Arial; text-align:center; padding:50px;">
            <h2 style="color:#dc2626;">Invalid or expired verification link</h2>
            <p>Please register again or contact support.</p>
          </body>
        </html>
      `);
    }

    // Mark user as verified
    await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL WHERE id = $1',
      [user.rows[0].id]
    );

    res.send(`
      <html>
        <body style="font-family:Arial; text-align:center; padding:50px; background:#f8faff;">
          <div style="max-width:400px; margin:0 auto; background:white; padding:2rem; border-radius:20px; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <div style="font-size:48px; margin-bottom:1rem;">✅</div>
            <h2 style="color:#1e3a5f;">Email Verified!</h2>
            <p style="color:#6b7280;">Your ProHealth Nexus account has been verified successfully.</p>
            <a href="${process.env.FRONTEND_URL}/login" style="display:inline-block; margin-top:1rem; background:linear-gradient(135deg,#1e3a5f,#2563eb); color:white; padding:12px 24px; border-radius:10px; text-decoration:none; font-weight:bold;">
              Go to Login
            </a>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'No account found with that email address' });
    }

    // Generate reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Save reset token to database
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, resetExpiry, user.rows[0].id]
    );

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail(
      email,
      'Reset Your ProHealth Nexus Password',
      `Dear ${user.rows[0].full_name},<br><br>
      We received a request to reset your ProHealth Nexus password.<br><br>
      Click the button below to reset your password:<br><br>
      <a href="${resetLink}" style="background:#2563eb; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">
        Reset My Password
      </a><br><br>
      This link expires in 30 minutes.<br><br>
      If you did not request a password reset please ignore this email and your password will remain unchanged.`
    );

    await auditLog(user.rows[0].id, 'FORGOT_PASSWORD', `Password reset requested for ${email}`, req.ip);

    res.json({ message: 'Password reset link sent to your email!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1', [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    // Check expiry
    if (new Date() > new Date(user.rows[0].reset_token_expiry)) {
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
    }

    // Validate new password
    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    // Hash new password
    const hashedPassword = await require('bcryptjs').hash(password, 10);

    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, user.rows[0].id]
    );

    await auditLog(user.rows[0].id, 'RESET_PASSWORD', `Password reset successful for ${user.rows[0].email}`, req.ip);

    res.json({ message: 'Password reset successful! You can now log in with your new password.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;