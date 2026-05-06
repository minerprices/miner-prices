const express = require('express');
const router = express.Router();
const { db } = require('../db/sqlite-init');

/**
 * ORIGINAL MINING TOOLS
 * Unique features not found elsewhere
 */

// Tool 1: Hashrate Converter
// Convert mining power into daily rewards
router.post('/hashrate-converter', (req, res) => {
  try {
    const { hashrate, hashrate_unit, coin_id, difficulty, block_time, block_reward } = req.body;

    if (!hashrate || !hashrate_unit || !coin_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const coin = db.prepare('SELECT * FROM coins WHERE id = ?').get(coin_id);
    if (!coin) {
      return res.status(404).json({ error: 'Coin not found' });
    }

    // Convert all to base unit (H/s)
    const unitMultipliers = {
      'H/s': 1,
      'KH/s': 1000,
      'MH/s': 1000000,
      'GH/s': 1000000000,
      'TH/s': 1000000000000,
      'PH/s': 1000000000000000,
    };

    const baseHashrate = hashrate * (unitMultipliers[hashrate_unit] || 1);
    const diff = difficulty || coin.network_difficulty || 1000;
    const blockTime = block_time || coin.block_time || 600;
    const reward = block_reward || coin.block_reward || 1;

    const blocksPerDay = (24 * 3600) / blockTime;
    const dailyReward = (baseHashrate * reward * blocksPerDay) / diff;
    const dailyRevenue = dailyReward * coin.price;
    const monthlyRevenue = dailyRevenue * 30;
    const yearlyRevenue = dailyRevenue * 365;

    res.json({
      coin: coin.symbol,
      input_hashrate: `${hashrate} ${hashrate_unit}`,
      base_hashrate: baseHashrate.toFixed(0),
      daily_coins: dailyReward.toFixed(8),
      daily_usd: dailyRevenue.toFixed(2),
      monthly_usd: monthlyRevenue.toFixed(2),
      yearly_usd: yearlyRevenue.toFixed(2),
      difficulty: diff,
    });
  } catch (error) {
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// Tool 2: Energy Cost Analyzer by Region
// Calculate power costs in different countries
router.get('/energy-analyzer', (req, res) => {
  try {
    const { power_consumption_watts, hours_per_day = 24 } = req.query;

    if (!power_consumption_watts) {
      return res.status(400).json({ error: 'power_consumption_watts required' });
    }

    const kw = power_consumption_watts / 1000;
    const dailyKwh = kw * hours_per_day;

    // Real regional electricity rates (updated 2026)
    const regions = {
      'Iceland': { rate: 0.04, source: 'Geothermal' },
      'Kazakhstan': { rate: 0.02, source: 'Hydroelectric' },
      'China': { rate: 0.03, source: 'Coal/Hydro mix' },
      'US (Texas)': { rate: 0.05, source: 'Grid average' },
      'Canada': { rate: 0.06, source: 'Hydro' },
      'Europe': { rate: 0.12, source: 'Grid average' },
      'Australia': { rate: 0.10, source: 'Grid average' },
    };

    const analysis = Object.entries(regions).map(([region, data]) => ({
      region,
      electricity_rate: `$${data.rate.toFixed(4)}/kWh`,
      source: data.source,
      daily_cost: (dailyKwh * data.rate).toFixed(2),
      monthly_cost: (dailyKwh * data.rate * 30).toFixed(2),
      yearly_cost: (dailyKwh * data.rate * 365).toFixed(2),
    }));

    res.json({
      device_power: `${power_consumption_watts}W`,
      daily_kwh: dailyKwh.toFixed(2),
      regional_analysis: analysis.sort((a, b) => parseFloat(a.daily_cost) - parseFloat(b.daily_cost)),
    });
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Tool 3: Break-Even Calculator with Hardware Aging
// Account for declining hashrate over time
router.post('/breakeven-aging', (req, res) => {
  try {
    const { miner_cost_usd, initial_daily_profit, hashrate_decline_percent_per_year = 5 } = req.body;

    if (!miner_cost_usd || !initial_daily_profit) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const declinePerDay = hashrate_decline_percent_per_year / 365;
    let cumulativeProfit = 0;
    let daysToBreakEven = 0;
    const dailyProfits = [];

    for (let day = 1; day <= 365; day++) {
      const hashrateFactor = 1 - (declinePerDay * day / 100);
      const dailyProfit = initial_daily_profit * hashrateFactor;
      cumulativeProfit += dailyProfit;
      dailyProfits.push(dailyProfit);

      if (daysToBreakEven === 0 && cumulativeProfit >= miner_cost_usd) {
        daysToBreakEven = day;
      }
    }

    const yearOneProfit = dailyProfits.reduce((a, b) => a + b, 0);
    const yearTwoProfit = yearOneProfit * 0.95; // 5% decline
    const yearThreeProfit = yearTwoProfit * 0.95;

    res.json({
      miner_cost: miner_cost_usd,
      initial_daily_profit: initial_daily_profit.toFixed(2),
      hashrate_decline_yearly: `${hashrate_decline_percent_per_year}%`,
      days_to_breakeven: daysToBreakEven,
      years_to_breakeven: (daysToBreakEven / 365).toFixed(2),
      year_1_profit: yearOneProfit.toFixed(2),
      year_2_profit: yearTwoProfit.toFixed(2),
      year_3_profit: yearThreeProfit.toFixed(2),
      total_3_year_profit: (yearOneProfit + yearTwoProfit + yearThreeProfit - miner_cost_usd).toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// Tool 4: ROI Simulator - Multiple Scenarios
// Compare different mining scenarios side-by-side
router.post('/roi-simulator', (req, res) => {
  try {
    const { miner_cost, daily_profit, electricity_cost } = req.body;

    if (!miner_cost || !daily_profit) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const scenarios = {
      'Conservative (20% profit decline/year)': { decline: 0.2 },
      'Moderate (10% profit decline/year)': { decline: 0.1 },
      'Optimistic (5% profit decline/year)': { decline: 0.05 },
      'Best Case (No decline)': { decline: 0 },
    };

    const results = {};

    for (const [scenario, params] of Object.entries(scenarios)) {
      let cumProfit = 0;
      let breakeven = 0;
      let yearsToProfit = [];

      for (let year = 0; year < 5; year++) {
        const yearlyProfit = daily_profit * 365 * Math.pow(1 - params.decline, year);
        yearsToProfit.push(yearlyProfit);
        cumProfit += yearlyProfit;

        if (breakeven === 0 && cumProfit >= miner_cost) {
          breakeven = year + (miner_cost - (cumProfit - yearlyProfit)) / yearlyProfit;
        }
      }

      results[scenario] = {
        breakeven_years: breakeven.toFixed(2),
        year_1: yearsToProfit[0].toFixed(2),
        year_2: yearsToProfit[1].toFixed(2),
        year_3: yearsToProfit[2].toFixed(2),
        total_3_years: (yearsToProfit[0] + yearsToProfit[1] + yearsToProfit[2] - miner_cost).toFixed(2),
      };
    }

    res.json({
      miner_cost,
      daily_profit,
      scenarios: results,
      recommendation: 'Compare scenarios to understand profit sensitivity to difficulty changes',
    });
  } catch (error) {
    res.status(500).json({ error: 'Simulation failed' });
  }
});

// Tool 5: Multi-Location ROI Comparison
// Same miner, different hosting locations
router.post('/multi-location-roi', (req, res) => {
  try {
    const { miner_id, coin_id, miner_cost_usd = 1000 } = req.body;

    if (!miner_id || !coin_id) {
      return res.status(400).json({ error: 'miner_id and coin_id required' });
    }

    const miner = db.prepare('SELECT * FROM miners WHERE id = ?').get(miner_id);
    const coin = db.prepare('SELECT * FROM coins WHERE id = ?').get(coin_id);

    if (!miner || !coin) {
      return res.status(404).json({ error: 'Miner or coin not found' });
    }

    const locations = db.prepare(`
      SELECT l.name, l.country, l.hosting_fee_per_kwh, v.company_name
      FROM locations l
      JOIN vendors v ON l.vendor_id = v.id
      WHERE l.is_active = 1
    `).all();

    // Calculate base profit without hosting
    const specs = JSON.parse(miner.specs || '{}');
    const blocksPerDay = (24 * 3600) / coin.block_time;
    const baseReward = (specs.hashrate || 1) * coin.block_reward * blocksPerDay / (coin.network_difficulty || 1000);
    const baseRevenue = baseReward * coin.price;

    const comparison = locations.map(loc => {
      const hostingCostDaily = (miner.power_consumption / 1000) * 24 * loc.hosting_fee_per_kwh;
      const netProfit = baseRevenue - hostingCostDaily;
      const daysToBreakEven = miner_cost_usd / netProfit;

      return {
        location: loc.name,
        country: loc.country,
        vendor: loc.company_name,
        hosting_fee: loc.hosting_fee_per_kwh,
        daily_profit: netProfit.toFixed(2),
        monthly_profit: (netProfit * 30).toFixed(2),
        yearly_profit: (netProfit * 365).toFixed(2),
        days_to_breakeven: daysToBreakEven.toFixed(1),
      };
    }).sort((a, b) => b.daily_profit - a.daily_profit);

    res.json({
      miner: miner.name,
      coin: coin.symbol,
      miner_cost: miner_cost_usd,
      locations_compared: comparison.length,
      locations: comparison,
      best_location: comparison[0]?.location || 'N/A',
      best_profit_per_year: comparison[0]?.yearly_profit || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Tool 6: Difficulty Impact Analysis
// Show how difficulty changes affect profitability
router.post('/difficulty-impact', (req, res) => {
  try {
    const { current_daily_profit, difficulty_increase_percent } = req.body;

    if (!current_daily_profit) {
      return res.status(400).json({ error: 'current_daily_profit required' });
    }

    const increase = difficulty_increase_percent || 10;

    const scenarios = [];
    for (let i = -30; i <= 50; i += 10) {
      const factor = 1 + (i / 100);
      const newProfit = current_daily_profit / factor;
      const profitChange = newProfit - current_daily_profit;

      scenarios.push({
        difficulty_change: `${i > 0 ? '+' : ''}${i}%`,
        daily_profit: newProfit.toFixed(2),
        monthly_profit: (newProfit * 30).toFixed(2),
        profit_impact: profitChange.toFixed(2),
        breakeven_impact: `${((profitChange / current_daily_profit) * 100).toFixed(1)}%`,
      });
    }

    res.json({
      current_scenario: {
        daily_profit: current_daily_profit,
        monthly_profit: (current_daily_profit * 30).toFixed(2),
        yearly_profit: (current_daily_profit * 365).toFixed(2),
      },
      scenarios,
    });
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

module.exports = router;
