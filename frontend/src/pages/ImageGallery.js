import React, { useState, useEffect } from 'react';
import './ImageGallery.css';

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const API = 'https://miner-prices-upload.onrender.com';

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const res = await fetch(`${API}/api/images/list`);
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage('❌ Could not load images');
    } finally {
      setLoading(false);
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

      const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Image uploaded!');
        loadImages();
      } else {
        setMessage('❌ ' + (data.error || 'Upload failed'));
      }
    } catch (err) {
      setMessage('❌ Error uploading');
      console.error('Error:', err);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (filename) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      const res = await fetch(`${API}/api/images/${filename}`, {
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

  if (loading) return <div className="image-gallery"><p>Loading...</p></div>;

  return (
    <div className="image-gallery">
      <div className="gallery-container">
        <h1>📸 Miner Images Gallery</h1>

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

        {message && (
          <p className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}

        <div className="gallery-section">
          <h2>All Images ({images.length})</h2>
          {images.length === 0 ? (
            <p className="no-images">No images yet. Upload one to get started!</p>
          ) : (
            <div className="gallery-grid">
              {images.map((img) => (
                <div key={img.filename} className="gallery-card">
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
  );
};

export default ImageGallery;
