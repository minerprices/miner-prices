const express = require('express');
const router = express.Router();
const { db } = require('../db/sqlite-init');
const bcrypt = require('bcryptjs');

// GET /api/vendors - List all approved vendors with locations
router.get('/', (req, res) => {
  try {
    const { country } = req.query;

    let query = `
      SELECT 
        v.id, v.company_name, v.email,
        COUNT(l.id) as location_count,
        MIN(l.hosting_fee_per_kwh) as min_fee
      FROM vendors v
      LEFT JOIN locations l ON v.id = l.vendor_id AND l.is_active = 1
      WHERE v.approved = 1
    `;

    const params = [];

    if (country) {
      query += ' AND l.country = ?';
      params.push(country);
    }

    query += ' GROUP BY v.id ORDER BY v.company_name';

    const vendors = db.prepare(query).all(...params);

    res.json({
      vendors: vendors.map(v => ({
        id: v.id,
        name: v.company_name,
        locations: v.location_count,
        lowest_fee: v.min_fee ? v.min_fee.toFixed(4) : 'N/A',
      })),
      count: vendors.length,
    });
  } catch (error) {
    console.error('Vendors list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/vendors/:id - Get vendor details with all locations
router.get('/:id', (req, res) => {
  try {
    const vendor = db.prepare('SELECT * FROM vendors WHERE id = ? AND approved = 1').get(req.params.id);

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const locations = db.prepare(`
      SELECT id, name, country, hosting_fee_per_kwh, is_active
      FROM locations
      WHERE vendor_id = ? AND is_active = 1
      ORDER BY hosting_fee_per_kwh
    `).all(req.params.id);

    res.json({
      vendor: {
        id: vendor.id,
        name: vendor.company_name,
        email: vendor.email,
      },
      locations: locations.map(l => ({
        id: l.id,
        name: l.name,
        country: l.country,
        fee_per_kwh: l.hosting_fee_per_kwh,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/vendors/register - Vendor self-registration
router.post('/register', (req, res) => {
  try {
    const { email, password, company_name, website, contact_name, contact_phone } = req.body;

    if (!email || !password || !company_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hash = bcrypt.hashSync(password, 10);

    const result = db.prepare(`
      INSERT INTO vendors (email, password_hash, company_name, approved)
      VALUES (?, ?, ?, 0)
    `).run(email, hash, company_name);

    res.json({
      status: 'registered',
      message: 'Vendor registration submitted. Awaiting admin approval.',
      vendor_id: result.lastInsertRowid,
    });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/vendors/add-location - Add hosting location (vendor only)
router.post('/add-location', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { vendor_id, name, country, hosting_fee_per_kwh } = req.body;

    if (!name || !country || !hosting_fee_per_kwh) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = db.prepare(`
      INSERT INTO locations (vendor_id, name, country, hosting_fee_per_kwh, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).run(vendor_id, name, country, parseFloat(hosting_fee_per_kwh));

    res.json({
      status: 'success',
      location_id: result.lastInsertRowid,
      message: 'Location added successfully',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add location' });
  }
});

// GET /api/vendors/locations - Get all locations grouped by vendor
router.get('/locations/all', (req, res) => {
  try {
    const { country, max_fee } = req.query;

    let query = `
      SELECT 
        v.id as vendor_id,
        v.company_name,
        l.id as location_id,
        l.name,
        l.country,
        l.hosting_fee_per_kwh
      FROM vendors v
      JOIN locations l ON v.id = l.vendor_id
      WHERE v.approved = 1 AND l.is_active = 1
    `;

    const params = [];

    if (country) {
      query += ' AND l.country = ?';
      params.push(country);
    }

    if (max_fee) {
      query += ' AND l.hosting_fee_per_kwh <= ?';
      params.push(parseFloat(max_fee));
    }

    query += ' ORDER BY l.hosting_fee_per_kwh ASC';

    const locations = db.prepare(query).all(...params);

    // Group by vendor
    const grouped = {};
    locations.forEach(loc => {
      if (!grouped[loc.vendor_id]) {
        grouped[loc.vendor_id] = {
          vendor: loc.company_name,
          locations: [],
        };
      }
      grouped[loc.vendor_id].locations.push({
        id: loc.location_id,
        name: loc.name,
        country: loc.country,
        fee: loc.hosting_fee_per_kwh,
      });
    });

    res.json({
      hosting_locations: Object.values(grouped),
      count: locations.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
