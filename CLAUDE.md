# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TouchBase** is a dual-purpose educational platform with two distinct implementations:

1. **Legacy PHP Plugin** (root `/plugin/touchbase/`) - Chamilo LMS plugin for baseball club management
2. **Modern Web App** (`/web/`) - Next.js 15 application for life skills education (TouchBase Academy)

All active development is in the **`/web/`** directory using Next.js, TypeScript, and Supabase.

## Common Commands

All commands should be run from the `/web/` directory unless specified otherwise:

```bash
# Development
cd web
npm run dev              # Start dev server on http://localhost:3000 (with turbopack)
npm run predev           # Run preflight checks (auto-runs before dev)

# Building & Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint

# Health & Checks
npm run health           # Run healthcheck script

# Testing (Playwright E2E)
npm run test:e2e         # Run all E2E tests
npm run test:e2e:ui      # Run tests with Playwright UI
npm run test:e2e:debug   # Run tests in debug mode
npm run test:e2e:headed  # Run tests in headed browser mode

# Run specific test file
npx playwright test tests/login.spec.ts

# Run single test by name
npx playwright test --grep "should successfully login"
```

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 15 (App Router with Turbopack)
- **Language**: TypeScript (strict mode enabled, build errors currently ignored)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with PKCE flow
- **i18n**: next-intl (English/Spanish, default: Spanish)
- **Analytics**: PostHog
- **State Management**: React Query (@tanstack/react-query)
- **Testing**: Playwright

### Key Directory Structure

```
web/
├── app/                           # Next.js App Router
│   ├── [locale]/                  # Internationalized routes
│   │   ├── (protected)/           # Auth-protected routes (middleware)
│   │   │   ├── dashboard/         # Main dashboard
│   │   │   ├── student/           # Student-specific pages
│   │   │   ├── teacher/           # Teacher-specific pages
│   │   │   └── profile/           # User profile
│   │   ├── login/                 # Public auth pages
│   │   ├── signup/
│   │   ├── layout.tsx             # Locale layout wrapper
│   │   └── page.tsx               # Landing page
│   ├── api/                       # API routes (extensive)
│   └── layout.tsx                 # Root layout with fonts
│
├── components/                    # React components
│   ├── ui/                        # Reusable UI primitives
│   ├── student/                   # Student-specific components
│   ├── teacher/                   # Teacher-specific components
│   ├── players/                   # Player management
│   ├── teams/                     # Team management
│   ├── schedules/                 # Scheduling components
│   ├── attendance/                # Attendance tracking
│   ├── games/                     # Game management
│   └── landing/                   # Landing page components
│
├── lib/                           # Core utilities and business logic
│   ├── supabase/                  # Supabase clients
│   │   ├── client.ts              # Browser client (singleton pattern)
│   │   └── server.ts              # Server-side client
│   ├── services/                  # Business logic services (~18 files)
│   │   ├── analytics.ts           # Analytics tracking
│   │   ├── modules.ts             # Educational modules
│   │   ├── progress.ts            # User progress
│   │   ├── badges.ts              # Gamification
│   │   ├── classes.ts             # Class management
│   │   ├── schedules.ts           # Scheduling
│   │   └── ...                    # More services
│   ├── auth/                      # Auth helpers
│   ├── types/                     # TypeScript types
│   ├── schemas/                   # Zod validation schemas
│   ├── hooks/                     # Custom React hooks
│   ├── analytics/                 # Analytics utilities
│   ├── performance/               # Performance optimization
│   ├── storage/                   # Storage utilities
│   └── utils.ts                   # General utilities
│
├── messages/                      # i18n translation files
│   ├── en.json                    # English translations
│   └── es.json                    # Spanish translations
│
├── i18n/
│   └── config.ts                  # next-intl configuration
│
├── scripts/                       # Utility scripts
│   ├── preflight.ts               # Pre-dev checks
│   ├── healthcheck.ts             # Health check script
│   └── vercel-deploy.sh           # Vercel deployment
│
├── tests/                         # Playwright E2E tests
│   ├── login.spec.ts
│   ├── accessibility.spec.ts
│   └── ...
│
├── public/                        # Static assets
│   ├── icon.png                   # App icon (192x192)
│   ├── apple-icon.png             # Apple icon (180x180)
│   └── favicon.ico
│
└── middleware.ts                  # Next.js middleware (i18n only)
```

### Database (Supabase/PostgreSQL)

Migrations are located in **`/migrations/postgres/`** (NOT in `/web/supabase/migrations/`):

- `000_migrations_table.sql` - Migration tracking
- `001_init.sql` - Core tables (users, orgs, teams, players, etc.)
- `002_branding.sql` - Branding features
- `003_branding.sql` - Extended branding
- `004_tournaments.sql` - Tournament system
- `005_email_queue.sql` - Email queue system
- `006_billing.sql` - Billing/subscription

Apply migrations directly to Supabase:
```bash
# Via Supabase CLI or direct SQL execution
psql $DATABASE_URL < migrations/postgres/001_init.sql
```

### Authentication Flow

- **Pattern**: Supabase Auth with PKCE flow
- **Client**: Singleton pattern in `lib/supabase/client.ts` to prevent GoTrueClient warnings
- **Storage Key**: `touchbase-auth`
- **Protected Routes**: Wrapped in `app/[locale]/(protected)/` group
- **Middleware**: Only handles i18n routing, NOT auth (auth checked in layouts)

### Internationalization (i18n)

- **Library**: next-intl with `localePrefix: 'always'`
- **Supported Locales**: `['en', 'es']`
- **Default Locale**: `'es'` (Spanish)
- **Route Pattern**: All routes prefixed with locale (e.g., `/en/dashboard`, `/es/dashboard`)
- **Translation Files**: `messages/en.json`, `messages/es.json`
- **Language Selector**: Available in navigation components

### Role-Based Access Control

Three primary roles:
- **Student**: Access to modules, progress, badges, student life
- **Teacher**: Class management, assignments, analytics, AI coaching
- **Admin**: Organization management, billing, reporting

Role enforcement is implemented through:
1. Supabase Row Level Security (RLS) policies
2. Service-layer checks in `lib/services/`
3. Component-level conditional rendering

## Important Patterns & Conventions

### Supabase Client Usage

**Always use the singleton pattern:**
```typescript
// ✅ CORRECT - Browser components
import { supabaseBrowser } from '@/lib/supabase/client';
const supabase = supabaseBrowser();

// ✅ CORRECT - Server components/actions
import { createServerClient } from '@/lib/supabase/server';
const supabase = createServerClient();

// ❌ WRONG - Creates multiple instances
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(...); // Causes GoTrueClient warnings
```

### Service Layer Pattern

Business logic is centralized in `lib/services/`:
```typescript
// Services handle data fetching, validation, and mutations
import { getModules } from '@/lib/services/modules';
import { trackProgress } from '@/lib/services/progress';
import { getBadges } from '@/lib/services/badges';
```

### Component Organization

- **UI Primitives**: `components/ui/` - Reusable, unstyled components
- **Feature Components**: `components/{feature}/` - Domain-specific (e.g., `components/teams/`, `components/schedules/`)
- **Page Components**: Directly in `app/[locale]/` routes

### Styling Conventions

- **Framework**: Tailwind CSS 4
- **Utility Function**: `clsx` and `tailwind-merge` (via `lib/utils.ts`)
- **Design System**: Documented in `TOUCHBASE_STYLE_GUIDE.md` and `DESIGN_TOKENS.md`
- **Fonts**:
  - Oswald (headings, bold)
  - Inter (body text)
  - Lobster Two (decorative/branding)
  - Geist Mono (code/technical)

### TypeScript Configuration

- **Strict Mode**: Enabled
- **Build Behavior**: `typescript.ignoreBuildErrors: true` (currently active - fix gradually)
- **Type Definitions**: Centralized in `lib/types/`

### API Routes

Extensive API surface in `app/api/`:
- RESTful endpoints for all entities (teams, players, schedules, attendance, etc.)
- Email queue management (`/api/email-queue/`)
- Analytics endpoints
- AI coaching endpoints
- Billing/subscription endpoints

### Testing Strategy

**E2E with Playwright**:
- Tests in `tests/` directory
- Covers critical user flows (login, dashboard, accessibility)
- Runs against `http://localhost:3000`
- Configured for multiple browsers (Chromium, Firefox, Safari, Mobile)

## Environment Variables

Required variables in `web/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
```

## Next.js Configuration Notes

### Proxy Setup for Legacy PHP App

`next.config.mjs` includes rewrites for legacy PHP application:
- Development: `http://localhost:8080/`
- Production: `https://legacy.sujeto10.com/`
- Route prefix: `/legacy/*`

### Security Headers

All routes include:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`

### Performance Optimizations

- **Images**: AVIF/WebP with optimized sizes
- **Package Imports**: Optimized for `@/components/ui` and `next-intl`
- **Compression**: Enabled
- **Cache TTL**: 60s minimum for images

## Deployment

- **Platform**: Vercel
- **Config**: `web/vercel.json`
- **Deploy Script**: `scripts/vercel-deploy.sh`
- **Build Command**: `npm run build` (from `/web/`)
- **Start Command**: `npm start`

## Task Master Integration

This project uses **Task Master AI** for task management:

```bash
# Task Master commands (run from project root)
task-master list              # Show all tasks
task-master next              # Get next task to work on
task-master show <id>         # View task details
task-master set-status --id=<id> --status=done

# See .taskmaster/CLAUDE.md for full Task Master guide
```

## Documentation References

Additional context in `/web/`:
- `TOUCHBASE_STYLE_GUIDE.md` - Design system and component patterns
- `DESIGN_TOKENS.md` - Color, spacing, typography tokens
- `PERFORMANCE.md` - Performance optimization guide
- `ACCESSIBILITY.md` - WCAG 2.1 AA compliance notes
- `BRAND_IDENTITY.md` - Branding guidelines
- `NEXT_SESSION_I18N.md` - i18n implementation details

## Common Gotchas

1. **Always work in `/web/`** - The root `/plugin/touchbase/` is legacy PHP code (read-only)
2. **TypeScript errors during build** - Currently ignored via config; fix incrementally
3. **Supabase client instantiation** - Always use singleton pattern to avoid GoTrueClient warnings
4. **Migrations location** - Database migrations are in `/migrations/postgres/`, NOT `/web/supabase/migrations/`
5. **Default locale is Spanish** - Always provide both `en` and `es` translations
6. **Protected routes** - Use `(protected)` route group, NOT middleware for auth checks
7. **Preflight checks** - `predev` script runs automatically before `dev`, checks environment setup
