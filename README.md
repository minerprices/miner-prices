# Miner Prices - ASIC Mining Platform

A full-stack web platform connecting cryptocurrency miners with hosting providers. Browse ASIC miners, compare hosting locations, and calculate profitability.

**Live Demo:** (Configure in production)
**Admin Email:** admin@minerprices.com

## Features

### 🛠️ Core Features
- **ASIC Miner Database**: Real-time miner listings synced from WhattoMine API
- **Hosting Locations**: Vendors can list mining hosting locations with pricing
- **Profitability Calculator**: Compare hosting costs across locations for specific miners
- **Vendor System**: Email/password authentication with admin approval workflow
- **Admin Dashboard**: Approve/reject vendors, manage platform, view analytics
- **Daily Sync**: Automated daily miner sync from WhattoMine

### 🔐 Security
- JWT-based authentication
- Password hashing with bcrypt
- Email verification for account recovery
- Role-based access control (vendor/admin)

### 📱 Responsive Design
- Mobile-first UI design
- Works on desktop, tablet, and mobile

## Tech Stack

### Backend
- **Node.js + Express** - REST API server
- **PostgreSQL** - Database
- **Nodemailer** - Email service
- **node-cron** - Scheduled tasks
- **bcryptjs** - Password hashing
- **JWT** - Authentication tokens

### Frontend
- **React 18** - UI library
- **React Router v6** - Navigation
- **Axios** - API client
- **CSS3** - Styling

## Project Structure

```
miner-prices/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql         # PostgreSQL schema
│   │   │   ├── db.js              # Database connection pool
│   │   │   └── migrate.js         # Migration runner
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.js            # Auth endpoints
│   │   │   ├── miners.js          # Miners endpoints
│   │   │   ├── locations.js       # Locations endpoints
│   │   │   └── admin.js           # Admin endpoints
│   │   ├── utils/
│   │   │   ├── auth.js            # Auth utilities
│   │   │   └── email.js           # Email templates
│   │   ├── jobs/
│   │   │   └── syncMiners.js      # WhattoMine sync job
│   │   └── index.js               # Server entry point
│   ├── .env.example               # Environment variables template
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Navigation.js       # Navbar component
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Miners.js
│   │   │   ├── Locations.js
│   │   │   ├── VendorLogin.js
│   │   │   ├── VendorRegister.js
│   │   │   ├── VendorDashboard.js
│   │   │   ├── AdminLogin.js
│   │   │   └── AdminDashboard.js
│   │   ├── api.js                 # API client
│   │   ├── App.js                 # Router & layouts
│   │   └── index.js
│   └── package.json
└── README.md
```

## Database Schema

### Tables
- **vendors** - Hosting provider accounts
- **miners** - ASIC miner database (synced from WhattoMine)
- **locations** - Hosting facility locations
- **approvals** - Admin approval audit log
- **sync_log** - WhattoMine sync history
- **password_resets** - Password reset tokens
- **admins** - Admin accounts

## Installation & Setup

### Prerequisites
- Node.js v16+ 
- PostgreSQL 12+
- npm or yarn

### 1. Clone & Install Dependencies

```bash
cd miner-prices

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup

```bash
cd backend

# Create PostgreSQL database
createdb miner_prices

# Run migrations
npm run migrate
```

### 3. Environment Configuration

**Backend** - Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=miner_prices
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Email (Gmail SMTP example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=admin@minerprices.com
SMTP_PASSWORD=jrsb hqda wyyz niwr  # Gmail app-specific password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# WhattoMine API
WHATTOMINE_API_BASE=https://whattomine.com
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend runs on `http://localhost:3000`

### 5. Create Admin Account

Use the backend database directly:

```bash
psql miner_prices -c "
INSERT INTO admins (email, password_hash, name, role)
VALUES ('admin@minerprices.com', '\$2a\$10\$...', 'Admin', 'admin');
"
```

Or create via Node.js script to hash password:

```javascript
const { hashPassword } = require('./src/utils/auth');

(async () => {
  const hash = await hashPassword('admin123');
  console.log(hash);
  // Use in INSERT query
})();
```

### 6. Initial Miner Sync

```bash
# Manual sync
cd backend
npm run sync-miners

# Or it will run automatically at 2 AM UTC daily
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Vendor registration
- `POST /api/auth/login` - Login (vendor/admin)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Miners (Public)
- `GET /api/miners` - List miners (filters: algorithm, search)
- `GET /api/miners/:id` - Get miner details
- `GET /api/miners/:id/profitability` - Profitability at different locations
- `GET /api/miners/api/algorithms` - Available algorithms

### Locations (Public)
- `GET /api/locations` - List approved locations
- `GET /api/locations/:id` - Location details
- `GET /api/locations/vendor/me` - My locations (requires auth)
- `POST /api/locations` - Create location (vendor auth)
- `PUT /api/locations/:id` - Update location (vendor auth)
- `DELETE /api/locations/:id` - Delete location (vendor auth)

### Admin Only
- `GET /api/admin/vendors/pending` - Pending vendor approvals
- `GET /api/admin/vendors` - All vendors
- `POST /api/admin/vendors/:id/approve` - Approve vendor
- `POST /api/admin/vendors/:id/reject` - Reject vendor
- `GET /api/admin/sync-logs` - WhattoMine sync history
- `GET /api/admin/stats` - Platform statistics

## Workflows

### Vendor Onboarding
1. Vendor registers at `/vendor/register`
2. Account created in `pre_approved` state (pending admin review)
3. Admin receives email notification
4. Admin approves/rejects in `/admin/dashboard`
5. Vendor notified via email
6. Approved vendors can log in and add locations

### Miner Profitability Calculation
1. User selects a miner
2. System fetches all active locations
3. Calculates: Daily energy cost = (Power / 1000) × 24 × Hosting Rate
4. Displays cheapest locations first
5. User can contact vendors for mining deals

### Daily WhattoMine Sync
- Runs automatically at 2 AM UTC
- Fetches latest miners and algorithms
- Updates/inserts into `miners` table
- Logs results in `sync_log`
- Can be run manually: `npm run sync-miners`

## Email Configuration

### Gmail Setup (Recommended)
1. Enable 2FA on Gmail account
2. Generate app-specific password: https://myaccount.google.com/apppasswords
3. Use app password in `.env` `SMTP_PASSWORD`

### Other SMTP Providers
- SendGrid, AWS SES, Mailgun, etc.
- Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` in `.env`

## Production Deployment

### Heroku Example
```bash
# Create app
heroku create miner-prices

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set JWT_SECRET=your-production-secret
heroku config:set SMTP_PASSWORD=your-email-password
# ... (set all env vars)

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app

# Install backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Build frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci && npm run build

CMD ["node", "backend/src/index.js"]
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_NAME` | miner_prices | Database name |
| `DB_USER` | postgres | Database user |
| `DB_PASSWORD` | - | Database password |
| `PORT` | 5000 | API server port |
| `NODE_ENV` | development | Environment |
| `JWT_SECRET` | - | JWT signing key |
| `SMTP_HOST` | - | Email provider host |
| `SMTP_PORT` | 587 | Email provider port |
| `SMTP_USER` | - | Email account |
| `SMTP_PASSWORD` | - | Email password |
| `SMTP_FROM` | noreply@minerprices.com | From address |
| `FRONTEND_URL` | http://localhost:3000 | Frontend URL for email links |
| `WHATTOMINE_API_BASE` | https://whattomine.com | WhattoMine API base |

## Common Issues & Solutions

### Database Connection Error
```
Error: getaddrinfo ENOTFOUND localhost
```
- Ensure PostgreSQL is running: `psql -l`
- Check `.env` credentials match your setup

### Miner Sync Fails
```
Error: Cannot read property 'miners' of undefined
```
- WhattoMine API structure may have changed
- Check API response at `https://whattomine.com/api/v1/coins.json`

### Email Not Sending
- Check SMTP credentials in `.env`
- Verify SMTP port (usually 587 for TLS, 465 for SSL)
- Gmail: Use app-specific password, not account password
- Check email logs: `SELECT * FROM postgres.logs WHERE error LIKE '%mail%'`

### Token Expired
- JWT expires in 7 days by default
- Adjust in `generateToken()` function
- User must log in again to get new token

## Testing Accounts

### Vendor Account
```
Email: test@vendor.com
Password: Test123456!
```

### Admin Account
```
Email: admin@minerprices.com
Password: (set during setup)
```

## Performance Optimization

### Database Indexes
- Vendors: `approved`, `pre_approved`
- Miners: `algorithm`, `is_active`
- Locations: `vendor_id`, `is_active`
- All created in schema.sql

### Caching Strategy
1. Frontend: Cache miner list in localStorage
2. Backend: Add Redis for frequently accessed data
3. API: Add ETag headers for conditional requests

### Load Testing
```bash
# Install ab (Apache Bench)
ab -n 1000 -c 10 http://localhost:5000/api/miners
```

## Security Checklist

- [ ] Change `JWT_SECRET` in production
- [ ] Use HTTPS (SSL certificate)
- [ ] Enable CORS only for your frontend domain
- [ ] Implement rate limiting on API endpoints
- [ ] Sanitize all user inputs (already in code with validation)
- [ ] Use parameterized queries (already implemented)
- [ ] Set strong database passwords
- [ ] Enable password reset token expiration (24 hours)
- [ ] Log all admin actions to audit trail
- [ ] Backup database regularly

## Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

- Issues: GitHub Issues
- Email: admin@minerprices.com
- Docs: /docs folder

---

**Built with ❤️ for the mining community**
