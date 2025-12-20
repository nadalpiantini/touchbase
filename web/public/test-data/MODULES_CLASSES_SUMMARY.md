# Modules & Classes Test Data Summary

**File Location:** `/web/public/test-data/modules-classes.json`
**File Size:** ~40KB
**Generated:** December 20, 2024
**Total Records:** 22 (10 modules + 12 classes)

## Quick Overview

### Educational Modules (10)
Comprehensive life skills curriculum with progressive difficulty levels:

```
BEGINNER (5 modules)
├─ Leadership Fundamentals (180 min)
├─ Teamwork & Collaboration (150 min)
├─ Time Management & Productivity (120 min)
├─ Diversity & Inclusion (140 min)
└─ [Average: 147.5 min | XP: 200-250]

INTERMEDIATE (4 modules)
├─ Communication Excellence (210 min)
├─ Emotional Intelligence (180 min)
├─ Resilience & Growth Mindset (160 min)
├─ Career Development & Personal Branding (190 min)
└─ [Average: 185 min | XP: 260-280]

ADVANCED (2 modules)
├─ Problem Solving & Critical Thinking (240 min)
└─ Ethical Decision-Making (200 min)
  [Average: 220 min | XP: 290-320]
```

### Classes (12)
Diverse classroom configurations distributed across 6 teachers:

```
TEACHER 1 (Carlos) - 2 classes
├─ Leadership 101 - Morning (18 students, 65% progress)
└─ Leadership 101 - Afternoon (16 students, 52% progress)

TEACHER 2 (María) - 2 classes
├─ Teamwork Essentials (14 students, 78% progress)
└─ Communication Skills Workshop (12 students, 42% progress)

TEACHER 3 (Juan) - 2 classes
├─ Emotional Intelligence Development (15 students, 71% progress)
└─ Time & Productivity Mastery (20 students, 88% progress)

TEACHER 4 (Sofia) - 2 classes
├─ Problem Solving & Critical Thinking (10 students, 34% progress)
└─ Building Resilience (13 students, 55% progress)

TEACHER 5 (Diego) - 2 classes
├─ Ethics & Responsible Leadership (11 students, 29% progress)
└─ Diversity & Inclusion Foundations (17 students, 81% progress)

TEACHER 6 (Alejandra) - 2 classes
├─ Career Pathways & Personal Branding (19 students, 45% progress)
└─ Advanced Leadership Capstone (8 students, 92% progress)
```

## Key Statistics

### Modules
| Metric | Value |
|--------|-------|
| Total Modules | 10 |
| Duration Range | 120-240 minutes |
| Average Duration | 172.5 minutes |
| XP Reward Range | 200-320 |
| Skills per Module | 3-4 |
| Learning Objectives | 4 per module |
| Cover Images | 10 (picsum.photos) |

### Classes
| Metric | Value |
|--------|-------|
| Total Classes | 12 |
| Total Teachers | 6 |
| Total Students | 173 unique |
| Average Class Size | 14.08 |
| Min Class Size | 8 (Capstone) |
| Max Class Size | 20 (Time Mastery) |
| Progress Range | 29-92% |
| Schedules per Class | 2-3 (weekly) |

### Learning Distribution
| Level | Classes | Students | Avg Progress |
|-------|---------|----------|--------------|
| Grades 9-10 | 4 | 68 | 65.5% |
| Grades 10-12 | 5 | 65 | 58.8% |
| Grades 11-12 | 2 | 30 | 37% |
| Grade 12 Only | 1 | 8 | 92% |

### Schedule Coverage
| Day | Classes | Time Slots |
|-----|---------|-----------|
| Monday | 7 | Various AM/PM |
| Tuesday | 6 | Various AM/PM |
| Wednesday | 7 | Various AM/PM |
| Thursday | 6 | Various AM/PM |
| Friday | 7 | AM slots |

**Total Class Hours per Week:** 45.5 hours

## Data Quality Features

### Realism
- Class sizes vary realistically (8-20 students)
- Progress percentages show diverse completion states
- Schedule patterns follow typical school day structure
- Teacher workloads distributed evenly (2 classes each)
- Multiple sections for popular courses (Leadership 101 A/M)

### Coherence
- Modules progress logically (beginner → intermediate → advanced)
- Class difficulty aligns with module content
- Student counts realistic for each subject matter
- Teacher specializations match course assignments
- Schedules avoid obvious conflicts

### Completeness
- All modules have 4 learning objectives
- All classes have complete schedules
- All students properly listed and tracked
- All badges include XP values
- Metadata with aggregated statistics included

## Sample Module Structure

```json
{
  "id": "mod_001",
  "title": "Leadership Fundamentals",
  "description": "Learn core leadership principles...",
  "skills": ["leadership", "decision_making", "motivation", "strategic_thinking"],
  "difficulty": "beginner",
  "duration_minutes": 180,
  "cover_image": "https://picsum.photos/400/300?random=1",
  "learning_objectives": [
    "Understand core leadership principles",
    "Develop decision-making skills",
    "Learn delegation techniques",
    "Practice motivating team members"
  ],
  "badge_reward": {
    "name": "Emerging Leader",
    "description": "Completed Leadership Fundamentals module",
    "xp_reward": 250
  },
  "is_active": true,
  "created_at": "2024-09-01T10:00:00Z"
}
```

## Sample Class Structure

```json
{
  "id": "class_001",
  "org_id": "org_001",
  "teacher_id": "teacher_001",
  "name": "Leadership 101 - Morning Session",
  "code": "LEAD101-M",
  "grade_level": "9-12",
  "description": "Introductory leadership course...",
  "schedule": {
    "timezone": "America/New_York",
    "entries": [
      {
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "10:30"
      },
      {
        "dayOfWeek": 3,
        "startTime": "09:00",
        "endTime": "10:30"
      },
      {
        "dayOfWeek": 5,
        "startTime": "09:00",
        "endTime": "10:30"
      }
    ]
  },
  "current_module": "mod_001",
  "progress_percentage": 65,
  "student_count": 18,
  "students": ["student_001", "student_002", ...],
  "created_at": "2024-08-15T08:00:00Z",
  "updated_at": "2024-12-18T14:30:00Z"
}
```

## Testing Use Cases

### Dashboard Testing
- Class overview cards with progress visualization
- Module completion metrics and trends
- Student enrollment statistics
- Teacher workload display
- Schedule calendar integration

### Data Management
- Class filtering (by teacher, level, progress)
- Module search and categorization
- Schedule conflict detection
- Enrollment modification workflows
- Progress tracking updates

### User Experience
- Loading diverse amounts of data
- Sorting by various fields (progress, class size, module)
- Grouping by category (teacher, level, day)
- Real-time progress updates
- Badge achievement displays

### Performance Testing
- Rendering 173 student records across 12 classes
- Filtering operations on mixed data types
- Schedule calculation and display
- Progress percentage calculations
- Aggregated statistics computation

## Integration Quick Start

```typescript
// Import the entire dataset
import testData from '@/public/test-data/modules-classes.json';

// Extract main collections
const { modules, classes, metadata } = testData;

// Common operations
const module = modules.find(m => m.id === 'mod_001');
const classData = classes.find(c => c.code === 'LEAD101-M');
const beginnerModules = modules.filter(m => m.difficulty === 'beginner');
const advancedClasses = classes.filter(c => c.progress_percentage >= 75);

// Get statistics
console.log(`Total hours: ${metadata.statistics.total_class_hours_per_week}`);
console.log(`Avg class: ${metadata.statistics.average_class_size} students`);
console.log(`Duration range: ${metadata.statistics.modules_average_duration_minutes} min`);
```

## Notes for Developers

- All timestamps use ISO 8601 format (UTC with Z suffix)
- Days of week: 0=Sunday, 1=Monday, ..., 6=Saturday
- IDs follow consistent pattern (mod_XXX, class_XXX, student_XXX, teacher_XXX)
- Timezone standardized to America/New_York for all schedules
- Image URLs use picsum.photos with random parameter for variety
- Progress percentages range widely to test different UI states

## File Statistics

- **Total Lines:** 818
- **JSON Structure Levels:** 3 (root → collection → item)
- **Compression Potential:** ~15KB if minified
- **Unicode Characters:** All English/Spanish compatible
- **Nested Objects:** Classes have nested schedule entries
- **Arrays:** Classes include array of student IDs (not full objects to save space)

---

**Location:** `/web/public/test-data/modules-classes.json`
**Last Updated:** 2024-12-20
**For:** TouchBase Academy Dashboard & Educational Module Testing
