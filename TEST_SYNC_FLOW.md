# Testing the Complete Miner Sync Flow

## Step 1: Login as Admin
- Go to: https://minerprices.com/admin/login
- Email: `admin@minerprices.com`
- Password: `admin123`

## Step 2: Navigate to Sync Dashboard
- Click "🔄 Sync" in the navigation menu
- Or go directly to: https://minerprices.com/admin/sync

## Step 3: Click "Sync Now"
- The button will show "⏳ Syncing..."
- Watch the status message appear
- Should say: "✅ Success! Synced X miners and updated prices"

## Step 4: Verify Data in Database
The sync will:
1. ✅ Fetch all ASIC miners from WhattoMine API
2. ✅ Enrich with OneMiners metadata (images, videos, firmware, apps)
3. ✅ Update coin prices from CoinGecko
4. ✅ Log the sync event

## Step 5: Check Sync History
- Scroll down on `/admin/sync` page
- See last 10 syncs with timestamps and miner counts

## Step 6: View Enhanced Miner Data
- Go to: https://minerprices.com/miners
- Click on a miner detail
- Should now show:
  - Product image
  - Cooling type badge
  - Tutorial video (embed option)
  - Links: PDF guide, firmware, apps
  - Manufacturer info
  - Specs & efficiency

---

## What Gets Synced

### From WhattoMine API
- Name
- Algorithm
- Hashrate
- Power consumption
- Release date
- Efficiency

### From OneMiners Metadata
- Product images
- Cooling type (Air/Hydro/Immersion)
- YouTube tutorial video ID
- Setup guide PDF
- Firmware download link
- Control apps (2+ per miner)
- Manufacturer

### From CoinGecko API
- Bitcoin price
- Litecoin price
- Dogecoin price
- Ethereum Classic price
- Kaspa price
- Ravencoin price
- Nervos Network price
- Monero price
- 24-hour price changes

---

## Database Tables Modified

### miners
```sql
id, whattomine_id, name, algorithm, power_consumption, specs (JSON)
manufacturer, cooling_type
image_url, tutorial_video_id, tutorial_pdf_url, firmware_url
apps (JSON), is_active, created_at, updated_at
```

### sync_log
```sql
id, miners_added, status, created_at
```

### coins
```sql
id, name, symbol, current_price, price_change_24h
updated_at
```

---

## Troubleshooting

### Issue: "Failed to load data" on Admin Dashboard
**Solution:** 
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Log out and back in

### Issue: Sync button doesn't work
**Solution:**
- Check browser console (F12) for errors
- Verify token is set in localStorage
- Try the direct API endpoint:
  ```bash
  curl -X POST https://miner-prices.onrender.com/api/admin/sync-comprehensive \
    -H "Authorization: Bearer YOUR_TOKEN"
  ```

### Issue: No miners showing after sync
**Solution:**
- WhattoMine API might be rate limited
- Check server logs: `opencloud logs`
- Try manual sync again after 1 minute

---

## Next Steps

1. ✅ Test sync button works
2. ✅ Verify miners appear in database
3. ✅ Build enhanced miner detail page display
4. ✅ Add image gallery
5. ✅ Embed YouTube videos
6. ✅ Add download links

