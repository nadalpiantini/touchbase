# TouchBase Installation Guide

Complete step-by-step installation instructions for different environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development (Docker)](#local-development-docker)
- [Production Deployment](#production-deployment)
- [Post-Installation](#post-installation)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- PHP 8.2 or 8.3
- MySQL 5.7+ or MariaDB 10.3+
- Nginx or Apache with mod_rewrite
- Chamilo LMS 1.11.32+

### PHP Extensions Required

```bash
# Check if extensions are installed
php -m | grep -E 'pdo|mysqli|gd|intl|zip|mbstring|xml|curl'
```

Required extensions:
- `pdo_mysql`
- `mysqli`
- `gd`
- `intl`
- `zip`
- `mbstring`
- `xml`
- `curl`

---

## Local Development (Docker)

### Step 1: Clone Chamilo

```bash
mkdir -p ~/Dev/chamilo-project
cd ~/Dev/chamilo-project

# Download Chamilo 1.11.32
curl -L -o chamilo.zip https://github.com/chamilo/chamilo-lms/releases/download/v1.11.32/chamilo-1.11.32-php8.3.zip
unzip chamilo.zip -d chamilo
```

### Step 2: Add TouchBase Plugin

```bash
cd chamilo/plugin
git clone https://github.com/yourusername/touchbase.git

# OR from local development
cp -r /path/to/touchbase ./
```

### Step 3: Create Docker Compose Setup

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  web:
    image: nginx:stable
    ports:
      - "80:80"
    volumes:
      - ./chamilo:/var/www/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
      - db

  app:
    image: php:8.3-fpm
    volumes:
      - ./chamilo:/var/www/html
    environment:
      PHP_MEMORY_LIMIT: 512M
    depends_on:
      - db
      - redis
    command: >
      bash -c "
      apt-get update &&
      apt-get install -y libpng-dev libjpeg-dev libfreetype6-dev libxml2-dev libzip-dev libicu-dev libonig-dev libcurl4-openssl-dev &&
      docker-php-ext-configure gd --with-freetype --with-jpeg &&
      docker-php-ext-install gd mysqli pdo pdo_mysql intl zip opcache curl mbstring xml &&
      php-fpm
      "

  db:
    image: mariadb:10.6
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: chamilo
      MYSQL_USER: chamilo
      MYSQL_PASSWORD: chamilo
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  db_data:
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.php index.html;

    client_max_body_size 64M;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ^~ /touchbase {
        alias /var/www/html/plugin/touchbase/public;
        index index.php;

        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            fastcgi_pass app:9000;
        }
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass app:9000;
    }
}
```

### Step 4: Configure Plugin

```bash
cd chamilo/plugin/touchbase
cp .env.example .env
```

Edit `.env`:

```env
DB_HOST=db
DB_PORT=3306
DB_NAME=chamilo
DB_USER=chamilo
DB_PASS=chamilo

BASE_PATH=/touchbase
DEFAULT_LANG=en
SUPPORTED_LANGS=en,es
DEBUG=true
```

### Step 5: Start Services

```bash
cd ~/Dev/chamilo-project
docker compose up -d
```

### Step 6: Install Chamilo

Visit `http://localhost` and complete the Chamilo installation wizard.

Database settings:
- **Host**: `db`
- **Database**: `chamilo`
- **User**: `chamilo`
- **Password**: `chamilo`

### Step 7: Run Plugin Migration

```bash
docker compose exec db bash -c "mysql -uchamilo -pchamilo chamilo < /var/www/html/plugin/touchbase/migrations/001_init.sql"
```

### Step 8: Test Plugin

Visit `http://localhost/touchbase`

---

## Production Deployment

### Step 1: Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y nginx php8.3-fpm php8.3-mysql php8.3-gd php8.3-intl \
  php8.3-zip php8.3-mbstring php8.3-xml php8.3-curl mariadb-server redis-server
```

### Step 2: Install Chamilo

```bash
cd /var/www
sudo curl -L -o chamilo.zip https://github.com/chamilo/chamilo-lms/releases/download/v1.11.32/chamilo-1.11.32-php8.3.zip
sudo unzip chamilo.zip -d chamilo
sudo chown -R www-data:www-data chamilo
```

### Step 3: Configure Database

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE chamilo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'chamilo_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON chamilo.* TO 'chamilo_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 4: Install Plugin

```bash
cd /var/www/chamilo/plugin
sudo git clone https://github.com/yourusername/touchbase.git
sudo chown -R www-data:www-data touchbase

cd touchbase
sudo -u www-data cp .env.example .env
sudo -u www-data nano .env
```

Configure `.env` with production values:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=chamilo
DB_USER=chamilo_user
DB_PASS=STRONG_PASSWORD_HERE

BASE_PATH=/touchbase
DEFAULT_LANG=en
SUPPORTED_LANGS=en,es
DEBUG=false
```

### Step 5: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/chamilo
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    root /var/www/chamilo;
    index index.php;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    client_max_body_size 100M;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ^~ /touchbase {
        alias /var/www/chamilo/plugin/touchbase/public;
        index index.php;

        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        }
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/chamilo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Run Migration

```bash
mysql -u chamilo_user -p chamilo < /var/www/chamilo/plugin/touchbase/migrations/001_init.sql
```

### Step 7: Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/chamilo
sudo chmod -R 755 /var/www/chamilo
sudo chmod -R 775 /var/www/chamilo/app/cache
sudo chmod -R 775 /var/www/chamilo/app/upload
```

---

## Post-Installation

### 1. Test Access

Visit your installation:
- Main site: `https://your-domain.com`
- TouchBase: `https://your-domain.com/touchbase`

### 2. Create Demo Data

Use the API to create a club and season:

```bash
curl -X POST https://your-domain.com/touchbase/api/clubs \
  -H 'Content-Type: application/json' \
  -d '{"name": "My Baseball Club", "city": "Santo Domingo"}'
```

### 3. Configure Backups

```bash
# Database backup script
sudo nano /usr/local/bin/backup-chamilo.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u chamilo_user -p'PASSWORD' chamilo | gzip > /backups/chamilo_$DATE.sql.gz
find /backups -name "chamilo_*.sql.gz" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-chamilo.sh
sudo crontab -e
```

Add:
```
0 2 * * * /usr/local/bin/backup-chamilo.sh
```

---

## Troubleshooting

### Issue: 404 Not Found on /touchbase

**Solution**: Check Nginx configuration

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Issue: Database Connection Failed

**Solution**: Verify `.env` credentials

```bash
cd /var/www/chamilo/plugin/touchbase
cat .env
mysql -h DB_HOST -u DB_USER -p DB_NAME
```

### Issue: White Screen / PHP Errors

**Solution**: Check PHP error logs

```bash
sudo tail -f /var/log/php8.3-fpm.log
sudo tail -f /var/log/nginx/error.log
```

Enable debug mode in `.env`:
```env
DEBUG=true
```

### Issue: Language Not Switching

**Solution**: Clear session and cookies

```bash
# Redis (if used for sessions)
redis-cli FLUSHDB

# File sessions
sudo rm -rf /var/lib/php/sessions/*
```

### Issue: Permission Denied

**Solution**: Fix ownership

```bash
sudo chown -R www-data:www-data /var/www/chamilo/plugin/touchbase
sudo chmod -R 755 /var/www/chamilo/plugin/touchbase
```

---

## Next Steps

- [Configure user roles](README.md#usage)
- [Set up OIDC/SSO](README.md#roadmap)
- [Enable xAPI tracking](README.md#roadmap)
- [Customize theme](README.md#development)

For more help, visit: https://github.com/yourusername/touchbase/issues
