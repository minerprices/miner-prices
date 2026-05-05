const Database = require('sqlite3').Database;
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = path.join(__dirname, '../../miner_prices.db');

async function migrate() {
  return new Promise((resolve, reject) => {
    const db = new Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Failed to open database:', err);
        reject(err);
        return;
      }

      console.log('🔄 Running SQLite migrations...');

      const migrations = [
        `CREATE TABLE IF NOT EXISTS vendors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          company_name TEXT NOT NULL,
          contact_name TEXT,
          phone TEXT,
          website TEXT,
          approved INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,

        `CREATE TABLE IF NOT EXISTS miners (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          model TEXT NOT NULL UNIQUE,
          description TEXT,
          photo_url TEXT,
          hashrate REAL,
          power_consumption REAL,
          algorithm TEXT,
          price_usd REAL,
          profitability_score REAL,
          whattomine_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,

        `CREATE TABLE IF NOT EXISTS locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          vendor_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          country TEXT,
          city TEXT,
          address TEXT,
          price_per_th_month REAL,
          capacity_th INTEGER,
          available_th INTEGER,
          cooling_type TEXT,
          power_cost_kwh REAL,
          approved INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (vendor_id) REFERENCES vendors(id)
        );`,

        `CREATE TABLE IF NOT EXISTS vendor_miners (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          vendor_id INTEGER NOT NULL,
          miner_id INTEGER NOT NULL,
          price_usd REAL,
          stock INTEGER,
          approved INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (vendor_id) REFERENCES vendors(id),
          FOREIGN KEY (miner_id) REFERENCES miners(id)
        );`,

        `CREATE TABLE IF NOT EXISTS approvals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          vendor_id INTEGER NOT NULL,
          status TEXT DEFAULT 'pending',
          approved_by INTEGER,
          approved_at DATETIME,
          rejection_reason TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (vendor_id) REFERENCES vendors(id)
        );`,

        `CREATE TABLE IF NOT EXISTS password_resets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          vendor_id INTEGER NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          used INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (vendor_id) REFERENCES vendors(id)
        );`,

        `CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,

        `CREATE TABLE IF NOT EXISTS sync_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          last_sync DATETIME,
          miners_added INTEGER DEFAULT 0,
          miners_updated INTEGER DEFAULT 0,
          status TEXT,
          error_message TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,

        `CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email);`,
        `CREATE INDEX IF NOT EXISTS idx_miners_model ON miners(model);`,
        `CREATE INDEX IF NOT EXISTS idx_locations_vendor ON locations(vendor_id);`,
        `CREATE INDEX IF NOT EXISTS idx_vendor_miners_vendor ON vendor_miners(vendor_id);`,
        `CREATE INDEX IF NOT EXISTS idx_approvals_vendor ON approvals(vendor_id);`,
        `CREATE INDEX IF NOT EXISTS idx_password_resets_vendor ON password_resets(vendor_id);`
      ];

      let completed = 0;

      const runNextMigration = () => {
        if (completed >= migrations.length) {
          // Seed initial admin if doesn't exist
          db.run(
            `INSERT OR IGNORE INTO admins (email, password) VALUES (?, ?)`,
            ['admin@minerprices.com', '$2b$10$YourHashedPasswordHere'],
            (err) => {
              if (err) console.warn('⚠️  Admin seed warning:', err.message);
              else console.log('✅ Admin account ready');
              
              db.close((err) => {
                if (err) {
                  console.error('❌ Error closing database:', err);
                  reject(err);
                } else {
                  console.log('✅ Database schema created successfully');
                  console.log('📁 Database location:', dbPath);
                  resolve();
                }
              });
              return;
            }
          );
        } else {
          db.run(migrations[completed], (err) => {
            if (err) {
              console.error(`❌ Migration ${completed + 1} failed:`, err);
              reject(err);
            } else {
              completed++;
              runNextMigration();
            }
          });
        }
      };

      runNextMigration();
    });
  });
}

migrate().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
