# TouchBase - Deployment Guide

Production deployment to **touchbase.sujeto10.com** with Supabase backend.

---

## 🚀 Quick Deploy

### Prerequisites

- ✅ PostgreSQL client (`psql`) installed
- ✅ Supabase project created: `nqzhxukuvmdlpewqytpv`
- ✅ Domain configured: `touchbase.sujeto10.com`

### Step 1: Configure Environment

```bash
# Copy production config
cp .env.example .env.production

# Edit with your credentials (already configured for SUJETO10)
nano .env.production
```

### Step 2: Apply Database Migrations

```bash
# Run migration script
cd deploy
./apply-migrations.sh
```

This will:
- ✅ Connect to Supabase PostgreSQL
- ✅ Apply all 6 migrations with `touchbase_*` prefix
- ✅ Create SUJETO10 tenant
- ✅ Verify tables

### Step 3: Deploy Application

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure domain in Vercel dashboard
# → touchbase.sujeto10.com
```

#### Option B: Railway

```bash
# Install Railway CLI
npm i -g railway

# Deploy
railway up

# Configure custom domain
railway domain
```

#### Option C: VPS (Manual)

```bash
# SSH to server
ssh user@your-server.com

# Clone/pull code
git clone [repo-url]
cd plugin/touchbase

# Install dependencies (if any)
composer install --no-dev

# Configure Nginx
sudo nano /etc/nginx/sites-available/touchbase

# Add configuration:
server {
    server_name touchbase.sujeto10.com;
    root /var/www/touchbase/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}

# Restart services
sudo systemctl restart nginx php8.3-fpm
```

---

## 📊 Verification

### 1. Check Database

```bash
# Connect to Supabase
psql "postgresql://postgres:nqzhxukuvmdlpewqytpv@db.nqzhxukuvmdlpewqytpv.supabase.co:5432/postgres"

# Verify tables
\dt touchbase_*

# Verify tenant
SELECT * FROM touchbase_tenants WHERE code = 'sujeto10';
```

### 2. Test API Endpoints

```bash
# Health check (create this endpoint if needed)
curl https://touchbase.sujeto10.com/api/health

# Teams endpoint
curl https://touchbase.sujeto10.com/api/teams

# Tenant info
curl https://touchbase.sujeto10.com/api/tenants/sujeto10
```

### 3. Check Frontend

Open browser:
- https://touchbase.sujeto10.com
- Should show dashboard or login page

---

## 🔧 Configuration

### Database

Connection string format:
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

For Supabase:
```
postgresql://postgres:nqzhxukuvmdlpewqytpv@db.nqzhxukuvmdlpewqytpv.supabase.co:5432/postgres
```

### Environment Variables

Key variables in `.env.production`:

```env
# Core
APP_ENV=production
APP_URL=https://touchbase.sujeto10.com
DB_DRIVER=pgsql

# Supabase
SUPABASE_URL=https://nqzhxukuvmdlpewqytpv.supabase.co
SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_KEY=[service-key]

# Database
DB_HOST=db.nqzhxukuvmdlpewqytpv.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=[password]
```

---

## 🛠️ Troubleshooting

### Migration Errors

```bash
# Check migration log
psql -c "SELECT * FROM touchbase_migrations ORDER BY applied_at DESC LIMIT 10;"

# Re-run specific migration
psql -f migrations/postgres/001_init.sql
```

### Connection Issues

```bash
# Test database connection
psql "postgresql://postgres:PASSWORD@db.nqzhxukuvmdlpewqytpv.supabase.co:5432/postgres" -c "SELECT 1;"

# Check Supabase status
curl https://nqzhxukuvmdlpewqytpv.supabase.co/rest/v1/
```

### Deploy Platform Issues

**Vercel:**
- Check build logs: `vercel logs`
- Verify environment variables in dashboard
- Ensure PHP runtime is configured

**Railway:**
- Check deployment logs in dashboard
- Verify Nixpacks configuration
- Ensure PostgreSQL connection

---

## 📈 Post-Deployment

### 1. Create First Admin User

```bash
# Via Supabase dashboard or API
curl -X POST https://touchbase.sujeto10.com/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@sujeto10.com",
    "password": "secure-password",
    "metadata": {
      "role": "admin",
      "tenant": "sujeto10"
    }
  }'
```

### 2. Configure Tenant Branding

```sql
UPDATE touchbase_tenants
SET
    logo_url = 'https://your-cdn.com/logo.svg',
    color_primary = '#0ea5e9',
    color_secondary = '#22c55e'
WHERE code = 'sujeto10';
```

### 3. Enable Features

```sql
UPDATE touchbase_tenants
SET features_enabled = '{
    "tournaments": true,
    "notifications": true,
    "payments": true,
    "ai_assistant": true,
    "analytics": true
}'::jsonb
WHERE code = 'sujeto10';
```

---

## 🔒 Security Checklist

- [ ] `.env.production` NOT committed to git
- [ ] APP_KEY is unique and secure (32+ chars)
- [ ] Database password is strong
- [ ] Supabase RLS (Row Level Security) policies configured
- [ ] HTTPS enforced on domain
- [ ] CORS configured for API
- [ ] Rate limiting enabled
- [ ] Error reporting configured (but not exposing sensitive data)

---

## 📞 Support

- **Database Issues**: Check Supabase dashboard logs
- **Deploy Issues**: Check platform-specific logs
- **Application Errors**: Enable DEBUG=true temporarily to see detailed errors

---

**Version**: 1.0.0
**Last Updated**: 2025-10-15
**Target**: touchbase.sujeto10.com
**Backend**: Supabase PostgreSQL
