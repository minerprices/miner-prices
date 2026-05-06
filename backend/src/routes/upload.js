const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Configure multer for memory storage (we'll upload to external service)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// ImgBB API - Free image hosting
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || 'dummy-key'; // Will fail if not set
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

// POST /api/upload - Upload image to ImgBB and return URL
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!IMGBB_API_KEY || IMGBB_API_KEY === 'dummy-key') {
      return res.status(500).json({ error: 'ImgBB API key not configured' });
    }

    // Create FormData for ImgBB
    const formData = new FormData();
    formData.append('image', req.file.buffer.toString('base64'));
    formData.append('key', IMGBB_API_KEY);

    // Upload to ImgBB
    const response = await axios.post(IMGBB_API_URL, formData, {
      headers: formData.getHeaders(),
      timeout: 10000
    });

    if (response.data.success && response.data.data) {
      res.json({
        success: true,
        url: response.data.data.url,
        displayUrl: response.data.data.display_url,
        thumbUrl: response.data.data.thumb.url,
        filename: req.file.originalname,
        message: 'Image uploaded to ImgBB'
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
