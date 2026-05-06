import React, { useState, useEffect } from 'react';
import './AdminImages.css';

const AdminImages = () => {
  const [miners, setMiners] = useState([]);
  const [selectedMiner, setSelectedMiner] = useState(null);
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

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedMiner) {
      setMessage('❌ Select miner and file');
      return;
    }

    setUploading(true);
    setMessage('Uploading to image server...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Upload to backend (which uploads to external ImgBB)
      const uploadRes = await fetch(`${BACKEND}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadRes.json();

      if (uploadData.success) {
        setMessage('✅ Saving image URL to miner...');

        // Now save the URL to the miner
        const saveRes = await fetch(`${BACKEND}/api/miners/${selectedMiner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: uploadData.url })
        });

        const saveData = await saveRes.json();

        if (saveData.success) {
          setMessage('✅ Image assigned!');
          loadMiners();
        } else {
          setMessage(`❌ Save failed: ${saveData.error}`);
        }
      } else {
        setMessage(`❌ Upload failed: ${uploadData.error}`);
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

      if (res.ok) {
        setMessage('✅ Image removed');
        loadMiners();
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

          <div className="main-content">
            {selectedMiner && (
              <>
                <h2>{selectedMiner.name}</h2>

                {selectedMiner.image_url ? (
                  <div className="current-image">
                    <img src={selectedMiner.image_url} alt="Miner" />
                    <button className="remove-btn" onClick={removeImage}>Remove Image</button>
                  </div>
                ) : (
                  <p className="no-image">No image assigned</p>
                )}

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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminImages;
