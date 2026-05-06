import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Pages.css';

const MinerDetail = () => {
  const { id } = useParams();
  const [miner, setMiner] = useState(null);
  const [profitability, setProfitability] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [electricityCost, setElectricityCost] = useState(0.08);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMinerData();
  }, [id]);

  useEffect(() => {
    if (miner) {
      loadProfitability();
    }
  }, [miner, electricityCost]);

  const loadMinerData = async () => {
    try {
      setLoading(true);
      // Mock data - would fetch from API
      const mockMiners = {
        '1': { id: 1, name: 'Antminer S21 Pro 234T', algorithm: 'SHA256', power: 3290, specs: { hashrate: 234, efficiency: 14.0 }, manufacturer: 'Bitmain', release_date: '2024-01', price: 8500 },
        '2': { id: 2, name: 'Antminer S21 200T', algorithm: 'SHA256', power: 3080, specs: { hashrate: 200, efficiency: 15.4 }, manufacturer: 'Bitmain', release_date: '2024-01', price: 7200 },
        '6': { id: 6, name: 'Antminer L7 9500M', algorithm: 'Scrypt', power: 3425, specs: { hashrate: 9500, efficiency: 0.36 }, manufacturer: 'Bitmain', release_date: '2023-06', price: 6800 },
      };

      const m = mockMiners[id];
      if (!m) {
        setError('Miner not found');
        return;
      }

      setMiner(m);
    } catch (err) {
      setError('Failed to load miner');
    } finally {
      setLoading(false);
    }
  };

  const loadProfitability = async () => {
    try {
      // Mock profitability across coins
      const mockCoins = [
        { symbol: 'BTC', name: 'Bitcoin', price: 81400, daily: 5.5, monthly: 165, yearly: 2007 },
        { symbol: 'LTC', name: 'Litecoin', price: 56.62, daily: 2.1, monthly: 63, yearly: 767 },
        { symbol: 'DOGE', name: 'Dogecoin', price: 0.115, daily: 3.2, monthly: 96, yearly: 1168 },
      ];

      setProfitability(mockCoins);
      if (mockCoins.length > 0) {
        setSelectedCoin(mockCoins[0]);
      }
    } catch (err) {
      console.error('Error loading profitability:', err);
    }
  };

  if (loading) {
    return <div className="page-container"><div className="loading">Loading miner details...</div></div>;
  }

  if (error || !miner) {
    return <div className="page-container"><div className="error">{error || 'Miner not found'}</div></div>;
  }

  return (
    <div className="page-container">
      <div className="miner-detail">
        {/* Header Section */}
        <div className="detail-header">
          <div className="header-content">
            <h1>{miner.name}</h1>
            <div className="header-meta">
              <span className="manufacturer">{miner.manufacturer}</span>
              <span className="algorithm">{miner.algorithm}</span>
              <span className="release">Released {miner.release_date}</span>
            </div>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="specs-section">
          <h2>Specifications</h2>
          <div className="specs-grid">
            <div className="spec-item">
              <span className="label">Hashrate</span>
              <span className="value">{miner.specs.hashrate} {miner.algorithm === 'SHA256' ? 'TH/s' : 'MH/s'}</span>
            </div>
            <div className="spec-item">
              <span className="label">Power Consumption</span>
              <span className="value">{miner.power}W</span>
            </div>
            <div className="spec-item">
              <span className="label">Efficiency</span>
              <span className="value">{miner.specs.efficiency} W/{miner.algorithm === 'SHA256' ? 'TH/s' : 'MH/s'}</span>
            </div>
            <div className="spec-item">
              <span className="label">Algorithm</span>
              <span className="value">{miner.algorithm}</span>
            </div>
            <div className="spec-item">
              <span className="label">Est. Price</span>
              <span className="value">${miner.price}</span>
            </div>
            <div className="spec-item">
              <span className="label">Manufacturer</span>
              <span className="value">{miner.manufacturer}</span>
            </div>
          </div>
        </div>

        {/* Profitability Section */}
        <div className="profitability-section">
          <h2>Profitability by Coin</h2>
          
          <div className="electricity-control">
            <label>Electricity Cost: </label>
            <div className="cost-input">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={electricityCost}
                onChange={(e) => setElectricityCost(parseFloat(e.target.value))}
              />
              <span>$/kWh</span>
            </div>
          </div>

          <div className="coins-grid">
            {profitability.map(coin => (
              <div
                key={coin.symbol}
                className={`coin-card ${selectedCoin?.symbol === coin.symbol ? 'active' : ''}`}
                onClick={() => setSelectedCoin(coin)}
              >
                <h3>{coin.symbol}</h3>
                <p className="coin-name">{coin.name}</p>
                <div className="coin-price">${coin.price.toFixed(2)}</div>
                <div className="profit-info">
                  <div className="profit-daily">
                    <span className="label">Daily</span>
                    <span className="value">${coin.daily.toFixed(2)}</span>
                  </div>
                  <div className="profit-monthly">
                    <span className="label">Monthly</span>
                    <span className="value">${coin.monthly.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedCoin && (
            <div className="profit-detail">
              <h3>Detailed Profitability: {selectedCoin.symbol}</h3>
              <table className="detail-table">
                <tbody>
                  <tr>
                    <td>Daily Profit</td>
                    <td className="value">${selectedCoin.daily.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Monthly Profit</td>
                    <td className="value">${selectedCoin.monthly.toFixed(0)}</td>
                  </tr>
                  <tr>
                    <td>Yearly Profit</td>
                    <td className="value">${selectedCoin.yearly.toFixed(0)}</td>
                  </tr>
                  <tr>
                    <td>Daily Power Cost</td>
                    <td className="value">${(miner.power / 1000 * 24 * electricityCost).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Days to Break-Even (@ $8000)</td>
                    <td className="value">{(8000 / selectedCoin.daily).toFixed(0)} days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Comparison Section */}
        <div className="comparison-section">
          <h2>Compare with Other Miners</h2>
          <button className="btn-compare">View Comparison Tool →</button>
        </div>

        {/* SEO Meta */}
        <div className="seo-section">
          <h3>About {miner.name}</h3>
          <p>
            The {miner.name} is a professional ASIC mining hardware manufactured by {miner.manufacturer}. 
            With {miner.specs.hashrate} {miner.algorithm === 'SHA256' ? 'TH/s' : 'MH/s'} hashrate and {miner.power}W power consumption, 
            it offers {miner.specs.efficiency} W/unit efficiency for {miner.algorithm} mining.
          </p>
          <p>
            This miner is optimized for profitability and is suitable for both large-scale mining operations 
            and smaller setups looking to maximize returns on {miner.algorithm} mining.
          </p>
        </div>
      </div>

      <style jsx>{`
        .miner-detail {
          max-width: 1000px;
          margin: 0 auto;
        }

        .detail-header {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          padding: 40px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .header-content h1 {
          margin: 0 0 15px 0;
          font-size: 32px;
        }

        .header-meta {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .header-meta span {
          background: rgba(255,255,255,0.2);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
        }

        .specs-section {
          background: white;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .specs-section h2 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #212529;
          border-bottom: 2px solid #dee2e6;
          padding-bottom: 10px;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .spec-item {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
          border-left: 4px solid #007bff;
        }

        .spec-item .label {
          display: block;
          font-size: 12px;
          color: #6c757d;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .spec-item .value {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #212529;
        }

        .profitability-section {
          background: white;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .profitability-section h2 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #212529;
        }

        .electricity-control {
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .electricity-control label {
          font-weight: 600;
        }

        .cost-input {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8f9fa;
          padding: 8px 12px;
          border-radius: 4px;
        }

        .cost-input input {
          width: 100px;
          padding: 6px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .coins-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }

        .coin-card {
          padding: 20px;
          background: #f8f9fa;
          border: 2px solid #dee2e6;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .coin-card:hover {
          border-color: #007bff;
          background: #f0f7ff;
        }

        .coin-card.active {
          border-color: #007bff;
          background: #e7f0ff;
          box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }

        .coin-card h3 {
          margin: 0 0 5px 0;
          font-size: 16px;
        }

        .coin-card .coin-name {
          margin: 0 0 10px 0;
          font-size: 12px;
          color: #6c757d;
        }

        .coin-card .coin-price {
          font-size: 14px;
          font-weight: 600;
          color: #007bff;
          margin-bottom: 10px;
        }

        .profit-info {
          display: flex;
          gap: 10px;
          font-size: 12px;
        }

        .profit-info > div {
          flex: 1;
        }

        .profit-info .label {
          display: block;
          color: #6c757d;
          font-size: 11px;
        }

        .profit-info .value {
          display: block;
          font-weight: 700;
          color: #28a745;
          margin-top: 3px;
        }

        .profit-detail {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
          margin-top: 20px;
        }

        .profit-detail h3 {
          margin-top: 0;
          margin-bottom: 15px;
        }

        .detail-table {
          width: 100%;
          border-collapse: collapse;
        }

        .detail-table tr {
          border-bottom: 1px solid #dee2e6;
        }

        .detail-table td {
          padding: 12px 0;
        }

        .detail-table .value {
          font-weight: 700;
          color: #28a745;
          text-align: right;
        }

        .comparison-section {
          background: white;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 30px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .btn-compare {
          padding: 12px 30px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
          margin-top: 15px;
        }

        .btn-compare:hover {
          background: #0056b3;
        }

        .seo-section {
          background: #f8f9fa;
          padding: 25px;
          border-radius: 8px;
          line-height: 1.8;
          color: #495057;
        }

        .seo-section h3 {
          color: #212529;
          margin-bottom: 15px;
        }

        .seo-section p {
          margin-bottom: 15px;
        }

        @media (max-width: 768px) {
          .detail-header {
            padding: 20px;
          }

          .header-content h1 {
            font-size: 24px;
          }

          .specs-grid {
            grid-template-columns: 1fr;
          }

          .coins-grid {
            grid-template-columns: 1fr;
          }

          .header-meta {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default MinerDetail;
