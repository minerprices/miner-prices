import React, { useState, useEffect } from 'react';
import './AdminImageManager.css';

const AdminImageManager = () => {
  const [miners, setMiners] = useState([]);
  const [selectedMiner, setSelectedMiner] = useState(null);
  const [minerImages, setMinerImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageList, setImageList] = useState([]);
  const [showImageList, setShowImageList] = useState(false);

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

  const findImages = async () => {
    if (!selectedMiner) return;

    setUploading(true);
    setMessage('');

    try {
      const response = await fetch(`https://miner-prices.onrender.com/api/images/find/${selectedMiner.id}`);
      const data = await response.json();

      if (response.ok) {
        setImageList(data.images || []);
        setShowImageList(true);
        setMessage('✅ 5 images found - click to select one');
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to find images');
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  const selectImage = async (imageUrl) => {
    if (!selectedMiner) return;

    setUploading(true);
    setMessage('');

    try {
      const response = await fetch('https://miner-prices.onrender.com/api/images/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          minerId: selectedMiner.id,
          imageUrl: imageUrl
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Image selected and saved!');
        setShowImageList(false);
        setImageList([]);
        loadMinerImages(selectedMiner.id);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to select image');
      console.error('Error:', error);
    } finally {
      setUploading(false);
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
                  <h3>Add Image</h3>
                  
                  {/* Two Options */}
                  <div className="upload-tabs">
                    <button
                      className={`upload-tab ${!showImageList ? 'active' : ''}`}
                      onClick={() => setShowImageList(false)}
                    >
                      📤 Upload File
                    </button>
                    <button
                      className={`upload-tab ${showImageList ? 'active' : ''}`}
                      onClick={findImages}
                      disabled={uploading || !selectedMiner}
                    >
                      {uploading ? '⏳ Loading...' : '🔍 Find Image'}
                    </button>
                  </div>

                  {!showImageList ? (
                    <>
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
                    </>
                  ) : (
                    <div className="image-picker">
                      <p className="picker-info">
                        Select one of 5 images for {selectedMiner?.name}
                      </p>
                      <div className="image-grid-small">
                        {imageList.map((img, idx) => (
                          <div
                            key={idx}
                            className="image-option"
                            onClick={() => selectImage(img.url)}
                          >
                            <div className="image-preview-small">
                              <img src={img.url} alt={`Option ${idx + 1}`} onError={(e) => e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f0f0f0" width="100" height="100"/><text x="50" y="50" dominant-baseline="middle" text-anchor="middle" fill="%23999">Image {idx}</text></svg>'} />
                            </div>
                            <button className="btn-select">Select #{idx + 1}</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
