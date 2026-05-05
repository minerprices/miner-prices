# Quick Start Guide - 5 Minutes to Running

## Prerequisites Check
```bash
node --version  # Should be v16 or higher
npm --version
psql --version
```

## Step 1: Database (1 min)

```bash
# Create database
createdb miner_prices

# Verify
psql -l | grep miner_prices
```

## Step 2: Backend Setup (2 min)

```bash
cd backend
npm install

# Create .env file
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_NAME=miner_prices
DB_USER=postgres
DB_PASSWORD=postgres
PORT=5000
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-in-production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=admin@minerprices.com
SMTP_PASSWORD=jrsb hqda wyyz niwr
SMTP_FROM=admin@minerprices.com
FRONTEND_URL=http://localhost:3000
WHATTOMINE_API_BASE=https://whattomine.com
EOF

# Create database schema
npm run migrate

# Start server
npm run dev
```

Server running on `http://localhost:5000/health` ✅

## Step 3: Frontend Setup (2 min)

In **another terminal**:

```bash
cd frontend
npm install
npm start
```

App running on `http://localhost:3000` ✅

## Step 4: Test It

### 1. Browse Miners
- Go to `http://localhost:3000/miners`
- You'll see 0 miners (need to sync first)

### 2. Sync Miners from WhattoMine

In **third terminal**:
```bash
cd backend
npm run sync-miners
```

Returns:
```
🔄 Starting WhattoMine sync...
✅ Sync completed: X added, Y updated
```

Back to browser, refresh `/miners` - now see live data! ⛏️

### 3. Register as Vendor

1. Click "Become a Vendor" or go to `/vendor/register`
2. Fill form:
   - Email: `test@mining.com`
   - Password: `Test123456`
   - Company: `Test Mining Co`
3. Register → Redirected to dashboard (pending approval)

### 4. Approve Vendor (Admin)

1. Go to `/admin/login` 
2. Login (need to create admin first - see below)
3. Tab: "Pending Vendors"
4. Click "Approve"
5. Vendor gets email notification ✉️

### 5. Create Admin Account (One-time)

```bash
# In backend folder, create temp script
cat > create-admin.js << 'EOF'
const db = require('./src/db/db');
const { hashPassword } = require('./src/utils/auth');

(async () => {
  try {
    const hash = await hashPassword('admin123');
    const result = await db.query(
      'INSERT INTO admins (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
      ['admin@minerprices.com', hash, 'Platform Admin']
    );
    console.log('✅ Admin created:', result.rows[0].email);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
EOF

# Run it
node create-admin.js

# Output: ✅ Admin created: admin@minerprices.com
```

Now login at `/admin/login` with:
- Email: `admin@minerprices.com`
- Password: `admin123`

### 6. Add Hosting Location

1. Login as vendor: `test@mining.com` / `Test123456`
2. Go to `/vendor/dashboard`
3. Click "+ Add Hosting Location"
4. Fill:
   - Name: "Iceland Datacenter"
   - City: "Reykjavik"
   - Country: "Iceland"
   - Rate: "0.0450" ($/kWh)
   - Setup Fee: "500"
5. Create → Shows in locations list

### 7. View on Public Listings

1. Go to `/locations`
2. See your location listed (if approved vendor)
3. Miners can compare costs here

## Next Steps

### For Production
```bash
# Build frontend for deployment
cd frontend
npm run build
# Creates build/ folder for deployment

# Add HTTPS, reverse proxy (nginx), CDN, etc.
```

### To Customize

**Colors/Branding:**
- Edit `frontend/src/App.css`
- Update navbar brand in `Navigation.js`

**Add More Fields:**
- Edit `backend/src/db/schema.sql`
- Add migration script
- Update API endpoints
- Update React forms

**Email Templates:**
- Edit `backend/src/utils/email.js`
- Change HTML templates

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  React Frontend (3000)                   │
│  [Home] [Miners] [Locations] [Vendor] [Admin] Dashboards │
└─────────────────┬─────────────────────────────────────┘
                  │ AXIOS
┌─────────────────▼──────────────────────────────────────┐
│           Express Backend API (5000)                     │
│  JWT Auth │ Miners │ Locations │ Admin │ Email          │
└─────────────────┬─────────────────────────────────────┘
                  │
        ┌─────────┼─────────┐
        │                   │
   ┌────▼────┐      ┌──────▼──────┐
   │PostgreSQL│      │Nodemailer   │
   │Database  │      │(SMTP)       │
   └──────────┘      └─────────────┘
        │
   ┌────▼────────┐
   │ sync job    │
   │ (WhattoMine)│
   └─────────────┘
```

## File Structure at a Glance

```
miner-prices/
├── backend/          ← Node.js API
│  ├── src/
│  │  ├── index.js    ← Start here (npm run dev)
│  │  ├── db/         ← Database
│  │  ├── routes/     ← API endpoints
│  │  ├── jobs/       ← Miner sync
│  │  └── utils/      ← Helpers
│  └── .env           ← Config
│
└── frontend/         ← React app
   ├── src/
   │  ├── App.js      ← Main router
   │  ├── pages/      ← Route pages
   │  ├── api.js      ← Backend client
   │  └── App.css     ← Styling
   └── package.json
```

## Debugging

### Backend Won't Start?
```bash
# Check if port 5000 in use
lsof -i :5000
# Kill process if needed
kill -9 <PID>

# Check database
psql miner_prices
# See schema
\dt
```

### Miner Sync Fails?
```bash
# Check WhattoMine API manually
curl https://whattomine.com/api/v1/coins.json | head -100

# Check logs
npm run sync-miners 2>&1 | tail -20
```

### Email Not Working?
- Gmail: Check you used app-specific password (not account password)
- Check inbox for errors (may be in spam)
- Test SMTP directly:
```bash
telnet smtp.gmail.com 587
```

## Useful Commands

```bash
# Start dev servers (2 terminals needed)
npm run dev        # backend
npm start          # frontend

# Database
npm run migrate    # Create schema
psql miner_prices  # Connect to DB

# Sync
npm run sync-miners  # Manual WhattoMine sync

# Production
npm run build      # Build frontend
NODE_ENV=production npm start  # Start with production config
```

## API Test (curl)

```bash
# Get all miners
curl http://localhost:5000/api/miners

# Register vendor
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123456","companyName":"Test"}'

# Get locations
curl http://localhost:5000/api/locations

# Health check
curl http://localhost:5000/health
```

## What's Working

✅ Vendor registration & approval workflow
✅ ASIC miner database from WhattoMine
✅ Hosting locations with pricing
✅ Public listings page
✅ Vendor dashboard
✅ Admin approval dashboard
✅ JWT authentication
✅ Email notifications
✅ Responsive UI
✅ Profitability calculator
✅ Daily sync job

## Known Limitations

- No image uploads yet (use image_url field)
- No messaging/contact system (use email field)
- No payment processing (for future features)
- Single admin account only
- No vendor profile customization yet

## Need Help?

Check `README.md` for detailed docs, API reference, and troubleshooting.

---

**You're all set! 🚀**

Start with Step 1 and follow through. Takes ~5 minutes total.
