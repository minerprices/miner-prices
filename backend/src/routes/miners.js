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

// ===== SPECIFIC ROUTES FIRST (before /:id) =====

// POST /api/miners/upload-image - Upload and assign image to miner
router.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const minerId = req.body.minerId;
    if (!minerId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'minerId required' });
    }

    const miner = db.prepare('SELECT id FROM miners WHERE id = ?').get(minerId);
    if (!miner) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Miner not found' });
    }

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

// POST /api/miners/:id/image - Assign image to miner
router.post('/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url } = req.body;

    const miner = db.prepare('SELECT id FROM miners WHERE id = ?').get(id);
    if (!miner) {
      return res.status(404).json({ error: 'Miner not found' });
    }

    db.prepare('UPDATE miners SET image_url = ? WHERE id = ?').run(image_url, id);
    res.json({ success: true, message: 'Image assigned', id, image_url });
  } catch (error) {
    console.error('Image assign error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/miners/:id/image/remove - Remove image from miner
router.post('/:id/image/remove', async (req, res) => {
  try {
    const { id } = req.params;

    const miner = db.prepare('SELECT id FROM miners WHERE id = ?').get(id);
    if (!miner) {
      return res.status(404).json({ error: 'Miner not found' });
    }

    db.prepare('UPDATE miners SET image_url = NULL WHERE id = ?').run(id);
    res.json({ success: true, message: 'Image removed', id });
  } catch (error) {
    console.error('Image remove error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/miners/:id/full - Get miner with full metadata
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
