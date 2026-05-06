const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db/sqlite-init');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const name = `miner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// GET /api/images/miner/:minerId - Get all images for miner
router.get('/miner/:minerId', (req, res) => {
  try {
    const images = db.prepare(`
      SELECT id, url, is_primary FROM miner_images 
      WHERE miner_id = ? 
      ORDER BY is_primary DESC, uploaded_at DESC
    `).all(req.params.minerId);

    res.json({ images: images || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/images/upload - Upload image for miner
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image' });
    if (!req.body.minerId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'No minerId' });
    }

    const miner = db.prepare('SELECT id FROM miners WHERE id = ?').get(req.body.minerId);
    if (!miner) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Miner not found' });
    }

    const count = db.prepare('SELECT COUNT(*) as c FROM miner_images WHERE miner_id = ?').get(req.body.minerId).c;
    const isPrimary = count === 0 ? 1 : 0;
    const url = `/uploads/${req.file.filename}`;

    db.prepare('INSERT INTO miner_images (miner_id, url, is_primary) VALUES (?, ?, ?)').run(req.body.minerId, url, isPrimary);

    res.json({ success: true, url, isPrimary });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/images/:id/primary - Set image as primary
router.post('/:id/primary', (req, res) => {
  try {
    const img = db.prepare('SELECT miner_id FROM miner_images WHERE id = ?').get(req.params.id);
    if (!img) return res.status(404).json({ error: 'Image not found' });

    db.prepare('UPDATE miner_images SET is_primary = 0 WHERE miner_id = ?').run(img.miner_id);
    db.prepare('UPDATE miner_images SET is_primary = 1 WHERE id = ?').run(req.params.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/images/:id - Delete image
router.delete('/:id', (req, res) => {
  try {
    const img = db.prepare('SELECT url FROM miner_images WHERE id = ?').get(req.params.id);
    if (!img) return res.status(404).json({ error: 'Image not found' });

    const filePath = path.join(__dirname, '../../public', img.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    db.prepare('DELETE FROM miner_images WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
