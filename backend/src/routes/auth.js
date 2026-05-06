const express = require('express');
const router = express.Router();
const { db } = require('../db/sqlite-init');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if admin
    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);

    if (admin) {
      const match = await bcrypt.compare(password, admin.password_hash);
      if (match) {
        const token = jwt.sign({ id: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token, role: 'admin' });
      }
    }

    // Check if vendor
    const vendor = db.prepare('SELECT * FROM vendors WHERE email = ?').get(email);

    if (vendor && await bcrypt.compare(password, vendor.password_hash)) {
      const token = jwt.sign({ id: vendor.id, role: 'vendor' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, role: 'vendor' });
    }

    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vendor register
router.post('/register', async (req, res) => {
  try {
    const { email, password, companyName } = req.body;

    if (!email || !password || !companyName) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const hash = await bcrypt.hash(password, 10);

    db.prepare(`
      INSERT INTO vendors (email, password_hash, company_name, approved)
      VALUES (?, ?, ?, 0)
    `).run(email, hash, companyName);

    res.json({ message: 'Vendor registered. Awaiting approval.' });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
