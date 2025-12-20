# Test Data: TouchBase Academy

## Overview

Comprehensive test data collection for TouchBase Academy including student and teacher profiles, designed to test UI components and features with diverse, authentic scenarios.

## Available Files

| File | Records | Size | Purpose |
|------|---------|------|---------|
| `students.json` | 15 | 6KB | Student profiles and enrollments |
| `teachers.json` | 8 | 15KB | Teacher profiles and classes |
| `modules-classes.json` | 22 | 40KB | Educational modules (10) and classes (12) with comprehensive metadata |

## Test Data: Students

**File**: `students.json`
**Format**: JSON
**Total Records**: 15 students
**Size**: ~6KB

## Data Structure

Each student profile includes:

```json
{
  "id": "std_001",
  "fullName": "Carlos Méndez Rodríguez",
  "email": "carlos.mendez@touchbase.academy",
  "avatar": "https://i.pravatar.cc/150?img=1",
  "gradeLevel": 9,
  "sportInterests": ["baseball", "pitcher"],
  "learningStyle": "visual",
  "moduleProgress": 75,
  "badgeCount": 5,
  "joiningDate": "2023-09-15"
}
```

## Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (std_001 - std_015) |
| `fullName` | string | Full name with Spanish/Latin American heritage |
| `email` | string | Email address with @touchbase.academy domain |
| `avatar` | string | Placeholder avatar URL (pravatar.cc service, img 1-15) |
| `gradeLevel` | number | Grade level (7-12, representing 7th-12th grade) |
| `sportInterests` | array | Baseball positions (pitcher, catcher, infield, outfield, etc.) |
| `learningStyle` | string | VARK learning style (visual, auditory, reading/writing, kinesthetic) |
| `moduleProgress` | number | Module completion percentage (0-100) |
| `badgeCount` | number | Number of achievement badges earned (2-18) |
| `joiningDate` | string | Date joined (ISO 8601 format) |

## Diversity Analysis

### Grade Distribution
- **Grade 7**: 1 student (Lucia Pacheco Ruiz)
- **Grade 8**: 3 students (Diego Ramírez, Roberto Sánchez, Emilio Campos)
- **Grade 9**: 4 students (Carlos Méndez, Miguel Ángel Torres, Valentina Castro, Andrés Herrera)
- **Grade 10**: 3 students (María García, Javier Morales, Isabella Rojas)
- **Grade 11**: 2 students (Alejandra Flores, Fernando Vargas)
- **Grade 12**: 2 students (Catalina Reyes, Sophia Domínguez)

### Learning Styles
- **Visual**: 4 students (Carlos, Alejandra, Javier, Emilio)
- **Kinesthetic**: 3 students (María, Lucia, Valentina, Sophia)
- **Auditory**: 3 students (Diego, Catalina, Isabella)
- **Reading/Writing**: 3 students (Miguel Ángel, Roberto, Andrés)

### Baseball Positions Represented
- **Pitcher**: 5 students (Carlos, Miguel Ángel, Catalina, Fernando, Sophia)
- **Infield**: 4 students (María, Javier, Miguel Ángel, Isabella, Emilio)
- **Outfield**: 4 students (Alejandra, Lucia, Roberto, Andrés)
- **Catcher**: 2 students (Diego, Valentina)
- **Specialized Positions**: Shortshop, Relief, Starter, Second Base, Third Base, Center Field

### Module Progress Distribution
- **Highest**: Sophia Domínguez (98%)
- **Lowest**: Lucia Pacheco Ruiz (45%)
- **Average**: ~72%
- **Range**: 45% to 98%

### Badge Achievements
- **Most Badges**: Sophia Domínguez (18), Catalina Reyes (15), Alejandra Flores (12)
- **Fewest Badges**: Lucia Pacheco, Emilio Campos (2 each)
- **Average**: ~6.8 badges per student

### Cultural & Geographic Diversity
- ✅ All names represent Spanish/Latin American heritage
- ✅ Mix of first names: Carlos, María, Diego, Alejandra, Miguel Ángel, Lucia, Javier, Catalina, Roberto, Valentina, Fernando, Isabella, Andrés, Sophia, Emilio
- ✅ Diverse surname origins: Méndez, García, Ramírez, Flores, Torres, Pacheco, Morales, Reyes, Sánchez, Castro, Vargas, Rojas, Herrera, Domínguez, Campos
- ✅ Gender-balanced representation

## Use Cases for Testing

### Avatar Component
- Test with 15 different placeholder avatars from pravatar.cc
- Verify avatar display in student lists
- Test avatar colors and sizing in different contexts

### Toast Notifications
- Display student joining messages
- Show progress update alerts
- Badge achievement notifications
- Module completion confirmations

### DropdownMenu Component
- Student action menus (edit, view profile, assign modules)
- Learning style filters
- Grade level grouping
- Sport interest categorization

### Data Visualization
- Grade distribution charts
- Progress comparison across student body
- Badge achievement metrics
- Learning style breakdowns
- Position specialty analysis

## Joining Date Distribution

Students joined between:
- **Earliest**: August 10, 2023 (Catalina Reyes)
- **Latest**: November 1, 2023 (Emilio Campos)
- **Most Active Months**: September (6 students), October (8 students)

## Module Progress Scenarios

| Category | Count | Students |
|----------|-------|----------|
| **Advanced** (85-100%) | 4 | Alejandra, Catalina, Fernando, Sophia |
| **Intermediate** (60-84%) | 6 | Carlos, María, Javier, Valentina, Isabella, Andrés |
| **Developing** (45-59%) | 5 | Diego, Miguel Ángel, Lucia, Roberto, Emilio |

## Integration Examples

### Fetch All Students
```typescript
import students from '@/public/test-data/students.json';
const allStudents = students.students;
```

### Filter by Grade Level
```typescript
const gradeTenStudents = students.students.filter(s => s.gradeLevel === 10);
```

### Sort by Progress
```typescript
const topPerformers = students.students
  .sort((a, b) => b.moduleProgress - a.moduleProgress)
  .slice(0, 5);
```

### Group by Learning Style
```typescript
const groupedByStyle = students.students.reduce((acc, s) => {
  acc[s.learningStyle] ??= [];
  acc[s.learningStyle].push(s);
  return acc;
}, {});
```

## Notes

- **Avatar URLs**: Using placeholder service https://i.pravatar.cc/ - images are generated based on the `img` parameter (1-70 available)
- **Email Domain**: All emails use @touchbase.academy test domain
- **Names**: Carefully selected to represent authentic Spanish/Latin American heritage
- **Realism**: Progress, badges, and joining dates are realistic and varied to test sorting/filtering UI
- **Test Coverage**: Designed to exercise Avatar, Toast, and DropdownMenu components with different data scenarios

## Test Data: Teachers

**File**: `teachers.json`
**Format**: JSON
**Total Records**: 8 teachers
**Size**: ~15KB
**Metadata**: 902 total students across 37 classes

### Teacher Data Structure

Each teacher profile includes:

```json
{
  "id": "teacher_001",
  "firstName": "Carlos",
  "lastName": "Mendoza",
  "fullName": "Carlos Mendoza",
  "email": "carlos.mendoza@touchbase.edu",
  "profileAvatar": "https://i.pravatar.cc/150?img=12",
  "specializations": ["Life Skills", "Leadership Development", "Communication"],
  "yearsOfExperience": 12,
  "certifications": ["Master in Education", "Certified Life Coach"],
  "certificationLevel": "Advanced",
  "joiningDate": "2019-08-15",
  "classesCount": 5,
  "classesTaught": [
    {
      "classId": "cls_101",
      "className": "Leadership Fundamentals A",
      "level": "Intermediate",
      "schedule": "Monday, Wednesday, Friday 9:00 AM"
    }
  ],
  "totalStudents": 128,
  "averageRating": 4.8,
  "bio": "Professional biography...",
  "department": "Life Skills",
  "status": "active"
}
```

### Teacher Profiles

| Name | Department | Experience | Students | Rating | Classes |
|------|-----------|------------|----------|--------|---------|
| Carlos Mendoza | Life Skills | 12 years | 128 | 4.8 | 5 |
| María García López | Character Development | 8 years | 95 | 4.7 | 4 |
| Juan Rodríguez Sánchez | Professional Development | 15 years | 156 | 4.6 | 6 |
| Sofia Reyes Moreno | Critical Thinking & Tech | 7 years | 114 | 4.9 | 5 |
| Diego Escobar Vargas | Health & Wellness | 10 years | 87 | 4.8 | 4 |
| Alejandra Castillo Domínguez | Social Skills | 6 years | 106 | 4.7 | 5 |
| Roberto Hernández Luna | Communication | 9 years | 98 | 4.9 | 4 |
| Valentina Ortiz Silva | Personal Development | 11 years | 118 | 4.8 | 5 |

### Teacher Data Diversity

- **Gender Distribution**: 4 female, 4 male
- **Experience Range**: 6-15 years
- **Certifications**: Mix of Bachelor's, Master's degrees, coaching certifications
- **Specializations**: 8 unique departments covering life skills education
- **Class Load**: 4-6 classes per teacher
- **Student Load**: 87-156 students per teacher
- **Average Rating**: 4.78/5.0 (realistic variance 4.6-4.9)
- **Diverse Names**: Spanish/Latin American heritage (Mendoza, García López, Rodríguez, Reyes, Escobar, Castillo, Hernández, Ortiz)

### Teacher Dataset Statistics

| Metric | Value |
|--------|-------|
| **Total Teachers** | 8 |
| **Total Students** | 902 |
| **Total Classes** | 37 |
| **Average Years Experience** | 9.75 |
| **Average Students Per Teacher** | 112.75 |
| **Average Classes Per Teacher** | 4.625 |
| **Average Rating** | 4.78/5.0 |

### Teacher Use Cases

- Teacher dashboard and profile pages
- Class roster and schedule displays
- Teacher selection/filtering by department
- Experience-based sorting
- Student load analytics
- Rating and review displays
- Certification level indicators
- Department management views

### Teacher Integration Examples

```typescript
// Fetch all teachers
import teachers from '@/public/test-data/teachers.json';
const allTeachers = teachers.teachers;

// Filter by department
const lifeSkilsTeachers = teachers.teachers.filter(
  t => t.department === 'Life Skills'
);

// Sort by experience
const experienced = teachers.teachers.sort(
  (a, b) => b.yearsOfExperience - a.yearsOfExperience
);

// Find by specialization
const leadersTeachers = teachers.teachers.filter(
  t => t.specializations.includes('Leadership Development')
);

// Get metadata
const { totalTeachers, totalStudents, averageExperience } = teachers.metadata;
```

## Test Data: Modules and Classes

**File**: `modules-classes.json`
**Format**: JSON
**Total Records**: 22 (10 modules + 12 classes)
**Size**: ~40KB
**Purpose**: Dashboard testing, class management, module enrollment flows, and educational content testing

### Educational Modules (10 total)

Comprehensive life skills modules with progressive difficulty:

| # | Title | Difficulty | Duration | Badge Reward | Skills |
|---|-------|-----------|----------|--------------|--------|
| 1 | Leadership Fundamentals | Beginner | 180 min | Emerging Leader (250 XP) | leadership, decision_making, motivation, strategic_thinking |
| 2 | Teamwork & Collaboration | Beginner | 150 min | Team Player (230 XP) | teamwork, communication, collaboration, conflict_resolution |
| 3 | Communication Excellence | Intermediate | 210 min | Voice of Leadership (280 XP) | communication, active_listening, public_speaking, persuasion |
| 4 | Emotional Intelligence | Intermediate | 180 min | Emotionally Intelligent (260 XP) | emotional_intelligence, self_awareness, empathy, relationship_management |
| 5 | Time Management & Productivity | Beginner | 120 min | Time Master (200 XP) | time_management, productivity, prioritization, goal_setting |
| 6 | Problem Solving & Critical Thinking | Advanced | 240 min | Strategic Thinker (320 XP) | problem_solving, critical_thinking, analytical_thinking, creativity |
| 7 | Resilience & Growth Mindset | Intermediate | 160 min | Resilient Spirit (270 XP) | resilience, growth_mindset, adaptability, perseverance |
| 8 | Ethical Decision-Making | Advanced | 200 min | Ethical Leader (290 XP) | ethics, moral_reasoning, integrity, values_alignment |
| 9 | Diversity & Inclusion | Beginner | 140 min | Inclusive Ally (220 XP) | diversity, inclusion, cultural_awareness, empathy |
| 10 | Career Development & Personal Branding | Intermediate | 190 min | Career Champion (275 XP) | career_planning, networking, personal_branding, professional_development |

### Module Data Features

- ✅ 10 unique life-skills modules
- ✅ Difficulty progression: 5 beginner, 4 intermediate, 2 advanced
- ✅ 4 learning objectives per module
- ✅ Badge rewards (200-320 XP range)
- ✅ Skill tags for categorization (3-4 per module)
- ✅ Duration range: 120-240 minutes (average: 172.5 min)
- ✅ Cover images (picsum.photos placeholders, sequential 1-50)
- ✅ Realistic educational descriptions
- ✅ Created timestamps (Sep 1-5, 2024)

### Classes (12 total)

Realistic classroom configurations with diverse configurations:

| # | Class Name | Teacher | Level | Students | Current Module | Progress | Schedule |
|---|-----------|---------|-------|----------|-----------------|----------|----------|
| 1 | Leadership 101 - Morning | teacher_001 | 9-12 | 18 | Leadership Fundamentals | 65% | MWF 9:00-10:30 AM |
| 2 | Leadership 101 - Afternoon | teacher_001 | 9-12 | 16 | Leadership Fundamentals | 52% | MWF 2:00-3:30 PM |
| 3 | Teamwork Essentials | teacher_002 | 10-12 | 14 | Teamwork & Collaboration | 78% | TR 10:00-11:30 AM |
| 4 | Communication Skills Workshop | teacher_002 | 11-12 | 12 | Communication Excellence | 42% | MW 1:00-2:45 PM |
| 5 | Emotional Intelligence Development | teacher_003 | 9-11 | 15 | Emotional Intelligence | 71% | TR 2:30-4:00 PM |
| 6 | Time & Productivity Mastery | teacher_003 | 9-10 | 20 | Time Management & Productivity | 88% | MWF 11:00 AM-12:00 PM |
| 7 | Problem Solving & Critical Thinking | teacher_004 | 11-12 | 10 | Problem Solving & Critical Thinking | 34% | TR 9:30-11:30 AM |
| 8 | Building Resilience | teacher_004 | 10-12 | 13 | Resilience & Growth Mindset | 55% | MWF 3:00-4:00 PM |
| 9 | Ethics & Responsible Leadership | teacher_005 | 11-12 | 11 | Ethical Decision-Making | 29% | TR 12:00-1:30 PM |
| 10 | Diversity & Inclusion Foundations | teacher_005 | 9-11 | 17 | Diversity & Inclusion | 81% | MWF 10:00-11:00 AM |
| 11 | Career Pathways & Personal Branding | teacher_006 | 11-12 | 19 | Career Development & Personal Branding | 45% | TR 1:00-2:30 PM |
| 12 | Advanced Leadership Capstone | teacher_006 | 12 | 8 | Leadership Fundamentals | 92% | MW 2:30-4:00 PM |

### Class Data Features

- ✅ 12 realistic classroom configurations
- ✅ Distributed across 6 teachers
- ✅ Grade levels: 9-12 (some upper-level specific)
- ✅ Student enrollments: 8-20 per class (173 total unique students)
- ✅ Schedule data: recurring weekly entries (day/time/timezone)
- ✅ Progress percentages: 29%-92% (realistic variation)
- ✅ Unique class codes (LEAD101-M, TEAM201, etc.)
- ✅ Descriptive names and descriptions
- ✅ Created timestamps: Aug 15 - Sep 20, 2024
- ✅ Updated timestamps: Dec 18, 2024

### Modules-Classes Data Statistics

| Metric | Value |
|--------|-------|
| **Total Modules** | 10 |
| **Total Classes** | 12 |
| **Total Unique Students** | 173 |
| **Module Duration Range** | 120-240 minutes |
| **Average Module Duration** | 172.5 minutes |
| **XP Reward Range** | 200-320 per module |
| **Difficulty Distribution** | 5 beginner, 4 intermediate, 2 advanced |
| **Average Class Size** | 14.08 students |
| **Class Size Range** | 8-20 students |
| **Total Class Hours Per Week** | 45.5 hours |

### Module-Classes Use Cases

- Dashboard progress tracking and visualization
- Class roster and enrollment displays
- Module assignment and completion workflows
- Schedule conflict detection
- Progress percentage comparisons
- Badge achievement and reward system testing
- Student progression through modules
- Multi-class scheduling scenarios
- Teacher workload analytics
- Student load balancing

### Integration Examples

```typescript
// Import test data
import testData from '@/public/test-data/modules-classes.json';

// Access modules
const modules = testData.modules;
const beginnerModules = modules.filter(m => m.difficulty === 'beginner');

// Access classes
const classes = testData.classes;
const studentEnrollments = classes.flatMap(c => c.students);

// Get statistics
const { statistics } = testData.metadata;
console.log(`Average class size: ${statistics.average_class_size}`);

// Filter by progress
const inProgressClasses = classes.filter(c => c.progress_percentage < 75);

// Find module by skills
const communicationModules = modules.filter(m =>
  m.skills.includes('communication')
);

// Get class schedule details
const mondayClasses = classes.flatMap(c =>
  c.schedule.entries
    .filter(e => e.dayOfWeek === 1)
    .map(e => ({ ...c, time: e.startTime }))
);
```

## Generation Date

Generated: 2024-12-20
For: TouchBase Academy UI Component Testing, Dashboard Development, and Educational Content Management
