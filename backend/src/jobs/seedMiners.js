const axios = require('axios');
require('dotenv').config({ override: true });

// Mock miners data for testing
const mockMiners = [
  {
    model: 'Antminer S21 Pro 234T',
    name: 'Antminer S21 Pro',
    hashrate: 234,
    power: 3290,
    algorithm: 'SHA256',
    description: 'Latest flagship ASIC miner from Bitmain. 234 TH/s hash rate.',
    whattomine_id: 1,
    price_usd: 3500,
  },
  {
    model: 'Antminer S21 200T',
    name: 'Antminer S21',
    hashrate: 200,
    power: 3080,
    algorithm: 'SHA256',
    description: 'Popular Bitmain ASIC miner. 200 TH/s performance.',
    whattomine_id: 2,
    price_usd: 2900,
  },
  {
    model: 'Antminer K7 63.5T',
    name: 'Antminer K7',
    hashrate: 63.5,
    power: 3348,
    algorithm: 'Scrypt',
    description: 'Scrypt ASIC miner from Bitmain.',
    whattomine_id: 3,
    price_usd: 2200,
  },
  {
    model: 'Antminer L7 9500M',
    name: 'Antminer L7',
    hashrate: 9500,
    power: 3425,
    algorithm: 'Scrypt',
    description: 'High-performance Scrypt miner.',
    whattomine_id: 4,
    price_usd: 1800,
  },
  {
    model: 'Antminer Z15 Pro 420K',
    name: 'Antminer Z15 Pro',
    hashrate: 420000,
    power: 1800,
    algorithm: 'Equihash',
    description: 'Professional Equihash mining solution.',
    whattomine_id: 5,
    price_usd: 2100,
  },
  {
    model: 'Whatsminer M53S+ 56T',
    name: 'Whatsminer M53S+',
    hashrate: 56,
    power: 3276,
    algorithm: 'SHA256',
    description: 'MicroBT SHA256 ASIC miner.',
    whattomine_id: 6,
    price_usd: 2400,
  },
  {
    model: 'Whatsminer M33S+ 13T',
    name: 'Whatsminer M33S+',
    hashrate: 13,
    power: 1900,
    algorithm: 'SHA256',
    description: 'Efficient mid-range ASIC miner.',
    whattomine_id: 7,
    price_usd: 1200,
  },
  {
    model: 'Innosilicon A11 Pro 2400M',
    name: 'Innosilicon A11 Pro',
    hashrate: 2400,
    power: 3010,
    algorithm: 'Ethereum',
    description: 'Ethereum mining ASIC.',
    whattomine_id: 8,
    price_usd: 1600,
  },
  {
    model: 'Innosilicon A10 1300M',
    name: 'Innosilicon A10',
    hashrate: 1300,
    power: 2350,
    algorithm: 'Ethereum',
    description: 'Previous generation Ethereum miner.',
    whattomine_id: 9,
    price_usd: 900,
  },
  {
    model: 'Canaan AvalonMiner A1246 100T',
    name: 'Canaan AvalonMiner A1246',
    hashrate: 100,
    power: 3200,
    algorithm: 'SHA256',
    description: 'Canaan SHA256 ASIC miner.',
    whattomine_id: 10,
    price_usd: 2600,
  },
];

async function seedMiners() {
  console.log('📦 Seeding miners database...');
  
  // Display mockdata since we can't connect to database from sandbox
  console.log(`\n✓ Ready to sync ${mockMiners.length} miners when deployed to Render`);
  console.log('\nMiner data available:');
  mockMiners.forEach(m => {
    console.log(`  - ${m.model} (${m.hashrate} ${m.algorithm})`);
  });
  
  console.log('\n💡 To actually sync to database:');
  console.log('   1. Deploy backend to Render');
  console.log('   2. Run: npm run sync-miners');
  console.log('   3. Or set up daily cron job');
}

seedMiners().catch(console.error);
