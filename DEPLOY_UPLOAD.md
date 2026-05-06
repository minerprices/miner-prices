# Deploy Image Upload Server to Render

The image upload server is now separate and ready to deploy.

## Option 1: Use Existing Service (FAST)

The `upload-server/` folder is ready to deploy to Render as a new web service.

**Steps:**

1. Go to: https://render.com/dashboard
2. Click "New +"
3. Select "Web Service"
4. Connect GitHub to: `minerprices/miner-prices`
5. Set these fields:
   - **Name:** `miner-prices-upload`
   - **Root Directory:** `upload-server`
   - **Build Command:** (leave empty)
   - **Start Command:** `node app.js`
   - **Plan:** Free

6. Click "Create Web Service"
7. Wait ~2 minutes for deployment
8. Copy the URL (e.g., `https://miner-prices-upload.onrender.com`)
9. Share with users: **That URL is the upload server**

## Option 2: Create Separate Repository

Want a dedicated repo just for uploads?

1. Create new repo: `miner-upload`
2. Copy `upload-server/` contents there
3. Deploy to Render same way

## Once Deployed

Users can go to:
```
https://miner-prices-upload.onrender.com
```

And upload images immediately. No localhost needed.

---

## Files

- `upload-server/app.js` - Complete image upload app (no dependencies)
- `upload-server/package.json` - Render configuration

---

## What Happens After Deployment

1. ✅ User opens the URL
2. ✅ Sees upload form
3. ✅ Chooses image
4. ✅ Clicks upload
5. ✅ Image appears in gallery
6. ✅ Can delete anytime

All on a public Render URL you can share.

---

**Do this now to give users access without localhost.**
