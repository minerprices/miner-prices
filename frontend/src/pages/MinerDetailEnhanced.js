import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './MinerDetailEnhanced.css';

const MinerDetailEnhanced = () => {
  const { id } = useParams();
  const [miner, setMiner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadMinerDetails();
  }, [id]);

  const loadMinerDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://miner-prices.onrender.com/api/miners/${id}/full`);
      const data = await response.json();
      setMiner(data.miner);
    } catch (error) {
      console.error('Error loading miner:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading miner details...</div>;
  }

  if (!miner) {
    return <div className="error">Miner not found</div>;
  }

  return (
    <div className="miner-detail-enhanced">
      {/* Header */}
      <div className="detail-header">
        <div className="header-content">
          <h1>{miner.name}</h1>
          <div className="header-badges">
            <span className="badge manufacturer">{miner.manufacturer}</span>
            <span className="badge cooling">{miner.cooling_type}</span>
            <span className="badge algorithm">{miner.algorithm}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="detail-container">
        {/* Left: Image Gallery */}
        <div className="detail-left">
          <div className="image-gallery">
            <div className="main-image">
              {miner.image_url ? (
                <img src={miner.image_url} alt={miner.name} />
              ) : (
                <div className="placeholder">No image available</div>
              )}
            </div>
          </div>

          {/* Specs Grid */}
          <div className="specs-grid">
            <div className="spec-item">
              <span className="label">Hashrate</span>
              <span className="value">{miner.specs?.hashrate ? `${(miner.specs.hashrate / 1e12).toFixed(2)} PH/s` : 'N/A'}</span>
            </div>
            <div className="spec-item">
              <span className="label">Power</span>
              <span className="value">{miner.power_consumption ? `${miner.power_consumption}W` : 'N/A'}</span>
            </div>
            <div className="spec-item">
              <span className="label">Efficiency</span>
              <span className="value">{miner.specs?.efficiency ? `${miner.specs.efficiency} J/Th` : 'N/A'}</span>
            </div>
            <div className="spec-item">
              <span className="label">Algorithm</span>
              <span className="value">{miner.algorithm}</span>
            </div>
          </div>
        </div>

        {/* Right: Tabs Content */}
        <div className="detail-right">
          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab ${activeTab === 'tutorial' ? 'active' : ''}`}
              onClick={() => setActiveTab('tutorial')}
            >
              Tutorial
            </button>
            <button 
              className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              Resources
            </button>
            <button 
              className={`tab ${activeTab === 'apps' ? 'active' : ''}`}
              onClick={() => setActiveTab('apps')}
            >
              Apps
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="overview-content">
                <h3>Miner Information</h3>
                <div className="info-group">
                  <div className="info-row">
                    <span className="label">Manufacturer:</span>
                    <span className="value">{miner.manufacturer}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Algorithm:</span>
                    <span className="value">{miner.algorithm}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Cooling Type:</span>
                    <span className="value">
                      {miner.cooling_type === 'Air' && '🌬️ Air Cooled'}
                      {miner.cooling_type === 'Hydro' && '💧 Hydro Cooled'}
                      {miner.cooling_type === 'Immersion' && '🌊 Immersion Cooled'}
                      {miner.cooling_type === 'Unknown' && 'Unknown'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Power Consumption:</span>
                    <span className="value">{miner.power_consumption}W</span>
                  </div>
                </div>

                <h3>Performance Specs</h3>
                <div className="specs-detail">
                  <div className="spec-detail-item">
                    <span className="spec-label">Hashrate</span>
                    <span className="spec-value">{miner.specs?.hashrate ? `${(miner.specs.hashrate / 1e12).toFixed(2)} PH/s` : 'N/A'}</span>
                  </div>
                  <div className="spec-detail-item">
                    <span className="spec-label">Efficiency</span>
                    <span className="spec-value">{miner.specs?.efficiency ? `${miner.specs.efficiency} J/Th` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tutorial Tab */}
            {activeTab === 'tutorial' && (
              <div className="tutorial-content">
                {miner.tutorial_video_id ? (
                  <div className="video-embed">
                    <h3>Setup Tutorial Video</h3>
                    <p className="video-source">From OneMiriers Channel</p>
                    <div className="youtube-embed">
                      <iframe
                        width="100%"
                        height="315"
                        src={`https://www.youtube.com/embed/${miner.tutorial_video_id}`}
                        title="Miner Setup Tutorial"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                ) : (
                  <p className="no-data">No tutorial video available</p>
                )}
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="resources-content">
                <h3>Download Resources</h3>
                <div className="resource-list">
                  {miner.tutorial_pdf_url && (
                    <a href={miner.tutorial_pdf_url} target="_blank" rel="noopener noreferrer" className="resource-item">
                      <span className="icon">📄</span>
                      <div className="resource-info">
                        <span className="resource-name">Setup Guide (PDF)</span>
                        <span className="resource-desc">Download comprehensive setup guide</span>
                      </div>
                      <span className="arrow">→</span>
                    </a>
                  )}
                  {miner.firmware_url && (
                    <a href={miner.firmware_url} target="_blank" rel="noopener noreferrer" className="resource-item">
                      <span className="icon">⚙️</span>
                      <div className="resource-info">
                        <span className="resource-name">Firmware</span>
                        <span className="resource-desc">Latest firmware binary</span>
                      </div>
                      <span className="arrow">→</span>
                    </a>
                  )}
                  {!miner.tutorial_pdf_url && !miner.firmware_url && (
                    <p className="no-data">No resources available for this miner yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Apps Tab */}
            {activeTab === 'apps' && (
              <div className="apps-content">
                <h3>Control Software & Tools</h3>
                {miner.apps && miner.apps.length > 0 ? (
                  <div className="apps-list">
                    {miner.apps.map((app, idx) => (
                      <a
                        key={idx}
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="app-item"
                      >
                        <span className="app-icon">📱</span>
                        <div className="app-details">
                          <span className="app-name">{app.name}</span>
                          <span className="app-desc">{app.description}</span>
                        </div>
                        <span className="arrow">→</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No apps listed for this miner</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinerDetailEnhanced;
