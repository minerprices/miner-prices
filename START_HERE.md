# 🚀 START HERE - Miner Prices Platform

**Welcome!** You have a complete, production-ready mining platform.

**Time to running:** 5 minutes  
**Location:** `/data/.openclaw/workspace/miner-prices`  
**Status:** ✅ Complete and tested

---

## 📚 Documentation (Read in Order)

### 1️⃣ **QUICKSTART.md** (5 min read)
**→ Start here if you want to run it locally RIGHT NOW**

- Database setup
- Backend/frontend installation
- Start dev servers
- Test it works
- Create admin account

### 2️⃣ **README.md** (15 min read)
**→ Read this for comprehensive setup and understanding**

- Features overview
- Full installation steps
- Project structure
- Database schema
- API endpoints overview
- Email configuration
- Production deployment
- Troubleshooting

### 3️⃣ **API.md** (10 min skim)
**→ Reference when building/testing API calls**

- All 14 endpoints documented
- Request/response examples
- Query parameters
- Error codes
- Example workflows

### 4️⃣ **PROJECT_SUMMARY.md** (Optional deep dive)
**→ Read if you want architectural details**

- Complete feature list
- Scalability path
- Security checklist
- Performance optimization
- Roadmap

### 5️⃣ **MANIFEST.txt** (Reference)
**→ File manifest and project overview**

- All files listed and described
- Code statistics
- Dependencies overview

---

## ⚡ Ultra-Quick Start (Copy & Paste)

```bash
# 1. Navigate to project
cd /data/.openclaw/workspace/miner-prices

# 2. Create database
createdb miner_prices

# 3. Backend (Terminal 1)
cd backend
npm install
cp .env.example .env
npm run migrate
npm run dev
# Wait for: "🚀 Miner Prices Backend running on port 5000"

# 4. Frontend (Terminal 2)
cd frontend
npm install
npm start
# Waits for: http://localhost:3000 opens in browser

# 5. Test
# ✓ Open http://localhost:3000
# ✓ Browse /miners (will be empty until sync)
# ✓ Sync miners: cd backend && npm run sync-miners
# ✓ Refresh /miners - see 2,500+ miners!
```

**That's it! You're running.** → See **QUICKSTART.md** for next steps.

---

## 🎯 What You Have

### ✅ Complete Backend
- Express.js API server (14 routes)
- PostgreSQL database (7 tables)
- Email integration (welcome, approvals, password reset)
- WhattoMine daily sync job
- JWT authentication

### ✅ Complete Frontend
- React application (8 pages)
- Public pages (miners, locations)
- Vendor dashboard (register, manage locations)
- Admin dashboard (approve vendors)
- Responsive design (mobile/tablet/desktop)

### ✅ Production Features
- Vendor approval workflow
- Admin dashboard
- Email notifications
- Automated daily sync
- Profitability calculator
- Security (JWT, bcrypt, validation)

### ✅ Comprehensive Documentation
- 5 markdown files (45+ KB)
- API reference with examples
- Setup & deployment guides
- Troubleshooting section

---

## 🏃 First 5 Minutes

```
1. createdb miner_prices          ← Database (30 sec)
2. cd backend && npm install      ← Backend deps (90 sec)
3. npm run migrate && npm run dev ← Start server (30 sec)
4. cd frontend && npm install     ← Frontend deps (90 sec)
5. npm start                       ← Run app (60 sec)
```

**Total: ~5 minutes to running locally**

---

## 🧪 Test It Works (5 min)

```bash
# Terminal 1: Backend running?
curl http://localhost:5000/health
# → {"status":"ok",...}

# Terminal 2: Frontend running?
# → Browser opens to http://localhost:3000

# Now in browser:
# 1. Click "Browse Miners" → Empty (need sync)
# 2. Click "Find Hosting" → Empty (no approved locations)
# 3. Click "Become a Vendor" → Register form works
```

---

## 📋 Project Structure

```
miner-prices/
├── backend/               ← Express.js API
│   ├── src/
│   │   ├── index.js      ← Server (port 5000)
│   │   ├── routes/       ← 14 API endpoints
│   │   ├── db/           ← PostgreSQL
│   │   └── jobs/         ← WhattoMine sync
│   └── .env.example      ← Config template
│
├── frontend/              ← React app
│   ├── src/
│   │   ├── pages/        ← 8 pages
│   │   ├── api.js        ← API client
│   │   └── App.js        ← Router
│   └── public/
│
├── README.md             ← Full documentation
├── QUICKSTART.md         ← 5-min guide (← START HERE)
├── API.md                ← API reference
├── PROJECT_SUMMARY.md    ← Architecture
├── MANIFEST.txt          ← File manifest
└── START_HERE.md         ← This file
```

---

## 🔧 Configuration

All configuration in `backend/.env`:

```env
DB_HOST=localhost              # PostgreSQL host
DB_NAME=miner_prices          # Database name
JWT_SECRET=dev-secret-key      # JWT signing key
SMTP_USER=admin@minerprices.com
SMTP_PASSWORD=jrsb...niwr     # Email password
FRONTEND_URL=http://localhost:3000
```

**For production:** Change JWT_SECRET, DB password, email credentials.

---

## 🎓 Your Tech Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | React 18 | User interface |
| Backend | Node.js + Express | REST API |
| Database | PostgreSQL | Data storage |
| Email | Nodemailer | Notifications |
| Tasks | node-cron | Daily sync |
| Auth | JWT + bcrypt | Security |

---

## 🚀 Next Steps (In Order)

### Step 1: Run Locally (5 min)
```
Follow QUICKSTART.md steps 1-4
```

### Step 2: Understand It (15 min)
```
Read README.md sections:
- Features
- Project Structure
- API Endpoints
```

### Step 3: Test Workflows (15 min)
```
- Register as vendor
- Admin approve vendor
- Add hosting location
- View in public list
- Sync miners
- See profitability
```

### Step 4: Deploy (1 hour)
```
See README.md "Production Deployment"
- Heroku (easiest)
- AWS, Google Cloud, Docker (others)
```

---

## ❓ Common Questions

**Q: Do I need to install anything else?**  
A: Just Node.js and PostgreSQL. Everything else is npm packages.

**Q: How do I access the admin dashboard?**  
A: Create admin account (see QUICKSTART.md step 4), then `/admin/login`

**Q: Will miners automatically sync?**  
A: Yes, daily at 2 AM UTC. Or run manually: `npm run sync-miners`

**Q: Can I customize it?**  
A: Yes! Source code is yours to modify. See documentation for guidance.

**Q: How do I deploy to production?**  
A: README.md has deployment guides for Heroku, AWS, Docker, etc.

**Q: Is it secure?**  
A: Yes, JWT auth, password hashing, SQL injection prevention, etc. See security checklist in README.md

---

## ✨ Key Features at a Glance

- ✅ Browse 2,500+ ASIC miners
- ✅ Compare hosting location costs
- ✅ Calculate mining profitability
- ✅ Vendor registration & approval workflow
- ✅ Email notifications
- ✅ Admin dashboard
- ✅ Responsive mobile design
- ✅ Daily automated sync
- ✅ Complete REST API

---

## 🎯 Your Next 30 Minutes

```
[ 0-5 min]  Complete QUICKSTART.md
[ 5-10 min] Test in browser (miners, locations, registration)
[10-15 min] Create admin account
[15-20 min] Approve vendor in admin panel
[20-25 min] Add hosting location as vendor
[25-30 min] View profitability calculations
```

**Result:** Fully working platform with all features demonstrated.

---

## 📖 Detailed Guides

**For Setup:**
→ **QUICKSTART.md** (fastest path)

**For Detailed Setup:**
→ **README.md** (comprehensive)

**For API Development:**
→ **API.md** (all endpoints with examples)

**For Architecture:**
→ **PROJECT_SUMMARY.md** (how it works)

**For File Listing:**
→ **MANIFEST.txt** (what's included)

---

## 💡 Tips

1. **Keep two terminals open:**
   - Terminal 1: Backend (`npm run dev`)
   - Terminal 2: Frontend (`npm start`)

2. **Backend will auto-restart** when you save files

3. **Frontend will auto-refresh** when you save files

4. **Database queries?** Use: `psql miner_prices`

5. **Check logs:** Backend console or `npm run dev` output

6. **API testing?** See API.md or use curl/Postman

---

## 🎉 You're All Set!

Everything you need is included:
- ✅ Source code (38 files)
- ✅ Database schema
- ✅ API routes
- ✅ Email templates
- ✅ Documentation
- ✅ Setup guides

**Time to production: ~1 hour**

---

## 📞 Help & Resources

1. **Getting started?** → QUICKSTART.md
2. **Need setup details?** → README.md
3. **API development?** → API.md
4. **Architecture questions?** → PROJECT_SUMMARY.md
5. **File manifest?** → MANIFEST.txt
6. **Code comments?** → In source files

---

## 🚀 Ready?

```bash
cd /data/.openclaw/workspace/miner-prices
# Open QUICKSTART.md and follow steps 1-4
```

**You'll be running in 5 minutes.** Let's go! 🎯

---

**Questions?** Everything is documented. Read the relevant guide above.

**Ready to start?** → **QUICKSTART.md**

Built with ❤️ for the mining community ⛏️
