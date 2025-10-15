#!/usr/bin/env php
<?php
declare(strict_types=1);

/**
 * TouchBase - Apply PostgreSQL Migrations to Supabase
 * Alternative to bash script when psql is not available
 */

// Colors for terminal output
const C_RED = "\033[31m";
const C_GREEN = "\033[32m";
const C_YELLOW = "\033[33m";
const C_BLUE = "\033[34m";
const C_RESET = "\033[0m";

function colorize(string $text, string $color): string {
    return $color . $text . C_RESET;
}

echo "\n";
echo colorize("╔═══════════════════════════════════════════════════════════════╗", C_BLUE) . "\n";
echo colorize("║         TouchBase - Supabase Migration Tool (PHP)            ║", C_BLUE) . "\n";
echo colorize("╚═══════════════════════════════════════════════════════════════╝", C_BLUE) . "\n";
echo "\n";

// Load environment from .env.production
$projectRoot = dirname(__DIR__);
$envFile = $projectRoot . '/.env.production';

if (!file_exists($envFile)) {
    echo colorize("✗ .env.production not found!", C_RED) . "\n";
    echo colorize("  Create it from .env.example", C_YELLOW) . "\n";
    exit(1);
}

// Parse .env file
$env = [];
foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    $line = trim($line);
    if (str_starts_with($line, '#') || !str_contains($line, '=')) {
        continue;
    }
    [$key, $value] = array_pad(explode('=', $line, 2), 2, '');
    $env[trim($key)] = trim($value);
}

// Extract DB credentials
$dbHost = $env['DB_HOST'] ?? 'db.nqzhxukuvmdlpewqytpv.supabase.co';
$dbPort = $env['DB_PORT'] ?? '5432';
$dbName = $env['DB_NAME'] ?? 'postgres';
$dbUser = $env['DB_USER'] ?? 'postgres';
$dbPass = $env['DB_PASS'] ?? '';

echo colorize("[1/5]", C_BLUE) . " Verifying Supabase connection...\n";

// Test connection
try {
    $dsn = "pgsql:host={$dbHost};port={$dbPort};dbname={$dbName}";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Test query
    $pdo->query("SELECT 1");

    echo colorize("✓", C_GREEN) . " Connected to Supabase PostgreSQL\n";
    echo "  Host: {$dbHost}\n";
    echo "  Database: {$dbName}\n";
} catch (PDOException $e) {
    echo colorize("✗", C_RED) . " Cannot connect to Supabase\n";
    echo colorize("  Error: " . $e->getMessage(), C_RED) . "\n";
    echo "\n";
    echo colorize("ℹ️  To get the correct database password:", C_YELLOW) . "\n";
    echo "  1. Go to https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv\n";
    echo "  2. Settings → Database → Connection String\n";
    echo "  3. Copy the password and update DB_PASS in .env.production\n";
    echo "\n";
    exit(1);
}

echo "\n" . colorize("[2/5]", C_BLUE) . " Checking migrations directory...\n";

$migrationsDir = $projectRoot . '/migrations/postgres';

if (!is_dir($migrationsDir)) {
    echo colorize("✗", C_RED) . " Migrations directory not found: {$migrationsDir}\n";
    exit(1);
}

$migrationFiles = glob($migrationsDir . '/*.sql');
sort($migrationFiles);

$migrationCount = count($migrationFiles);
echo colorize("✓", C_GREEN) . " Found {$migrationCount} migration files\n";

echo "\n" . colorize("[3/5]", C_BLUE) . " Applying migrations...\n";

$appliedCount = 0;
$skippedCount = 0;

foreach ($migrationFiles as $migrationFile) {
    $filename = basename($migrationFile);
    echo "  " . colorize("→", C_BLUE) . " Applying {$filename}...\n";

    try {
        // Read migration file
        $sql = file_get_contents($migrationFile);

        // Execute migration
        $pdo->exec($sql);

        echo "    " . colorize("✓", C_GREEN) . " {$filename} applied successfully\n";
        $appliedCount++;

        // Record migration in tracking table (if table exists)
        try {
            $stmt = $pdo->prepare("
                INSERT INTO touchbase_migrations (migration_name, batch)
                VALUES (:name, 1)
                ON CONFLICT (migration_name) DO NOTHING
            ");
            $stmt->execute(['name' => $filename]);
        } catch (PDOException $e) {
            // Ignore if migrations table doesn't exist yet
        }

    } catch (PDOException $e) {
        echo "    " . colorize("⚠", C_YELLOW) . " {$filename} may already be applied or failed\n";
        echo "    Error: " . $e->getMessage() . "\n";
        $skippedCount++;
    }
}

echo "\n" . colorize("✓", C_GREEN) . " Migrations completed:\n";
echo "  " . colorize("Applied: {$appliedCount}", C_GREEN) . "\n";
if ($skippedCount > 0) {
    echo "  " . colorize("Skipped/Failed: {$skippedCount}", C_YELLOW) . "\n";
}

echo "\n" . colorize("[4/5]", C_BLUE) . " Verifying tables...\n";

$tablesToCheck = [
    'touchbase_migrations',
    'touchbase_clubs',
    'touchbase_seasons',
    'touchbase_teams',
    'touchbase_roster',
    'touchbase_schedule',
    'touchbase_attendance',
    'touchbase_stats',
    'touchbase_tenants',
    'touchbase_tournaments',
    'touchbase_matches',
];

$missingTables = 0;

foreach ($tablesToCheck as $table) {
    try {
        $stmt = $pdo->query("SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = '{$table}'
        )");
        $exists = $stmt->fetchColumn();

        if ($exists === 't' || $exists === true || $exists === 1) {
            echo "  " . colorize("✓", C_GREEN) . " {$table} exists\n";
        } else {
            echo "  " . colorize("✗", C_RED) . " {$table} is missing\n";
            $missingTables++;
        }
    } catch (PDOException $e) {
        echo "  " . colorize("✗", C_RED) . " {$table} check failed\n";
        $missingTables++;
    }
}

if ($missingTables > 0) {
    echo "\n" . colorize("✗", C_RED) . " {$missingTables} tables are missing!\n";
    echo colorize("  Review migration output for errors", C_YELLOW) . "\n";
    exit(1);
}

echo "\n" . colorize("[5/5]", C_BLUE) . " Verifying SUJETO10 tenant...\n";

try {
    $stmt = $pdo->query("SELECT COUNT(*) FROM touchbase_tenants WHERE code = 'sujeto10'");
    $count = $stmt->fetchColumn();

    if ($count == 0) {
        echo "  " . colorize("⚠", C_YELLOW) . " SUJETO10 tenant not found, creating...\n";

        $pdo->exec("
            INSERT INTO touchbase_tenants (
                code, name, color_primary, color_secondary, color_accent, color_danger,
                theme_mode, website_url, email, timezone, locale, features_enabled, is_active
            ) VALUES (
                'sujeto10', 'SUJETO10',
                '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444',
                'dark', 'https://touchbase.sujeto10.com', 'info@sujeto10.com',
                'America/Santo_Domingo', 'es_DO',
                '{\"tournaments\": true, \"notifications\": true, \"payments\": true, \"ai_assistant\": true}'::jsonb,
                TRUE
            )
            ON CONFLICT (code) DO UPDATE SET
                features_enabled = EXCLUDED.features_enabled,
                updated_at = CURRENT_TIMESTAMP
        ");

        echo "  " . colorize("✓", C_GREEN) . " SUJETO10 tenant created\n";
    } else {
        echo "  " . colorize("✓", C_GREEN) . " SUJETO10 tenant already exists\n";
    }

    // Show tenant details
    $stmt = $pdo->query("SELECT code, name, color_primary, features_enabled FROM touchbase_tenants WHERE code = 'sujeto10'");
    $tenant = $stmt->fetch();

    if ($tenant) {
        echo "\n  Tenant Details:\n";
        echo "    Code: " . $tenant['code'] . "\n";
        echo "    Name: " . $tenant['name'] . "\n";
        echo "    Primary Color: " . $tenant['color_primary'] . "\n";
        echo "    Features: " . $tenant['features_enabled'] . "\n";
    }

} catch (PDOException $e) {
    echo "  " . colorize("✗", C_RED) . " Failed to verify/create SUJETO10 tenant\n";
    echo "  Error: " . $e->getMessage() . "\n";
}

echo "\n";
echo colorize("╔═══════════════════════════════════════════════════════════════╗", C_GREEN) . "\n";
echo colorize("║              Migration Completed Successfully                 ║", C_GREEN) . "\n";
echo colorize("╚═══════════════════════════════════════════════════════════════╝", C_GREEN) . "\n";
echo "\n";
echo colorize("Next steps:", C_BLUE) . "\n";
echo "  1. Deploy application to Vercel: " . colorize("vercel --prod", C_YELLOW) . "\n";
echo "  2. Configure domain: " . colorize("touchbase.sujeto10.com", C_YELLOW) . "\n";
echo "  3. Test endpoints: " . colorize("https://touchbase.sujeto10.com/api/health", C_YELLOW) . "\n";
echo "\n";
