# Render.com Deployment Guide

## Prerequisites
- GitHub repository with your code
- Render.com account

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Configure for Render.com deployment"
git push origin main
```

### 2. Create New Web Service on Render.com

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `octillion` repository

### 3. Configure Service

**Basic Settings:**
- **Name**: `octillion-backend`
- **Region**: Oregon (US West) or closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Docker`
- **Instance Type**: Start with **Starter** ($7/month) or **Standard** for better performance

**Docker Settings:**
- Render will automatically detect the `Dockerfile`
- No additional configuration needed

### 4. Environment Variables

Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=5002
FRONTEND_URL=https://octillion.vercel.app

# Supabase
SUPABASE_URL=https://mhioxkokqrdwaczantad.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-key>
SUPABASE_JWT_KEY=<your-jwt-key>

# AWS S3
S3_BUCKET_NAME=octillion-bucket
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_REGION=us-east-1

# Qdrant
QDRANT_URL=<your-qdrant-url>
QDRANT_API_KEY=<your-qdrant-api-key>

# OpenAI
OPENAI_API_KEY=<your-openai-api-key>
```

### 5. Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Build your Docker image
   - Deploy the container
   - Assign a URL (e.g., `https://octillion-backend.onrender.com`)

### 6. Update Frontend

Update your frontend `.env` file with the new Render URL:

```bash
NEXT_PUBLIC_API_URL=https://octillion-backend.onrender.com
```

Redeploy your frontend on Vercel.

## Health Check

Render will automatically ping your service at `/` to ensure it's running.

## Monitoring

- View logs in real-time from Render dashboard
- Set up alerts for downtime
- Monitor memory and CPU usage

## Scaling

If you need more resources:
- Upgrade to **Standard** ($25/month) - 2GB RAM
- Or **Pro** ($85/month) - 4GB RAM

## Notes

- **Cold starts**: Free tier services sleep after 15 minutes of inactivity
- **Starter tier**: Services stay awake 24/7
- **Build time**: First build takes ~2-3 minutes
- **Memory**: Starter tier has 512MB RAM, may need Standard (2GB) for ML models

## Troubleshooting

### Out of Memory
If you see OOM errors, upgrade to Standard tier (2GB RAM).

### Build Fails
Check build logs in Render dashboard. Common issues:
- Missing environment variables
- Dockerfile syntax errors
- npm install failures

### CORS Errors
Make sure `FRONTEND_URL` matches your Vercel deployment URL exactly.
