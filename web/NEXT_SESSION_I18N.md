# 🌐 Continuación: Implementación i18n TouchBase

## ✅ Estado Actual (Commit: 6373ce6210)

### Completado:
1. ✅ **next-intl instalado** - Package configurado en package.json
2. ✅ **Traducciones creadas** - `messages/en.json` y `messages/es.json`
3. ✅ **Middleware configurado** - i18n + Supabase auth combinados
4. ✅ **App reestructurada** - Todo en `app/[locale]/` pattern
5. ✅ **Landing page traducida** - `/` usa useTranslations('landing')
6. ✅ **Login traducido** - `/login` usa useTranslations('login')

### Arquitectura Implementada:
```
web/
├── app/
│   ├── [locale]/              # ✅ NUEVO: Locale-aware routes
│   │   ├── layout.tsx         # ✅ NextIntlClientProvider wrapper
│   │   ├── page.tsx           # ✅ Landing con traducciones
│   │   ├── login/
│   │   │   └── page.tsx       # ✅ Login con traducciones
│   │   ├── signup/
│   │   │   └── page.tsx       # ⚠️  SIN TRADUCIR (original copiado)
│   │   └── (protected)/       # ✅ Moved to locale
│   └── layout.tsx             # ✅ Root layout (sin lang attr)
├── i18n/
│   └── config.ts              # ✅ Locale config (en, es)
├── messages/
│   ├── en.json                # ✅ English translations
│   └── es.json                # ✅ Spanish translations
├── middleware.ts              # ✅ Combined i18n + auth
└── next.config.mjs            # ✅ withNextIntl plugin
```

---

## 🚧 Tareas Pendientes (Próxima Sesión)

### 1️⃣ **PRIORIDAD ALTA: Actualizar Signup Page**

**Archivo:** `web/app/[locale]/signup/page.tsx`

**Cambios necesarios:**
```typescript
// Agregar al inicio:
import { useTranslations } from 'next-intl';

// Dentro del componente:
const t = useTranslations('signup');

// Reemplazar todos los strings hardcoded:
❌ "Crear cuenta en TouchBase" 
✅ {t('title')}

❌ "Sistema de gestión deportiva"
✅ {t('subtitle')}

❌ "Email", "Contraseña", etc.
✅ {t('form.emailPlaceholder')}, etc.

❌ "Las contraseñas no coinciden"
✅ {t('errors.passwordMismatch')}
```

**Las traducciones YA EXISTEN en `messages/en.json` y `messages/es.json`**

---

### 2️⃣ **PRIORIDAD MEDIA: Language Selector Component**

**Crear:** `web/components/LanguageSelector.tsx`

```typescript
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n/config';

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Remove current locale from pathname
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    
    // Add new locale
    const newPath = newLocale === 'es' 
      ? pathnameWithoutLocale // Default locale, no prefix
      : `/${newLocale}${pathnameWithoutLocale}`;
    
    router.push(newPath);
  };

  return (
    <div className="flex gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-3 py-1 rounded ${
            locale === loc 
              ? 'bg-[--color-tb-navy] text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

**Agregar al layout:**
- Landing page: esquina superior derecha
- Login/Signup: arriba del formulario

---

### 3️⃣ **PRIORIDAD BAJA: Testing Local**

```bash
# 1. Verificar dev server funciona
npm run dev

# 2. Probar rutas:
http://localhost:3000/        # Español (default)
http://localhost:3000/en      # Inglés
http://localhost:3000/en/login
http://localhost:3000/login   # Español

# 3. Verificar middleware redirect funciona
# - Acceder sin locale → debe redirigir a /es o mantener sin prefijo
# - Cambiar idioma → debe mantener la misma página
```

---

### 4️⃣ **FINAL: Deploy y Testing en Producción**

```bash
# 1. Verificar build local
npm run build

# 2. Si todo OK, deploy
git add .
git commit -m "feat: complete i18n with signup translations and language selector"
git push origin master

# 3. Verificar en Vercel:
https://touchbase.sujeto10.com/        # Español
https://touchbase.sujeto10.com/en      # Inglés
https://touchbase.sujeto10.com/en/login

# 4. Probar switch de idioma:
- Cambiar de ES → EN
- Verificar que URL cambia
- Verificar que textos cambian
- Hacer login y verificar que mantiene el idioma
```

---

## 📋 Checklist para Próxima Sesión

```
[ ] Actualizar signup/page.tsx con useTranslations('signup')
[ ] Crear components/LanguageSelector.tsx
[ ] Agregar LanguageSelector a landing page
[ ] Agregar LanguageSelector a login page
[ ] Agregar LanguageSelector a signup page
[ ] npm run dev y probar localmente
[ ] Verificar /en y / funcionan correctamente
[ ] Verificar switch de idioma funciona
[ ] npm run build (verificar sin errores)
[ ] git commit + push
[ ] Verificar deployment en Vercel
[ ] Testing completo en producción
[ ] Capturar screenshots ES vs EN
```

---

## 🐛 Problemas Conocidos a Verificar

1. **Middleware locale detection:** Verificar que acepta locale desde:
   - URL path (`/en/login`)
   - Browser Accept-Language header
   - Cookie (si se implementa persistencia)

2. **Auth redirect preserva locale:** 
   - Login exitoso debe redirigir a `/dashboard` o `/en/dashboard` según locale

3. **Protected routes con locale:**
   - Dashboard debe funcionar en `/dashboard` y `/en/dashboard`
   - Verificar que middleware no rompe auth

---

## 💡 Mejoras Futuras (Opcional)

1. **Persistir preferencia de idioma:**
   ```typescript
   // En LanguageSelector, agregar:
   document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
   ```

2. **Detectar idioma del navegador:**
   - Ya configurado en middleware con `localePrefix: 'as-needed'`
   - Probar con navegador en inglés → debe ir a `/en` automáticamente

3. **Traducir dashboard:**
   - Agregar secciones en `messages/en.json` y `es.json` para:
     - dashboard.title, dashboard.teams, dashboard.players, etc.
   - Actualizar componentes del dashboard

4. **SEO con locale:**
   ```typescript
   // En app/[locale]/layout.tsx
   export async function generateMetadata({ params: { locale } }) {
     return {
       title: locale === 'es' 
         ? 'TouchBase - Tu dugout en la nube'
         : 'TouchBase - Your dugout in the cloud',
       alternates: {
         languages: {
           'en': '/en',
           'es': '/',
         }
       }
     };
   }
   ```

---

## 📞 Comando Rápido para Retomar

```bash
cd /Users/nadalpiantini/Dev/touchbase/web

# Ver estado actual
git log -1 --oneline
git status

# Verificar estructura
ls -la app/[locale]/
cat messages/en.json | head -20

# Empezar con signup
code app/[locale]/signup/page.tsx
```

---

## 🎯 Objetivo Final

**App completamente bilingüe (ES/EN) con:**
- ✅ Landing, Login, Signup traducidos
- ✅ Language selector visible en todas las páginas públicas
- ✅ URLs funcionando: `/`, `/en`, `/login`, `/en/login`
- ✅ Middleware preservando locale + auth
- ✅ Deploy en Vercel funcionando correctamente

**Tiempo estimado para completar:** 30-45 minutos
