#!/usr/bin/env node

/**
 * Quick Test Server - Image Upload
 * Run: node quick-test-server.js
 * Then open: http://localhost:5555
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const uploadDir = path.join(__dirname, 'test-uploads');

// Create uploads directory
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.static(uploadDir));

// Configure multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + path.extname(file.originalname);
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// ===== API ROUTES =====

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const imageUrl = `/test-uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: imageUrl,
    filename: req.file.filename,
    size: req.file.size
  });
});

// List endpoint
app.get('/api/images/list', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const images = files.map(f => {
      const filepath = path.join(uploadDir, f);
      const size = fs.statSync(filepath).size;
      return {
        filename: f,
        url: `/test-uploads/${f}`,
        size: size
      };
    });
    res.json({ images, count: images.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete endpoint
app.delete('/api/images/:filename', (req, res) => {
  try {
    const filepath = path.join(uploadDir, req.params.filename);
    
    // Safety check
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

// ===== HTML TEST PAGE =====

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>🧪 Image Upload Test</title>
      <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .container { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        h1 { color: #333; }
        .form-group { margin: 20px 0; }
        input[type="file"] { padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
        button:hover { background: #0056b3; }
        .message { padding: 10px; border-radius: 4px; margin: 10px 0; display: none; }
        .success { background: #d4edda; color: #155724; display: block; }
        .error { background: #f8d7da; color: #721c24; display: block; }
        .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin-top: 30px; }
        .image-item { border: 1px solid #ddd; border-radius: 6px; overflow: hidden; background: white; }
        .image-item img { width: 100%; height: 150px; object-fit: cover; }
        .image-item .actions { padding: 10px; text-align: center; }
        .delete-btn { background: #dc3545; font-size: 12px; padding: 5px 10px; }
        .delete-btn:hover { background: #c82333; }
        .status { padding: 10px; background: #e7f3ff; border-radius: 4px; margin: 10px 0; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📸 Test Image Upload</h1>
        <p>Upload images and they'll be saved to the server</p>
        
        <div class="form-group">
          <input type="file" id="fileInput" accept="image/*">
          <button onclick="uploadImage()">Upload</button>
        </div>
        
        <div id="message" class="message"></div>
        <div class="status" id="status">Ready</div>
        
        <h2>Gallery</h2>
        <div id="gallery" class="gallery"></div>
      </div>

      <script>
        async function uploadImage() {
          const file = document.getElementById('fileInput').files[0];
          if (!file) {
            showMessage('Choose a file first', 'error');
            return;
          }

          const formData = new FormData();
          formData.append('image', file);

          showMessage('Uploading...', 'success');

          try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();

            if (res.ok) {
              showMessage('✅ Uploaded: ' + data.filename, 'success');
              document.getElementById('fileInput').value = '';
              loadGallery();
            } else {
              showMessage('❌ ' + (data.error || 'Upload failed'), 'error');
            }
          } catch (err) {
            showMessage('❌ Error: ' + err.message, 'error');
          }
        }

        async function deleteImage(filename) {
          if (!confirm('Delete ' + filename + '?')) return;

          try {
            const res = await fetch('/api/images/' + filename, { method: 'DELETE' });
            if (res.ok) {
              showMessage('✅ Deleted', 'success');
              loadGallery();
            }
          } catch (err) {
            showMessage('❌ Error: ' + err.message, 'error');
          }
        }

        async function loadGallery() {
          try {
            const res = await fetch('/api/images/list');
            const data = await res.json();

            const gallery = document.getElementById('gallery');
            gallery.innerHTML = '';

            if (data.images.length === 0) {
              gallery.innerHTML = '<p>No images yet</p>';
              document.getElementById('status').innerText = '0 images';
              return;
            }

            data.images.forEach(img => {
              const div = document.createElement('div');
              div.className = 'image-item';
              div.innerHTML = \`
                <img src="\${img.url}" alt="\${img.filename}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2250%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3EImage%3C/text%3E%3C/svg%3E'">
                <div class="actions">
                  <small>\${img.filename}</small><br>
                  <button class="delete-btn" onclick="deleteImage('\${img.filename}')">Delete</button>
                </div>
              \`;
              gallery.appendChild(div);
            });

            document.getElementById('status').innerText = data.count + ' image(s)';
          } catch (err) {
            console.error('Error loading gallery:', err);
          }
        }

        function showMessage(msg, type) {
          const el = document.getElementById('message');
          el.innerText = msg;
          el.className = 'message ' + type;
        }

        // Load gallery on page load
        loadGallery();
      </script>
    </body>
    </html>
  `);
});

// Start server
const PORT = 5555;
const server = app.listen(PORT, () => {
  console.log('');
  console.log('✅ Image Upload Test Server');
  console.log('🌐 Open browser: http://localhost:' + PORT);
  console.log('');
  console.log('📁 Uploads saved to: ' + uploadDir);
  console.log('');
  console.log('API Endpoints:');
  console.log('  POST   /api/upload        - Upload image');
  console.log('  GET    /api/images/list   - List images');
  console.log('  DELETE /api/images/:file  - Delete image');
  console.log('');
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('\n✅ Server stopped');
    process.exit(0);
  });
});
