# TouchBase Testing Checklist

Complete testing guide for Sprint 1 validation.

## Pre-Deployment Tests

### 1. File Structure Validation

```bash
# Verify all core files exist
cd plugin/touchbase_pack

# Check PHP files
ls -la src/*.php
ls -la src/Http/*.php
ls -la src/Controllers/*.php
ls -la src/Middleware/*.php
ls -la src/Utils/*.php

# Check views
ls -la views/*.php

# Check translations
ls -la lang/*.php

# Check migrations
ls -la migrations/*.sql

# Check config files
ls -la docker-compose.yml nginx.conf .env.example composer.json

# Check deploy script
ls -la deploy.sh
test -x deploy.sh && echo "✓ deploy.sh is executable" || echo "✗ deploy.sh not executable"
```

### 2. Environment Setup

```bash
# Check .env exists
test -f .env && echo "✓ .env exists" || echo "✗ Creating .env from template"
test -f .env || cp .env.example .env

# Verify .env values
grep -E "^DB_|^BASE_PATH|^DEFAULT_LANG" .env
```

### 3. Docker Health Check

```bash
# Start containers
./deploy.sh

# Verify all containers running
docker-compose ps

# Expected output: 4 running containers (web, app, db, redis)
# - pelota_nginx (Up, 0.0.0.0:80->80/tcp)
# - pelota_php (Up, 9000/tcp)
# - pelota_db (Up, 0.0.0.0:3306->3306/tcp)
# - pelota_redis (Up, 0.0.0.0:6379->6379/tcp)

# Check database connectivity
docker exec pelota_db mysqladmin ping -h localhost -u root -proot
# Expected: mysqld is alive

# Verify tables created
docker exec pelota_db mysql -uchamilo -pchamilo chamilo -e "SHOW TABLES LIKE 'pelota_%';"
# Expected: 6 tables (clubs, seasons, teams, roster, schedule, attendance, stats)
```

## API Endpoint Tests

### Teams API

```bash
# List teams (should show 3 sample teams)
curl -s http://localhost/touchbase/api/teams | jq '.data | length'
# Expected: 3

# Get single team
curl -s http://localhost/touchbase/api/teams/1 | jq '.data.name'
# Expected: "Tigers U12"

# Create team
curl -X POST http://localhost/touchbase/api/teams \
  -H 'Content-Type: application/json' \
  -d '{"club_id":1,"season_id":1,"name":"Test Team","category":"U16"}' \
  | jq '.success'
# Expected: true

# Update team
curl -X PUT http://localhost/touchbase/api/teams/4 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Updated Team","category":"U16"}' \
  | jq '.success'
# Expected: true

# Delete team
curl -X DELETE http://localhost/touchbase/api/teams/4 | jq '.success'
# Expected: true
```

### Schedule API

```bash
# List events
curl -s http://localhost/touchbase/api/schedule | jq '.data | length'
# Expected: 9+ events

# Filter by team
curl -s "http://localhost/touchbase/api/schedule?team_id=1" | jq '.data | length'
# Expected: 6 events for U12 team

# Create event
curl -X POST http://localhost/touchbase/api/schedule \
  -H 'Content-Type: application/json' \
  -d '{
    "team_id":1,
    "type":"practice",
    "venue":"Training Field",
    "start_at":"2025-10-30 16:00:00",
    "notes":"Batting practice"
  }' | jq '.success'
# Expected: true
```

### Roster API

```bash
# List roster
curl -s http://localhost/touchbase/api/roster | jq

# Note: No sample data because we need Chamilo users created first
# This is expected - roster will be populated after Chamilo installation
```

### Attendance API

```bash
# List attendance
curl -s http://localhost/touchbase/api/attendance | jq

# Create attendance record (requires Chamilo user)
# Will be tested after full Chamilo setup
```

### Stats API

```bash
# List stats
curl -s http://localhost/touchbase/api/stats | jq

# Create stat (requires Chamilo user)
# Will be tested after full Chamilo setup
```

## CSV Import/Export Tests

### Export Roster

```bash
# Export (will be empty until users added)
curl "http://localhost/touchbase/api/export/roster?team_id=1" -o roster_export.csv

# Verify CSV structure
head -1 roster_export.csv
# Expected: user_id,number,position,notes
```

### Export Schedule

```bash
# Export schedule
curl "http://localhost/touchbase/api/export/schedule?team_id=1" -o schedule_export.csv

# Verify content
wc -l schedule_export.csv
# Expected: 7 lines (1 header + 6 events)

# View content
cat schedule_export.csv
```

### Import Schedule

```bash
# Create test CSV
cat > schedule_import.csv << 'EOF'
type,opponent,venue,start_at,end_at,notes
practice,,Indoor Facility,2025-11-15 17:00:00,2025-11-15 19:00:00,Rainy day practice
game,Dolphins FC,Away Stadium,2025-11-20 14:00:00,2025-11-20 16:00:00,Championship semifinal
EOF

# Import
curl -X POST http://localhost/touchbase/api/import/schedule \
  -F "file=@schedule_import.csv" \
  -F "team_id=1" \
  | jq

# Expected: {"success":true,"imported":2,"errors":[]}

# Verify import
curl -s "http://localhost/touchbase/api/schedule?team_id=1" | jq '.data | length'
# Expected: 8 (6 original + 2 imported)
```

## Widget Tests

### Schedule Widget

```bash
# Open in browser
open "http://localhost/touchbase/widgets/schedule?team_id=1&lang=en"
open "http://localhost/touchbase/widgets/schedule?team_id=1&lang=es"

# Verify CSS loads
curl -s http://localhost/touchbase/widgets.css | grep "pp-widget"
# Expected: CSS rules for .pp-widget class
```

### Roster Widget

```bash
# Open widget
open "http://localhost/touchbase/widgets/roster?team_id=1&lang=en"

# Will show "No players" until roster populated
# This is expected behavior
```

### Attendance Widget

```bash
# Open widget
open "http://localhost/touchbase/widgets/attendance?team_id=1&lang=en"

# Will show "No attendance records" until data added
# This is expected behavior
```

## UI Tests

### Homepage

```bash
# Visit dashboard
open "http://localhost/touchbase/"

# Expected: Dashboard with 4 cards (Teams, Roster, Schedule, Attendance, Stats)
```

### Teams Page

```bash
# Visit teams list
open "http://localhost/touchbase/teams"

# Expected: Table showing 3 teams (Tigers U12, Lions U10, Bears U8)
```

### Create Team Form

```bash
# Visit form
open "http://localhost/touchbase/teams/create"

# Expected: Form with fields for club_id, season_id, name, category
```

### Language Switching

```bash
# Visit in English
open "http://localhost/touchbase/?lang=en"

# Verify English labels in browser
# Expected: Navigation shows "Teams", "Roster", "Schedule", "Attendance", "Statistics"

# Visit in Spanish
open "http://localhost/touchbase/?lang=es"

# Verify Spanish labels
# Expected: Navigation shows "Equipos", "Roster", "Calendario", "Asistencia", "Estadísticas"
```

## Integration Tests

### Full Workflow Test

```bash
# 1. Create a new team
TEAM_ID=$(curl -X POST http://localhost/touchbase/api/teams \
  -H 'Content-Type: application/json' \
  -d '{"club_id":1,"season_id":1,"name":"Integration Test Team","category":"U14"}' \
  | jq -r '.id')

echo "Created team ID: $TEAM_ID"

# 2. Schedule a practice
curl -X POST http://localhost/touchbase/api/schedule \
  -H 'Content-Type: application/json' \
  -d "{
    \"team_id\":$TEAM_ID,
    \"type\":\"practice\",
    \"venue\":\"Test Field\",
    \"start_at\":\"2025-11-01 16:00:00\",
    \"notes\":\"Integration test practice\"
  }" | jq

# 3. Export schedule
curl "http://localhost/touchbase/api/export/schedule?team_id=$TEAM_ID" -o test_export.csv
cat test_export.csv

# 4. Delete team
curl -X DELETE "http://localhost/touchbase/api/teams/$TEAM_ID" | jq '.success'
# Expected: true
```

## Error Handling Tests

### Invalid Requests

```bash
# Missing required field
curl -X POST http://localhost/touchbase/api/teams \
  -H 'Content-Type: application/json' \
  -d '{"club_id":1}' \
  | jq
# Expected: {"error":true,"message":"Team name is required","status":400}

# Invalid ID
curl -s http://localhost/touchbase/api/teams/99999 | jq
# Expected: {"error":true,"message":"Team not found","status":404}

# Invalid route
curl -s http://localhost/touchbase/api/invalid | jq
# Expected: {"error":true,"message":"Route not found","status":404}
```

### Invalid Event Types

```bash
# Invalid event type
curl -X POST http://localhost/touchbase/api/schedule \
  -H 'Content-Type: application/json' \
  -d '{"team_id":1,"type":"invalid","start_at":"2025-11-01 16:00:00"}' \
  | jq
# Expected: error message about invalid type
```

## Performance Tests

### Response Times

```bash
# Measure API response time
time curl -s http://localhost/touchbase/api/teams > /dev/null
# Expected: < 100ms

time curl -s http://localhost/touchbase/api/schedule > /dev/null
# Expected: < 150ms
```

### Load Test (simple)

```bash
# Test 100 concurrent requests
for i in {1..100}; do
  curl -s http://localhost/touchbase/api/teams > /dev/null &
done
wait

# Check container health
docker-compose ps
# Expected: All containers still healthy
```

## Database Verification

### Schema Check

```bash
# Verify all tables exist
docker exec pelota_db mysql -uchamilo -pchamilo chamilo -e "
SELECT TABLE_NAME, TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'chamilo'
  AND TABLE_NAME LIKE 'pelota_%'
ORDER BY TABLE_NAME;
"

# Expected output:
# pelota_attendance (0 rows)
# pelota_clubs (1 row)
# pelota_roster (0 rows)
# pelota_schedule (9 rows)
# pelota_seasons (1 row)
# pelota_stats (0 rows)
# pelota_teams (3 rows)
```

### Foreign Key Check

```bash
# Verify foreign keys
docker exec pelota_db mysql -uchamilo -pchamilo chamilo -e "
SELECT
  TABLE_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'chamilo'
  AND TABLE_NAME LIKE 'pelota_%'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
"

# Expected: All FK constraints shown
```

## Browser Testing

### Desktop
- [ ] Chrome - All pages render correctly
- [ ] Firefox - Language switching works
- [ ] Safari - Forms submit successfully

### Mobile
- [ ] iOS Safari - Responsive layout works
- [ ] Chrome Mobile - Touch targets are adequate
- [ ] Tables scroll horizontally on small screens

## Accessibility Tests

```bash
# Check HTML validity (basic)
curl -s http://localhost/touchbase/ | grep -E "<!DOCTYPE|<html|<head|<body"

# Verify language attribute
curl -s http://localhost/touchbase/ | grep '<html lang='
# Expected: <html lang="en"> or <html lang="es">
```

## Security Tests

### XSS Prevention

```bash
# Try XSS in team name
curl -X POST http://localhost/touchbase/api/teams \
  -H 'Content-Type: application/json' \
  -d '{"club_id":1,"season_id":1,"name":"<script>alert(1)</script>","category":"U12"}' \
  | jq

# Verify HTML is escaped when rendered
curl -s http://localhost/touchbase/teams | grep "&lt;script&gt;"
# Expected: Script tags are escaped
```

### SQL Injection Prevention

```bash
# Try SQL injection
curl -X POST http://localhost/touchbase/api/teams \
  -H 'Content-Type: application/json' \
  -d "{\"club_id\":1,\"season_id\":1,\"name\":\"'; DROP TABLE pelota_teams; --\",\"category\":\"U12\"}"

# Verify table still exists
docker exec pelota_db mysql -uchamilo -pchamilo chamilo -e "SELECT COUNT(*) FROM pelota_teams;"
# Expected: Table exists with records intact
```

## Internationalization Tests

### Language Detection

```bash
# Test browser language detection
curl -s -H "Accept-Language: es-ES,es;q=0.9" http://localhost/touchbase/ | grep -o 'Equipos'
# Expected: "Equipos" (Spanish)

curl -s -H "Accept-Language: en-US,en;q=0.9" http://localhost/touchbase/ | grep -o 'Teams'
# Expected: "Teams" (English)
```

### Language Switching

```bash
# Switch to Spanish
curl -X POST http://localhost/touchbase/lang/switch \
  -d "lang=es&redirect=/touchbase/" \
  -c cookies.txt

# Verify cookie set
grep "pelota_lang" cookies.txt
# Expected: cookie with value "es"

# Request with cookie
curl -s -b cookies.txt http://localhost/touchbase/ | grep -o 'Equipos'
# Expected: "Equipos"
```

## Widget Embedding Tests

### Create Test HTML

```bash
cat > test_embed.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Widget Embed Test</title>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        iframe { border: 1px solid #ccc; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>TouchBase Widget Embedding Test</h1>

    <h2>Schedule Widget (English)</h2>
    <iframe src="http://localhost/touchbase/widgets/schedule?team_id=1&lang=en"
            width="600" height="400"></iframe>

    <h2>Schedule Widget (Spanish)</h2>
    <iframe src="http://localhost/touchbase/widgets/schedule?team_id=1&lang=es"
            width="600" height="400"></iframe>

    <h2>Roster Widget</h2>
    <iframe src="http://localhost/touchbase/widgets/roster?team_id=1&lang=en"
            width="600" height="400"></iframe>

    <h2>Attendance Widget</h2>
    <iframe src="http://localhost/touchbase/widgets/attendance?team_id=1&lang=en"
            width="600" height="300"></iframe>
</body>
</html>
EOF

# Open in browser
open test_embed.html
```

## CSV Import/Export Tests

### Roster CSV

```bash
# Create sample roster CSV
cat > test_roster.csv << 'EOF'
user_id,number,position,notes
1,9,SS,Team captain
2,27,C,Strong arm
3,15,P,Lefty pitcher
EOF

# Import (Note: This will fail until Chamilo users exist)
# Test after creating users in Chamilo
```

### Schedule CSV

```bash
# Create schedule CSV
cat > test_schedule.csv << 'EOF'
type,opponent,venue,start_at,end_at,notes
practice,,Training Center,2025-12-01 16:00:00,2025-12-01 18:00:00,Pre-tournament prep
game,Rivals FC,Main Stadium,2025-12-05 10:00:00,2025-12-05 12:00:00,Tournament Round 1
EOF

# Import
curl -X POST http://localhost/touchbase/api/import/schedule \
  -F "file=@test_schedule.csv" \
  -F "team_id=1" \
  | jq

# Expected: {"success":true,"imported":2,"errors":[]}

# Verify import
curl -s "http://localhost/touchbase/api/schedule?team_id=1" | jq '.data[-2:] | .[].notes'
# Expected: Shows the two imported notes
```

## Complete Checklist

### Infrastructure
- [ ] Docker containers start without errors
- [ ] All 4 containers running (web, app, db, redis)
- [ ] Database migrations run successfully
- [ ] Sample data loads correctly
- [ ] Nginx routes /touchbase correctly

### API Endpoints
- [ ] GET /api/teams returns sample teams
- [ ] POST /api/teams creates new team
- [ ] PUT /api/teams/{id} updates team
- [ ] DELETE /api/teams/{id} deletes team
- [ ] GET /api/schedule returns events
- [ ] POST /api/schedule creates events
- [ ] CSV export generates valid files
- [ ] CSV import processes files

### UI
- [ ] Dashboard loads at /touchbase/
- [ ] Teams list displays correctly
- [ ] Create team form works
- [ ] Language switcher (EN/ES) functions
- [ ] All navigation links work

### Widgets
- [ ] Schedule widget renders
- [ ] Roster widget renders
- [ ] Attendance widget renders
- [ ] Widgets embed in iframe
- [ ] Widget CSS loads properly

### i18n
- [ ] English is default language
- [ ] Spanish translations work
- [ ] Browser language detection works
- [ ] Language cookie persists

### Security
- [ ] HTML escaping prevents XSS
- [ ] Prepared statements prevent SQL injection
- [ ] Auth middleware structure in place

### Documentation
- [ ] README.md is complete and accurate
- [ ] QUICKSTART.md provides easy entry
- [ ] INSTALL.md covers production deployment
- [ ] PROJECT_STRUCTURE.md explains architecture

## Success Criteria

✅ All API endpoints return valid JSON
✅ Sample data loads successfully
✅ Widgets render in both EN/ES
✅ CSV export generates valid files
✅ Docker deployment completes in < 2 minutes
✅ Documentation is comprehensive and clear
✅ Zero errors in container logs

## Next Sprint Goals

After this sprint is validated:
- [ ] Full Chamilo session integration (login required for UI)
- [ ] Create users and test roster assignment
- [ ] Attendance recording with real users
- [ ] Statistics tracking workflow
- [ ] Parent/guardian read-only views
- [ ] xAPI integration for drills
- [ ] Production deployment to VPS
