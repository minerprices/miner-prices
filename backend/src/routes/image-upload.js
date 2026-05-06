const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup storage folder
const uploadDir = path.join(__dirname, '../../public/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer - SIMPLE
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + path.extname(file.originalname);
    cb(null, name);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// UPLOAD - POST /api/upload
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/images/${req.file.filename}`;
    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LIST - GET /api/images/list
router.get('/list', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const images = files.map(f => ({
      filename: f,
      url: `/images/${f}`
    }));
    res.json({ images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - DELETE /api/images/:filename
router.delete('/:filename', (req, res) => {
  try {
    const filepath = path.join(uploadDir, req.params.filename);
    
    // Safety check - make sure file is in images folder
    if (!filepath.startsWith(uploadDir)) {
      return res.status(400).json({ error: 'Invalid path' });
    }

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
