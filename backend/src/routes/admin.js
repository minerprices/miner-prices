const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { adminAuth } = require('../middleware/auth');
const { sendApprovalNotificationEmail } = require('../utils/email');

// Get pending vendors for approval
router.get('/vendors/pending', adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT v.*, COUNT(l.id) as locations_count
       FROM vendors v
       LEFT JOIN locations l ON v.id = l.vendor_id
       WHERE v.approved = false
       GROUP BY v.id
       ORDER BY v.created_at DESC`
    );

    res.json({
      vendors: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Get pending vendors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all vendors
router.get('/vendors', adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT v.*, COUNT(l.id) as locations_count
       FROM vendors v
       LEFT JOIN locations l ON v.id = l.vendor_id
       GROUP BY v.id
       ORDER BY v.created_at DESC`
    );

    res.json({
      vendors: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve vendor
router.post('/vendors/:vendorId/approve', adminAuth, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    const vendorResult = await db.query(
      'SELECT email, company_name FROM vendors WHERE id = $1',
      [vendorId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const vendor = vendorResult.rows[0];

    await db.query(
      'UPDATE vendors SET approved = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [vendorId]
    );

    await db.query(
      `INSERT INTO approvals (vendor_id, admin_id, action, reason, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [vendorId, req.admin.id, 'approve', reason || '', 'approved']
    );

    // Send approval email
    try {
      await sendApprovalNotificationEmail(vendor.email, vendor.company_name, 'approved');
    } catch (err) {
      console.error('Failed to send approval email:', err);
    }

    res.json({
      message: 'Vendor approved successfully',
      vendor: vendor,
    });
  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject vendor
router.post('/vendors/:vendorId/reject', adminAuth, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    const vendorResult = await db.query(
      'SELECT email, company_name FROM vendors WHERE id = $1',
      [vendorId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const vendor = vendorResult.rows[0];

    await db.query(
      'UPDATE vendors SET approved = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [vendorId]
    );

    await db.query(
      `INSERT INTO approvals (vendor_id, admin_id, action, reason, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [vendorId, req.admin.id, 'reject', reason || '', 'rejected']
    );

    // Send rejection email
    try {
      await sendApprovalNotificationEmail(vendor.email, vendor.company_name, 'rejected');
    } catch (err) {
      console.error('Failed to send rejection email:', err);
    }

    res.json({
      message: 'Vendor rejected',
      vendor: vendor,
    });
  } catch (error) {
    console.error('Reject vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sync logs
router.get('/sync-logs', adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM sync_log ORDER BY created_at DESC LIMIT 50'
    );

    res.json({
      logs: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Get sync logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const vendorStats = await db.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN approved = true THEN 1 ELSE 0 END) as approved FROM vendors'
    );

    const minerStats = await db.query(
      'SELECT COUNT(*) as total, COUNT(DISTINCT algorithm) as algorithms FROM miners WHERE is_active = true'
    );

    const locationStats = await db.query(
      'SELECT COUNT(*) as total FROM locations WHERE is_active = true'
    );

    res.json({
      vendors: vendorStats.rows[0],
      miners: minerStats.rows[0],
      locations: locationStats.rows[0],
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manual trigger for miner sync
router.post('/sync-miners', adminAuth, async (req, res) => {
  try {
    const { syncMiners } = require('../jobs/syncMiners');
    
    res.json({
      status: 'syncing',
      message: 'Miner sync started in background',
      timestamp: new Date(),
    });

    // Run sync asynchronously
    syncMiners().catch(err => {
      console.error('Background sync error:', err);
    });
  } catch (error) {
    console.error('Sync trigger error:', error);
    res.status(500).json({ error: 'Failed to trigger sync' });
  }
});

module.exports = router;
