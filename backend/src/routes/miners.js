const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Get all active miners (public)
router.get('/', async (req, res) => {
  try {
    const { algorithm, search } = req.query;
    let query = 'SELECT * FROM miners WHERE is_active = true';
    const params = [];

    if (algorithm) {
      query += ' AND algorithm = $1';
      params.push(algorithm);
    }

    if (search) {
      if (params.length > 0) {
        query += ` AND name ILIKE $${params.length + 1}`;
      } else {
        query += ' AND name ILIKE $1';
      }
      params.push(`%${search}%`);
    }

    query += ' ORDER BY name ASC LIMIT 100';

    const result = await db.query(query, params);
    res.json({
      miners: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Get miners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single miner
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM miners WHERE id = $1 AND is_active = true',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Miner not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get miner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get profitability estimates for a miner at specific locations
router.get('/:id/profitability', async (req, res) => {
  try {
    const minerId = req.params.id;

    const minerResult = await db.query(
      'SELECT * FROM miners WHERE id = $1',
      [minerId]
    );

    if (minerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Miner not found' });
    }

    const miner = minerResult.rows[0];

    const locationsResult = await db.query(
      `SELECT id, vendor_id, name, city, country, hosting_fee_per_kwh, setup_fee
       FROM locations
       WHERE is_active = true
       ORDER BY hosting_fee_per_kwh ASC`,
      []
    );

    const profitability = locationsResult.rows.map((loc) => {
      const dailyEnergy = (miner.power_consumption / 1000) * 24;
      const dailyHostingCost = dailyEnergy * loc.hosting_fee_per_kwh;
      const monthlyHostingCost = dailyHostingCost * 30;
      const monthlySetupAllocation = loc.setup_fee ? loc.setup_fee / 12 : 0;

      return {
        location: {
          id: loc.id,
          name: loc.name,
          city: loc.city,
          country: loc.country,
        },
        dailyEnergyCost: dailyHostingCost,
        monthlyHostingCost,
        monthlySetupAllocation,
        totalMonthlyCost: monthlyHostingCost + monthlySetupAllocation,
      };
    });

    res.json({
      miner: {
        id: miner.id,
        name: miner.name,
        powerConsumption: miner.power_consumption,
      },
      profitability: profitability.slice(0, 10), // Top 10 cheapest
    });
  } catch (error) {
    console.error('Get profitability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available algorithms (for filters)
router.get('/api/algorithms', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT DISTINCT algorithm FROM miners WHERE is_active = true ORDER BY algorithm'
    );
    res.json({
      algorithms: result.rows.map((r) => r.algorithm),
    });
  } catch (error) {
    console.error('Get algorithms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
