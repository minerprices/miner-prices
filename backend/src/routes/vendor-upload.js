const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const { db } = require('../db/sqlite-init');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for logos
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// ImgBB API - Free image hosting
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || 'dummy-key';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

// POST /api/vendor-upload/:vendorId - Upload vendor logo
router.post('/:vendorId', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const vendorId = req.params.vendorId;

    // Verify vendor exists
    const vendor = db.prepare('SELECT id FROM vendors WHERE id = ?').get(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    if (!IMGBB_API_KEY || IMGBB_API_KEY === 'dummy-key') {
      return res.status(500).json({ error: 'ImgBB API key not configured' });
    }

    // Upload to ImgBB with base64
    const base64Image = req.file.buffer.toString('base64');
    const params = new URLSearchParams();
    params.append('image', base64Image);
    params.append('key', IMGBB_API_KEY);
    params.append('expiration', 0); // Permanent storage

    const response = await axios.post(IMGBB_API_URL, params, {
      timeout: 10000
    });

    if (response.data.success && response.data.data) {
      const logoUrl = response.data.data.url;

      // Save URL to database
      db.prepare('UPDATE vendors SET logo_url = ? WHERE id = ?').run(logoUrl, vendorId);

      res.json({
        success: true,
        vendorId,
        logoUrl,
        displayUrl: response.data.data.display_url,
        message: 'Logo uploaded successfully'
      });
    } else {
      res.status(400).json({ error: 'ImgBB upload failed', details: response.data });
    }
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

module.exports = router;
