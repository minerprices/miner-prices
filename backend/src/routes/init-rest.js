const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const SUPABASE_URL = 'https://huzfnrgfcxlwvmrkoyge.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1emZucmdmY3hsd3ZtcmtveWdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkyNDIzMywiZXhwIjoyMDkzNTAwMjMzfQ.y8vbUqoAy4dyq5hn3bvCHp4jMaQ9tTGErr_y2fx6Bfk';

/**
 * Initialize database and sync miners
 * GET /init/setup
 */
router.get('/setup', async (req, res) => {
  try {
    console.log('🔧 Initializing database and syncing miners...');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Create admin account
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);

    await supabase
      .from('admins')
      .insert([{
        email: 'admin@minerprices.com',
        password_hash: hash,
        name: 'System Admin'
      }])
      .select();

    // Sync miners from WhattoMine
    console.log('📥 Fetching miners from WhattoMine API...');
    const coinsResponse = await axios.get('https://whattomine.com/api/v1/coins.json');
    const coins = coinsResponse.data.coins || {};

    let minersCount = 0;
    const minersToInsert = [];

    for (const [coinKey, coinData] of Object.entries(coins).slice(0, 50)) {
      if (!coinData.tag || !coinData.miners) continue;

      const algorithm = coinData.tag;
      const miners = coinData.miners || [];

      for (const minerData of miners.slice(0, 3)) {
        minersToInsert.push({
          whattomine_id: minerData.id,
          name: minerData.name || 'Unknown Miner',
          algorithm: algorithm,
          power_consumption: minerData.power || 0,
          specs: {
            hashrate: minerData.hashrate,
            efficiency: minerData.efficiency,
            profitability: minerData.profitability
          },
          is_active: true
        });
        minersCount++;
      }
    }

    // Insert miners in batches
    if (minersToInsert.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < minersToInsert.length; i += batchSize) {
        const batch = minersToInsert.slice(i, i + batchSize);
        await supabase.from('miners').upsert(batch);
      }
    }

    // Log sync
    await supabase.from('sync_log').insert([{
      miners_added: minersCount,
      status: 'success'
    }]);

    res.json({
      status: 'success',
      message: 'Database initialized and miners synced',
      stats: {
        miners_synced: minersCount,
        admin_created: true
      },
      admin: {
        email: 'admin@minerprices.com',
        password: 'admin123'
      },
      next: 'Visit https://minerprices.com to browse miners'
    });
  } catch (error) {
    console.error('Setup error:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
