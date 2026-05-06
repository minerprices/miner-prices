const axios = require('axios');

const WHATTOMINE_API = 'https://whattomine.com/api/v1';

/**
 * Fetch miners from WhattoMine API
 * Public API, no auth required
 */
async function fetchMinersFromWhattoMine() {
  try {
    console.log('📥 Fetching miners from WhattoMine...');
    
    const response = await axios.get(`${WHATTOMINE_API}/coins.json`, {
      timeout: 15000,
    });

    const coins = response.data.coins || {};
    const miners = [];

    // Extract unique miners from coin data
    for (const [coinKey, coinData] of Object.entries(coins)) {
      if (!coinData.miners || !coinData.tag) continue;

      const algorithm = coinData.tag;
      
      for (const miner of coinData.miners || []) {
        if (miner.id && miner.name && miner.power) {
          miners.push({
            whattomine_id: miner.id,
            name: miner.name,
            algorithm: algorithm,
            power_consumption: miner.power || 0,
            specs: JSON.stringify({
              hashrate: miner.hashrate || 0,
              efficiency: miner.power ? (miner.hashrate / miner.power).toFixed(2) : 0,
            }),
          });
        }
      }
    }

    // Deduplicate by whattomine_id
    const uniqueMiners = Array.from(
      new Map(miners.map(m => [m.whattomine_id, m])).values()
    );

    console.log(`✅ Fetched ${uniqueMiners.length} unique miners from WhattoMine`);
    return uniqueMiners;
  } catch (error) {
    console.error('❌ WhattoMine fetch error:', error.message);
    return null;
  }
}

/**
 * Sync miners from WhattoMine to database
 */
async function syncWhattoMineMiners(db) {
  try {
    const miners = await fetchMinersFromWhattoMine();
    
    if (!miners) {
      console.warn('⚠️ WhattoMine sync failed');
      return 0;
    }

    const insertMiner = db.prepare(`
      INSERT OR REPLACE INTO miners 
      (whattomine_id, name, algorithm, power_consumption, specs, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    const insertAll = db.transaction(() => {
      miners.forEach(m => {
        insertMiner.run(
          m.whattomine_id,
          m.name,
          m.algorithm,
          m.power_consumption,
          m.specs
        );
      });
    });

    insertAll();
    console.log(`✅ Synced ${miners.length} miners to database`);
    
    return miners.length;
  } catch (error) {
    console.error('Sync error:', error);
    return 0;
  }
}

module.exports = { fetchMinersFromWhattoMine, syncWhattoMineMiners };
