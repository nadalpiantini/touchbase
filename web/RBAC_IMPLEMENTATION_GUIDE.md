# RBAC Implementation Guide for TouchBase APIs

**Date**: 2025-12-20
**Status**: In Progress (3/81 APIs completed)
**Priority**: P0 - CRITICAL FOR PRODUCTION

---

## 🎯 Objective

Implement Role-Based Access Control (RBAC) on all 81 API endpoints to prevent unauthorized access.

**Current Status**: Only basic auth check exists. Any authenticated user can access all endpoints.
**Target Status**: Role-based enforcement on all endpoints.

---

## 📋 Implementation Pattern

### Step 1: Import RBAC Middleware

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withRBAC } from "@/lib/rbac/middleware";
import { supabaseServer } from "@/lib/supabase/server";
```

### Step 2: Wrap Handler with withRBAC

**BEFORE** (Unsafe - any authenticated user can access):
```typescript
export async function POST(req: Request) {
  const s = await supabaseServer();
  const { data: { user } } = await s.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get org from RPC
  const { data: cur } = await s.rpc("touchbase_current_org");
  const current = cur?.[0];

  if (!current?.org_id) {
    return NextResponse.json({ error: "No default org" }, { status: 400 });
  }

  // Rest of logic...
}
```

**AFTER** (Secure - role enforcement):
```typescript
export const POST = withRBAC(
  async (request: NextRequest, { orgId, role }) => {
    const s = await supabaseServer();
    const data = await request.json().catch(() => ({}));

    // orgId is already validated by RBAC middleware
    // No need to call touchbase_current_org RPC

    // Rest of logic using orgId directly...
  },
  { allowedRoles: ['owner', 'admin'] }  // Define required roles
);
```

### Step 3: Remove Manual Checks

**Remove these patterns** (handled by withRBAC):
- ❌ `if (!user) return 401` - Auth check done by middleware
- ❌ `await s.rpc("touchbase_current_org")` - orgId provided by middleware
- ❌ `if (!orgId) return 400` - Validation done by middleware
- ❌ `isDevMode() && !user` - Dev mode properly gated

**Benefits**:
- ✅ Automatic auth check
- ✅ Automatic role verification
- ✅ Automatic org_id validation
- ✅ Cleaner code (less boilerplate)
- ✅ Consistent error messages

---

## 🔐 Role Hierarchy

```
owner (highest)
  ↓
admin
  ↓
coach / teacher (equivalent)
  ↓
viewer
  ↓
student (lowest)
```

**Rule**: Specifying a role grants access to that role AND all higher roles.

Example: `allowedRoles: ['coach']` allows owner, admin, AND coach (but not viewer/student)

---

## 📊 API Endpoint Classification

### Tier 1: Admin Only (owner/admin)
**Pattern**: `{ allowedRoles: ['owner', 'admin'] }`

**Endpoints**:
- ✅ `/api/teachers/create` - IMPLEMENTED
- ✅ `/api/audit/list` - IMPLEMENTED
- `/api/teachers/[id]` (PUT/DELETE)
- `/api/orgs/*` - All organization management
- `/api/admin/*` - All admin endpoints
- `/api/budgeting/*` - Budget management
- `/api/dev/*` - Dev tools

---

### Tier 2: Role-Based (owner/admin/role)
**Pattern**: `{ allowedRoles: ['owner', 'admin', 'coach'] }` or `['owner', 'admin', 'teacher']`

**Endpoints**:
- ✅ `/api/players/create` - IMPLEMENTED (coach)
- `/api/players/*` - Player management (coach)
- `/api/teams/*` - Team management (coach)
- `/api/games/*` - Game management (coach)
- `/api/classes/*` - Class management (teacher)
- `/api/attendance/*` - Attendance tracking (teacher)
- `/api/schedules/*` - Schedule management (teacher)
- `/api/placement-tests/*` - Test management (teacher)
- `/api/assignments/*` - Assignment management (teacher)

---

### Tier 3: Authenticated (all roles)
**Pattern**: `{ allowedRoles: ['owner', 'admin', 'coach', 'teacher', 'viewer', 'student'] }`
Or simply: No RBAC (basic auth sufficient)

**Endpoints**:
- `/api/modules/list` - View modules
- `/api/badges/list` - View badges
- `/api/badges/user` - Own badges
- `/api/progress/*` - Own progress only (RLS enforced)
- `/api/xp/*` - XP tracking
- `/api/leaderboards/*` - View leaderboards
- `/api/student-life/*` - Student features

---

## 📖 Implementation Examples

### Example 1: Admin-Only Endpoint
```typescript
// /api/teachers/create/route.ts
export const POST = withRBAC(
  async (request: NextRequest, { orgId, role }) => {
    const s = await supabaseServer();
    const data = await request.json().catch(() => ({}));

    // Validation
    if (!data.full_name || data.full_name.trim().length < 2) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    // Insert with orgId from middleware
    const { data: result, error } = await s
      .from("touchbase_teachers")
      .insert({ org_id: orgId, ...data })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: result.id });
  },
  { allowedRoles: ['owner', 'admin'] }
);
```

### Example 2: Coach-Level Endpoint
```typescript
// /api/players/create/route.ts
export const POST = withRBAC(
  async (request: NextRequest, { orgId, role }) => {
    const s = await supabaseServer();
    const data = await request.json().catch(() => ({}));

    // Coaches can create players in their org
    const { data: player, error } = await s
      .from("touchbase_players")
      .insert({ org_id: orgId, ...data })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: player.id });
  },
  { allowedRoles: ['owner', 'admin', 'coach'] }
);
```

### Example 3: GET Endpoint with Filters
```typescript
// /api/audit/list/route.ts
export const GET = withRBAC(
  async (request: NextRequest, { orgId, role }) => {
    const s = await supabaseServer();
    const url = new URL(request.url);

    // Query params
    const entity = url.searchParams.get("entity");
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    // Build query with orgId filter
    let query = s.from("touchbase_audit_log")
      .select("*")
      .eq("org_id", orgId)  // Explicit org filtering
      .order("created_at", { ascending: false })
      .limit(limit);

    if (entity) query = query.eq("entity", entity);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ logs: data ?? [] });
  },
  { allowedRoles: ['owner', 'admin'] }
);
```

---

## ✅ Migration Checklist (Per Endpoint)

- [ ] Import `withRBAC` and `NextRequest` types
- [ ] Change `async function VERB(req: Request)` to `export const VERB = withRBAC(...)`
- [ ] Update function signature to `(request: NextRequest, { orgId, role })`
- [ ] Remove manual auth check (`if (!user)`)
- [ ] Remove manual org lookup (`touchbase_current_org` RPC)
- [ ] Replace `current.org_id` with `orgId` parameter
- [ ] Add `allowedRoles` configuration
- [ ] Test endpoint with different roles
- [ ] Verify 403 response for unauthorized roles

---

## 🚀 Rollout Plan

### Phase 1: Critical Endpoints (Priority P0) - CURRENT
- [x] `/api/teachers/create` - ✅ Completed
- [x] `/api/audit/list` - ✅ Completed
- [x] `/api/players/create` - ✅ Completed
- [ ] `/api/orgs/*` - In progress
- [ ] `/api/admin/*` - Pending
- [ ] `/api/teachers/[id]` (PUT/DELETE) - Pending

### Phase 2: Role-Based Endpoints (Priority P0)
- [ ] `/api/teams/*` - All team operations
- [ ] `/api/games/*` - All game operations
- [ ] `/api/classes/*` - All class operations
- [ ] `/api/schedules/*` - All schedule operations

### Phase 3: Remaining Endpoints (Priority P1)
- [ ] All other authenticated endpoints
- [ ] Public endpoints (health, auth)

---

## 🧪 Testing

### Manual Testing
```bash
# 1. Create test users with different roles
# 2. Get auth tokens for each role
# 3. Test each endpoint with curl:

# Should succeed (owner/admin)
curl -X POST http://localhost:3000/api/teachers/create \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Test Teacher"}'

# Should fail with 403 (coach trying admin endpoint)
curl -X POST http://localhost:3000/api/teachers/create \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Test Teacher"}'
```

### E2E Testing
Add Playwright tests for RBAC:
```typescript
test('should deny coach access to admin endpoints', async ({ page }) => {
  // Login as coach
  await loginUser(page, COACH_USER.email, COACH_USER.password);

  // Try to access admin endpoint via UI
  await page.goto('/dashboard/teachers/new');

  // Should see 403 or redirect
  await expect(page.locator('text=Access denied')).toBeVisible();
});
```

---

## 📊 Progress Tracking

**Completed**: 3/81 (4%)
**In Progress**: Tier 1 critical endpoints
**Target**: 100% before production

---

## 🔗 Related Files

- RBAC Middleware: `web/lib/rbac/middleware.ts`
- Role Types: `web/lib/rbac/types.ts`
- Permission Helpers: `web/lib/rbac/permissions.ts`
- SWAT Analysis: Serena memory `swat_analysis_2025_12_20`
- Fix Progress: Serena memory `swat_p0_fixes_progress`

---

**Last Updated**: 2025-12-20 16:45
