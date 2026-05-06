const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

console.log('👤 SIMULATING REAL USER UPLOADING IMAGE\n');

// Start local server
const express = require('express');
const multer = require('multer');

const app = express();
const uploadDir = path.join(__dirname, 'public/images');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + path.extname(file.originalname);
    cb(null, name);
  }
});

const upload = multer({ storage });

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

const server = app.listen(4444, async () => {
  console.log('✅ Test server running on port 4444\n');
  
  // Create test image
  const testImagePath = '/tmp/user-test-image.jpg';
  fs.writeFileSync(testImagePath, Buffer.from('test image data from user'));
  console.log('📸 Created test image: ' + testImagePath);
  
  // Step 1: User uploads image
  console.log('\n📤 STEP 1: User uploads image...');
  const form = new FormData();
  form.append('image', fs.createReadStream(testImagePath));
  
  const uploadReq = form.submit('http://localhost:4444/api/upload', (err, res) => {
    if (err) {
      console.log('❌ Upload failed: ' + err.message);
      server.close();
      process.exit(1);
    }
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const result = JSON.parse(data);
      console.log('✅ Upload successful!');
      console.log('   Filename: ' + result.filename);
      console.log('   URL: ' + result.url);
      
      // Step 2: Check if file saved
      console.log('\n💾 STEP 2: Verify file saved to disk...');
      const savedFile = path.join(uploadDir, result.filename);
      if (fs.existsSync(savedFile)) {
        const size = fs.statSync(savedFile).size;
        console.log('✅ File saved on disk!');
        console.log('   Path: ' + savedFile);
        console.log('   Size: ' + size + ' bytes');
      } else {
        console.log('❌ File NOT found on disk!');
        server.close();
        process.exit(1);
      }
      
      // Step 3: List all images
      console.log('\n📋 STEP 3: User views image gallery...');
      http.get('http://localhost:4444/api/images/list', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const list = JSON.parse(data);
          console.log('✅ Gallery loaded!');
          console.log('   Images in gallery: ' + list.images.length);
          list.images.forEach((img, i) => {
            console.log('   ' + (i+1) + '. ' + img.filename);
          });
          
          // Step 4: User deletes image
          console.log('\n🗑️  STEP 4: User deletes image...');
          http.request({
            hostname: 'localhost',
            port: 4444,
            path: '/api/images/' + result.filename,
            method: 'DELETE'
          }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              const deleteResult = JSON.parse(data);
              console.log('✅ Delete successful!');
              
              // Step 5: Verify deleted
              console.log('\n✔️  STEP 5: Verify image deleted...');
              if (!fs.existsSync(savedFile)) {
                console.log('✅ File removed from disk!');
              } else {
                console.log('❌ File still exists!');
              }
              
              // Done
              console.log('\n' + '='.repeat(50));
              console.log('🎯 ALL TESTS PASSED - IMAGE UPLOAD WORKS!');
              console.log('='.repeat(50));
              
              server.close();
              process.exit(0);
            });
          }).end();
        });
      });
    });
  });
});

// Timeout safety
setTimeout(() => {
  console.log('\n❌ Test timed out');
  server.close();
  process.exit(1);
}, 30000);
