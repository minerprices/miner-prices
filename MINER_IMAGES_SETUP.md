# 📸 Miner Image Manager - Setup Complete

## What's Been Built

### 1. Backend API Endpoints
All endpoints at `https://miner-prices.onrender.com/api/images/`:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/miner/:minerId` | List all images for a miner |
| POST | `/upload` | Upload image for a miner (requires `minerId` in form data) |
| POST | `/:id/primary` | Set an image as primary for its miner |
| DELETE | `/:id` | Delete an image |

**File:** `backend/src/routes/images.js` ✅

### 2. Frontend Component
**File:** `frontend/src/pages/AdminMinerImages.js`

**Features:**
- Left sidebar with list of all miners
- Click miner → see its images + upload form
- Upload → assigns to selected miner
- Set Primary → makes it main image for that miner
- Delete → removes image from miner

**Styling:** `frontend/src/pages/AdminMinerImages.css` ✅

### 3. Routes
**File:** `frontend/src/App.js`

```javascript
<Route path="/admin/test-miner-images" element={<AdminMinerImages />} />
```

- No auth required (for testing)
- After verification, move to authenticated `/admin/miner-images`

### 4. Environment Config
**File:** `frontend/.env`

```env
REACT_APP_API_BASE=https://miner-prices.onrender.com
REACT_APP_UPLOAD_API=https://miner-prices-upload.onrender.com
```

✅ Configured

### 5. Backend Mounting
**File:** `backend/src/index.js`

```javascript
const imageRoutes = require('./routes/images');
...
app.use('/api/images', imageRoutes);
```

✅ Routes mounted (specific routes before generic ones)

---

## How to Test

### After Render Deployment (wait 5-10 minutes):

1. **Visit:** https://minerprices.com/admin/test-miner-images
   
2. **Expected:**
   - Miners list loads in left sidebar
   - Click "Antminer S21 Pro" 
   - Shows "No images yet"
   - Upload button is clickable

3. **Test Upload:**
   - Select an image file
   - Click "📤 Upload Image"
   - Message: "✅ Image uploaded!"
   - Image appears in gallery

4. **Test Set Primary:**
   - Click "Set Primary" on an image
   - Badge changes to "⭐ Primary"

5. **Test Delete:**
   - Click "Delete" button
   - Image removed from gallery

### API Testing (via curl):

```bash
# List images for miner 1
curl https://miner-prices.onrender.com/api/images/miner/1

# Upload image
curl -X POST \
  -F "image=@photo.jpg" \
  -F "minerId=1" \
  https://miner-prices.onrender.com/api/images/upload

# Set as primary (replace :id with image ID from list)
curl -X POST https://miner-prices.onrender.com/api/images/:id/primary

# Delete (replace :id with image ID)
curl -X DELETE https://miner-prices.onrender.com/api/images/:id
```

---

## Database Structure

### `miner_images` table
```sql
CREATE TABLE miner_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  miner_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(miner_id) REFERENCES miners(id)
);
```

- `miner_id` → Which miner owns this image
- `url` → Path to image file (e.g., `/uploads/miner-123-abc.jpg`)
- `is_primary` → 0 or 1 (each miner has at most 1 primary)
- `uploaded_at` → When image was added

---

## Git Commits

```
99a469c - Fix route ordering - miner image routes before generic upload routes
1406fc6 - Add per-miner image manager - select miner, upload/manage images per miner
e817926 - Mount image routes - enable per-miner image management endpoints
```

---

## Next Steps After Testing

1. ✅ Verify `/admin/test-miner-images` works
2. ✅ Test upload/delete/primary functions
3. Add route to authenticated `/admin/miner-images`
4. Remove public test route
5. Deploy to production

---

## Files Modified

- `backend/src/routes/images.js` - Miner image endpoints
- `backend/src/index.js` - Mount image routes
- `frontend/src/pages/AdminMinerImages.js` - UI component
- `frontend/src/pages/AdminMinerImages.css` - Styling
- `frontend/src/App.js` - Add test route
- `frontend/.env` - API configuration

---

## Current Status

✅ **Code complete and deployed**
⏳ **Render backend redeploying** (ETA 5-10 minutes)
⏳ **Vercel frontend deploying** (ETA 3-5 minutes)

**Test URL:** https://minerprices.com/admin/test-miner-images
