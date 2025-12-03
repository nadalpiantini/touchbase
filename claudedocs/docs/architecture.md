# TouchBase SaaS - Technical Architecture

## Document Control

- **Version**: 1.0
- **Date**: 2025-10-30
- **Status**: Draft for Review
- **Related**: PRD v1.0

---

## Executive Summary

This architecture document defines the technical design for TouchBase SaaS, a whitelabel-ready multi-tenant sports club and education management platform. The system extends an existing Next.js + Supabase foundation to support comprehensive educational tracking, role-based access control, and tenant customization.

### Key Architectural Decisions

1. **Keep Existing Foundation**: Leverage Next.js 15 App Router + Supabase stack
2. **Vertical Slice Architecture**: Organize by feature/module, not technical layer
3. **Database-First Multi-tenancy**: Use Supabase RLS for tenant isolation
4. **Component-Based UI**: Reusable design system with theming
5. **API Route Patterns**: Consistent REST conventions with validation
6. **Progressive Enhancement**: Add features without breaking existing functionality

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser/PWA)                     │
├─────────────────────────────────────────────────────────────┤
│  Next.js App Router (React Server Components + Client)      │
│  ├─ Public Routes: Landing, Login, Signup                   │
│  ├─ Protected Routes: Dashboard, Modules                    │
│  └─ API Routes: /api/{module}/{action}                      │
├─────────────────────────────────────────────────────────────┤
│                    EDGE RUNTIME (Vercel)                     │
│  ├─ Middleware: Auth, i18n, Tenant Resolution              │
│  ├─ Server Actions: Form submissions                        │
│  └─ Route Handlers: REST API                                │
├─────────────────────────────────────────────────────────────┤
│                   SUPABASE (Backend Services)                │
│  ├─ Auth: Email/Password, OAuth (optional)                  │
│  ├─ Database: PostgreSQL with RLS                           │
│  ├─ Storage: Files (photos, receipts)                       │
│  └─ Realtime: (future) Live updates                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 15.5.5 | App Router, RSC, SSR |
| UI Library | React | 19.1.0 | Component rendering |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Forms | React Hook Form | latest | Form state management |
| Validation | Zod | 4.x | Schema validation |
| i18n | next-intl | 4.3.12 | Internationalization |
| State | React Query | 5.90.3 | Server state caching |
| Icons | Lucide React | latest | Icon system |
| Charts | Recharts | latest | Data visualization |

### Backend

| Service | Technology | Purpose |
|---------|-----------|---------|
| Database | Supabase PostgreSQL | Primary data store |
| Auth | Supabase Auth | User authentication |
| Storage | Supabase Storage | File uploads |
| API | Next.js Route Handlers | REST endpoints |
| Validation | Zod | Runtime type safety |
| ORM | Supabase Client | Type-safe queries |

### Infrastructure

| Component | Provider | Purpose |
|-----------|---------|---------|
| Hosting | Vercel | Serverless deployment |
| CDN | Vercel Edge | Static assets |
| DNS | Vercel Domains | Custom domains |
| Monitoring | Vercel Analytics | Performance |
| Error Tracking | Sentry | Error logging |
| CI/CD | GitHub Actions | Automated testing |

---

## Database Design

### Schema Overview

**Core Tenancy**
- `tenants`: Organizations using the platform
- `users`: Individual user accounts
- `memberships`: User-to-tenant associations with roles
- `tenant_themes`: Branding customization per tenant
- `modules`: Available system modules
- `tenant_modules`: Enabled modules per tenant

**Existing Entities** (Keep as-is)
- `players`: Player profiles
- `teams`: Team records
- `games`: Game events and scores
- `audit_logs`: Activity tracking

**New Educational Entities**
- `teachers`: Staff profiles
- `classes`: Course/training sessions
- `enrollments`: Player-to-class assignments
- `attendance`: Attendance records
- `schedules`: Master calendar events
- `progress_notes`: Student progress tracking
- `assessments`: Evaluations and tests
- `curriculums`: Course content
- `pacing_guides`: Lesson plans
- `budgets`: Financial planning
- `expenses`: Expenditure tracking

### Key Tables (Detailed)

#### tenants
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  custom_domain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### memberships
```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'coach', 'teacher', 'scout', 'parent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);
```

#### tenant_modules
```sql
CREATE TABLE tenant_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  UNIQUE(tenant_id, module_key)
);
```

#### teachers
```sql
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  specialization TEXT,
  certifications TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

#### classes
```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  subject TEXT NOT NULL,
  teacher_id UUID REFERENCES teachers(id),
  assistant_teacher_id UUID REFERENCES teachers(id),
  schedule_days TEXT[], -- ['Monday', 'Wednesday']
  schedule_time TIME,
  duration INTEGER, -- minutes
  location TEXT,
  capacity_min INTEGER,
  capacity_max INTEGER,
  term TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

#### enrollments
```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'transferred')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(class_id, player_id)
);
```

#### attendance
```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'excused', 'tardy')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, player_id, date)
);
```

### Row Level Security (RLS) Policies

All tables enforce tenant isolation via RLS:

```sql
-- Example: teachers table
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON teachers
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM memberships WHERE user_id = auth.uid()
    )
  );
```

**Policy Pattern**: Every table with `tenant_id` gets this policy, ensuring users only access their organization's data.

### Indexes

```sql
-- Tenant isolation (critical for performance)
CREATE INDEX idx_players_tenant ON players(tenant_id);
CREATE INDEX idx_teachers_tenant ON teachers(tenant_id);
CREATE INDEX idx_classes_tenant ON classes(tenant_id);
CREATE INDEX idx_attendance_tenant ON attendance(tenant_id);

-- Lookups
CREATE INDEX idx_enrollments_class ON enrollments(class_id);
CREATE INDEX idx_enrollments_player ON enrollments(player_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_class_date ON attendance(class_id, date);

-- Soft deletes
CREATE INDEX idx_teachers_deleted ON teachers(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_classes_deleted ON classes(deleted_at) WHERE deleted_at IS NULL;
```

---

## Application Architecture

### Directory Structure (Vertical Slices)

```
web/
├── app/
│   ├── [locale]/               # i18n routing
│   │   ├── (protected)/        # Auth-required routes
│   │   │   └── dashboard/
│   │   │       ├── players/
│   │   │       ├── teachers/   # NEW
│   │   │       ├── classes/    # NEW
│   │   │       ├── attendance/ # NEW
│   │   │       ├── schedule/   # NEW
│   │   │       ├── progress/   # NEW
│   │   │       ├── curriculum/ # NEW
│   │   │       ├── budgeting/  # NEW
│   │   │       ├── reports/    # NEW
│   │   │       └── teams/
│   │   ├── login/
│   │   └── signup/
│   ├── api/
│   │   ├── teachers/           # NEW
│   │   │   ├── create/
│   │   │   ├── list/
│   │   │   ├── update/
│   │   │   ├── soft-delete/
│   │   │   └── restore/
│   │   ├── classes/            # NEW
│   │   ├── enrollments/        # NEW
│   │   ├── attendance/         # NEW
│   │   └── ...
│   └── globals.css
├── components/
│   ├── ui/                     # Design system
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx           # NEW
│   │   ├── Wizard.tsx          # NEW (multi-step forms)
│   │   ├── Table.tsx           # NEW (data tables)
│   │   └── Calendar.tsx        # NEW (scheduling)
│   ├── teachers/               # NEW
│   │   ├── TeachersTable.tsx
│   │   └── NewTeacherForm.tsx
│   ├── classes/                # NEW
│   ├── attendance/             # NEW
│   └── org/
│       ├── OrgDropdown.tsx
│       └── ThemeProvider.tsx   # NEW (whitelabel)
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── hooks/                  # NEW
│   │   ├── use-tenant.ts
│   │   ├── use-modules.ts
│   │   └── use-permissions.ts
│   ├── schemas/                # NEW (Zod)
│   │   ├── teacher.ts
│   │   ├── class.ts
│   │   └── attendance.ts
│   └── utils.ts
├── middleware.ts               # Auth + i18n + tenant
└── types/
    └── database.ts             # Supabase types
```

### API Route Pattern

**Convention**: `/api/{entity}/{action}/route.ts`

Example: `app/api/teachers/create/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { teacherSchema } from '@/lib/schemas/teacher';

export async function POST(request: Request) {
  const supabase = await createClient();

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Tenant resolution
  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single();

  // 3. Permission check
  if (!['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Validation
  const body = await request.json();
  const validated = teacherSchema.parse(body);

  // 5. Database operation (RLS auto-filters by tenant)
  const { data, error } = await supabase
    .from('teachers')
    .insert({ ...validated, tenant_id: membership.tenant_id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 6. Audit log
  await supabase.from('audit_logs').insert({
    tenant_id: membership.tenant_id,
    user_id: user.id,
    action: 'create',
    entity_type: 'teacher',
    entity_id: data.id,
  });

  return NextResponse.json(data);
}
```

**Pattern Consistency**:
- ✅ Auth check first
- ✅ Tenant + permission resolution
- ✅ Zod validation
- ✅ RLS-protected query
- ✅ Audit logging
- ✅ Error handling

---

## Component Architecture

### Design System (Whitelabel-Ready)

**Theme Provider** (`components/org/ThemeProvider.tsx`)

```typescript
'use client';
import { createContext, useContext, useEffect } from 'react';

interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  fontFamily: string;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({
  children,
  theme
}: {
  children: React.ReactNode;
  theme: Theme
}) {
  useEffect(() => {
    // Inject CSS variables
    document.documentElement.style.setProperty('--primary', theme.primaryColor);
    document.documentElement.style.setProperty('--secondary', theme.secondaryColor);
    document.documentElement.style.setProperty('--accent', theme.accentColor);
    document.documentElement.style.setProperty('--font-brand', theme.fontFamily);
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

**Usage in Layout**:

```typescript
// app/[locale]/(protected)/layout.tsx
import { ThemeProvider } from '@/components/org/ThemeProvider';
import { getTenantTheme } from '@/lib/supabase/server';

export default async function ProtectedLayout({ children }) {
  const theme = await getTenantTheme();

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}
```

### Multi-Step Form Component

**Wizard Component** (`components/ui/Wizard.tsx`)

```typescript
'use client';
import { useState } from 'react';

interface WizardProps {
  steps: {
    title: string;
    component: React.ComponentType<any>;
  }[];
  onComplete: (data: any) => void;
}

export function Wizard({ steps, onComplete }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const handleNext = (stepData: any) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);

    if (currentStep === steps.length - 1) {
      onComplete(updatedData);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const StepComponent = steps[currentStep].component;

  return (
    <div>
      {/* Stepper UI */}
      <div className="flex justify-between mb-6">
        {steps.map((step, index) => (
          <div key={index} className={`step ${index === currentStep ? 'active' : ''}`}>
            {step.title}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <StepComponent onNext={handleNext} initialData={formData} />
    </div>
  );
}
```

**Usage Example**:

```typescript
// components/teachers/NewTeacherWizard.tsx
<Wizard
  steps={[
    { title: 'Basic Info', component: TeacherBasicStep },
    { title: 'Specialization', component: TeacherSpecStep },
    { title: 'Photo', component: TeacherPhotoStep },
  ]}
  onComplete={handleCreateTeacher}
/>
```

---

## Authentication & Authorization

### Middleware Flow

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { locales } from '@/i18n/config';

export async function middleware(request: Request) {
  const { pathname } = new URL(request.url);

  // 1. i18n redirect
  const locale = pathname.split('/')[1];
  if (!locales.includes(locale)) {
    return NextResponse.redirect(new URL(`/en${pathname}`, request.url));
  }

  // 2. Auth check for protected routes
  if (pathname.includes('/(protected)')) {
    const supabase = createServerClient(/* ... */);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### RBAC Permission Matrix

| Role | Players | Teams | Games | Teachers | Classes | Attendance | Curriculum | Budget | Reports |
|------|---------|-------|-------|----------|---------|------------|------------|--------|---------|
| Owner | Full | Full | Full | Full | Full | Full | Full | Full | Full |
| Admin | Full | Full | Full | Full | Full | Full | Full | Read | Full |
| Coach | Full | Full | Full | Read | Read | Take | Read | None | Own |
| Teacher | Read | Read | None | Read | Assigned | Take | Edit | None | Own |
| Scout | Read | Read | Read | None | None | None | None | None | None |
| Parent | Own | None | None | None | None | None | None | None | Own |

**Implementation**:

```typescript
// lib/hooks/use-permissions.ts
export function usePermissions() {
  const { membership } = useTenant();

  const can = (action: string, resource: string) => {
    const key = `${resource}.${action}`;
    return PERMISSIONS[membership.role]?.includes(key) ?? false;
  };

  return { can };
}

// Usage
const { can } = usePermissions();
if (can('create', 'teachers')) {
  // Show "New Teacher" button
}
```

---

## Data Flow Patterns

### Server Components (Default)

```typescript
// app/[locale]/(protected)/dashboard/teachers/page.tsx
import { getTeachers } from '@/lib/supabase/server';

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return <TeachersTable data={teachers} />;
}
```

### Client Components (Interactive)

```typescript
'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

export function TeachersTable({ initialData }) {
  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => fetch('/api/teachers/list').then(r => r.json()),
    initialData,
  });

  const { mutate: deleteTeacher } = useMutation({
    mutationFn: (id) => fetch(`/api/teachers/soft-delete`, {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),
  });

  return (
    <table>
      {teachers.map(teacher => (
        <tr key={teacher.id}>
          <td>{teacher.name}</td>
          <td>
            <button onClick={() => deleteTeacher(teacher.id)}>Delete</button>
          </td>
        </tr>
      ))}
    </table>
  );
}
```

---

## File Upload Strategy

### Photo Upload Flow

1. **Client**: Select file → validate (type, size)
2. **Upload to Supabase Storage**:
   ```typescript
   const { data, error } = await supabase.storage
     .from('avatars')
     .upload(`${tenantId}/${userId}/${filename}`, file);
   ```
3. **Get Public URL**:
   ```typescript
   const { data: { publicUrl } } = supabase.storage
     .from('avatars')
     .getPublicUrl(data.path);
   ```
4. **Save URL to database** (e.g., `teachers.photo_url`)

**Security**: Storage bucket has RLS policies matching database isolation.

---

## Performance Optimization

### Caching Strategy

1. **Server Components**: Auto-cached by Next.js
2. **API Routes**: `revalidate` tag for ISR
3. **Client State**: React Query with stale-while-revalidate
4. **Static Assets**: CDN via Vercel Edge

### Query Optimization

```sql
-- Use indexes aggressively
CREATE INDEX idx_attendance_class_date ON attendance(class_id, date);

-- Limit result sets
SELECT * FROM teachers WHERE tenant_id = ? LIMIT 100;

-- Pagination
SELECT * FROM players
WHERE tenant_id = ?
ORDER BY created_at DESC
LIMIT 25 OFFSET ?;
```

---

## Security Considerations

### Input Validation (Zod)

```typescript
// lib/schemas/teacher.ts
import { z } from 'zod';

export const teacherSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  specialization: z.string().optional(),
  certifications: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
});
```

### SQL Injection Prevention

✅ **Always use parameterized queries** (Supabase client does this automatically)

```typescript
// Safe (parameterized)
const { data } = await supabase
  .from('teachers')
  .select('*')
  .eq('id', userId);

// NEVER do this
const { data } = await supabase.rpc('unsafe_query', {
  sql: `SELECT * FROM teachers WHERE id = '${userId}'`
});
```

### XSS Prevention

✅ React auto-escapes content
✅ Use `dangerouslySetInnerHTML` sparingly
✅ Sanitize user HTML (DOMPurify if needed)

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// lib/schemas/teacher.test.ts
import { describe, it, expect } from 'vitest';
import { teacherSchema } from './teacher';

describe('teacherSchema', () => {
  it('validates valid teacher data', () => {
    const valid = { name: 'John Doe', email: 'john@example.com' };
    expect(() => teacherSchema.parse(valid)).not.toThrow();
  });

  it('rejects invalid email', () => {
    const invalid = { name: 'John', email: 'invalid' };
    expect(() => teacherSchema.parse(invalid)).toThrow();
  });
});
```

### Integration Tests (Playwright)

```typescript
// tests/teachers.spec.ts
import { test, expect } from '@playwright/test';

test('teacher creation flow', async ({ page }) => {
  await page.goto('/en/dashboard/teachers');
  await page.click('text=New Teacher');

  // Step 1: Basic Info
  await page.fill('input[name="name"]', 'Jane Smith');
  await page.fill('input[name="email"]', 'jane@academy.com');
  await page.click('text=Next');

  // Step 2: Specialization
  await page.selectOption('select[name="specialization"]', 'Math');
  await page.click('text=Create');

  // Verify
  await expect(page.locator('text=Jane Smith')).toBeVisible();
});
```

---

## Deployment Architecture

### Environments

| Environment | URL | Database | Purpose |
|-------------|-----|----------|---------|
| Development | localhost:3000 | Supabase Local | Local dev |
| Preview | `*.vercel.app` | Staging DB | PR previews |
| Production | touchbase.sujeto10.com | Prod DB | Live app |

### CI/CD Pipeline (GitHub Actions)

```yaml
name: CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run lint
      - run: npm run type-check
      - run: npx playwright test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Migration Plan

### Phase 1: Foundation (Sprint 0-1)
- ✅ Design tokens system (CSS variables)
- ✅ RBAC middleware
- ✅ Module registry table
- ✅ Wizard/Stepper components
- ✅ Theme Provider

### Phase 2: Teachers Module (Sprint 2)
- Database schema (teachers table + RLS)
- API routes (CRUD + soft delete)
- UI components (form, table)
- E2E tests

### Phase 3: Classes + Enrollments (Sprint 3)
- Database schema (classes, enrollments)
- API routes
- UI components
- Bulk enrollment tool

### Phase 4: Attendance (Sprint 4)
- Database schema (attendance)
- Quick-entry UI (take attendance)
- Reports (individual, class, org-wide)
- Alert system (email notifications)

### Phase 5: Scheduling (Sprint 5)
- Database schema (schedules)
- Calendar component (day/week/month)
- Conflict detection
- Resource allocation

### Phase 6: Progress Tracking (Sprint 6)
- Database schema (progress_notes, assessments)
- Player profile enhancements
- Assessment tools
- Parent portal (read-only)

### Phase 7: Curriculum (Sprint 7)
- Database schema (curriculums, pacing_guides)
- CRUD interfaces
- Template library
- Version control

### Phase 8: Budgeting (Sprint 8)
- Database schema (budgets, expenses)
- Budget planning UI
- Expense tracking
- Reports (P&L, variance)

### Phase 9: Whitelabel (Sprint 9)
- Tenant theme UI (admin panel)
- Logo/favicon upload
- Custom domain setup
- Module enable/disable UI

### Phase 10: Reports & Polish (Sprint 10)
- Executive dashboard
- Custom report builder
- Onboarding wizard
- Performance optimization

---

## Open Technical Questions

1. **Realtime Updates**: Use Supabase Realtime for attendance/schedule changes?
2. **Search**: PostgreSQL full-text vs Algolia for large datasets?
3. **Mobile**: PWA vs React Native for mobile apps?
4. **Offline**: Implement offline-first with service workers?
5. **Analytics**: PostHog vs Mixpanel for product analytics?
6. **Email**: Resend vs SendGrid for transactional emails?
7. **CDN**: Vercel Edge sufficient or add Cloudflare?

---

## Appendix

### API Endpoint Inventory

**Teachers**
- `POST /api/teachers/create`
- `GET /api/teachers/list`
- `PATCH /api/teachers/update`
- `DELETE /api/teachers/soft-delete`
- `POST /api/teachers/restore`
- `DELETE /api/teachers/purge`

**Classes**
- `POST /api/classes/create`
- `GET /api/classes/list`
- `PATCH /api/classes/update`
- `DELETE /api/classes/soft-delete`
- `POST /api/classes/restore`

**Enrollments**
- `POST /api/enrollments/create`
- `POST /api/enrollments/bulk`
- `DELETE /api/enrollments/remove`

**Attendance**
- `POST /api/attendance/take`
- `GET /api/attendance/list`
- `GET /api/attendance/report`

**Schedules**
- `POST /api/schedules/create`
- `GET /api/schedules/list`
- `PATCH /api/schedules/update`
- `DELETE /api/schedules/delete`

### Component Inventory

**UI Components**
- Button, Card, Badge, Modal, Wizard, Table, Calendar, Stepper, Toast, Dropdown, Tabs, Avatar

**Domain Components**
- TeachersTable, NewTeacherForm, TeachersCard
- ClassesTable, NewClassForm, ClassRoster
- AttendanceGrid, AttendanceReport
- ScheduleCalendar, SessionForm
- ProgressNotes, AssessmentForm
- CurriculumEditor, PacingGuide
- BudgetPlanner, ExpenseTracker

---

**End of Architecture Document**
