#!/usr/bin/env node

/**
 * MINER PRICES - IMAGE UPLOAD SERVER
 * Deployed on Render
 * 
 * Standalone image upload service
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const querystring = require('querystring');

const PORT = process.env.PORT || 5555;
const UPLOAD_DIR = path.join(process.env.HOME || '/tmp', 'miner-uploads');

// Create uploads directory
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Parse multipart form data
function parseMultipartForm(req, callback) {
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('boundary=')) {
    callback(null);
    return;
  }
  
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
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>⛏️ Miner Prices - Image Upload</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 700px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 10px; font-size: 32px; }
    .subtitle { color: #666; margin-bottom: 30px; font-size: 14px; }
    .upload-box { margin-bottom: 40px; }
    input[type="file"] { padding: 12px; border: 2px solid #ddd; border-radius: 6px; width: 100%; margin-bottom: 12px; font-size: 14px; }
    button { padding: 14px 28px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 16px; width: 100%; transition: all 0.2s; }
    button:hover { background: #0056b3; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,123,255,0.3); }
    button:active { transform: translateY(0); }
    .message { padding: 14px; margin-bottom: 20px; border-radius: 6px; display: none; font-weight: 600; font-size: 14px; }
    .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; display: block; }
    .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; display: block; }
    .gallery { margin-top: 50px; border-top: 2px solid #f0f0f0; padding-top: 30px; }
    h2 { color: #333; margin-bottom: 20px; font-size: 20px; }
    .images { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 15px; }
    .image-item { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: #f9f9f9; transition: all 0.2s; }
    .image-item:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .image-item img { width: 100%; height: 130px; object-fit: cover; display: block; }
    .delete-btn { padding: 10px; background: #dc3545; color: white; border: none; cursor: pointer; width: 100%; font-size: 12px; font-weight: 600; transition: all 0.2s; }
    .delete-btn:hover { background: #c82333; }
    .loading { color: #666; font-size: 14px; padding: 20px; text-align: center; }
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
      <div id="gallery" class="images"><p class="loading">Loading images...</p></div>
      <div class="stats" id="stats"></div>
    </div>
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
        
        if (data.success) {
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
        const res = await fetch('/api/delete?filename=' + encodeURIComponent(filename));
        const data = await res.json();
        if (data.success) {
          showMessage('✅ Deleted', 'success');
          loadGallery();
        } else {
          showMessage('❌ Delete failed', 'error');
        }
      } catch (err) {
        showMessage('❌ Error', 'error');
      }
    }

    async function loadGallery() {
      try {
        const res = await fetch('/api/list');
        if (!res.ok) {
          throw new Error('API error: ' + res.status);
        }
        const data = await res.json();
        
        const gallery = document.getElementById('gallery');
        
        if (!data.files || data.files.length === 0) {
          gallery.innerHTML = '<div class="empty">No images yet. Upload one!</div>';
          document.getElementById('stats').innerText = '0 images';
          return;
        }

        gallery.innerHTML = data.files.map(f => \`
          <div class="image-item">
            <img src="/uploads/\${encodeURIComponent(f)}" alt="\${f}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22130%22 height=%22130%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22130%22 height=%22130%22/%3E%3Ctext x=%2265%22 y=%2265%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23999%22 font-size=%2214%22%3EImage%3C/text%3E%3C/svg%3E'">
            <button class="delete-btn" onclick="deleteImage('\${f.replace(/'/g, %22%5C%27%22)}')">Delete</button>
          </div>
        \`).join('');
        
        document.getElementById('stats').innerText = data.files.length + ' image' + (data.files.length !== 1 ? 's' : '');
      } catch (err) {
        console.error('Gallery load error:', err);
        document.getElementById('gallery').innerHTML = '<div class="error">Error loading gallery: ' + err.message + '</div>';
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

      try {
        fs.writeFileSync(filepath, file.data);
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
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ files: files }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // API: Delete
  if (pathname === '/api/delete' && method === 'GET') {
    const query = querystring.parse(url.parse(req.url).query);
    const filename = query.filename;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Safety check
    if (!filepath.startsWith(UPLOAD_DIR)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid path' }));
      return;
    }

    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
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

    // Safety check
    if (!filepath.startsWith(UPLOAD_DIR)) {
      res.writeHead(400);
      res.end('Invalid path');
      return;
    }

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
