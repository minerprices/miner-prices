const express = require('express');
const router = express.Router();
const { db } = require('../db/sqlite-init');

// Get all miners
router.get('/', async (req, res) => {
  try {
    const { algorithm, search } = req.query;

    let query = 'SELECT * FROM miners WHERE 1=1';
    const params = [];

    if (algorithm) {
      query += ' AND algorithm = ?';
      params.push(algorithm);
    }

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' LIMIT 100';

    const miners = db.prepare(query).all(...params);

    res.json({
      miners: miners || [],
      count: miners?.length || 0
    });
  } catch (error) {
    console.error('Miners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single miner
router.get('/:id', async (req, res) => {
  try {
    const miner = db.prepare('SELECT * FROM miners WHERE id = ?').get(req.params.id);

    if (!miner) {
      return res.status(404).json({ error: 'Miner not found' });
    }

    res.json(miner);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get algorithms
router.get('/api/algorithms', async (req, res) => {
  try {
    const algorithms = db.prepare('SELECT DISTINCT algorithm FROM miners WHERE algorithm IS NOT NULL').all();

    res.json({
      algorithms: algorithms.map(a => a.algorithm) || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
