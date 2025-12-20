# TouchBase Academy Teacher Test Data - Summary

**Created**: December 20, 2024
**Location**: `/web/public/test-data/teachers.json`
**Status**: Complete and Ready for Use

## Overview

Generated comprehensive, realistic teacher profile test data for TouchBase Academy with 8 diverse educators covering all major life skills specializations.

## File Details

- **Location**: `/Users/nadalpiantini/Dev/touchbase/web/public/test-data/teachers.json`
- **Relative Path**: `public/test-data/teachers.json`
- **File Size**: 15 KB
- **Format**: JSON (Valid)
- **Record Count**: 8 teachers
- **Total Students**: 902 across 37 classes
- **Average Experience**: 9.75 years

## Teacher Roster

| # | Name | Department | Exp | Students | Rating | Classes |
|---|------|-----------|-----|----------|--------|---------|
| 1 | Carlos Mendoza | Life Skills | 12y | 128 | 4.8 | 5 |
| 2 | María García López | Character Development | 8y | 95 | 4.7 | 4 |
| 3 | Juan Rodríguez Sánchez | Professional Development | 15y | 156 | 4.6 | 6 |
| 4 | Sofia Reyes Moreno | Critical Thinking & Tech | 7y | 114 | 4.9 | 5 |
| 5 | Diego Escobar Vargas | Health & Wellness | 10y | 87 | 4.8 | 4 |
| 6 | Alejandra Castillo Domínguez | Social Skills | 6y | 106 | 4.7 | 5 |
| 7 | Roberto Hernández Luna | Communication | 9y | 98 | 4.9 | 4 |
| 8 | Valentina Ortiz Silva | Personal Development | 11y | 118 | 4.8 | 5 |

## Key Features

### Comprehensive Data

Each teacher profile includes:
- Full name, email, avatar URL
- Professional specializations (2-3 per teacher)
- Years of experience (6-15 year range)
- Multiple relevant certifications
- Certification level (Advanced or Professional)
- Joining date (2018-2021, realistic distribution)
- Detailed class information:
  - Class ID and name
  - Difficulty level (Beginner/Intermediate/Advanced)
  - Schedule (days and times)
- Total student count across all classes
- Average student rating (4.6-4.9, realistic variance)
- Professional biography
- Department assignment
- Current status (active)

### Data Diversity

- **Names**: Authentic Spanish/Latin American heritage
  - First names: Carlos, María, Juan, Sofia, Diego, Alejandra, Roberto, Valentina
  - Surnames: Mendoza, García López, Rodríguez Sánchez, Reyes Moreno, Escobar Vargas, Castillo Domínguez, Hernández Luna, Ortiz Silva

- **Gender**: Perfectly balanced (4 female, 4 male)

- **Experience**: 6-15 year range across cohort
  - Most experienced: Juan Rodríguez (15 years)
  - Least experienced: Alejandra Castillo (6 years)

- **Certifications**: Mix of degrees and specialized training
  - Bachelor's degrees (Education, Psychology, Social Work, Sports Science)
  - Master's degrees (Education, Psychology, Business, Information Technology)
  - Specialized certifications (Life Coach, Character Educator, Career Counselor, Wellness Coach, etc.)

- **Specializations**: 8 unique departments
  - Life Skills
  - Character Development
  - Professional Development
  - Critical Thinking & Tech
  - Health & Wellness
  - Social Skills
  - Communication
  - Personal Development

- **Avatars**: Diverse placeholder images from pravatar.cc
  - Images: 12, 47, 33, 28, 15, 52, 8, 64

- **Ratings**: Natural variance (4.6-4.9/5.0)
  - Highest: Sofia Reyes Moreno, Roberto Hernández Luna (4.9)
  - Lowest: Juan Rodríguez Sánchez (4.6)

### Realistic Distribution

- **Class Load**: 4-6 classes per teacher
  - Most: Juan Rodríguez (6 classes)
  - Least: Multiple teachers (4 classes)

- **Student Load**: 87-156 students per teacher
  - Highest: Juan Rodríguez (156)
  - Lowest: Diego Escobar (87)

- **Scheduling**: Realistic daily schedules
  - Morning classes: 9:00 AM - 11:00 AM
  - Afternoon classes: 1:00 PM - 3:30 PM
  - Mix of single and multi-day classes

- **Joining Dates**: Staggered hiring timeline
  - 2018-2019: 4 teachers (core team)
  - 2019-2020: 2 teachers (expansion)
  - 2021: 2 teachers (recent additions)

## JSON Structure

```json
{
  "teachers": [
    {
      "id": "teacher_001",
      "firstName": "Carlos",
      "lastName": "Mendoza",
      "fullName": "Carlos Mendoza",
      "email": "carlos.mendoza@touchbase.edu",
      "profileAvatar": "https://i.pravatar.cc/150?img=12",
      "specializations": ["Life Skills", "Leadership Development", "Communication"],
      "yearsOfExperience": 12,
      "certifications": ["Master in Education", "Certified Life Coach", "TESOL Certification"],
      "certificationLevel": "Advanced",
      "joiningDate": "2019-08-15",
      "classesCount": 5,
      "classesTaught": [
        {
          "classId": "cls_101",
          "className": "Leadership Fundamentals A",
          "level": "Intermediate",
          "schedule": "Monday, Wednesday, Friday 9:00 AM"
        },
        // ... more classes
      ],
      "totalStudents": 128,
      "averageRating": 4.8,
      "bio": "Experienced educator with a passion for developing young leaders...",
      "department": "Life Skills",
      "status": "active"
    },
    // ... 7 more teachers
  ],
  "metadata": {
    "totalTeachers": 8,
    "totalStudents": 902,
    "averageExperience": 9.75,
    "generatedDate": "2024-12-20",
    "version": "1.0.0"
  }
}
```

## Statistics

| Metric | Value |
|--------|-------|
| Total Teachers | 8 |
| Total Students | 902 |
| Total Classes | 37 |
| Average Experience | 9.75 years |
| Avg Students per Teacher | 112.75 |
| Avg Classes per Teacher | 4.625 |
| Avg Rating | 4.78/5.0 |
| Experience Range | 6-15 years |
| Student Load Range | 87-156 |

## Use Cases

Perfect for testing:

- ✓ Teacher dashboard components
- ✓ Teacher profile displays and cards
- ✓ Class roster and schedule viewers
- ✓ Teacher filtering by department
- ✓ Experience-based sorting
- ✓ Student load visualization
- ✓ Rating displays and comparisons
- ✓ Certification level indicators
- ✓ Department management interfaces
- ✓ Teacher selection dropdowns
- ✓ Performance analytics dashboards
- ✓ Availability and scheduling management

## Implementation Examples

### Fetch All Teachers
```typescript
import teachers from '@/public/test-data/teachers.json';
const allTeachers = teachers.teachers;
```

### Filter by Department
```typescript
const lifeSkilsTeachers = teachers.teachers.filter(
  t => t.department === 'Life Skills'
);
```

### Sort by Experience
```typescript
const experienced = teachers.teachers.sort(
  (a, b) => b.yearsOfExperience - a.yearsOfExperience
);
```

### Find by Specialization
```typescript
const leadersTeachers = teachers.teachers.filter(
  t => t.specializations.includes('Leadership Development')
);
```

### Get Top Rated Teachers
```typescript
const topRated = teachers.teachers.filter(t => t.averageRating >= 4.8);
```

### Access Metadata
```typescript
const { totalTeachers, totalStudents, averageExperience } = teachers.metadata;
```

## Integration with Existing Test Data

The teachers.json file complements existing test data:

- **students.json**: 15 student profiles
- **modules-classes.json**: 37 class definitions with modules
- **teachers.json**: 8 teacher profiles (NEW)
- **README.md**: Updated with teacher documentation

All test data files are in `/web/public/test-data/`

## Quality Assurance

- ✓ Valid JSON format (validated with jq)
- ✓ All required fields present
- ✓ Consistent data types across records
- ✓ Realistic values and ranges
- ✓ No duplicate IDs or emails
- ✓ Proper date formats (ISO 8601)
- ✓ Avatar URLs are all valid
- ✓ Classes properly nested with required fields
- ✓ Metadata accurately reflects aggregated data

## Notes

- All data is fictional and for testing purposes only
- Avatar images from pravatar.cc are placeholder images
- Joining dates are realistic but not based on actual hires
- Student counts and ratings are realistic for a life skills academy
- Classes are distributed across realistic hours
- Each teacher has unique email address and ID
- All names reflect Spanish/Latin American heritage for authenticity
- Certifications and specializations are realistic for life skills education

## Files Created/Modified

1. **Created**: `/web/public/test-data/teachers.json`
   - New comprehensive teacher profile dataset
   - 8 teachers with full data
   - 471 lines of JSON

2. **Modified**: `/web/public/test-data/README.md`
   - Added teacher data documentation
   - Added integration examples
   - Updated metadata table

## Related Documentation

- Main README: `/web/public/test-data/README.md`
- CLAUDE.md: `/web/CLAUDE.md` (project conventions)
- Student Data: `/web/public/test-data/students.json`

---

**Status**: Ready for use in components, stories, and tests
**Last Updated**: 2024-12-20
**Version**: 1.0.0
