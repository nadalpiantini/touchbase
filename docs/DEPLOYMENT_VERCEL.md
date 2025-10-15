# Deployment Guide: touchbase.sujeto10.com

**Auto-deployment GitHub → Vercel → Domain**

---

## 📋 Requisitos Previos

✅ Cuenta en [Vercel](https://vercel.com)
✅ Cuenta GitHub con acceso al repo [nadalpiantini/touchbase](https://github.com/nadalpiantini/touchbase)
✅ Dominio `sujeto10.com` con acceso a DNS

---

## 🚀 Paso 1: Conectar GitHub a Vercel

### 1.1 Importar Proyecto desde GitHub

```bash
# URL: https://vercel.com/new
```

1. **Login** en Vercel con GitHub
2. Click **"Import Project"**
3. Click **"Import Git Repository"**
4. Seleccionar: `nadalpiantini/touchbase`
5. Click **"Import"**

### 1.2 Configurar Proyecto

**Project Name**: `touchbase-sujeto10`

**Framework Preset**: `Other` (PHP personalizado)

**Root Directory**: `.` (dejar vacío o root)

**Build & Output Settings**:
- Build Command: (dejar vacío)
- Output Directory: `public`
- Install Command: (dejar vacío)

---

## 🔧 Paso 2: Variables de Entorno

En Vercel Dashboard → **Settings** → **Environment Variables**, agregar:

### Production Variables

```env
# Database (reemplaza con tus valores)
DB_HOST=tu-db-host.com
DB_PORT=3306
DB_NAME=touchbase_prod
DB_USER=touchbase_user
DB_PASS=tu-password-seguro

# Application
APP_ENV=production
APP_URL=https://touchbase.sujeto10.com
BASE_PATH=/
DEFAULT_LANG=en
SUPPORTED_LANGS=en,es
DEBUG=false

# App Key (genera uno random de 32 caracteres)
APP_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Generar APP_KEY seguro

```bash
# En terminal local:
openssl rand -base64 32
```

---

## 🌐 Paso 3: Configurar Dominio

### 3.1 Agregar Dominio en Vercel

1. Ve a **Settings** → **Domains**
2. Click **"Add"**
3. Ingresa: `touchbase.sujeto10.com`
4. Click **"Add"**

Vercel te dará los DNS records a configurar.

### 3.2 Configurar DNS en tu Proveedor

En el panel de DNS de `sujeto10.com`, agregar:

**Opción A: CNAME (Recomendado)**
```
Type: CNAME
Name: touchbase
Value: cname.vercel-dns.com
TTL: Auto
```

**Opción B: A Record**
```
Type: A
Name: touchbase
Value: 76.76.21.21
TTL: Auto
```

⏱️ **Esperar propagación DNS**: 5-30 minutos

### 3.3 Verificar Dominio

En Vercel, esperar hasta ver:

```
✅ touchbase.sujeto10.com - Valid Configuration
```

Vercel automáticamente configurará **SSL/HTTPS** con Let's Encrypt.

---

## 🔄 Paso 4: Auto-Deployment desde GitHub

### 4.1 Configurar Production Branch

En Vercel → **Settings** → **Git**:

- **Production Branch**: `master` o `main` (según tu repo)
- **Deploy Previews**: Habilitado (opcional)
- **Auto Deploy**: ✅ Enabled

### 4.2 Trigger Deployment

Ahora cada `git push` a `master` automáticamente deployará:

```bash
# Workflow normal
git add .
git commit -m "feat: new feature"
git push origin master

# Vercel automáticamente:
# 1. Detecta el push
# 2. Ejecuta build
# 3. Deploya a touchbase.sujeto10.com
# 4. Notifica en GitHub commit check
```

---

## 📦 Paso 5: Primera Deployment Manual (Opcional)

Si quieres deployar inmediatamente sin esperar push:

### Desde Dashboard
1. Ve a **Deployments**
2. Click **"Redeploy"** en el último deployment

### Desde CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## ✅ Paso 6: Verificar Deployment

### 6.1 Health Check

```bash
# Test básico
curl https://touchbase.sujeto10.com

# Test API
curl https://touchbase.sujeto10.com/api/teams

# Test desde navegador
open https://touchbase.sujeto10.com
```

### 6.2 Verificar SSL

```bash
# Check certificado SSL
openssl s_client -connect touchbase.sujeto10.com:443 -servername touchbase.sujeto10.com
```

Debe mostrar:
```
Verification: OK
```

---

## 🔍 Paso 7: Monitoring y Logs

### Ver Logs en Tiempo Real

1. Vercel Dashboard → **Deployments**
2. Click en deployment actual
3. Ver **Function Logs** (logs de PHP)

### Ver Errores

```bash
# En Vercel Dashboard:
Project → Settings → Functions → Runtime
```

---

## 🎯 Workflow Completo de Trabajo

### Desarrollo Local
```bash
# 1. Hacer cambios
vim src/Controllers/SomeController.php

# 2. Test local
./deploy_local.sh

# 3. Commit y push
git add .
git commit -m "feat: add new feature"
git push origin master

# 4. Vercel auto-deploya a producción
# Ver en: https://touchbase.sujeto10.com
```

### Preview Deployments (Opcional)

Para features en desarrollo sin afectar producción:

```bash
# Crear feature branch
git checkout -b feature/new-thing

# Hacer cambios y push
git push origin feature/new-thing

# Vercel crea preview en:
# https://touchbase-sujeto10-<hash>.vercel.app
```

---

## 🐛 Troubleshooting

### Error: "No Builds Found"

**Solución**: Verificar que `vercel.json` esté en root del repo.

```bash
git status
# Debe mostrar: vercel.json
```

### Error: "PHP Runtime Not Found"

**Solución**: Verificar builds en `vercel.json`:

```json
"builds": [
  {
    "src": "public/index.php",
    "use": "vercel-php@0.6.0"
  }
]
```

### Error: Database Connection Failed

**Solución**: Verificar variables de entorno en Vercel:

1. Settings → Environment Variables
2. Confirmar DB_HOST, DB_USER, DB_PASS
3. Redeploy después de cambiar

### Dominio No Resuelve

**Solución**:
```bash
# Verificar DNS
dig touchbase.sujeto10.com

# Debe mostrar:
# touchbase.sujeto10.com. 300 IN CNAME cname.vercel-dns.com.
```

Si no aparece, esperar propagación DNS (hasta 24h).

---

## 📊 Configuración de Database en Producción

### Opción A: Railway (Recomendado para hobby)

```bash
# 1. Crear DB en Railway.app
# 2. Copiar connection string
# 3. Agregar a Vercel env vars
```

### Opción B: PlanetScale (MySQL Serverless)

```bash
# 1. Crear DB en planetscale.com
# 2. Obtener connection string
# 3. Configurar en Vercel
```

### Opción C: Supabase (PostgreSQL)

Requiere cambiar código de MySQL a PostgreSQL.

---

## 🔐 Seguridad

### Secrets en Vercel

Nunca commitear `.env` con valores reales:

```bash
# .gitignore ya incluye:
.env
.env.production
```

### Rotar APP_KEY

Si se compromete, cambiar en Vercel y redeploy:

```bash
# Generar nuevo
openssl rand -base64 32

# Actualizar en Vercel → Settings → Environment Variables
# Redeploy
```

---

## 📈 Monitoreo

### Analytics de Vercel

Habilitado automáticamente en:
- **Project Settings** → **Analytics**

Muestra:
- Visits
- Top Pages
- Top Referrers
- Devices

### Performance Monitoring

Ver en **Deployment Details**:
- Cold Start Time
- Execution Duration
- Memory Usage

---

## 🎉 Resultado Final

✅ **Repositorio**: https://github.com/nadalpiantini/touchbase
✅ **Producción**: https://touchbase.sujeto10.com
✅ **Auto-Deploy**: Cada push a master
✅ **SSL**: Automático con Let's Encrypt
✅ **Logs**: Dashboard de Vercel
✅ **Rollback**: Un click en Vercel deployments

---

## 📞 Recursos

- [Vercel PHP Docs](https://vercel.com/docs/runtimes#official-runtimes/php)
- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

---

**¿Todo configurado?**

Haz un test:

```bash
git commit --allow-empty -m "test: trigger deployment"
git push origin master
```

Ve a Vercel dashboard y observa el deployment automático. 🚀
