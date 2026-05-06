import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './MinerDetail.css';

const MinerDetailNew = () => {
  const { slug } = useParams();
  const [miner, setMiner] = useState(null);
  const [minedCoins, setMinedCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [electricityCost, setElectricityCost] = useState(0.08);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock miner data - would fetch from API in production
  const mockMiners = {
    'whatsminer-m79s-1-35ph-s': {
      id: 3,
      name: 'MicroBT Whatsminer M79S',
      slug: 'whatsminer-m79s-1-35ph-s',
      manufacturer: 'MicroBT',
      algorithm: 'SHA256',
      hashrate: 1.35,
      hashrate_unit: 'PH/s',
      power: 20000,
      efficiency: 14.81,
      efficiency_unit: 'J/TH',
      weight: 26,
      release_date: 'Dec 2025',
      price: 129.43,
      image: 'https://via.placeholder.com/500x400?text=Whatsminer+M79S',
      description: 'The Whatsminer M79S delivers massive 1.35 PH/s hashrate for industrial-scale Bitcoin mining with excellent efficiency.',
    },
    'antminer-s21-pro-234t': {
      id: 1,
      name: 'Antminer S21 Pro',
      slug: 'antminer-s21-pro-234t',
      manufacturer: 'Bitmain',
      algorithm: 'SHA256',
      hashrate: 234,
      hashrate_unit: 'TH/s',
      power: 3290,
      efficiency: 14.06,
      efficiency_unit: 'J/TH',
      weight: 6.5,
      release_date: '2024-01',
      price: 8500,
      image: 'https://via.placeholder.com/500x400?text=Antminer+S21+Pro',
      description: 'Professional SHA256 ASIC with exceptional hashrate and industry-leading efficiency.',
    },
    'antminer-l7-9500m': {
      id: 4,
      name: 'Antminer L7',
      slug: 'antminer-l7-9500m',
      manufacturer: 'Bitmain',
      algorithm: 'Scrypt',
      hashrate: 9500,
      hashrate_unit: 'MH/s',
      power: 3425,
      efficiency: 0.36,
      efficiency_unit: 'W/MH',
      weight: 4.8,
      release_date: '2023-06',
      price: 6800,
      image: 'https://via.placeholder.com/500x400?text=Antminer+L7',
      description: 'High-performance Scrypt miner perfect for Litecoin and Dogecoin.',
    },
  };

  // Algorithm to coins mapping
  const algorithmCoins = {
    'SHA256': [
      { symbol: 'BTC', name: 'Bitcoin', price: 81400, daily: 54.51, monthly: 1635.40, yearly: 19897.41 },
      { symbol: 'BCH', name: 'Bitcoin Cash', price: 461.56, daily: 52.49, monthly: 1574.70, yearly: 19147.90 },
      { symbol: 'BSV', name: 'Bitcoin SV', price: 200.00, daily: 48.20, monthly: 1446.00, yearly: 17607.00 },
    ],
    'Scrypt': [
      { symbol: 'LTC', name: 'Litecoin', price: 56.62, daily: 12.30, monthly: 369.00, yearly: 4490.00 },
      { symbol: 'DOGE', name: 'Dogecoin', price: 0.115, daily: 8.50, monthly: 255.00, yearly: 3105.00 },
      { symbol: 'DASH', name: 'Dash', price: 48.16, daily: 10.20, monthly: 306.00, yearly: 3726.00 },
    ],
    'Equihash': [
      { symbol: 'ZEC', name: 'Zcash', price: 526.86, daily: 18.50, monthly: 555.00, yearly: 6756.00 },
    ],
    'Kaspa': [
      { symbol: 'KAS', name: 'Kaspa', price: 0.03474, daily: 22.10, monthly: 663.00, yearly: 8070.00 },
    ],
    'Ethash': [
      { symbol: 'ETC', name: 'Ethereum Classic', price: 9.18, daily: 15.80, monthly: 474.00, yearly: 5767.00 },
    ],
  };

  useEffect(() => {
    loadMinerData();
  }, [slug]);

  const loadMinerData = async () => {
    try {
      setLoading(true);
      const m = mockMiners[slug];
      
      if (!m) {
        setError('Miner not found');
        return;
      }

      setMiner(m);
      const coins = algorithmCoins[m.algorithm] || [];
      setMinedCoins(coins);
      
      if (coins.length > 0) {
        setSelectedCoin(coins[0]);
      }
    } catch (err) {
      setError('Failed to load miner');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="detail-container"><div className="loading">Loading...</div></div>;
  }

  if (error || !miner) {
    return <div className="detail-container"><div className="error">{error}</div></div>;
  }

  const dailyCost = (miner.power / 1000) * 24 * electricityCost;
  const dailyProfit = (selectedCoin?.daily || 0) - dailyCost;

  return (
    <div className="detail-container">
      {/* Header */}
      <div className="detail-header">
        <div className="header-top">
          <span className="manufacturer">MANUFACTURED BY{miner.manufacturer}</span>
        </div>
        
        <div className="header-main">
          <div className="miner-image">
            <img src={miner.image} alt={miner.name} />
          </div>
          
          <div className="miner-title-section">
            <h1>{miner.name}</h1>
            <p className="miner-subtitle">({miner.hashrate} {miner.hashrate_unit})</p>
            
            <div className="profit-card">
              <div className="profit-main">
                <span className="profit-label">Realtime Mining Profit</span>
                <span className="profit-amount">${selectedCoin?.daily.toFixed(2) || '0.00'} /Day</span>
                <span className="profit-note">as of {new Date().toLocaleDateString()}</span>
              </div>
              
              <div className="price-section">
                <span className="price-label">Best Price:</span>
                <span className="price-amount">${miner.price}</span>
                <span className="in-stock">(In Stock)</span>
              </div>

              <div className="profit-ratio">
                <div className="ratio-item">
                  <span className="ratio-percent">{((selectedCoin?.daily / (selectedCoin?.daily + dailyCost)) * 100).toFixed(2)}%</span>
                  <span className="ratio-label">Profit Ratio</span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-percent">{((dailyCost / (selectedCoin?.daily + dailyCost)) * 100).toFixed(2)}%</span>
                  <span className="ratio-label">Electricity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="specs-section">
        <h2>Specifications</h2>
        <div className="specs-grid">
          <div className="spec-item">
            <span className="spec-label">Hashrate</span>
            <span className="spec-value">{miner.hashrate} {miner.hashrate_unit}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Power</span>
            <span className="spec-value">{miner.power} W</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Efficiency</span>
            <span className="spec-value">{miner.efficiency} {miner.efficiency_unit}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Weight</span>
            <span className="spec-value">{miner.weight} Kg</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Algorithm</span>
            <span className="spec-value">{miner.algorithm}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Release Date</span>
            <span className="spec-value">{miner.release_date}</span>
          </div>
        </div>
      </div>

      {/* Profitability */}
      <div className="profitability-section">
        <div className="profit-controls">
          <span>plus electricity</span>
          <div className="cost-slider">
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={electricityCost}
              onChange={(e) => setElectricityCost(parseFloat(e.target.value))}
              className="cost-input"
            />
            <span>/KWh</span>
          </div>
          <span>minus electricity</span>
        </div>

        {selectedCoin && (
          <div className="profit-breakdown">
            <div className="breakdown-item income">
              <span className="icon">💵️</span>
              <span className="label">Income</span>
              <div className="values">
                <div>${selectedCoin.daily.toFixed(2)}</div>
                <div>${(selectedCoin.daily * 30).toFixed(2)}</div>
                <div>${selectedCoin.yearly.toFixed(2)}</div>
              </div>
            </div>

            <div className="breakdown-item electricity">
              <span className="icon">⚡️</span>
              <span className="label">Electricity</span>
              <div className="values">
                <div>-${dailyCost.toFixed(2)}</div>
                <div>-${(dailyCost * 30).toFixed(2)}</div>
                <div>-${(dailyCost * 365).toFixed(2)}</div>
              </div>
            </div>

            <div className="breakdown-item profit">
              <span className="icon">💰️</span>
              <span className="label">Profit</span>
              <div className="values">
                <div>${dailyProfit.toFixed(2)}</div>
                <div>${(dailyProfit * 30).toFixed(2)}</div>
                <div>${(dailyProfit * 365).toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        <div className="profit-periods">
          <span>daily</span>
          <span>monthly</span>
          <span>yearly</span>
        </div>
      </div>

      {/* Mineable Coins */}
      <div className="mineable-coins-section">
        <h2>Mineable Coins</h2>
        <table className="coins-table">
          <thead>
            <tr>
              <th>Coin</th>
              <th>Algorithm</th>
              <th>Daily Income</th>
              <th>Daily Profit</th>
            </tr>
          </thead>
          <tbody>
            {minedCoins.map(coin => {
              const cost = (miner.power / 1000) * 24 * electricityCost;
              const profit = coin.daily - cost;
              return (
                <tr
                  key={coin.symbol}
                  className={selectedCoin?.symbol === coin.symbol ? 'active' : ''}
                  onClick={() => setSelectedCoin(coin)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="coin-name">{coin.name}</td>
                  <td>{miner.algorithm}</td>
                  <td className="income">${coin.daily.toFixed(2)}</td>
                  <td className={`profit ${profit >= 0 ? 'positive' : 'negative'}`}>
                    ${profit.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Where to Buy Section */}
      <div className="where-to-buy-section">
        <h2>Where to Buy?</h2>
        <table className="vendors-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Country</th>
              <th>Condition</th>
              <th>Stock</th>
              <th>Best Price</th>
              <th>Price/TH</th>
              <th>ROI</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Mock vendor data */}
            {[
              {
                vendor: 'Crypto Miner Bros',
                country: 'United States',
                condition: 'Brand New',
                stock: 'In Stock',
                price: 12289.00,
                price_per_th: 9102.96,
                roi: 306,
                url: '#',
              },
              {
                vendor: 'ASIC Marketplace',
                country: 'United States',
                condition: 'Brand New',
                stock: 'In Stock',
                price: 12289.00,
                price_per_th: 9102.96,
                roi: 306,
                coupon: 'MOON70',
                url: '#',
              },
              {
                vendor: 'One Miners',
                country: 'United States',
                condition: 'Brand New',
                stock: 'In Stock',
                price: 12478.00,
                price_per_th: 9242.96,
                roi: 311,
                url: '#',
              },
              {
                vendor: 'Yes Mining',
                country: 'Hong Kong',
                condition: 'Brand New',
                stock: 'In Stock',
                price: 18680.00,
                price_per_th: 13837.04,
                roi: 466,
                url: '#',
              },
              {
                vendor: 'millionminer.com',
                country: 'Germany',
                condition: 'Brand New',
                stock: 'Out of Stock',
                price: 19299.00,
                price_per_th: 14295.56,
                roi: 481,
                url: '#',
              },
            ].map((offer, idx) => (
              <tr key={idx} className={offer.stock === 'Out of Stock' ? 'out-of-stock' : ''}>
                <td className="vendor-name">{offer.vendor}</td>
                <td>{offer.country}</td>
                <td>{offer.condition}</td>
                <td className={offer.stock === 'In Stock' ? 'in-stock' : 'out-of-stock'}>
                  {offer.stock}
                </td>
                <td className="price">${offer.price.toFixed(2)}</td>
                <td>${offer.price_per_th.toFixed(2)}/TH</td>
                <td className="roi">{offer.roi} Days</td>
                <td>
                  <a href={offer.url} className="shop-btn" target="_blank" rel="noopener noreferrer">
                    {offer.coupon ? offer.coupon : 'SHOP'}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>How long does it take to break even?</h3>
            <p>
              The ROI period is usually 6–964 days, depending on current Bitcoin price and electricity rates. 
              It changes based on network difficulty and market conditions.
            </p>
          </div>
          <div className="faq-item">
            <h3>What is the daily profit?</h3>
            <p>
              Considering an electricity cost of $0.08/kWh, the {miner.name} generates approximately 
              ${selectedCoin?.daily.toFixed(2) || '0.00'} daily, ${(selectedCoin?.daily * 30).toFixed(2) || '0.00'} monthly, 
              and ${(selectedCoin?.yearly).toFixed(2) || '0.00'} yearly.
            </p>
          </div>
          <div className="faq-item">
            <h3>Is it still profitable?</h3>
            <p>
              Yes, as of today, the {miner.name} remains profitable for {miner.algorithm} mining. 
              Profitability depends on electricity costs, Bitcoin price, and network difficulty.
            </p>
          </div>
          <div className="faq-item">
            <h3>What coins can it mine?</h3>
            <p>
              The {miner.name} mines {miner.algorithm} coins only: {minedCoins.map(c => c.name).join(', ')}.
            </p>
          </div>
          <div className="faq-item">
            <h3>Power consumption?</h3>
            <p>
              The {miner.name} consumes {miner.power}W with an efficiency of {miner.efficiency} {miner.efficiency_unit}.
            </p>
          </div>
          <div className="faq-item">
            <h3>Manufacturer?</h3>
            <p>
              The {miner.name} is manufactured by {miner.manufacturer}, a leading ASIC hardware producer.
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="description-section">
        <h2>About {miner.name}</h2>
        <p>{miner.description}</p>
        <p>
          The {miner.name} is optimized for {miner.algorithm} mining, making it ideal for mining 
          {minedCoins.map(c => c.name).join(', ')}. With its excellent efficiency ratio and 
          stable performance, this miner is suitable for both large-scale operations and 
          dedicated mining farms.
        </p>
      </div>
    </div>
  );
};

export default MinerDetailNew;
