/**
 * Miner Algorithm to Mineable Coins Mapping
 * Each algorithm can only mine specific coins
 */

const algorithmCoinMap = {
  'SHA256': ['BTC', 'BCH', 'BSV'],  // Bitcoin, Bitcoin Cash, Bitcoin SV
  'Scrypt': ['LTC', 'DOGE', 'DASH'],  // Litecoin, Dogecoin, Dash
  'Equihash': ['ZEC', 'ZCASH'],  // Zcash
  'Ethash': ['ETC'],  // Ethereum Classic
  'Kaspa': ['KAS'],  // Kaspa only
  'Kawpow': ['RVN'],  // Ravencoin only
  'Eaglesong': ['CKB'],  // Nervos only
  'RandomX': ['XMR'],  // Monero only
  'Blake3': ['ALPH'],  // Alephium only
  'BeamHash': ['BEAM'],  // Beam only
};

const minerData = [
  // SHA256 Miners
  {
    id: 1,
    name: 'Antminer S21 Pro 234T',
    slug: 'antminer-s21-pro-234t',
    manufacturer: 'Bitmain',
    algorithm: 'SHA256',
    hashrate: 234,
    hashrate_unit: 'TH/s',
    power: 3290,
    efficiency: 14.06,
    efficiency_unit: 'J/TH',
    weight: 6.5,
    weight_unit: 'kg',
    release_date: '2024-01',
    price_usd: 8500,
    image_url: '/images/miners/antminer-s21-pro.jpg',
    description: 'The Antminer S21 Pro is the latest SHA256 ASIC from Bitmain, delivering exceptional hashrate with industry-leading efficiency.',
  },
  {
    id: 2,
    name: 'Antminer S21 200T',
    slug: 'antminer-s21-200t',
    manufacturer: 'Bitmain',
    algorithm: 'SHA256',
    hashrate: 200,
    hashrate_unit: 'TH/s',
    power: 3080,
    efficiency: 15.4,
    efficiency_unit: 'J/TH',
    weight: 6.2,
    weight_unit: 'kg',
    release_date: '2024-01',
    price_usd: 7200,
    image_url: '/images/miners/antminer-s21.jpg',
    description: 'A powerful SHA256 mining device with balanced hashrate and power consumption, ideal for large-scale operations.',
  },
  {
    id: 3,
    name: 'Whatsminer M79S 1.35PH/s',
    slug: 'whatsminer-m79s-1-35ph-s',
    manufacturer: 'MicroBT',
    algorithm: 'SHA256',
    hashrate: 1.35,
    hashrate_unit: 'PH/s',
    power: 20000,
    efficiency: 14.81,
    efficiency_unit: 'J/TH',
    weight: 26,
    weight_unit: 'kg',
    release_date: '2025-12',
    price_usd: 129.43,
    image_url: '/images/miners/whatsminer-m79s.jpg',
    description: 'The Whatsminer M79S delivers massive 1.35 PH/s hashrate for industrial-scale Bitcoin mining with excellent efficiency.',
  },

  // Scrypt Miners
  {
    id: 4,
    name: 'Antminer L7 9500M',
    slug: 'antminer-l7-9500m',
    manufacturer: 'Bitmain',
    algorithm: 'Scrypt',
    hashrate: 9500,
    hashrate_unit: 'MH/s',
    power: 3425,
    efficiency: 0.36,
    efficiency_unit: 'W/MH',
    weight: 4.8,
    weight_unit: 'kg',
    release_date: '2023-06',
    price_usd: 6800,
    image_url: '/images/miners/antminer-l7.jpg',
    description: 'The Antminer L7 is a high-performance Scrypt miner, perfect for mining Litecoin and Dogecoin at scale.',
  },
  {
    id: 5,
    name: 'Antminer K7 63.5T',
    slug: 'antminer-k7-63-5t',
    manufacturer: 'Bitmain',
    algorithm: 'Scrypt',
    hashrate: 63.5,
    hashrate_unit: 'TH/s',
    power: 3348,
    efficiency: 52.8,
    efficiency_unit: 'J/TH',
    weight: 5.2,
    weight_unit: 'kg',
    release_date: '2023-12',
    price_usd: 5400,
    image_url: '/images/miners/antminer-k7.jpg',
    description: 'Efficient Scrypt miner with excellent power-to-hashrate ratio for Litecoin mining operations.',
  },

  // Equihash Miners
  {
    id: 6,
    name: 'Antminer Z15 Pro 840K',
    slug: 'antminer-z15-pro-840k',
    manufacturer: 'Bitmain',
    algorithm: 'Equihash',
    hashrate: 840,
    hashrate_unit: 'kSol/s',
    power: 2780,
    efficiency: 3.3,
    efficiency_unit: 'W/kSol',
    weight: 3.6,
    weight_unit: 'kg',
    release_date: '2023-08',
    price_usd: 4200,
    image_url: '/images/miners/antminer-z15-pro.jpg',
    description: 'Professional Equihash miner for Zcash mining with stable performance and low power draw.',
  },

  // Kaspa Miners
  {
    id: 7,
    name: 'Goldshell CK5',
    slug: 'goldshell-ck5',
    manufacturer: 'Goldshell',
    algorithm: 'Kaspa',
    hashrate: 2300,
    hashrate_unit: 'GH/s',
    power: 750,
    efficiency: 0.33,
    efficiency_unit: 'W/GH',
    weight: 1.2,
    weight_unit: 'kg',
    release_date: '2023-11',
    price_usd: 3500,
    image_url: '/images/miners/goldshell-ck5.jpg',
    description: 'Compact and efficient Kaspa miner, ideal for mining the emerging Kaspa blockchain with minimal power consumption.',
  },

  // Scrypt Miners (Additional)
  {
    id: 8,
    name: 'Antminer K6 42T',
    slug: 'antminer-k6-42t',
    manufacturer: 'Bitmain',
    algorithm: 'Scrypt',
    hashrate: 42,
    hashrate_unit: 'TH/s',
    power: 2200,
    efficiency: 52.4,
    efficiency_unit: 'J/TH',
    weight: 4.5,
    weight_unit: 'kg',
    release_date: '2023-06',
    price_usd: 3800,
    image_url: '/images/miners/antminer-k6.jpg',
    description: 'Reliable Scrypt miner for Litecoin and Dogecoin, offering great value for mid-sized operations.',
  },

  // Ethash Miners
  {
    id: 9,
    name: 'Innosilicon A11 Pro 2400M',
    slug: 'innosilicon-a11-pro-2400m',
    manufacturer: 'Innosilicon',
    algorithm: 'Ethash',
    hashrate: 2400,
    hashrate_unit: 'MH/s',
    power: 3010,
    efficiency: 1.25,
    efficiency_unit: 'W/MH',
    weight: 2.8,
    weight_unit: 'kg',
    release_date: '2023-09',
    price_usd: 4800,
    image_url: '/images/miners/innosilicon-a11.jpg',
    description: 'Professional Ethereum Classic miner with stable hashrate and industry-standard reliability.',
  },

  // RandomX Miners (CPU Mining - as reference)
  {
    id: 10,
    name: 'AMD Ryzen 9 5950X',
    slug: 'amd-ryzen-9-5950x',
    manufacturer: 'AMD',
    algorithm: 'RandomX',
    hashrate: 95,
    hashrate_unit: 'kH/s',
    power: 250,
    efficiency: 2.63,
    efficiency_unit: 'W/kH',
    weight: 0.05,
    weight_unit: 'kg',
    release_date: '2023-11',
    price_usd: 800,
    image_url: '/images/miners/amd-ryzen-9.jpg',
    description: 'High-end CPU for Monero RandomX mining, combining gaming performance with mining capability.',
  },
];

module.exports = { algorithmCoinMap, minerData };
