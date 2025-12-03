# Solución para Emails Rebotados (Bounced Emails) en Supabase

## 🚨 Problema

Supabase detectó una alta tasa de emails rebotados desde el proyecto. Esto puede resultar en restricción temporal de privilegios de envío.

## 🔍 Causas Identificadas

1. **Tests de Playwright**: Los tests crean usuarios con emails como `test.${Date.now()}@touchbase.com` que no existen
2. **Signup automático**: Cada `supabase.auth.signUp()` envía un email de confirmación automáticamente
3. **Desarrollo local**: Emails de prueba enviados a direcciones inválidas durante desarrollo

## ✅ Soluciones Implementadas

### 1. Desactivar Confirmación de Email en Desarrollo

En `web/app/[locale]/signup/page.tsx`, agregamos opción para desactivar confirmación de email:

```typescript
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    // En desarrollo, no enviar email de confirmación
    emailRedirectTo: process.env.NODE_ENV === 'production' 
      ? `${window.location.origin}/auth/callback`
      : undefined,
    // Desactivar confirmación de email en desarrollo
    data: {
      skip_email_confirmation: process.env.NODE_ENV !== 'production'
    }
  }
});
```

### 2. Configurar SMTP Personalizado (Recomendado por Supabase)

**Pasos en Supabase Dashboard:**

1. Ir a **Project Settings** → **Auth** → **SMTP Settings**
2. Configurar un proveedor SMTP personalizado:
   - **SendGrid** (recomendado para producción)
   - **Mailgun**
   - **AWS SES**
   - **Resend** (moderno y fácil)

3. Agregar credenciales SMTP:
   - Host SMTP
   - Puerto (587 para TLS, 465 para SSL)
   - Usuario/API Key
   - Contraseña/API Secret
   - Email remitente

**Ventajas:**
- Mayor control sobre límites de envío
- Mejor métrica de entrega
- No afecta el límite de Supabase
- Mejor reputación de dominio

### 3. Modificar Tests para No Enviar Emails

Los tests ahora usan una configuración especial que evita enviar emails reales.

## 🛠️ Acciones Inmediatas Requeridas

### Opción A: Configurar SMTP Personalizado (RECOMENDADO)

1. **Elegir proveedor SMTP:**
   - **Resend** (https://resend.com) - Gratis hasta 3,000 emails/mes
   - **SendGrid** - Gratis hasta 100 emails/día
   - **Mailgun** - Gratis hasta 5,000 emails/mes

2. **Configurar en Supabase:**
   ```
   Dashboard → Project Settings → Auth → SMTP Settings
   ```

3. **Agregar credenciales del proveedor**

### Opción B: Desactivar Emails de Confirmación Temporalmente

1. En Supabase Dashboard:
   - **Authentication** → **Settings** → **Email Auth**
   - Desactivar "Enable email confirmations" temporalmente

2. **⚠️ ADVERTENCIA**: Esto permite que usuarios se registren sin verificar email, menos seguro.

### Opción C: Usar Email de Prueba para Desarrollo

1. Crear un email de prueba en Supabase:
   - **Authentication** → **Settings** → **Email Templates**
   - Configurar para que en desarrollo use un email de prueba

2. O usar un servicio como **Mailtrap** o **MailHog** para desarrollo local

## 📋 Checklist de Verificación

- [ ] Configurar SMTP personalizado en Supabase
- [ ] Verificar que tests no envíen emails reales
- [ ] Revisar y limpiar usuarios de prueba en Supabase
- [ ] Configurar email de prueba para desarrollo
- [ ] Monitorear tasa de bounces en Supabase Dashboard

## 🔗 Recursos

- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Resend Setup Guide](https://resend.com/docs)
- [SendGrid Setup Guide](https://docs.sendgrid.com/for-developers/sending-email/api-getting-started)

## 📝 Notas Importantes

1. **No usar emails de prueba en producción**: Siempre usar emails válidos
2. **Limpiar usuarios de prueba**: Eliminar usuarios creados durante testing
3. **Monitorear bounces**: Revisar regularmente el dashboard de Supabase
4. **Usar SMTP personalizado**: Da mayor control y flexibilidad

