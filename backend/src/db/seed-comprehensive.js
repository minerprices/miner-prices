/**
 * Comprehensive data seeding for Miner Prices
 * Includes: Miners, Coins, Vendors, Locations, and Profitability calculations
 */

function seedComprehensiveData(db) {
  console.log('📊 Seeding comprehensive mining data...');

  // ============ COINS - Real market data ============
  const coins = [
    // SHA256 coins
    { symbol: 'BTC', name: 'Bitcoin', algorithm: 'SHA256', price: 81400, block_reward: 6.25, block_time: 600, difficulty: 100000 },
    { symbol: 'BCH', name: 'Bitcoin Cash', algorithm: 'SHA256', price: 461.56, block_reward: 6.25, block_time: 600, difficulty: 50000 },
    
    // Scrypt coins
    { symbol: 'LTC', name: 'Litecoin', algorithm: 'Scrypt', price: 56.62, block_reward: 6.25, block_time: 150, difficulty: 30000 },
    { symbol: 'DOGE', name: 'Dogecoin', algorithm: 'Scrypt', price: 0.1152, block_reward: 10000, block_time: 60, difficulty: 20000 },
    
    // Equihash coins
    { symbol: 'ZEC', name: 'Zcash', algorithm: 'Equihash', price: 526.86, block_reward: 3.125, block_time: 75, difficulty: 15000 },
    
    // Ethereum & similar
    { symbol: 'ETC', name: 'Ethereum Classic', algorithm: 'Ethash', price: 9.18, block_reward: 3.2, block_time: 12, difficulty: 40000 },
    
    // Alternative algorithms
    { symbol: 'KAS', name: 'Kaspa', algorithm: 'Kaspa', price: 0.03474, block_reward: 30, block_time: 15, difficulty: 5000 },
    { symbol: 'RVN', name: 'Ravencoin', algorithm: 'Kawpow', price: 0.006072, block_reward: 5000, block_time: 60, difficulty: 10000 },
    { symbol: 'CKB', name: 'Nervos Network', algorithm: 'Eaglesong', price: 0.00155, block_reward: 5000, block_time: 60, difficulty: 8000 },
    { symbol: 'XMR', name: 'Monero', algorithm: 'RandomX', price: 408.96, block_reward: 0.6, block_time: 120, difficulty: 50000 },
    { symbol: 'ALPH', name: 'Alephium', algorithm: 'Blake3', price: 0.0579, block_reward: 1.5, block_time: 16, difficulty: 3000 },
    { symbol: 'BEAM', name: 'Beam', algorithm: 'BeamHash', price: 0.02006, block_reward: 80, block_time: 60, difficulty: 5000 },
  ];

  const existingCoins = db.prepare('SELECT COUNT(*) as count FROM coins').get().count;
  if (existingCoins === 0) {
    const insertCoin = db.prepare(`
      INSERT INTO coins (symbol, name, algorithm, price, block_reward, block_time, network_difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertAllCoins = db.transaction(() => {
      coins.forEach(coin => {
        insertCoin.run(coin.symbol, coin.name, coin.algorithm, coin.price, coin.block_reward, coin.block_time, coin.difficulty);
      });
    });

    insertAllCoins();
    console.log(`✅ Inserted ${coins.length} coins`);
  }

  // ============ ENHANCED MINERS - More realistic data ============
  const enhancedMiners = [
    // SHA256 Miners
    { whattomine_id: 1, name: 'Antminer S23 Hyd (580 TH/s)', algorithm: 'SHA256', power: 5510, hashrate: 580, efficiency: 9.5 },
    { whattomine_id: 2, name: 'Antminer S21 Pro 234T', algorithm: 'SHA256', power: 3290, hashrate: 234, efficiency: 14.0 },
    { whattomine_id: 3, name: 'Whatsminer M50S (112 TH/s)', algorithm: 'SHA256', power: 3472, hashrate: 112, efficiency: 31.0 },
    { whattomine_id: 4, name: 'Antminer T19 84T', algorithm: 'SHA256', power: 2800, hashrate: 84, efficiency: 33.3 },
    { whattomine_id: 5, name: 'Whatsminer M33S (13 TH/s)', algorithm: 'SHA256', power: 1900, hashrate: 13, efficiency: 146.0 },

    // Scrypt Miners
    { whattomine_id: 6, name: 'Antminer L7 9500M', algorithm: 'Scrypt', power: 3425, hashrate: 9500, efficiency: 0.36 },
    { whattomine_id: 7, name: 'Antminer K7 63.5T', algorithm: 'Scrypt', power: 3348, hashrate: 63.5, efficiency: 52.8 },
    { whattomine_id: 8, name: 'Goldshell LT5', algorithm: 'Scrypt', power: 2300, hashrate: 2800, efficiency: 0.82 },

    // Equihash Miners
    { whattomine_id: 9, name: 'Antminer Z15 Pro 840K', algorithm: 'Equihash', power: 2780, hashrate: 840, efficiency: 3.3 },
    { whattomine_id: 10, name: 'Antminer Z15 420K', algorithm: 'Equihash', power: 1510, hashrate: 420, efficiency: 3.6 },

    // Ethash Miners
    { whattomine_id: 11, name: 'Innosilicon A11 Pro 2400M', algorithm: 'Ethash', power: 3010, hashrate: 2400, efficiency: 1.25 },
    { whattomine_id: 12, name: 'Innosilicon A10 1300M', algorithm: 'Ethash', power: 2350, hashrate: 1300, efficiency: 1.81 },

    // Kaspa Miners
    { whattomine_id: 13, name: 'Goldshell CK5', algorithm: 'Kaspa', power: 750, hashrate: 2300, efficiency: 0.33 },
    { whattomine_id: 14, name: 'Goldshell CK6', algorithm: 'Kaspa', power: 1200, hashrate: 4500, efficiency: 0.27 },

    // Kawpow Miners
    { whattomine_id: 15, name: 'Goldshell KD2', algorithm: 'Kawpow', power: 1400, hashrate: 20, efficiency: 70.0 },

    // RandomX Miners
    { whattomine_id: 16, name: 'AMD Ryzen 9 5950X', algorithm: 'RandomX', power: 250, hashrate: 95, efficiency: 2.63 },
  ];

  const existingMiners = db.prepare('SELECT COUNT(*) as count FROM miners').get().count;
  if (existingMiners < 16) {
    const insertMiner = db.prepare(`
      INSERT OR IGNORE INTO miners (whattomine_id, name, algorithm, power_consumption, specs, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    const insertAllMiners = db.transaction(() => {
      enhancedMiners.forEach(miner => {
        const specs = JSON.stringify({ hashrate: miner.hashrate, efficiency: miner.efficiency });
        insertMiner.run(miner.whattomine_id, miner.name, miner.algorithm, miner.power, specs);
      });
    });

    insertAllMiners();
    console.log(`✅ Inserted/updated ${enhancedMiners.length} miners`);
  }

  // ============ VENDORS - Hosting providers ============
  const vendors = [
    { email: 'support@hashratehost.com', company: 'Hashrate Host', country: 'US', fee_per_kwh: 0.05, description: 'US-based mining hosting with 99.9% uptime' },
    { email: 'info@miningco.com', company: 'MiningCo', country: 'Iceland', fee_per_kwh: 0.04, description: 'Iceland geothermal energy, premium reliability' },
    { email: 'sales@asiccenter.io', company: 'ASIC Center', country: 'China', fee_per_kwh: 0.03, description: 'China\'s largest hosting facility, competitive rates' },
    { email: 'contact@globalhost.net', company: 'Global Host Mining', country: 'Canada', fee_per_kwh: 0.06, description: 'Canada hydro power, 24/7 support' },
    { email: 'info@cryptofarm.pro', company: 'CryptoFarm Pro', country: 'Kazakhstan', fee_per_kwh: 0.02, description: 'Low-cost hosting, industrial scale' },
  ];

  const existingVendors = db.prepare('SELECT COUNT(*) as count FROM vendors').get().count;
  if (existingVendors === 0) {
    const insertVendor = db.prepare(`
      INSERT INTO vendors (email, company_name, approved, created_at)
      VALUES (?, ?, 1, datetime('now'))
    `);

    const insertAllVendors = db.transaction(() => {
      vendors.forEach(vendor => {
        insertVendor.run(vendor.email, vendor.company);
      });
    });

    insertAllVendors();
    console.log(`✅ Inserted ${vendors.length} hosting vendors`);
  }

  // ============ LOCATIONS - Hosting locations ============
  const locations = [
    { vendor_id: 1, name: 'Texas Facility (500MW)', country: 'US', fee: 0.05, capacity_kw: 500000 },
    { vendor_id: 2, name: 'Reykjavik Geothermal Plant', country: 'Iceland', fee: 0.04, capacity_kw: 150000 },
    { vendor_id: 3, name: 'Beijing Industrial Complex', country: 'China', fee: 0.03, capacity_kw: 800000 },
    { vendor_id: 4, name: 'Vancouver Hydro Center', country: 'Canada', fee: 0.06, capacity_kw: 200000 },
    { vendor_id: 5, name: 'Almaty Power Station', country: 'Kazakhstan', fee: 0.02, capacity_kw: 600000 },
  ];

  const existingLocations = db.prepare('SELECT COUNT(*) as count FROM locations').get().count;
  if (existingLocations === 0) {
    const insertLocation = db.prepare(`
      INSERT INTO locations (vendor_id, name, country, hosting_fee_per_kwh, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);

    const insertAllLocations = db.transaction(() => {
      locations.forEach(loc => {
        insertLocation.run(loc.vendor_id, loc.name, loc.country, loc.fee);
      });
    });

    insertAllLocations();
    console.log(`✅ Inserted ${locations.length} hosting locations`);
  }

  console.log('✅ Comprehensive data seeding complete!');
}

module.exports = { seedComprehensiveData };
