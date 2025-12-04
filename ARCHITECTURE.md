# TouchBase Architecture Documentation

**Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Project:** TouchBase Academy - Life Skills Education Platform

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Directory Structure](#directory-structure)
5. [Core Patterns & Design Decisions](#core-patterns--design-decisions)
6. [Data Flow & Architecture](#data-flow--architecture)
7. [Database Schema](#database-schema)
8. [Authentication & Authorization](#authentication--authorization)
9. [Internationalization (i18n)](#internationalization-i18n)
10. [API Architecture](#api-architecture)
11. [Frontend Architecture](#frontend-architecture)
12. [Deployment & Infrastructure](#deployment--infrastructure)
13. [Testing Strategy](#testing-strategy)
14. [Performance Optimization](#performance-optimization)
15. [Security Considerations](#security-considerations)
16. [Scalability & Future Considerations](#scalability--future-considerations)

---

## Executive Summary

**TouchBase** is a dual-purpose educational platform:

1. **Legacy PHP Plugin** (`/plugin/touchbase/`) - Chamilo LMS plugin for baseball club management (read-only, maintenance mode)
2. **Modern Web App** (`/web/`) - Next.js 15 application for life skills education (TouchBase Academy) - **Active Development**

The modern application is a full-stack Next.js application built with TypeScript, Supabase, and follows modern web development best practices. It supports multi-tenant organizations, role-based access control, and internationalization.

**Key Characteristics:**
- **Type**: Full-stack web application
- **Architecture**: Monolithic Next.js app with server-side rendering (SSR) and static generation (SSG)
- **Database**: PostgreSQL (via Supabase) with Row Level Security (RLS)
- **Authentication**: Supabase Auth with PKCE flow
- **Deployment**: Vercel (serverless functions)
- **State Management**: React Query for server state, React hooks for local state

---

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  (Next.js App Router - SSR/SSG/Client Components)          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTPS
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    Vercel Edge Network                      │
│  (Next.js Server, API Routes, Middleware)                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
│   Supabase   │ │   PostHog    │ │  Legacy PHP │
│  (PostgreSQL │ │  (Analytics)  │ │   (Proxy)   │
│   + Auth)    │ │              │ │             │
└──────────────┘ └──────────────┘ └─────────────┘
```

### Application Layers

1. **Presentation Layer** (`web/app/`)
   - Next.js App Router pages and layouts
   - React Server Components (default)
   - Client Components for interactivity
   - Route groups for organization

2. **Business Logic Layer** (`web/lib/services/`)
   - Service functions for domain logic
   - Data validation with Zod
   - Business rules enforcement
   - Error handling

3. **Data Access Layer** (`web/lib/supabase/`)
   - Supabase client wrappers (singleton pattern)
   - Server-side and client-side clients
   - Row Level Security (RLS) policies

4. **API Layer** (`web/app/api/`)
   - Next.js API routes
   - RESTful endpoints
   - Server-side operations
   - External integrations

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.7 | React framework with App Router |
| **React** | 19.1.0 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **next-intl** | 4.5.8 | Internationalization |
| **React Query** | 5.90.3 | Server state management |
| **Zod** | 4.1.12 | Schema validation |

### Backend

| Technology | Purpose |
|-----------|---------|
| **Supabase** | PostgreSQL database + Auth + Storage |
| **Next.js API Routes** | Serverless API endpoints |
| **Supabase RLS** | Row-level security policies |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Playwright** | E2E testing |
| **ESLint** | Code linting |
| **Turbopack** | Fast bundler (Next.js) |
| **tsx** | TypeScript execution |

### Infrastructure

| Service | Purpose |
|--------|---------|
| **Vercel** | Hosting, CDN, serverless functions |
| **Supabase** | Database, auth, storage |
| **PostHog** | Product analytics (optional) |

---

## Directory Structure

### Root Structure

```
touchbase/
├── web/                    # Modern Next.js application (ACTIVE)
├── plugin/touchbase/       # Legacy PHP plugin (read-only)
├── migrations/postgres/    # Database migrations
├── legacy/                 # Legacy PHP application
├── mobile/                 # React Native mobile app
├── tests/                  # E2E tests
└── docs/                   # Documentation
```

### Web Application Structure (`/web/`)

```
web/
├── app/                          # Next.js App Router
│   ├── [locale]/                # Internationalized routes
│   │   ├── (protected)/         # Auth-protected routes
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── student/         # Student pages
│   │   │   ├── teacher/         # Teacher pages
│   │   │   └── profile/         # User profile
│   │   ├── login/                # Public auth
│   │   ├── signup/
│   │   └── layout.tsx            # Locale layout
│   ├── api/                      # API routes (50+ endpoints)
│   │   ├── auth/
│   │   ├── classes/
│   │   ├── modules/
│   │   ├── progress/
│   │   └── ...
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page (root /)
│
├── components/                   # React components
│   ├── ui/                       # Reusable UI primitives
│   ├── student/                  # Student-specific
│   ├── teacher/                  # Teacher-specific
│   ├── players/                  # Player management
│   ├── teams/                     # Team management
│   ├── schedules/                # Scheduling
│   ├── attendance/               # Attendance tracking
│   └── games/                     # Game management
│
├── lib/                          # Core utilities
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client (singleton)
│   │   ├── server.ts              # Server client
│   │   └── admin.ts               # Admin client
│   ├── services/                 # Business logic (18+ services)
│   │   ├── modules.ts
│   │   ├── progress.ts
│   │   ├── badges.ts
│   │   ├── classes.ts
│   │   ├── analytics.ts
│   │   └── ...
│   ├── auth/                     # Auth helpers
│   ├── types/                    # TypeScript types
│   ├── schemas/                  # Zod schemas
│   ├── hooks/                    # Custom React hooks
│   ├── analytics/                # Analytics utilities
│   ├── performance/              # Performance tools
│   └── storage/                  # Storage utilities
│
├── messages/                      # i18n translations
│   ├── en.json
│   └── es.json
│
├── i18n/
│   └── config.ts                 # next-intl configuration
│
├── scripts/                       # Utility scripts
│   ├── preflight.ts              # Pre-dev checks
│   ├── healthcheck.ts             # Health check
│   └── vercel-deploy.sh           # Deployment script
│
├── tests/                         # Playwright E2E tests
│   ├── login.spec.ts
│   ├── accessibility.spec.ts
│   └── ...
│
├── public/                        # Static assets
│   ├── touchbase-logo-full.png
│   ├── icon.png
│   └── ...
│
├── middleware.ts                 # Next.js middleware (i18n)
├── next.config.mjs               # Next.js configuration
├── tsconfig.json                  # TypeScript config
└── package.json                   # Dependencies
```

---

## Core Patterns & Design Decisions

### 1. Supabase Client Singleton Pattern

**Problem**: Multiple Supabase client instances cause GoTrueClient warnings and performance issues.

**Solution**: Singleton pattern for browser client.

```typescript
// ✅ CORRECT
import { supabaseBrowser } from '@/lib/supabase/client';
const supabase = supabaseBrowser();

// ❌ WRONG
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(...); // Multiple instances
```

**Implementation**: `lib/supabase/client.ts` uses a module-level singleton.

### 2. Service Layer Pattern

**Purpose**: Centralize business logic, validation, and data access.

**Structure**:
- Services in `lib/services/` handle domain logic
- Services use Supabase clients internally
- Services return typed data or throw errors
- API routes call services, not Supabase directly

**Example**:
```typescript
// Service layer
export async function getModules(orgId: string) {
  const supabase = createServerClient();
  // Business logic + data fetching
  return modules;
}

// API route
export async function GET(request: Request) {
  const modules = await getModules(orgId);
  return Response.json(modules);
}
```

### 3. Route Groups for Organization

**Pattern**: Use Next.js route groups `(groupName)` for logical organization without affecting URLs.

- `(protected)` - Auth-protected routes
- Routes remain at same URL level
- Shared layouts per group

### 4. Server Components by Default

**Strategy**: Use React Server Components (RSC) by default, opt into Client Components only when needed.

**Benefits**:
- Reduced JavaScript bundle size
- Better SEO
- Faster initial page load
- Automatic code splitting

**When to use Client Components**:
- User interactions (onClick, onChange)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect)
- Third-party libraries requiring client-side

### 5. Type-Safe API with Zod

**Pattern**: Validate all API inputs/outputs with Zod schemas.

```typescript
import { z } from 'zod';

const createModuleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const data = createModuleSchema.parse(body); // Throws if invalid
  // ...
}
```

---

## Data Flow & Architecture

### Request Flow

```
1. User Request
   ↓
2. Next.js Middleware (i18n routing)
   ↓
3. Next.js App Router
   ├── Server Component (default)
   │   ├── Fetch data via services
   │   ├── Render HTML
   │   └── Stream to client
   │
   └── Client Component (if needed)
       ├── Hydrate on client
       ├── React Query for server state
       └── Local state for UI
```

### Data Fetching Patterns

**1. Server Components (SSR)**
```typescript
// app/[locale]/dashboard/page.tsx
export default async function DashboardPage() {
  const modules = await getModules(orgId); // Server-side
  return <Dashboard modules={modules} />;
}
```

**2. Client Components with React Query**
```typescript
'use client';
import { useQuery } from '@tanstack/react-query';

export function ModulesList() {
  const { data } = useQuery({
    queryKey: ['modules'],
    queryFn: () => fetch('/api/modules').then(r => r.json()),
  });
  return <div>{/* render */}</div>;
}
```

**3. API Routes**
```typescript
// app/api/modules/route.ts
export async function GET() {
  const modules = await getModules(orgId);
  return Response.json(modules);
}
```

### State Management

- **Server State**: React Query (`@tanstack/react-query`)
- **Local UI State**: React hooks (`useState`, `useReducer`)
- **Form State**: Controlled components or form libraries
- **Global State**: Context API (minimal usage)

---

## Database Schema

### Core Tables

**Organizations & Users**
- `touchbase_organizations` - Multi-tenant organizations
- `touchbase_profiles` - User profiles (extends Supabase auth.users)
- `touchbase_memberships` - User-organization relationships with roles

**Education**
- `touchbase_modules` - Educational modules
- `touchbase_module_steps` - Steps within modules
- `touchbase_classes` - Classes/groups
- `touchbase_assignments` - Module assignments to classes
- `touchbase_progress` - User progress tracking
- `touchbase_badges` - Gamification badges

**Sports Management** (Legacy/Baseball)
- `touchbase_teams` - Sports teams
- `touchbase_players` - Player profiles
- `touchbase_schedules` - Practice/game schedules
- `touchbase_attendance` - Attendance tracking
- `touchbase_games` - Game records

**Supporting Tables**
- `touchbase_branding` - Organization branding/theming
- `touchbase_email_queue` - Email queue system
- `touchbase_billing` - Subscription/billing (future)

### Row Level Security (RLS)

**Strategy**: All tables have RLS policies enforcing:
- Organization-level isolation (multi-tenant)
- Role-based access (Student, Teacher, Admin)
- User-specific data access

**Example Policy**:
```sql
-- Users can only see modules from their organization
CREATE POLICY "Users see org modules"
ON touchbase_modules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM touchbase_memberships
    WHERE user_id = auth.uid()
    AND org_id = touchbase_modules.org_id
  )
);
```

### Migration Strategy

- Migrations in `/migrations/postgres/`
- Sequential numbering: `001_init.sql`, `002_branding.sql`, etc.
- Applied directly to Supabase via SQL execution
- Version tracking via `touchbase_migrations` table

---

## Authentication & Authorization

### Authentication Flow

**Provider**: Supabase Auth with PKCE (Proof Key for Code Exchange)

**Flow**:
1. User submits credentials
2. Supabase Auth validates
3. Session stored in browser (cookie-based)
4. Middleware validates session on protected routes
5. Server components access user via `supabase.auth.getUser()`

**Storage**: 
- Browser: Cookie-based session (httpOnly, secure)
- Key: `touchbase-auth`

### Authorization (RBAC)

**Roles**:
- **Student**: Access to assigned modules, progress, badges
- **Teacher**: Class management, assignments, analytics
- **Admin**: Organization management, billing, all data

**Implementation Layers**:

1. **Database (RLS Policies)**
   - Enforce at database level
   - Prevent unauthorized data access

2. **Service Layer**
   - Business logic checks
   - Role validation in service functions

3. **UI Layer**
   - Conditional rendering based on role
   - Route protection via layouts

**Example**:
```typescript
// Service layer check
export async function createClass(data: CreateClassData, userId: string) {
  const membership = await getMembership(userId);
  if (membership.role !== 'teacher' && membership.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  // Create class...
}
```

### Protected Routes

**Pattern**: Route groups with layout-based auth checks

```
app/[locale]/(protected)/
├── layout.tsx          # Auth check here
├── dashboard/
├── student/
└── teacher/
```

**Layout Implementation**:
```typescript
export default async function ProtectedLayout({ children }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return <>{children}</>;
}
```

---

## Internationalization (i18n)

### Configuration

**Library**: `next-intl` v4.5.8

**Locales**: `['en', 'es']`  
**Default**: `'es'` (Spanish)

**Strategy**: `localePrefix: 'as-needed'`
- Root path `/` uses default locale (no prefix)
- Non-default locales use prefix: `/en/dashboard`
- Default locale routes: `/dashboard` (no `/es` prefix)

### Implementation

**Middleware**: `middleware.ts`
- Handles locale detection
- Redirects to appropriate locale
- Skips root path `/` (served directly)

**Translation Files**: `messages/en.json`, `messages/es.json`
- Nested structure for organization
- Keys: `login.title`, `dashboard.welcome`, etc.

**Usage**:
```typescript
// Server Component
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('dashboard');
return <h1>{t('title')}</h1>;

// Client Component
import { useTranslations } from 'next-intl';
const t = useTranslations('dashboard');
return <h1>{t('title')}</h1>;
```

---

## API Architecture

### Endpoint Structure

**Pattern**: RESTful API routes in `app/api/`

**Organization**:
```
app/api/
├── auth/              # Authentication
├── classes/           # Class management
├── modules/           # Educational modules
├── progress/          # User progress
├── badges/            # Gamification
├── analytics/         # Analytics data
├── ai/                # AI coaching features
└── ...
```

### Request/Response Pattern

**Standard Format**:
```typescript
// GET /api/modules
export async function GET(request: Request) {
  try {
    const modules = await getModules(orgId);
    return Response.json({ data: modules });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/modules
export async function POST(request: Request) {
  const body = await request.json();
  const data = createModuleSchema.parse(body);
  const module = await createModule(data);
  return Response.json({ data: module }, { status: 201 });
}
```

### Error Handling

**Strategy**: Consistent error responses

```typescript
{
  "error": "Error message",
  "code": "ERROR_CODE", // Optional
  "details": {} // Optional
}
```

### Authentication in API Routes

**Pattern**: Extract user from Supabase session

```typescript
export async function GET(request: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Proceed with authenticated request
}
```

---

## Frontend Architecture

### Component Hierarchy

```
Root Layout (app/layout.tsx)
└── Locale Layout (app/[locale]/layout.tsx)
    ├── Protected Layout (app/[locale]/(protected)/layout.tsx)
    │   ├── Student Layout (app/[locale]/(protected)/student/layout.tsx)
    │   └── Teacher Layout (app/[locale]/(protected)/teacher/layout.tsx)
    └── Public Pages (login, signup)
```

### Component Types

1. **Page Components** (`app/[locale]/**/page.tsx`)
   - Server Components by default
   - Data fetching
   - Layout composition

2. **Layout Components** (`**/layout.tsx`)
   - Shared UI across routes
   - Auth checks
   - Providers (Analytics, i18n)

3. **Feature Components** (`components/{feature}/`)
   - Domain-specific components
   - Reusable across pages
   - May be Client or Server Components

4. **UI Primitives** (`components/ui/`)
   - Generic, unstyled components
   - Building blocks
   - Highly reusable

### Styling Architecture

**Framework**: Tailwind CSS 4

**Design System**:
- Design tokens in `globals.css` (CSS variables)
- Color palette: TB Navy, TB Red, TB Bone, etc.
- Typography: Oswald (headings), Inter (body)
- Shadows: `shadow-dugout` custom shadow

**Pattern**:
```typescript
// Use design tokens
<div className="bg-[--color-tb-navy] text-white">
  <h1 className="font-display text-2xl">Title</h1>
</div>
```

**Utility**: `lib/utils.ts` provides `cn()` for conditional classes

---

## Deployment & Infrastructure

### Hosting Platform

**Vercel**
- Serverless functions for API routes
- Edge network for CDN
- Automatic deployments from Git
- Environment variable management

### Build Process

**Commands**:
```bash
npm run build    # Production build
npm start        # Production server
```

**Configuration**: `next.config.mjs`
- Turbopack for faster builds
- Image optimization (AVIF/WebP)
- Compression enabled
- Security headers configured

### Environment Variables

**Required**:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=
SUPABASE_JWT_SECRET=
```

**Optional**:
```env
NEXT_PUBLIC_POSTHOG_KEY=
```

### Database Migrations

**Location**: `/migrations/postgres/`

**Application**:
- Manual execution via Supabase SQL editor
- Or via Supabase CLI: `supabase db push`

**Versioning**: Tracked in `touchbase_migrations` table

### Legacy PHP Proxy

**Configuration**: `next.config.mjs` rewrites

**Routes**: `/legacy/*` → PHP application
- Development: `http://localhost:8080/`
- Production: `https://legacy.sujeto10.com/`

---

## Testing Strategy

### E2E Testing

**Tool**: Playwright

**Location**: `web/tests/`

**Coverage**:
- Critical user flows (login, dashboard)
- Accessibility (WCAG 2.1 AA)
- Cross-browser testing

**Commands**:
```bash
npm run test:e2e         # Run all tests
npm run test:e2e:ui      # UI mode
npm run test:e2e:debug   # Debug mode
```

### Test Structure

```
tests/
├── login.spec.ts           # Login flow
├── accessibility.spec.ts    # A11y checks
└── dashboard.spec.ts       # Dashboard tests
```

### Future: Unit Testing

**Planned**: Jest + React Testing Library
- Component unit tests
- Service function tests
- Utility function tests

---

## Performance Optimization

### Next.js Optimizations

1. **Server Components**: Reduced JavaScript bundle
2. **Automatic Code Splitting**: Route-based splitting
3. **Image Optimization**: Next.js Image component (AVIF/WebP)
4. **Turbopack**: Faster builds and HMR
5. **Static Generation**: Where possible (SSG)

### Caching Strategy

**React Query**: Client-side caching
- Stale time configuration
- Cache invalidation on mutations

**Next.js**: 
- Static page caching
- API route caching (where appropriate)

### Bundle Optimization

**Package Imports**: Optimized in `next.config.mjs`
```javascript
experimental: {
  optimizePackageImports: ['@/components/ui', 'next-intl'],
}
```

### Performance Monitoring

**Tool**: PostHog (optional)
- User analytics
- Performance metrics
- Error tracking

---

## Security Considerations

### Authentication Security

- **PKCE Flow**: Prevents authorization code interception
- **HttpOnly Cookies**: Session storage (XSS protection)
- **Secure Cookies**: HTTPS only in production
- **Session Validation**: Server-side validation on every request

### Data Security

- **Row Level Security (RLS)**: Database-level access control
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection**: Supabase handles parameterized queries
- **XSS Protection**: React's automatic escaping

### Security Headers

**Configured in `next.config.mjs`**:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`

### Environment Variables

- **Never commit secrets**: Use Vercel environment variables
- **Service Role Key**: Server-side only, never exposed to client
- **JWT Secret**: Required for Supabase JWT verification

---

## Scalability & Future Considerations

### Current Architecture Limitations

1. **Monolithic Application**: Single Next.js app
2. **Database**: Single PostgreSQL instance (Supabase)
3. **State Management**: React Query (client-side caching only)

### Scalability Strategies

**Horizontal Scaling**:
- Vercel automatically scales serverless functions
- Supabase handles database connection pooling

**Vertical Scaling**:
- Upgrade Supabase plan for more resources
- Optimize database queries and indexes

### Future Enhancements

**Planned**:
1. **Microservices**: Extract heavy operations (AI, analytics)
2. **Caching Layer**: Redis for frequently accessed data
3. **CDN**: Enhanced static asset delivery
4. **Database Sharding**: Multi-tenant database optimization
5. **Real-time Features**: Supabase Realtime subscriptions

### Multi-Tenancy

**Current**: Organization-level isolation via RLS
**Future**: Consider dedicated databases per large tenant

---

## Development Workflow

### Local Development

```bash
cd web
npm run dev          # Start dev server (with preflight checks)
npm run lint         # Run ESLint
npm run health       # Health check
```

### Pre-flight Checks

**Script**: `scripts/preflight.ts`
- Validates environment variables
- Checks Supabase connection
- Verifies required files

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Pre-commit**: (Future) Husky hooks

---

## Documentation References

- `CLAUDE.md` - Development guide for AI assistants
- `web/TOUCHBASE_STYLE_GUIDE.md` - Design system
- `web/DESIGN_TOKENS.md` - Design tokens documentation
- `web/BRAND_IDENTITY.md` - Branding guidelines
- `web/PERFORMANCE.md` - Performance optimization guide
- `web/ACCESSIBILITY.md` - Accessibility compliance

---

## Glossary

- **RLS**: Row Level Security (Supabase database policies)
- **RSC**: React Server Components
- **SSR**: Server-Side Rendering
- **SSG**: Static Site Generation
- **PKCE**: Proof Key for Code Exchange (OAuth flow)
- **RBAC**: Role-Based Access Control
- **i18n**: Internationalization
- **E2E**: End-to-End (testing)

---

**Last Updated**: 2025-01-XX  
**Maintained By**: TouchBase Development Team  
**Questions?**: See `CLAUDE.md` for development guidelines

