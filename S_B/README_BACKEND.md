# Samarthya 2026 — Backend Documentation

## Overview

This backend provides serverless API endpoints for the Samarthya 2026 website. It is built to run on **Vercel Functions** alongside the existing static frontend, with **Google Sheets** as the registration storage backend.

---

## Folder Structure

All backend files live inside `S_B/` (the Vercel root directory):

```
S_B/
├── index.html              ← Existing frontend (untouched)
├── Css/                    ← Existing stylesheets
├── Js/                     ← Existing scripts
├── Assets/                 ← Existing images/textures
├── Logos/                  ← Society logos
├── Past/                   ← Past event assets
├── Rules/                  ← Event rulebooks
│
├── api/                    ← Vercel Serverless Functions
│   ├── health.js           ← GET  /api/health
│   ├── events.js           ← GET  /api/events
│   └── register.js         ← POST /api/register
│
├── backend/                ← Shared backend modules
│   ├── config.js           ← Environment variable reader
│   ├── googleSheets.js     ← Google Sheets read/write helpers
│   ├── validators.js       ← Input validation & sanitisation
│   └── response.js         ← Standardised JSON response helpers
│
├── data/
│   └── events.sample.json  ← Event metadata (source of truth)
│
├── vercel.json             ← Vercel routing config
├── package.json            ← Node dependencies
├── .env.example            ← Environment variable template
└── README_BACKEND.md       ← This file
```

---

## Installation

```bash
cd S_B
npm install
```

This installs the only dependency: `googleapis`.

---

## Environment Variables

Create a `.env` file inside `S_B/` (or set these in Vercel Dashboard → Settings → Environment Variables):

| Variable | Description |
|---|---|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | The ID from your Google Sheets URL |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email (e.g. `xxx@project.iam.gserviceaccount.com`) |
| `GOOGLE_PRIVATE_KEY` | Full private key string from the service account JSON |
| `ADMIN_PASSWORD` | Password for future admin endpoints |
| `JWT_SECRET` | Secret key for future JWT token signing |

> **Important:** When setting `GOOGLE_PRIVATE_KEY` in Vercel, paste the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`. Use literal `\n` for newlines — the code handles the conversion.

---

## Google Sheets Setup

1. **Create a Google Cloud Project** and enable the Google Sheets API.
2. **Create a Service Account** and download the JSON credentials.
3. **Create a Google Spreadsheet** and share it with the service account email (give Editor access).
4. **Add a sheet tab** named `registrations`.
5. **Add a header row** in the `registrations` tab:

```
timestamp | eventId | eventName | participantName | usn | email | phone | college | branch | semester | teamName | teamSize | members | status
```

6. Copy the Spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
7. Set the environment variables as described above.

---

## API Endpoints

### `GET /api/health`

Health check — confirms the backend is running.

**Response:**
```json
{
  "success": true,
  "message": "Backend is running",
  "data": {
    "service": "Samarthya Backend",
    "version": "1.0.0",
    "timestamp": "2026-05-10T09:00:00.000Z"
  },
  "error": null
}
```

---

### `GET /api/events`

Returns all events from `data/events.sample.json`.

**Query params:**
- `?active=true` — return only active events.

**Response:**
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": {
    "count": 5,
    "events": [ ... ]
  },
  "error": null
}
```

---

### `POST /api/register`

Submit a registration. Validates input, checks for duplicates, and writes to Google Sheets.

**Solo registration body:**
```json
{
  "eventId": "AWK01",
  "participantName": "Ullas",
  "usn": "4XX22XX000",
  "email": "ullas@example.com",
  "phone": "9876543210",
  "college": "SSIT",
  "branch": "CSE",
  "semester": "6"
}
```

**Team registration body:**
```json
{
  "eventId": "RAG01",
  "participantName": "Ullas",
  "usn": "4XX22XX000",
  "email": "ullas@example.com",
  "phone": "9876543210",
  "college": "SSIT",
  "branch": "CSE",
  "semester": "6",
  "teamName": "Rune Breakers",
  "teamSize": 3,
  "members": [
    { "name": "Ullas", "usn": "4XX22XX000", "email": "ullas@example.com", "phone": "9876543210" },
    { "name": "Member 2", "usn": "4XX22XX001", "email": "m2@example.com", "phone": "9876543211" },
    { "name": "Member 3", "usn": "4XX22XX002", "email": "m3@example.com", "phone": "9876543212" }
  ]
}
```

**Success response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "eventId": "RAG01",
    "eventName": "Ragnarok Hackathon",
    "participantName": "Ullas",
    "teamName": "Rune Breakers"
  },
  "error": null
}
```

**Validation error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "error": {
    "code": "INVALID_INPUT",
    "details": ["email format is invalid", "phone must be a valid 10-digit Indian mobile number"]
  }
}
```

**Duplicate error (409):**
```json
{
  "success": false,
  "message": "Duplicate registration",
  "data": null,
  "error": {
    "code": "DUPLICATE",
    "details": ["This email is already registered for this event"]
  }
}
```

---

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. **Set the Root Directory to `S_B`** in Vercel project settings.
4. Add all environment variables in the Vercel dashboard.
5. Deploy.

Vercel will:
- Serve `index.html` and all static assets from `S_B/`.
- Detect `api/*.js` files and deploy them as serverless functions.
- Route requests to `/api/*` to the corresponding function.

---

## Frontend Integration

The frontend can call these endpoints using standard `fetch()`:

```javascript
// Health check
const health = await fetch('/api/health').then(r => r.json());

// Get events
const events = await fetch('/api/events?active=true').then(r => r.json());

// Register
const result = await fetch('/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(registrationData),
}).then(r => r.json());
```

No changes to the existing frontend loader, animations, 3D canvas, or theme are required.

---

## Vercel Deployment Checklist

Before deploying, confirm every item below:

### 1. Root Directory
- [ ] `S_B` is set as the **Root Directory** in Vercel project settings
- [ ] Do **NOT** use repository root — only `S_B`

### 2. Environment Variables
All of these must be set in **Vercel Dashboard → Settings → Environment Variables** for both **Preview** and **Production**:

| Variable | Required |
|---|---|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | ✅ |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | ✅ |
| `GOOGLE_PRIVATE_KEY` | ✅ |
| `ADMIN_PASSWORD` | ✅ |
| `JWT_SECRET` | ✅ |

> **Tip:** For `GOOGLE_PRIVATE_KEY`, paste the entire key from the service account JSON. Use literal `\n` for newlines — the backend code handles the conversion automatically.

### 3. Google Sheet Preparation
- [ ] Google Sheet exists with a tab named `registrations`
- [ ] Header row is added (see Google Sheets Setup section above)
- [ ] Google Sheet is **shared with the service account email** (Editor access)

### 4. API Test Order (Post-Deploy)
Test endpoints in this exact order after deployment:

1. **`GET /api/health`** — Confirms backend is alive. If this fails, check Root Directory setting.
2. **`GET /api/events`** — Confirms data file is accessible. If this fails, check that `data/events.sample.json` is deployed.
3. **`POST /api/register`** — Confirms Google Sheets integration works. If this fails, check env vars and Sheet sharing.

### 5. Common Failure Causes
| Symptom | Likely Cause |
|---|---|
| 404 on `/api/health` | Root Directory not set to `S_B` |
| `Invalid PEM formatted message` | `GOOGLE_PRIVATE_KEY` newlines not handled |
| `The caller does not have permission` | Sheet not shared with service account email |
| `Requested entity was not found` | Wrong `GOOGLE_SHEETS_SPREADSHEET_ID` |
| Frontend 404s | `vercel.json` misconfigured or missing |
