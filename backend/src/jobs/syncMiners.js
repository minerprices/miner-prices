const axios = require('axios');
const db = require('../db/db');
require('dotenv').config();

const WHATTOMINE_API = 'https://whattomine.com/api/v1';

const syncMiners = async () => {
  const client = await db.connect();
  let syncLog = {
    syncType: 'whattomine',
    minersAdded: 0,
    minersUpdated: 0,
    minersTotal: 0,
    status: 'success',
    errorMessage: null,
  };

  try {
    console.log('🔄 Starting WhattoMine sync...');

    // Fetch popular coins/algorithms
    const coinsResponse = await axios.get(`${WHATTOMINE_API}/coins.json`);
    const coins = coinsResponse.data.coins || {};

    let totalProcessed = 0;

    for (const [coinKey, coinData] of Object.entries(coins)) {
      if (!coinData.tag) continue;

      const algorithm = coinData.tag;
      const miners = coinData.miners || [];

      for (const minerData of miners) {
        totalProcessed++;

        // Check if miner exists
        const existing = await client.query(
          'SELECT id FROM miners WHERE whattomine_id = $1',
          [minerData.id]
        );

        const specs = {
          hashrate: minerData.hashrate,
          power: minerData.power,
          efficiency: minerData.efficiency,
          profitability: minerData.profitability,
        };

        if (existing.rows.length > 0) {
          // Update existing miner
          await client.query(
            `UPDATE miners SET
              name = $1,
              algorithm = $2,
              power_consumption = $3,
              price = $4,
              manufacturer = $5,
              specs = $6,
              last_synced_at = CURRENT_TIMESTAMP
              WHERE whattomine_id = $7`,
            [
              minerData.name,
              algorithm,
              minerData.power,
              minerData.price,
              minerData.manufacturer || 'Unknown',
              JSON.stringify(specs),
              minerData.id,
            ]
          );
          syncLog.minersUpdated++;
        } else {
          // Insert new miner
          await client.query(
            `INSERT INTO miners 
              (whattomine_id, name, algorithm, power_consumption, price, manufacturer, specs, last_synced_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
            [
              minerData.id,
              minerData.name,
              algorithm,
              minerData.power,
              minerData.price,
              minerData.manufacturer || 'Unknown',
              JSON.stringify(specs),
            ]
          );
          syncLog.minersAdded++;
        }

        // Limit batch processing
        if (totalProcessed % 100 === 0) {
          console.log(`⏳ Processed ${totalProcessed} miners...`);
        }
      }
    }

    syncLog.minersTotal = totalProcessed;

    // Log sync
    await client.query(
      `INSERT INTO sync_log (sync_type, miners_added, miners_updated, miners_total, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        syncLog.syncType,
        syncLog.minersAdded,
        syncLog.minersUpdated,
        syncLog.minersTotal,
        syncLog.status,
      ]
    );

    console.log(`✅ Sync completed: ${syncLog.minersAdded} added, ${syncLog.minersUpdated} updated`);
  } catch (error) {
    console.error('❌ Sync error:', error.message);
    syncLog.status = 'error';
    syncLog.errorMessage = error.message;

    await client.query(
      `INSERT INTO sync_log (sync_type, status, error_message)
       VALUES ($1, $2, $3)`,
      [syncLog.syncType, syncLog.status, syncLog.errorMessage]
    );
  } finally {
    client.release();
  }
};

// Run immediately if called directly
if (require.main === module) {
  syncMiners()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { syncMiners };
