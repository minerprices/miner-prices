import React, { useState, useEffect } from 'react';

const TestUpload = () => {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const API = 'https://miner-prices.onrender.com';

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
      console.error('Error loading:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('❌ Choose a file first');
      return;
    }

    setMessage('Uploading...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      console.log('Response:', data);

      if (res.ok) {
        setMessage('✅ Uploaded! ' + data.filename);
        setFile(null);
        loadImages();
      } else {
        setMessage('❌ ' + (data.error || 'Upload failed'));
      }
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
      console.error('Error:', err);
    }
  };

  const deleteImage = async (filename) => {
    if (!window.confirm('Delete?')) return;

    try {
      const res = await fetch(`${API}/api/images/${filename}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        loadImages();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1>🧪 Test Image Upload</h1>

      <form onSubmit={handleUpload} style={{ marginBottom: '30px' }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0])}
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Upload
        </button>
      </form>

      {message && (
        <p style={{ padding: '10px', background: message.includes('✅') ? '#d4edda' : '#f8d7da', borderRadius: '4px', marginBottom: '20px' }}>
          {message}
        </p>
      )}

      <h2>Images ({images.length})</h2>
      {loading ? (
        <p>Loading...</p>
      ) : images.length === 0 ? (
        <p>No images yet. Upload one!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
          {images.map((img) => (
            <div key={img.filename} style={{ border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
              <img src={img.url} alt={img.filename} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <button
                onClick={() => deleteImage(img.filename)}
                style={{ width: '100%', padding: '8px', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestUpload;
