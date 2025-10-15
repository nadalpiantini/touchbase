# 🚀 TouchBase - Production Deployment Guide

Complete guide for deploying TouchBase to **touchbase.sujeto10.com** with Supabase backend.

---

## ✅ Pre-Deployment Checklist

- [x] Supabase project created: `nqzhxukuvmdlpewqytpv`
- [x] Database migrations converted to PostgreSQL with `touchbase_*` prefix
- [x] Auth system migrated to Supabase Auth
- [x] `.env.production` configured with credentials
- [x] Vercel configuration ready
- [ ] Domain DNS configured
- [ ] Environment variables set in Vercel
- [ ] Database migrations applied to Supabase

---

## 📋 Deployment Steps

### 1. Apply Database Migrations

```bash
cd plugin/touchbase/deploy

# Run migration script
./apply-migrations.sh
```

**Expected output:**
```
✓ Connected to Supabase PostgreSQL
✓ Found 6 migration files
✓ Migrations completed:
  Applied: 6
✓ SUJETO10 tenant created
```

**Verify:**
```bash
# Connect to Supabase
psql "postgresql://postgres:[password]@db.nqzhxukuvmdlpewqytpv.supabase.co:5432/postgres"

# Check tables
\dt touchbase_*

# Verify tenant
SELECT * FROM touchbase_tenants WHERE code = 'sujeto10';
```

---

### 2. Deploy to Vercel

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
cd plugin/touchbase
vercel --prod
```

**Configure Environment Variables in Vercel:**

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

```
SUPABASE_URL=https://nqzhxukuvmdlpewqytpv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xemh4dWt1dm1kbHBld3F5dHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTk0MDksImV4cCI6MjA2MjIzNTQwOX0.9raKtf_MAUoZ7lUOek4lazhWTfmxPvufW1-al82UHmk
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xemh4dWt1dm1kbHBld3F5dHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY1OTQwOSwiZXhwIjoyMDYyMjM1NDA5fQ.KUbJb8fCHADnITIhr-x8R49_BsmicsYAzW9qG2YlTFA
SUPABASE_PROJECT_ID=nqzhxukuvmdlpewqytpv

DB_DRIVER=pgsql
DB_HOST=db.nqzhxukuvmdlpewqytpv.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=nqzhxukuvmdlpewqytpv

APP_ENV=production
APP_URL=https://touchbase.sujeto10.com
BASE_PATH=/
DEBUG=false

DEFAULT_TENANT=sujeto10
DEFAULT_LANG=es
TIMEZONE=America/Santo_Domingo
```

---

### 3. Configure Custom Domain

**In Vercel Dashboard:**
1. Go to: Settings → Domains
2. Add: `touchbase.sujeto10.com`
3. Configure DNS records as shown

**DNS Configuration (at your domain provider):**

```
Type: CNAME
Name: touchbase
Value: cname.vercel-dns.com
```

**Wait for DNS propagation** (can take 1-48 hours)

---

### 4. Create First Admin User

**Option A: Supabase Dashboard**
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Email: `admin@sujeto10.com`
4. Password: (secure password)
5. User Metadata (JSON):
```json
{
  "role": "admin",
  "tenant": "sujeto10"
}
```

**Option B: API Call**
```bash
curl -X POST https://touchbase.sujeto10.com/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@sujeto10.com",
    "password": "secure-password-here",
    "metadata": {
      "role": "admin",
      "tenant": "sujeto10"
    }
  }'
```

---

## 🧪 Testing

### 1. Health Check

```bash
curl https://touchbase.sujeto10.com/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "service": "TouchBase API",
  "version": "1.0.0",
  "environment": "production",
  "database": "pgsql",
  "supabase": "enabled",
  "timestamp": "2025-10-15T..."
}
```

### 2. Teams Endpoint

```bash
curl https://touchbase.sujeto10.com/api/teams
```

**Expected response:**
```json
{
  "data": []
}
```

### 3. Tenant Info

```bash
curl https://touchbase.sujeto10.com/api/tenants/sujeto10
```

**Expected response:**
```json
{
  "code": "sujeto10",
  "name": "SUJETO10",
  "color_primary": "#0ea5e9",
  "features_enabled": {
    "tournaments": true,
    "payments": true,
    "ai_assistant": true
  }
}
```

### 4. Frontend

Open browser: https://touchbase.sujeto10.com

Should load:
- ✅ Dashboard or login page
- ✅ No console errors
- ✅ Correct branding (SUJETO10 colors)

---

## 📊 Monitoring

### Vercel Analytics

- Real-time traffic
- Response times
- Error rates
- Geographic distribution

**Access:** Vercel Dashboard → Your Project → Analytics

### Supabase Logs

- Database queries
- API requests
- Auth events

**Access:** Supabase Dashboard → Logs

### Health Check Monitoring

Setup automated monitoring:
```bash
# Cron job to check every 5 minutes
*/5 * * * * curl -f https://touchbase.sujeto10.com/api/health || echo "API Down!"
```

Or use services like:
- UptimeRobot
- Pingdom
- Better Uptime

---

## 🔧 Post-Deployment Configuration

### 1. Enable Row Level Security (RLS) in Supabase

```sql
-- Enable RLS on all touchbase tables
ALTER TABLE touchbase_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchbase_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchbase_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchbase_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchbase_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchbase_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchbase_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchbase_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchbase_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchbase_matches ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only read their own tenant's data
CREATE POLICY "Users can view their tenant data" ON touchbase_teams
  FOR SELECT
  USING (
    club_id IN (
      SELECT id FROM touchbase_clubs
      WHERE tenant_id = (
        SELECT (auth.jwt() ->> 'user_metadata')::json ->> 'tenant'
      )::int
    )
  );
```

### 2. Configure CORS

In Vercel → Settings → Environment Variables:
```
CORS_ORIGINS=https://touchbase.sujeto10.com
```

Or in code (already configured in Response.php):
```php
header('Access-Control-Allow-Origin: https://touchbase.sujeto10.com');
```

### 3. Enable Rate Limiting

Use Vercel's built-in rate limiting or add middleware in `src/Middleware/RateLimit.php`

---

## 🚨 Troubleshooting

### Issue: "Database connection failed"

```bash
# Test connection
psql "postgresql://postgres:PASSWORD@db.nqzhxukuvmdlpewqytpv.supabase.co:5432/postgres" -c "SELECT 1;"

# Check environment variables in Vercel
vercel env ls
```

### Issue: "404 Not Found"

```bash
# Check Vercel logs
vercel logs

# Verify routes in vercel.json
cat vercel.json | grep -A 5 "routes"
```

### Issue: "500 Internal Server Error"

```bash
# Enable debug mode temporarily
vercel env add DEBUG
# Set to: true

# Check logs
vercel logs --follow

# Disable debug after fixing
vercel env rm DEBUG
```

---

## 🔄 Updates & Rollbacks

### Deploy Updates

```bash
# Make changes
git add .
git commit -m "Update: ..."

# Deploy
vercel --prod
```

### Rollback

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url]
```

---

## 📈 Performance Optimization

### Supabase Connection Pooling

Already configured via Supabase Pooler:
```
db.nqzhxukuvmdlpewqytpv.supabase.co:5432
```

### Vercel Edge Caching

Add headers for static assets:
```php
if (preg_match('/\.(jpg|jpeg|png|gif|css|js)$/', $_SERVER['REQUEST_URI'])) {
    header('Cache-Control: public, max-age=31536000, immutable');
}
```

### Database Indexes

Already created in migrations for:
- Foreign keys
- Frequently queried columns
- Composite keys for joins

---

## ✅ Launch Checklist

- [ ] Database migrations applied successfully
- [ ] Health check endpoint returns 200 OK
- [ ] Admin user created and can login
- [ ] SUJETO10 tenant visible and branded correctly
- [ ] DNS propagated (touchbase.sujeto10.com resolves)
- [ ] SSL certificate active (HTTPS working)
- [ ] RLS policies configured in Supabase
- [ ] Monitoring setup (UptimeRobot or similar)
- [ ] Error tracking configured
- [ ] Backups enabled (Supabase automatic backups)
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Environment variables secured (not in git)

---

## 🎉 You're Live!

**Production URL:** https://touchbase.sujeto10.com

**Next Steps:**
1. Import initial data (clubs, teams, players)
2. Configure tenant branding (logo, colors)
3. Enable additional features (tournaments, billing, AI)
4. Train users and coaches
5. Monitor and optimize

---

**Deployed:** 2025-10-15
**Version:** 1.0.0
**Stack:** Vercel + Supabase PostgreSQL + PHP 8.3
