<?php
declare(strict_types=1);

namespace TouchBase;

use PDO;
use PDOException;

/**
 * Database connection manager (singleton pattern)
 */
final class Database
{
    private static ?PDO $pdo = null;

    /**
     * Get PDO instance (creates connection on first call)
     * Supports both MySQL and PostgreSQL (Supabase)
     *
     * @return PDO
     * @throws PDOException
     */
    public static function pdo(): PDO
    {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        $driver = Config::databaseDriver();
        $host = Config::env('DB_HOST', 'db');
        $port = Config::env('DB_PORT', $driver === 'pgsql' ? '5432' : '3306');
        $dbname = Config::env('DB_NAME', $driver === 'pgsql' ? 'postgres' : 'chamilo');
        $user = Config::env('DB_USER', $driver === 'pgsql' ? 'postgres' : 'chamilo');
        $pass = Config::env('DB_PASS', '');

        // Build DSN based on driver
        if ($driver === 'pgsql') {
            $dsn = sprintf(
                'pgsql:host=%s;port=%s;dbname=%s;options=\'--client_encoding=UTF8\'',
                $host,
                $port,
                $dbname
            );
        } else {
            // MySQL/MariaDB
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                $host,
                $port,
                $dbname
            );
        }

        self::$pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);

        // Ensure UTF-8 encoding for MySQL
        if ($driver === 'mysql') {
            self::$pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
        }

        return self::$pdo;
    }

    /**
     * Execute a query and return all rows
     *
     * @param string $sql SQL query
     * @param array<mixed> $params Bind parameters
     * @return array<array<string, mixed>>
     */
    public static function fetchAll(string $sql, array $params = []): array
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Execute a query and return single row
     *
     * @param string $sql SQL query
     * @param array<mixed> $params Bind parameters
     * @return array<string, mixed>|false
     */
    public static function fetchOne(string $sql, array $params = []): array|false
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }

    /**
     * Execute an INSERT/UPDATE/DELETE query
     *
     * @param string $sql SQL query
     * @param array<mixed> $params Bind parameters
     * @return int Number of affected rows
     */
    public static function execute(string $sql, array $params = []): int
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    /**
     * Get last insert ID
     *
     * @return string
     */
    public static function lastInsertId(): string
    {
        return self::pdo()->lastInsertId();
    }
}
