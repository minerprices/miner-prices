import React, { useState, useEffect } from 'react';
import './MinerImageUploader.css';

const MinerImageUploader = ({ minerId, minerName, onImageAdded }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadImages();
  }, [minerId]);

  const loadImages = async () => {
    try {
      const res = await fetch(`https://miner-prices.onrender.com/api/miners/${minerId}/images`);
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
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

      const res = await fetch(`https://miner-prices.onrender.com/api/miners/${minerId}/images/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Image uploaded!');
        loadImages();
        if (onImageAdded) onImageAdded(data.url);
        setTimeout(() => setShowForm(false), 1500);
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

  const setPrimary = async (imageId) => {
    try {
      const res = await fetch(`https://miner-prices.onrender.com/api/miners/${minerId}/images/${imageId}/primary`, {
        method: 'POST'
      });

      if (res.ok) {
        setMessage('✅ Primary image updated');
        loadImages();
      }
    } catch (err) {
      setMessage('❌ Error updating');
    }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm('Delete image?')) return;

    try {
      const res = await fetch(`https://miner-prices.onrender.com/api/miners/${minerId}/images/${imageId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setMessage('✅ Image deleted');
        loadImages();
      } else {
        setMessage('❌ Delete failed');
      }
    } catch (err) {
      setMessage('❌ Error deleting');
    }
  };

  return (
    <div className="miner-image-uploader">
      <div className="uploader-header">
        <h3>📸 Images for {minerName}</h3>
        <button className="toggle-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕' : '➕'}
        </button>
      </div>

      {showForm && (
        <div className="upload-form">
          <label className="file-input">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
            />
            <span className="file-btn">
              {uploading ? '⏳ Uploading...' : '📤 Choose Image'}
            </span>
          </label>
          {message && (
            <p className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </p>
          )}
        </div>
      )}

      {images.length === 0 ? (
        <p className="no-images">No images yet</p>
      ) : (
        <div className="images-gallery">
          {images.map((img) => (
            <div key={img.id} className="gallery-item">
              <div className="img-wrapper">
                <img src={img.url} alt={`Miner ${img.id}`} />
                {img.is_primary === 1 && <span className="primary-badge">Primary</span>}
              </div>
              <div className="img-actions">
                {img.is_primary === 0 && (
                  <button className="action-btn" onClick={() => setPrimary(img.id)}>Set Primary</button>
                )}
                <button className="action-btn delete-btn" onClick={() => deleteImage(img.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MinerImageUploader;
