import React, { useState, useEffect } from 'react';
import './AdminImages.css';

const AdminImages = () => {
  const [miners, setMiners] = useState([]);
  const [selectedMiner, setSelectedMiner] = useState(null);
  const [availableImages, setAvailableImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const BACKEND = 'https://miner-prices.onrender.com';

  useEffect(() => {
    loadMiners();
  }, []);

  const loadMiners = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/miners`);
      const data = await res.json();
      setMiners(data.miners || []);
      if (data.miners?.length) setSelectedMiner(data.miners[0]);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };



  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedMiner) return;

    setUploading(true);
    setMessage('Uploading...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${BACKEND}/api/miners/${selectedMiner.id}/upload-image`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setMessage('✅ Image uploaded!');
        loadMiners();
      } else {
        setMessage(`❌ ${data.error || 'Upload failed'}`);
      }
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };



  const removeImage = async () => {
    if (!selectedMiner) return;

    try {
      const res = await fetch(`${BACKEND}/api/miners/${selectedMiner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: null })
      });

      const data = await res.json();
      if (data.success) {
        setMessage('✅ Image removed');
        const updated = miners.map(m => 
          m.id === selectedMiner.id ? { ...m, image_url: null } : m
        );
        setMiners(updated);
        setSelectedMiner({ ...selectedMiner, image_url: null });
      }
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    }
  };



  if (loading) {
    return <div className="admin-images"><div className="container"><p>Loading...</p></div></div>;
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
          {/* Miners Sidebar */}
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
                  {miner.image_url && <span className="badge">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            {selectedMiner && (
              <>
                <h2>{selectedMiner.name}</h2>

                {/* Current Image */}
                {selectedMiner.image_url ? (
                  <div className="current-image">
                    <img src={selectedMiner.image_url} alt="Miner" />
                    <button className="remove-btn" onClick={removeImage}>Remove</button>
                  </div>
                ) : (
                  <p className="no-image">No image assigned</p>
                )}

                {/* Upload New */}
                <div className="upload-section">
                  <label className="upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={uploadImage}
                      disabled={uploading}
                    />
                    <span className="upload-btn">
                      {uploading ? '⏳ Uploading...' : '📤 Upload New Image'}
                    </span>
                  </label>
                </div>


              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminImages;
