# Comprehensive Miner Sync Implementation Plan

## Phase 1: Data Collection & Storage ✅ IN PROGRESS
- [x] WhattoMine API integration (ASIC endpoint)
- [x] Database schema updates (image_url, cooling_type, links, etc.)
- [x] CoinGecko price integration
- [ ] OneMiriers scraper (tutorials, firmware, apps links)
- [ ] YouTube video finder (oneminers channel)

## Phase 2: Admin Controls
- [ ] Sync button on admin dashboard
- [ ] Manual refresh endpoint
- [ ] Daily cron job (via /admin/sync-comprehensive)
- [ ] Sync history view

## Phase 3: Frontend Display
- [ ] Enhanced miner detail pages with:
  - Image gallery
  - Cooling type badge
  - Tutorial video embed
  - Links: PDF, firmware, apps
  - Release date
  - Manufacturer

## Phase 4: Automation
- [ ] Daily scheduled sync (Node cron)
- [ ] Price updates (hourly)

---

## Data Structure

### Miners Table Columns
```sql
- id, whattomine_id, name, algorithm, power_consumption, specs
- manufacturer (Bitmain, MicroBT, Canaan, etc.)
- cooling_type (Air, Hydro, Immersion)
- image_url (from OneMiriers)
- tutorial_video_id (YouTube ID)
- tutorial_pdf_url
- firmware_url
- apps (JSON: [{ name, url }])
- is_active, created_at, updated_at
```

### Endpoints
- `POST /api/admin/sync-comprehensive` - Full sync (miners + prices)
- `GET /api/admin/sync-logs` - View sync history
- `GET /api/miners/:id` - Enhanced detail with all metadata

---

## Next Immediate Steps
1. Add sync button to admin dashboard
2. Create OneMiriers metadata JSON
3. Build miner detail page enhancements
4. Test full sync flow
