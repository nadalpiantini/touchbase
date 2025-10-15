# TouchBase - Guía de Instalación Rápida

Instalación paso a paso del plugin TouchBase para Chamilo LMS.

---

## 📋 Requisitos Previos

- ✅ Docker y Docker Compose instalados
- ✅ Chamilo 1.11.32 corriendo en contenedores
- ✅ Acceso a la línea de comandos
- ✅ Permisos de administrador en Chamilo

---

## 🚀 Instalación Automática (Recomendada)

### Opción 1: Desde el contenedor Docker (Preferida)

```bash
# 1. Acceder al contenedor PHP
docker compose exec app bash

# 2. Navegar al plugin
cd /var/www/html/plugin/touchbase

# 3. Ejecutar script de instalación
bash bin/setup.sh
```

### Opción 2: Desde tu máquina local

```bash
# Ejecutar el script que manejará todo automáticamente
docker compose exec app bash /var/www/html/plugin/touchbase/bin/setup.sh
```

El script automáticamente:
- ✅ Crea el archivo .env
- ✅ Genera APP_KEY segura
- ✅ Verifica conexión a base de datos
- ✅ Ejecuta todas las migraciones
- ✅ Ejecuta diagnóstico completo

---

## 🔧 Instalación Manual

Si prefieres hacerlo paso a paso:

### Paso 1: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cd plugin/touchbase
cp .env.example .env

# Generar APP_KEY segura
NEW_KEY=$(openssl rand -base64 32)
sed -i "s/APP_KEY=.*/APP_KEY=$NEW_KEY/" .env
```

Verificar que `.env` contiene:
```env
DB_HOST=db
DB_PORT=3306
DB_NAME=chamilo
DB_USER=chamilo
DB_PASS=chamilo
BASE_PATH=/touchbase
APP_KEY=<tu-key-generada>
```

### Paso 2: Aplicar Migraciones de Base de Datos

```bash
# Ejecutar todas las migraciones en orden
cd /var/www/html/plugin/touchbase

# Dentro del contenedor:
for migration in migrations/*.sql; do
  mysql -h db -u chamilo -pchamilo chamilo < "$migration"
  echo "✓ Applied: $migration"
done
```

O manualmente una por una:
```bash
docker compose exec db mysql -uchamilo -pchamilo chamilo < plugin/touchbase/migrations/001_init.sql
docker compose exec db mysql -uchamilo -pchamilo chamilo < plugin/touchbase/migrations/002_sample_data.sql
docker compose exec db mysql -uchamilo -pchamilo chamilo < plugin/touchbase/migrations/003_branding.sql
docker compose exec db mysql -uchamilo -pchamilo chamilo < plugin/touchbase/migrations/004_tournaments.sql
```

### Paso 3: Configurar Nginx

Añadir esta configuración a tu archivo de configuración de Nginx (usualmente en `docker/nginx/default.conf` o similar):

```nginx
# TouchBase Plugin
location ^~ /touchbase {
  alias /var/www/html/plugin/touchbase/public;
  index index.php;

  # Handle PHP files
  location ~ \.php$ {
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $request_filename;
    fastcgi_pass app:9000;
  }

  # Handle static assets
  location ~* \.(css|js|jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot)$ {
    expires 7d;
    add_header Cache-Control "public, immutable";
  }
}
```

### Paso 4: Reiniciar Nginx

```bash
docker compose restart web
```

### Paso 5: Verificar Instalación

```bash
# Ejecutar diagnóstico
docker compose exec app php /var/www/html/plugin/touchbase/bin/diagnose.php
```

Deberías ver:
```
✓ Successes: 23+
⚠ Warnings:  0-1
✗ Errors:    0
```

---

## ✅ Verificación Post-Instalación

### 1. Verificar Base de Datos

```bash
docker compose exec db mysql -uchamilo -pchamilo -e "SHOW TABLES LIKE 'pelota_%';" chamilo
```

Deberías ver al menos estas tablas:
- `pelota_attendance`
- `pelota_clubs`
- `pelota_roster`
- `pelota_schedule`
- `pelota_seasons`
- `pelota_stats`
- `pelota_teams`
- `pelota_tenants`

### 2. Verificar Acceso Web

Abre en tu navegador:
```
http://localhost/touchbase
```

Deberías ver el dashboard de TouchBase.

### 3. Verificar API

```bash
curl http://localhost/touchbase/api/teams
```

Respuesta esperada:
```json
{"data":[]}
```

O si ejecutaste las migraciones de datos de ejemplo:
```json
{"data":[{"id":1,"name":"Tigres U12",...},...]}
```

---

## 🎨 Activar Tema ClubBall (Opcional)

### Copiar Tema a Chamilo

```bash
# Copiar tema a directorio de temas de Chamilo
docker compose exec app bash -c "
  cp -r /var/www/html/plugin/touchbase/themes/clubball \
        /var/www/html/main/css/themes/clubball
"
```

### Activar en Chamilo

1. Acceder como administrador a Chamilo
2. Ir a **Administración** → **Configuración** → **Apariencia**
3. Seleccionar **clubball** en el selector de temas
4. Guardar cambios

---

## 🔍 Solución de Problemas

Si encuentras algún problema durante la instalación:

1. **Ejecutar diagnóstico completo**:
   ```bash
   docker compose exec app php /var/www/html/plugin/touchbase/bin/diagnose.php
   ```

2. **Consultar la guía de troubleshooting**:
   ```bash
   cat plugin/touchbase/TROUBLESHOOTING.md
   ```

3. **Verificar logs**:
   ```bash
   # Logs de PHP-FPM
   docker compose logs app | tail -50

   # Logs de Nginx
   docker compose logs web | tail -50

   # Logs de MySQL
   docker compose logs db | tail -50
   ```

### Problemas Comunes

| Problema | Solución Rápida |
|----------|-----------------|
| "Database connection failed" | Verificar que DB_HOST=db en .env |
| "404 Not Found" en /touchbase | Verificar configuración de Nginx y reiniciar |
| "500 Internal Server Error" | Ver logs de PHP: `docker compose logs app` |
| Tablas no existen | Re-ejecutar migraciones |

---

## 📂 Estructura de Archivos

```
plugin/touchbase/
├── bin/
│   ├── setup.sh          # Script de instalación automática
│   └── diagnose.php      # Script de diagnóstico
├── migrations/
│   ├── 001_init.sql      # Tablas principales
│   ├── 002_sample_data.sql
│   ├── 003_branding.sql
│   └── 004_tournaments.sql
├── public/
│   └── index.php         # Punto de entrada público
├── src/
│   ├── bootstrap.php     # Inicialización
│   ├── Config.php        # Configuración
│   ├── Database.php      # Conexión DB
│   ├── Router.php        # Enrutador
│   ├── Controllers/      # Controladores
│   ├── Http/             # Request/Response
│   ├── Middleware/       # Auth, etc.
│   └── Utils/            # Utilidades
├── views/                # Plantillas HTML
├── .env                  # Configuración (crear de .env.example)
├── .env.example          # Plantilla de configuración
├── INSTALLATION.md       # Esta guía
└── TROUBLESHOOTING.md    # Guía de problemas
```

---

## 🎯 Próximos Pasos

Una vez instalado:

1. **Configurar tu primer club**:
   - Visitar http://localhost/touchbase
   - Crear un club y temporada
   - Añadir equipos

2. **Importar datos** (si tienes):
   - Usar endpoints de importación CSV
   - Ver documentación de API

3. **Configurar permisos**:
   - Asignar roles de Coach a usuarios
   - Configurar acceso por equipo

4. **Personalizar branding**:
   - Actualizar colores en la base de datos
   - Subir logo del club

---

## 📚 Documentación Adicional

- **API Reference**: `docs/API.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Development**: `docs/DEVELOPMENT.md`
- **Changelog**: `CHANGELOG.md`

---

## 🆘 Soporte

Si necesitas ayuda:

1. Revisar `TROUBLESHOOTING.md`
2. Ejecutar `bin/diagnose.php`
3. Consultar logs de Docker
4. Crear un issue en GitHub

---

**Versión**: 1.0.0
**Última actualización**: 2025-10-15
**Compatibilidad**: Chamilo LMS 1.11.32+
