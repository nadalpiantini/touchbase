<?php
declare(strict_types=1);

namespace TouchBase\Database;

use TouchBase\Database;
use PDO;

/**
 * Database Migration Manager
 * Handles running and tracking database schema migrations
 */
final class Migrator
{
    private string $migrationsPath;
    private PDO $pdo;

    public function __construct(?string $migrationsPath = null)
    {
        $this->migrationsPath = $migrationsPath ?? TOUCHBASE_BASE . '/migrations';
        $this->pdo = Database::pdo();
        
        $this->ensureMigrationsTableExists();
    }

    /**
     * Ensure the migrations tracking table exists
     */
    private function ensureMigrationsTableExists(): void
    {
        $sql = file_get_contents($this->migrationsPath . '/000_migrations_table.sql');
        if ($sql === false) {
            throw new \RuntimeException('Cannot read migrations table SQL file');
        }

        // Extract just the CREATE TABLE statement (remove comments)
        $lines = explode("\n", $sql);
        $cleanSql = '';
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line && !str_starts_with($line, '--')) {
                $cleanSql .= $line . "\n";
            }
        }

        $this->pdo->exec($cleanSql);
    }

    /**
     * Run all pending migrations
     *
     * @param bool $dryRun If true, only show what would be migrated
     * @return array<string, mixed> Migration results
     */
    public function migrate(bool $dryRun = false): array
    {
        $pending = $this->getPendingMigrations();

        if (empty($pending)) {
            return [
                'status' => 'success',
                'message' => 'No pending migrations',
                'migrated' => [],
            ];
        }

        if ($dryRun) {
            return [
                'status' => 'dry_run',
                'message' => 'Pending migrations (dry run)',
                'pending' => $pending,
            ];
        }

        $batch = $this->getNextBatchNumber();
        $migrated = [];
        $errors = [];

        foreach ($pending as $migration) {
            try {
                $startTime = microtime(true);
                
                $this->runMigration($migration, $batch);
                
                $executionTime = (int) ((microtime(true) - $startTime) * 1000);
                
                $migrated[] = [
                    'migration' => $migration,
                    'execution_time_ms' => $executionTime,
                    'status' => 'success',
                ];
            } catch (\Exception $e) {
                $errors[] = [
                    'migration' => $migration,
                    'error' => $e->getMessage(),
                ];
                
                // Record failure
                $this->recordMigration($migration, $batch, 'failed', $e->getMessage());
                
                // Stop on first error
                break;
            }
        }

        return [
            'status' => empty($errors) ? 'success' : 'partial',
            'message' => empty($errors) 
                ? 'All migrations completed successfully' 
                : 'Some migrations failed',
            'migrated' => $migrated,
            'errors' => $errors,
            'batch' => $batch,
        ];
    }

    /**
     * Rollback the last batch of migrations
     *
     * @return array<string, mixed> Rollback results
     */
    public function rollback(): array
    {
        $lastBatch = $this->getLastBatchNumber();

        if ($lastBatch === 0) {
            return [
                'status' => 'success',
                'message' => 'Nothing to rollback',
                'rolled_back' => [],
            ];
        }

        $migrations = $this->getMigrationsByBatch($lastBatch);
        $rolledBack = [];

        // Rollback in reverse order
        foreach (array_reverse($migrations) as $migration) {
            $this->markAsRolledBack($migration);
            $rolledBack[] = $migration;
        }

        return [
            'status' => 'success',
            'message' => 'Rolled back batch ' . $lastBatch,
            'rolled_back' => $rolledBack,
            'batch' => $lastBatch,
        ];
    }

    /**
     * Get migration status
     *
     * @return array<string, mixed>
     */
    public function status(): array
    {
        $all = $this->getAllMigrationFiles();
        $applied = $this->getAppliedMigrations();
        $pending = array_diff($all, $applied);

        return [
            'total' => count($all),
            'applied' => count($applied),
            'pending' => count($pending),
            'migrations' => array_map(function($migration) use ($applied) {
                return [
                    'name' => $migration,
                    'status' => in_array($migration, $applied) ? 'applied' : 'pending',
                ];
            }, $all),
        ];
    }

    /**
     * Run a single migration file
     *
     * @param string $migration Migration filename
     * @param int $batch Batch number
     */
    private function runMigration(string $migration, int $batch): void
    {
        $filePath = $this->migrationsPath . '/' . $migration;
        
        if (!file_exists($filePath)) {
            throw new \RuntimeException("Migration file not found: {$migration}");
        }

        $sql = file_get_contents($filePath);
        if ($sql === false) {
            throw new \RuntimeException("Cannot read migration file: {$migration}");
        }

        // Calculate checksum
        $checksum = hash('sha256', $sql);

        // Mark as running
        $this->recordMigration($migration, $batch, 'running', null, $checksum);

        try {
            // Execute migration SQL
            $this->pdo->exec($sql);
            
            // Mark as completed
            $this->recordMigration($migration, $batch, 'completed', null, $checksum);
        } catch (\Exception $e) {
            // Mark as failed
            $this->recordMigration($migration, $batch, 'failed', $e->getMessage(), $checksum);
            throw $e;
        }
    }

    /**
     * Record migration in tracking table
     *
     * @param string $migration Migration filename
     * @param int $batch Batch number
     * @param string $status Status
     * @param string|null $error Error message
     * @param string|null $checksum File checksum
     */
    private function recordMigration(
        string $migration, 
        int $batch, 
        string $status, 
        ?string $error = null,
        ?string $checksum = null
    ): void {
        $stmt = $this->pdo->prepare(
            'INSERT INTO touchbase_migrations (migration, batch, status, error_message, checksum)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                status = VALUES(status),
                error_message = VALUES(error_message),
                checksum = VALUES(checksum)'
        );

        $stmt->execute([$migration, $batch, $status, $error, $checksum]);
    }

    /**
     * Mark migration as rolled back
     *
     * @param string $migration Migration filename
     */
    private function markAsRolledBack(string $migration): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE touchbase_migrations 
             SET status = "rolled_back" 
             WHERE migration = ?'
        );

        $stmt->execute([$migration]);
    }

    /**
     * Get all migration files
     *
     * @return array<string>
     */
    private function getAllMigrationFiles(): array
    {
        $files = glob($this->migrationsPath . '/*.sql');
        if ($files === false) {
            return [];
        }

        $migrations = array_map('basename', $files);
        sort($migrations);

        return $migrations;
    }

    /**
     * Get applied migrations
     *
     * @return array<string>
     */
    private function getAppliedMigrations(): array
    {
        $stmt = $this->pdo->query(
            'SELECT migration FROM touchbase_migrations 
             WHERE status = "completed" 
             ORDER BY migration'
        );

        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Get pending migrations
     *
     * @return array<string>
     */
    private function getPendingMigrations(): array
    {
        $all = $this->getAllMigrationFiles();
        $applied = $this->getAppliedMigrations();

        return array_values(array_diff($all, $applied));
    }

    /**
     * Get migrations by batch number
     *
     * @param int $batch Batch number
     * @return array<string>
     */
    private function getMigrationsByBatch(int $batch): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT migration FROM touchbase_migrations 
             WHERE batch = ? AND status = "completed" 
             ORDER BY migration'
        );

        $stmt->execute([$batch]);

        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Get next batch number
     *
     * @return int
     */
    private function getNextBatchNumber(): int
    {
        $stmt = $this->pdo->query(
            'SELECT COALESCE(MAX(batch), 0) + 1 FROM touchbase_migrations'
        );

        return (int) $stmt->fetchColumn();
    }

    /**
     * Get last batch number
     *
     * @return int
     */
    private function getLastBatchNumber(): int
    {
        $stmt = $this->pdo->query(
            'SELECT COALESCE(MAX(batch), 0) FROM touchbase_migrations WHERE status = "completed"'
        );

        return (int) $stmt->fetchColumn();
    }

    /**
     * Reset all migrations (DANGEROUS - for testing only)
     *
     * @return void
     */
    public function reset(): void
    {
        $this->pdo->exec('DELETE FROM touchbase_migrations');
    }
}
