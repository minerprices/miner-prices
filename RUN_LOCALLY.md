# Run Miner Prices Locally - Image Upload Works NOW

## Quick Start

The image upload system is **100% tested and working**. While we wait for Render to deploy, you can run it locally:

### Backend Setup (Terminal 1)

```bash
cd backend
npm install
npm start
```

Backend will start on `http://localhost:5000`

### Frontend Setup (Terminal 2)

```bash
cd frontend
npm install
npm start
```

Frontend will start on `http://localhost:3000`

### Test Image Upload

1. Open browser: http://localhost:3000/test-upload
2. Choose an image file
3. Click "Upload"
4. Image appears in gallery
5. Click "Delete" to remove

## What Works

✅ Upload images to `/public/images/` folder
✅ List all uploaded images
✅ Delete images
✅ Real-time gallery
✅ Error handling

## API Endpoints

```
POST   /api/upload              - Upload image file
GET    /api/images/list         - List all images
DELETE /api/images/:filename    - Delete image
GET    /images/:filename        - Serve image file
```

## Testing Results

All endpoints tested and verified working:
- ✅ File upload
- ✅ File saved to disk
- ✅ File retrieved from list
- ✅ File deleted
- ✅ Directory cleanup

## Files

**Backend Routes:**
- `/backend/src/routes/image-upload.js` - All upload/list/delete logic

**Frontend Pages:**
- `/frontend/src/pages/TestUpload.js` - Test upload page

## What to Expect

When you upload an image:
1. File picker appears
2. Choose your image
3. Click "Upload"
4. Success message appears
5. Image appears in gallery below
6. Shows filename and URL
7. Can delete with one click

---

**This works. Render will catch up soon.**
