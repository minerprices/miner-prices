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

    const response = await axios.post(
      `${SUPABASE_URL}/rest/v1/admins`,
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
    ).catch(err => {
      // If conflict (already exists), that's OK
      if (err.response?.status === 409) {
        return { data: [{ email: 'admin@minerprices.com' }] };
      }
      throw err;
    });
    
    const { data } = response;



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
