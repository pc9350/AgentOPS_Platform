# Deployment Guide

This guide covers deploying AgentOps Platform to production.

## Architecture Overview

- **Frontend**: Vercel (recommended) or any Node.js hosting
- **Backend**: Railway, Render, or any Python hosting
- **Database**: Supabase (already hosted)

## Prerequisites

- Production Supabase project
- OpenAI API key
- Tavily API key
- Domain name (optional)

## Backend Deployment

### Option 1: Railway

1. **Create Railway Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize
   cd backend
   railway init
   ```

2. **Configure Environment Variables**
   
   In Railway dashboard, add all environment variables from `.env.example`

3. **Deploy**
   ```bash
   railway up
   ```

4. **Get URL**
   ```bash
   railway domain
   ```

### Option 2: Render

1. **Create Render Web Service**
   - Connect your GitHub repository
   - Select Python environment
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

2. **Add Environment Variables**
   
   In Render dashboard, add all variables from `.env.example`

3. **Deploy**
   
   Render auto-deploys on push to main branch

### Option 3: Docker

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t agentops-backend .
docker run -p 8000:8000 --env-file .env agentops-backend
```

## Frontend Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure Environment Variables**
   
   In Vercel dashboard > Settings > Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```

4. **Production Deploy**
   ```bash
   vercel --prod
   ```

### Other Platforms

For Netlify, AWS Amplify, or other platforms:

1. Set build command: `npm run build`
2. Set output directory: `.next`
3. Add environment variables
4. Deploy

## Supabase Configuration

### 1. Enable Email Auth

In Supabase dashboard:
- Authentication > Providers > Email
- Enable Email provider
- Configure email templates

### 2. Configure Redirect URLs

In Authentication > URL Configuration:
```
Site URL: https://your-frontend-domain.com
Redirect URLs:
  - https://your-frontend-domain.com/auth/callback
  - http://localhost:3000/auth/callback (for development)
```

### 3. Row Level Security

Ensure RLS policies are applied:
```sql
-- Run backend/db/schema.sql in Supabase SQL Editor
```

### 4. API Keys

Get these from Supabase dashboard > Settings > API:
- `publishable` key for frontend (safe to expose)
- `secret` key for backend (keep secret!)
- JWT secret from Settings > API > JWT Settings

## CORS Configuration

Update backend CORS settings for production:

```python
# In .env or environment variables
CORS_ORIGINS=https://your-frontend-domain.com,https://your-backend-domain.com
```

## SSL/HTTPS

Both Vercel and Railway/Render provide automatic SSL certificates.

For custom domains:
1. Add domain in hosting dashboard
2. Configure DNS records
3. Wait for SSL provisioning

## Monitoring

### Application Monitoring

- **Vercel**: Built-in analytics
- **Railway/Render**: Built-in metrics
- **Custom**: Add Sentry for error tracking

```python
# Optional: Add Sentry
pip install sentry-sdk[fastapi]
```

```python
import sentry_sdk
sentry_sdk.init(dsn="your-sentry-dsn")
```

### Database Monitoring

Supabase dashboard provides:
- Query performance
- Database size
- Active connections

## Scaling

### Backend Scaling

**Railway:**
```bash
railway scale --replicas 3
```

**Render:**
Configure auto-scaling in dashboard

### Database Scaling

Upgrade Supabase plan as needed:
- Free: 500MB database, 1GB bandwidth
- Pro: 8GB database, 250GB bandwidth

## Cost Optimization

### API Costs

- Use `gpt-4o-mini` for simple evaluations
- Cache frequent queries
- Set rate limits

### Infrastructure Costs

| Service | Free Tier | Paid Starting |
|---------|-----------|---------------|
| Vercel | 100GB bandwidth | $20/mo |
| Railway | $5 credit/mo | Pay as you go |
| Render | 750 hours/mo | $7/mo |
| Supabase | 500MB, 1GB | $25/mo |

## Security Checklist

- [ ] All API keys in environment variables (not in code)
- [ ] CORS configured for specific domains
- [ ] RLS enabled on all tables
- [ ] Secret key only on backend (never expose to frontend)
- [ ] HTTPS enabled on all endpoints
- [ ] Rate limiting configured
- [ ] Input validation in place

## Backup Strategy

### Database Backups

Supabase provides:
- Daily automatic backups (Pro plan)
- Point-in-time recovery (Pro plan)

Manual backup:
```bash
pg_dump $DATABASE_URL > backup.sql
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CORS_ORIGINS` includes frontend URL
   - Ensure no trailing slashes

2. **Auth Failures**
   - Verify JWT secret matches
   - Check redirect URLs in Supabase

3. **Database Connection**
   - Verify Supabase URL and keys
   - Check connection pooling limits

4. **API Timeouts**
   - Increase timeout settings
   - Check OpenAI rate limits

### Logs

**Railway:**
```bash
railway logs
```

**Render:**
Check Logs tab in dashboard

**Vercel:**
Check Functions tab for serverless logs

## Updates & Maintenance

### Rolling Updates

Both Railway and Render support zero-downtime deployments.

### Database Migrations

```bash
# Add new migrations to schema.sql
# Run in Supabase SQL Editor
```

### Dependency Updates

```bash
# Backend
pip install --upgrade -r requirements.txt

# Frontend
npm update
```

