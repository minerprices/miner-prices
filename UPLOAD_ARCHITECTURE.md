# Upload Architecture - External Storage + Database URLs

## Overview

All file uploads (miner images, vendor logos) use **external storage** with **URL references in database**.

```
File Upload
    ↓
Backend API (Node.js)
    ↓
ImgBB (external storage)
    ↓
URL returned
    ↓
Save URL to database
    ↓
Frontend displays from URL
```

## Why This Approach?

✅ **Render doesn't have persistent disk** - files would disappear on redeploy
✅ **ImgBB is free** - no cost, unlimited bandwidth
✅ **URLs in database** - lightweight, fast queries
✅ **CDN included** - ImgBB serves globally
✅ **Image optimization** - auto compression, format conversion

❌ **DON'T store files on Render** - ephemeral filesystem
❌ **DON'T store Base64 in DB** - bloats database, slow queries
❌ **DON'T rely on /uploads directory** - deleted on restart

## Endpoints

### Miner Images
```
POST /api/upload
Body: FormData with 'image' field
Returns: { success: true, url: "https://...", filename: "..." }
```

### Vendor Logos
```
POST /api/vendor-upload/:vendorId
Body: FormData with 'logo' field
Returns: { success: true, logoUrl: "https://...", vendorId: 123 }
```

## Database Schema

### Miners Table
```sql
CREATE TABLE miners (
  id INTEGER PRIMARY KEY,
  name TEXT,
  image_url TEXT,  -- URL from ImgBB
  ...
);
```

### Vendors Table
```sql
CREATE TABLE vendors (
  id INTEGER PRIMARY KEY,
  company_name TEXT,
  logo_url TEXT,   -- URL from ImgBB
  ...
);
```

## Setup

1. **Get ImgBB API Key**
   - Go to: https://imgbb.com/
   - API key available at: https://api.imgbb.com/
   - Free tier: unlimited uploads

2. **Set Environment Variable**
   - Render Dashboard → Environment Variables
   - Key: `IMGBB_API_KEY`
   - Value: Your ImgBB API key

3. **Test Upload**
   ```bash
   curl -X POST \
     -F "image=@photo.jpg" \
     https://minerprices.onrender.com/api/upload
   ```

## Frontend Example

```javascript
async function uploadMinerImage(minerId, file) {
  const formData = new FormData();
  formData.append('image', file);

  // Upload to backend (backend uploads to ImgBB)
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();

  if (data.success) {
    // Save URL to miner
    await fetch(`/api/miners/${minerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: data.url })
    });
  }
}
```

## Limits

- Miner images: 10MB max
- Vendor logos: 5MB max
- Formats: JPEG, PNG, WebP, GIF, SVG

## Migration (if needed)

If you have images stored elsewhere and want to move them:

1. Download image from old source
2. Upload to ImgBB
3. Get returned URL
4. Update database: `UPDATE miners SET image_url = 'NEW_URL' WHERE id = X`

## Security

✅ File type validation (MIME check)
✅ File size limits
✅ External storage isolates from backend
✅ URLs are public (okay for logos/product images)

For private files, use:
- Cloudinary signed URLs
- AWS S3 with presigned URLs

## Cost

**ImgBB Free Tier:**
- Unlimited uploads
- 32MB per image
- Community tier fine for most apps

**If you scale beyond free:**
- Cloudinary: $0.20-0.40 per GB/month
- AWS S3: $0.023 per GB/month

## Troubleshooting

**"ImgBB API key not configured"**
- Check Render environment variables
- Restart app after adding key

**Upload fails with 500**
- Check ImgBB API key validity
- Check image file size
- Check file format (must be image/*)

**Image not displaying**
- Verify URL in database: `SELECT logo_url FROM vendors WHERE id = 1;`
- Try URL in browser directly
- Check ImgBB account (not rate limited?)

## Future Enhancements

- [ ] Resize images on upload (using ImgBB transformations)
- [ ] Validate image dimensions (square logos, etc.)
- [ ] Add image deletion (delete from ImgBB + clear DB)
- [ ] Batch upload multiple images
- [ ] Image gallery with filters
