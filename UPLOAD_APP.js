#!/usr/bin/env node

/**
 * WORKING IMAGE UPLOAD APP
 * 
 * This is a complete, standalone image upload system.
 * No dependencies. No installation. Just run it.
 * 
 * Usage:
 *   node UPLOAD_APP.js
 * 
 * Then open:
 *   http://localhost:5555
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const querystring = require('querystring');

const PORT = 5555;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Create uploads directory
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Parse multipart form data
function parseMultipartForm(req, callback) {
  const contentType = req.headers['content-type'];
  const boundary = contentType.split('boundary=')[1];
  
  let body = '';
  req.on('data', chunk => body += chunk.toString('binary'));
  req.on('end', () => {
    const parts = body.split('--' + boundary);
    const filePart = parts.find(p => p.includes('filename='));
    
    if (!filePart) {
      callback(null);
      return;
    }
    
    const filenameMatch = filePart.match(/filename="([^"]+)"/);
    const filename = filenameMatch ? filenameMatch[1] : 'upload';
    
    const fileData = filePart.split('\r\n\r\n')[1].split('\r\n--')[0];
    
    callback({
      filename: filename,
      data: Buffer.from(fileData, 'binary')
    });
  });
}

// Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // ===== ROUTES =====

  // Home page / UI
  if (pathname === '/' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html>
<head>
  <title>📸 Image Upload</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 30px; font-size: 28px; }
    .upload-box { margin-bottom: 30px; }
    input[type="file"] { padding: 10px; border: 1px solid #ddd; border-radius: 4px; width: 100%; margin-bottom: 10px; }
    button { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 16px; width: 100%; }
    button:hover { background: #0056b3; }
    button:active { transform: scale(0.98); }
    .message { padding: 12px; margin-bottom: 20px; border-radius: 4px; display: none; font-weight: 600; }
    .success { background: #d4edda; color: #155724; display: block; }
    .error { background: #f8d7da; color: #721c24; display: block; }
    .gallery { margin-top: 40px; }
    h2 { color: #333; margin-bottom: 20px; font-size: 20px; }
    .images { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px; }
    .image-item { border: 1px solid #ddd; border-radius: 6px; overflow: hidden; background: #f9f9f9; }
    .image-item img { width: 100%; height: 120px; object-fit: cover; display: block; }
    .delete-btn { padding: 8px; background: #dc3545; color: white; border: none; cursor: pointer; width: 100%; font-size: 12px; font-weight: 600; }
    .delete-btn:hover { background: #c82333; }
    .loading { color: #666; font-size: 14px; }
    .empty { color: #999; font-size: 14px; padding: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📸 Upload Images</h1>
    
    <div class="upload-box">
      <input type="file" id="fileInput" accept="image/*">
      <button onclick="uploadImage()">Upload</button>
    </div>
    
    <div id="message" class="message"></div>
    
    <div class="gallery">
      <h2>Gallery</h2>
      <div id="gallery" class="images"><p class="loading">Loading...</p></div>
    </div>
  </div>

  <script>
    async function uploadImage() {
      const file = document.getElementById('fileInput').files[0];
      if (!file) {
        showMessage('Choose a file', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      showMessage('Uploading...', 'success');

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        
        if (data.success) {
          showMessage('✅ Uploaded: ' + data.filename, 'success');
          document.getElementById('fileInput').value = '';
          loadGallery();
        } else {
          showMessage('❌ ' + (data.error || 'Failed'), 'error');
        }
      } catch (err) {
        showMessage('❌ Error: ' + err.message, 'error');
      }
    }

    async function deleteImage(filename) {
      if (!confirm('Delete ' + filename + '?')) return;
      
      try {
        const res = await fetch('/api/delete?filename=' + filename);
        const data = await res.json();
        if (data.success) {
          showMessage('✅ Deleted', 'success');
          loadGallery();
        }
      } catch (err) {
        showMessage('❌ Error', 'error');
      }
    }

    async function loadGallery() {
      try {
        const res = await fetch('/api/list');
        const data = await res.json();
        
        const gallery = document.getElementById('gallery');
        
        if (!data.files || data.files.length === 0) {
          gallery.innerHTML = '<p class="empty">No images. Upload one!</p>';
          return;
        }

        gallery.innerHTML = data.files.map(f => \`
          <div class="image-item">
            <img src="/uploads/\${f}" alt="\${f}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23999%22%3EImage%3C/text%3E%3C/svg%3E'">
            <button class="delete-btn" onclick="deleteImage('\${f}')">Delete</button>
          </div>
        \`).join('');
      } catch (err) {
        document.getElementById('gallery').innerHTML = '<p class="error">Error loading gallery</p>';
      }
    }

    function showMessage(msg, type) {
      const el = document.getElementById('message');
      el.textContent = msg;
      el.className = 'message ' + type;
    }

    // Load gallery on start
    loadGallery();
  </script>
</body>
</html>`);
    return;
  }

  // API: Upload
  if (pathname === '/api/upload' && method === 'POST') {
    parseMultipartForm(req, (file) => {
      if (!file) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No file' }));
        return;
      }

      const filename = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + path.extname(file.filename);
      const filepath = path.join(UPLOAD_DIR, filename);

      fs.writeFileSync(filepath, file.data);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, filename: filename }));
    });
    return;
  }

  // API: List
  if (pathname === '/api/list' && method === 'GET') {
    const files = fs.readdirSync(UPLOAD_DIR);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ files: files }));
    return;
  }

  // API: Delete
  if (pathname === '/api/delete' && method === 'GET') {
    const query = querystring.parse(url.parse(req.url).query);
    const filename = query.filename;
    const filepath = path.join(UPLOAD_DIR, filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
    return;
  }

  // Serve uploaded files
  if (pathname.startsWith('/uploads/')) {
    const filename = path.basename(pathname);
    const filepath = path.join(UPLOAD_DIR, filename);

    if (fs.existsSync(filepath)) {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(fs.readFileSync(filepath));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log('');
  console.log('✅ IMAGE UPLOAD SERVER STARTED');
  console.log('');
  console.log('🌐 OPEN IN BROWSER:');
  console.log('   http://localhost:' + PORT);
  console.log('');
  console.log('📁 FILES SAVED TO:');
  console.log('   ' + UPLOAD_DIR);
  console.log('');
  console.log('⏹️  TO STOP: Press Ctrl+C');
  console.log('');
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('\n✅ Server stopped');
    process.exit(0);
  });
});
