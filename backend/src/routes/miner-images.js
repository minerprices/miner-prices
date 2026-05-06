const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db/sqlite-init');

// Setup upload directory
const uploadDir = path.join(__dirname, '../../public/miner-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// POST /api/miner-images/upload - Upload and assign image to miner
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const minerId = req.body.minerId;
    if (!minerId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'minerId required' });
    }

    // Verify miner exists
    const miner = db.prepare('SELECT id FROM miners WHERE id = ?').get(minerId);
    if (!miner) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Miner not found' });
    }

    // Save image URL to miner
    const imageUrl = `/miner-images/${req.file.filename}`;
    db.prepare('UPDATE miners SET image_url = ? WHERE id = ?').run(imageUrl, minerId);

    res.json({
      success: true,
      message: 'Image uploaded and assigned',
      minerId,
      imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/miner-images/:minerId/remove - Remove image from miner
router.post('/:minerId/remove', (req, res) => {
  try {
    const { minerId } = req.params;

    // Verify miner exists
    const miner = db.prepare('SELECT id, image_url FROM miners WHERE id = ?').get(minerId);
    if (!miner) {
      return res.status(404).json({ error: 'Miner not found' });
    }

    // Delete file if it exists
    if (miner.image_url) {
      const filename = path.basename(miner.image_url);
      const filepath = path.join(uploadDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    // Clear image_url from database
    db.prepare('UPDATE miners SET image_url = NULL WHERE id = ?').run(minerId);

    res.json({ success: true, message: 'Image removed', minerId });
  } catch (error) {
    console.error('Remove error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
