const express = require('express');
const router = express.Router();
const db = require('../db/db');

/**
 * Initialize database schema
 * GET /init/setup
 */
router.get('/setup', async (req, res) => {
  try {
    console.log('🔧 Initializing database...');

    // Create tables
    const schema = `
      CREATE TABLE IF NOT EXISTS admins (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS vendors (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        company_name VARCHAR(255),
        approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS miners (
        id BIGSERIAL PRIMARY KEY,
        whattomine_id INTEGER UNIQUE,
        name VARCHAR(255),
        algorithm VARCHAR(100),
        power_consumption DECIMAL,
        specs JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS locations (
        id BIGSERIAL PRIMARY KEY,
        vendor_id BIGINT REFERENCES vendors(id),
        name VARCHAR(255),
        country VARCHAR(100),
        hosting_fee_per_kwh DECIMAL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sync_log (
        id BIGSERIAL PRIMARY KEY,
        miners_added INTEGER,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS approvals (
        id BIGSERIAL PRIMARY KEY,
        vendor_id BIGINT,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS password_resets (
        id BIGSERIAL PRIMARY KEY,
        vendor_id BIGINT,
        token VARCHAR(255) UNIQUE,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Execute schema
    await db.query(schema);

    // Create admin account
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);

    await db.query(
      `INSERT INTO admins (email, password_hash, name) 
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
      ['admin@minerprices.com', hash, 'System Admin']
    );

    res.json({
      status: 'success',
      message: 'Database initialized successfully',
      admin: {
        email: 'admin@minerprices.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
