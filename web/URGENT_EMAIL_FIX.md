# 🚨 PLAN DE ACCIÓN URGENTE - Restricción de Emails Supabase

## Situación Actual
- ✅ **Restricción temporal activa** - No puedes enviar emails desde Supabase
- ⚠️ **Causa**: Alta tasa de bounces por tests y emails inválidos
- 🎯 **Objetivo**: Resolver para restaurar funcionalidad

## 🎯 SOLUCIÓN INMEDIATA (Hacer HOY)

### Paso 1: Configurar SMTP Personalizado (OBLIGATORIO)

**Opción A: Resend (RECOMENDADO - Más fácil y rápido)**

1. **Crear cuenta en Resend:**
   - Ir a https://resend.com
   - Registrarse (gratis hasta 3,000 emails/mes)
   - Verificar tu dominio o usar el dominio de prueba

2. **Obtener credenciales:**
   - Dashboard → API Keys → Create API Key
   - Copiar la API Key

3. **Configurar en Supabase:**
   ```
   Supabase Dashboard → Project Settings → Auth → SMTP Settings
   ```
   
   **Configuración:**
   - **SMTP Host**: `smtp.resend.com`
   - **SMTP Port**: `465` (SSL) o `587` (TLS)
   - **SMTP User**: `resend`
   - **SMTP Password**: [Tu API Key de Resend]
   - **Sender Email**: `noreply@tu-dominio.com` o `onboarding@resend.dev` (para pruebas)
   - **Sender Name**: `TouchBase`

4. **Verificar configuración:**
   - Supabase enviará un email de prueba
   - Verificar que llegue correctamente

**Opción B: SendGrid (Alternativa)**

1. Crear cuenta en https://sendgrid.com
2. Verificar dominio o usar dominio de prueba
3. Crear API Key
4. Configurar en Supabase con:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - User: `apikey`
   - Password: [Tu API Key]

### Paso 2: Limpiar Usuarios de Prueba

1. **En Supabase Dashboard:**
   - Ir a **Authentication** → **Users**
   - Filtrar por emails que contengan:
     - `test.`
     - `@touchbase.com` (si no es tu dominio real)
     - Timestamps recientes
   
2. **Eliminar usuarios de prueba:**
   - Seleccionar usuarios de prueba
   - Eliminar en lote

3. **Verificar:**
   - Contar cuántos usuarios eliminaste
   - Anotar para reporte a Supabase

### Paso 3: Desactivar Confirmación de Email Temporalmente

**Solo si necesitas que funcione HOY sin SMTP:**

1. **Supabase Dashboard:**
   - **Authentication** → **Settings** → **Email Auth**
   - Desactivar "Enable email confirmations"
   - Guardar

2. **⚠️ ADVERTENCIA:**
   - Los usuarios podrán registrarse sin verificar email
   - Menos seguro, pero funcional
   - Reactivar cuando tengas SMTP configurado

### Paso 4: Modificar Código para Prevenir Futuros Problemas

Ya implementado:
- ✅ Test de signup desactivado
- ✅ Signup mejorado para desarrollo
- ✅ Documentación creada

**Verificar que esté activo:**
- `web/tests/auth.spec.ts` - Test de signup debe estar con `.skip()`
- `web/app/[locale]/signup/page.tsx` - Debe tener lógica para desarrollo

## 📋 CHECKLIST DE ACCIONES

### Inmediatas (Hacer HOY):
- [ ] Crear cuenta en Resend o SendGrid
- [ ] Configurar SMTP en Supabase Dashboard
- [ ] Verificar que emails de prueba funcionen
- [ ] Limpiar usuarios de prueba en Supabase
- [ ] Desactivar test de signup (ya hecho)
- [ ] Contactar soporte de Supabase explicando acciones tomadas

### Corto Plazo (Esta Semana):
- [ ] Monitorear tasa de bounces en nuevo proveedor
- [ ] Configurar dominio personalizado para emails (opcional)
- [ ] Documentar proceso para el equipo
- [ ] Crear política de testing sin emails reales

### Largo Plazo:
- [ ] Implementar servicio de testing de emails (Mailtrap, MailHog)
- [ ] Configurar alertas de bounces
- [ ] Revisar y optimizar templates de email
- [ ] Implementar validación de emails más estricta

## 📧 CONTACTAR SOPORTE DE SUPABASE

**Email a enviar a Supabase Support:**

```
Asunto: Restricción de Emails - Acciones Correctivas Implementadas

Hola equipo de Supabase,

Hemos recibido la notificación sobre la restricción temporal de emails 
en nuestro proyecto (nqzhxukuvmdlpewqytpv).

Hemos implementado las siguientes acciones correctivas:

1. ✅ Configurado SMTP personalizado (Resend/SendGrid)
2. ✅ Limpiado usuarios de prueba del sistema
3. ✅ Desactivado tests automatizados que creaban usuarios reales
4. ✅ Implementado validaciones para prevenir emails inválidos

Solicitamos la restauración de privilegios de envío una vez que 
verifiquen nuestras correcciones.

Gracias,
[Tu nombre]
```

## 🔧 CONFIGURACIÓN RECOMENDADA: Resend

### Ventajas de Resend:
- ✅ Setup en 5 minutos
- ✅ API moderna y fácil de usar
- ✅ Dashboard intuitivo
- ✅ 3,000 emails gratis/mes
- ✅ Buen deliverability
- ✅ Soporte para React/Next.js

### Pasos Detallados Resend:

1. **Registro:**
   ```
   https://resend.com/signup
   ```

2. **Verificar dominio (opcional para producción):**
   - Dashboard → Domains → Add Domain
   - Agregar registros DNS según instrucciones

3. **Obtener API Key:**
   - Dashboard → API Keys → Create API Key
   - Nombre: "Supabase SMTP"
   - Copiar key (solo se muestra una vez)

4. **Configurar en Supabase:**
   ```
   Project Settings → Auth → SMTP Settings
   
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Tu API Key]
   Sender Email: onboarding@resend.dev (pruebas) o noreply@tu-dominio.com
   ```

5. **Probar:**
   - Supabase enviará email de prueba
   - Verificar en inbox

## 🚫 PREVENCIÓN FUTURA

### Reglas a Seguir:

1. **Nunca crear usuarios reales en tests:**
   - Usar mocks o servicios de testing
   - Desactivar tests que requieran emails reales

2. **Validar emails antes de enviar:**
   - Verificar formato
   - Verificar dominio válido
   - No enviar a emails de prueba en producción

3. **Usar servicios de testing:**
   - Mailtrap para desarrollo
   - MailHog para local
   - Resend tiene dominio de prueba

4. **Monitorear bounces:**
   - Revisar dashboard regularmente
   - Configurar alertas
   - Limpiar emails inválidos

## 📊 MÉTRICAS A MONITOREAR

Después de configurar SMTP:

- **Bounce Rate**: Debe estar < 5%
- **Delivery Rate**: Debe estar > 95%
- **Spam Complaints**: Debe estar < 0.1%
- **Open Rate**: Para emails transaccionales, típicamente 20-40%

## 🆘 SI SIGUE SIN FUNCIONAR

1. **Verificar configuración SMTP:**
   - Probar conexión desde Supabase
   - Revisar logs de Resend/SendGrid

2. **Contactar soporte:**
   - Resend: support@resend.com
   - SendGrid: support@sendgrid.com
   - Supabase: support@supabase.com

3. **Alternativa temporal:**
   - Usar servicio de email directo (no SMTP)
   - Integrar Resend directamente en código
   - Bypass Supabase Auth emails

## ✅ VERIFICACIÓN FINAL

Antes de contactar a Supabase, verificar:

- [ ] SMTP configurado y funcionando (email de prueba recibido)
- [ ] Usuarios de prueba eliminados
- [ ] Tests desactivados
- [ ] Código actualizado
- [ ] Documentación creada
- [ ] Email a soporte preparado

---

**Última actualización**: $(date)
**Estado**: Restricción activa - Acción urgente requerida



