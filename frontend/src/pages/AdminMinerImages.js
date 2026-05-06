import React, { useState, useEffect } from 'react';
import './AdminMinerImages.css';

const AdminMinerImages = () => {
  const [miners, setMiners] = useState([]);
  const [selectedMiner, setSelectedMiner] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Use the backend API
  const API_BASE = process.env.REACT_APP_API_BASE || 'https://miner-prices.onrender.com';

  useEffect(() => {
    loadMiners();
  }, []);

  useEffect(() => {
    if (selectedMiner) {
      loadMinerImages();
    }
  }, [selectedMiner]);

  const loadMiners = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/miners`);
      const data = await res.json();
      const minersList = data.miners || [];
      setMiners(minersList);
      if (minersList.length > 0) {
        setSelectedMiner(minersList[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading miners:', err);
      setMessage('❌ Failed to load miners');
      setLoading(false);
    }
  };

  const loadMinerImages = async () => {
    if (!selectedMiner) return;
    try {
      const res = await fetch(`${API_BASE}/api/images/miner/${selectedMiner.id}`);
      const data = await res.json();
      setImages(data.images || []);
    } catch (err) {
      console.error('Error loading images:', err);
      setImages([]);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedMiner) return;

    setUploading(true);
    setMessage('Uploading...');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('minerId', selectedMiner.id);

      const res = await fetch(`${API_BASE}/api/images/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('✅ Image uploaded!');
        setTimeout(() => loadMinerImages(), 500);
      } else {
        setMessage('❌ ' + (data.error || 'Upload failed'));
      }
    } catch (err) {
      setMessage('❌ Error uploading: ' + err.message);
      console.error('Error:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const setPrimary = async (imageId) => {
    try {
      const res = await fetch(`${API_BASE}/api/images/${imageId}/primary`, {
        method: 'POST'
      });

      if (res.ok) {
        setMessage('✅ Primary image updated');
        loadMinerImages();
      } else {
        setMessage('❌ Error setting primary');
      }
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/images/${imageId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setMessage('✅ Image deleted');
        loadMinerImages();
      } else {
        setMessage('❌ Delete failed');
      }
    } catch (err) {
      setMessage('❌ Error deleting: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-miner-images">
        <div className="container">
          <p>Loading miners...</p>
        </div>
      </div>
    );
  }

  if (miners.length === 0) {
    return (
      <div className="admin-miner-images">
        <div className="container">
          <p>No miners found in database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-miner-images">
      <div className="container">
        <h1>🖼️ Miner Image Manager</h1>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="layout">
          {/* Miners Sidebar */}
          <div className="miners-sidebar">
            <h2>Miners</h2>
            <div className="miners-list">
              {miners.map((miner) => (
                <button
                  key={miner.id}
                  className={`miner-btn ${selectedMiner?.id === miner.id ? 'active' : ''}`}
                  onClick={() => setSelectedMiner(miner)}
                >
                  {miner.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          {selectedMiner && (
            <div className="main-content">
              <div className="miner-header">
                <h2>{selectedMiner.name}</h2>
                <p className="miner-algo">{selectedMiner.algorithm || 'N/A'}</p>
              </div>

              {/* Upload Section */}
              <div className="upload-section">
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                  <span className="upload-btn">
                    {uploading ? '⏳ Uploading...' : '📤 Upload Image'}
                  </span>
                </label>
              </div>

              {/* Images Grid */}
              <div className="images-section">
                <h3>Images ({images.length})</h3>
                {images.length === 0 ? (
                  <p className="no-images">No images yet. Upload one to get started!</p>
                ) : (
                  <div className="images-grid">
                    {images.map((img) => (
                      <div key={img.id} className="image-card">
                        <div className="image-container">
                          <img src={img.url} alt={`Image ${img.id}`} />
                          {img.is_primary === 1 && (
                            <span className="primary-badge">⭐ Primary</span>
                          )}
                        </div>
                        <div className="image-actions">
                          {img.is_primary === 0 && (
                            <button
                              className="action-btn primary-btn"
                              onClick={() => setPrimary(img.id)}
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            className="action-btn delete-btn"
                            onClick={() => deleteImage(img.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="debug-info">
          <p>API: {API_BASE}</p>
          <p>Miner: {selectedMiner?.name || 'None'}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminMinerImages;
