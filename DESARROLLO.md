# TouchBase - Guía de Desarrollo

## 🚀 Arquitectura Híbrida

El proyecto ahora tiene una arquitectura híbrida:
- **`/web`**: Nueva aplicación Next.js 15 con TypeScript, Tailwind y Supabase
- **`/legacy`**: Código PHP existente (Chamilo plugin)

## 📋 Requisitos

- Node.js 18+ y npm
- PHP 8.2+
- Cuenta de Supabase (para autenticación)

## 🛠️ Setup Inicial

### 1. Configurar Variables de Entorno

Crea/edita `/web/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE=tu_service_role_key
SUPABASE_JWT_SECRET=tu_jwt_secret
```

### 2. Instalar Dependencias

```bash
cd web
npm install
```

## 🏃‍♂️ Desarrollo Local

### Opción 1: Solo Next.js (Nuevo Frontend)
```bash
cd web
npm run dev
```
Abre http://localhost:3000

### Opción 2: Next.js + PHP Legacy
```bash
# Terminal 1 - PHP Legacy
cd legacy
php -S localhost:8080 -t public

# Terminal 2 - Next.js
cd web
npm run dev
```

- Next.js: http://localhost:3000
- Legacy PHP: http://localhost:8080
- Proxy a legacy desde Next: http://localhost:3000/legacy/*

## 📁 Estructura del Proyecto

```
touchbase/
├── web/                    # Nueva app Next.js 15
│   ├── app/               # App Router páginas
│   │   ├── login/         # Página de login
│   │   ├── dashboard/     # Dashboard protegido
│   │   └── page.tsx       # Home page
│   ├── lib/               # Utilidades
│   │   └── supabase/      # Configuración Supabase
│   ├── middleware.ts      # Auth middleware
│   └── next.config.mjs    # Config con proxy a legacy
│
├── legacy/                 # PHP existente
│   ├── src/               # Código PHP
│   ├── public/            # Assets públicos
│   └── views/             # Vistas PHP
│
└── vercel.json            # Configuración de deployment

```

## 🌐 Rutas Disponibles

### Next.js (Puerto 3000)
- `/` - Landing page
- `/login` - Login con Supabase
- `/dashboard` - Dashboard (requiere auth)
- `/legacy/*` - Proxy al PHP legacy

### Legacy PHP (Puerto 8080)
- Todas las rutas existentes del sistema Chamilo

## 🔐 Autenticación

La nueva app usa Supabase Auth:
1. Login en `/login`
2. Middleware protege rutas como `/dashboard`
3. Sessions manejadas por Supabase

## 🚀 Deployment

### Vercel (Recomendado)

1. Push a GitHub:
```bash
git push origin feat/next-supabase
```

2. Conecta con Vercel
3. Configura variables de entorno en Vercel
4. Deploy automático

### Variables de Entorno en Vercel
```
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE=xxx
SUPABASE_JWT_SECRET=xxx
```

## 📝 Próximos Pasos

1. **Configurar Supabase**:
   - Crear proyecto en supabase.com
   - Obtener las keys
   - Configurar tablas si necesario

2. **Migración Incremental**:
   - Mover funcionalidades de PHP a Next.js gradualmente
   - Mantener ambos sistemas funcionando en paralelo

3. **Testing**:
   - Agregar tests con Jest/Testing Library
   - E2E con Playwright

## 🐛 Troubleshooting

### Error: Missing environment variables
- Asegúrate de tener `.env.local` configurado
- Reinicia el servidor de desarrollo

### Legacy PHP no funciona
- Verifica que PHP 8.2+ esté instalado
- Checa que el puerto 8080 esté libre

### Proxy no conecta con legacy
- Confirma que el servidor PHP esté corriendo en :8080
- Revisa la configuración en `next.config.mjs`

## 🤝 Contribuir

1. Crea una rama desde `feat/next-supabase`
2. Haz tus cambios
3. Commit con mensajes descriptivos
4. Push y crea PR

---

¡Listo para desarrollar! 🎯