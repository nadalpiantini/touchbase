# TouchBase SaaS - Product Requirements Document

## Executive Summary

TouchBase is a modern cloud-based Sports Club Management System currently serving baseball organizations. This PRD outlines the expansion from a basic player/team/game management system into a comprehensive **Life Skills & Education Management Platform** inspired by successful SaaS implementations in academic sports programs.

### Current State
- **Platform**: Next.js 15 (App Router, React Server Components)
- **Auth & DB**: Supabase (PostgreSQL + Row Level Security)
- **Multi-tenancy**: Organization-based with tenant switching
- **Existing Modules**: Players, Teams, Games, Audit Log
- **i18n**: English/Spanish
- **Deployment**: Vercel with custom domain support

### Vision
Transform TouchBase into a whitelabel-ready SaaS platform that combines sports management with comprehensive educational tracking, enabling baseball academies and sports organizations to manage both athletic and academic development of their students.

## Business Objectives

### Primary Goals
1. **Educational Integration**: Add teacher, class, attendance, and curriculum management
2. **Whitelabel Capability**: Enable multi-tenant branding and module customization
3. **Comprehensive Tracking**: Progress monitoring beyond just sports metrics
4. **Scalability**: Support 100+ organizations with 10,000+ students
5. **ROI**: Reduce administrative overhead by 60% through automation

### Success Metrics
- **Adoption**: 10 academies onboarded in Q1
- **Retention**: 90% annual retention rate
- **Engagement**: 80% daily active coaches/admins
- **Time-to-Value**: New org operational within 24 hours
- **Quality**: <5% error rate in data entry/automation

## Target Users

### Primary Personas

**1. Academy Administrator (Owner)**
- Manages overall organization settings
- Controls module access and permissions
- Reviews comprehensive reports
- Sets budgets and financial controls
- Needs: Dashboard overview, analytics, export capabilities

**2. Head Coach / Athletic Director**
- Manages players, teams, schedules
- Tracks game performance and statistics
- Assigns players to classes/training groups
- Needs: Quick data entry, mobile access, visual reports

**3. Academic Coordinator / Teacher**
- Manages class schedules and curriculum
- Takes attendance and tracks progress
- Creates assessments and pacing guides
- Needs: Simple workflows, bulk operations, grade export

**4. Scout / Evaluator**
- Views player profiles and progress
- Limited write access
- Focuses on assessment data
- Needs: Read-only dashboards, comparison tools

**5. Parent / Guardian**
- Views their child's information
- Receives notifications
- Read-only access
- Needs: Mobile-friendly portal, alerts

## Functional Requirements

### FR1: Teacher & Staff Management

**FR1.1 Teacher Registration**
- CRUD operations for teacher profiles
- Fields: name, email, phone, specialization, certifications
- Photo upload with preview (circular avatar)
- Assignment to subject areas (English, Math, Science, Spanish, PE)
- Active/inactive status

**FR1.2 Staff Roles**
- Role types: Teacher, Coach, Administrator, Support Staff
- Permission sets per role
- Multi-role assignment (e.g., Coach + Teacher)

**FR1.3 Teacher Database View**
- Searchable/filterable table
- Sort by name, subject, status
- Quick actions: edit, archive, view classes
- Export to CSV/Excel

### FR2: Classes & Enrollment Management

**FR2.1 Class Creation**
- Fields: name, level (beginner/intermediate/advanced), subject
- Schedule: days, time, duration, location
- Capacity limits (min/max students)
- Teacher assignment (primary + assistant)
- Academic term/season linkage

**FR2.2 Enrollment System**
- Assign players to classes
- Bulk enrollment from player lists
- Waitlist management for full classes
- Status tracking: enrolled, completed, dropped, transferred
- Prerequisites checking

**FR2.3 Class Roster**
- Visual roster with player photos
- Attendance quick-view
- Progress indicators per student
- Communication tools (announcements to class)

### FR3: Attendance System

**FR3.1 Attendance Taking**
- Daily/session-based attendance entry
- Quick toggle interface: Present, Absent, Excused, Tardy
- Bulk mark all present
- Notes field for absences
- Retroactive editing with audit trail

**FR3.2 Attendance Alerts**
- Configurable thresholds (e.g., 3 absences triggers alert)
- Email/SMS notifications to parents and admin
- Patterns detection (chronic absenteeism)

**FR3.3 Attendance Reports**
- Individual player history
- Class-level statistics
- Organization-wide trends
- Export for compliance/records
- Visual charts (line graphs, heat maps)

### FR4: Scheduling System

**FR4.1 Calendar Management**
- Master schedule view (day/week/month)
- Resource allocation (fields, classrooms, equipment)
- Conflict detection
- Recurring sessions setup
- Holiday/blackout dates

**FR4.2 Session Types**
- Training sessions, games, classes, evaluations
- Color-coded by type
- Drag-and-drop rescheduling
- Bulk operations (copy week, shift all by N days)

**FR4.3 Notifications**
- Schedule changes auto-notify affected users
- Upcoming session reminders (24h, 1h before)
- Integration with calendar exports (iCal, Google)

### FR5: Progress Tracking

**FR5.1 Player Progress Profiles**
- Academic levels: Overall, English, Spanish, Math, Science
- Athletic assessments: Skills, Physical tests, Game stats
- Behavioral notes: Effort, Attitude, Leadership
- Milestone tracking: Achievements, Certifications

**FR5.2 Progress Notes System**
- Timestamped notes by teachers/coaches
- Categorized: Academic, Athletic, Personal, Disciplinary
- Tagging for searchability
- Visibility controls (private notes vs shared)

**FR5.3 Assessment Tools**
- Placement tests (initial skill evaluation)
- Periodic evaluations (quarterly reviews)
- Standardized forms with scoring rubrics
- Comparison over time (trend analysis)

**FR5.4 Parent Visibility**
- Shareable progress reports
- Permission-based data access
- Export to PDF for meetings

### FR6: Curriculum Management

**FR6.1 Curriculum Library**
- CRUD for curriculum documents
- Subjects: English, Math, Science, Spanish, Baseball Skills
- Levels: Beginner, Intermediate, Advanced
- Versioning and templates

**FR6.2 Pacing Guides**
- Week-by-week lesson plans
- Learning objectives per unit
- Resource attachments (PDFs, links)
- Progress tracking against guide

**FR6.3 Placement Tests**
- Pre-built test templates
- Custom test creation
- Automatic level assignment based on scores
- Retest scheduling

### FR7: Budgeting Module

**FR7.1 Budget Planning**
- Annual/quarterly budget creation
- Categories: Salaries, Equipment, Facilities, Marketing
- Department allocation (Athletic vs Academic)

**FR7.2 Expense Tracking**
- Expense entry with receipts upload
- Approval workflows
- Budget vs actual comparison
- Alerts for over-budget categories

**FR7.3 Revenue Tracking**
- Tuition/fees collection status
- Sponsorship tracking
- Fundraising campaign management

**FR7.4 Financial Reports**
- P&L statements
- Cash flow projections
- Per-student cost analysis
- Export to accounting software (QuickBooks, Xero)

### FR8: Comprehensive Reporting

**FR8.1 Executive Dashboard**
- KPI tiles: Total students, attendance %, budget health
- Recent activity feed
- Quick access to critical reports
- Customizable widgets

**FR8.2 Standard Reports**
- Player roster (all orgs, filtered by team/class/level)
- Attendance summary (by date range, player, class)
- Progress reports (individual, cohort comparisons)
- Teacher workload (classes taught, students, hours)
- Game statistics (wins/losses, scores, player stats)
- Budget variance reports

**FR8.3 Custom Report Builder**
- Drag-and-drop fields
- Filters: date, org, status, level, etc.
- Export: PDF, Excel, CSV
- Save and schedule recurring reports

### FR9: Whitelabel & Branding

**FR9.1 Tenant Theming**
- Brand colors (primary, secondary, accent)
- Logo upload (header, favicon, loading screen)
- Typography selection (Google Fonts)
- Custom domain mapping (e.g., phillies.touchbase.app)

**FR9.2 Module Control**
- Enable/disable modules per tenant
- Module-level permissions
- Locked state UI for disabled modules
- Upsell messaging for premium modules

**FR9.3 Content Customization**
- Editable landing page hero text
- Organization name/slogan
- Contact information footer
- Terms of Service / Privacy Policy links

### FR10: Role-Based Access Control (RBAC)

**FR10.1 Role Definitions**
- Owner: Full admin + billing
- Admin: Manage users, view all data
- Coach: Players, teams, games, schedules
- Teacher: Classes, attendance, curriculum, progress
- Scout: Read-only player data
- Parent: Own child data only

**FR10.2 Permission Matrix**
- Granular permissions per module and action
- Inherit roles (e.g., Owner includes Admin)
- Audit log of permission changes

**FR10.3 Multi-Org Users**
- Users can belong to multiple orgs
- Role varies per org
- Context switching UI

## Non-Functional Requirements

### NFR1: Performance
- **Page Load**: <2s for dashboard, <1s for lists
- **API Response**: <500ms for CRUD operations
- **Concurrent Users**: Support 500 concurrent users per org
- **Database Queries**: Optimized with indexes, <100ms query time

### NFR2: Security
- **Authentication**: Supabase Auth with MFA support
- **Authorization**: Row Level Security enforcing tenant isolation
- **Data Encryption**: At rest (AES-256) and in transit (TLS 1.3)
- **PII Protection**: Mask sensitive data in logs/exports
- **Compliance**: GDPR-compliant data handling, deletion workflows

### NFR3: Scalability
- **Horizontal Scaling**: Stateless architecture
- **Database**: PostgreSQL with read replicas
- **CDN**: Static assets via Vercel Edge Network
- **Caching**: Redis for session/query cache

### NFR4: Reliability
- **Uptime**: 99.9% SLA
- **Backups**: Daily automated backups, 30-day retention
- **Disaster Recovery**: RTO <4 hours, RPO <1 hour
- **Monitoring**: Real-time alerts (Sentry, Vercel Analytics)

### NFR5: Usability
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile**: Responsive design, PWA-ready
- **i18n**: Support English, Spanish (extendable to more)
- **Onboarding**: Interactive tutorial on first login
- **Help System**: Context-sensitive tooltips, knowledge base

### NFR6: Maintainability
- **Code Quality**: ESLint, Prettier, 80%+ test coverage
- **Documentation**: Inline JSDoc, architecture diagrams
- **Version Control**: Git with protected main branch
- **CI/CD**: Automated tests, preview deployments, Vercel production

### NFR7: Extensibility
- **API**: RESTful with OpenAPI spec
- **Webhooks**: Event-driven notifications (player created, attendance taken)
- **Export**: Bulk data export via CSV/JSON
- **Integrations**: OAuth for third-party apps (future)

## User Experience Requirements

### UX1: Multi-Step Forms
- **Wizard Pattern**: Registration forms broken into 3-5 steps
- **Progress Indicator**: Visual stepper showing current step
- **Auto-Save**: Draft saved every 30 seconds
- **Validation**: Real-time field validation with clear error messages
- **Navigation**: Next/Previous buttons, skip optional sections

### UX2: Navigation & Layout
- **Persistent Header**: Sticky nav with org switcher, user menu
- **Sidebar**: Collapsible module menu with icons
- **Breadcrumbs**: Show current location in hierarchy
- **Search**: Global search across all entities
- **Quick Actions**: Floating action button (FAB) for "Create New"

### UX3: Data Tables
- **Pagination**: 25/50/100 rows per page
- **Sorting**: Click column headers to sort
- **Filtering**: Multi-select filters, date ranges, search box
- **Bulk Actions**: Select multiple rows, apply actions
- **Inline Editing**: Click to edit, auto-save on blur

### UX4: Visual Feedback
- **Loading States**: Skeleton screens, spinners
- **Success/Error**: Toast notifications (Snackbar)
- **Confirmation Dialogs**: Prevent accidental deletions
- **Empty States**: Helpful illustrations + CTA buttons

### UX5: Accessibility
- **Keyboard Navigation**: All actions via keyboard
- **Focus Indicators**: Visible focus rings
- **Screen Reader**: ARIA labels, semantic HTML
- **Color Contrast**: WCAG AA (4.5:1 for text)
- **Text Scaling**: Support up to 200% zoom

## Data Model

### Core Entities

**tenants**
- id, name, slug, plan (free/pro/enterprise), created_at, theme_id

**users**
- id, email, name, avatar_url, locale

**memberships**
- user_id, tenant_id, role, created_at

**modules**
- id, key (players, teachers, attendance, etc.), name, description

**tenant_modules**
- tenant_id, module_id, enabled

**players**
- id, tenant_id, name, email, phone, dob, photo_url, affiliation, position, signing_year, academic_level_overall, english_level, spanish_level, math_level, science_level, family_contact, notes, created_at, deleted_at

**teachers**
- id, tenant_id, name, email, phone, photo_url, specialization, certifications, status, created_at, deleted_at

**classes**
- id, tenant_id, name, level, subject, teacher_id, assistant_teacher_id, schedule_days, schedule_time, duration, location, capacity_min, capacity_max, term, created_at, deleted_at

**enrollments**
- id, tenant_id, class_id, player_id, status (enrolled/completed/dropped), enrolled_at, completed_at

**attendance**
- id, tenant_id, class_id, player_id, date, status (present/absent/excused/tardy), notes, created_by, created_at

**schedules**
- id, tenant_id, session_type (training/game/class/evaluation), resource_id, resource_type, start_time, end_time, location, participants_json, notes, created_at

**progress_notes**
- id, tenant_id, player_id, author_id, category (academic/athletic/personal/disciplinary), note, tags, visibility (private/shared), created_at

**assessments**
- id, tenant_id, player_id, assessment_type (placement/periodic), subject, scores_json, evaluator_id, assessed_at

**curriculums**
- id, tenant_id, subject, level, version, content_json, created_at

**pacing_guides**
- id, tenant_id, curriculum_id, week_number, objectives, resources_json, created_at

**budgets**
- id, tenant_id, fiscal_year, category, department, planned_amount, actual_amount, created_at

**expenses**
- id, tenant_id, budget_id, amount, description, receipt_url, approved_by, approved_at, created_at

**tenant_themes**
- id, tenant_id, primary_color, secondary_color, accent_color, logo_url, favicon_url, font_family, custom_domain

**audit_logs** (existing)
- id, tenant_id, user_id, action, entity_type, entity_id, changes_json, created_at

### Relationships
- tenants ← users (memberships)
- tenants ← modules (tenant_modules)
- tenants → players, teachers, teams, games, classes
- players ↔ classes (enrollments)
- classes → teachers
- attendance → classes + players
- progress_notes → players

## Technical Architecture

### Frontend
- **Framework**: Next.js 15 (App Router, React Server Components)
- **UI**: Tailwind CSS 4 + Custom Components (Button, Card, Badge, Modal, Table)
- **Forms**: React Hook Form + Zod validation
- **State**: React Query for server state, Context for global client state
- **i18n**: next-intl with locale routing

### Backend
- **API**: Next.js Route Handlers (app/api/**/route.ts)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Auth**: Supabase Auth (email/password, OAuth optional)
- **Storage**: Supabase Storage for photos/receipts (presigned URLs)
- **Search**: PostgreSQL full-text search, future: Algolia/Typesense

### Infrastructure
- **Hosting**: Vercel (Edge Network + Serverless Functions)
- **Database**: Supabase (managed PostgreSQL)
- **CDN**: Vercel Edge
- **Monitoring**: Vercel Analytics, Sentry for errors
- **CI/CD**: GitHub Actions + Vercel auto-deploy

### Security
- **Tenant Isolation**: RLS policies enforce tenant_id filtering
- **API Security**: JWT validation, rate limiting
- **Input Validation**: Zod schemas on API routes
- **CSP**: Content Security Policy headers
- **CORS**: Configured for custom domains

## Migration Strategy

### Phase 1: Foundation (Sprints 0-2)
- Design system tokens for whitelabel
- RBAC middleware implementation
- Module registry with enable/disable flags
- Multi-step form components (Wizard, Stepper)

### Phase 2: Core Educational Modules (Sprints 3-5)
- Teachers module (mirror players structure)
- Classes module with enrollment
- Attendance system (take + reports)
- Basic scheduling (calendar view)

### Phase 3: Advanced Tracking (Sprints 6-8)
- Progress tracking system
- Curriculum management
- Assessment tools
- Enhanced reporting dashboard

### Phase 4: Financial & Whitelabel (Sprints 9-10)
- Budgeting module
- Tenant theme customization
- Custom domain routing
- Admin panel for tenant management

### Phase 5: Polish & Launch (Sprint 11)
- Onboarding wizard for new orgs
- Knowledge base articles
- Performance optimization
- Security audit

## Implementation Priorities

### Must-Have (MVP)
1. Teachers CRUD
2. Classes + Enrollments
3. Attendance (take + basic reports)
4. Basic RBAC (4 roles)
5. Module enable/disable
6. Whitelabel colors + logo

### Should-Have (V1.5)
7. Progress notes
8. Scheduling calendar
9. Curriculum library
10. Comprehensive reports
11. Custom domains
12. Onboarding wizard

### Nice-to-Have (V2)
13. Budgeting full module
14. Placement tests
15. Advanced analytics
16. Mobile apps (native)
17. Third-party integrations

## Success Criteria

### Launch Readiness
- ✅ All MVP features tested (E2E + manual)
- ✅ Performance benchmarks met (<2s dashboard load)
- ✅ Security audit passed (no critical vulnerabilities)
- ✅ Documentation complete (API, user guides)
- ✅ Pilot academy onboarded successfully

### Post-Launch (90 days)
- ✅ 10 academies live
- ✅ 90% feature adoption rate
- ✅ <10 critical bugs reported
- ✅ 85% user satisfaction (NPS ≥50)
- ✅ 99.9% uptime achieved

## Open Questions

1. **Billing**: Integrate Stripe now or post-MVP?
2. **Mobile**: PWA sufficient or native apps required?
3. **Notifications**: Email-only or add SMS/Push?
4. **Offline**: Need offline-first sync?
5. **AI Features**: Auto-grading, attendance predictions?
6. **Integrations**: Priority third-party tools (Google Classroom, Canvas)?
7. **Multi-Language**: How many locales for V1?

## Appendix

### Glossary
- **Tenant**: Organization (academy) using the platform
- **RLS**: Row Level Security (database access control)
- **RSC**: React Server Components
- **PWA**: Progressive Web App
- **WCAG**: Web Content Accessibility Guidelines

### References
- Life Skills & Education Management (Canva implementation analysis)
- TouchBase current codebase (Next.js + Supabase)
- BMAD Method user guide
- Supabase RLS best practices
- Next.js App Router patterns

---

**Document Version**: 1.0
**Created**: 2025-10-30
**Author**: Product Team
**Status**: Draft for Review
