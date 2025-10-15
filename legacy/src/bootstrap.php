<?php
declare(strict_types=1);

/**
 * TouchBase Bootstrap
 * Initializes the application environment
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Define base paths
define('TOUCHBASE_BASE', dirname(__DIR__));

// Autoload core classes
require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/I18n.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Router.php';
require_once __DIR__ . '/SupabaseClient.php';

// HTTP layer
require_once __DIR__ . '/Http/Request.php';
require_once __DIR__ . '/Http/Response.php';

// Middleware and Utilities
require_once __DIR__ . '/Middleware/Auth.php';
require_once __DIR__ . '/Middleware/SupabaseAuth.php';
require_once __DIR__ . '/Utils/Validator.php';
require_once __DIR__ . '/Utils/Tenant.php';

// Database
require_once __DIR__ . '/Database/Migrator.php';

// Controllers (Sprint 1)
require_once __DIR__ . '/Controllers/TeamController.php';
require_once __DIR__ . '/Controllers/RosterController.php';
require_once __DIR__ . '/Controllers/ScheduleController.php';
require_once __DIR__ . '/Controllers/AttendanceController.php';
require_once __DIR__ . '/Controllers/StatsController.php';
require_once __DIR__ . '/Controllers/WidgetsController.php';
require_once __DIR__ . '/Controllers/ImportController.php';
require_once __DIR__ . '/Controllers/ExportController.php';
require_once __DIR__ . '/Controllers/TournamentController.php';
require_once __DIR__ . '/Controllers/StandingsController.php';

// Controllers (Sprint 2)
require_once __DIR__ . '/Controllers/AIController.php';
require_once __DIR__ . '/Controllers/NotifyController.php';
require_once __DIR__ . '/Controllers/BillingController.php';

// AI System (Sprint 2)
require_once __DIR__ . '/AI/LLMProvider.php';
require_once __DIR__ . '/AI/DeepSeekBedrock.php';
require_once __DIR__ . '/AI/CoachAssistant.php';

// Services
require_once __DIR__ . '/Services/BracketGenerator.php';

// Initialize i18n
TouchBase\I18n::init();

/**
 * Helper function to render a view
 *
 * @param string $name View name (without .php extension)
 * @param array<string, mixed> $data Data to pass to view
 * @return string Rendered HTML
 */
function view(string $name, array $data = []): string
{
    // Load tenant context for all views
    $tenant = TouchBase\Utils\Tenant::current();
    $currentLang = TouchBase\I18n::getCurrentLang();
    
    extract($data);
    extract(['tenant' => $tenant, 'currentLang' => $currentLang]);

    ob_start();

    // Include layout wrapper
    include TOUCHBASE_BASE . '/views/layout.php';

    return (string) ob_get_clean();
}

/**
 * Helper function to render a partial view
 *
 * @param string $name Partial view name
 * @param array<string, mixed> $data Data to pass to view
 * @return string Rendered HTML
 */
function partial(string $name, array $data = []): string
{
    extract($data);

    ob_start();

    $viewFile = TOUCHBASE_BASE . "/views/{$name}.php";
    if (file_exists($viewFile)) {
        include $viewFile;
    }

    return (string) ob_get_clean();
}

/**
 * Helper to escape HTML output
 *
 * @param string $string String to escape
 * @return string Escaped string
 */
function e(string $string): string
{
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

/**
 * Helper to generate URL with base path
 *
 * @param string $path Path relative to base
 * @return string Full URL
 */
function url(string $path = ''): string
{
    return BASE_PATH . '/' . ltrim($path, '/');
}

/**
 * Helper to check if current page matches path
 *
 * @param string $path Path to check
 * @return bool
 */
function isActive(string $path): bool
{
    $currentPath = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    return str_starts_with($currentPath, BASE_PATH . $path);
}
