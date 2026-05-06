import React, { useState, useEffect } from 'react';
import './ImageUploader.css';

const ImageUploader = ({ minerId, minerName, onImageAdded }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, [minerId]);

  const loadImages = async () => {
    try {
      const response = await fetch(`https://miner-prices.onrender.com/api/images/miner/${minerId}`);
      const data = await response.json();
      setImages(data.images || []);
    } catch (err) {
      console.error('Error loading images:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('minerId', minerId);

      const response = await fetch('https://miner-prices.onrender.com/api/images/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Image uploaded!');
        loadImages();
        if (onImageAdded) onImageAdded(data.url);
      } else {
        setMessage('❌ Upload failed');
      }
    } catch (err) {
      setMessage('❌ Error uploading');
      console.error('Error:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const setPrimary = async (imageId) => {
    try {
      const response = await fetch(`https://miner-prices.onrender.com/api/images/${imageId}/primary`, {
        method: 'POST'
      });

      if (response.ok) {
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
      const response = await fetch(`https://miner-prices.onrender.com/api/images/${imageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('✅ Image deleted');
        loadImages();
      }
    } catch (err) {
      setMessage('❌ Error deleting');
    }
  };

  return (
    <div className="image-uploader">
      <h3>📸 {minerName} Images</h3>

      <div className="upload-box">
        <label className="upload-label">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleUpload}
            disabled={uploading}
          />
          <span className="upload-btn">
            {uploading ? '⏳ Uploading...' : '📤 Choose Image'}
          </span>
        </label>
      </div>

      {message && <p className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</p>}

      {loading ? (
        <p className="loading">Loading images...</p>
      ) : images.length === 0 ? (
        <p className="no-images">No images yet</p>
      ) : (
        <div className="images-list">
          {images.map(img => (
            <div key={img.id} className="image-item">
              <img src={img.url} alt="Miner" className="thumbnail" />
              <div className="image-actions">
                {img.is_primary === 0 && (
                  <button onClick={() => setPrimary(img.id)} className="btn-small">Set Primary</button>
                )}
                {img.is_primary === 1 && <span className="badge">Primary</span>}
                <button onClick={() => deleteImage(img.id)} className="btn-small btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
