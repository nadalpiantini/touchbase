# TouchBase Academy Test Data - Quick Reference Card

**File:** `modules-classes.json` | **Size:** 40KB | **Generated:** 2024-12-20

---

## Import Statement
```typescript
import testData from '@/public/test-data/modules-classes.json';
const { modules, classes, metadata } = testData;
```

---

## 10 Educational Modules

### Beginner Level (5)
| ID | Title | Minutes | XP |
|---|---|---|---|
| mod_001 | Leadership Fundamentals | 180 | 250 |
| mod_002 | Teamwork & Collaboration | 150 | 230 |
| mod_005 | Time Management & Productivity | 120 | 200 |
| mod_009 | Diversity & Inclusion | 140 | 220 |

### Intermediate Level (4)
| ID | Title | Minutes | XP |
|---|---|---|---|
| mod_003 | Communication Excellence | 210 | 280 |
| mod_004 | Emotional Intelligence | 180 | 260 |
| mod_007 | Resilience & Growth Mindset | 160 | 270 |
| mod_010 | Career Development & Personal Branding | 190 | 275 |

### Advanced Level (2)
| ID | Title | Minutes | XP |
|---|---|---|---|
| mod_006 | Problem Solving & Critical Thinking | 240 | 320 |
| mod_008 | Ethical Decision-Making | 200 | 290 |

---

## 12 Classes with Schedules

| Class | Teacher | Level | Size | Module | Progress | Schedule |
|---|---|---|---|---|---|---|
| Leadership 101 - M | 001 | 9-12 | 18 | mod_001 | 65% | MWF 9-10:30 |
| Leadership 101 - A | 001 | 9-12 | 16 | mod_001 | 52% | MWF 2-3:30 |
| Teamwork Essentials | 002 | 10-12 | 14 | mod_002 | 78% | TR 10-11:30 |
| Communication Skills | 002 | 11-12 | 12 | mod_003 | 42% | MW 1-2:45 |
| Emotional Intelligence | 003 | 9-11 | 15 | mod_004 | 71% | TR 2:30-4 |
| Time & Productivity | 003 | 9-10 | 20 | mod_005 | 88% | MWF 11-12 |
| Problem Solving | 004 | 11-12 | 10 | mod_006 | 34% | TR 9:30-11:30 |
| Building Resilience | 004 | 10-12 | 13 | mod_007 | 55% | MWF 3-4 |
| Ethics & Leadership | 005 | 11-12 | 11 | mod_008 | 29% | TR 12-1:30 |
| Diversity & Inclusion | 005 | 9-11 | 17 | mod_009 | 81% | MWF 10-11 |
| Career Pathways | 006 | 11-12 | 19 | mod_010 | 45% | TR 1-2:30 |
| Leadership Capstone | 006 | 12 | 8 | mod_001 | 92% | MW 2:30-4 |

---

## Key Numbers at a Glance

```
MODULES
  Total: 10
  Difficulty: 5 Beginner | 4 Intermediate | 2 Advanced
  Duration: 120-240 min (avg 172.5 min)
  XP: 200-320 per badge

CLASSES
  Total: 12
  Teachers: 6 (2 classes each)
  Students: 173 unique
  Class Size: 8-20 (avg 14)
  Progress: 29%-92%

SCHEDULE
  Days: MWF, TR (typical pattern)
  Duration: 1.5-2 hour classes
  Classes/Week: 45.5 total hours
  Timezone: America/New_York
```

---

## Common Queries

### Get All Beginner Modules
```typescript
const beginners = modules.filter(m => m.difficulty === 'beginner');
// Returns: 5 modules
```

### Get Classes with High Progress (≥75%)
```typescript
const advanced = classes.filter(c => c.progress_percentage >= 75);
// Returns: class_003 (78%), class_006 (88%), class_010 (81%), class_012 (92%)
```

### Count Total Students
```typescript
const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0);
// Returns: 173
```

### Get Classes for Specific Teacher
```typescript
const teacherClasses = classes.filter(c => c.teacher_id === 'teacher_001');
// Returns: Leadership 101 - Morning & Afternoon (34 students total)
```

### Find Highest Intensity Module
```typescript
const hardest = modules.reduce((a, b) =>
  a.duration_minutes > b.duration_minutes ? a : b
);
// Returns: mod_006 (Problem Solving, 240 min)
```

### Get Module With Highest XP Reward
```typescript
const bestReward = modules.reduce((a, b) =>
  a.badge_reward.xp_reward > b.badge_reward.xp_reward ? a : b
);
// Returns: mod_006 (Strategic Thinker, 320 XP)
```

### Get Largest Class
```typescript
const largest = classes.reduce((a, b) =>
  a.student_count > b.student_count ? a : b
);
// Returns: Time & Productivity Mastery (20 students)
```

### Find Classes by Day of Week
```typescript
const mondayClasses = classes.filter(c =>
  c.schedule.entries.some(e => e.dayOfWeek === 1)
);
// Returns: 7 classes
```

### Get Class Schedule Details
```typescript
const classSchedule = classes
  .find(c => c.code === 'LEAD101-M')
  .schedule.entries
  .map(e => ({
    day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][e.dayOfWeek],
    start: e.startTime,
    end: e.endTime
  }));
// Returns: [{day: 'Mon', start: '09:00', end: '10:30'}, ...]
```

---

## Data Structure Snapshot

### Module Object
```typescript
{
  id: string;                // "mod_001"
  title: string;             // "Leadership Fundamentals"
  description: string;
  skills: string[];          // 3-4 skills
  difficulty: "beginner" | "intermediate" | "advanced";
  duration_minutes: number;  // 120-240
  cover_image: string;       // picsum.photos URL
  learning_objectives: string[]; // 4 objectives
  badge_reward: {
    name: string;
    description: string;
    xp_reward: number;       // 200-320
  };
  is_active: boolean;        // true
  created_at: string;        // ISO 8601
}
```

### Class Object
```typescript
{
  id: string;                // "class_001"
  org_id: string;            // "org_001"
  teacher_id: string;        // "teacher_001"
  name: string;
  code: string;              // "LEAD101-M"
  grade_level: string;       // "9-12"
  description: string;
  schedule: {
    timezone: string;        // "America/New_York"
    entries: Array<{
      dayOfWeek: number;     // 0-6 (Sun-Sat)
      startTime: string;     // "HH:MM"
      endTime: string;       // "HH:MM"
    }>;
  };
  current_module: string;    // "mod_001"
  progress_percentage: number; // 0-100
  student_count: number;     // 8-20
  students: string[];        // ["student_001", ...]
  created_at: string;        // ISO 8601
  updated_at: string;        // ISO 8601
}
```

---

## Progress Ranges

### By Performance Level
| Level | Range | # Classes |
|-------|-------|-----------|
| Just Starting | 29-42% | 3 |
| In Progress | 45-78% | 6 |
| Nearly Complete | 81-88% | 2 |
| Complete | 92% | 1 |

### By Module
- **mod_001** (Leadership): 52-92% progress
- **mod_002** (Teamwork): 78% progress
- **mod_003** (Communication): 42% progress
- **mod_004** (Emotional): 71% progress
- **mod_005** (Time): 88% progress
- **mod_006** (Problem): 34% progress
- **mod_007** (Resilience): 55% progress
- **mod_008** (Ethics): 29% progress
- **mod_009** (Diversity): 81% progress
- **mod_010** (Career): 45% progress

---

## Day of Week Coverage

| Day | Count | Classes |
|-----|-------|---------|
| Monday | 7 | Most classes |
| Tuesday | 6 | TR pattern |
| Wednesday | 7 | MWF pattern |
| Thursday | 6 | TR pattern |
| Friday | 7 | MWF pattern |
| **Total** | **45.5 hrs** | **per week** |

---

## ID Reference Guide

### Format Patterns
```
Modules:    mod_001 to mod_010
Classes:    class_001 to class_012
Students:   student_001 to student_173
Teachers:   teacher_001 to teacher_006
Organization: org_001
```

### Creating IDs
```typescript
// Module ID
const moduleId = `mod_${String(number).padStart(3, '0')}`;

// Class ID
const classId = `class_${String(number).padStart(3, '0')}`;

// Student ID
const studentId = `student_${String(number).padStart(3, '0')}`;

// Teacher ID
const teacherId = `teacher_${String(number).padStart(3, '0')}`;
```

---

## Tips & Tricks

### Filter Modules by Skills
```typescript
const modules = testData.modules.filter(m =>
  m.skills.includes('communication')
);
// Returns: mod_002, mod_003, mod_010
```

### Get Classes with Specific Grade Level
```typescript
const classes = testData.classes.filter(c =>
  c.grade_level.includes('11') || c.grade_level.includes('12')
);
```

### Sort Classes by Progress
```typescript
const sorted = classes.sort((a, b) =>
  b.progress_percentage - a.progress_percentage
);
// First: class_012 (92%)
// Last: class_009 (29%)
```

### Group Classes by Teacher
```typescript
const grouped = classes.reduce((acc, c) => {
  acc[c.teacher_id] ??= [];
  acc[c.teacher_id].push(c);
  return acc;
}, {});
```

### Calculate Class Load
```typescript
const teacherLoad = {};
classes.forEach(c => {
  teacherLoad[c.teacher_id] =
    (teacherLoad[c.teacher_id] || 0) + c.student_count;
});
// teacher_001: 34, teacher_002: 26, teacher_003: 35, ...
```

---

## Timezone Info
```
All schedules use: America/New_York (EST/EDT)
Daylight Saving Time: Varies per US rules
UTC Offset: EST = UTC-5, EDT = UTC-4
```

---

## Version & Updates
- **Current Version:** 1.0.0
- **Generated:** 2024-12-20
- **Last Updated:** 2024-12-20
- **Format:** JSON (UTF-8)
- **File Size:** ~40KB

---

## Quick Links
- Full Documentation: `README.md`
- Detailed Summary: `MODULES_CLASSES_SUMMARY.md`
- Generation Report: `GENERATION_REPORT.md`
- Data File: `modules-classes.json`

---

**Need help?** Check the full documentation files or generate fresh test data as needed.
