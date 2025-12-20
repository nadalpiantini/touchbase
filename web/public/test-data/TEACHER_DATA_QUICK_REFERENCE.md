# Teacher Test Data - Quick Reference

## File Location
```
/web/public/test-data/teachers.json
```

## Quick Stats
- **8 Teachers** | **902 Students** | **37 Classes**
- **9.75 years avg experience** | **4.78/5.0 avg rating**

## All Teachers at a Glance

### 1. Carlos Mendoza
**Life Skills** | 12y exp | 128 students | ⭐ 4.8
- Specializations: Life Skills, Leadership Development, Communication
- 5 classes: Leadership Fundamentals, Life Skills 101, Advanced Communication, Team Dynamics, Conflict Resolution

### 2. María García López
**Character Development** | 8y exp | 95 students | ⭐ 4.7
- Specializations: Character Development, Ethics, Emotional Intelligence
- 4 classes: Character Development 101, EI Workshop, Ethics & Decision Making, Self-Awareness

### 3. Juan Rodríguez Sánchez ⭐ Most Experienced
**Professional Development** | 15y exp | 156 students | ⭐ 4.6
- Specializations: Professional Development, Career Planning, Entrepreneurship
- 6 classes: Career Planning, Entrepreneurship 101, Resume Skills, Business Planning, Networking, Finance

### 4. Sofia Reyes Moreno ⭐ Highest Rated
**Critical Thinking & Tech** | 7y exp | 114 students | ⭐ 4.9
- Specializations: Critical Thinking, Problem Solving, Digital Literacy
- 5 classes: Critical Thinking 101, Digital Literacy, Problem Solving, Data Analysis, Online Safety

### 5. Diego Escobar Vargas
**Health & Wellness** | 10y exp | 87 students | ⭐ 4.8
- Specializations: Health & Wellness, Stress Management, Mindfulness
- 4 classes: Health & Wellness 101, Stress Management, Mindfulness, Nutrition & Lifestyle

### 6. Alejandra Castillo Domínguez ⭐ Least Experienced
**Social Skills** | 6y exp | 106 students | ⭐ 4.7
- Specializations: Social Skills, Teamwork, Interpersonal Relations
- 5 classes: Social Skills Development, Teamwork, Relationship Building, Empathy, Peer Mediation

### 7. Roberto Hernández Luna ⭐ Highest Rated (Tied)
**Communication** | 9y exp | 98 students | ⭐ 4.9
- Specializations: Public Speaking, Presentation Skills, Confidence Building
- 4 classes: Public Speaking Fundamentals, Advanced Presentation, Confidence & Stage, Storytelling

### 8. Valentina Ortiz Silva
**Personal Development** | 11y exp | 118 students | ⭐ 4.8
- Specializations: Goal Setting, Motivation & Performance, Personal Development
- 5 classes: Goal Setting Mastery, Personal Development, Motivation, Habit Formation, Success Principles

## Data Fields

Each teacher record contains:
```
id                  - Unique identifier (teacher_001-teacher_008)
firstName           - First name
lastName            - Last name
fullName            - Full name
email               - Email address
profileAvatar       - Avatar URL (pravatar.cc)
specializations     - Array of 2-3 specialization areas
yearsOfExperience   - Years in education (6-15)
certifications      - Array of qualifications
certificationLevel  - "Advanced" or "Professional"
joiningDate         - ISO date (2018-2021)
classesCount        - Number of classes (4-6)
classesTaught       - Array of class objects with:
                      - classId
                      - className
                      - level (Beginner/Intermediate/Advanced)
                      - schedule
totalStudents       - Total student count
averageRating       - Rating out of 5.0 (4.6-4.9)
bio                 - Professional biography
department          - Primary department
status              - "active"
```

## Usage Examples

### Import Data
```typescript
import teachers from '@/public/test-data/teachers.json';
const allTeachers = teachers.teachers;
```

### Filter Helpers
```typescript
// By department
const dept = (name) => teachers.teachers.filter(t => t.department === name);

// By experience
const experienced = (min) => teachers.teachers.filter(t => t.yearsOfExperience >= min);

// By rating
const topRated = (min) => teachers.teachers.filter(t => t.averageRating >= min);

// By specialization
const hasSpecialization = (spec) => teachers.teachers.filter(t =>
  t.specializations.includes(spec)
);
```

### Sort Helpers
```typescript
// By experience (descending)
const byExperience = [...teachers.teachers].sort((a, b) =>
  b.yearsOfExperience - a.yearsOfExperience
);

// By rating (descending)
const byRating = [...teachers.teachers].sort((a, b) =>
  b.averageRating - a.averageRating
);

// By student count (descending)
const byStudentLoad = [...teachers.teachers].sort((a, b) =>
  b.totalStudents - a.totalStudents
);

// By joining date (ascending - newest first)
const byJoiningDate = [...teachers.teachers].sort((a, b) =>
  new Date(b.joiningDate) - new Date(a.joiningDate)
);
```

### Get Statistics
```typescript
const stats = {
  total: teachers.metadata.totalTeachers,
  students: teachers.metadata.totalStudents,
  avgExp: teachers.metadata.averageExperience,
  avgRating: (teachers.teachers.reduce((s, t) => s + t.averageRating, 0) / 8),
  maxStudents: Math.max(...teachers.teachers.map(t => t.totalStudents)),
  minStudents: Math.min(...teachers.teachers.map(t => t.totalStudents)),
};
```

## Department Index

| Department | Teacher | Experience |
|-----------|---------|------------|
| Life Skills | Carlos Mendoza | 12y |
| Character Development | María García López | 8y |
| Professional Development | Juan Rodríguez Sánchez | 15y |
| Critical Thinking & Tech | Sofia Reyes Moreno | 7y |
| Health & Wellness | Diego Escobar Vargas | 10y |
| Social Skills | Alejandra Castillo Domínguez | 6y |
| Communication | Roberto Hernández Luna | 9y |
| Personal Development | Valentina Ortiz Silva | 11y |

## Specialization Index

- **Life Skills**: Carlos Mendoza
- **Leadership Development**: Carlos Mendoza
- **Character Development**: María García López
- **Ethics**: María García López
- **Emotional Intelligence**: María García López
- **Professional Development**: Juan Rodríguez Sánchez
- **Career Planning**: Juan Rodríguez Sánchez
- **Entrepreneurship**: Juan Rodríguez Sánchez
- **Critical Thinking**: Sofia Reyes Moreno
- **Problem Solving**: Sofia Reyes Moreno
- **Digital Literacy**: Sofia Reyes Moreno
- **Health & Wellness**: Diego Escobar Vargas
- **Stress Management**: Diego Escobar Vargas
- **Mindfulness**: Diego Escobar Vargas
- **Social Skills**: Alejandra Castillo Domínguez
- **Teamwork**: Alejandra Castillo Domínguez
- **Interpersonal Relations**: Alejandra Castillo Domínguez
- **Public Speaking**: Roberto Hernández Luna
- **Presentation Skills**: Roberto Hernández Luna
- **Confidence Building**: Roberto Hernández Luna
- **Goal Setting**: Valentina Ortiz Silva
- **Motivation & Performance**: Valentina Ortiz Silva
- **Personal Development**: Valentina Ortiz Silva

## Class Schedule Index

### Morning Classes (9:00 AM - 11:00 AM)
- Carlos Mendoza: Leadership Fundamentals (9:00 AM MWF)
- María García López: Character Development (11:00 AM MWF)
- Sofia Reyes Moreno: Critical Thinking (9:30 AM MWF)
- Diego Escobar Vargas: Health & Wellness (10:00 AM MWF)
- Valentina Ortiz Silva: Personal Development (11:00 AM MWF)

### Afternoon Classes (1:00 PM - 3:30 PM)
- Carlos Mendoza: Advanced Communication (2:00 PM MW)
- María García López: EI Workshop (1:00 PM TR)
- Sofia Reyes Moreno: Problem Solving (1:30 PM MW)
- Diego Escobar Vargas: Stress Management (2:00 PM TR)
- Alejandra Castillo Domínguez: Social Skills (2:00 PM MWF)
- Roberto Hernández Luna: Public Speaking (1:00 PM MWF)
- Valentina Ortiz Silva: Goal Setting (2:00 PM W)

## Certification Levels

### Advanced Certification (4 teachers)
- Carlos Mendoza (Master in Education)
- Juan Rodríguez Sánchez (MBA)
- Roberto Hernández Luna (Master in Communication)
- Valentina Ortiz Silva (Master in Organizational Psychology)

### Professional Certification (4 teachers)
- María García López (Bachelor in Psychology)
- Sofia Reyes Moreno (Master in Information Technology)
- Diego Escobar Vargas (Bachelor in Sports Science)
- Alejandra Castillo Domínguez (Degree in Social Work)

## Quick Testing Scenarios

### Scenario 1: Dashboard Overview
Display all 8 teachers with avatars, names, departments, and ratings.

### Scenario 2: Department Filter
Filter teachers by department for management views.

### Scenario 3: Experience Ranking
Sort teachers by years of experience with experienced-based badges.

### Scenario 4: Student Load Visualization
Show student distribution across teacher workloads.

### Scenario 5: Class Schedule
Display teacher class schedules with day/time information.

### Scenario 6: Specialization Search
Find teachers by their specializations.

### Scenario 7: Rating Display
Show teacher ratings with visual indicators.

### Scenario 8: Certification Display
Show certification level badges and credential details.

---

**Version**: 1.0.0
**Generated**: 2024-12-20
**For**: TouchBase Academy Dashboard Development
