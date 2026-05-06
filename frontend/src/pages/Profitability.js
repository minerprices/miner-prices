import React, { useState, useEffect } from 'react';
import { profitabilityAPI } from '../api';
import './Pages.css';

const Profitability = () => {
  const [rankings, setRankings] = useState([]);
  const [algorithm, setAlgorithm] = useState('');
  const [algorithms, setAlgorithms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [electricityCost, setElectricityCost] = useState(0.08);

  useEffect(() => {
    loadRankings();
  }, [algorithm, electricityCost]);

  useEffect(() => {
    loadAlgorithms();
  }, []);

  const loadRankings = async () => {
    try {
      setLoading(true);
      const params = { electricity_cost: electricityCost };
      if (algorithm) params.algorithm = algorithm;
      
      const response = await profitabilityAPI.getRankings(params);
      setRankings(response.data.rankings || []);
    } catch (err) {
      console.error('Error loading rankings:', err);
      setError('Failed to load profitability data');
    } finally {
      setLoading(false);
    }
  };

  const loadAlgorithms = async () => {
    try {
      // Get unique algorithms from rankings
      const response = await profitabilityAPI.getRankings();
      const algos = [...new Set(response.data.rankings.map(r => r.algorithm))];
      setAlgorithms(algos);
    } catch (err) {
      console.error('Error loading algorithms:', err);
    }
  };

  return (
    <div className="page-container">
      <h1>⛏️ Mining Profitability Rankings</h1>
      
      <div className="filters-card">
        <div className="filter-group">
          <label>Algorithm:</label>
          <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
            <option value="">All Algorithms</option>
            {algorithms.map(algo => (
              <option key={algo} value={algo}>{algo}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Electricity Cost ($/kWh):</label>
          <input 
            type="number" 
            min="0.01" 
            step="0.01" 
            value={electricityCost}
            onChange={(e) => setElectricityCost(parseFloat(e.target.value))}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading profitability data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : rankings.length === 0 ? (
        <div className="no-data">No profitability data available</div>
      ) : (
        <div className="rankings-container">
          <table className="rankings-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Miner</th>
                <th>Algorithm</th>
                <th>Best Coin</th>
                <th>Daily Profit</th>
                <th>Monthly Profit</th>
                <th>Power (W)</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((rank, idx) => (
                <tr key={rank.miner_id}>
                  <td className="rank-num">#{idx + 1}</td>
                  <td className="miner-name">{rank.miner_name}</td>
                  <td>{rank.algorithm}</td>
                  <td>
                    <span className="coin-badge">{rank.best_coin}</span>
                    ${rank.coin_price.toFixed(2)}
                  </td>
                  <td className="profit-cell">
                    <span className="profit-amount">${rank.daily_profit.toFixed(2)}</span>
                  </td>
                  <td className="profit-cell">
                    ${(rank.daily_profit * 30).toFixed(2)}
                  </td>
                  <td>{rank.power_consumption}W</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .filters-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-group label {
          font-weight: 600;
          font-size: 14px;
        }

        .filter-group select,
        .filter-group input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          width: 200px;
        }

        .rankings-container {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .rankings-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .rankings-table thead {
          background: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
        }

        .rankings-table th {
          padding: 16px;
          text-align: left;
          font-weight: 600;
          color: #495057;
        }

        .rankings-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #dee2e6;
        }

        .rankings-table tbody tr:hover {
          background: #f8f9fa;
        }

        .rank-num {
          font-weight: 700;
          color: #007bff;
          font-size: 16px;
        }

        .miner-name {
          font-weight: 600;
          color: #212529;
        }

        .coin-badge {
          background: #ffc107;
          color: #000;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
          margin-right: 8px;
        }

        .profit-cell {
          text-align: right;
          font-weight: 600;
        }

        .profit-amount {
          color: #28a745;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .filters-card {
            flex-direction: column;
          }

          .filter-group select,
          .filter-group input {
            width: 100%;
          }

          .rankings-table {
            font-size: 12px;
          }

          .rankings-table th,
          .rankings-table td {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Profitability;
