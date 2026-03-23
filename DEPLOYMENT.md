# 🚀 Production Deployment Guide

## Overview
This application uses a hybrid architecture:
- **Frontend**: SvelteKit static site
- **Backend**: Serverless functions in `/api` directory
- **Database**: Supabase (PostgreSQL)

## 🌐 Deployment to Vercel

### 1. Prerequisites
- GitHub repository
- Vercel account
- Supabase project

### 2. Environment Variables Setup

In Vercel dashboard, add these environment variables:

```bash
# Frontend API URL (automatically set by Vercel)
VITE_API_URL=/api

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# CORS (optional)
CORS_ORIGIN=*
```

### 3. Deployment Steps

1. **Connect Repository**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect SvelteKit
   - Add environment variables
   - Deploy!

3. **Database Setup**
   - Your Supabase database is already configured
   - Admin user already created (username: admin, password: yadika2025)
   - All tournament data is ready

### 4. Production Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Vercel Edge    │    │   Supabase      │
│   (SvelteKit)   │───▶│   Functions      │───▶│   Database      │
│   Static Site   │    │   /api/*         │    │   (PostgreSQL)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 5. API Endpoints in Production

All API endpoints will be available at:
- `https://your-domain.vercel.app/api/auth/login`
- `https://your-domain.vercel.app/api/registrations`
- `https://your-domain.vercel.app/api/draw/sma-putra/results`
- `https://your-domain.vercel.app/api/schedule`
- `https://your-domain.vercel.app/api/schedule/scores`

### 6. Development vs Production

| Environment | Frontend | Backend | API URL |
|-------------|----------|---------|---------|
| Development | Vite dev server (5173) | Express server (3000) | `/api` (proxied) |
| Production | Static build on Vercel | Serverless functions | `/api` (direct) |

## ✅ Current Setup Status

- ✅ Vercel configuration ready (`vercel.json`)
- ✅ SvelteKit adapter configured (`@sveltejs/adapter-vercel`)
- ✅ API functions in `/api` directory
- ✅ Environment variables template (`.env.example`)
- ✅ Database schema and data ready
- ✅ Admin user created
- ✅ Tournament data populated (64 teams, 4 categories)

## 🔧 Post-Deployment

After deployment:
1. Test login with admin credentials
2. Verify all API endpoints work
3. Check tournament data displays correctly
4. Test match scoring functionality

## 🚨 Important Notes

- **Environment Variables**: Never commit `.env` files to git
- **Database**: Supabase handles scaling automatically
- **API Rate Limits**: Vercel has generous limits for hobby plan
- **CORS**: Already configured for production
- **Authentication**: JWT tokens work in production

Your app is ready for production deployment! 🎉