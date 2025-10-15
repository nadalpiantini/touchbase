<?php
/**
 * Migration Runner for Sprint 2
 * Quick script to execute Sprint 2 migrations
 */

declare(strict_types=1);

require_once __DIR__ . '/src/bootstrap.php';

use TouchBase\Database\Migrator;
use TouchBase\Database;

echo "🚀 TouchBase Sprint 2 - Migration Runner\n";
echo "==========================================\n\n";

try {
    $migrator = new Migrator();

    // Check current migration status
    echo "📊 Current Migration Status:\n";
    $status = $migrator->status();
    echo "   Total migrations: {$status['total']}\n";
    echo "   Applied: {$status['applied']}\n";
    echo "   Pending: {$status['pending']}\n\n";

    // Run all pending migrations
    echo "🚀 Running pending migrations...\n\n";
    $result = $migrator->migrate();

    if ($result['status'] === 'success') {
        if (empty($result['migrated'])) {
            echo "   ✅ No pending migrations\n\n";
        } else {
            foreach ($result['migrated'] as $migration) {
                echo "   ✅ {$migration['migration']} ({$migration['execution_time_ms']}ms)\n";
            }
            echo "\n";
        }
    } else {
        echo "   ⚠️  Some migrations failed:\n";
        foreach ($result['errors'] ?? [] as $error) {
            echo "   ❌ {$error['migration']}: {$error['error']}\n";
        }
        echo "\n";
    }

    // Verify tables were created
    echo "🔍 Verifying tables...\n";
    $tables = [
        'touchbase_tenants',
        'touchbase_email_queue',
        'touchbase_billing_transactions',
        'touchbase_billing_config',
    ];

    $pdo = Database::pdo();
    foreach ($tables as $table) {
        $result = $pdo->query("SHOW TABLES LIKE '{$table}'")->fetch();
        if ($result) {
            echo "   ✅ {$table}\n";
        } else {
            echo "   ❌ {$table} not found\n";
        }
    }

    echo "\n✅ Sprint 2 migrations complete!\n";
    echo "\nNext steps:\n";
    echo "1. Visit http://localhost/pelota/ai/assistant\n";
    echo "2. Test API endpoints\n";
    echo "3. Configure AWS/Stripe credentials (optional)\n";

} catch (Exception $e) {
    echo "\n❌ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
