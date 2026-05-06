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

// Upload endpoints
app.post('/api/images/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const imageUrl = `/images/${req.file.filename}`;
    res.json({ success: true, url: imageUrl, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/images/list', (req, res) => {
  try {
    const files = require('fs').readdirSync(uploadDir);
    res.json({ images: files.map(f => ({ filename: f, url: `/images/${f}` })) });
  } catch (err) {
    res.json({ images: [] });
  }
});

app.delete('/api/images/:filename', (req, res) => {
  try {
    const filepath = path.join(uploadDir, req.params.filename);
    if (!filepath.startsWith(uploadDir)) return res.status(400).json({ error: 'Invalid' });
    if (require('fs').existsSync(filepath)) {
      require('fs').unlinkSync(filepath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.use('/init', initRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/miners', minersRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/admin', adminRoutes);
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
