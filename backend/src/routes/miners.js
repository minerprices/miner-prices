const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://huzfnrgfcxlwvmrkoyge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1emZucmdmY3hsd3ZtcmtveWdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkyNDIzMywiZXhwIjoyMDkzNTAwMjMzfQ.y8vbUqoAy4dyq5hn3bvCHp4jMaQ9tTGErr_y2fx6Bfk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Get all miners
router.get('/', async (req, res) => {
  try {
    const { algorithm, search } = req.query;

    let query = supabase.from('miners').select('*');

    if (algorithm) {
      query = query.eq('algorithm', algorithm);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error('Miners fetch error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({
      miners: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Miners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single miner
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('miners')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Miner not found' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get algorithms
router.get('/api/algorithms', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('miners')
      .select('algorithm');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const algorithms = [...new Set(data?.map(m => m.algorithm).filter(Boolean) || [])];
    res.json({ algorithms });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
