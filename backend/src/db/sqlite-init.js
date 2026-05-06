const Database = require('better-sqlite3');
const path = require('path');
const { seedComprehensiveData } = require('./seed-comprehensive');

const dbPath = path.join(__dirname, '../../minerprices.db');
const db = new Database(dbPath);

function initializeDB() {
  seedComprehensiveData();
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS miners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      whattomine_id INTEGER UNIQUE,
      name TEXT,
      algorithm TEXT,
      power_consumption REAL,
      specs TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password_hash TEXT,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password_hash TEXT,
      company_name TEXT,
      approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_id INTEGER,
      name TEXT,
      country TEXT,
      hosting_fee_per_kwh REAL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT UNIQUE,
      name TEXT,
      algorithm TEXT,
      price REAL,
      price_change_24h REAL,
      block_time INTEGER,
      block_reward REAL,
      network_difficulty REAL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS miner_profitability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      miner_id INTEGER,
      coin_id INTEGER,
      daily_profit REAL,
      monthly_profit REAL,
      yearly_profit REAL,
      roi_days INTEGER,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(miner_id) REFERENCES miners(id),
      FOREIGN KEY(coin_id) REFERENCES coins(id)
    );
  `);

  // Check if miners exist
  const minerCount = db.prepare('SELECT COUNT(*) as count FROM miners').get().count;

  if (minerCount === 0) {
    // Insert miners
    const insertMiner = db.prepare(`
      INSERT INTO miners (whattomine_id, name, algorithm, power_consumption, specs, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    const miners = [
      [1, 'Antminer S21 Pro 234T', 'SHA256', 3290, '{"hashrate": 234}'],
      [2, 'Antminer S21 200T', 'SHA256', 3080, '{"hashrate": 200}'],
      [3, 'Antminer K7 63.5T', 'Scrypt', 3348, '{"hashrate": 63.5}'],
      [4, 'Antminer L7 9500M', 'Scrypt', 3425, '{"hashrate": 9500}'],
      [5, 'Antminer Z15 Pro 420K', 'Equihash', 1800, '{"hashrate": 420000}'],
      [6, 'Whatsminer M53S+ 56T', 'SHA256', 3276, '{"hashrate": 56}'],
      [7, 'Whatsminer M33S+ 13T', 'SHA256', 1900, '{"hashrate": 13}'],
      [8, 'Innosilicon A11 Pro 2400M', 'Ethereum', 3010, '{"hashrate": 2400}'],
      [9, 'Innosilicon A10 1300M', 'Ethereum', 2350, '{"hashrate": 1300}'],
      [10, 'Canaan AvalonMiner A1246 100T', 'SHA256', 3200, '{"hashrate": 100}'],
      [11, 'Bitmain Antminer T19 84T', 'SHA256', 2800, '{"hashrate": 84}'],
      [12, 'MicroBT Whatsminer M50S 112T', 'SHA256', 3472, '{"hashrate": 112}'],
      [13, 'Ebang Ebit E12+', 'SHA256', 2646, '{"hashrate": 44}'],
      [14, 'Innosilicon A10 Pro 750M', 'Ethereum', 1350, '{"hashrate": 750}'],
      [15, 'Goldshell CK5', 'Kaspa', 750, '{"hashrate": 2300}'],
    ];

    const insertAll = db.transaction(() => {
      miners.forEach(miner => insertMiner.run(...miner));
    });

    insertAll();
    console.log(`✅ Inserted ${miners.length} miners`);
  }

  // Check if coins exist
  const coinCount = db.prepare('SELECT COUNT(*) as count FROM coins').get().count;

  if (coinCount === 0) {
    const insertCoin = db.prepare(`
      INSERT INTO coins (symbol, name, algorithm, price, price_change_24h, block_time, block_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const coins = [
      ['BTC', 'Bitcoin', 'SHA256', 81400, 0.9, 600, 6.25],
      ['ETH', 'Ethereum', 'Ethereum', 2400, 2.1, 12, 3.0],
      ['LTC', 'Litecoin', 'Scrypt', 56.62, 2.7, 150, 6.25],
      ['ZEC', 'Zcash', 'Equihash', 526.86, 3.2, 75, 3.125],
      ['DOGE', 'Dogecoin', 'Scrypt', 0.115, 3.3, 60, 10000],
      ['ETC', 'Ethereum Classic', 'Ethash', 9.18, 4.4, 12, 3.2],
      ['KAS', 'Kaspa', 'Kaspa', 0.0347, 3.3, 15, 30],
      ['RVN', 'Ravencoin', 'Kawpow', 0.006, 2.2, 60, 5000],
      ['CKB', 'Nervos', 'Eaglesong', 0.0015, 2.4, 60, 5000],
      ['XMR', 'Monero', 'RandomX', 408.96, 1.5, 120, 0.6],
    ];

    const insertAllCoins = db.transaction(() => {
      coins.forEach(coin => insertCoin.run(...coin));
    });

    insertAllCoins();
    console.log(`✅ Inserted ${coins.length} coins`);
  }

  // Check if admin exists
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get().count;

  if (adminCount === 0) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);

    db.prepare(`
      INSERT INTO admins (email, password_hash, name)
      VALUES (?, ?, ?)
    `).run('admin@minerprices.com', hash, 'System Admin');

    console.log('✅ Admin account created');
  }
}

module.exports = { db, initializeDB };
