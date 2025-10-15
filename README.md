# TouchBase

**Baseball Club Management System for Chamilo LMS**

TouchBase is a Chamilo plugin that adds comprehensive baseball club management features, including team organization, roster management, scheduling, attendance tracking, and player statistics.

## Features

✅ **Multilingual** - Full English/Spanish support with auto-detection
⚾ **Team Management** - Organize teams by age category (U8, U10, U12, etc.)
📋 **Roster Management** - Assign players to teams with positions and numbers
📅 **Schedule** - Manage practices and games calendar
📊 **Attendance Tracking** - Record and analyze player attendance
📈 **Statistics** - Track baseball performance metrics (AVG, OBP, HR, RBI, etc.)
🎨 **Modern UI** - Clean, mobile-responsive interface
🔌 **RESTful API** - JSON API for integrations
📦 **CSV Import/Export** - Bulk operations for roster and schedule
🔐 **Role-Based Access** - Integration with Chamilo permissions
📱 **Embeddable Widgets** - Iframe-ready components for courses

## Quick Start (Local Development)

**One-command deployment:**

```bash
cd plugin/touchbase
./deploy.sh
```

This will:
- Start Docker containers (Nginx, PHP 8.3, MariaDB, Redis)
- Run database migrations
- Load sample data (1 club, 1 season, 3 teams)
- Open `http://localhost/touchbase`

**Manual steps if needed:**

```bash
# 1. Start containers
docker-compose up -d

# 2. Run migrations
docker exec -i touchbase_db mysql -uchamilo -pchamilo chamilo < migrations/001_init.sql
docker exec -i touchbase_db mysql -uchamilo -pchamilo chamilo < migrations/002_sample_data.sql

# 3. Access
open http://localhost/touchbase
```

## Requirements

- **Chamilo LMS** 1.11.32+ (PHP 8.2/8.3 compatible)
- **PHP** 8.2 or 8.3
- **MySQL/MariaDB** 5.7+ / 10.3+
- **Web Server** Nginx or Apache with mod_rewrite

## Installation

### 1. Copy Plugin Files

```bash
cd /path/to/chamilo/plugin
git clone https://github.com/nadalpiantini/touchbase.git
# OR extract from zip
unzip touchbase.zip -d touchbase
```

### 2. Configure Environment

```bash
cd touchbase
cp .env.example .env
```

Edit `.env` to match your database settings:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=chamilo
DB_USER=chamilo_user
DB_PASS=your_password

BASE_PATH=/touchbase
DEFAULT_LANG=en
SUPPORTED_LANGS=en,es
```

### 3. Run Database Migration

```bash
# Using Docker
docker compose exec db bash -c "mysql -u chamilo_user -p chamilo < /var/www/html/plugin/touchbase/migrations/001_init.sql"

# Or directly
mysql -u chamilo_user -p chamilo < migrations/001_init.sql
```

### 4. Configure Web Server

**For Nginx** - Add to your site config:

```nginx
location ^~ /touchbase {
    alias /var/www/html/plugin/touchbase/public;
    index index.php;

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $request_filename;
        fastcgi_pass php:9000; # Adjust to your PHP-FPM socket
    }
}
```

**For Apache** - `.htaccess` is included in `public/` directory

Restart your web server:

```bash
# Nginx
sudo systemctl restart nginx

# Apache
sudo systemctl restart apache2
```

### 5. Access the Plugin

Visit: `https://your-chamilo-site.com/touchbase`

## Usage

### Teams

1. Navigate to **Teams** section
2. Click **Create Team**
3. Fill in team details (name, category, club, season)
4. Save

### Roster

1. Navigate to **Roster** section
2. Use the API or forms to assign players to teams
3. Specify jersey numbers and positions

### Schedule

1. Navigate to **Schedule** section
2. Create practices or games
3. Set opponent, venue, date/time

### Attendance

1. Navigate to **Attendance** section
2. Record daily attendance (present, late, absent, excused)
3. View attendance statistics

### Statistics

1. Navigate to **Statistics** section
2. Record player performance metrics
3. View player summaries and aggregated stats

## API Reference

All API endpoints are prefixed with `/touchbase/api`

### Teams

```http
GET    /api/teams           # List all teams
POST   /api/teams           # Create team
GET    /api/teams/{id}      # Get single team
PUT    /api/teams/{id}      # Update team
DELETE /api/teams/{id}      # Delete team
```

### Roster

```http
GET    /api/roster          # List roster entries
POST   /api/roster          # Add player to roster
PUT    /api/roster/{id}     # Update roster entry
DELETE /api/roster/{id}     # Remove from roster
```

### Schedule

```http
GET    /api/schedule        # List events
POST   /api/schedule        # Create event
PUT    /api/schedule/{id}   # Update event
DELETE /api/schedule/{id}   # Delete event
```

### Attendance

```http
GET    /api/attendance          # List records
POST   /api/attendance          # Record attendance
GET    /api/attendance/stats    # Get statistics
```

### Statistics

```http
GET    /api/stats               # List stats
POST   /api/stats               # Record stat
GET    /api/stats/player        # Player summary
```

### API Examples

**Create a Team:**

```bash
curl -X POST https://your-site.com/touchbase/api/teams \
  -H 'Content-Type: application/json' \
  -d '{
    "club_id": 1,
    "season_id": 1,
    "name": "Tigers U12",
    "category": "U12"
  }'
```

**Record Attendance:**

```bash
curl -X POST https://your-site.com/touchbase/api/attendance \
  -H 'Content-Type: application/json' \
  -d '{
    "team_id": 1,
    "user_id": 5,
    "date": "2025-10-15",
    "status": "present"
  }'
```

## Internationalization (i18n)

TouchBase supports multiple languages:

- **English** (default)
- **Spanish**

### Language Detection

Language is detected automatically in this order:
1. User session preference
2. Browser `Accept-Language` header
3. Default language (set in `.env`)

### Language Switcher

The language switcher is available in the top-right corner of every page. Clicking a language button will:
1. Update the session preference
2. Set a persistent cookie
3. Reload the page in the selected language

### Adding More Languages

1. Create a new file in `lang/` (e.g., `fr.php` for French)
2. Copy the structure from `lang/en.php`
3. Translate all strings
4. Add the language code to `SUPPORTED_LANGS` in `.env`:

```env
SUPPORTED_LANGS=en,es,fr
```

## Database Schema

- **touchbase_clubs** - Baseball clubs/organizations
- **touchbase_seasons** - Time periods for organizing teams
- **touchbase_teams** - Teams by age category
- **touchbase_roster** - Players assigned to teams
- **touchbase_schedule** - Practices and games
- **touchbase_attendance** - Attendance records
- **touchbase_stats** - Player statistics

See `migrations/001_init.sql` for full schema details.

## Development

### File Structure

```
touchbase/
├── public/
│   └── index.php          # Entry point
├── src/
│   ├── Config.php         # Configuration manager
│   ├── I18n.php           # Internationalization
│   ├── Database.php       # Database connection
│   ├── Router.php         # HTTP routing
│   ├── bootstrap.php      # Application bootstrap
│   ├── Http/
│   │   ├── Request.php    # Request wrapper
│   │   └── Response.php   # Response wrapper
│   └── Controllers/       # REST controllers
├── views/                 # HTML templates
├── lang/                  # Translation files
├── migrations/            # Database migrations
└── .env.example           # Environment template
```

### Code Standards

- **PHP** 8.2+ with strict types
- **PSR-12** code style
- **English** for all code, comments, and documentation
- **i18n** for all user-facing strings

## License

GPL-3.0-or-later

TouchBase is free software. You can redistribute and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation.

## Support

- **Issues**: https://github.com/nadalpiantini/touchbase/issues
- **Documentation**: https://github.com/nadalpiantini/touchbase/wiki
- **Chamilo**: https://chamilo.org

## Testing

### Quick API Tests

```bash
# List teams
curl http://localhost/touchbase/api/teams

# Create a team
curl -X POST http://localhost/touchbase/api/teams \
  -H 'Content-Type: application/json' \
  -d '{"club_id":1,"season_id":1,"name":"Wildcats U14","category":"U14"}'

# Export roster CSV
curl "http://localhost/touchbase/api/export/roster?team_id=1" -o roster.csv

# View widget
open "http://localhost/touchbase/widgets/schedule?team_id=1&lang=en"
```

### Widget Embedding

Embed in Chamilo course HTML blocks:

```html
<!-- Schedule Widget -->
<iframe src="/touchbase/widgets/schedule?team_id=1&lang=en"
        width="100%" height="300" style="border:0"></iframe>

<!-- Roster Widget -->
<iframe src="/touchbase/widgets/roster?team_id=1&lang=en"
        width="100%" height="400" style="border:0"></iframe>

<!-- Attendance Widget -->
<iframe src="/touchbase/widgets/attendance?team_id=1&lang=en"
        width="100%" height="300" style="border:0"></iframe>
```

## Roadmap

- [x] Multilingual support (EN/ES)
- [x] CSV import/export for rosters and schedules
- [x] Embeddable widgets for courses
- [x] RESTful API
- [ ] Integration with Chamilo user roles and permissions (Auth middleware complete, needs UI integration)
- [ ] Parent/guardian view (read-only player dashboards)
- [ ] xAPI integration for drill tracking
- [ ] Advanced analytics and reports
- [ ] Mobile app (React Native)
- [ ] OIDC/SSO integration (Keycloak/Supabase)

## Credits

Developed for baseball clubs in the Dominican Republic and worldwide.

Built on [Chamilo LMS](https://chamilo.org) - The leading open-source e-learning platform.

---

<!-- Deployment Flow Test: 2025-10-15 16:51 AST - Automated CI/CD Pipeline Active -->
