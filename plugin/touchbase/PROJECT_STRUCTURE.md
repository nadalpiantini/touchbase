# TouchBase - Complete Project Structure

## Overview

TouchBase is a modular, self-contained Chamilo plugin with zero core modifications.

```
plugin/touchbase/                    # Plugin root
├── .dockerignore                      # Docker ignore file
├── .env.example                       # Environment template
├── composer.json                      # PHP package definition
├── docker-compose.yml                 # Local dev environment
├── nginx.conf                         # Nginx configuration
├── deploy.sh                          # One-command deployment script
├── README.md                          # Main documentation
├── INSTALL.md                         # Installation guide
├── QUICKSTART.md                      # Quick start guide
├── PROJECT_STRUCTURE.md               # This file
│
├── public/                            # Web-accessible directory
│   ├── index.php                      # Main entry point (router)
│   └── widgets.css                    # Widget styling
│
├── src/                               # Application source code
│   ├── bootstrap.php                  # Application initialization
│   ├── Config.php                     # Configuration management
│   ├── Database.php                   # PDO database wrapper
│   ├── I18n.php                       # Internationalization engine
│   ├── Router.php                     # HTTP routing system
│   │
│   ├── Http/                          # HTTP layer
│   │   ├── Request.php                # Request wrapper
│   │   └── Response.php               # Response wrapper
│   │
│   ├── Controllers/                   # MVC Controllers
│   │   ├── TeamController.php         # Team CRUD operations
│   │   ├── RosterController.php       # Roster management
│   │   ├── ScheduleController.php     # Schedule management
│   │   ├── AttendanceController.php   # Attendance tracking
│   │   ├── StatsController.php        # Player statistics
│   │   ├── WidgetsController.php      # Embeddable widgets
│   │   ├── ImportController.php       # CSV imports
│   │   └── ExportController.php       # CSV exports
│   │
│   ├── Middleware/                    # HTTP middleware
│   │   └── Auth.php                   # Authentication & authorization
│   │
│   └── Utils/                         # Utility classes
│       └── Validator.php              # Input validation
│
├── views/                             # HTML templates
│   ├── layout.php                     # Master layout with navigation
│   ├── dashboard.php                  # Home dashboard
│   ├── teams_list.php                 # Teams listing
│   ├── team_form.php                  # Team create/edit form
│   ├── roster_list.php                # Roster listing
│   ├── schedule_list.php              # Schedule calendar
│   ├── attendance_list.php            # Attendance records
│   └── stats_list.php                 # Statistics dashboard
│
├── lang/                              # Translation files
│   ├── en.php                         # English (default)
│   └── es.php                         # Spanish
│
└── migrations/                        # Database migrations
    ├── 001_init.sql                   # Initial schema
    └── 002_sample_data.sql            # Sample data for testing
```

## Chamilo Theme Files

```
main/css/themes/clubball/              # ClubBall theme
├── variables.css                      # CSS custom properties
├── theme.css                          # Main theme styles
└── README.md                          # Theme documentation
```

## Architecture

### Request Flow

```
HTTP Request → Nginx → public/index.php → Router → Controller → Response
                ↓
            bootstrap.php (loads classes, starts session, init i18n)
                ↓
            Controller uses Database, I18n, Middleware
                ↓
            Renders View or Returns JSON
```

### Database Layer

```
Controllers → Database.php (PDO wrapper) → MariaDB
                ↓
        pelota_* tables (isolated from Chamilo core)
```

### Internationalization Flow

```
User Request → I18n::detectLanguage() → Load lang/{code}.php
                ↓
        __('translation.key') in views/controllers
                ↓
        Rendered in selected language
```

### Authentication Flow

```
API Request → Router → Controller
                ↓
        Auth::requireRole(['coach','admin'])
                ↓
        Check $_SESSION['_user'] (Chamilo session)
                ↓
        Allow or 401/403 response
```

## Key Design Decisions

### 1. Zero Core Modifications
- Plugin is self-contained in `/plugin/touchbase/`
- Uses Chamilo's `user` table via foreign keys
- No modifications to Chamilo core files

### 2. English-First with i18n
- All code in English (variables, classes, comments)
- All UI strings translated via `__()` function
- Easy to add new languages (just add `lang/{code}.php`)

### 3. Modular Architecture
- Clear separation: Controllers, Views, Middleware, Utils
- PSR-4 autoloading ready (via Composer)
- Easy to extend with new controllers

### 4. RESTful API Design
- JSON responses for all `/api/*` endpoints
- Consistent response format: `{success: bool, data/message, ...}`
- HTTP verbs match operations (GET, POST, PUT, DELETE)

### 5. Security First
- Prepared statements (PDO) prevent SQL injection
- Input validation via Validator class
- Role-based access control via Auth middleware
- HTML escaping in all views

## Extension Points

### Adding a New Controller

1. Create `src/Controllers/YourController.php`
2. Add to `src/bootstrap.php` (require_once)
3. Add routes in `public/index.php`
4. Add translations in `lang/*.php`

### Adding a New Language

1. Copy `lang/en.php` to `lang/fr.php` (example)
2. Translate all strings
3. Add `fr` to `.env` → `SUPPORTED_LANGS=en,es,fr`

### Adding a New Widget

1. Add method to `WidgetsController.php`
2. Add route in `public/index.php`
3. Style in `public/widgets.css`
4. Embed via `<iframe src="/touchbase/widgets/your-widget?team_id=1">`

### Adding Database Tables

1. Create `migrations/003_your_feature.sql`
2. Run: `docker exec -i pelota_db mysql -uchamilo -pchamilo chamilo < migrations/003_your_feature.sql`

## Performance Considerations

- **OPcache**: Enabled in PHP container for bytecode caching
- **Prepared Statements**: All queries use PDO prepared statements
- **Query Limits**: All SELECT queries have LIMIT clauses
- **Indexes**: Database tables have appropriate indexes (see schema)
- **Static Assets**: Nginx caches CSS/JS/images (30 days)

## Security Checklist

- [x] SQL injection prevention (PDO prepared statements)
- [x] XSS prevention (htmlspecialchars in views)
- [x] CSRF protection (ready for implementation)
- [x] File upload validation (CSV mimetype check)
- [x] Role-based access control (Auth middleware)
- [x] Password hashing (delegated to Chamilo)
- [ ] Rate limiting (future: nginx limit_req)
- [ ] Content Security Policy headers (future)

## Testing Strategy

### Unit Tests (Future)
- PHPUnit for controller logic
- Mock Database class for isolation
- Test validation rules

### Integration Tests (Future)
- Full request/response cycle
- Database operations with test fixtures
- API endpoint validation

### Manual Testing (Current)
```bash
# API tests
curl http://localhost/touchbase/api/teams
curl -X POST http://localhost/touchbase/api/teams -H 'Content-Type: application/json' -d '{...}'

# Widget tests
open "http://localhost/touchbase/widgets/schedule?team_id=1"

# CSV tests
curl "http://localhost/touchbase/api/export/roster?team_id=1" -o test.csv
```

## Deployment Targets

### Development
```bash
./deploy.sh  # Docker Compose on macOS/Linux
```

### Staging
- Same as production but with DEBUG=true
- Use staging database
- Enable error logging

### Production
- HTTPS required (Let's Encrypt)
- DEBUG=false in .env
- Proper database credentials
- Nginx rate limiting
- Security headers
- Regular backups

See `INSTALL.md` for detailed production deployment.

## Maintenance

### Database Backups
```bash
docker exec pelota_db mysqldump -uchamilo -pchamilo chamilo > backup.sql
```

### Log Rotation
```bash
# Check logs
docker-compose logs -f app
docker-compose logs -f web

# Clear logs
docker-compose logs --no-log-prefix > /dev/null
```

### Updates
```bash
# Pull latest code
git pull origin main

# Run new migrations
docker exec -i pelota_db mysql -uchamilo -pchamilo chamilo < migrations/00X_new.sql

# Restart containers
docker-compose restart
```

## Support

- Issues: https://github.com/yourusername/touchbase/issues
- Docs: See README.md, INSTALL.md, QUICKSTART.md
- Chamilo: https://chamilo.org/documentation
