# Miner Prices API Reference

Base URL: `http://localhost:5000/api` (development)

## Authentication

All endpoints requiring authentication use JWT Bearer tokens.

**Header:**
```
Authorization: Bearer <token>
```

**Token Lifetime:** 7 days

Get token from login response, store in `localStorage` with key `token`.

---

## Public Endpoints (No Auth Required)

### Miners

#### GET /miners
List all active miners with filtering.

**Query Parameters:**
- `algorithm` (string) - Filter by algorithm (e.g., SHA256, Scrypt)
- `search` (string) - Search by name

**Response:**
```json
{
  "miners": [
    {
      "id": 1,
      "whattomine_id": 12345,
      "name": "Antminer S19 Pro",
      "algorithm": "SHA256",
      "power_consumption": 1450,
      "price": 8500,
      "manufacturer": "Bitmain",
      "description": "Latest SHA256 miner",
      "image_url": "https://...",
      "specs": { "hashrate": "110 TH/s", "efficiency": "13.2 W/TH" },
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 5
}
```

**Example:**
```bash
curl "http://localhost:5000/api/miners?algorithm=SHA256&search=Antminer"
```

---

#### GET /miners/:id
Get details for a specific miner.

**Response:**
```json
{
  "id": 1,
  "name": "Antminer S19 Pro",
  ...
}
```

**Example:**
```bash
curl http://localhost:5000/api/miners/1
```

---

#### GET /miners/:id/profitability
Get profitability analysis at all active hosting locations.

**Response:**
```json
{
  "miner": {
    "id": 1,
    "name": "Antminer S19 Pro",
    "powerConsumption": 1450
  },
  "profitability": [
    {
      "location": {
        "id": 1,
        "name": "Iceland Datacenter",
        "city": "Reykjavik",
        "country": "Iceland"
      },
      "dailyEnergyCost": 12.50,
      "monthlyHostingCost": 375,
      "monthlySetupAllocation": 41.67,
      "totalMonthlyCost": 416.67
    }
  ]
}
```

---

#### GET /miners/api/algorithms
Get list of available algorithms.

**Response:**
```json
{
  "algorithms": ["SHA256", "Scrypt", "Ethash", "KawPow", ...]
}
```

---

### Locations

#### GET /locations
List all approved hosting locations.

**Query Parameters:**
- `country` (string) - Filter by country
- `algorithm` (string) - Future: Filter by supported algorithm

**Response:**
```json
{
  "locations": [
    {
      "id": 1,
      "vendor_id": 1,
      "company_name": "Ice Mining",
      "name": "Iceland Datacenter",
      "city": "Reykjavik",
      "country": "Iceland",
      "cooling_type": "Immersion",
      "power_cost_per_kwh": 0.035,
      "hosting_fee_per_kwh": 0.045,
      "setup_fee": 500,
      "bandwidth_included_mbps": 100,
      "available_power_kw": 1000,
      "description": "Premium immersion cooling facility",
      "contact_email": "sales@icemining.com",
      "contact_phone": "+354 555 1234",
      "website": "https://icemining.com",
      "is_active": true,
      "created_at": "2024-01-10T15:30:00Z"
    }
  ],
  "count": 1
}
```

**Example:**
```bash
curl "http://localhost:5000/api/locations?country=Iceland"
```

---

#### GET /locations/:id
Get details for a specific hosting location.

**Response:**
```json
{
  "id": 1,
  "company_name": "Ice Mining",
  "name": "Iceland Datacenter",
  ...
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new vendor account.

**Request:**
```json
{
  "email": "admin@miningco.com",
  "password": "SecurePass123!",
  "companyName": "Mining Co",
  "contactName": "John Doe",
  "contactPhone": "+1 555 123 4567",
  "website": "https://miningco.com",
  "preApproved": false
}
```

**Response:** (201 Created)
```json
{
  "message": "Registration successful. Awaiting admin approval.",
  "vendor": {
    "id": 5,
    "email": "admin@miningco.com",
    "companyName": "Mining Co",
    "approved": false,
    "preApproved": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Notes:**
- Vendor starts with `approved: false` (requires admin approval)
- Confirmation email sent to provided address
- Token valid for 7 days

---

### POST /auth/login
Login with vendor or admin account.

**Request:**
```json
{
  "email": "admin@miningco.com",
  "password": "SecurePass123!"
}
```

**Response:** (200 OK)
```json
{
  "message": "Login successful",
  "vendor": {
    "id": 5,
    "email": "admin@miningco.com",
    "companyName": "Mining Co"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- 401 - Invalid email/password
- 403 - Account pending admin approval

---

### POST /auth/forgot-password
Request password reset link.

**Request:**
```json
{
  "email": "admin@miningco.com"
}
```

**Response:** (200 OK)
```json
{
  "message": "If email exists, reset link has been sent"
}
```

**Notes:**
- Always returns success (for security)
- Email contains reset link valid for 24 hours
- Link format: `{FRONTEND_URL}/reset-password?token=...`

---

### POST /auth/reset-password
Reset password with reset token.

**Request:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "NewSecurePass456!"
}
```

**Response:** (200 OK)
```json
{
  "message": "Password reset successfully"
}
```

**Errors:**
- 400 - Invalid or expired token

---

## Vendor Endpoints (Requires Auth)

### GET /locations/vendor/me
Get all locations for authenticated vendor.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "locations": [
    { "id": 1, "name": "Iceland DC", ... },
    { "id": 2, "name": "Texas DC", ... }
  ],
  "count": 2
}
```

---

### POST /locations
Create new hosting location.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "New Mining Facility",
  "city": "Austin",
  "country": "USA",
  "coolingType": "Air-cooled",
  "powerCostPerKwh": 0.040,
  "hostingFeePerKwh": 0.050,
  "setupFee": 1000,
  "bandwidthIncludedMbps": 200,
  "availablePowerKw": 2000,
  "description": "Large-scale air-cooled facility in Texas",
  "contactEmail": "sales@miningfacility.com",
  "contactPhone": "+1 512 555 1234",
  "website": "https://miningfacility.com"
}
```

**Response:** (201 Created)
```json
{
  "message": "Location created successfully",
  "location": {
    "id": 3,
    "vendor_id": 5,
    "name": "New Mining Facility",
    ...
  }
}
```

---

### PUT /locations/:id
Update location details.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:** (all fields optional)
```json
{
  "name": "Updated Name",
  "hostingFeePerKwh": 0.048,
  "description": "Updated description",
  "isActive": true
}
```

**Response:**
```json
{
  "message": "Location updated successfully",
  "location": { ... }
}
```

**Notes:**
- Only vendor owner can update
- Returns 403 if not owner

---

### DELETE /locations/:id
Delete (soft delete) location.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** (200 OK)
```json
{
  "message": "Location deleted successfully"
}
```

**Notes:**
- Sets `is_active = false` (soft delete)
- Not shown in public listings
- Can be restored by setting `is_active = true`

---

## Admin Endpoints (Requires Admin Auth)

### GET /admin/vendors/pending
Get vendors awaiting approval.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "vendors": [
    {
      "id": 5,
      "email": "admin@miningco.com",
      "company_name": "Mining Co",
      "contact_name": "John Doe",
      "contact_phone": "+1 555 123 4567",
      "website": "https://miningco.com",
      "approved": false,
      "pre_approved": false,
      "locations_count": 0,
      "created_at": "2024-01-20T10:30:00Z"
    }
  ],
  "count": 1
}
```

---

### GET /admin/vendors
Get all vendors (approved and pending).

**Response:**
```json
{
  "vendors": [
    {
      "id": 1,
      "company_name": "Ice Mining",
      "approved": true,
      "locations_count": 3,
      ...
    },
    {
      "id": 5,
      "company_name": "Mining Co",
      "approved": false,
      "locations_count": 0,
      ...
    }
  ],
  "count": 2
}
```

---

### POST /admin/vendors/:vendorId/approve
Approve vendor account.

**Request:**
```json
{
  "reason": "Good reputation, established company"
}
```

**Response:**
```json
{
  "message": "Vendor approved successfully",
  "vendor": {
    "id": 5,
    "email": "admin@miningco.com",
    "company_name": "Mining Co"
  }
}
```

**Side Effects:**
- Sets `vendors.approved = true`
- Sends approval email to vendor
- Logs action in `approvals` table

---

### POST /admin/vendors/:vendorId/reject
Reject vendor account.

**Request:**
```json
{
  "reason": "Incomplete documentation"
}
```

**Response:**
```json
{
  "message": "Vendor rejected",
  "vendor": { ... }
}
```

**Side Effects:**
- Keeps `vendors.approved = false`
- Sends rejection email with reason
- Logs action in `approvals` table

---

### GET /admin/stats
Get platform statistics.

**Response:**
```json
{
  "vendors": {
    "total": 10,
    "approved": 7
  },
  "miners": {
    "total": 2500,
    "algorithms": 15
  },
  "locations": {
    "total": 45
  }
}
```

---

### GET /admin/sync-logs
Get WhattoMine sync history.

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "sync_type": "whattomine",
      "miners_added": 42,
      "miners_updated": 156,
      "miners_total": 2156,
      "status": "success",
      "error_message": null,
      "created_at": "2024-01-20T02:00:00Z"
    },
    {
      "id": 2,
      "sync_type": "whattomine",
      "miners_added": 0,
      "miners_updated": 12,
      "miners_total": 2156,
      "status": "success",
      "error_message": null,
      "created_at": "2024-01-21T02:00:00Z"
    }
  ],
  "count": 2
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Status Codes:**

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET request successful |
| 201 | Created | POST created new resource |
| 400 | Bad Request | Missing required field |
| 401 | Unauthorized | Token missing or invalid |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Email already registered |
| 500 | Server Error | Database connection failed |

---

## Example Workflows

### Register & List Locations

```bash
# 1. Register vendor
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","companyName":"Test"}' \
  | jq -r '.token')

# 2. Create location
curl -X POST http://localhost:5000/api/locations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"DC1","city":"NYC","country":"USA","hostingFeePerKwh":0.05}'

# 3. View locations
curl http://localhost:5000/api/locations
```

### Admin Approve Vendor

```bash
# 1. Admin login
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@minerprices.com","password":"admin123"}' \
  | jq -r '.token')

# 2. Get pending vendors
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:5000/api/admin/vendors/pending

# 3. Approve vendor (ID = 5)
curl -X POST http://localhost:5000/api/admin/vendors/5/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Verified company"}'
```

---

## Rate Limiting

Currently no rate limiting. Consider adding for production:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Testing with Postman

1. Create collection: "Miner Prices"
2. Set `base_url` variable: `http://localhost:5000/api`
3. Set `token` variable (from login response)
4. Use in headers: `Authorization: Bearer {{token}}`

**Sample request:**
```
GET {{base_url}}/miners
```

---

## Pagination (Future Enhancement)

For production, add pagination:

```json
GET /miners?page=1&limit=20

Response:
{
  "miners": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2500,
    "pages": 125
  }
}
```

---

## CORS Configuration

For production frontend on different domain:

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://minerprices.com',
  credentials: true
}));
```

---

## Questions?

See `README.md` for detailed documentation and troubleshooting.
