#!/usr/bin/env php
<?php
/**
 * TouchBase System Health Check
 * Validates deployment configuration and system status
 */

// Define base path constant
define('TOUCHBASE_BASE', dirname(__DIR__));

require_once __DIR__ . '/../vendor/autoload.php';

use TouchBase\Config;
use TouchBase\Database;

// Color output helpers
function success($message) {
    echo "\033[32m✅ $message\033[0m\n";
}

function error($message) {
    echo "\033[31m❌ $message\033[0m\n";
}

function warning($message) {
    echo "\033[33m⚠️  $message\033[0m\n";
}

function info($message) {
    echo "\033[36mℹ️  $message\033[0m\n";
}

echo "\n";
echo "================================\n";
echo "  TouchBase Health Check v1.0  \n";
echo "================================\n\n";

$errors = 0;
$warnings = 0;

// 1. PHP Version Check
info("Checking PHP version...");
$phpVersion = phpversion();
if (version_compare($phpVersion, '8.2.0', '>=')) {
    success("PHP version $phpVersion meets requirements");
} else {
    error("PHP version $phpVersion is below required 8.2.0");
    $errors++;
}

// 2. Required PHP Extensions
info("\nChecking PHP extensions...");
$requiredExtensions = ['pdo', 'pdo_mysql', 'mbstring', 'json', 'curl'];
foreach ($requiredExtensions as $ext) {
    if (extension_loaded($ext)) {
        success("Extension '$ext' is loaded");
    } else {
        error("Missing required extension: $ext");
        $errors++;
    }
}

// 3. Environment Configuration
info("\nChecking environment configuration...");
if (file_exists(__DIR__ . '/../.env')) {
    success(".env file exists");

    // Check critical env variables
    $criticalVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'BASE_PATH'];
    foreach ($criticalVars as $var) {
        $value = Config::env($var);
        if (!empty($value)) {
            success("$var is configured");
        } else {
            error("$var is not set in .env");
            $errors++;
        }
    }
} else {
    warning(".env file not found - using defaults");
    $warnings++;
}

// 4. Database Connection
info("\nChecking database connection...");
try {
    $pdo = Database::pdo();

    // Test query
    $result = $pdo->query("SELECT 1")->fetch();
    if ($result) {
        success("Database connection successful");

        // Check for migrations table
        $tables = $pdo->query("SHOW TABLES LIKE 'tb_migrations'")->fetch();
        if ($tables) {
            success("Migrations table exists");

            // Check migration status
            $count = $pdo->query("SELECT COUNT(*) FROM tb_migrations")->fetchColumn();
            info("Found $count executed migrations");
        } else {
            warning("Migrations table not found - run migrations");
            $warnings++;
        }
    }
} catch (Exception $e) {
    error("Database connection failed: " . $e->getMessage());
    $errors++;
}

// 5. Directory Permissions
info("\nChecking directory permissions...");
$writableDirs = ['logs', 'cache', 'public'];
foreach ($writableDirs as $dir) {
    $path = __DIR__ . '/../' . $dir;
    if (!is_dir($path)) {
        mkdir($path, 0755, true);
        warning("Created missing directory: $dir");
        $warnings++;
    }

    if (is_writable($path)) {
        success("Directory '$dir' is writable");
    } else {
        error("Directory '$dir' is not writable");
        $errors++;
    }
}

// 6. Composer Dependencies
info("\nChecking Composer dependencies...");
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    success("Composer autoload exists");

    // Check if dev dependencies are installed
    if (file_exists(__DIR__ . '/../vendor/bin/phpunit')) {
        info("Development dependencies installed");
    } else {
        info("Production mode - dev dependencies not installed");
    }
} else {
    error("Composer dependencies not installed");
    $errors++;
}

// 7. Web Server Configuration
info("\nChecking web server configuration...");
if (PHP_SAPI === 'cli') {
    info("Running in CLI mode");
} else {
    // Check for mod_rewrite or nginx
    if (function_exists('apache_get_modules')) {
        $modules = apache_get_modules();
        if (in_array('mod_rewrite', $modules)) {
            success("Apache mod_rewrite enabled");
        } else {
            warning("Apache mod_rewrite not detected");
            $warnings++;
        }
    } else {
        info("Non-Apache server detected");
    }
}

// 8. API Endpoints Test
info("\nChecking API endpoints...");
$baseUrl = Config::env('BASE_URL', 'http://localhost/touchbase');
$endpoints = [
    '/api/health' => 'Health endpoint',
    '/api/teams' => 'Teams endpoint',
    '/api/schedule' => 'Schedule endpoint'
];

foreach ($endpoints as $endpoint => $description) {
    $url = $baseUrl . $endpoint;

    // Use file_get_contents with context for simple GET
    $context = stream_context_create([
        'http' => [
            'timeout' => 5,
            'ignore_errors' => true
        ]
    ]);

    $response = @file_get_contents($url, false, $context);
    $httpCode = null;

    if (isset($http_response_header[0])) {
        preg_match('/\d{3}/', $http_response_header[0], $matches);
        $httpCode = $matches[0] ?? null;
    }

    if ($httpCode == '200') {
        success("$description responds with 200 OK");
    } elseif ($httpCode == '404') {
        warning("$description returns 404 - endpoint may not exist");
        $warnings++;
    } else {
        info("$description status: " . ($httpCode ?: 'unknown'));
    }
}

// 9. Security Checks
info("\nPerforming security checks...");
if (Config::isDebug() && Config::env('APP_ENV') === 'production') {
    error("Debug mode is enabled in production!");
    $errors++;
} else {
    success("Debug mode configuration is appropriate");
}

// Check for exposed sensitive files
$sensitiveFiles = ['.env', 'composer.json', 'phpunit.xml'];
foreach ($sensitiveFiles as $file) {
    $testUrl = $baseUrl . '/' . $file;
    $response = @file_get_contents($testUrl, false, $context);

    if ($response !== false && strpos($http_response_header[0], '200') !== false) {
        error("Sensitive file '$file' is publicly accessible!");
        $errors++;
    } else {
        success("File '$file' is protected from web access");
    }
}

// 10. Summary
echo "\n";
echo "================================\n";
echo "         HEALTH CHECK SUMMARY   \n";
echo "================================\n\n";

if ($errors === 0 && $warnings === 0) {
    success("System is healthy and ready for deployment! 🎉");
    exit(0);
} elseif ($errors === 0) {
    warning("System is operational with $warnings warning(s)");
    exit(0);
} else {
    error("System has $errors error(s) and $warnings warning(s)");
    echo "\nPlease fix the errors before deploying to production.\n";
    exit(1);
}