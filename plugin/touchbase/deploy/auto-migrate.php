<?php
/**
 * Auto-migration script for first deployment
 * Can be called via HTTP endpoint or CLI
 *
 * Usage: https://touchbase.sujeto10.com/deploy/auto-migrate.php?secret=YOUR_SECRET
 */

declare(strict_types=1);

// Security check
$requiredSecret = getenv('MIGRATION_SECRET') ?: 'change-me-in-production';
$providedSecret = $_GET['secret'] ?? '';

if ($providedSecret !== $requiredSecret) {
    http_response_code(403);
    die('Forbidden: Invalid secret');
}

// Load environment
require_once __DIR__ . '/../src/Config.php';

use TouchBase\Config;

header('Content-Type: text/plain; charset=utf-8');

echo "TouchBase - Auto Migration\n";
echo str_repeat("=", 50) . "\n\n";

// Connect to database
try {
    $dsn = sprintf(
        'pgsql:host=%s;port=%s;dbname=%s',
        Config::env('DB_HOST'),
        Config::env('DB_PORT', '5432'),
        Config::env('DB_NAME', 'postgres')
    );

    $pdo = new PDO($dsn, Config::env('DB_USER'), Config::env('DB_PASS'), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    echo "✓ Connected to database\n\n";
} catch (PDOException $e) {
    die("✗ Database connection failed: " . $e->getMessage() . "\n");
}

// Get migration files
$migrationsDir = __DIR__ . '/../migrations/postgres';
$files = glob($migrationsDir . '/*.sql');
sort($files);

echo "Found " . count($files) . " migration files\n\n";

// Apply migrations
foreach ($files as $file) {
    $filename = basename($file);
    echo "Applying {$filename}... ";

    try {
        $sql = file_get_contents($file);
        $pdo->exec($sql);
        echo "✓\n";

        // Track migration
        try {
            $stmt = $pdo->prepare("
                INSERT INTO touchbase_migrations (migration_name, batch)
                VALUES (?, 1)
                ON CONFLICT (migration_name) DO NOTHING
            ");
            $stmt->execute([$filename]);
        } catch (PDOException $e) {
            // Ignore if tracking table doesn't exist yet
        }

    } catch (PDOException $e) {
        echo "⚠ (may already exist)\n";
        echo "  Error: " . $e->getMessage() . "\n";
    }
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "✓ Migrations completed\n";
echo "\nYou can now use TouchBase at: " . Config::env('APP_URL') . "\n";
