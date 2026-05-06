const express = require('express');
const router = express.Router();
const { db } = require('../db/sqlite-init');

// Calculate daily profit: (hashrate * coin_block_reward * blocks_per_day * price) / network_difficulty - power_cost
function calculateProfit(miner, coin, electricityCostPerKwh = 0.08) {
  const minerSpecs = JSON.parse(miner.specs || '{}');
  const hashrate = parseFloat(minerSpecs.hashrate) || 1; // TH/s or similar
  
  if (!coin.block_reward || !coin.price) return 0;

  const blocksPerDay = (24 * 3600) / coin.block_time;
  const dailyReward = (hashrate * coin.block_reward * blocksPerDay) / (coin.network_difficulty || 1000);
  const dailyRevenue = dailyReward * coin.price;
  
  const powerCostDaily = (miner.power_consumption / 1000) * 24 * electricityCostPerKwh;
  
  return Math.max(0, dailyRevenue - powerCostDaily);
}

// Get profitability for all miners and coins
router.get('/', async (req, res) => {
  try {
    const { miner_id, coin_id, electricity_cost } = req.query;
    const electricityCost = parseFloat(electricity_cost) || 0.08;

    let query = `
      SELECT 
        m.id, m.name as miner_name, m.algorithm, m.power_consumption,
        c.id as coin_id, c.symbol, c.name as coin_name, c.price, c.algorithm as coin_algorithm
      FROM miners m
      CROSS JOIN coins c
      WHERE m.is_active = 1
    `;

    const params = [];

    if (miner_id) {
      query += ' AND m.id = ?';
      params.push(miner_id);
    }

    if (coin_id) {
      query += ' AND c.id = ?';
      params.push(coin_id);
    }

    query += ' ORDER BY m.name, c.symbol';

    const results = db.prepare(query).all(...params);

    // Calculate profitability for matching pairs
    const profitability = results
      .filter(r => r.algorithm === r.coin_algorithm) // Only mine compatible coins
      .map(r => ({
        miner_id: r.id,
        miner_name: r.miner_name,
        coin_id: r.coin_id,
        coin_symbol: r.symbol,
        coin_name: r.coin_name,
        price: r.price,
        daily_profit: calculateProfit(
          { specs: '{}', power_consumption: r.power_consumption, hashrate: 1 },
          r,
          electricityCost
        ),
        power_consumption: r.power_consumption,
      }));

    res.json({
      profitability: profitability.sort((a, b) => b.daily_profit - a.daily_profit),
      electricity_cost: electricityCost
    });
  } catch (error) {
    console.error('Profitability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single miner profitability across coins
router.get('/miner/:minerId', async (req, res) => {
  try {
    const miner = db.prepare('SELECT * FROM miners WHERE id = ?').get(req.params.minerId);
    
    if (!miner) {
      return res.status(404).json({ error: 'Miner not found' });
    }

    const coins = db.prepare('SELECT * FROM coins ORDER BY price DESC').all();
    
    const profits = coins
      .filter(c => c.algorithm === miner.algorithm)
      .map(c => ({
        coin_symbol: c.symbol,
        coin_name: c.name,
        price: c.price,
        daily_profit: calculateProfit(miner, c),
        monthly_profit: calculateProfit(miner, c) * 30,
        yearly_profit: calculateProfit(miner, c) * 365,
      }))
      .sort((a, b) => b.daily_profit - a.daily_profit);

    res.json({
      miner_name: miner.name,
      power_consumption: miner.power_consumption,
      algorithm: miner.algorithm,
      profits: profits,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get rankings
router.get('/rankings', async (req, res) => {
  try {
    const { algorithm } = req.query;

    let query = `
      SELECT 
        m.id, m.name, m.power_consumption, m.algorithm,
        c.symbol, c.price
      FROM miners m
      CROSS JOIN coins c
      WHERE m.is_active = 1 AND m.algorithm = c.algorithm
    `;

    const params = [];

    if (algorithm) {
      query += ' AND m.algorithm = ?';
      params.push(algorithm);
    }

    const results = db.prepare(query).all(...params);

    const rankings = results
      .map(r => ({
        miner_id: r.id,
        miner_name: r.name,
        algorithm: r.algorithm,
        power_consumption: r.power_consumption,
        best_coin: r.symbol,
        coin_price: r.price,
        daily_profit: calculateProfit(
          { specs: '{}', power_consumption: r.power_consumption },
          { price: r.price, block_reward: 1, block_time: 600, network_difficulty: 1000 }
        ),
      }))
      .sort((a, b) => b.daily_profit - a.daily_profit);

    res.json({ rankings });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
