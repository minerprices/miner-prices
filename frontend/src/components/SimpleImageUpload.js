import React, { useState, useEffect } from 'react';
import './SimpleImageUpload.css';

const SimpleImageUpload = () => {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const res = await fetch('https://miner-prices.onrender.com/api/images/list');
      const data = await res.json();
      setImages(data.images || []);
    } catch (err) {
      console.error('Error loading images:', err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Choose a file first');
      return;
    }

    setUploading(true);
    setMessage('Uploading...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('https://miner-prices.onrender.com/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Image uploaded!');
        setFile(null);
        loadImages();
      } else {
        setMessage('❌ Upload failed: ' + data.error);
      }
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
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
        setMessage('✅ Deleted');
        loadImages();
      } else {
        setMessage('❌ Delete failed');
      }
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    }
  };

  return (
    <div className="simple-upload">
      <h2>📸 Image Upload</h2>

      <form onSubmit={handleUpload} className="upload-form">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {message && <p className={`msg ${message.includes('✅') ? 'ok' : 'err'}`}>{message}</p>}

      <div className="gallery">
        <h3>Images ({images.length})</h3>
        {images.length === 0 ? (
          <p>No images yet</p>
        ) : (
          <div className="grid">
            {images.map((img) => (
              <div key={img.filename} className="item">
                <img src={img.url} alt={img.filename} />
                <button onClick={() => deleteImage(img.filename)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleImageUpload;
