#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');

const PORT = process.env.PORT || 5555;

// Use /tmp for uploads (Render's persistent storage alternative: use env var)
// For persistent storage, we'll store image URLs/data in memory with a fallback
const UPLOAD_DIR = path.join(process.env.TMPDIR || '/tmp', 'uploads');

// Create uploads directory
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// In-memory storage for images (fallback when filesystem resets)
let imagesInMemory = [];

// Parse multipart form data
function parseMultipartForm(req, callback) {
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('boundary=')) {
    callback(null);
    return;
  }
  
  const boundary = contentType.split('boundary=')[1].split(';')[0];
  
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
    
    // Extract file data
    const headerEnd = filePart.indexOf('\r\n\r\n');
    if (headerEnd === -1) {
      callback(null);
      return;
    }
    
    const fileStart = headerEnd + 4;
    const fileEnd = filePart.lastIndexOf('\r\n');
    const fileData = filePart.substring(fileStart, fileEnd);
    
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
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>⛏️ Miner Prices - Image Upload</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
    h1 { color: #333; margin-bottom: 10px; font-size: 32px; }
    .subtitle { color: #666; margin-bottom: 30px; font-size: 14px; }
    .upload-box { margin-bottom: 40px; }
    input[type="file"] { padding: 12px; border: 2px solid #ddd; border-radius: 6px; width: 100%; margin-bottom: 12px; font-size: 14px; }
    button { padding: 14px 28px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 16px; width: 100%; transition: all 0.2s; }
    button:hover { background: #5568d3; }
    button:active { transform: scale(0.98); }
    .message { padding: 14px; margin-bottom: 20px; border-radius: 6px; display: none; font-weight: 600; font-size: 14px; }
    .success { background: #d4edda; color: #155724; display: block; }
    .error { background: #f8d7da; color: #721c24; display: block; }
    .gallery { margin-top: 50px; border-top: 2px solid #f0f0f0; padding-top: 30px; }
    h2 { color: #333; margin-bottom: 20px; font-size: 20px; }
    .images { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
    .image-item { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: #f9f9f9; }
    .image-item img { width: 100%; height: 150px; object-fit: cover; display: block; }
    .delete-btn { padding: 10px; background: #dc3545; color: white; border: none; cursor: pointer; width: 100%; font-size: 12px; font-weight: 600; }
    .delete-btn:hover { background: #c82333; }
    .empty { color: #999; font-size: 14px; padding: 30px; text-align: center; background: #f9f9f9; border-radius: 6px; }
    .stats { color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f0f0f0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📸 Miner Prices Image Upload</h1>
    <p class="subtitle">Upload mining equipment images</p>
    
    <div class="upload-box">
      <input type="file" id="fileInput" accept="image/*">
      <button onclick="uploadImage()">Upload Image</button>
    </div>
    
    <div id="message" class="message"></div>
    
    <div class="gallery">
      <h2>Gallery</h2>
      <div id="gallery" class="images"></div>
      <div class="stats" id="stats"></div>
    </div>
  </div>

  <script>
    async function uploadImage() {
      const fileInput = document.getElementById('fileInput');
      const file = fileInput.files[0];
      
      if (!file) {
        showMessage('Choose a file first', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      showMessage('Uploading...', 'success');

      try {
        const res = await fetch('/api/upload', { 
          method: 'POST', 
          body: formData
        });
        
        if (!res.ok) {
          throw new Error('Upload failed: ' + res.status);
        }
        
        const data = await res.json();
        
        if (data.success) {
          showMessage('✅ Uploaded: ' + data.filename, 'success');
          fileInput.value = '';
          loadGallery();
        } else {
          showMessage('❌ ' + (data.error || 'Upload failed'), 'error');
        }
      } catch (err) {
        console.error('Upload error:', err);
        showMessage('❌ Error: ' + err.message, 'error');
      }
    }

    async function deleteImage(filename) {
      if (!confirm('Delete ' + filename + '?')) return;
      
      try {
        const res = await fetch('/api/delete?filename=' + encodeURIComponent(filename));
        if (res.ok) {
          showMessage('✅ Deleted', 'success');
          loadGallery();
        }
      } catch (err) {
        showMessage('❌ Delete error', 'error');
      }
    }

    async function loadGallery() {
      try {
        const res = await fetch('/api/list');
        const data = await res.json();
        
        const gallery = document.getElementById('gallery');
        
        if (!data.files || data.files.length === 0) {
          gallery.innerHTML = '<div class="empty">No images uploaded yet. Upload one to get started!</div>';
          document.getElementById('stats').innerText = '0 images';
          return;
        }

        gallery.innerHTML = data.files.map(f => \`
          <div class="image-item">
            <img src="/uploads/\${encodeURIComponent(f)}" alt="\${f}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22150%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22150%22 height=%22150%22/%3E%3Ctext x=%2275%22 y=%2275%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23999%22%3EImage%3C/text%3E%3C/svg%3E'">
            <button class="delete-btn" onclick="deleteImage('\${f}')">Delete</button>
          </div>
        \`).join('');
        
        document.getElementById('stats').innerText = data.files.length + ' image' + (data.files.length !== 1 ? 's' : '');
      } catch (err) {
        gallery.innerHTML = '<div class="error">Error: ' + err.message + '</div>';
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

      const filename = Date.now() + '-' + crypto.randomBytes(4).toString('hex') + path.extname(file.filename);
      const filepath = path.join(UPLOAD_DIR, filename);

      try {
        fs.writeFileSync(filepath, file.data);
        imagesInMemory.push(filename);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, filename: filename }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API: List
  if (pathname === '/api/list' && method === 'GET') {
    try {
      const files = fs.readdirSync(UPLOAD_DIR);
      imagesInMemory = files; // Keep in sync
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ files: files }));
    } catch (err) {
      // If directory doesn't exist, return in-memory list
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ files: imagesInMemory }));
    }
    return;
  }

  // API: Delete
  if (pathname === '/api/delete' && method === 'GET') {
    const query = querystring.parse(url.parse(req.url).query);
    const filename = query.filename;
    const filepath = path.join(UPLOAD_DIR, filename);

    if (!filepath.startsWith(UPLOAD_DIR)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid' }));
      return;
    }

    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        imagesInMemory = imagesInMemory.filter(f => f !== filename);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Serve uploaded files
  if (pathname.startsWith('/uploads/')) {
    const filename = decodeURIComponent(path.basename(pathname));
    const filepath = path.join(UPLOAD_DIR, filename);

    if (!filepath.startsWith(UPLOAD_DIR)) {
      res.writeHead(400);
      res.end('Invalid');
      return;
    }

    if (fs.existsSync(filepath)) {
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };
      const mime = mimeTypes[ext] || 'image/jpeg';
      
      res.writeHead(200, { 'Content-Type': mime });
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
  console.log('✅ MINER PRICES IMAGE UPLOAD SERVER');
  console.log('');
  console.log('🌐 Open in browser:');
  console.log('   http://localhost:' + PORT);
  console.log('');
  console.log('📁 Files saved to:');
  console.log('   ' + UPLOAD_DIR);
  console.log('');
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('\n✅ Server stopped');
    process.exit(0);
  });
});
