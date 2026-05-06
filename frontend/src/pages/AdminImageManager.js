import React, { useState, useEffect } from 'react';
import './AdminImageManager.css';

const AdminImageManager = () => {
  const [miners, setMiners] = useState([]);
  const [selectedMiner, setSelectedMiner] = useState(null);
  const [minerImages, setMinerImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMiners();
  }, []);

  useEffect(() => {
    if (selectedMiner) {
      loadMinerImages(selectedMiner.id);
    }
  }, [selectedMiner]);

  const loadMiners = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://miner-prices.onrender.com/api/miners');
      const data = await response.json();
      setMiners(data.miners || []);
      if (data.miners?.length > 0) {
        setSelectedMiner(data.miners[0]);
      }
    } catch (error) {
      setMessage('❌ Failed to load miners');
    } finally {
      setLoading(false);
    }
  };

  const loadMinerImages = async (minerId) => {
    try {
      const response = await fetch(`https://miner-prices.onrender.com/api/images/miner/${minerId}`);
      const data = await response.json();
      setMinerImages(data.images || []);
    } catch (error) {
      console.error('Error loading images:', error);
      setMinerImages([]);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedMiner) return;

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('minerId', selectedMiner.id);

      const response = await fetch('https://miner-prices.onrender.com/api/images/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Image uploaded successfully');
        loadMinerImages(selectedMiner.id);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Upload failed');
      console.error('Error:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const setAsPrimary = async (imageId) => {
    try {
      const response = await fetch(`https://miner-prices.onrender.com/api/images/${imageId}/primary`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMessage('✅ Primary image updated');
        loadMinerImages(selectedMiner.id);
      } else {
        setMessage('❌ Failed to update');
      }
    } catch (error) {
      setMessage('❌ Error updating image');
    }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      const response = await fetch(`https://miner-prices.onrender.com/api/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMessage('✅ Image deleted');
        loadMinerImages(selectedMiner.id);
      } else {
        setMessage('❌ Failed to delete');
      }
    } catch (error) {
      setMessage('❌ Error deleting image');
    }
  };

  return (
    <div className="image-manager-container">
      <h1>📸 Miner Image Manager</h1>
      <p className="subtitle">Upload and manage multiple images per miner</p>

      {loading ? (
        <div className="loading">Loading miners...</div>
      ) : (
        <div className="manager-layout">
          {/* Left: Miner List */}
          <div className="miner-list-panel">
            <h3>Miners</h3>
            <div className="miner-list">
              {miners.map(miner => (
                <button
                  key={miner.id}
                  className={`miner-item ${selectedMiner?.id === miner.id ? 'active' : ''}`}
                  onClick={() => setSelectedMiner(miner)}
                >
                  {miner.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Image Management */}
          <div className="image-management-panel">
            {selectedMiner ? (
              <>
                <h2>{selectedMiner.name}</h2>

                {message && (
                  <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                    {message}
                  </div>
                )}

                {/* Upload Section */}
                <div className="upload-section">
                  <h3>Upload New Image</h3>
                  <label className="upload-input">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <span className="upload-btn">
                      {uploading ? '⏳ Uploading...' : '📤 Choose Image'}
                    </span>
                  </label>
                  <p className="upload-hint">
                    Max 5MB • JPEG, PNG, or WebP
                  </p>
                </div>

                {/* Images Gallery */}
                <div className="images-section">
                  <h3>Images ({minerImages.length})</h3>
                  {minerImages.length === 0 ? (
                    <p className="no-images">No images yet. Upload one above.</p>
                  ) : (
                    <div className="images-grid">
                      {minerImages.map(image => (
                        <div key={image.id} className="image-card">
                          <div className="image-preview">
                            <img src={image.url} alt="Miner" />
                            {image.is_primary === 1 && (
                              <div className="primary-badge">Primary</div>
                            )}
                          </div>
                          <div className="image-actions">
                            {image.is_primary === 0 && (
                              <button
                                className="btn btn-small btn-primary"
                                onClick={() => setAsPrimary(image.id)}
                              >
                                Set as Primary
                              </button>
                            )}
                            <button
                              className="btn btn-small btn-danger"
                              onClick={() => deleteImage(image.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="no-selection">Select a miner to manage images</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminImageManager;
