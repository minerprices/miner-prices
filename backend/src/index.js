const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
require('dotenv').config({ override: true });

const authRoutes = require('./routes/auth');
const minersRoutes = require('./routes/miners');
const locationsRoutes = require('./routes/locations');
const adminRoutes = require('./routes/admin');
const imagesRoutes = require('./routes/images-working');
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

// Initialize local SQLite database on startup
initializeDB();
console.log('✅ Database initialized');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/init', initRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/miners', minersRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imagesRoutes);
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
  res.json({ status: 'ok', timestamp: new Date() });
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
