# 🚂 Railway Deployment Guide

## Why Railway?
- ✅ **$5 free credit monthly** (enough for hobby projects)
- ✅ **No sleep/cold starts** (unlike Render free tier)
- ✅ **Better for AI/ML workloads** (handles your embedding model)
- ✅ **Auto-deploys from GitHub**
- ✅ **Beautiful dashboard** (impressive in demos)
- ✅ **Simple setup** (2-5 minutes)

---

## 📋 Prerequisites

1. **GitHub Account** - Your code is already at: `https://github.com/tusharlangh/octillion`
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Environment Variables** - Have these ready from your `.env` file

---

## 🚀 Deployment Steps

### Step 1: Push Your Changes to GitHub

```bash
cd /Users/tusharlanghnoda/Desktop/Projects/octillion

# Add all changes
git add .

# Commit changes
git commit -m "Configure for Railway deployment"

# Push to GitHub
git push origin keyChange
```

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select repository: **`tusharlangh/octillion`**
6. Railway will detect your project automatically

### Step 3: Configure Service

1. Railway will ask which directory to deploy
2. Select **`backend`** directory
3. Railway will auto-detect:
   - ✅ Dockerfile
   - ✅ Node.js project
   - ✅ Port configuration

### Step 4: Add Environment Variables

Click on your service → **Variables** tab → Add these:

```env
NODE_ENV=production
PORT=5002
SUPABASE_URL=https://mhioxkokqrdwaczantad.supabase.co
SUPABASE_ANON_KEY=<your-key>
SUPABASE_SERVICE_KEY=<your-key>
SUPABASE_JWT_KEY=<your-key>
S3_BUCKET_NAME=octillion-bucket
QDRANT_URL=<your-qdrant-url>
QDRANT_API_KEY=<your-key>
OPENAI_API_KEY=<your-key>
FRONTEND_URL=https://octillion.vercel.app
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-key>
AWS_REGION=us-east-1
```

**Where to find your keys:**
- Check your local `.env` file at: `/Users/tusharlanghnoda/Desktop/Projects/octillion/backend/.env`

### Step 5: Deploy!

1. Click **"Deploy"**
2. Railway will:
   - Build your Docker image
   - Install dependencies
   - Start your server
3. Wait 2-5 minutes for first deployment

### Step 6: Get Your Backend URL

1. After deployment, go to **Settings** tab
2. Click **"Generate Domain"**
3. You'll get a URL like: `https://octillion-backend.up.railway.app`
4. **Copy this URL** - you'll need it for frontend

### Step 7: Update Frontend

Update your frontend to use the new Railway backend URL:

1. Go to Vercel dashboard
2. Select your `octillion` project
3. Go to **Settings** → **Environment Variables**
4. Update `NEXT_PUBLIC_API_URL` to your Railway URL
5. Redeploy frontend

---

## ✅ Verify Deployment

### Test Health Endpoint
```bash
curl https://your-railway-url.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-20T06:42:46.000Z",
  "environment": "production"
}
```

### Test CORS
Your backend now accepts requests from:
- ✅ `http://localhost:3000` (local dev)
- ✅ `https://octillion.vercel.app` (production)
- ✅ Any `*.vercel.app` domain (preview deployments)

---

## 🔧 Troubleshooting

### Build Fails
- Check Railway logs: Click on deployment → View Logs
- Common issues:
  - Missing environment variables
  - Build timeout (increase in Settings)

### Memory Issues
- Railway free tier: 512 MB RAM
- Your app uses ~300-500 MB for AI model
- If crashes, upgrade to Hobby plan ($5/month)

### CORS Errors
- Check browser console for exact error
- Verify `FRONTEND_URL` is set correctly
- Check Railway logs for "CORS blocked" messages

### Port Issues
- Railway automatically sets `PORT` env variable
- Your app listens on `0.0.0.0:${PORT}`
- Don't hardcode port numbers

---

## 💰 Cost Breakdown

**Free Tier:**
- $5 credit/month
- ~550 hours of runtime
- Perfect for demos and portfolio projects

**Usage Estimate:**
- Your backend: ~$3-4/month (within free tier!)
- Stays within free credit if used for demos

---

## 🎯 Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Update frontend environment variables
3. ✅ Test all features
4. ✅ Add Railway URL to your resume/portfolio
5. ✅ Create a professional README with live demo link

---

## 📚 Resources

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway) - Great community support
- [Your GitHub Repo](https://github.com/tusharlangh/octillion)

---

## 🎨 Impress Recruiters

**What to highlight:**
- ✅ "Deployed microservices architecture on Railway"
- ✅ "Implemented Docker containerization"
- ✅ "Integrated AI/ML embeddings with vector database"
- ✅ "Full-stack deployment: Vercel (frontend) + Railway (backend)"
- ✅ "Production-ready CORS and security configuration"

**Live Demo:**
- Frontend: https://octillion.vercel.app
- Backend: https://your-railway-url.up.railway.app
- Health Check: https://your-railway-url.up.railway.app/health

---

Good luck with your deployment! 🚀
