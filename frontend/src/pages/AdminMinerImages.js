import React, { useState, useEffect } from 'react';
import './AdminMinerImages.css';

const AdminMinerImages = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Use the standalone upload server that's working
  const API = 'https://miner-prices-upload.onrender.com';

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      // Get images from upload server
      const res = await fetch(`${API}/api/list`);
      const data = await res.json();
      setImages(data.files || []);
    } catch (err) {
      console.error('Error loading images:', err);
      setImages([]);
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
    if (!window.confirm(`Delete ${filename}?`)) return;

    try {
      const res = await fetch(`${API}/api/delete?filename=${encodeURIComponent(filename)}`);

      if (res.ok) {
        setMessage('✅ Image deleted');
        loadImages();
      } else {
        setMessage('❌ Delete failed');
      }
    } catch (err) {
      setMessage('❌ Error deleting');
      console.error('Error:', err);
    }
  };

  if (loading) return <div className="admin-miner-images"><p>Loading...</p></div>;

  return (
    <div className="admin-miner-images">
      <h1>🖼️ Image Gallery</h1>

      <div className="admin-container">
        {message && (
          <p className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </p>
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

        <div className="gallery">
          <h2>Gallery ({images.length} images)</h2>
          {images.length === 0 ? (
            <p className="no-images">No images yet. Upload one to get started!</p>
          ) : (
            <div className="images-grid">
              {images.map((filename) => (
                <div key={filename} className="image-card">
                  <div className="image-wrapper">
                    <img 
                      src={`${API}/uploads/${encodeURIComponent(filename)}`} 
                      alt={filename}
                      onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22150%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22150%22 height=%22150%22/%3E%3Ctext x=%2275%22 y=%2275%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23999%22%3EImage%3C/text%3E%3C/svg%3E'"
                    />
                  </div>
                  <div className="image-info">
                    <p className="filename">{filename}</p>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => deleteImage(filename)}
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

export default AdminMinerImages;
