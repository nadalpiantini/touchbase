<?php
declare(strict_types=1);

namespace TouchBase;

/**
 * Configuration manager with environment variable support
 */
final class Config
{
    private static bool $loaded = false;

    /**
     * Get environment variable with optional default value
     *
     * @param string $key Environment variable key
     * @param string|null $default Default value if key not found
     * @return string|null
     */
    public static function env(string $key, ?string $default = null): ?string
    {
        if (!self::$loaded && file_exists(TOUCHBASE_BASE . '/.env')) {
            self::loadEnvFile();
        }

        return $_ENV[$key] ?? $default;
    }

    /**
     * Load .env file into $_ENV
     */
    private static function loadEnvFile(): void
    {
        $lines = file(TOUCHBASE_BASE . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach ($lines as $line) {
            $line = trim($line);

            // Skip comments
            if (str_starts_with($line, '#')) {
                continue;
            }

            // Parse key=value
            if (str_contains($line, '=')) {
                [$key, $value] = array_pad(explode('=', $line, 2), 2, '');
                $_ENV[trim($key)] = trim($value);
            }
        }

        self::$loaded = true;
    }

    /**
     * Get supported languages array
     *
     * @return array<string>
     */
    public static function supportedLanguages(): array
    {
        $langs = self::env('SUPPORTED_LANGS', 'en,es');
        return array_filter(array_map('trim', explode(',', $langs)));
    }

    /**
     * Check if debug mode is enabled
     *
     * @return bool
     */
    public static function isDebug(): bool
    {
        return self::env('DEBUG', 'false') === 'true';
    }

    /**
     * Check if running in production mode
     *
     * @return bool
     */
    public static function isProduction(): bool
    {
        return self::env('APP_ENV', 'development') === 'production';
    }

    /**
     * Get database driver (mysql or pgsql)
     *
     * @return string
     */
    public static function databaseDriver(): string
    {
        return self::env('DB_DRIVER', 'mysql');
    }

    /**
     * Check if using Supabase
     *
     * @return bool
     */
    public static function useSupabase(): bool
    {
        return !empty(self::env('SUPABASE_URL'));
    }
}

// Define global constants
define('BASE_PATH', Config::env('BASE_PATH', '/touchbase'));
define('DEFAULT_LANG', Config::env('DEFAULT_LANG', 'en'));

// Supabase constants
define('SUPABASE_URL', Config::env('SUPABASE_URL', ''));
define('SUPABASE_ANON_KEY', Config::env('SUPABASE_ANON_KEY', ''));
define('SUPABASE_SERVICE_KEY', Config::env('SUPABASE_SERVICE_KEY', ''));
define('SUPABASE_PROJECT_ID', Config::env('SUPABASE_PROJECT_ID', ''));
