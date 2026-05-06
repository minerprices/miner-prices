const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://huzfnrgfcxlwvmrkoyge.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1emZucmdmY3hsd3ZtcmtveWdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkyNDIzMywiZXhwIjoyMDkzNTAwMjMzfQ.y8vbUqoAy4dyq5hn3bvCHp4jMaQ9tTGErr_y2fx6Bfk';

/**
 * Initialize database
 * GET /init/setup
 */
router.get('/setup', async (req, res) => {
  try {
    console.log('🔧 Initializing database...');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Create admin account
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);

    const { data, error } = await supabase
      .from('admins')
      .insert([{
        email: 'admin@minerprices.com',
        password_hash: hash,
        name: 'System Admin'
      }])
      .select();

    if (error && !error.message.includes('duplicate')) {
      console.error('Insert error:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message
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
