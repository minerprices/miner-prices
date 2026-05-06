import React, { useState, useEffect } from 'react';
import './AdminImages.css';

const AdminImages = () => {
  const [miners, setMiners] = useState([]);
  const [selectedMiner, setSelectedMiner] = useState(null);
  const [availableImages, setAvailableImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const UPLOAD_SERVER = 'https://miner-prices-upload.onrender.com';
  const BACKEND = 'https://miner-prices.onrender.com';

  useEffect(() => {
    loadMiners();
    loadAvailableImages();
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

  const loadAvailableImages = async () => {
    try {
      const res = await fetch(`${UPLOAD_SERVER}/api/list`);
      const data = await res.json();
      setAvailableImages(data.files || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('Uploading...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${UPLOAD_SERVER}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setMessage('✅ Image uploaded!');
        loadAvailableImages();
      } else {
        setMessage('❌ Upload failed');
      }
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const assignImageToMiner = async (filename) => {
    if (!selectedMiner) {
      setMessage('❌ Select a miner first');
      return;
    }

    try {
      const imageUrl = `${UPLOAD_SERVER}/uploads/${encodeURIComponent(filename)}`;
      
      const res = await fetch(`${BACKEND}/api/miners/${selectedMiner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl })
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Assigned to ${selectedMiner.name}`);
        // Update local miner object
        const updated = miners.map(m => 
          m.id === selectedMiner.id ? { ...m, image_url: imageUrl } : m
        );
        setMiners(updated);
        setSelectedMiner({ ...selectedMiner, image_url: imageUrl });
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
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

  const deleteImage = async (filename) => {
    if (!window.confirm(`Delete ${filename}?`)) return;

    try {
      const res = await fetch(`${UPLOAD_SERVER}/api/delete?filename=${encodeURIComponent(filename)}`);
      if (res.ok) {
        setMessage('✅ Deleted');
        loadAvailableImages();
      } else {
        setMessage('❌ Delete failed');
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

                {/* Available Images */}
                <h3>Available Images ({availableImages.length})</h3>
                <div className="images-grid">
                  {availableImages.map((filename) => (
                    <div key={filename} className="image-card">
                      <img
                        src={`${UPLOAD_SERVER}/uploads/${encodeURIComponent(filename)}`}
                        alt={filename}
                        onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22150%22%3E%3Crect fill=%22%23ccc%22 width=%22150%22 height=%22150%22/%3E%3C/svg%3E'; }}
                      />
                      <div className="actions">
                        <button className="assign-btn" onClick={() => assignImageToMiner(filename)}>
                          Assign
                        </button>
                        <button className="delete-btn" onClick={() => deleteImage(filename)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
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
