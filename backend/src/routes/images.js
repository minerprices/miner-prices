const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db/sqlite-init');
const { downloadAndProcessImage } = require('../services/image-processor');
const { getImageListForMiner } = require('../services/image-finder');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../public/miner-images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    cb(null, `miner-${timestamp}-${random}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images allowed'));
    }
  }
});

// GET /api/images/miner/:minerId - Get all images for a miner
router.get('/miner/:minerId', (req, res) => {
  try {
    const { minerId } = req.params;
    
    const images = db.prepare(`
      SELECT id, url, is_primary, uploaded_at
      FROM miner_images
      WHERE miner_id = ?
      ORDER BY is_primary DESC, uploaded_at DESC
    `).all(minerId);

    res.json({ images });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// POST /api/images/upload - Upload image for a miner
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const { minerId } = req.body;
    
    if (!minerId) {
      // Delete uploaded file if no miner ID
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Miner ID required' });
    }

    // Verify miner exists
    const miner = db.prepare('SELECT id FROM miners WHERE id = ?').get(minerId);
    if (!miner) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Miner not found' });
    }

    // Check if this is the first image (should be primary)
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM miner_images WHERE miner_id = ?').get(minerId).count;
    const isPrimary = existingCount === 0 ? 1 : 0;

    // Save to database
    const imageUrl = `/miner-images/${req.file.filename}`;
    db.prepare(`
      INSERT INTO miner_images (miner_id, url, is_primary)
      VALUES (?, ?, ?)
    `).run(minerId, imageUrl, isPrimary);

    res.json({
      status: 'success',
      image: {
        filename: req.file.filename,
        url: imageUrl,
        is_primary: isPrimary
      },
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    // Delete file if database insert failed
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// POST /api/images/:imageId/primary - Set image as primary
router.post('/:imageId/primary', (req, res) => {
  try {
    const { imageId } = req.params;

    // Get the image
    const image = db.prepare('SELECT miner_id FROM miner_images WHERE id = ?').get(imageId);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Remove primary flag from all images of this miner
    db.prepare('UPDATE miner_images SET is_primary = 0 WHERE miner_id = ?').run(image.miner_id);

    // Set this image as primary
    db.prepare('UPDATE miner_images SET is_primary = 1 WHERE id = ?').run(imageId);

    res.json({ status: 'success', message: 'Primary image updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// DELETE /api/images/:imageId - Delete an image
router.delete('/:imageId', (req, res) => {
  try {
    const { imageId } = req.params;

    // Get the image
    const image = db.prepare('SELECT id, url FROM miner_images WHERE id = ?').get(imageId);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../../public', image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    db.prepare('DELETE FROM miner_images WHERE id = ?').run(imageId);

    res.json({ status: 'success', message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// GET /api/images/find/:minerId - Get list of 5 images for a miner
router.get('/find/:minerId', (req, res) => {
  try {
    const { minerId } = req.params;

    // Get miner name
    const miner = db.prepare('SELECT name FROM miners WHERE id = ?').get(minerId);
    if (!miner) {
      return res.status(404).json({ error: 'Miner not found' });
    }

    // Get image list for this miner
    const imageList = getImageListForMiner(miner.name);

    res.json({
      status: 'success',
      miner: miner.name,
      images: imageList.map((url, idx) => ({
        id: idx,
        url: url,
        title: `Image ${idx + 1}`
      })),
      message: 'Select one image to use for this miner'
    });
  } catch (error) {
    console.error('Find error:', error);
    res.status(500).json({ error: 'Failed to get images' });
  }
});

// POST /api/images/select - User selects an image from the list
router.post('/select', (req, res) => {
  try {
    const { minerId, imageUrl } = req.body;

    if (!minerId || !imageUrl) {
      return res.status(400).json({ error: 'Miner ID and image URL required' });
    }

    // Verify miner exists
    const miner = db.prepare('SELECT id FROM miners WHERE id = ?').get(minerId);
    if (!miner) {
      return res.status(404).json({ error: 'Miner not found' });
    }

    // Check if first image for this miner
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM miner_images WHERE miner_id = ?').get(minerId).count;
    const isPrimary = existingCount === 0 ? 1 : 0;

    // Save the selected image URL directly to database
    db.prepare(`
      INSERT INTO miner_images (miner_id, url, is_primary)
      VALUES (?, ?, ?)
    `).run(minerId, imageUrl, isPrimary);

    res.json({
      status: 'success',
      message: 'Image selected and saved',
      image: {
        url: imageUrl,
        is_primary: isPrimary
      }
    });
  } catch (error) {
    console.error('Select error:', error);
    res.status(500).json({ error: 'Failed to select image', details: error.message });
  }
});

module.exports = router;
