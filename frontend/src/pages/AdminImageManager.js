import React, { useState, useEffect } from 'react';
import './AdminImageManager.css';

const AdminImageManager = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Use the working upload server (works on both localhost and production)
  const UPLOAD_API = process.env.REACT_APP_UPLOAD_API || 'https://miner-prices-upload.onrender.com';

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      console.log('Fetching images from:', `${UPLOAD_API}/api/list`);
      const response = await fetch(`${UPLOAD_API}/api/list`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Images loaded:', data);
      setImages(data.files || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading images:', error);
      setMessage('❌ Failed to load images: ' + error.message);
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Starting upload for file:', file.name);
    setUploading(true);
    setMessage('Uploading...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      console.log('Posting to:', `${UPLOAD_API}/api/upload`);
      const response = await fetch(`${UPLOAD_API}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (response.ok && data.success) {
        setMessage('✅ Image uploaded successfully: ' + data.filename);
        setTimeout(() => loadImages(), 500);
      } else {
        setMessage(`❌ ${data.error || 'Upload failed'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('❌ Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const deleteImage = async (filename) => {
    if (!window.confirm(`Delete ${filename}?`)) return;

    try {
      console.log('Deleting:', filename);
      const response = await fetch(`${UPLOAD_API}/api/delete?filename=${encodeURIComponent(filename)}`, {
        method: 'GET'
      });

      const data = await response.json();
      console.log('Delete response:', data);

      if (response.ok && data.success) {
        setMessage('✅ Image deleted');
        loadImages();
      } else {
        setMessage('❌ Delete failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('❌ Error deleting image: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-image-manager">
        <div className="container">
          <p>Loading images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-image-manager">
      <div className="container">
        <h1>📸 Miner Image Manager</h1>
        <p className="subtitle">Upload and manage mining equipment images</p>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="upload-section">
          <label className="upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <span className="upload-button">
              {uploading ? '⏳ Uploading...' : '📤 Upload Image'}
            </span>
          </label>
          <p className="upload-hint">Select an image file to upload</p>
        </div>

        <div className="gallery-section">
          <h2>Image Gallery</h2>
          {images.length === 0 ? (
            <p className="no-images">No images uploaded yet. Upload one to get started!</p>
          ) : (
            <div className="images-grid">
              {images.map((filename) => (
                <div key={filename} className="image-card">
                  <div className="image-container">
                    <img
                      src={`${UPLOAD_API}/uploads/${encodeURIComponent(filename)}`}
                      alt={filename}
                      onError={(e) => {
                        e.target.src =
                          'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%22100%22 y=%22100%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23999%22 font-size=%2216%22%3EError%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <div className="image-info">
                    <p className="filename" title={filename}>
                      {filename}
                    </p>
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => deleteImage(filename)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="gallery-info">
            {images.length} image{images.length !== 1 ? 's' : ''} in gallery
          </p>
        </div>

        <div className="debug-info">
          <p>Upload API: {UPLOAD_API}</p>
          <p>Endpoint: POST {UPLOAD_API}/api/upload</p>
        </div>
      </div>
    </div>
  );
};

export default AdminImageManager;
