<?php
declare(strict_types=1);

use TouchBase\Router;
use TouchBase\Http\Request;
use TouchBase\Http\Response;
use TouchBase\I18n;

use function TouchBase\__;

// Handle static assets
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
if (str_starts_with($requestUri, '/touchbase/assets/')) {
    $assetPath = str_replace('/touchbase/assets/', '', $requestUri);
    $fullPath = __DIR__ . '/../assets/' . $assetPath;
    
    if (file_exists($fullPath) && is_file($fullPath)) {
        $mimeType = match(pathinfo($fullPath, PATHINFO_EXTENSION)) {
            'css' => 'text/css',
            'js' => 'application/javascript',
            'svg' => 'image/svg+xml',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'ico' => 'image/x-icon',
            default => 'application/octet-stream'
        };
        
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($fullPath));
        readfile($fullPath);
        exit;
    }
}

require_once __DIR__ . '/../src/bootstrap.php';

// Create request from globals
$request = Request::fromGlobals();

// Handle language switching
if ($request->path === BASE_PATH . '/lang/switch' && $request->method === 'POST') {
    $lang = $request->input('lang');
    if ($lang && I18n::setLanguage($lang)) {
        $redirect = $request->input('redirect', BASE_PATH . '/');
        Response::redirect($redirect)->send();
        exit;
    }
}

// Initialize router

// ============================================================
// Route Helpers with Auth
// ============================================================

/**
 * Create route that requires authentication
 */
$authRoute = function($roles) {
    return function($handler) use ($roles) {
        return function(Request $request, array $params = []) use ($handler, $roles) {
            TouchBase\Middleware\Auth::requireRole(is_string($roles) ? [$roles] : $roles);
            return is_callable($handler) ? $handler($request, $params) : $handler;
        };
    };
};

/**
 * Admin-only route helper
 */
$adminRoute = $authRoute('admin');

/**
 * Coach or admin route helper
 */
$coachRoute = $authRoute(['coach', 'admin']);

$router = new Router(BASE_PATH);

// ============================================================
// API Routes (JSON responses)
// ============================================================

// Teams
$router->get('/api/teams', [TouchBase\Controllers\TeamController::class, 'index']);
$router->post('/api/teams', [TouchBase\Controllers\TeamController::class, 'store']);
$router->get('/api/teams/{id}', [TouchBase\Controllers\TeamController::class, 'show']);
$router->put('/api/teams/{id}', [TouchBase\Controllers\TeamController::class, 'update']);
$router->delete('/api/teams/{id}', [TouchBase\Controllers\TeamController::class, 'destroy']);

// Roster
$router->get('/api/roster', [TouchBase\Controllers\RosterController::class, 'index']);
$router->post('/api/roster', [TouchBase\Controllers\RosterController::class, 'store']);
$router->put('/api/roster/{id}', [TouchBase\Controllers\RosterController::class, 'update']);
$router->delete('/api/roster/{id}', [TouchBase\Controllers\RosterController::class, 'destroy']);

// Users (for roster management)
$router->get('/api/users', function() {
    $users = TouchBase\Database::fetchAll('SELECT user_id, username, firstname, lastname, email FROM user ORDER BY firstname, lastname');
    return TouchBase\Http\Response::json([
        'success' => true,
        'data' => $users,
        'count' => count($users),
    ]);
});

// Schedule
$router->get('/api/schedule', [TouchBase\Controllers\ScheduleController::class, 'index']);
$router->post('/api/schedule', [TouchBase\Controllers\ScheduleController::class, 'store']);
$router->put('/api/schedule/{id}', [TouchBase\Controllers\ScheduleController::class, 'update']);
$router->delete('/api/schedule/{id}', [TouchBase\Controllers\ScheduleController::class, 'destroy']);

// Attendance
$router->get('/api/attendance', [TouchBase\Controllers\AttendanceController::class, 'index']);
$router->post('/api/attendance', [TouchBase\Controllers\AttendanceController::class, 'store']);
$router->get('/api/attendance/stats', [TouchBase\Controllers\AttendanceController::class, 'stats']);

// Statistics
$router->get('/api/stats', [TouchBase\Controllers\StatsController::class, 'index']);
$router->post('/api/stats', [TouchBase\Controllers\StatsController::class, 'store']);
$router->get('/api/stats/player', [TouchBase\Controllers\StatsController::class, 'playerSummary']);

// ============================================================
// Web Routes (HTML views)
// ============================================================

// Home / Dashboard
$router->get('/', function () {
    return new Response(view('dashboard'));
});

// Teams (public read, auth required for create/edit)
$router->get('/teams', function () {
    return new Response(view('teams_list'));
});

$router->get('/teams/create', function () {
    // For development: create a mock admin user
    if (!isset($_SESSION['_user'])) {
        $_SESSION['_user'] = [
            'user_id' => 1,
            'username' => 'admin',
            'role' => 'admin'
        ];
    }
    TouchBase\Middleware\Auth::requireRole(['admin', 'coach']);
    return new Response(view('team_form', ['mode' => 'create']));
});

$router->get('/teams/{id}/edit', function (Request $request, array $params) {
    TouchBase\Middleware\Auth::requireRole(['admin', 'coach']);
    return new Response(view('team_form', ['mode' => 'edit', 'id' => $params['id']]));
});

// Roster
$router->get('/roster', function () {
    return new Response(view('roster_list'));
});

// Schedule
$router->get('/schedule', function () {
    return new Response(view('schedule_list'));
});

// Attendance
$router->get('/attendance', function () {
    return new Response(view('attendance_list'));
});

// Statistics
$router->get('/stats', function () {
    return new Response(view('stats_list'));
});

// ============================================================
// Tournament & Standings Routes
// ============================================================

// Tournaments API
$router->get('/api/tournaments', [TouchBase\Controllers\TournamentController::class, 'index']);
$router->post('/api/tournaments', [TouchBase\Controllers\TournamentController::class, 'store']);
$router->get('/api/tournaments/{id}', [TouchBase\Controllers\TournamentController::class, 'show']);
$router->put('/api/tournaments/{id}', [TouchBase\Controllers\TournamentController::class, 'update']);
$router->delete('/api/tournaments/{id}', [TouchBase\Controllers\TournamentController::class, 'destroy']);

// Tournament Operations
$router->post('/api/tournaments/{id}/teams', [TouchBase\Controllers\TournamentController::class, 'addTeam']);
$router->post('/api/tournaments/{id}/generate-bracket', [TouchBase\Controllers\TournamentController::class, 'generateBracket']);
$router->post('/api/tournaments/{id}/schedule-matches', [TouchBase\Controllers\TournamentController::class, 'scheduleMatches']);
$router->get('/api/tournaments/{id}/matches', [TouchBase\Controllers\TournamentController::class, 'getMatches']);
$router->post('/api/matches/{match_id}/result', [TouchBase\Controllers\TournamentController::class, 'updateMatchResult']);

// Standings API
$router->get('/api/standings', [TouchBase\Controllers\StandingsController::class, 'index']);
$router->get('/api/standings/head-to-head', [TouchBase\Controllers\StandingsController::class, 'headToHead']);
$router->get('/api/standings/leaders', [TouchBase\Controllers\StandingsController::class, 'leaders']);

// Tournaments Web Views
$router->get('/tournaments', function () {
    return new Response(view('tournaments_list'));
});

$router->get('/tournaments/create', function () {
    TouchBase\Middleware\Auth::requireRole(['admin', 'coach']);
    return new Response(view('tournament_form', ['mode' => 'create']));
});

$router->get('/tournaments/{id}', function (Request $request, array $params) {
    return new Response(view('tournament_detail', ['id' => $params['id']]));
});

$router->get('/standings', function (Request $request) {
    return new Response(view('standings'));
});

// ============================================================
// Widget Routes (Embeddable HTML)
// ============================================================

$router->get('/widgets/schedule', [TouchBase\Controllers\WidgetsController::class, 'schedule']);
$router->get('/widgets/roster', [TouchBase\Controllers\WidgetsController::class, 'roster']);
$router->get('/widgets/attendance', [TouchBase\Controllers\WidgetsController::class, 'attendance']);

// ============================================================
// CSV Import/Export Routes
// ============================================================

$router->post('/api/import/roster', [TouchBase\Controllers\ImportController::class, 'roster']);
$router->post('/api/import/schedule', [TouchBase\Controllers\ImportController::class, 'schedule']);
$router->get('/api/export/roster', [TouchBase\Controllers\ExportController::class, 'roster']);
$router->get('/api/export/schedule', [TouchBase\Controllers\ExportController::class, 'schedule']);

// ============================================================
// AI Assistant Routes (Sprint 2)
// ============================================================

$router->get('/ai/assistant', [TouchBase\Controllers\AIController::class, 'index']);
$router->post('/ai/ask', [TouchBase\Controllers\AIController::class, 'ask']);
$router->post('/api/ai/chat', [TouchBase\Controllers\AIController::class, 'chat']);
$router->get('/api/ai/suggestions', [TouchBase\Controllers\AIController::class, 'suggestions']);

// ============================================================
// Notification Routes (Sprint 2)
// ============================================================

$router->post('/api/notify/event', [TouchBase\Controllers\NotifyController::class, 'event']);
$router->post('/api/notify/reminder', [TouchBase\Controllers\NotifyController::class, 'reminder']);
$router->get('/api/notify/queue-status', [TouchBase\Controllers\NotifyController::class, 'queueStatus']);

// ============================================================
// Billing Routes (Sprint 2)
// ============================================================

$router->post('/api/billing/checkout', [TouchBase\Controllers\BillingController::class, 'createCheckout']);
$router->post('/api/billing/webhook', [TouchBase\Controllers\BillingController::class, 'webhook']);
$router->get('/api/billing/history', [TouchBase\Controllers\BillingController::class, 'history']);
$router->get('/api/billing/export', [TouchBase\Controllers\BillingController::class, 'export']);

// ============================================================
// Settings Routes (Sprint 2) - Admin only
// ============================================================

$router->get('/settings', [TouchBase\Controllers\SettingsController::class, 'page']);
$router->post('/settings', [TouchBase\Controllers\SettingsController::class, 'save']);
$router->post('/api/settings/upload-logo', [TouchBase\Controllers\SettingsController::class, 'uploadLogo']);

// ============================================================
// Analytics Routes (Sprint 2)
// ============================================================

$router->get('/analytics/team', [TouchBase\Controllers\AnalyticsController::class, 'team']);
$router->get('/analytics/player', [TouchBase\Controllers\AnalyticsController::class, 'player']);
$router->get('/api/analytics/team', [TouchBase\Controllers\AnalyticsController::class, 'teamData']);

// ============================================================
// Parent Dashboard Routes (Sprint 2)
// ============================================================

$router->get('/parent', [TouchBase\Controllers\ParentController::class, 'dashboard']);
$router->get('/api/parent/children', [TouchBase\Controllers\ParentController::class, 'children']);
$router->get('/api/parent/upcoming-events', [TouchBase\Controllers\ParentController::class, 'upcomingEvents']);

// ============================================================
// Health Check Endpoint
// ============================================================

$router->get('/api/health', function() {
    return TouchBase\Http\Response::json([
        'status' => 'ok',
        'service' => 'TouchBase API',
        'version' => '1.0.0',
        'environment' => TouchBase\Config::env('APP_ENV', 'development'),
        'database' => TouchBase\Config::databaseDriver(),
        'supabase' => TouchBase\Config::useSupabase() ? 'enabled' : 'disabled',
        'timestamp' => date('c'),
    ]);
});

// ============================================================
// Dispatch and send response
// ============================================================

try {
    $response = $router->dispatch($request);
} catch (Throwable $e) {
    $response = Response::error(
        TouchBase\Config::isDebug() ? $e->getMessage() : __('error.internal_server_error'),
        500
    );
}

$response->send();
