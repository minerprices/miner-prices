import React, { useState, useEffect } from 'react';
import { minersAPI } from '../api';
import './Pages.css';

const Miners = () => {
  const [miners, setMiners] = useState([]);
  const [algorithms, setAlgorithms] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await minersAPI.getAll(selectedAlgorithm, search);
        setMiners(response.data.miners);
      } catch (err) {
        setError('Failed to fetch miners');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedAlgorithm, search]);

  useEffect(() => {
    const loadAlgorithms = async () => {
      try {
        const response = await minersAPI.getAlgorithms();
        setAlgorithms(response.data.algorithms || []);
      } catch (err) {
        console.error('Failed to fetch algorithms', err);
      }
    };
    loadAlgorithms();
  }, []);

  const fetchMiners = async () => {
    try {
      setLoading(true);
      const response = await minersAPI.getAll(selectedAlgorithm, search);
      setMiners(response.data.miners);
    } catch (err) {
      setError('Failed to fetch miners');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlgorithms = async () => {
    try {
      const response = await minersAPI.getAlgorithms();
      setAlgorithms(response.data.algorithms);
    } catch (err) {
      console.error('Failed to fetch algorithms');
    }
  };

  return (
    <div className="container">
      <h1>ASIC Miners</h1>
      <p>Browse the latest ASIC miners with profitability data from WhattoMine</p>

      <div className="filters">
        <div className="filters-row">
          <div className="form-group">
            <label>Algorithm</label>
            <select value={selectedAlgorithm} onChange={(e) => setSelectedAlgorithm(e.target.value)}>
              <option value="">All Algorithms</option>
              {algorithms.map((algo) => (
                <option key={algo} value={algo}>
                  {algo}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Loading miners...</div>
      ) : miners.length === 0 ? (
        <div className="loading">No miners found</div>
      ) : (
        <div className="miners-grid">
          {miners.map((miner) => (
            <div key={miner.id} className="miner-card">
              {miner.image_url && (
                <img 
                  src={miner.image_url} 
                  alt={miner.name}
                  style={{ maxWidth: '100%', marginBottom: '15px', borderRadius: '4px' }}
                />
              )}
              
              <h3>{miner.name}</h3>
              
              <div className="miner-specs">
                {miner.algorithm && (
                  <div className="spec">
                    <span className="spec-label">Algorithm:</span>
                    <span className="spec-value">{miner.algorithm}</span>
                  </div>
                )}
                
                {miner.power_consumption && (
                  <div className="spec">
                    <span className="spec-label">Power:</span>
                    <span className="spec-value">{miner.power_consumption}W</span>
                  </div>
                )}
                
                {miner.manufacturer && (
                  <div className="spec">
                    <span className="spec-label">Maker:</span>
                    <span className="spec-value">{miner.manufacturer}</span>
                  </div>
                )}
                
                {miner.price && (
                  <div className="spec">
                    <span className="spec-label">Price:</span>
                    <span className="spec-value price">${miner.price}</span>
                  </div>
                )}
              </div>
              
              {miner.description && (
                <p style={{ fontSize: '14px', color: '#666' }}>{miner.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Miners;
