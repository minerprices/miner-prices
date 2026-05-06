import React, { useState } from 'react';
import './Pages.css';

const Tools = () => {
  const [activeTab, setActiveTab] = useState('hashrate');
  
  // Hashrate Converter
  const [hashrate, setHashrate] = useState(100);
  const [hashUnit, setHashUnit] = useState('TH/s');
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [hashrateResult, setHashrateResult] = useState(null);

  // Energy Analyzer
  const [power, setPower] = useState(3000);
  const [hoursPerDay, setHoursPerDay] = useState(24);
  const [energyResult, setEnergyResult] = useState(null);

  // ROI Simulator
  const [minerCost, setMinerCost] = useState(1000);
  const [dailyProfit, setDailyProfit] = useState(5);
  const [roiResult, setRoiResult] = useState(null);

  // Difficulty Impact
  const [currentProfit, setCurrentProfit] = useState(10);
  const [difficultyResult, setDifficultyResult] = useState(null);

  const coins = ['BTC', 'LTC', 'ZEC', 'KAS', 'DOGE', 'ETC'];
  const hashUnits = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s'];

  const calculateHashrate = () => {
    // Simulate calculation
    const unitValues = {
      'H/s': 1,
      'KH/s': 1000,
      'MH/s': 1000000,
      'GH/s': 1000000000,
      'TH/s': 1000000000000,
      'PH/s': 1000000000000000,
    };

    const baseHashrate = hashrate * unitValues[hashUnit];
    const dailyCoins = baseHashrate / 1e12 * 0.5; // Mock calculation
    const dailyUSD = dailyCoins * 45000; // Mock BTC price

    setHashrateResult({
      daily_coins: dailyCoins.toFixed(8),
      daily_usd: dailyUSD.toFixed(2),
      monthly_usd: (dailyUSD * 30).toFixed(2),
      yearly_usd: (dailyUSD * 365).toFixed(2),
    });
  };

  const calculateEnergy = () => {
    const kw = power / 1000;
    const dailyKwh = kw * hoursPerDay;

    const regions = {
      'Iceland': 0.04,
      'Kazakhstan': 0.02,
      'China': 0.03,
      'US (Texas)': 0.05,
      'Canada': 0.06,
      'Europe': 0.12,
    };

    const costs = Object.entries(regions).map(([region, rate]) => ({
      region,
      daily: (dailyKwh * rate).toFixed(2),
      monthly: (dailyKwh * rate * 30).toFixed(2),
      yearly: (dailyKwh * rate * 365).toFixed(2),
    }));

    setEnergyResult(costs);
  };

  const calculateROI = () => {
    const scenarios = {};
    for (let decline = 5; decline <= 20; decline += 5) {
      let cumProfit = 0;
      let breakeven = 0;

      for (let year = 1; year <= 3; year++) {
        const yearlyProfit = dailyProfit * 365 * Math.pow(1 - decline / 100, year);
        cumProfit += yearlyProfit;

        if (breakeven === 0 && cumProfit >= minerCost) {
          breakeven = year;
        }
      }

      scenarios[`${decline}% decline/yr`] = {
        breakeven_years: breakeven || 5,
        total_3yr: (cumProfit - minerCost).toFixed(2),
      };
    }

    setRoiResult(scenarios);
  };

  const calculateDifficulty = () => {
    const changes = {};
    for (let i = -30; i <= 50; i += 10) {
      const factor = 1 + i / 100;
      const newProfit = currentProfit / factor;
      changes[`${i > 0 ? '+' : ''}${i}%`] = {
        daily: newProfit.toFixed(2),
        monthly: (newProfit * 30).toFixed(2),
        impact: ((newProfit - currentProfit) / currentProfit * 100).toFixed(1),
      };
    }

    setDifficultyResult(changes);
  };

  return (
    <div className="page-container">
      <h1>🔧 Mining Tools & Calculators</h1>
      <p className="subtitle">Professional-grade mining analysis tools</p>

      <div className="tools-tabs">
        <button
          className={`tab-btn ${activeTab === 'hashrate' ? 'active' : ''}`}
          onClick={() => setActiveTab('hashrate')}
        >
          ⚡ Hashrate Converter
        </button>
        <button
          className={`tab-btn ${activeTab === 'energy' ? 'active' : ''}`}
          onClick={() => setActiveTab('energy')}
        >
          💡 Energy Cost Analyzer
        </button>
        <button
          className={`tab-btn ${activeTab === 'roi' ? 'active' : ''}`}
          onClick={() => setActiveTab('roi')}
        >
          📊 ROI Simulator
        </button>
        <button
          className={`tab-btn ${activeTab === 'difficulty' ? 'active' : ''}`}
          onClick={() => setActiveTab('difficulty')}
        >
          📈 Difficulty Impact
        </button>
      </div>

      <div className="tool-content">
        {/* Hashrate Converter */}
        {activeTab === 'hashrate' && (
          <div className="tool-card">
            <h2>Hashrate to Daily Earnings Converter</h2>
            <p>Convert your mining power into estimated daily earnings</p>

            <div className="input-grid">
              <div className="input-group">
                <label>Hashrate:</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={hashrate}
                    onChange={(e) => setHashrate(parseFloat(e.target.value))}
                    placeholder="100"
                  />
                  <select value={hashUnit} onChange={(e) => setHashUnit(e.target.value)}>
                    {hashUnits.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Coin:</label>
                <select value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)}>
                  {coins.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <button onClick={calculateHashrate} className="calc-btn">Calculate</button>

            {hashrateResult && (
              <div className="results-grid">
                <div className="result-item">
                  <span className="label">Daily Earnings</span>
                  <span className="value">${hashrateResult.daily_usd}</span>
                </div>
                <div className="result-item">
                  <span className="label">Monthly</span>
                  <span className="value">${hashrateResult.monthly_usd}</span>
                </div>
                <div className="result-item">
                  <span className="label">Yearly</span>
                  <span className="value">${hashrateResult.yearly_usd}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Energy Analyzer */}
        {activeTab === 'energy' && (
          <div className="tool-card">
            <h2>Regional Electricity Cost Analyzer</h2>
            <p>Compare power costs across mining-friendly regions worldwide</p>

            <div className="input-grid">
              <div className="input-group">
                <label>Power Consumption (watts):</label>
                <input
                  type="number"
                  value={power}
                  onChange={(e) => setPower(parseFloat(e.target.value))}
                  placeholder="3000"
                />
              </div>

              <div className="input-group">
                <label>Hours Per Day:</label>
                <input
                  type="number"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                  placeholder="24"
                  min="1"
                  max="24"
                />
              </div>
            </div>

            <button onClick={calculateEnergy} className="calc-btn">Analyze</button>

            {energyResult && (
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Region</th>
                    <th>Daily Cost</th>
                    <th>Monthly Cost</th>
                    <th>Yearly Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {energyResult.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.region}</td>
                      <td>${row.daily}</td>
                      <td>${row.monthly}</td>
                      <td>${row.yearly}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ROI Simulator */}
        {activeTab === 'roi' && (
          <div className="tool-card">
            <h2>ROI Simulator - Multiple Scenarios</h2>
            <p>Test profitability under different difficulty growth rates</p>

            <div className="input-grid">
              <div className="input-group">
                <label>Miner Cost (USD):</label>
                <input
                  type="number"
                  value={minerCost}
                  onChange={(e) => setMinerCost(parseFloat(e.target.value))}
                  placeholder="1000"
                />
              </div>

              <div className="input-group">
                <label>Daily Profit (USD):</label>
                <input
                  type="number"
                  value={dailyProfit}
                  onChange={(e) => setDailyProfit(parseFloat(e.target.value))}
                  step="0.1"
                  placeholder="5"
                />
              </div>
            </div>

            <button onClick={calculateROI} className="calc-btn">Simulate</button>

            {roiResult && (
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Scenario</th>
                    <th>Break-Even (Years)</th>
                    <th>3-Year Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(roiResult).map(([scenario, data]) => (
                    <tr key={scenario}>
                      <td>{scenario}</td>
                      <td>{data.breakeven_years}</td>
                      <td>${data.total_3yr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Difficulty Impact */}
        {activeTab === 'difficulty' && (
          <div className="tool-card">
            <h2>Difficulty Impact Analysis</h2>
            <p>See how network difficulty changes affect your profitability</p>

            <div className="input-group">
              <label>Current Daily Profit (USD):</label>
              <input
                type="number"
                value={currentProfit}
                onChange={(e) => setCurrentProfit(parseFloat(e.target.value))}
                step="0.1"
                placeholder="10"
              />
            </div>

            <button onClick={calculateDifficulty} className="calc-btn">Analyze</button>

            {difficultyResult && (
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Difficulty Change</th>
                    <th>Daily Profit</th>
                    <th>Monthly Profit</th>
                    <th>% Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(difficultyResult).map(([change, data]) => (
                    <tr key={change} className={data.impact > 0 ? 'positive' : 'negative'}>
                      <td>{change}</td>
                      <td>${data.daily}</td>
                      <td>${data.monthly}</td>
                      <td>{data.impact}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .subtitle {
          color: #6c757d;
          margin-bottom: 30px;
        }

        .tools-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          flex-wrap: wrap;
          border-bottom: 2px solid #dee2e6;
          overflow-x: auto;
        }

        .tab-btn {
          padding: 12px 20px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-weight: 600;
          color: #6c757d;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: #007bff;
        }

        .tab-btn.active {
          color: #007bff;
          border-bottom-color: #007bff;
        }

        .tool-content {
          min-height: 500px;
        }

        .tool-card {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .tool-card h2 {
          margin-top: 0;
          color: #212529;
        }

        .tool-card p {
          color: #6c757d;
          margin-bottom: 20px;
        }

        .input-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-weight: 600;
          font-size: 14px;
        }

        .input-group input,
        .input-group select {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .input-with-unit {
          display: flex;
          gap: 10px;
        }

        .input-with-unit input {
          flex: 1;
        }

        .input-with-unit select {
          width: 100px;
        }

        .calc-btn {
          padding: 12px 30px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }

        .calc-btn:hover {
          background: #0056b3;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 30px;
        }

        .result-item {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 4px;
          border-left: 4px solid #28a745;
        }

        .result-item .label {
          display: block;
          font-size: 12px;
          color: #6c757d;
          font-weight: 600;
        }

        .result-item .value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #28a745;
          margin-top: 8px;
        }

        .results-table {
          width: 100%;
          margin-top: 30px;
          border-collapse: collapse;
        }

        .results-table thead {
          background: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
        }

        .results-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #495057;
        }

        .results-table td {
          padding: 12px;
          border-bottom: 1px solid #dee2e6;
        }

        .results-table tbody tr:hover {
          background: #f8f9fa;
        }

        .results-table .positive {
          color: #28a745;
        }

        .results-table .negative {
          color: #dc3545;
        }

        @media (max-width: 768px) {
          .tools-tabs {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .tool-card {
            padding: 15px;
          }

          .input-grid {
            grid-template-columns: 1fr;
          }

          .results-table {
            font-size: 12px;
          }

          .results-table th,
          .results-table td {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Tools;
