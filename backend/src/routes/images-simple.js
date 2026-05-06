const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db/sqlite-init');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../public/miner-images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created miner-images directory');
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    const filename = `miner-${timestamp}-${random}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF allowed'));
    }
  }
});

// GET /api/images/miner/:minerId - Get images for miner
router.get('/miner/:minerId', (req, res) => {
  try {
    const { minerId } = req.params;
    
    const images = db.prepare(`
      SELECT id, url, is_primary, uploaded_at
      FROM miner_images
      WHERE miner_id = ?
      ORDER BY is_primary DESC, uploaded_at DESC
    `).all(minerId);

    res.json({ 
      success: true,
      images: images || [],
      count: (images || []).length
    });
  } catch (error) {
    console.error('Error getting images:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/images/upload - Upload image
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    const { minerId } = req.body;
    
    if (!minerId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'Miner ID required' });
    }

    // Verify miner exists
    const miner = db.prepare('SELECT id FROM miners WHERE id = ?').get(minerId);
    if (!miner) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, error: 'Miner not found' });
    }

    // Check if first image
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM miner_images WHERE miner_id = ?').get(minerId).count;
    const isPrimary = existingCount === 0 ? 1 : 0;

    // Save to database
    const imageUrl = `/miner-images/${req.file.filename}`;
    const stmt = db.prepare(`
      INSERT INTO miner_images (miner_id, url, is_primary)
      VALUES (?, ?, ?)
    `);
    stmt.run(minerId, imageUrl, isPrimary);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        filename: req.file.filename,
        url: imageUrl,
        is_primary: isPrimary
      }
    });
  } catch (error) {
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch(e) {}
    }
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/images/:imageId/primary - Set as primary
router.post('/:imageId/primary', (req, res) => {
  try {
    const { imageId } = req.params;

    const image = db.prepare('SELECT miner_id FROM miner_images WHERE id = ?').get(imageId);
    if (!image) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    // Remove primary from all for this miner
    db.prepare('UPDATE miner_images SET is_primary = 0 WHERE miner_id = ?').run(image.miner_id);
    
    // Set this as primary
    db.prepare('UPDATE miner_images SET is_primary = 1 WHERE id = ?').run(imageId);

    res.json({ success: true, message: 'Primary image updated' });
  } catch (error) {
    console.error('Error updating primary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/images/:imageId - Delete image
router.delete('/:imageId', (req, res) => {
  try {
    const { imageId } = req.params;

    const image = db.prepare('SELECT url FROM miner_images WHERE id = ?').get(imageId);
    if (!image) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    // Delete file
    const filePath = path.join(__dirname, '../../public', image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    db.prepare('DELETE FROM miner_images WHERE id = ?').run(imageId);

    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
