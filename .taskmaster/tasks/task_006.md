# Task ID: 6

**Title:** Scheduling System: Class Schedule Builder & Weekly Agenda

**Status:** pending

**Dependencies:** 4

**Priority:** medium

**Description:** Create class schedule builder for teachers, weekly agenda view for students, and push notification system for schedule reminders

**Details:**

1. Build schedule builder UI (day/time selection, recurring patterns)
2. Create Firestore schema: schedules collection (class_id, day_of_week, time, location)
3. Implement weekly agenda view for students (upcoming classes)
4. Set up push notification service (Firebase Cloud Messaging)
5. Create notification triggers for schedule reminders
6. Build schedule editing and deletion functionality

API Routes: /api/schedules/create, /api/schedules/class/[classId], /api/schedules/update
Mobile: Expo Notifications for push alerts

**Test Strategy:**

Test schedule creation, verify weekly agenda display, test push notifications, and validate recurring pattern logic
