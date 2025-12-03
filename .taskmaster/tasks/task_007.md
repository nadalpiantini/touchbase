# Task ID: 7

**Title:** Curriculum & Module Engine: Lesson Player & Progress Tracking

**Status:** pending

**Dependencies:** 2, 3

**Priority:** high

**Description:** Build module structure (steps, content, quizzes, scenarios), interactive lesson player, quiz engine, and progress state persistence

**Details:**

1. Design Firestore schema: modules collection (title, description, skill_category, difficulty)
2. Create module steps subcollection (step_type: lesson/quiz/scenario, content, order)
3. Build interactive lesson player component (text, video, audio, images)
4. Implement quiz engine (multiple choice, true/false, scoring)
5. Create scenario/interactive content renderer
6. Build progress tracking system (per-user-per-module state)
7. Implement progress persistence (Firestore: progress collection)

API Routes: /api/modules/list, /api/modules/[id], /api/modules/[id]/steps, /api/progress/update
Collections: touchbase_modules, touchbase_modules/{id}/steps, touchbase_progress

**Test Strategy:**

Test module rendering, quiz functionality, progress tracking, and verify state persistence across sessions
