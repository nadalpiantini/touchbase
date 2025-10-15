# TouchBase Development Guide

## Architecture Overview

TouchBase is a PHP application built as a Chamilo LMS plugin with:
- **MVC Architecture** with custom Router
- **PSR-4 Autoloading** via Composer
- **RESTful API** design
- **Multi-language support** (i18n)

## Project Structure

```
touchbase/
├── src/                    # Application source code
│   ├── Controllers/        # HTTP request handlers
│   ├── Services/           # Business logic
│   ├── Middleware/         # Request interceptors
│   ├── AI/                 # AI integrations
│   ├── Database/           # Database utilities
│   ├── Http/              # Request/Response handlers
│   └── Utils/             # Helper classes
├── views/                  # PHP view templates
│   ├── partials/          # Reusable components
│   └── *.php              # Page templates
├── public/                 # Web-accessible files
│   ├── index.php          # Application entry point
│   ├── widgets.css        # Widget styles
│   └── sw.js              # Service worker
├── migrations/            # Database migrations
├── lang/                  # Translation files
├── assets/                # Static assets
│   └── css/              # Stylesheets
├── tests/                 # Test files
└── docs/                  # Documentation
```

## Development Setup

### Prerequisites
- PHP 8.2+
- Composer
- MySQL/PostgreSQL
- Git

### Local Development

```bash
# Clone repository
git clone https://github.com/your-org/touchbase.git
cd touchbase

# Install dependencies
composer install

# Configure environment
cp .env.example .env
# Edit .env for local settings

# Start with Docker (recommended)
docker-compose up -d

# Or use local PHP server
php -S localhost:8000 -t public/

# Run migrations
php run_migrations.php
```

## Code Standards

### PHP Standards
- PSR-4 for autoloading
- PSR-12 for coding style
- Type hints for parameters and returns
- Strict types declaration

### Naming Conventions
- **Classes**: PascalCase (e.g., `TeamController`)
- **Methods**: camelCase (e.g., `getTeamById`)
- **Properties**: camelCase (e.g., `$teamName`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_PLAYERS`)
- **Files**: Match class name (e.g., `TeamController.php`)

## Key Components

### Router
```php
// src/Router.php
$router = new Router('/touchbase');
$router->get('/teams', [TeamController::class, 'index']);
$router->post('/teams', [TeamController::class, 'create']);
$router->get('/teams/{id}', [TeamController::class, 'show']);
```

### Controllers
```php
// src/Controllers/TeamController.php
namespace TouchBase\Controllers;

class TeamController {
    public function index(Request $request): Response {
        // List teams
    }

    public function create(Request $request): Response {
        // Create team
    }
}
```

### Database Access
```php
// Using Database class
use TouchBase\Database;

$db = Database::getInstance();
$teams = $db->query("SELECT * FROM tb_teams WHERE season_id = ?", [$seasonId]);
```

### Internationalization
```php
// Using I18n class
use TouchBase\I18n;

$message = I18n::get('welcome.message'); // Gets translated string
```

## API Endpoints

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/{id}` - Get team
- `PUT /api/teams/{id}` - Update team
- `DELETE /api/teams/{id}` - Delete team

### Players
- `GET /api/players` - List players
- `POST /api/players` - Create player
- `GET /api/players/{id}` - Get player
- `PUT /api/players/{id}` - Update player

### Schedule
- `GET /api/schedule` - List events
- `POST /api/schedule` - Create event
- `GET /api/schedule/{id}` - Get event

## Testing

### Unit Tests (PHPUnit)
```bash
# Run all tests
composer test

# Run specific test
composer test -- --filter TeamControllerTest

# With coverage
composer test:coverage
```

### E2E Tests (Playwright)
```bash
# Install dependencies
npm install

# Run tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

## Common Tasks

### Adding a New Feature
1. Create migration if needed
2. Add route in `public/index.php`
3. Create controller in `src/Controllers/`
4. Add service logic in `src/Services/`
5. Create view in `views/`
6. Add translations in `lang/`
7. Write tests
8. Update documentation

### Creating a Migration
```bash
# Create migration file
touch migrations/007_your_feature.sql

# Add SQL commands
echo "CREATE TABLE tb_your_table ..." > migrations/007_your_feature.sql

# Run migration
php run_migrations.php
```

### Debugging

```php
// Enable debug mode in .env
DEBUG=true

// Use Config helper
if (Config::isDebug()) {
    error_log('Debug info: ' . print_r($data, true));
}

// Check logs
tail -f logs/app.log
tail -f logs/error.log
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Commit Message Format
```
type(scope): subject

body

footer
```

Types: feat, fix, docs, style, refactor, test, chore

### Pre-commit Checks
- PHPStan static analysis
- PHP-CS-Fixer code style
- PHPUnit tests
- Security audit

## Resources

- [PHP Documentation](https://www.php.net/docs.php)
- [Chamilo Developer Guide](https://docs.chamilo.org)
- [PSR Standards](https://www.php-fig.org/psr/)
- [Composer Documentation](https://getcomposer.org/doc/)