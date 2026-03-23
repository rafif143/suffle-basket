# Tournament Management System

Sistem manajemen turnamen dengan frontend SvelteKit dan backend Express.js + Supabase.

## 📁 Project Structure

```
project/
├── src/                       # SOURCE CODE
│   ├── backend/              # Backend Express API
│   │   ├── src/
│   │   │   ├── config/      # Database & config
│   │   │   ├── controllers/ # Business logic
│   │   │   ├── queries/     # Database queries
│   │   │   ├── routes/      # API routes
│   │   │   ├── middleware/  # Middleware
│   │   │   └── server.js    # Entry point
│   │   ├── database/        # SQL schema
│   │   └── package.json     # Backend dependencies
│   │
│   ├── lib/                  # Frontend libraries
│   │   ├── components/      # UI & Feature components
│   │   ├── services/        # API services
│   │   └── utils/           # Utilities
│   │
│   └── routes/              # Frontend SvelteKit pages
│       ├── +layout.svelte   # Main layout
│       ├── draw/            # Draw page
│       ├── schedule/        # Schedule page
│       ├── registration/    # Registration page
│       ├── management/      # Management page
│       └── settings/        # Settings page
│
├── static/                   # Static assets
├── package.json             # Frontend dependencies
└── README.md               # This file
```

## 🚀 Quick Start

### Frontend (SvelteKit)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Frontend akan jalan di: http://localhost:5173

### Backend (Express API)

```bash
# Navigate to backend
cd src/backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan Supabase credentials

# Run development server
npm run dev

# Run production
npm start
```

Backend akan jalan di: http://localhost:3000

## 📚 Documentation

### Frontend
- Built with SvelteKit + Tailwind CSS
- Modular component structure
- Service layer untuk API integration

### Backend
- `src/backend/README.md` - Setup & overview
- `src/backend/API-DOCUMENTATION.md` - Complete API reference
- `src/backend/ARCHITECTURE.md` - Architecture details
- `src/backend/QUICK-START.md` - 5-minute setup guide
- `src/backend/DEPLOYMENT.md` - Production deployment
- `src/backend/FRONTEND-INTEGRATION.md` - Integration guide

## 🗄️ Database

Backend menggunakan Supabase (PostgreSQL):
1. Create Supabase project
2. Run SQL dari `src/backend/database/schema.sql`
3. Create storage bucket: `tournament-files`
4. Update `src/backend/.env` dengan credentials

Detail setup: `src/backend/database/setup-instructions.md`

## 🔗 Integration

Frontend dan backend terpisah tapi terintegrasi:
- Frontend call backend API via fetch
- Backend serve REST API
- File upload via Supabase Storage

Setup integration: `src/backend/FRONTEND-INTEGRATION.md`

## 🛠️ Tech Stack

### Frontend
- SvelteKit 2.x
- Tailwind CSS 4.x
- Vite

### Backend
- Node.js 18+
- Express.js
- Supabase (PostgreSQL + Storage)
- Multer (file upload)

## 📦 Features

- ✅ Team registration dengan file upload
- ✅ Tournament draw/bracket
- ✅ Match scheduling
- ✅ Score tracking
- ✅ Tournament settings
- ✅ Management dashboard

## 🚀 Deployment

### Vercel (Recommended - All-in-One)
Frontend + Backend dalam 1 deployment!

```bash
# Push ke GitHub
git push origin main

# Deploy di Vercel
# 1. Import repository
# 2. Set environment variables (Supabase credentials)
# 3. Deploy!
```

Guide lengkap: `VERCEL-DEPLOYMENT.md`

### Netlify (Frontend Only)
Deploy ke Netlify (sudah configured):
```bash
npm run build
# Deploy folder .netlify ke Netlify
```

## 📝 Development Workflow

1. **Start Backend**
   ```bash
   cd src/backend
   npm run dev
   ```

2. **Start Frontend** (terminal baru)
   ```bash
   npm run dev
   ```

3. **Test Integration**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000/api/health

## 🐛 Troubleshooting

### Frontend tidak connect ke backend
- Check backend running di port 3000
- Check CORS di `backend/.env`
- Check `VITE_API_URL` di frontend

### Backend error
- Check Supabase credentials di `src/backend/.env`
- Check database schema sudah dijalankan
- Check storage bucket sudah dibuat

## 📄 License

MIT
