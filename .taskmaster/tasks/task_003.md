# Task ID: 3

**Title:** Authentication & User Management System

**Status:** pending

**Dependencies:** 1

**Priority:** high

**Description:** Implement Firebase Authentication with multi-role support (player/teacher/admin), profile management with photo upload, and role-based access control

**Details:**

1. Integrate Firebase Auth with email/password and OAuth providers
2. Create user profile schema in Firestore (roles, default_org_id, photo_url)
3. Build profile management UI with image upload to Firebase Storage
4. Implement role-based routing middleware (Next.js middleware.ts)
5. Create Firestore security rules for role-based access
6. Build signup/login flows for each role type

API Routes: /api/auth/signup, /api/auth/login, /api/auth/signout
Security: Firestore rules based on user.role and org_id

**Test Strategy:**

Test authentication flows, verify role-based access control, test image upload, and validate security rules
