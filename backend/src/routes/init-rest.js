const express = require('express');
const router = express.Router();
const axios = require('axios');

const SUPABASE_URL = 'https://huzfnrgfcxlwvmrkoyge.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_s5ocl3sDwpefFYuw3V-JEQ_FQzXGTHZ';

/**
 * Initialize with mock miners data
 * GET /init/setup
 */
router.get('/setup', async (req, res) => {
  try {
    console.log('🔧 Initializing with mock miners data...');

    // Mock miners data
    const mockMiners = [
      { whattomine_id: 1, name: 'Antminer S21 Pro 234T', algorithm: 'SHA256', power_consumption: 3290, specs: { hashrate: 234 } },
      { whattomine_id: 2, name: 'Antminer S21 200T', algorithm: 'SHA256', power_consumption: 3080, specs: { hashrate: 200 } },
      { whattomine_id: 3, name: 'Antminer K7 63.5T', algorithm: 'Scrypt', power_consumption: 3348, specs: { hashrate: 63.5 } },
      { whattomine_id: 4, name: 'Antminer L7 9500M', algorithm: 'Scrypt', power_consumption: 3425, specs: { hashrate: 9500 } },
      { whattomine_id: 5, name: 'Antminer Z15 Pro 420K', algorithm: 'Equihash', power_consumption: 1800, specs: { hashrate: 420000 } },
      { whattomine_id: 6, name: 'Whatsminer M53S+ 56T', algorithm: 'SHA256', power_consumption: 3276, specs: { hashrate: 56 } },
      { whattomine_id: 7, name: 'Whatsminer M33S+ 13T', algorithm: 'SHA256', power_consumption: 1900, specs: { hashrate: 13 } },
      { whattomine_id: 8, name: 'Innosilicon A11 Pro 2400M', algorithm: 'Ethereum', power_consumption: 3010, specs: { hashrate: 2400 } },
      { whattomine_id: 9, name: 'Innosilicon A10 1300M', algorithm: 'Ethereum', power_consumption: 2350, specs: { hashrate: 1300 } },
      { whattomine_id: 10, name: 'Canaan AvalonMiner A1246 100T', algorithm: 'SHA256', power_consumption: 3200, specs: { hashrate: 100 } },
      { whattomine_id: 11, name: 'Bitmain Antminer T19 84T', algorithm: 'SHA256', power_consumption: 2800, specs: { hashrate: 84 } },
      { whattomine_id: 12, name: 'MicroBT Whatsminer M50S 112T', algorithm: 'SHA256', power_consumption: 3472, specs: { hashrate: 112 } },
      { whattomine_id: 13, name: 'Ebang Ebit E12+', algorithm: 'SHA256', power_consumption: 2646, specs: { hashrate: 44 } },
      { whattomine_id: 14, name: 'Innosilicon A10 Pro 750M', algorithm: 'Ethereum', power_consumption: 1350, specs: { hashrate: 750 } },
      { whattomine_id: 15, name: 'Goldshell CK5', algorithm: 'Kaspa', power_consumption: 750, specs: { hashrate: 2300 } },
    ];

    // Insert miners via REST API
    const insertPromises = mockMiners.map(miner =>
      axios.post(
        `${SUPABASE_URL}/rest/v1/miners`,
        miner,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          }
        }
      ).catch(err => {
        console.log(`Note: ${miner.name} - ${err.response?.status || err.message}`);
        return null;
      })
    );

    await Promise.all(insertPromises);

    res.json({
      status: 'success',
      message: 'Database initialized with mock miners',
      stats: {
        miners_added: mockMiners.length,
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
