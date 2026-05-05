const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { hashPassword, comparePassword, generateToken, generateResetToken } = require('../utils/auth');
const { sendWelcomeEmail, sendApprovalNotificationEmail, sendPasswordResetEmail } = require('../utils/email');

// Vendor Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, companyName, contactName, contactPhone, website, preApproved } = req.body;

    if (!email || !password || !companyName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingVendor = await db.query('SELECT id FROM vendors WHERE email = $1', [email]);
    if (existingVendor.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);
    const result = await db.query(
      `INSERT INTO vendors (email, password_hash, company_name, contact_name, contact_phone, website, pre_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, company_name, approved, pre_approved`,
      [email, passwordHash, companyName, contactName, contactPhone, website, preApproved || false]
    );

    const vendor = result.rows[0];
    const token = generateToken(vendor.id);

    // Send welcome email
    try {
      await sendWelcomeEmail(email, companyName, `${process.env.FRONTEND_URL}/vendor/dashboard`);
    } catch (err) {
      console.error('Failed to send welcome email:', err);
    }

    res.status(201).json({
      message: 'Registration successful. Awaiting admin approval.',
      vendor: {
        id: vendor.id,
        email: vendor.email,
        companyName: vendor.company_name,
        approved: vendor.approved,
        preApproved: vendor.pre_approved,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vendor Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await db.query(
      'SELECT id, email, company_name, password_hash, approved FROM vendors WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const vendor = result.rows[0];
    const passwordMatch = await comparePassword(password, vendor.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!vendor.approved) {
      return res.status(403).json({ error: 'Account pending admin approval' });
    }

    const token = generateToken(vendor.id);

    res.json({
      message: 'Login successful',
      vendor: {
        id: vendor.id,
        email: vendor.email,
        companyName: vendor.company_name,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request Password Reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const result = await db.query('SELECT id FROM vendors WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.json({ message: 'If email exists, reset link has been sent' });
    }

    const vendor = result.rows[0];
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.query(
      'INSERT INTO password_resets (vendor_id, token, expires_at) VALUES ($1, $2, $3)',
      [vendor.id, token, expiresAt]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetUrl);

    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and password required' });
    }

    const resetResult = await db.query(
      'SELECT vendor_id FROM password_resets WHERE token = $1 AND expires_at > NOW() AND used = false',
      [token]
    );

    if (resetResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const vendorId = resetResult.rows[0].vendor_id;
    const passwordHash = await hashPassword(newPassword);

    await db.query(
      'UPDATE vendors SET password_hash = $1 WHERE id = $2',
      [passwordHash, vendorId]
    );

    await db.query(
      'UPDATE password_resets SET used = true WHERE token = $1',
      [token]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
