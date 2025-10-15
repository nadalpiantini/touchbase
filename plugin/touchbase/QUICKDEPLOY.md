# 🚀 Quick Deploy - TouchBase Sprint 2

Guía ultra-rápida para deployar Sprint 2 localmente en menos de 5 minutos.

---

## ⚡ Quick Start (1 comando)

```bash
cd plugin/touchbase_pack && ./deploy_local.sh
```

**Eso es todo.** El script valida pre-requisitos, ejecuta migraciones y te da instrucciones.

---

## 📋 Pre-requisitos

Necesitas **UNA** de estas opciones:

### Opción A: MySQL Local
```bash
# macOS con Homebrew
brew services start mysql

# Linux
sudo systemctl start mysql

# Verificar
mysql -u root -e "SELECT 1"
```

### Opción B: Docker
```bash
# Iniciar Docker Desktop (macOS/Windows)
# O en Linux:
sudo systemctl start docker

# Iniciar containers
docker compose up -d
```

---

## 🐛 Si Algo Falla

### Error: "Database not accessible"

**Solución**:
```bash
# Opción 1: Iniciar MySQL
brew services start mysql
mysql -u root -e "CREATE DATABASE IF NOT EXISTS chamilo"

# Opción 2: Iniciar Docker
docker compose up -d
sleep 30  # Esperar a que inicie
```

### Error: "Class not found"

**Solución**:
```bash
composer dump-autoload
php run_migrations.php
```

### Error: "Permission denied: ./deploy_local.sh"

**Solución**:
```bash
chmod +x deploy_local.sh
./deploy_local.sh
```

---

## ✅ Verificación Post-Deploy

### 1. UI Check
```bash
open http://localhost/touchbase/ai/assistant
```

**Deberías ver**:
- ✅ Navbar con gradiente de colores
- ✅ Link "💬 AI Assistant" destacado
- ✅ Formulario de pregunta
- ✅ Preguntas sugeridas

### 2. API Check
```bash
curl http://localhost/touchbase/api/health | jq
curl http://localhost/touchbase/api/ai/suggestions | jq
```

**Respuesta esperada**:
```json
{
  "status": "ok",
  "service": "TouchBase API",
  "version": "1.0.0"
}
```

### 3. Database Check
```bash
# Ver que las tablas se crearon
mysql -u root chamilo -e "SHOW TABLES LIKE 'pelota_%'"
```

**Deberías ver**:
- pelota_tenants
- pelota_email_queue
- pelota_billing_transactions
- pelota_billing_config
- (y todas las tablas de Sprint 1)

---

## 🎯 Quick Troubleshooting

| Problema | Solución Rápida |
|----------|-----------------|
| No database | `brew services start mysql` |
| No Docker | Instalar Docker Desktop |
| Permission denied | `chmod +x deploy_local.sh` |
| Class not found | `composer dump-autoload` |
| 404 on /touchbase | Verificar Nginx config |

---

## 📚 Documentación Completa

Para más detalles:
- **DEPLOY_LOCAL.md** - Guía completa de deployment
- **SPRINT2_SUMMARY.md** - Resumen del Sprint 2
- **TROUBLESHOOTING.md** - Resolución de problemas

---

**Tiempo estimado**: 5 minutos (con DB corriendo)
**Dificultad**: ⭐ Fácil
