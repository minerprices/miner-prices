const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { vendorAuth } = require('../middleware/auth');

// Get all public locations (sorted by cost)
router.get('/', async (req, res) => {
  try {
    const { country, algorithm } = req.query;
    let query = `
      SELECT l.*, v.company_name
      FROM locations l
      JOIN vendors v ON l.vendor_id = v.id
      WHERE l.is_active = true AND v.approved = true
    `;
    const params = [];

    if (country) {
      query += ` AND l.country = $${params.length + 1}`;
      params.push(country);
    }

    query += ' ORDER BY l.hosting_fee_per_kwh ASC LIMIT 100';

    const result = await db.query(query, params);
    res.json({
      locations: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single location details
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.*, v.company_name, v.website
       FROM locations l
       JOIN vendors v ON l.vendor_id = v.id
       WHERE l.id = $1 AND l.is_active = true AND v.approved = true`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vendor's locations (requires auth)
router.get('/vendor/me', vendorAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM locations WHERE vendor_id = $1 ORDER BY created_at DESC',
      [req.vendor.id]
    );

    res.json({
      locations: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Get vendor locations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create location (vendor auth required)
router.post('/', vendorAuth, async (req, res) => {
  try {
    const {
      name,
      city,
      country,
      coolingType,
      powerCostPerKwh,
      bandwidthIncludedMbps,
      setupFee,
      hostingFeePerKwh,
      availablePowerKw,
      description,
      contactEmail,
      contactPhone,
      website,
    } = req.body;

    if (!name || !city || !country || !hostingFeePerKwh) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.query(
      `INSERT INTO locations 
       (vendor_id, name, city, country, cooling_type, power_cost_per_kwh, bandwidth_included_mbps,
        setup_fee, hosting_fee_per_kwh, available_power_kw, description, contact_email, contact_phone, website)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        req.vendor.id,
        name,
        city,
        country,
        coolingType,
        powerCostPerKwh,
        bandwidthIncludedMbps,
        setupFee,
        hostingFeePerKwh,
        availablePowerKw,
        description,
        contactEmail,
        contactPhone,
        website,
      ]
    );

    res.status(201).json({
      message: 'Location created successfully',
      location: result.rows[0],
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update location (vendor auth required)
router.put('/:id', vendorAuth, async (req, res) => {
  try {
    const locationId = req.params.id;

    // Verify ownership
    const ownershipCheck = await db.query(
      'SELECT vendor_id FROM locations WHERE id = $1',
      [locationId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    if (ownershipCheck.rows[0].vendor_id !== req.vendor.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, city, country, hostingFeePerKwh, description, isActive } = req.body;

    const result = await db.query(
      `UPDATE locations
       SET name = COALESCE($1, name),
           city = COALESCE($2, city),
           country = COALESCE($3, country),
           hosting_fee_per_kwh = COALESCE($4, hosting_fee_per_kwh),
           description = COALESCE($5, description),
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, city, country, hostingFeePerKwh, description, isActive, locationId]
    );

    res.json({
      message: 'Location updated successfully',
      location: result.rows[0],
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete location (soft delete)
router.delete('/:id', vendorAuth, async (req, res) => {
  try {
    const locationId = req.params.id;

    const ownershipCheck = await db.query(
      'SELECT vendor_id FROM locations WHERE id = $1',
      [locationId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    if (ownershipCheck.rows[0].vendor_id !== req.vendor.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.query(
      'UPDATE locations SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [locationId]
    );

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
