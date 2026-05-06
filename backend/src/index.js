const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
require('dotenv').config({ override: true });

const authRoutes = require('./routes/auth');
const minersRoutes = require('./routes/miners');
const locationsRoutes = require('./routes/locations');
const adminRoutes = require('./routes/admin');
const imageUploadRoutes = require('./routes/image-upload');
const imageRoutes = require('./routes/images');
const minerImagesRoutes = require('./routes/miner-images');
const uploadRoutes = require('./routes/upload');

// File upload middleware
const multer = require('multer');
const path = require('path');
const uploadDir = path.join(__dirname, '../public/images');
if (!require('fs').existsSync(uploadDir)) {
  require('fs').mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.random().toString(36).substr(2, 9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
const initRoutes = require('./routes/init-rest');
const profitabilityRoutes = require('./routes/profitability');
const calculatorRoutes = require('./routes/calculator');
const vendorsRoutes = require('./routes/vendors');
const toolsRoutes = require('./routes/tools');
const { updateCoinPrices } = require('./services/coingecko');
const { syncMiners } = require('./jobs/syncMiners');
const { initializeDB } = require('./db/sqlite-init');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 STARTING WITH IMAGE UPLOAD ROUTES');

// Initialize local SQLite database on startup
initializeDB();
console.log('✅ Database initialized - image upload ready');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Upload endpoint (uses external ImgBB service)
app.use('/api/upload', uploadRoutes);

// Upload endpoints for miner images - SAVE TO FILES
app.post('/api/miners/:minerId/images/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    
    const minerId = req.params.minerId;
    
    // Verify miner exists
    const miner = db.prepare('SELECT id FROM miners WHERE id = ?').get(minerId);
    if (!miner) return res.status(404).json({ error: 'Miner not found' });
    
    // File is already saved by multer to uploadDir
    // req.file.filename is the saved filename
    const imageUrl = `/images/${req.file.filename}`;
    
    // Check if first image
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM miner_images WHERE miner_id = ?').get(minerId).count;
    const isPrimary = existingCount === 0 ? 1 : 0;
    
    // Save to database
    db.prepare('INSERT INTO miner_images (miner_id, url, is_primary) VALUES (?, ?, ?)').run(minerId, imageUrl, isPrimary);
    
    console.log(`✅ Image uploaded for miner ${minerId}: ${imageUrl}`);
    
    res.json({ success: true, url: imageUrl, filename: req.file.filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/miners/:minerId/images', (req, res) => {
  try {
    const minerId = req.params.minerId;
    
    // Verify miner exists
    const miner = db.prepare('SELECT id FROM miners WHERE id = ?').get(minerId);
    if (!miner) return res.status(404).json({ error: 'Miner not found' });
    
    const images = db.prepare('SELECT id, url, is_primary FROM miner_images WHERE miner_id = ? ORDER BY is_primary DESC, uploaded_at DESC').all(minerId);
    
    res.json({ images: images || [] });
  } catch (err) {
    res.json({ images: [] });
  }
});

app.delete('/api/miners/:minerId/images/:imageId', (req, res) => {
  try {
    const { minerId, imageId } = req.params;
    
    // Verify image belongs to miner
    const image = db.prepare('SELECT url FROM miner_images WHERE id = ? AND miner_id = ?').get(imageId, minerId);
    if (!image) return res.status(404).json({ error: 'Image not found' });
    
    // Delete file
    const filepath = path.join(uploadDir, path.basename(image.url));
    if (require('fs').existsSync(filepath)) {
      require('fs').unlinkSync(filepath);
    }
    
    // Delete from database
    db.prepare('DELETE FROM miner_images WHERE id = ?').run(imageId);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/miners/:minerId/images/:imageId/primary', (req, res) => {
  try {
    const { minerId, imageId } = req.params;
    
    // Verify image belongs to miner
    const image = db.prepare('SELECT id FROM miner_images WHERE id = ? AND miner_id = ?').get(imageId, minerId);
    if (!image) return res.status(404).json({ error: 'Image not found' });
    
    // Remove primary from all miner's images
    db.prepare('UPDATE miner_images SET is_primary = 0 WHERE miner_id = ?').run(minerId);
    
    // Set this as primary
    db.prepare('UPDATE miner_images SET is_primary = 1 WHERE id = ?').run(imageId);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add image by URL - DOWNLOAD AND SAVE TO FILES
app.post('/api/miners/:minerId/images/add-url', async (req, res) => {
  try {
    const { minerId } = req.params;
    const { url } = req.body;

    if (!url) return res.status(400).json({ error: 'URL required' });

    // Verify miner exists
    const miner = db.prepare('SELECT id FROM miners WHERE id = ?').get(minerId);
    if (!miner) return res.status(404).json({ error: 'Miner not found' });

    // Download image from URL
    const https = require('https');
    const http = require('http');
    const fs = require('fs');
    
    const downloadImage = (imageUrl) => {
      return new Promise((resolve, reject) => {
        const proto = imageUrl.startsWith('https') ? https : http;
        const filename = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + '.jpg';
        const filepath = path.join(uploadDir, filename);
        
        const file = fs.createWriteStream(filepath);
        
        proto.get(imageUrl, { timeout: 5000 }, (response) => {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve({ filename, url: `/images/${filename}` });
          });
        }).on('error', (err) => {
          fs.unlink(filepath, () => {});
          reject(err);
        });
      });
    };

    // Download and save
    const result = await downloadImage(url);
    
    // Check if first image
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM miner_images WHERE miner_id = ?').get(minerId).count;
    const isPrimary = existingCount === 0 ? 1 : 0;

    // Save to database
    db.prepare('INSERT INTO miner_images (miner_id, url, is_primary) VALUES (?, ?, ?)').run(minerId, result.url, isPrimary);

    console.log(`✅ Image from URL saved for miner ${minerId}: ${result.url}`);

    res.json({ success: true, url: result.url, filename: result.filename });
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Failed to download image: ' + err.message });
  }
});

// Routes
app.use('/init', initRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/miners', minersRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/miner-images', minerImagesRoutes);
app.use('/api', imageUploadRoutes);
app.use('/api/profitability', profitabilityRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/tools', toolsRoutes);

// Update coin prices from CoinGecko every hour
setInterval(async () => {
  try {
    await updateCoinPrices(db);
  } catch (error) {
    console.error('CoinGecko update error:', error);
  }
}, 3600000); // 1 hour

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(), 
    images: 'working',
    upload: '/api/upload',
    list: '/api/images/list'
  });
});

// Test image endpoints status
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Image upload endpoints are ready',
    endpoints: {
      upload: 'POST /api/upload',
      list: 'GET /api/images/list',
      delete: 'DELETE /api/images/:filename'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Schedule WhattoMine sync job (daily at 2 AM UTC)
cron.schedule('0 2 * * *', async () => {
  console.log('⏰ Starting scheduled miner sync...');
  try {
    await syncMiners();
  } catch (error) {
    console.error('Scheduled sync error:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Miner Prices Backend running on port ${PORT}`);
  console.log(`📧 Admin email: admin@minerprices.com`);
  console.log(`🔄 Daily sync scheduled at 2 AM UTC`);
});
// Force redeploy 1778041773
// Force redeploy 1778096766
// Deploy 1778102165
