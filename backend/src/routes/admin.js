const express = require('express');
const router = express.Router();
const { db } = require('../db/sqlite-init');
const { syncWhattoMineMiners } = require('../services/whattomine');
const { updateCoinPrices } = require('../services/coingecko');
const { syncASICsToDatabase } = require('../services/whattomine-comprehensive');

// POST /api/admin/sync-photos - Add photos to existing miners (non-destructive)
router.post('/sync-photos', async (req, res) => {
  try {
    console.log('📸 Adding photos to existing miners...');
    
    const { getMinerMetadata } = require('../db/miner-photos');
    
    // Get all miners
    const miners = db.prepare('SELECT id, name FROM miners').all();
    let updated = 0;

    miners.forEach(miner => {
      const metadata = getMinerMetadata(miner.name);
      if (metadata) {
        db.prepare(`
          UPDATE miners 
          SET image_url = ?, manufacturer = ?, cooling_type = ?, 
              tutorial_video_id = ?, tutorial_pdf_url = ?, 
              firmware_url = ?, apps = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          metadata.image_url,
          metadata.manufacturer,
          metadata.cooling_type,
          metadata.tutorial_video_id,
          metadata.tutorial_pdf_url,
          metadata.firmware_url,
          JSON.stringify(metadata.apps),
          miner.id
        );
        updated++;
      }
    });

    console.log(`✅ Updated ${updated} miners with photos and metadata`);
    
    // Log the update
    db.prepare(`
      INSERT INTO sync_log (miners_added, status)
      VALUES (?, 'photo_sync')
    `).run(updated);

    res.json({
      status: 'success',
      miners_updated: updated,
      message: `Added photos and metadata to ${updated} miners`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Photo sync error:', error);
    res.status(500).json({ error: 'Photo sync failed', details: error.message });
  }
});

// POST /api/admin/sync-comprehensive - Sync ASICs, prices, and metadata
router.post('/sync-comprehensive', async (req, res) => {
  try {
    console.log('🔄 Starting comprehensive sync...');
    
    const { getMinerMetadata } = require('../db/miner-photos');
    
    // Update photos for existing miners first
    const miners = db.prepare('SELECT id, name FROM miners').all();
    let photosUpdated = 0;

    miners.forEach(miner => {
      const metadata = getMinerMetadata(miner.name);
      if (metadata) {
        db.prepare(`
          UPDATE miners 
          SET image_url = ?, manufacturer = ?, cooling_type = ?, 
              tutorial_video_id = ?, tutorial_pdf_url = ?, 
              firmware_url = ?, apps = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          metadata.image_url,
          metadata.manufacturer,
          metadata.cooling_type,
          metadata.tutorial_video_id,
          metadata.tutorial_pdf_url,
          metadata.firmware_url,
          JSON.stringify(metadata.apps),
          miner.id
        );
        photosUpdated++;
      }
    });

    // Update prices
    const pricesUpdated = await updateCoinPrices(db);

    console.log(`✅ Photos updated: ${photosUpdated}, Prices: ${pricesUpdated ? 'yes' : 'no'}`);
    
    // Log the comprehensive sync
    db.prepare(`
      INSERT INTO sync_log (miners_added, status)
      VALUES (?, 'comprehensive')
    `).run(miners.length);

    res.json({
      status: 'success',
      miners_with_photos: photosUpdated,
      total_miners: miners.length,
      prices_updated: pricesUpdated ? 'yes' : 'no',
      message: `Updated ${photosUpdated} miners with photos. Total miners: ${miners.length}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Comprehensive sync error:', error);
    res.status(500).json({ error: 'Sync failed', details: error.message });
  }
});

// POST /api/admin/sync-whattomine - Sync miners from WhattoMine
router.post('/sync-whattomine', async (req, res) => {
  try {
    const minersCount = await syncWhattoMineMiners(db);
    
    if (minersCount === 0) {
      return res.status(500).json({ error: 'Sync failed' });
    }

    res.json({
      status: 'success',
      miners_synced: minersCount,
      message: `Synced ${minersCount} miners from WhattoMine`,
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed', details: error.message });
  }
});

// POST /api/admin/sync-prices - Update coin prices from CoinGecko
router.post('/sync-prices', async (req, res) => {
  try {
    const success = await updateCoinPrices(db);
    
    if (!success) {
      return res.status(500).json({ error: 'Price sync failed' });
    }

    res.json({
      status: 'success',
      message: 'Coin prices updated from CoinGecko',
    });
  } catch (error) {
    res.status(500).json({ error: 'Price sync failed' });
  }
});

// GET /api/admin/stats - Get platform stats
router.get('/stats', (req, res) => {
  try {
    const minerCount = db.prepare('SELECT COUNT(*) as count FROM miners').get().count;
    const coinCount = db.prepare('SELECT COUNT(*) as count FROM coins').get().count;
    const vendorCount = db.prepare('SELECT COUNT(*) as count FROM vendors WHERE approved = 1').get().count;
    const locationCount = db.prepare('SELECT COUNT(*) as count FROM locations WHERE is_active = 1').get().count;
    const pendingVendors = db.prepare('SELECT COUNT(*) as count FROM vendors WHERE approved = 0').get().count;

    res.json({
      miners: minerCount,
      coins: coinCount,
      vendors: vendorCount,
      locations: locationCount,
      pending_vendors: pendingVendors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// GET /api/admin/sync-logs - Get sync history
router.get('/sync-logs', (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT * FROM sync_log
      ORDER BY created_at DESC
      LIMIT 20
    `).all();

    res.json({ sync_logs: logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// GET /api/admin/vendors/pending - Get pending vendor approvals
router.get('/vendors/pending', (req, res) => {
  try {
    const vendors = db.prepare(`
      SELECT id, company_name, email, created_at
      FROM vendors
      WHERE approved = 0
      ORDER BY created_at DESC
    `).all();

    res.json({ pending_vendors: vendors });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get pending vendors' });
  }
});

// POST /api/admin/vendors/:id/approve - Approve vendor
router.post('/vendors/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    
    db.prepare('UPDATE vendors SET approved = 1 WHERE id = ?').run(id);

    res.json({ status: 'success', message: 'Vendor approved' });
  } catch (error) {
    res.status(500).json({ error: 'Approval failed' });
  }
});

// POST /api/admin/vendors/:id/reject - Reject vendor
router.post('/vendors/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    
    db.prepare('DELETE FROM vendors WHERE id = ?').run(id);

    res.json({ status: 'success', message: 'Vendor rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Rejection failed' });
  }
});

module.exports = router;
