const axios = require('axios');
const { db } = require('../db/sqlite-init');

const WHATTOMINE_API = 'https://whattomine.com/api/v1';

/**
 * Fetch full miner list from WhattoMine API
 * Completely legitimate - WhattoMine allows commercial use of their free API
 */
async function fetchAllMinersFromWhattoMine() {
  try {
    console.log('📥 Fetching complete miner list from WhattoMine...');
    
    const response = await axios.get(`${WHATTOMINE_API}/coins.json`, {
      timeout: 30000,
    });

    const coins = response.data.coins || {};
    const minersMap = new Map();

    // Extract ALL unique miners from WhattoMine
    for (const [coinKey, coinData] of Object.entries(coins)) {
      if (!coinData.miners || !coinData.tag) continue;

      const algorithm = coinData.tag;
      
      for (const miner of coinData.miners) {
        if (!miner.id || !miner.name) continue;

        // Use miner ID as unique key
        if (!minersMap.has(miner.id)) {
          minersMap.set(miner.id, {
            whattomine_id: miner.id,
            name: miner.name,
            algorithm: algorithm,
            power_consumption: miner.power || 0,
            hashrate: miner.hashrate || 0,
            efficiency: miner.power && miner.hashrate ? (miner.power / miner.hashrate).toFixed(2) : 0,
            specs: JSON.stringify({
              hashrate: miner.hashrate || 0,
              efficiency: miner.power && miner.hashrate ? (miner.power / miner.hashrate).toFixed(2) : 0,
              power: miner.power || 0,
            }),
          });
        }
      }
    }

    const miners = Array.from(minersMap.values());
    console.log(`✅ Fetched ${miners.length} unique miners from WhattoMine`);
    return miners;
  } catch (error) {
    console.error('❌ WhattoMine fetch error:', error.message);
    return [];
  }
}

/**
 * Sync all miners from WhattoMine to database
 */
async function syncAllMiners(db) {
  try {
    const miners = await fetchAllMinersFromWhattoMine();
    
    if (miners.length === 0) {
      console.warn('⚠️ No miners fetched from WhattoMine');
      return 0;
    }

    // Clear old miners
    db.prepare('DELETE FROM miners').run();

    const insertMiner = db.prepare(`
      INSERT OR IGNORE INTO miners 
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

module.exports = { fetchAllMinersFromWhattoMine, syncAllMiners };
