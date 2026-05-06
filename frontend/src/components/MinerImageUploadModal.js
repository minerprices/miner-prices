import React, { useState, useEffect } from 'react';
import './MinerImageUploadModal.css';

const MinerImageUploadModal = ({ minerId, minerName, onClose, onImageAdded }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const res = await fetch('https://miner-prices.onrender.com/api/images/list');
      const data = await res.json();
      setImages(data.images || []);
    } catch (err) {
      console.error('Error loading images:', err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('Uploading...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('https://miner-prices.onrender.com/api/images/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Image uploaded!');
        loadGallery();
        if (onImageAdded) onImageAdded(data.url);
      } else {
        setMessage('❌ Upload failed');
      }
    } catch (err) {
      setMessage('❌ Error uploading');
      console.error('Error:', err);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (filename) => {
    if (!window.confirm('Delete image?')) return;

    try {
      const res = await fetch(`https://miner-prices.onrender.com/api/images/${filename}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setMessage('✅ Image deleted');
        loadGallery();
      }
    } catch (err) {
      setMessage('❌ Error deleting');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📸 Upload Images for {minerName}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="upload-section">
            <label className="upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              <span className="upload-btn">
                {uploading ? '⏳ Uploading...' : '📤 Choose Image'}
              </span>
            </label>
          </div>

          {message && (
            <p className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </p>
          )}

          <div className="gallery-section">
            <h3>Available Images</h3>
            {images.length === 0 ? (
              <p className="no-images">No images uploaded yet</p>
            ) : (
              <div className="images-grid">
                {images.map((img) => (
                  <div key={img.filename} className="image-item">
                    <img src={img.url} alt={img.filename} />
                    <button 
                      className="delete-btn"
                      onClick={() => deleteImage(img.filename)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinerImageUploadModal;
