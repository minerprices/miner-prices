import React, { useState, useEffect } from 'react';
import { profitabilityAPI } from '../api';
import './Pages.css';

const Calculator = () => {
  const [selectedMiners, setSelectedMiners] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState('1');
  const [electricityCost, setElectricityCost] = useState(0.08);
  const [minerCost, setMinerCost] = useState(1000);
  const [comparison, setComparison] = useState(null);
  const [roi, setRoi] = useState(null);
  const [miners, setMiners] = useState([]);
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load miners and coins (would need to fetch from API)
      // For now using mock data
      setMiners([
        { id: 1, name: 'Antminer S21 Pro 234T', algorithm: 'SHA256' },
        { id: 2, name: 'Antminer L7 9500M', algorithm: 'Scrypt' },
        { id: 3, name: 'Goldshell CK5', algorithm: 'Kaspa' },
      ]);
      setCoins([
        { id: 1, symbol: 'BTC', name: 'Bitcoin' },
        { id: 2, symbol: 'LTC', name: 'Litecoin' },
        { id: 3, symbol: 'KAS', name: 'Kaspa' },
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleMinerToggle = (minerId) => {
    setSelectedMiners(prev =>
      prev.includes(minerId)
        ? prev.filter(id => id !== minerId)
        : [...prev, minerId]
    );
  };

  const handleCompare = async () => {
    if (selectedMiners.length === 0) {
      alert('Please select at least one miner');
      return;
    }

    setLoading(true);
    try {
      const response = await profitabilityAPI.getAll({
        electricity_cost: electricityCost,
      });
      setComparison(response.data);
    } catch (error) {
      console.error('Comparison error:', error);
      alert('Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateROI = async () => {
    if (selectedMiners.length === 0) {
      alert('Please select a miner');
      return;
    }

    setLoading(true);
    try {
      // Would call ROI calculator endpoint
      console.log('Calculating ROI for:', {
        miner_id: selectedMiners[0],
        coin_id: selectedCoin,
        miner_cost_usd: minerCost,
        electricity_cost: electricityCost,
      });
      setRoi({
        miner_name: miners.find(m => m.id === selectedMiners[0])?.name,
        coin: coins.find(c => c.id === parseInt(selectedCoin))?.symbol,
        daily_profit: '5.50',
        monthly_profit: '165.00',
        yearly_profit: '2007.50',
        days_to_breakeven: '181.8',
      });
    } catch (error) {
      console.error('ROI error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>💰 Mining Calculator</h1>

      <div className="calculator-section">
        <div className="calc-card">
          <h2>Miner Comparison</h2>
          <div className="miner-selector">
            <h3>Select Miners:</h3>
            {miners.map(miner => (
              <label key={miner.id}>
                <input
                  type="checkbox"
                  checked={selectedMiners.includes(miner.id)}
                  onChange={() => handleMinerToggle(miner.id)}
                />
                {miner.name} ({miner.algorithm})
              </label>
            ))}
          </div>

          <div className="coin-selector">
            <label>
              Coin:
              <select value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)}>
                {coins.map(coin => (
                  <option key={coin.id} value={coin.id}>
                    {coin.symbol} - {coin.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="input-group">
            <label>
              Electricity Cost ($/kWh):
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={electricityCost}
                onChange={(e) => setElectricityCost(parseFloat(e.target.value))}
              />
            </label>
          </div>

          <button onClick={handleCompare} disabled={loading} className="primary-btn">
            {loading ? 'Calculating...' : 'Compare Miners'}
          </button>

          {comparison && (
            <div className="results">
              <h3>Comparison Results</h3>
              <table>
                <thead>
                  <tr>
                    <th>Miner</th>
                    <th>Daily Profit</th>
                    <th>Monthly</th>
                    <th>Yearly</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Results would populate here */}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="calc-card">
          <h2>ROI Calculator</h2>
          <div className="input-group">
            <label>
              Miner Cost (USD):
              <input
                type="number"
                min="100"
                step="100"
                value={minerCost}
                onChange={(e) => setMinerCost(parseFloat(e.target.value))}
              />
            </label>
          </div>

          <button onClick={handleCalculateROI} disabled={loading} className="primary-btn">
            {loading ? 'Calculating...' : 'Calculate ROI'}
          </button>

          {roi && (
            <div className="results">
              <h3>Return on Investment</h3>
              <div className="roi-grid">
                <div className="roi-item">
                  <span className="label">Miner:</span>
                  <span className="value">{roi.miner_name}</span>
                </div>
                <div className="roi-item">
                  <span className="label">Daily Profit:</span>
                  <span className="value">${roi.daily_profit}</span>
                </div>
                <div className="roi-item">
                  <span className="label">Days to Break Even:</span>
                  <span className="value">{roi.days_to_breakeven}</span>
                </div>
                <div className="roi-item">
                  <span className="label">Monthly Profit:</span>
                  <span className="value">${roi.monthly_profit}</span>
                </div>
                <div className="roi-item">
                  <span className="label">Yearly Profit:</span>
                  <span className="value">${roi.yearly_profit}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .calculator-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 20px;
        }

        .calc-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .calc-card h2 {
          margin-top: 0;
          color: #212529;
          border-bottom: 2px solid #007bff;
          padding-bottom: 10px;
        }

        .miner-selector,
        .coin-selector {
          margin: 15px 0;
        }

        .miner-selector h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
        }

        .miner-selector label {
          display: block;
          padding: 8px;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .miner-selector label:hover {
          background: #f8f9fa;
        }

        .miner-selector input[type="checkbox"] {
          margin-right: 8px;
        }

        .input-group {
          margin: 15px 0;
        }

        .input-group label {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-weight: 600;
        }

        .input-group input,
        .coin-selector select {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .primary-btn {
          width: 100%;
          padding: 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 15px;
          transition: background 0.3s;
        }

        .primary-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .results {
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
          border-left: 4px solid #28a745;
        }

        .results h3 {
          margin-top: 0;
          color: #28a745;
        }

        .roi-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 15px;
        }

        .roi-item {
          padding: 10px;
          background: white;
          border-radius: 4px;
          border: 1px solid #dee2e6;
        }

        .roi-item .label {
          display: block;
          font-size: 12px;
          color: #6c757d;
          font-weight: 600;
        }

        .roi-item .value {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #28a745;
          margin-top: 5px;
        }

        @media (max-width: 768px) {
          .calculator-section {
            grid-template-columns: 1fr;
          }

          .roi-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Calculator;
