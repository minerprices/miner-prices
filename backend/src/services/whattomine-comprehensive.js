const axios = require('axios');
const { db } = require('../db/sqlite-init');
const { getMetadata, getAllMetadata } = require('../db/oneminers-metadata');

const WHATTOMINE_API = 'https://whattomine.com/api/v1';

/**
 * Fetch ASIC miners with full specifications from WhattoMine API
 * Includes: name, hashrate, power, algorithm, release_date, etc.
 */
async function fetchASICsFromWhattoMine() {
  try {
    console.log('📥 Fetching ASIC miners from WhattoMine API...');
    
    const response = await axios.get(`${WHATTOMINE_API}/asics.json`, {
      timeout: 30000,
    });

    const asics = response.data.asics || [];
    console.log(`✅ Fetched ${asics.length} ASIC miners`);

    return asics.map(asic => ({
      whattomine_id: asic.id,
      name: asic.name,
      release_date: asic.release_date,
      algorithms: asic.algorithms || [],
      // Additional metadata we'll populate
      image_url: asic.image_url || null,
      manufacturer: extractManufacturer(asic.name),
      cooling_type: detectCoolingType(asic.name),
      specs: JSON.stringify({
        hashrate: asic.algorithms?.[0]?.hashrate || 0,
        power: asic.algorithms?.[0]?.power || 0,
        algorithm: asic.algorithms?.[0]?.name || 'Unknown',
        efficiency: asic.algorithms?.[0]?.power && asic.algorithms?.[0]?.hashrate 
          ? (asic.algorithms[0].power / asic.algorithms[0].hashrate).toFixed(6)
          : 0,
      }),
    }));
  } catch (error) {
    console.error('❌ WhattoMine ASIC fetch error:', error.message);
    return [];
  }
}

/**
 * Fetch coin prices from CoinGecko (free, no API key)
 */
async function fetchCoinPricesFromCoinGecko() {
  try {
    console.log('💰 Fetching coin prices from CoinGecko...');
    
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'bitcoin,litecoin,zcash,dogecoin,ethereum-classic,kaspa,ravencoin,nervos-network,monero',
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_market_cap: true,
        },
        timeout: 10000,
      }
    );

    console.log('✅ Coin prices updated from CoinGecko');
    return response.data;
  } catch (error) {
    console.error('⚠️ CoinGecko fetch error:', error.message);
    return null;
  }
}

/**
 * Extract manufacturer from miner name
 */
function extractManufacturer(name) {
  if (name.includes('Antminer')) return 'Bitmain';
  if (name.includes('Whatsminer')) return 'MicroBT';
  if (name.includes('Avalon')) return 'Canaan';
  if (name.includes('Goldshell')) return 'Goldshell';
  if (name.includes('Innosilicon')) return 'Innosilicon';
  return 'Unknown';
}

/**
 * Detect cooling type from miner name
 */
function detectCoolingType(name) {
  if (name.includes('Immersion')) return 'Immersion';
  if (name.includes('Hyd')) return 'Hydro';
  return 'Air';
}

/**
 * Enrich miner with OneMiriers metadata
 */
function enrichMinerWithMetadata(miner) {
  const metadata = getMetadata(miner.name);
  
  if (!metadata) {
    return miner;
  }

  return {
    ...miner,
    image_url: metadata.image_urls?.[0] || null,
    manufacturer: metadata.manufacturer,
    cooling_type: metadata.cooling_type,
    tutorial_video_id: metadata.tutorial_video?.youtube_id || null,
    tutorial_pdf_url: metadata.tutorial_pdf_url || null,
    firmware_url: metadata.firmware_url || null,
    apps: metadata.apps ? JSON.stringify(metadata.apps) : null,
  };
}

/**
 * Sync ASICs to database with metadata
 */
async function syncASICsToDatabase(db) {
  try {
    const asics = await fetchASICsFromWhattoMine();
    
    if (asics.length === 0) {
      console.warn('⚠️ No ASICS fetched from WhattoMine');
      return 0;
    }

    // Clear old miners
    db.prepare('DELETE FROM miners').run();

    const insertMiner = db.prepare(`
      INSERT OR IGNORE INTO miners 
      (whattomine_id, name, algorithm, power_consumption, specs, 
       manufacturer, cooling_type, image_url, tutorial_video_id, 
       tutorial_pdf_url, firmware_url, apps, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const insertAll = db.transaction(() => {
      asics.forEach(asic => {
        const mainAlgo = asic.algorithms[0] || {};
        
        // Enrich with OneMiriers metadata
        const enriched = enrichMinerWithMetadata({
          whattomine_id: asic.whattomine_id,
          name: asic.name,
          algorithm: mainAlgo.name || 'Unknown',
          power_consumption: mainAlgo.power || 0,
          specs: asic.specs,
          manufacturer: asic.manufacturer,
          cooling_type: asic.cooling_type,
        });
        
        insertMiner.run(
          enriched.whattomine_id,
          enriched.name,
          enriched.algorithm,
          enriched.power_consumption,
          enriched.specs,
          enriched.manufacturer,
          enriched.cooling_type,
          enriched.image_url,
          enriched.tutorial_video_id,
          enriched.tutorial_pdf_url,
          enriched.firmware_url,
          enriched.apps
        );
      });
    });

    insertAll();
    console.log(`✅ Synced ${asics.length} ASIC miners with OneMiriers metadata`);
    
    // Log sync
    db.prepare(`
      INSERT INTO sync_log (miners_added, status)
      VALUES (?, 'success')
    `).run(asics.length);

    return asics.length;
  } catch (error) {
    console.error('Sync error:', error);
    return 0;
  }
}

/**
 * Miner metadata mapping (links to tutorials, firmware, apps)
 * This would be populated manually or from OneMiriers data
 */
const minerMetadata = {
  'Antminer S21 Pro': {
    image_url: 'https://images.oneminers.com/miners/antminer-s21-pro.jpg',
    manufacturer: 'Bitmain',
    cooling_type: 'Air',
    tutorial_video_id: 'dQw4w9WgXcQ', // YouTube video ID from oneminers channel
    tutorial_pdf_url: 'https://oneminers.com/downloads/antminer-s21-pro-guide.pdf',
    firmware_url: 'https://oneminers.com/firmware/antminer-s21-pro-latest.bin',
    apps: [
      { name: 'Ant Miner Control', url: 'https://oneminers.com/apps/ant-miner-control' },
      { name: 'Mining Pool Manager', url: 'https://oneminers.com/apps/mining-pool-manager' }
    ]
  },
  'Whatsminer M79S': {
    image_url: 'https://images.oneminers.com/miners/whatsminer-m79s.jpg',
    manufacturer: 'MicroBT',
    cooling_type: 'Hydro',
    tutorial_video_id: 'abc123def456',
    tutorial_pdf_url: 'https://oneminers.com/downloads/whatsminer-m79s-guide.pdf',
    firmware_url: 'https://oneminers.com/firmware/whatsminer-m79s-latest.bin',
    apps: [
      { name: 'Whatsminer Dashboard', url: 'https://oneminers.com/apps/whatsminer-dashboard' },
      { name: 'Hash Rate Monitor', url: 'https://oneminers.com/apps/hashrate-monitor' }
    ]
  },
  // More miners would be added here
};

module.exports = { 
  fetchASICsFromWhattoMine, 
  fetchCoinPricesFromCoinGecko,
  syncASICsToDatabase,
  minerMetadata,
  extractManufacturer,
  detectCoolingType,
};
