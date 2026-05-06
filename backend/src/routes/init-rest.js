const express = require('express');
const router = express.Router();
const axios = require('axios');

const SUPABASE_URL = 'https://huzfnrgfcxlwvmrkoyge.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_s5ocl3sDwpefFYuw3V-JEQ_FQzXGTHZ';

/**
 * Initialize database using REST API
 * GET /init/setup
 */
router.get('/setup', async (req, res) => {
  try {
    console.log('🔧 Initializing database via REST API...');

    // Create admin account using REST API
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);

    const { data, error } = await axios.post(
      `${SUPABASE_URL}/rest/v1/admins?upsert=true`,
      {
        email: 'admin@minerprices.com',
        password_hash: hash,
        name: 'System Admin'
      },
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );

    if (error) {
      console.error('Error:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to initialize'
      });
    }

    res.json({
      status: 'success',
      message: 'Database initialized successfully',
      admin: {
        email: 'admin@minerprices.com',
        password: 'admin123'
      },
      note: 'Login at https://minerprices.com/admin/login'
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
