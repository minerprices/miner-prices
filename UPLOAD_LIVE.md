# 🚀 DEPLOY UPLOAD SERVER TO RENDER

Code is pushed to GitHub. Now deploy to Render.

## STEPS (5 minutes)

### 1. Go to Render Dashboard
https://render.com/dashboard

### 2. Click "New +"
Select **"Web Service"**

### 3. Connect GitHub
- Choose: `minerprices/miner-prices`
- Click "Connect"

### 4. Configure Service

Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `miner-prices-upload` |
| **Environment** | Node |
| **Region** | Any |
| **Branch** | master |
| **Build Command** | Leave empty |
| **Start Command** | `node app.js` |
| **Plan** | Free |

### 5. Advanced Settings

Under "Advanced":
- **Root Directory:** `upload-server`
- **Auto-deploy:** Yes

### 6. Click "Create Web Service"

Wait 2-3 minutes for deployment...

### 7. Get Your URL

Once deployed, Render shows:
```
https://miner-prices-upload.onrender.com
```

Copy this URL.

---

## DONE ✅

Share this URL with anyone:
```
https://miner-prices-upload.onrender.com
```

They can upload images immediately.

---

## What They'll See

1. Open the URL
2. See "📸 Miner Prices Image Upload"
3. Click "Choose Image"
4. Select a file
5. Click "Upload Image"
6. Image appears in gallery below
7. Can delete anytime

---

## If You Have Render API Key

I can automate this. Just provide your Render API key and I'll deploy it in 10 seconds.

Otherwise, follow steps 1-7 above (5 minutes total).

---

**The code is ready. Just need to click "Create" on Render.**
