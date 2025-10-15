# TouchBase Deployment Guide

## Deployment Options

### 1. Vercel (Recommended for Production)

#### Prerequisites
- Vercel account
- Git repository
- Environment variables configured

#### Deployment Steps

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

#### Environment Variables (Vercel Dashboard)
```env
DB_DRIVER=mysql
DB_HOST=your-database-host
DB_PORT=3306
DB_NAME=chamilo
DB_USER=your-db-user
DB_PASS=your-db-password
BASE_PATH=/touchbase
DEFAULT_LANG=en
SUPPORTED_LANGS=en,es
APP_ENV=production
DEBUG=false
BASE_URL=https://your-domain.vercel.app
```

### 2. Local Development

```bash
# Quick start
./deploy_local.sh

# Or manually with Docker
docker-compose up -d

# Run migrations
./bin/migrate

# Access application
open http://localhost/touchbase
```

### 3. Traditional Hosting

#### Requirements
- PHP 8.2+
- MySQL 5.7+ or PostgreSQL 12+
- Composer
- Web server (Apache/Nginx)

#### Installation
```bash
# Clone repository
git clone https://github.com/your-org/touchbase.git

# Install dependencies
composer install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
php run_migrations.php

# Set permissions
chmod -R 755 public/
chmod -R 777 logs/ cache/

# Configure web server to point to public/index.php
```

## Database Migrations

### Running Migrations

```bash
# MySQL
php run_migrations.php

# PostgreSQL
php run_migrations.php --driver=postgres

# With custom connection
php run_migrations.php --host=localhost --port=3306 --db=chamilo --user=root
```

### Migration Files
- `migrations/001_init.sql` - Base schema
- `migrations/002_branding.sql` - Branding tables
- `migrations/003_branding.sql` - Branding updates
- `migrations/004_tournaments.sql` - Tournament system
- `migrations/005_email_queue.sql` - Email notifications
- `migrations/006_billing.sql` - Billing system

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify database credentials in `.env`
   - Check database server is running
   - Ensure database exists

2. **Migration Errors**
   - Check for existing tables
   - Verify migration order
   - Review error logs in `logs/`

3. **Permission Errors**
   - Set proper file permissions
   - Ensure web server user can write to `logs/` and `cache/`

4. **404 Errors**
   - Verify BASE_PATH in `.env`
   - Check web server rewrite rules
   - Ensure `public/index.php` is accessible

## Health Checks

```bash
# Check system status
php bin/diagnose.php

# Test database connection
php -r "require 'src/Database.php'; \TouchBase\Database::getInstance();"

# Verify routes
curl http://localhost/touchbase/api/health
```

## Monitoring

- Application logs: `logs/app.log`
- Error logs: `logs/error.log`
- Database logs: Check your database server logs
- Web server logs: Check Apache/Nginx logs

## Security Considerations

1. **Production Settings**
   - Set `DEBUG=false` in production
   - Use strong database passwords
   - Enable HTTPS
   - Configure proper CORS headers

2. **File Permissions**
   - Restrict write access to necessary directories only
   - Protect `.env` file from web access
   - Secure `vendor/` directory

3. **Regular Updates**
   - Keep PHP and dependencies updated
   - Monitor security advisories
   - Regular backups