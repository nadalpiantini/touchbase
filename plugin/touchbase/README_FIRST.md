# 🎯 LÉEME PRIMERO - TouchBase Deploy

## ✅ Refactoring Completado

Todo el proyecto ha sido refactorizado de **PelotaPack** a **TouchBase**.

---

## 📍 Información Clave

| Item | Valor |
|------|-------|
| **Proyecto** | TouchBase (Baseball Club Management) |
| **Dominio** | touchbase.sujeto10.com |
| **Directorio** | plugin/touchbase |
| **Rutas Web** | /touchbase/* |
| **Tablas DB** | touchbase_* (prefijo) |
| **Namespace** | TouchBase\ |

---

## 🚀 Deploy Local EN 3 PASOS

### 1. Inicia MySQL

```bash
brew services start mysql
# O si usas Docker:
docker compose up -d
```

### 2. Deploy Automático

```bash
cd plugin/touchbase
./deploy_local.sh
```

### 3. Abre la UI

```bash
open http://localhost/touchbase/ai/assistant
```

---

## 📚 Documentación

| Archivo | Para qué sirve |
|---------|----------------|
| **INSTRUCCIONES_DEPLOY.md** | Guía completa de deploy (local + prod) |
| **QUICKDEPLOY.md** | Deploy rápido (1 comando) |
| **REFACTORING_COMPLETE.md** | Detalles del refactoring PelotaPack→TouchBase |
| **SPRINT2_SUMMARY.md** | Resumen completo del Sprint 2 |
| **TODO_SPRINT3.md** | Roadmap del próximo sprint |
| **DEPLOY_LOCAL.md** | Troubleshooting y opciones avanzadas |

---

## ⚡ Quick Commands

```bash
# Deploy local completo
cd plugin/touchbase && ./deploy_local.sh

# Solo migraciones
cd plugin/touchbase && ./run_migrations_simple.sh

# Verificar salud del sistema
curl http://localhost/touchbase/api/health | jq

# Test AI
curl http://localhost/touchbase/api/ai/suggestions | jq
```

---

## 🔧 Configuración Opcional

### Para AI Assistant (DeepSeek)

Edita `plugin/touchbase/.env`:
```bash
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-2
DEEPSEEK_MODEL=deepseek.r1
```

### Para Billing (Stripe)

```bash
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
```

### Para Notifications (Email)

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG...
```

---

## ✅ Qué Está Incluido (Sprint 2)

- ✅ UI Design System (WCAG AA compliant)
- ✅ Multi-Tenant Branding (colores + logo)
- ✅ AI Assistant con DeepSeek (stub + guardrails)
- ✅ Notifications (Email queue)
- ✅ Billing (Stripe checkout stub)
- ✅ Traducciones EN/ES completas
- ✅ 24 archivos nuevos + 8 modificados
- ✅ Documentación exhaustiva

---

## 🎯 Status

**Refactoring**: ✅ 100% Completo (~560 referencias actualizadas)
**Testing**: ⏳ Requiere MySQL inicializado
**Deploy**: ⏳ Listo para ejecutar

---

## 🆘 Si Algo Falla

Ver **INSTRUCCIONES_DEPLOY.md** sección "Troubleshooting" para:
- Class not found → composer dump-autoload
- Table doesn't exist → run migrations
- 404 errors → check Nginx config
- Permission denied → chmod +x scripts

---

**Next**: Ejecuta `./deploy_local.sh` y sigue las instrucciones.

