# AgentOps Platform - Deployment Guide

Complete guide for deploying the AgentOps Platform to production.

---

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Supabase database tables created
- [ ] API keys obtained (OpenAI, Tavily, Supabase)
- [ ] Frontend and backend tested locally
- [ ] `.env` files added to `.gitignore` (DO NOT commit secrets!)
- [ ] Code pushed to GitHub

---

## 🚀 Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

**Best for:** Quick deployment with minimal configuration

#### Backend Deployment (Railway)

1. **Create Railway Account**: https://railway.app/

2. **Deploy Backend**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Navigate to backend
   cd backend
   
   # Initialize
   railway init
   
   # Deploy
   railway up
   ```

3. **Set Environment Variables in Railway Dashboard**:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `SUPABASE_JWT_SECRET`
   - `OPENAI_API_KEY`
   - `TAVILY_API_KEY`
   - `ANTHROPIC_API_KEY` (optional)
   - `GOOGLE_API_KEY` (optional)

4. **Note your Railway backend URL**: `https://your-app.railway.app`

#### Frontend Deployment (Vercel)

1. **Create Vercel Account**: https://vercel.com/

2. **Deploy Frontend**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Navigate to frontend
   cd frontend
   
   # Deploy
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard**:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` = Your Supabase publishable key
   - `NEXT_PUBLIC_API_URL` = Your Railway backend URL

4. **Update Frontend API Calls**:
   - Replace `http://localhost:8000` with your Railway URL
   - Or use `process.env.NEXT_PUBLIC_API_URL`

---

### Option 2: Render (Full Stack)

**Best for:** Single platform deployment

1. **Create Render Account**: https://render.com/

2. **Deploy Backend as Web Service**:
   - Connect your GitHub repo
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT`
   - Add all environment variables

3. **Deploy Frontend as Static Site**:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/out`
   - Add environment variables

---

### Option 3: AWS / GCP / Azure

**Best for:** Enterprise deployment with full control

#### Backend (AWS EC2 / GCP Compute / Azure VM)

1. **Provision VM** (Ubuntu 22.04 recommended)

2. **Install Dependencies**:
   ```bash
   sudo apt update
   sudo apt install python3.11 python3-pip nginx
   ```

3. **Setup Application**:
   ```bash
   # Clone repo
   git clone https://github.com/YOUR_USERNAME/agentops-platform.git
   cd agentops-platform/backend
   
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Create .env file
   nano .env
   # (Add all environment variables)
   ```

4. **Setup Systemd Service**:
   ```bash
   sudo nano /etc/systemd/system/agentops.service
   ```
   
   ```ini
   [Unit]
   Description=AgentOps Backend
   After=network.target
   
   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/agentops-platform/backend
   Environment="PATH=/home/ubuntu/agentops-platform/backend/venv/bin"
   ExecStart=/home/ubuntu/agentops-platform/backend/venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   ```bash
   sudo systemctl enable agentops
   sudo systemctl start agentops
   ```

5. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/agentops
   ```
   
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/agentops /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```

6. **Setup SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

#### Frontend (AWS S3 + CloudFront / Vercel / Netlify)

Follow Option 1 Vercel instructions, or:

**AWS S3 + CloudFront:**
```bash
cd frontend
npm run build
aws s3 sync out/ s3://your-bucket-name --acl public-read
```

---

## 🔒 Security Checklist

- [ ] All API keys stored in environment variables (NOT in code)
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS configured to only allow your frontend domain
- [ ] Supabase RLS policies enabled
- [ ] Rate limiting configured
- [ ] Backend JWT secret is strong and unique
- [ ] Database backups enabled

---

## 🔧 Post-Deployment Configuration

### 1. Update Frontend API URL

**Option A: Environment Variable (Recommended)**

In `frontend/app/(dashboard)/*/page.tsx`, replace:
```typescript
const response = await fetch('http://localhost:8000/api/...', {
```

With:
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/...`, {
```

**Option B: Create API Client**

Create `frontend/lib/api.ts`:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, options)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  }
}
```

### 2. Update CORS in Backend

In `backend/app.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://your-frontend.vercel.app",  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Update Supabase Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:
- Add your production URL: `https://your-frontend.vercel.app`
- Redirect URLs: `https://your-frontend.vercel.app/auth/callback`

---

## 📊 Monitoring

### Recommended Tools

- **Backend**: Sentry, LogRocket, or Railway logs
- **Frontend**: Vercel Analytics, Google Analytics
- **Database**: Supabase Dashboard
- **Uptime**: UptimeRobot, Pingdom

### Health Checks

Backend health endpoint:
```
GET https://your-backend-url.com/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-12T..."
}
```

---

## 💰 Cost Estimates (Monthly)

### Free Tier (Hobby Project)
- **Vercel**: Free (Hobby plan)
- **Railway**: ~$5 (Backend)
- **Supabase**: Free (up to 500MB database)
- **OpenAI API**: Pay-per-use (~$10-50 depending on usage)
- **Tavily API**: Free tier (1000 searches/month)
- **Total**: ~$15-60/month

### Production (Low Traffic)
- **Vercel**: $20/month (Pro plan)
- **Railway**: $20/month (Pro plan)
- **Supabase**: $25/month (Pro plan)
- **OpenAI API**: ~$100-500/month
- **Tavily API**: $49/month (Standard plan)
- **Total**: ~$214-614/month

---

## 🐛 Troubleshooting

### "Not authenticated" errors
- Check JWT secret matches between Supabase and backend
- Verify Authorization header is being sent
- Check CORS configuration

### Database connection errors
- Verify Supabase URL and keys are correct
- Check if IP is whitelisted (if using connection pooler)
- Ensure RLS policies are configured

### API timeout errors
- Increase timeout limits in deployment platform
- Consider using background jobs for long-running evaluations
- Implement caching for frequently accessed data

---

## 📝 Environment Variables Summary

### Backend (.env)
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJxxx...
SUPABASE_SECRET_KEY=eyJxxx...
SUPABASE_JWT_SECRET=your-jwt-secret

OPENAI_API_KEY=sk-xxx...
TAVILY_API_KEY=tvly-xxx...
ANTHROPIC_API_KEY=sk-ant-xxx...  # Optional
GOOGLE_API_KEY=AIza...  # Optional
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJxxx...
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## 🎯 Next Steps After Deployment

1. [ ] Test all features in production
2. [ ] Run test evaluations
3. [ ] Monitor logs for errors
4. [ ] Set up alerts for downtime
5. [ ] Configure backups
6. [ ] Document any custom configurations
7. [ ] Share with users!

---

**Need help?** Check the main [README.md](README.md) or open an issue on GitHub.

🚀 **Happy Deploying!**

