const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const uploadDir = path.join(__dirname, 'public/images');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + path.extname(file.originalname);
    cb(null, name);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Routes
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ success: true, url: `/images/${req.file.filename}`, filename: req.file.filename });
});

app.get('/api/images/list', (req, res) => {
  const files = fs.readdirSync(uploadDir);
  const images = files.map(f => ({ filename: f, url: `/images/${f}` }));
  res.json({ images });
});

app.delete('/api/images/:filename', (req, res) => {
  const filepath = path.join(uploadDir, req.params.filename);
  if (!filepath.startsWith(uploadDir)) return res.status(400).json({ error: 'Invalid' });
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

const server = app.listen(3333, () => {
  console.log('✅ Test server running on http://localhost:3333');
  console.log('Test endpoints:');
  console.log('  POST   /api/upload       - Upload image');
  console.log('  GET    /api/images/list  - List images');
  console.log('  DELETE /api/images/:filename - Delete image');
});

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});
