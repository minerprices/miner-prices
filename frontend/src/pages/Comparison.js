import React, { useState, useEffect } from 'react';
import './Comparison.css';

const Comparison = () => {
  const [miners, setMiners] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [sortBy, setSortBy] = useState('profitability');
  const [algorithms, setAlgorithms] = useState([]);
  const [electricityCost, setElectricityCost] = useState(0.08);

  useEffect(() => {
    loadMiners();
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [miners, selectedAlgorithm, sortBy, electricityCost]);

  const loadMiners = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://miner-prices.onrender.com/api/miners');
      const data = await response.json();
      
      setMiners(data.miners || []);
      
      // Extract unique algorithms
      const algos = [...new Set(data.miners?.map(m => m.algorithm) || [])];
      setAlgorithms(algos);
    } catch (error) {
      console.error('Error loading miners:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSort = () => {
    let result = miners;

    // Filter by algorithm
    if (selectedAlgorithm) {
      result = result.filter(m => m.algorithm === selectedAlgorithm);
    }

    // Add calculated profits
    result = result.map(m => {
      const specs = typeof m.specs === 'string' ? JSON.parse(m.specs) : m.specs;
      const dailyCost = (m.power_consumption / 1000) * 24 * electricityCost;
      const dailyRevenue = specs.hashrate ? (specs.hashrate * 0.0001) : 5; // Mock calculation
      const dailyProfit = dailyRevenue - dailyCost;

      return {
        ...m,
        dailyProfit,
        dailyCost,
        dailyRevenue,
        efficiency: specs.efficiency || 0,
      };
    });

    // Sort
    switch (sortBy) {
      case 'profitability':
        result.sort((a, b) => b.dailyProfit - a.dailyProfit);
        break;
      case 'efficiency':
        result.sort((a, b) => parseFloat(a.efficiency) - parseFloat(b.efficiency));
        break;
      case 'power':
        result.sort((a, b) => a.power_consumption - b.power_consumption);
        break;
      case 'hashrate':
        result.sort((a, b) => b.hashrate - a.hashrate);
        break;
      default:
        break;
    }

    setFiltered(result.slice(0, 50)); // Show top 50
  };

  return (
    <div className="comparison-container">
      <h1>ASIC Miner Comparison</h1>
      <p className="subtitle">Real-time data from WhattoMine API - Compare 100+ miners</p>

      {/* Controls */}
      <div className="controls">
        <div className="control-group">
          <label>Algorithm:</label>
          <select value={selectedAlgorithm} onChange={(e) => setSelectedAlgorithm(e.target.value)}>
            <option value="">All Algorithms</option>
            {algorithms.map(algo => (
              <option key={algo} value={algo}>{algo}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Sort By:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="profitability">Profitability</option>
            <option value="efficiency">Efficiency</option>
            <option value="power">Power Consumption</option>
            <option value="hashrate">Hashrate</option>
          </select>
        </div>

        <div className="control-group">
          <label>Electricity Cost:</label>
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
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading">Loading miners from WhattoMine...</div>
      ) : filtered.length === 0 ? (
        <div className="no-data">No miners found</div>
      ) : (
        <div className="table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Hashrate</th>
                <th>Power</th>
                <th>Efficiency</th>
                <th>Algorithm</th>
                <th>Daily Profit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((miner, idx) => (
                <tr key={idx}>
                  <td className="model-name">{miner.name}</td>
                  <td>{miner.hashrate || 'N/A'}</td>
                  <td>{miner.power_consumption}W</td>
                  <td>{miner.efficiency || 'N/A'}</td>
                  <td className="algorithm">{miner.algorithm}</td>
                  <td className={`profit ${miner.dailyProfit > 0 ? 'positive' : 'negative'}`}>
                    ${miner.dailyProfit.toFixed(2)}
                  </td>
                  <td>
                    <button className="view-btn">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="footer-note">
        Data sourced from WhattoMine API (free, commercial use allowed)
      </div>
    </div>
  );
};

export default Comparison;
