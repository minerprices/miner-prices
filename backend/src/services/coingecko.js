const axios = require('axios');

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const coinMapping = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'LTC': 'litecoin',
  'ZEC': 'zcash',
  'DOGE': 'dogecoin',
  'ETC': 'ethereum-classic',
  'KAS': 'kaspa',
  'RVN': 'ravencoin',
  'CKB': 'nervos-network',
  'XMR': 'monero',
  'ALPH': 'alephium',
  'BEAM': 'beam-new',
  'BCH': 'bitcoin-cash',
};

/**
 * Fetch real-time coin prices from CoinGecko (free, no API key needed)
 */
async function fetchCoinPrices() {
  try {
    const ids = Object.values(coinMapping).join(',');
    
    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: ids,
        vs_currencies: 'usd',
        include_market_cap: true,
        include_24hr_vol: true,
        include_24hr_change: true,
      },
      timeout: 10000,
    });

    const priceData = {};
    for (const [symbol, coinId] of Object.entries(coinMapping)) {
      if (response.data[coinId]) {
        priceData[symbol] = {
          price: response.data[coinId].usd,
          price_change_24h: response.data[coinId].usd_24h_change || 0,
          market_cap: response.data[coinId].usd_market_cap || 0,
          volume_24h: response.data[coinId].usd_24h_vol || 0,
        };
      }
    }

    return priceData;
  } catch (error) {
    console.error('CoinGecko fetch error:', error.message);
    return null;
  }
}

/**
 * Update database with latest prices
 */
async function updateCoinPrices(db) {
  try {
    const prices = await fetchCoinPrices();
    
    if (!prices) {
      console.warn('⚠️  CoinGecko update failed, keeping old prices');
      return false;
    }

    const updatePrice = db.prepare(`
      UPDATE coins 
      SET price = ?, price_change_24h = ?, updated_at = datetime('now')
      WHERE symbol = ?
    `);

    const updateAll = db.transaction(() => {
      for (const [symbol, data] of Object.entries(prices)) {
        updatePrice.run(data.price, data.price_change_24h, symbol);
      }
    });

    updateAll();
    console.log(`✅ Updated ${Object.keys(prices).length} coin prices from CoinGecko`);
    return true;
  } catch (error) {
    console.error('Price update error:', error);
    return false;
  }
}

module.exports = { fetchCoinPrices, updateCoinPrices, coinMapping };
