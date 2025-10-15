# TouchBase Troubleshooting Guide

Guía completa de solución de problemas para TouchBase.

---

## 🔍 Herramientas de Diagnóstico

### Script de Diagnóstico Rápido

```bash
# Ejecutar dentro del contenedor Docker
docker compose exec app php /var/www/html/plugin/touchbase_pack/bin/diagnose.php

# O directamente si tienes PHP local
php plugin/touchbase_pack/bin/diagnose.php
```

Este script verifica:
- ✓ Estructura de archivos
- ✓ Configuración de entorno (.env)
- ✓ Conexión a base de datos
- ✓ Tablas de base de datos
- ✓ Permisos de archivos
- ✓ Extensiones PHP requeridas

---

## 🚨 Problemas Comunes

### 1. "Database connection failed"

**Síntoma**: Error al conectar a la base de datos

**Causas posibles**:

#### A) Ejecutando fuera de Docker
```bash
# Problema: DB_HOST=db no funciona fuera de Docker
# Solución: Cambiar DB_HOST en .env

# En .env, cambiar:
DB_HOST=db
# A:
DB_HOST=localhost  # o 127.0.0.1
```

#### B) Contenedor de base de datos no iniciado
```bash
# Verificar estado de contenedores
docker compose ps

# Iniciar base de datos
docker compose up -d db

# Ver logs si hay problemas
docker compose logs db
```

#### C) Credenciales incorrectas
```bash
# Verificar credenciales en .env
cat plugin/touchbase_pack/.env | grep DB_

# Deben coincidir con docker-compose.yml
```

### 2. "404 Not Found" al visitar /touchbase

**Síntoma**: Página no encontrada en http://localhost/touchbase

**Causas posibles**:

#### A) Configuración de Nginx faltante

Verificar que existe la configuración:

```bash
# Revisar configuración de Nginx
docker compose exec web cat /etc/nginx/conf.d/default.conf | grep pelota
```

Si no existe, añadir a la configuración de Nginx:

```nginx
location ^~ /touchbase {
  alias /var/www/html/plugin/touchbase_pack/public;
  index index.php;

  location ~ \.php$ {
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $request_filename;
    fastcgi_pass app:9000;
  }
}
```

#### B) Nginx no reiniciado después de cambios
```bash
# Reiniciar Nginx
docker compose restart web

# Verificar logs
docker compose logs web
```

#### C) Ruta incorrecta en BASE_PATH
```bash
# Verificar BASE_PATH en .env
grep BASE_PATH plugin/touchbase_pack/.env

# Debe ser:
BASE_PATH=/touchbase
```

### 3. "500 Internal Server Error"

**Síntoma**: Error 500 al cargar páginas

**Diagnóstico**:

```bash
# Ver logs de PHP-FPM
docker compose logs app | tail -50

# Ver logs de Nginx
docker compose logs web | tail -50

# Verificar permisos
ls -la plugin/touchbase_pack/public/
ls -la plugin/touchbase_pack/views/
```

**Soluciones comunes**:

#### A) Error de sintaxis PHP
```bash
# Verificar sintaxis de todos los archivos
find plugin/touchbase_pack/src -name "*.php" -exec php -l {} \;
```

#### B) Permisos incorrectos
```bash
# Arreglar permisos (dentro del contenedor)
docker compose exec app bash -c "chmod -R 755 /var/www/html/plugin/touchbase_pack"
docker compose exec app bash -c "chmod -R 775 /var/www/html/plugin/touchbase_pack/public"
```

#### C) Archivo faltante
```bash
# Ejecutar diagnóstico
php plugin/touchbase_pack/bin/diagnose.php
```

### 4. Tablas de base de datos faltantes

**Síntoma**: Error "Table 'chamilo.pelota_teams' doesn't exist"

**Solución**: Aplicar migraciones manualmente

```bash
# Opción 1: Usar script de setup
docker compose exec app bash /var/www/html/plugin/touchbase_pack/bin/setup.sh

# Opción 2: Aplicar migraciones manualmente
docker compose exec db bash -c "mysql -uchamilo -pchamilo chamilo < /var/www/html/plugin/touchbase_pack/migrations/001_init.sql"
docker compose exec db bash -c "mysql -uchamilo -pchamilo chamilo < /var/www/html/plugin/touchbase_pack/migrations/002_sample_data.sql"
docker compose exec db bash -c "mysql -uchamilo -pchamilo chamilo < /var/www/html/plugin/touchbase_pack/migrations/003_branding.sql"
docker compose exec db bash -c "mysql -uchamilo -pchamilo chamilo < /var/www/html/plugin/touchbase_pack/migrations/004_tournaments.sql"

# Opción 3: Todas las migraciones de una vez
for f in plugin/touchbase_pack/migrations/*.sql; do
  docker compose exec -T db mysql -uchamilo -pchamilo chamilo < "$f"
done
```

**Verificar tablas**:
```bash
docker compose exec db mysql -uchamilo -pchamilo -e "SHOW TABLES LIKE 'pelota_%';" chamilo
```

### 5. "APP_KEY should be at least 32 characters"

**Síntoma**: Advertencia sobre APP_KEY

**Solución**:

```bash
# Generar nueva APP_KEY
NEW_KEY=$(openssl rand -base64 32)

# Actualizar .env
sed -i.bak "s/APP_KEY=.*/APP_KEY=$NEW_KEY/" plugin/touchbase_pack/.env

# Verificar
grep APP_KEY plugin/touchbase_pack/.env
```

### 6. Páginas en blanco (sin errores)

**Diagnóstico**:

```bash
# Habilitar modo debug en .env
echo "DEBUG=true" >> plugin/touchbase_pack/.env

# Revisar logs de PHP
docker compose logs app --follow

# Probar endpoint directamente
curl -v http://localhost/touchbase/api/teams
```

**Soluciones**:

- Verificar que `session_start()` no cause problemas
- Revisar permisos de carpeta de sesiones
- Comprobar configuración de PHP (memory_limit, max_execution_time)

### 7. Estilos/Assets no cargan

**Síntoma**: Página se ve sin estilos CSS

**Solución**:

```bash
# Verificar que existen los archivos CSS
ls -la plugin/touchbase_pack/assets/css/

# Verificar configuración de Nginx para assets
docker compose exec web cat /etc/nginx/conf.d/default.conf | grep -A 5 "/touchbase"

# Añadir regla para assets si falta:
location ^~ /touchbase/assets {
  alias /var/www/html/plugin/touchbase_pack/assets;
  expires 7d;
}
```

---

## 🔧 Comandos Útiles

### Reinicio Completo

```bash
# Reiniciar todos los servicios
docker compose restart

# Reiniciar solo web (Nginx)
docker compose restart web

# Reiniciar solo app (PHP-FPM)
docker compose restart app
```

### Ver Logs en Tiempo Real

```bash
# Todos los logs
docker compose logs --follow

# Solo Nginx
docker compose logs --follow web

# Solo PHP-FPM
docker compose logs --follow app

# Solo Base de datos
docker compose logs --follow db
```

### Acceso a Contenedores

```bash
# Acceder al contenedor de PHP
docker compose exec app bash

# Acceder al contenedor de Nginx
docker compose exec web sh

# Acceder a MySQL
docker compose exec db mysql -uchamilo -pchamilo chamilo
```

### Limpieza y Reset

```bash
# Limpiar tablas de TouchBase
docker compose exec db mysql -uchamilo -pchamilo chamilo -e "
  DROP TABLE IF EXISTS pelota_stats;
  DROP TABLE IF EXISTS pelota_attendance;
  DROP TABLE IF EXISTS pelota_schedule;
  DROP TABLE IF EXISTS pelota_roster;
  DROP TABLE IF EXISTS pelota_teams;
  DROP TABLE IF EXISTS pelota_seasons;
  DROP TABLE IF EXISTS pelota_clubs;
  DROP TABLE IF EXISTS pelota_tenants;
"

# Luego reaplicar migraciones
bash plugin/touchbase_pack/bin/setup.sh
```

---

## 📊 Verificación de Estado

### Checklist Completo

```bash
# 1. Verificar Docker
docker compose ps
# Esperado: web, app, db todos "Up"

# 2. Verificar archivos
ls -la plugin/touchbase_pack/public/index.php
# Esperado: archivo existe

# 3. Verificar .env
cat plugin/touchbase_pack/.env | grep -E "DB_|BASE_PATH"
# Esperado: todas las variables configuradas

# 4. Verificar base de datos
docker compose exec db mysql -uchamilo -pchamilo -e "SHOW TABLES LIKE 'pelota_%';" chamilo
# Esperado: al menos 7 tablas

# 5. Verificar Nginx
curl -I http://localhost/touchbase/
# Esperado: HTTP/1.1 200 OK (no 404, no 500)

# 6. Verificar API
curl http://localhost/touchbase/api/teams
# Esperado: JSON {"data":[...]}
```

---

## 🆘 Cuando Todo Falla

### Instalación Limpia

```bash
# 1. Backup de datos (si tienes datos importantes)
docker compose exec db mysqldump -uchamilo -pchamilo chamilo > backup.sql

# 2. Eliminar tablas de TouchBase
docker compose exec db mysql -uchamilo -pchamilo chamilo -e "
  DROP TABLE IF EXISTS pelota_stats;
  DROP TABLE IF EXISTS pelota_attendance;
  DROP TABLE IF EXISTS pelota_schedule;
  DROP TABLE IF EXISTS pelota_roster;
  DROP TABLE IF EXISTS pelota_teams;
  DROP TABLE IF EXISTS pelota_seasons;
  DROP TABLE IF EXISTS pelota_clubs;
  DROP TABLE IF EXISTS pelota_tenants;
"

# 3. Resetear configuración
rm plugin/touchbase_pack/.env
cp plugin/touchbase_pack/.env.example plugin/touchbase_pack/.env

# 4. Ejecutar setup completo
docker compose exec app bash /var/www/html/plugin/touchbase_pack/bin/setup.sh

# 5. Reiniciar servicios
docker compose restart
```

---

## 📞 Soporte Adicional

Si ninguna de estas soluciones funciona:

1. **Ejecutar diagnóstico completo**:
   ```bash
   docker compose exec app php /var/www/html/plugin/touchbase_pack/bin/diagnose.php --verbose
   ```

2. **Recopilar información**:
   - Versión de Docker: `docker --version`
   - Versión de Compose: `docker compose version`
   - SO: `uname -a`
   - Logs: `docker compose logs > logs.txt`

3. **Crear un issue** en GitHub con:
   - Descripción del problema
   - Output del diagnóstico
   - Logs relevantes
   - Pasos para reproducir

---

## 🔍 Debugging Avanzado

### Habilitar modo debug

```bash
# En .env
DEBUG=true

# Luego visitar una página y ver errores detallados
```

### Verificar configuración PHP

```bash
docker compose exec app php -i | grep -E "memory_limit|max_execution_time|error_reporting"
```

### Test de conexión manual

```bash
docker compose exec app php -r "
\$pdo = new PDO('mysql:host=db;dbname=chamilo', 'chamilo', 'chamilo');
echo 'Connection OK\n';
\$stmt = \$pdo->query('SELECT COUNT(*) FROM user');
echo 'Users: ' . \$stmt->fetchColumn() . '\n';
"
```

### Verificar rutas de Nginx

```bash
# Test interno desde el contenedor web
docker compose exec web curl -I localhost:80/touchbase/

# Test de resolución de archivos
docker compose exec web ls -la /var/www/html/plugin/touchbase_pack/public/
```

---

## ✅ Todo Funciona Correctamente Cuando...

1. ✓ `docker compose ps` muestra todos los servicios "Up"
2. ✓ `php bin/diagnose.php` no muestra errores
3. ✓ `curl http://localhost/touchbase/` retorna HTML
4. ✓ `curl http://localhost/touchbase/api/teams` retorna JSON
5. ✓ El navegador carga http://localhost/touchbase sin errores

---

**Última actualización**: 2025-10-15
**Versión del plugin**: 1.0.0
