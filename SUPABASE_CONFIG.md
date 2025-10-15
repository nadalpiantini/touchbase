# Configuración de Supabase para TouchBase

## Problema Actual y Solución

TouchBase comparte el proyecto de Supabase con sujeto10.com (app principal). El Site URL de Supabase está configurado para sujeto10.com, lo que causa problemas con los Magic Links para TouchBase.

**Solución implementada:** Detección dinámica de URL en el código + configuración de email templates en Supabase.

## Pasos de Configuración en Supabase Dashboard

### 1. Configurar Email Templates

1. Ir a **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Seleccionar **Magic Link**
3. Reemplazar el template actual con este código:

```html
<h2>Magic Link</h2>
<p>Click the link below to login:</p>
<p><a href="{{ .ConfirmationURL }}">Login to TouchBase</a></p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request this email, you can safely ignore it.</p>
```

**IMPORTANTE:** El `{{ .ConfirmationURL }}` respetará el parámetro `emailRedirectTo` que enviamos desde el código, permitiendo que TouchBase redirija correctamente sin afectar sujeto10.com.

### 2. Agregar URLs Permitidas

1. Ir a **Authentication** → **URL Configuration** → **Redirect URLs**
2. Agregar las siguientes URLs (una por línea):

```
# Desarrollo local
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
http://127.0.0.1:3000/auth/callback

# Vercel - Producción actual
https://touchbase-74y4upr6i-nadalpiantini-fcbc2d66.vercel.app/auth/callback

# Dominio final (cuando esté configurado)
https://touchbase.sujeto10.com/auth/callback

# URLs adicionales de Vercel (preview deployments)
# Nota: Supabase no soporta wildcards, debes agregar cada URL específica
# Cada vez que Vercel genere una nueva preview URL, agrégala aquí
```

### 3. Configurar Dominio Personalizado (cuando esté listo)

Una vez que `touchbase.sujeto10.com` esté funcionando:

1. **En Vercel:**
   - Agregar `touchbase.sujeto10.com` como dominio personalizado
   - Verificar que el CNAME apunte correctamente a Vercel

2. **En Supabase:**
   - Asegurarse de que `https://touchbase.sujeto10.com/auth/callback` esté en las Redirect URLs

3. **Opcional - Variable de entorno:**
   - Agregar en Vercel: `NEXT_PUBLIC_SITE_URL=https://touchbase.sujeto10.com`
   - Esto servirá como fallback si la detección dinámica falla

## Implementación en el Código

### Archivo: `/web/lib/url-utils.ts`

Este archivo contiene la función `getMagicLinkRedirectUrl()` que detecta dinámicamente la URL correcta basándose en:
- El host actual (window.location.host)
- Patrones conocidos (localhost, vercel.app, touchbase.sujeto10.com)
- Fallback a variable de entorno o URL de producción conocida

### Uso en Login/Signup

Ambas páginas (`/app/login/page.tsx` y `/app/signup/page.tsx`) ahora usan:

```typescript
import { getMagicLinkRedirectUrl } from "@/lib/url-utils";

// En el handler:
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: getMagicLinkRedirectUrl(),
  }
});
```

## Testing

### Local
1. Ejecutar `npm run dev` en puerto 3000
2. Probar login/signup - debe redirigir a `http://localhost:3000/auth/callback`

### Vercel Preview
1. Hacer push a una rama
2. Obtener la URL de preview de Vercel
3. Agregar esa URL específica a Supabase Redirect URLs
4. Probar login/signup

### Producción
1. La URL actual de producción ya está configurada
2. Cuando `touchbase.sujeto10.com` esté listo, el código detectará automáticamente

## Troubleshooting

### "Invalid Redirect URL"
- Verificar que la URL esté exactamente agregada en Supabase Dashboard
- Revisar la consola del navegador para ver qué URL se está intentando usar
- Agregar la URL específica a las Redirect URLs en Supabase

### Magic Link lleva a sujeto10.com
- Verificar que el email template esté usando `{{ .ConfirmationURL }}`
- Confirmar que el código esté usando `getMagicLinkRedirectUrl()`

### Debugging URLs
En la consola del navegador, ejecutar:
```javascript
// Ver qué URL detectaría el sistema
console.log(window.location.host);
console.log(window.location.origin + '/auth/callback');
```

## Notas Importantes

1. **No cambiar el Site URL de Supabase** - Esto afectaría a sujeto10.com
2. **Cada preview URL de Vercel necesita agregarse manualmente** - Supabase no soporta wildcards
3. **El email template es compartido** - Los cambios afectan a todas las apps del proyecto
4. **La detección de URL funciona solo en el cliente** - Por eso usamos `'use client'` en las páginas