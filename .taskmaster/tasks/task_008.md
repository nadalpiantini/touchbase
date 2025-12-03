# Task ID: 8

**Title:** Gamification System: XP, Levels, Badges & Challenges

**Status:** pending

**Dependencies:** 5, 7

**Priority:** medium

**Description:** Implement XP calculation system, multi-level progression (global + per-skill), badge awards, streak system, and class challenges with leaderboards

**Details:**

1. Design XP calculation rules (per action type: lesson completion, quiz score, attendance)
2. Implement level system (global level + per-skill levels)
3. Create badge system (event-triggered + teacher-awarded)
4. Build streak system integration with attendance
5. Create challenge system (class/global challenges)
6. Implement optional leaderboards (class/global)
7. Build skill tree visualization

API Routes: /api/xp/award, /api/badges/list, /api/badges/user, /api/challenges/create, /api/leaderboards/class
Cloud Functions: XP calculation triggers, badge award automation

**Test Strategy:**

Test XP calculations, verify level progression, test badge awards, validate challenge system, and check leaderboard accuracy
