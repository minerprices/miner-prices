const path = require('path');
require('dotenv').config();

let pool;
let sqlite3;

const dbType = process.env.DB_TYPE || 'pg';

if (dbType === 'sqlite') {
  // SQLite mode (local development)
  sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, '../../miner_prices.db');
  
  pool = {
    db: new sqlite3.Database(dbPath),
    query: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        if (sql.toUpperCase().startsWith('SELECT')) {
          pool.db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve({ rows });
          });
        } else {
          pool.db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ rows: [], lastID: this.lastID });
          });
        }
      });
    },
    connect: () => Promise.resolve({ release: () => {} }),
    end: () => new Promise((resolve) => {
      pool.db.close(() => resolve());
    })
  };
  
  console.log('📁 Using SQLite database:', dbPath);
} else {
  // PostgreSQL mode (production)
  const { Pool } = require('pg');
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'miner_prices',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_USE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
  
  console.log('🐘 Using PostgreSQL:', process.env.DB_HOST);
}

module.exports = pool;
