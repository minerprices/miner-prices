const express = require('express');
const router = express.Router();
const { db } = require('../db/sqlite-init');

/**
 * Advanced Mining Profitability Calculator
 * Takes miner specs, coin, electricity cost, and calculates detailed ROI
 */

function calculateDailyProfit(minerPower, minerHashrate, coinPrice, coinBlockReward, coinBlockTime, difficulty, electricityCost = 0.08) {
  const blocksPerDay = (24 * 3600) / coinBlockTime;
  const dailyReward = (minerHashrate * coinBlockReward * blocksPerDay) / difficulty;
  const dailyRevenue = dailyReward * coinPrice;
  const powerCostDaily = (minerPower / 1000) * 24 * electricityCost;
  
  return Math.max(0, dailyRevenue - powerCostDaily);
}

// POST /api/calculator/compare
// Compare multiple miners on same coin
router.post('/compare', (req, res) => {
  try {
    const { miner_ids, coin_id, electricity_cost = 0.08, location_fee = 0 } = req.body;

    if (!miner_ids || !Array.isArray(miner_ids) || !coin_id) {
      return res.status(400).json({ error: 'miner_ids array and coin_id required' });
    }

    const coin = db.prepare('SELECT * FROM coins WHERE id = ?').get(coin_id);
    if (!coin) {
      return res.status(404).json({ error: 'Coin not found' });
    }

    const miners = db.prepare('SELECT * FROM miners WHERE id IN (' + miner_ids.join(',') + ')').all();

    const comparison = miners.map(miner => {
      const specs = JSON.parse(miner.specs || '{}');
      const dailyProfit = calculateDailyProfit(
        miner.power_consumption,
        specs.hashrate || 1,
        coin.price,
        coin.block_reward,
        coin.block_time,
        coin.network_difficulty,
        electricity_cost
      );

      const monthlyProfit = dailyProfit * 30;
      const yearlyProfit = dailyProfit * 365;
      const efficiency = miner.power_consumption / (specs.hashrate || 1);

      return {
        miner_id: miner.id,
        miner_name: miner.name,
        hashrate: specs.hashrate || 0,
        power_consumption: miner.power_consumption,
        efficiency: efficiency.toFixed(2),
        daily_profit: dailyProfit.toFixed(2),
        monthly_profit: monthlyProfit.toFixed(2),
        yearly_profit: yearlyProfit.toFixed(2),
        daily_cost: ((miner.power_consumption / 1000) * 24 * electricity_cost).toFixed(2),
      };
    }).sort((a, b) => b.daily_profit - a.daily_profit);

    res.json({
      coin: coin.symbol,
      electricity_cost,
      comparison,
      best_miner: comparison[0]?.miner_name || 'N/A'
    });
  } catch (error) {
    console.error('Compare error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/calculator/roi
// Calculate ROI (Return on Investment) for a miner
router.post('/roi', (req, res) => {
  try {
    const { miner_id, coin_id, miner_cost_usd = 1000, electricity_cost = 0.08 } = req.body;

    const miner = db.prepare('SELECT * FROM miners WHERE id = ?').get(miner_id);
    const coin = db.prepare('SELECT * FROM coins WHERE id = ?').get(coin_id);

    if (!miner || !coin) {
      return res.status(404).json({ error: 'Miner or coin not found' });
    }

    const specs = JSON.parse(miner.specs || '{}');
    const dailyProfit = calculateDailyProfit(
      miner.power_consumption,
      specs.hashrate || 1,
      coin.price,
      coin.block_reward,
      coin.block_time,
      coin.network_difficulty,
      electricity_cost
    );

    const daysToBreakEven = miner_cost_usd / dailyProfit;
    const monthlyProfit = dailyProfit * 30;
    const yearlyProfit = dailyProfit * 365;

    res.json({
      miner_name: miner.name,
      coin: coin.symbol,
      miner_cost_usd,
      daily_profit: dailyProfit.toFixed(2),
      monthly_profit: monthlyProfit.toFixed(2),
      yearly_profit: yearlyProfit.toFixed(2),
      days_to_breakeven: daysToBreakEven.toFixed(1),
      electricity_cost,
      power_consumption: miner.power_consumption,
    });
  } catch (error) {
    console.error('ROI error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/calculator/hosting-comparison
// Compare hosting providers
router.get('/hosting-comparison', (req, res) => {
  try {
    const { miner_id, coin_id, electricity_cost = 0.08 } = req.query;

    if (!miner_id || !coin_id) {
      return res.status(400).json({ error: 'miner_id and coin_id required' });
    }

    const miner = db.prepare('SELECT * FROM miners WHERE id = ?').get(miner_id);
    const coin = db.prepare('SELECT * FROM coins WHERE id = ?').get(coin_id);

    if (!miner || !coin) {
      return res.status(404).json({ error: 'Miner or coin not found' });
    }

    const specs = JSON.parse(miner.specs || '{}');
    const baseDailyProfit = calculateDailyProfit(
      miner.power_consumption,
      specs.hashrate || 1,
      coin.price,
      coin.block_reward,
      coin.block_time,
      coin.network_difficulty,
      electricity_cost
    );

    const locations = db.prepare(`
      SELECT l.*, v.company_name as vendor_name
      FROM locations l
      JOIN vendors v ON l.vendor_id = v.id
      WHERE l.is_active = 1
    `).all();

    const comparison = locations.map(loc => {
      const hostingCostDaily = (miner.power_consumption / 1000) * 24 * loc.hosting_fee_per_kwh;
      const profitWithHosting = baseDailyProfit - hostingCostDaily;

      return {
        location: loc.name,
        vendor: loc.vendor_name,
        country: loc.country,
        hosting_fee: loc.hosting_fee_per_kwh,
        daily_hosting_cost: hostingCostDaily.toFixed(2),
        daily_profit: profitWithHosting.toFixed(2),
        monthly_profit: (profitWithHosting * 30).toFixed(2),
        yearly_profit: (profitWithHosting * 365).toFixed(2),
      };
    }).sort((a, b) => b.daily_profit - a.daily_profit);

    res.json({
      miner_name: miner.name,
      coin: coin.symbol,
      base_daily_profit: baseDailyProfit.toFixed(2),
      hosting_locations: comparison,
      best_location: comparison[0]?.location || 'N/A'
    });
  } catch (error) {
    console.error('Hosting comparison error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/calculator/efficiency-ranking
// Rank miners by efficiency
router.get('/efficiency-ranking', (req, res) => {
  try {
    const { algorithm } = req.query;

    let query = 'SELECT * FROM miners WHERE is_active = 1';
    const params = [];

    if (algorithm) {
      query += ' AND algorithm = ?';
      params.push(algorithm);
    }

    const miners = db.prepare(query).all(...params);

    const ranking = miners.map(miner => {
      const specs = JSON.parse(miner.specs || '{}');
      const efficiency = miner.power_consumption / (specs.hashrate || 1);

      return {
        miner_id: miner.id,
        miner_name: miner.name,
        algorithm: miner.algorithm,
        power_consumption: miner.power_consumption,
        hashrate: specs.hashrate || 0,
        efficiency_watts_per_unit: efficiency.toFixed(4),
        efficiency_rank: 0,
      };
    }).sort((a, b) => a.efficiency_watts_per_unit - b.efficiency_watts_per_unit)
     .map((m, idx) => ({ ...m, efficiency_rank: idx + 1 }));

    res.json({ efficiency_ranking: ranking });
  } catch (error) {
    console.error('Efficiency ranking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
