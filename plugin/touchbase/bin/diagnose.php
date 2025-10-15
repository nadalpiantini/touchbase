#!/usr/bin/env php
<?php
declare(strict_types=1);

/**
 * TouchBase Diagnostic Tool
 *
 * Verifies installation integrity and provides repair options
 *
 * Usage: php bin/diagnose.php [--fix] [--verbose]
 */

define('TOUCHBASE_BASE', dirname(__DIR__));

// ANSI color codes for terminal output
const COLOR_RED = "\033[31m";
const COLOR_GREEN = "\033[32m";
const COLOR_YELLOW = "\033[33m";
const COLOR_BLUE = "\033[34m";
const COLOR_RESET = "\033[0m";

class Diagnostics
{
    private array $issues = [];
    private array $warnings = [];
    private array $successes = [];
    private bool $verbose = false;
    private bool $autoFix = false;

    public function __construct(bool $verbose = false, bool $autoFix = false)
    {
        $this->verbose = $verbose;
        $this->autoFix = $autoFix;
    }

    public function run(): int
    {
        $this->printHeader();

        $this->checkFileStructure();
        $this->checkEnvironment();
        $this->checkDatabase();
        $this->checkPermissions();
        $this->checkWebServer();

        $this->printReport();

        return count($this->issues) === 0 ? 0 : 1;
    }

    private function checkFileStructure(): void
    {
        $this->section("File Structure");

        $requiredFiles = [
            'public/index.php',
            'src/bootstrap.php',
            'src/Config.php',
            'src/Database.php',
            'src/Router.php',
            'src/I18n.php',
            'src/Http/Request.php',
            'src/Http/Response.php',
            'src/Middleware/Auth.php',
            'src/Controllers/TeamController.php',
            'src/Controllers/RosterController.php',
            'src/Controllers/ScheduleController.php',
            'src/Controllers/AttendanceController.php',
            'src/Controllers/StatsController.php',
            '.env',
        ];

        foreach ($requiredFiles as $file) {
            $path = PELOTA_BASE . '/' . $file;
            if (file_exists($path)) {
                $this->success("✓ $file exists");
            } else {
                $this->error("✗ $file is missing");
            }
        }

        // Check migrations
        $migrations = glob(PELOTA_BASE . '/migrations/*.sql');
        if (count($migrations) > 0) {
            $this->success("✓ Found " . count($migrations) . " migration files");
        } else {
            $this->error("✗ No migration files found");
        }
    }

    private function checkEnvironment(): void
    {
        $this->section("Environment Configuration");

        $envFile = PELOTA_BASE . '/.env';

        if (!file_exists($envFile)) {
            $this->error("✗ .env file not found");

            if ($this->autoFix && file_exists(PELOTA_BASE . '/.env.example')) {
                copy(PELOTA_BASE . '/.env.example', $envFile);
                $this->success("✓ Created .env from .env.example");
            }
            return;
        }

        // Load and validate .env
        $env = $this->parseEnvFile($envFile);

        $requiredKeys = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'BASE_PATH'];
        foreach ($requiredKeys as $key) {
            if (isset($env[$key]) && !empty($env[$key])) {
                $this->success("✓ $key is set");
            } else {
                $this->error("✗ $key is missing or empty in .env");
            }
        }

        // Check APP_KEY
        if (isset($env['APP_KEY']) && strlen($env['APP_KEY']) >= 32) {
            $this->success("✓ APP_KEY is set");
        } else {
            $this->warning("⚠ APP_KEY should be at least 32 characters");
        }
    }

    private function checkDatabase(): void
    {
        $this->section("Database Connection");

        require_once TOUCHBASE_BASE . '/src/Config.php';

        try {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                TouchBase\Config::env('DB_HOST', 'db'),
                TouchBase\Config::env('DB_PORT', '3306'),
                TouchBase\Config::env('DB_NAME', 'chamilo')
            );

            $pdo = new PDO(
                $dsn,
                TouchBase\Config::env('DB_USER', 'chamilo'),
                TouchBase\Config::env('DB_PASS', 'chamilo'),
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );

            $this->success("✓ Database connection successful");

            // Check if tables exist
            $tables = [
                'touchbase_clubs',
                'touchbase_seasons',
                'touchbase_teams',
                'touchbase_roster',
                'touchbase_schedule',
                'touchbase_attendance',
                'touchbase_stats',
            ];

            foreach ($tables as $table) {
                $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
                if ($stmt->rowCount() > 0) {
                    $this->success("✓ Table $table exists");
                } else {
                    $this->error("✗ Table $table is missing");
                }
            }

        } catch (PDOException $e) {
            $this->error("✗ Database connection failed: " . $e->getMessage());
        }
    }

    private function checkPermissions(): void
    {
        $this->section("File Permissions");

        $writableDirs = [
            'public',
            'views',
        ];

        foreach ($writableDirs as $dir) {
            $path = PELOTA_BASE . '/' . $dir;
            if (is_writable($path)) {
                $this->success("✓ $dir is writable");
            } else {
                $this->warning("⚠ $dir is not writable");
            }
        }
    }

    private function checkWebServer(): void
    {
        $this->section("Web Server Configuration");

        // Check if running via web server
        if (php_sapi_name() === 'cli') {
            $this->info("ℹ Running in CLI mode - web server checks skipped");
            return;
        }

        // Basic checks
        $this->success("✓ PHP version: " . PHP_VERSION);

        $requiredExtensions = ['pdo', 'pdo_mysql', 'mbstring', 'json'];
        foreach ($requiredExtensions as $ext) {
            if (extension_loaded($ext)) {
                $this->success("✓ Extension $ext loaded");
            } else {
                $this->error("✗ Extension $ext not loaded");
            }
        }
    }

    private function parseEnvFile(string $file): array
    {
        $env = [];
        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach ($lines as $line) {
            $line = trim($line);
            if (str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }

            [$key, $value] = array_pad(explode('=', $line, 2), 2, '');
            $env[trim($key)] = trim($value);
        }

        return $env;
    }

    private function section(string $title): void
    {
        echo "\n" . COLOR_BLUE . "━━━ $title " . str_repeat("━", 60 - strlen($title)) . COLOR_RESET . "\n\n";
    }

    private function success(string $message): void
    {
        $this->successes[] = $message;
        echo COLOR_GREEN . $message . COLOR_RESET . "\n";
    }

    private function error(string $message): void
    {
        $this->issues[] = $message;
        echo COLOR_RED . $message . COLOR_RESET . "\n";
    }

    private function warning(string $message): void
    {
        $this->warnings[] = $message;
        echo COLOR_YELLOW . $message . COLOR_RESET . "\n";
    }

    private function info(string $message): void
    {
        echo COLOR_BLUE . $message . COLOR_RESET . "\n";
    }

    private function printHeader(): void
    {
        echo "\n";
        echo COLOR_BLUE . "╔═══════════════════════════════════════════════════════════════╗\n";
        echo "║            TouchBase Diagnostic Tool v1.0                    ║\n";
        echo "╚═══════════════════════════════════════════════════════════════╝" . COLOR_RESET . "\n";
    }

    private function printReport(): void
    {
        echo "\n" . COLOR_BLUE . "━━━ Summary " . str_repeat("━", 60) . COLOR_RESET . "\n\n";

        echo COLOR_GREEN . "✓ Successes: " . count($this->successes) . COLOR_RESET . "\n";
        echo COLOR_YELLOW . "⚠ Warnings:  " . count($this->warnings) . COLOR_RESET . "\n";
        echo COLOR_RED . "✗ Errors:    " . count($this->issues) . COLOR_RESET . "\n";

        if (count($this->issues) > 0) {
            echo "\n" . COLOR_RED . "Critical issues found. Please fix the errors above." . COLOR_RESET . "\n";
        } else if (count($this->warnings) > 0) {
            echo "\n" . COLOR_YELLOW . "Installation is functional but has warnings." . COLOR_RESET . "\n";
        } else {
            echo "\n" . COLOR_GREEN . "✓ All checks passed! TouchBase is ready to use." . COLOR_RESET . "\n";
        }

        echo "\n";
    }
}

// Parse command line arguments
$verbose = in_array('--verbose', $argv);
$autoFix = in_array('--fix', $argv);

$diagnostics = new Diagnostics($verbose, $autoFix);
exit($diagnostics->run());
