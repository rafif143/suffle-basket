# Yadika Cup Tournament API Documentation

**Base URL:** `https://yadika-cup-basketball.vercel.app/api`

**Version:** 1.0  
**Last Updated:** March 2026

## Overview

The Yadika Cup Tournament API provides endpoints for managing basketball tournament data including team registrations, tournament draws, match schedules, and scoring. This is a RESTful API that returns JSON responses.

## Authentication

The API uses JWT (JSON Web Token) based authentication. Most endpoints require authentication except for live scores which are publicly accessible.

### Login Credentials

**Default Accounts:**
- **Admin**: `admin` / `yadika2025` (role: admin)
- **Organizer**: `panitia` / `tournament2025` (role: organizer)

**Test Account:**
- **Test User**: `testuser` / `test123` (role: organizer)

### Authentication Endpoints

#### POST `/auth/login`
Login with username and password.

**Request Body:**
```json
{
  "username": "admin",
  "password": "yadika2025"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "admin",
    "full_name": "System Administrator",
    "email": "admin@yadikacup.com"
  }
}
```

#### POST `/auth/register`
Register new user account.

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "fullName": "Full Name",
  "email": "user@example.com",
  "role": "organizer"
}
```

### Using Authentication

Include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Public Endpoints (No Authentication Required)
- `GET /health` - Health check
- `GET /live-scores` - Live match scores

### Protected Endpoints (Authentication Required)
- All other endpoints require valid JWT token

## Rate Limiting

- **100 requests per 15 minutes** per IP address
- Rate limit headers included in responses

## Response Format

All responses follow this structure:

```json
{
  "success": true|false,
  "data": {...},
  "message": "Optional message"
}
```

## Error Handling

Error responses include appropriate HTTP status codes:

- `400` - Bad Request
- `401` - Unauthorized  
- `404` - Not Found
- `405` - Method Not Allowed
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Endpoints

### 🏥 Health Check

#### GET `/health`
Check API status and uptime.

**Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-03-23T06:58:33.861Z"
}
```

---

### ⚙️ Tournament Settings

#### GET `/settings`
Get tournament configuration (payment info, contact details).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "bank_name": "Bank BCA",
    "account_number": "123 456 7890", 
    "account_name": "Panitia Championship",
    "registration_fee": "350000",
    "whatsapp_contact": "081234567890",
    "created_at": "2026-03-22T17:56:54.795238+00:00",
    "updated_at": "2026-03-22T18:28:51.963+00:00"
  }
}
```

#### POST `/settings`
Update tournament settings.

**Request Body:**
```json
{
  "bankName": "Bank BCA",
  "accountNumber": "123 456 7890",
  "accountName": "Panitia Championship", 
  "registrationFee": "350000",
  "whatsappContact": "081234567890"
}
```

---

### 📝 Team Registrations

#### GET `/registrations`
Get all team registrations.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "school_name": "SMAN 70 Jakarta",
      "school_address": "Jl. Bulungan No.1, Jakarta Selatan",
      "whatsapp": "081234567890",
      "level": "SMA",
      "gender": "Putra", 
      "logo_url": "https://storage.url/logo.jpg",
      "players": [
        {
          "name": "Ahmad Rizki",
          "card_url": "https://storage.url/card1.jpg"
        }
      ],
      "officials": ["Coach Name", "Manager Name"],
      "status": "Pending|Verified|Rejected",
      "created_at": "2026-03-22T17:56:54.795238+00:00",
      "updated_at": "2026-03-22T18:28:51.963+00:00"
    }
  ]
}
```

#### POST `/registrations`
Create new team registration.

**Request Body:**
```json
{
  "schoolName": "SMAN 70 Jakarta",
  "schoolAddress": "Jl. Bulungan No.1, Jakarta Selatan", 
  "whatsapp": "081234567890",
  "level": "SMA|SMP",
  "gender": "Putra|Putri",
  "players": [
    {
      "name": "Ahmad Rizki",
      "cardFile": "base64_encoded_image_data"
    }
  ],
  "officials": ["Coach Name", "Manager Name"],
  "logoFile": "base64_encoded_image_data"
}
```

#### GET `/registrations/{id}`
Get specific registration by ID.

**Parameters:**
- `id` (string) - Registration UUID

#### PATCH `/registrations/{id}`
Update registration status.

**Request Body:**
```json
{
  "status": "Pending|Verified|Rejected"
}
```

#### DELETE `/registrations/{id}`
Delete registration.

#### GET `/registrations/stats`
Get registration statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 24,
    "pending": 8,
    "verified": 14,
    "rejected": 2
  }
}
```

---

### 🎯 Tournament Draw

#### GET `/draw/{category}/teams`
Get teams list for specific category.

**Parameters:**
- `category` (string) - One of: `sma-putra`, `sma-putri`, `smp-putra`, `smp-putri`

**Response:**
```json
{
  "success": true,
  "data": [
    "SMAN 70 Jakarta",
    "SMAN 8 Jakarta", 
    "SMAN 3 Bandung"
  ]
}
```

#### POST `/draw/{category}/teams`
Save teams list for category.

**Request Body:**
```json
{
  "teams": [
    "SMAN 70 Jakarta",
    "SMAN 8 Jakarta",
    "SMAN 3 Bandung"
  ]
}
```

#### GET `/draw/{category}/results`
Get draw/bracket results for category.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "team1": "SMAN 70 Jakarta",
      "team2": "SMAN 8 Jakarta"
    },
    {
      "team1": "SMAN 3 Bandung", 
      "team2": "SMAN 1 Surabaya"
    }
  ]
}
```

#### POST `/draw/{category}/results`
Save draw results for category.

**Request Body:**
```json
{
  "results": [
    {
      "team1": "SMAN 70 Jakarta",
      "team2": "SMAN 8 Jakarta"
    }
  ]
}
```

---

### 📅 Match Schedule & Scoring

#### GET `/schedule/scores`
Get all match scores.

**Response:**
```json
{
  "success": true,
  "data": {
    "1-M1-SMA Putra": {
      "score1": 78,
      "score2": 65
    },
    "1-M2-SMA Putri": {
      "score1": 45,
      "score2": 52
    }
  }
}
```

#### POST `/schedule/scores`
Save/update match score.

**Request Body:**
```json
{
  "matchKey": "1-M1-SMA Putra",
  "score1": 78,
  "score2": 65
}
```

#### GET `/schedule/scores/{matchKey}`
Get specific match score.

**Parameters:**
- `matchKey` (string) - Format: `{day}-{matchId}-{category}`

#### DELETE `/schedule/scores/{matchKey}`
Delete match score.

---

### 📁 File Upload

#### POST `/upload`
Upload files to storage.

**Request Body:**
```json
{
  "file": "base64_encoded_file_data",
  "fileName": "logo.jpg",
  "folder": "logos|player-cards|uploads"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "path": "logos/1234567890-logo.jpg",
    "url": "https://storage.supabase.co/object/public/tournament-files/logos/1234567890-logo.jpg"
  }
}
```

---

## Tournament Categories

The tournament supports 4 categories:

- `sma-putra` - Senior High School Male
- `sma-putri` - Senior High School Female  
- `smp-putra` - Junior High School Male
- `smp-putri` - Junior High School Female

## Match Key Format

Match keys follow the pattern: `{day}-{matchId}-{category}`

Examples:
- `1-M1-SMA Putra` - Day 1, Match 1, SMA Male category
- `13-FINAL-SMP Putri` - Day 13, Final match, SMP Female category

## Tournament Schedule

- **Days 1-6:** Round of 16 (8 matches per category)
- **Days 7-10:** Quarter Finals (2 matches per category)  
- **Days 11-12:** Semi Finals (2 matches per category)
- **Day 13:** Grand Finals (1 match per category)

## Status Values

### Registration Status
- `Pending` - Awaiting verification
- `Verified` - Approved and confirmed
- `Rejected` - Not approved

## Example Usage

### JavaScript/Fetch
```javascript
// Get all registrations
const registrations = await fetch('https://v0-delete-akun-permanen.vercel.app/api/registrations')
  .then(res => res.json());

// Create new registration
const newTeam = await fetch('https://v0-delete-akun-permanen.vercel.app/api/registrations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    schoolName: 'SMAN 1 Jakarta',
    level: 'SMA',
    gender: 'Putra',
    // ... other fields
  })
});

// Get draw results
const drawResults = await fetch('https://v0-delete-akun-permanen.vercel.app/api/draw/sma-putra/results')
  .then(res => res.json());
```

### Python/Requests
```python
import requests

# Get tournament settings
response = requests.get('https://v0-delete-akun-permanen.vercel.app/api/settings')
settings = response.json()

# Update match score
score_data = {
    "matchKey": "1-M1-SMA Putra",
    "score1": 78,
    "score2": 65
}
requests.post('https://v0-delete-akun-permanen.vercel.app/api/schedule/scores', json=score_data)
```

### cURL
```bash
# Get health status
curl https://v0-delete-akun-permanen.vercel.app/api/health

# Get registrations
curl https://v0-delete-akun-permanen.vercel.app/api/registrations

# Update registration status
curl -X PATCH https://v0-delete-akun-permanen.vercel.app/api/registrations/{id} \
  -H "Content-Type: application/json" \
  -d '{"status": "Verified"}'
```

## CORS Policy

The API allows cross-origin requests from all domains (`*`). In production, this may be restricted to specific domains.

## Support

For API support or questions, contact the tournament committee via WhatsApp as specified in the settings endpoint.

---

**Note:** This API is designed for the Yadika Cup Basketball Championship tournament management system. All endpoints are subject to change based on tournament requirements.