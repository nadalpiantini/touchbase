# EPIC-01: Whitelabel Foundation & RBAC

## Epic Overview

**ID**: EPIC-01
**Priority**: P0 (Must-Have for MVP)
**Sprint**: 0-2
**Status**: Not Started

### Goal
Establish the foundational architecture for whitelabel multi-tenant capabilities and role-based access control, enabling the platform to support custom branding and granular permissions.

### Business Value
- Enable whitelabel deployments for different academies
- Secure multi-tenant data isolation
- Scalable permission system for future modules
- Consistent UI theming across platform

### Success Criteria
- [ ] Tenant themes can be customized (colors, logo, fonts)
- [ ] CSS variables dynamically injected per tenant
- [ ] RBAC middleware enforces permissions on all routes
- [ ] Module enable/disable per tenant functional
- [ ] All existing features work with new foundation

### Dependencies
- None (foundational epic)

### Stories

1. **STORY-01.1**: Design System Tokens (2 points)
2. **STORY-01.2**: Theme Provider Component (3 points)
3. **STORY-01.3**: Tenant Themes Database Schema (2 points)
4. **STORY-01.4**: RBAC Middleware Implementation (5 points)
5. **STORY-01.5**: Module Registry System (3 points)
6. **STORY-01.6**: Permission Hooks & Guards (3 points)

**Total Story Points**: 18

### Technical Notes

**Database Changes**:
- Add `tenant_themes` table
- Add `modules` and `tenant_modules` tables
- Add role column to `memberships` if missing

**Code Patterns**:
- CSS variable injection in `ThemeProvider`
- Permission checking via `usePermissions()` hook
- Module availability via `useModules()` hook
- Middleware chain: auth → tenant → permissions

### Risks
- **Risk 1**: CSS variable support in older browsers
  - Mitigation: Fallback to default theme
- **Risk 2**: Performance impact of middleware chain
  - Mitigation: Cache tenant/permission data in session

---

## Related Documents
- PRD: Sections FR9, FR10, NFR4, NFR5
- Architecture: Whitelabel & Branding, RBAC
