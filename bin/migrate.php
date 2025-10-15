#!/usr/bin/env php
<?php
/**
 * TouchBase Database Migration Runner
 * Supports MySQL and PostgreSQL
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/bootstrap.php';

use TouchBase\Database;
use TouchBase\Database\Migrator;

// Parse command line arguments
$options = getopt('', ['driver:', 'host:', 'port:', 'db:', 'user:', 'pass:', 'help']);

if (isset($options['help'])) {
    echo <<<HELP
TouchBase Migration Runner

Usage: php migrate.php [options]

Options:
  --driver=DRIVER    Database driver (mysql|postgres) [default: from .env]
  --host=HOST        Database host [default: from .env]
  --port=PORT        Database port [default: from .env]
  --db=DATABASE      Database name [default: from .env]
  --user=USER        Database user [default: from .env]
  --pass=PASSWORD    Database password [default: from .env]
  --help            Show this help message

Examples:
  php migrate.php
  php migrate.php --driver=postgres
  php migrate.php --host=localhost --db=touchbase_dev

HELP;
    exit(0);
}

try {
    // Get configuration from .env or command line
    $config = [
        'driver' => $options['driver'] ?? $_ENV['DB_DRIVER'] ?? 'mysql',
        'host' => $options['host'] ?? $_ENV['DB_HOST'] ?? 'localhost',
        'port' => $options['port'] ?? $_ENV['DB_PORT'] ?? '3306',
        'database' => $options['db'] ?? $_ENV['DB_NAME'] ?? 'chamilo',
        'username' => $options['user'] ?? $_ENV['DB_USER'] ?? 'root',
        'password' => $options['pass'] ?? $_ENV['DB_PASS'] ?? '',
    ];

    echo "TouchBase Migration Runner\n";
    echo "==========================\n";
    echo "Driver: {$config['driver']}\n";
    echo "Host: {$config['host']}\n";
    echo "Database: {$config['database']}\n\n";

    // Initialize migrator
    $migrator = new Migrator($config);

    // Get migration directory based on driver
    $migrationDir = __DIR__ . '/../migrations';
    if ($config['driver'] === 'postgres' && is_dir($migrationDir . '/postgres')) {
        $migrationDir .= '/postgres';
    }

    echo "Migration directory: $migrationDir\n\n";

    // Run migrations
    $results = $migrator->run($migrationDir);

    // Display results
    if (empty($results['executed'])) {
        echo "✅ All migrations are up to date!\n";
    } else {
        echo "Executed migrations:\n";
        foreach ($results['executed'] as $migration) {
            echo "  ✅ {$migration}\n";
        }
        echo "\n✅ Successfully executed " . count($results['executed']) . " migration(s)\n";
    }

    if (!empty($results['errors'])) {
        echo "\n❌ Errors encountered:\n";
        foreach ($results['errors'] as $error) {
            echo "  ❌ {$error}\n";
        }
        exit(1);
    }

} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}