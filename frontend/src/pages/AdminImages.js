import React, { useState, useEffect } from 'react';
import './AdminImages.css';

const AdminImages = () => {
  const [miners, setMiners] = useState([]);
  const [selectedMiner, setSelectedMiner] = useState(null);
  const [images, setImages] = useState([]);
  const [minerImages, setMinerImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assign'); // 'assign' or 'general'

  const UPLOAD_API = 'https://miner-prices-upload.onrender.com';
  const BACKEND_API = 'https://miner-prices.onrender.com';

  useEffect(() => {
    loadMiners();
    loadGeneralImages();
  }, []);

  useEffect(() => {
    if (selectedMiner) {
      loadMinerImages();
    }
  }, [selectedMiner]);

  const loadMiners = async () => {
    try {
      const res = await fetch(`${BACKEND_API}/api/miners`);
      const data = await res.json();
      setMiners(data.miners || []);
      if (data.miners && data.miners.length > 0) {
        setSelectedMiner(data.miners[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading miners:', err);
      setLoading(false);
    }
  };

  const loadGeneralImages = async () => {
    try {
      const res = await fetch(`${UPLOAD_API}/api/list`);
      const data = await res.json();
      setImages(data.files || []);
    } catch (err) {
      console.error('Error loading general images:', err);
    }
  };

  const loadMinerImages = async () => {
    if (!selectedMiner) return;
    try {
      // Get miner with image_url field
      const res = await fetch(`${BACKEND_API}/api/miners/${selectedMiner.id}`);
      const data = await res.json();
      
      if (data.miner && data.miner.image_url) {
        setMinerImages([{ 
          id: 1, 
          url: data.miner.image_url, 
          is_primary: 1,
          filename: data.miner.image_url.split('/').pop()
        }]);
      } else {
        setMinerImages([]);
      }
    } catch (err) {
      console.error('Error loading miner images:', err);
      setMinerImages([]);
    }
  };

  const handleGeneralUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('Uploading...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${UPLOAD_API}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('✅ Image uploaded!');
        setTimeout(() => loadGeneralImages(), 500);
      } else {
        setMessage('❌ Upload failed');
      }
    } catch (err) {
      setMessage('❌ Error uploading: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const assignImageToMiner = async (filename) => {
    if (!selectedMiner) {
      setMessage('❌ No miner selected');
      return;
    }

    const imageUrl = `/uploads/${filename}`;
    
    try {
      // Assign image to miner via POST
      const res = await fetch(`${BACKEND_API}/api/miners/${selectedMiner.id}/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(`✅ Image assigned to ${selectedMiner.name}`);
        loadMinerImages();
      } else {
        setMessage(`❌ ${data.error || 'Failed to assign image'}`);
      }
    } catch (err) {
      setMessage('❌ Error assigning image: ' + err.message);
    }
  };

  const deleteGeneralImage = async (filename) => {
    if (!window.confirm(`Delete ${filename}?`)) return;

    try {
      const res = await fetch(`${UPLOAD_API}/api/delete?filename=${encodeURIComponent(filename)}`);

      if (res.ok) {
        setMessage('✅ Image deleted');
        loadGeneralImages();
      } else {
        setMessage('❌ Delete failed');
      }
    } catch (err) {
      setMessage('❌ Error deleting');
    }
  };

  const removeImageFromMiner = async () => {
    if (!selectedMiner) return;

    try {
      const res = await fetch(`${BACKEND_API}/api/miners/${selectedMiner.id}/image/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('✅ Image removed from miner');
        loadMinerImages();
      } else {
        setMessage(`❌ ${data.error || 'Failed to remove image'}`);
      }
    } catch (err) {
      setMessage('❌ Error removing image');
    }
  };

  if (loading) {
    return (
      <div className="admin-images">
        <div className="container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-images">
      <div className="container">
        <h1>📸 Image Manager</h1>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="layout">
          {/* Left Sidebar: Miners */}
          <div className="sidebar">
            <h2>Miners</h2>
            <div className="miners-list">
              {miners.map((miner) => (
                <button
                  key={miner.id}
                  className={`miner-btn ${selectedMiner?.id === miner.id ? 'active' : ''}`}
                  onClick={() => setSelectedMiner(miner)}
                >
                  {miner.name}
                  {miner.image_url && <span className="has-image">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Right Content: Upload & Images */}
          <div className="main-content">
            {selectedMiner && (
              <>
                <div className="miner-header">
                  <h2>{selectedMiner.name}</h2>
                  <p>{selectedMiner.algorithm}</p>
                </div>

                {/* Tabs */}
                <div className="tabs">
                  <button
                    className={`tab-btn ${activeTab === 'assign' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assign')}
                  >
                    📌 Current Image
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                  >
                    📤 Upload New
                  </button>
                </div>

                {/* Current Image Tab */}
                {activeTab === 'assign' && (
                  <div className="tab-content">
                    {minerImages.length > 0 ? (
                      <div className="current-image">
                        <img src={`${UPLOAD_API}${minerImages[0].url}`} alt="Miner" />
                        <button
                          className="remove-btn"
                          onClick={removeImageFromMiner}
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <p className="no-image">No image assigned yet</p>
                    )}

                    <h3>Available Images</h3>
                    <div className="images-grid">
                      {images.map((filename) => (
                        <div
                          key={filename}
                          className="image-item"
                          onClick={() => assignImageToMiner(filename)}
                        >
                          <img
                            src={`${UPLOAD_API}/uploads/${encodeURIComponent(filename)}`}
                            alt={filename}
                          />
                          <button className="assign-btn">✓ Assign</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Tab */}
                {activeTab === 'general' && (
                  <div className="tab-content">
                    <div className="upload-section">
                      <label className="upload-label">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleGeneralUpload}
                          disabled={uploading}
                        />
                        <span className="upload-btn">
                          {uploading ? '⏳ Uploading...' : '📤 Upload Image'}
                        </span>
                      </label>
                    </div>

                    <h3>All Uploaded Images ({images.length})</h3>
                    <div className="images-grid">
                      {images.map((filename) => (
                        <div key={filename} className="image-item">
                          <img
                            src={`${UPLOAD_API}/uploads/${encodeURIComponent(filename)}`}
                            alt={filename}
                          />
                          <div className="item-actions">
                            <button
                              className="action-btn assign"
                              onClick={() => assignImageToMiner(filename)}
                            >
                              Assign
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => deleteGeneralImage(filename)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminImages;
