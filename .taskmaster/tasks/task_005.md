# Task ID: 5

**Title:** Attendance System with Analytics & Streak Tracking

**Status:** pending

**Dependencies:** 3, 4

**Priority:** medium

**Description:** Implement attendance marking (present/late/absent), daily analytics dashboard, and streak tracking system with recovery mechanisms

**Details:**

1. Build attendance marking UI (teacher view with student list)
2. Create Firestore schema: attendance collection (class_id, date, student_id, status)
3. Implement daily analytics (attendance rate, trends)
4. Build streak tracking system (consecutive days present)
5. Add streak recovery mechanism (grace period)
6. Create attendance history view

API Routes: /api/attendance/mark, /api/attendance/class/[classId], /api/attendance/analytics
Collections: touchbase_attendance (class_id, date, student_id, status, created_at)

**Test Strategy:**

Test attendance marking, verify analytics calculations, test streak tracking logic, and validate recovery mechanism
