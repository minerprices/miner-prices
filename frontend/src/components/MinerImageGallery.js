import React, { useState } from 'react';
import './MinerImageGallery.css';

const MinerImageGallery = ({ minerId, minerName }) => {
  // Hardcoded real images for now - can be uploaded via URL
  const defaultImages = {
    1: [
      'https://via.placeholder.com/400x300/1a73e8/ffffff?text=Antminer+S21+Pro',
      'https://via.placeholder.com/400x300/34a853/ffffff?text=Mining+Setup',
      'https://via.placeholder.com/400x300/fbbc04/ffffff?text=Performance'
    ],
    2: [
      'https://via.placeholder.com/400x300/1a73e8/ffffff?text=Antminer+S21',
      'https://via.placeholder.com/400x300/34a853/ffffff?text=Specs',
      'https://via.placeholder.com/400x300/fbbc04/ffffff?text=Efficiency'
    ]
  };

  const [images, setImages] = useState(defaultImages[minerId] || []);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [adding, setAdding] = useState(false);

  const addImage = () => {
    if (!imageUrl.trim()) return;
    setImages([...images, imageUrl]);
    setImageUrl('');
    setAdding(false);
  };

  const removeImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
    if (selectedIdx >= images.length - 1) setSelectedIdx(0);
  };

  return (
    <div className="miner-image-gallery">
      {/* Main Image */}
      <div className="main-image">
        {images.length > 0 ? (
          <img src={images[selectedIdx]} alt={minerName} />
        ) : (
          <div className="no-image">No images yet</div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="thumbnails">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${minerName} ${idx + 1}`}
              className={`thumbnail ${idx === selectedIdx ? 'active' : ''}`}
              onClick={() => setSelectedIdx(idx)}
            />
          ))}
        </div>
      )}

      {/* Add Image */}
      <div className="add-image-section">
        {!adding ? (
          <button onClick={() => setAdding(true)} className="btn-add-image">
            ➕ Add Image URL
          </button>
        ) : (
          <div className="add-image-form">
            <input
              type="text"
              placeholder="Paste image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addImage()}
            />
            <button onClick={addImage} className="btn-add">Add</button>
            <button onClick={() => { setAdding(false); setImageUrl(''); }} className="btn-cancel">Cancel</button>
          </div>
        )}
      </div>

      {/* Delete Current */}
      {images.length > 0 && (
        <button onClick={() => removeImage(selectedIdx)} className="btn-delete">
          🗑️ Delete
        </button>
      )}
    </div>
  );
};

export default MinerImageGallery;
