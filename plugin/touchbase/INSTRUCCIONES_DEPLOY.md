# 🚀 Instrucciones de Deploy - TouchBase

**Proyecto**: TouchBase (Baseball Club Management for Chamilo)
**Dominio**: touchbase.sujeto10.com
**Versión**: Sprint 2 - Production Value & AI Upgrade

---

## 📋 Contexto Importante

### Nombres Correctos
- ✅ **Proyecto**: TouchBase (NO PelotaPack)
- ✅ **Dominio**: touchbase.sujeto10.com
- ✅ **Directorio**: plugin/touchbase
- ✅ **Tablas DB**: touchbase_* (prefijo)
- ✅ **Ruta Web**: /touchbase

### App Padre vs TouchBase
- **sujeto10.com** - App padre (ajeno a este proyecto)
- **touchbase.sujeto10.com** - Este proyecto (subdomain)

---

## ⚡ Deploy Local (Quick Start)

### 1 Comando (Recomendado)

```bash
cd /Users/nadalpiantini/Dev/chamilo-lms/chamilo-lms/plugin/touchbase
./deploy_local.sh
```

**Eso es todo.** El script hace:
- Valida pre-requisitos
- Ejecuta migraciones
- Verifica tablas
- Da instrucciones de testing

---

## 📦 Deploy Paso a Paso

### Paso 1: Verificar Pre-requisitos

**Necesitas MySQL/MariaDB o Docker**:

```bash
# Opción A: MySQL local
brew services start mysql
mysql -u root -e "SHOW DATABASES"

# Opción B: Docker
docker compose up -d
docker compose ps
```

### Paso 2: Crear Base de Datos (si no existe)

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS chamilo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
```

### Paso 3: Ejecutar Migraciones

```bash
cd plugin/touchbase

# Opción A: Script automatizado
./deploy_local.sh

# Opción B: Solo migraciones
./run_migrations_simple.sh

# Opción C: Manual con PHP
php run_migrations.php
```

### Paso 4: Verificar Tablas Creadas

```bash
mysql -u root chamilo -e "SHOW TABLES LIKE 'touchbase_%'"
```

**Deberías ver** (17+ tablas):
- touchbase_clubs
- touchbase_seasons
- touchbase_teams
- touchbase_roster
- touchbase_schedule
- touchbase_attendance
- touchbase_stats
- touchbase_tournaments
- touchbase_matches
- touchbase_tenants (Sprint 2)
- touchbase_email_queue (Sprint 2)
- touchbase_billing_transactions (Sprint 2)
- touchbase_billing_config (Sprint 2)
- touchbase_migrations (tracking)

### Paso 5: Verificar UI

```bash
# Abrir en navegador
open http://localhost/touchbase/ai/assistant

# O curl para verificar
curl http://localhost/touchbase/ | grep "TouchBase"
```

**Deberías ver**:
- ✅ Navbar con gradiente
- ✅ Logo y nombre "TouchBase"
- ✅ Link destacado "💬 AI Assistant"
- ✅ Colores WCAG AA (#0284c7, #16a34a, #ea580c, #dc2626)

### Paso 6: Test API

```bash
# Health check
curl http://localhost/touchbase/api/health | jq

# AI suggestions
curl http://localhost/touchbase/api/ai/suggestions | jq

# Teams
curl http://localhost/touchbase/api/teams | jq
```

**Respuesta esperada**:
```json
{
  "status": "ok",
  "service": "TouchBase API",
  "version": "1.0.0"
}
```

---

## 🌐 Configuración para Producción

### Editar .env para Producción

```bash
# En plugin/touchbase/.env

# Dominio real
BASE_URL=https://touchbase.sujeto10.com
BASE_PATH=/touchbase
APP_ENV=production
DEBUG=false

# Database (producción)
DB_HOST=tu-db-host.rds.amazonaws.com
DB_PORT=3306
DB_NAME=touchbase_prod
DB_USER=touchbase_user
DB_PASS=tu_password_segura

# AWS Bedrock (para AI Assistant)
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
DEEPSEEK_MODEL=deepseek.r1

# Stripe (para Billing)
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SMTP (para Notifications)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG...
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/touchbase.sujeto10.com

server {
    listen 80;
    server_name touchbase.sujeto10.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name touchbase.sujeto10.com;

    # SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/touchbase.sujeto10.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/touchbase.sujeto10.com/privkey.pem;

    root /var/www/chamilo;
    index index.php;

    # TouchBase plugin
    location /touchbase {
        alias /var/www/chamilo/plugin/touchbase/public;
        try_files $uri $uri/ /touchbase/index.php?$query_string;

        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        }
    }

    # Main Chamilo
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
    }
}
```

Activar:
```bash
sudo ln -s /etc/nginx/sites-available/touchbase.sujeto10.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d touchbase.sujeto10.com
```

---

## 🧪 Smoke Tests Post-Deploy

### Test 1: Health Check
```bash
curl https://touchbase.sujeto10.com/touchbase/api/health
```

**Esperado**: `{"status":"ok",...}`

### Test 2: UI Principal
```bash
open https://touchbase.sujeto10.com/touchbase/
```

**Esperado**: Dashboard con navbar TouchBase

### Test 3: AI Assistant
```bash
open https://touchbase.sujeto10.com/touchbase/ai/assistant
```

**Esperado**: Formulario de pregunta funcional

### Test 4: API Completo
```bash
# Teams
curl https://touchbase.sujeto10.com/touchbase/api/teams

# AI Suggestions
curl https://touchbase.sujeto10.com/touchbase/api/ai/suggestions

# Standings
curl https://touchbase.sujeto10.com/touchbase/api/standings?season_id=1
```

---

## 🐛 Troubleshooting

### Error: "Class TouchBase\... not found"

**Causa**: Autoload no regenerado
**Fix**:
```bash
cd plugin/touchbase
composer dump-autoload
```

### Error: "Table touchbase_teams doesn't exist"

**Causa**: Migraciones no ejecutadas
**Fix**:
```bash
cd plugin/touchbase
./run_migrations_simple.sh
```

### Error: "404 Not Found" en /touchbase

**Causa**: Nginx config incorrecta
**Fix**: Verificar que el `alias` apunta a `plugin/touchbase/public` (no touchbase)

### Error: "Permission denied" en scripts

**Fix**:
```bash
chmod +x deploy_local.sh
chmod +x run_migrations_simple.sh
chmod +x deploy.sh
```

---

## 📚 Documentación de Referencia

| Documento | Descripción |
|-----------|-------------|
| REFACTORING_COMPLETE.md | Cambios de PelotaPack → TouchBase |
| QUICKDEPLOY.md | Deploy en 1 comando |
| DEPLOY_LOCAL.md | Guía paso a paso local |
| SPRINT2_SUMMARY.md | Resumen Sprint 2 completo |
| TODO_SPRINT3.md | Roadmap próximo sprint |
| RESEARCH/* | Community insights + roundtable |

---

## ✅ Checklist de Deploy

### Local
- [ ] MySQL/Docker corriendo
- [ ] Base de datos `chamilo` creada
- [ ] Migraciones ejecutadas
- [ ] Tablas touchbase_* verificadas
- [ ] UI accesible en http://localhost/touchbase
- [ ] API responde correctamente

### Producción (touchbase.sujeto10.com)
- [ ] Servidor con PHP 8.3+, MySQL/MariaDB
- [ ] Nginx configurado con alias /touchbase
- [ ] SSL certificate instalado
- [ ] .env con credenciales de producción
- [ ] Migraciones ejecutadas en DB producción
- [ ] AWS credentials configuradas (AI)
- [ ] Stripe keys configuradas (Billing)
- [ ] SMTP configurado (Notifications)
- [ ] DNS apuntando a servidor
- [ ] Smoke tests pasados

---

## 🎯 Próximos Pasos

### Inmediato (Hoy)
1. Ejecutar `./deploy_local.sh` en plugin/touchbase
2. Verificar que la UI carga
3. Test API con curl

### Producción (Esta Semana)
1. Configurar servidor con Nginx + PHP + MySQL
2. Deploy código a servidor
3. Configurar .env de producción
4. Ejecutar migraciones
5. Configurar SSL
6. Smoke tests en producción

### Sprint 3 (Próximas 2-3 Semanas)
Ver roadmap completo en `TODO_SPRINT3.md`

---

**Fecha**: 2025-10-15
**Status**: ✅ **REFACTORING 100% COMPLETO - LISTO PARA DEPLOY**
**Proyecto**: TouchBase for Chamilo LMS
**Stack**: PHP 8.3 · MariaDB 10.6 · Nginx · Docker
