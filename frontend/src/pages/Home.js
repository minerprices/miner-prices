import React from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

const Home = () => {
  return (
    <div className="container">
      <div className="hero">
        <h1>Miner Prices ⛏️</h1>
        <p>Find the best ASIC miners and hosting locations for profitable cryptocurrency mining</p>
        
        <div className="cta-buttons">
          <Link to="/miners" className="btn btn-primary">Browse Miners</Link>
          <Link to="/locations" className="btn btn-secondary">Find Hosting</Link>
          <Link to="/vendor/register" className="btn btn-tertiary">Become a Vendor</Link>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>⛏️ ASIC Miners</h3>
          <p>Browse the latest ASIC miners with real-time profitability data from WhattoMine. Filter by algorithm and find the perfect hardware for your operation.</p>
        </div>
        
        <div className="feature-card">
          <h3>🌍 Hosting Locations</h3>
          <p>Discover verified mining hosting providers worldwide. Compare electricity costs, cooling solutions, and available power capacity.</p>
        </div>
        
        <div className="feature-card">
          <h3>💰 Profitability Calculator</h3>
          <p>Calculate monthly hosting costs at different locations. See ROI analysis for specific miners and find the best deals.</p>
        </div>
        
        <div className="feature-card">
          <h3>🔐 Verified Vendors</h3>
          <p>All hosting providers are verified by our team. Trust and transparency are core to our platform.</p>
        </div>
      </div>

      <div className="info-section">
        <h2>Getting Started</h2>
        <p>
          Whether you're a miner looking for the best hosting or a hosting provider wanting to reach customers:
        </p>
        <ul>
          <li><strong>Miners:</strong> Browse miners and locations, calculate profitability, contact verified vendors directly.</li>
          <li><strong>Vendors:</strong> Register your account, add hosting locations, and connect with mining operations.</li>
          <li><strong>Admins:</strong> Manage vendor approvals, view analytics, and ensure platform quality.</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
