# ✅ Admin Panel - Manage Miner Images

## Complete Image Management System for Admins

### Access
**URL:** `https://minerprices.com/admin/miner-images` (after login)

### Features

#### 1. Select Miner
- Left sidebar shows all miners
- Click any miner to manage its images
- Selected miner highlighted

#### 2. Upload Images
- Click "📤 Upload" tab
- Choose image file from computer
- Image saved to database
- First image automatically set as primary

#### 3. Find Images
- Click "🔍 Find Images" tab
- Enter search term (e.g., "product photo", "stock image")
- System finds 5 relevant images
- Click image to use it
- Auto-saved to miner

#### 4. Manage Images
- View all images for miner
- ⭐ Primary badge shows featured image
- "Set Primary" button to change featured
- "Delete" button to remove

### How to Use

1. **Login** as admin (admin@minerprices.com / admin123)
2. **Go to:** `/admin/miner-images`
3. **Select a miner** from left panel
4. **Upload or find images:**
   - **Upload:** Choose file → Upload
   - **Find:** Enter search term → Click image to use
5. **Manage:**
   - Set any image as primary
   - Delete unwanted images

### API Endpoints

```
POST   /api/miners/:minerId/images/upload          - Upload file
POST   /api/miners/:minerId/images/add-url         - Add image by URL
GET    /api/miners/:minerId/images                 - Get all images
POST   /api/miners/:minerId/images/:imageId/primary - Set primary
DELETE /api/miners/:minerId/images/:imageId        - Delete image
```

### What Gets Stored

- **URL:** Path to image on server
- **Primary Flag:** Which image is featured
- **Upload Time:** When image was added
- **Miner ID:** Which miner owns the image

### Files

**Frontend:**
- `frontend/src/pages/AdminMinerImages.js` - Admin panel component
- `frontend/src/pages/AdminMinerImages.css` - Styles

**Backend:**
- Image upload endpoints in `src/index.js`
- Database: `miner_images` table

### Workflow

```
Admin → Login → Select Miner → Upload/Find Image → Set Primary → Done
```

### Mobile Friendly

- Responsive design
- Works on tablet/mobile
- Sidebar collapses on small screens

### Status

✅ **Complete and ready to deploy**
✅ **All endpoints functional**
✅ **Admin UI polished**
✅ **Waiting for Render deployment**

Once deployed, admins can immediately manage all miner images.
