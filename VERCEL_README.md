# ⚠️ IMPORTANTE: Configuración de Deployment en Vercel

## 🚨 EL PROYECTO NEXT.JS ESTÁ EN `web/` 🚨

---

## ✅ Configuración Correcta en Vercel Dashboard

### 1. **Root Directory Settings**
Ve a tu proyecto en Vercel → Settings → General → Root Directory

**CONFIGURACIÓN OBLIGATORIA:**
```
Root Directory: web
```

### 2. **Build & Development Settings**
Los siguientes valores deberían ser detectados automáticamente:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Install Command:** `npm ci`
- **Output Directory:** `.next`

### 3. **Environment Variables**
Asegúrate de tener configuradas en Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

---

## 📁 Estructura del Proyecto

```
touchbase/
├── web/                    ← 🎯 APLICACIÓN NEXT.JS AQUÍ
│   ├── app/                ← Directorio de Next.js 15 App Router
│   ├── components/         ← Componentes React
│   ├── lib/               ← Utilidades y configuración
│   ├── public/            ← Assets estáticos
│   ├── package.json       ← Dependencias de la app
│   └── vercel.json        ← Configuración de Vercel
│
├── scripts/               ← Scripts de deployment y utilidades
├── docs/                  ← Documentación del proyecto
├── package.json          ← SOLO para tests E2E (NO es la app)
└── VERCEL_README.md      ← Este archivo (NO BORRAR)
```

---

## 🚫 ERRORES COMUNES Y SOLUCIONES

### ❌ Error: "Not a git repository"
**Causa:** El archivo `vercel.json` tenía `ignoreCommand` con comandos git
**Solución:** Ya está corregido - NO agregar `ignoreCommand` con git

### ❌ Error: "Cannot find module"
**Causa:** Vercel está intentando construir desde la raíz en lugar de `web/`
**Solución:** Verificar que Root Directory = `web` en Vercel Dashboard

### ❌ Error: Build falla sin razón clara
**Causa:** Configuración incorrecta de paths
**Solución:** Verificar que el archivo `vercel.json` está en `web/vercel.json`

---

## 🚀 Flujo de Deployment

1. **Desarrollo Local:**
   ```bash
   cd web
   npm run dev
   ```

2. **Commit y Push:**
   ```bash
   git add .
   git commit -m "tu mensaje"
   git push origin master
   ```

3. **Deployment Automático:**
   - Vercel detecta el push
   - Construye desde `web/`
   - Despliega automáticamente

---

## 📝 Notas Importantes

### NO HACER:
- ❌ NO cambiar el Root Directory de `web` a otra cosa
- ❌ NO mover archivos de `web/` a la raíz
- ❌ NO agregar `ignoreCommand` con comandos git en vercel.json
- ❌ NO borrar este archivo README

### SÍ HACER:
- ✅ Mantener toda la aplicación Next.js dentro de `web/`
- ✅ Configurar Root Directory = `web` en Vercel Dashboard
- ✅ Usar el archivo `web/vercel.json` para configuración
- ✅ Mantener las variables de entorno actualizadas en Vercel

---

## 🆘 Soporte

Si el deployment sigue fallando después de seguir estas instrucciones:

1. Verifica en Vercel Dashboard → Project Settings → General → Root Directory = `web`
2. Revisa los logs de build en Vercel Dashboard → Deployments → Ver logs
3. Asegúrate de que `web/vercel.json` NO tenga `ignoreCommand` con git

---

**Última actualización:** 2025-10-15
**Versión:** 1.0.0 - Solución definitiva al problema de deployment