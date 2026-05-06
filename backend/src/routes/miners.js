const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db/sqlite-init');

// Setup persistent upload directory
// On Render, this will be mounted to /var/data/uploads (persistent disk)
// Locally, use ./data/uploads
const uploadDir = process.env.NODE_ENV === 'production' 
  ? '/var/data/uploads' 
  : path.join(__dirname, '../../data/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
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

// ===== SPECIFIC ROUTES FIRST =====

// POST /:id/upload-image - Upload image and assign to miner
router.post('/:id/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const minerId = req.params.id;
    const miner = db.prepare('SELECT id FROM miners WHERE id = ?').get(minerId);
    if (!miner) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Miner not found' });
    }

    // Save image URL to database
    const imageUrl = `/uploads/${req.file.filename}`;
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

// PUT /:id - Update miner image_url (with external URL)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url } = req.body;

    const miner = db.prepare('SELECT id FROM miners WHERE id = ?').get(id);
    if (!miner) {
      return res.status(404).json({ error: 'Miner not found' });
    }

    // Save the external URL directly to database
    db.prepare('UPDATE miners SET image_url = ? WHERE id = ?').run(image_url, id);
    res.json({ success: true, message: 'Image URL saved', id, image_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== GENERIC ROUTES AFTER =====

// GET / - Get all miners
router.get('/', async (req, res) => {
  try {
    const { algorithm, search } = req.query;

    let query = 'SELECT * FROM miners WHERE 1=1';
    const params = [];

    if (algorithm) {
      query += ' AND algorithm = ?';
      params.push(algorithm);
    }

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' LIMIT 100';

    const miners = db.prepare(query).all(...params);

    const minersWithImages = miners.map(miner => {
      const images = db.prepare(`
        SELECT id, url, is_primary
        FROM miner_images
        WHERE miner_id = ?
        ORDER BY is_primary DESC
      `).all(miner.id);

      return {
        ...miner,
        images: images || [],
        primary_image: images?.find(img => img.is_primary === 1)?.url || null
      };
    });

    res.json({
      miners: minersWithImages,
      count: minersWithImages?.length || 0
    });
  } catch (error) {
    console.error('Miners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:id - Get single miner
router.get('/:id', async (req, res) => {
  try {
    const miner = db.prepare('SELECT * FROM miners WHERE id = ?').get(req.params.id);

    if (!miner) {
      return res.status(404).json({ error: 'Miner not found' });
    }

    res.json(miner);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:id/full - Get miner with full metadata
router.get('/:id/full', async (req, res) => {
  try {
    const miner = db.prepare('SELECT * FROM miners WHERE id = ?').get(req.params.id);

    if (!miner) {
      return res.status(404).json({ error: 'Miner not found' });
    }

    const specs = miner.specs ? JSON.parse(miner.specs) : {};
    const apps = miner.apps ? JSON.parse(miner.apps) : [];

    const richMiner = {
      id: miner.id,
      name: miner.name,
      whattomine_id: miner.whattomine_id,
      manufacturer: miner.manufacturer || 'Unknown',
      algorithm: miner.algorithm,
      cooling_type: miner.cooling_type || 'Unknown',
      power_consumption: miner.power_consumption,
      specs,
      image_url: miner.image_url,
      tutorial_video_id: miner.tutorial_video_id,
      tutorial_pdf_url: miner.tutorial_pdf_url,
      firmware_url: miner.firmware_url,
      apps,
      created_at: miner.created_at,
      updated_at: miner.updated_at,
    };

    res.json({ miner: richMiner });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get miner details' });
  }
});

// GET /api/algorithms - Get all algorithms
router.get('/api/algorithms', async (req, res) => {
  try {
    const algorithms = db.prepare('SELECT DISTINCT algorithm FROM miners WHERE algorithm IS NOT NULL').all();

    res.json({
      algorithms: algorithms.map(a => a.algorithm) || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
