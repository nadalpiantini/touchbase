<?php
declare(strict_types=1);

namespace TouchBase\Utils;

use TouchBase\Database;

/**
 * Tenant Context Manager
 * Handles multi-tenant branding and configuration
 */
final class Tenant
{
    private static ?array $currentTenant = null;
    private static ?int $currentTenantId = null;

    /**
     * Get current tenant context
     * Priority: session > subdomain > default
     *
     * @return array<string, mixed> Tenant configuration
     */
    public static function current(): array
    {
        if (self::$currentTenant !== null) {
            return self::$currentTenant;
        }

        // Try to get tenant from session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $tenantId = $_SESSION['touchbase_tenant_id'] ?? null;

        // Try to detect tenant from subdomain or URL parameter
        if (!$tenantId) {
            $tenantId = self::detectTenantFromRequest();
        }

        // Load tenant by ID or get default
        if ($tenantId) {
            self::$currentTenant = self::getById((int) $tenantId);
        } else {
            self::$currentTenant = self::getDefault();
        }

        // Cache tenant ID
        self::$currentTenantId = (int) (self::$currentTenant['id'] ?? 0);

        // Store in session for subsequent requests
        if (self::$currentTenantId > 0) {
            $_SESSION['touchbase_tenant_id'] = self::$currentTenantId;
        }

        return self::$currentTenant;
    }

    /**
     * Get tenant by ID
     *
     * @param int $id Tenant ID
     * @return array<string, mixed>|null
     */
    public static function getById(int $id): ?array
    {
        $tenant = Database::fetchOne(
            'SELECT * FROM pelota_tenants WHERE id = ?',
            [$id]
        );

        if (!$tenant) {
            return null;
        }

        return self::enrichTenant($tenant);
    }

    /**
     * Get tenant by code
     *
     * @param string $code Tenant code
     * @return array<string, mixed>|null
     */
    public static function getByCode(string $code): ?array
    {
        $tenant = Database::fetchOne(
            'SELECT * FROM pelota_tenants WHERE code = ?',
            [$code]
        );

        if (!$tenant) {
            return null;
        }

        return self::enrichTenant($tenant);
    }

    /**
     * Get default/fallback tenant
     *
     * @return array<string, mixed>
     */
    public static function getDefault(): array
    {
        // Try to get default tenant first
        $tenant = Database::fetchOne(
            "SELECT * FROM pelota_tenants WHERE code = 'default' ORDER BY id LIMIT 1"
        );

        // If no default, get any tenant
        if (!$tenant) {
            $tenant = Database::fetchOne(
                'SELECT * FROM pelota_tenants ORDER BY id LIMIT 1'
            );
        }

        // Last resort: return hardcoded defaults
        if (!$tenant) {
            return self::getHardcodedDefaults();
        }

        return self::enrichTenant($tenant);
    }

    /**
     * Detect tenant from current request
     * Checks: ?tenant=code parameter, subdomain, header
     *
     * @return int|null Tenant ID if detected
     */
    private static function detectTenantFromRequest(): ?int
    {
        // Check URL parameter
        if (!empty($_GET['tenant'])) {
            $tenant = self::getByCode((string) $_GET['tenant']);
            return $tenant ? (int) $tenant['id'] : null;
        }

        // Check subdomain (e.g., rddominicana.pelotapack.com)
        $host = $_SERVER['HTTP_HOST'] ?? '';
        if (preg_match('/^([a-z0-9-]+)\./', $host, $matches)) {
            $subdomain = $matches[1];
            if ($subdomain !== 'www') {
                $tenant = self::getByCode($subdomain);
                return $tenant ? (int) $tenant['id'] : null;
            }
        }

        // Check custom header (for API calls)
        $tenantHeader = $_SERVER['HTTP_X_TENANT_CODE'] ?? null;
        if ($tenantHeader) {
            $tenant = self::getByCode((string) $tenantHeader);
            return $tenant ? (int) $tenant['id'] : null;
        }

        return null;
    }

    /**
     * Enrich tenant data with parsed JSON and computed values
     *
     * @param array<string, mixed> $tenant Raw tenant from DB
     * @return array<string, mixed>
     */
    private static function enrichTenant(array $tenant): array
    {
        // Map new migration column names to old names for backward compatibility
        $tenant['color_primary'] = $tenant['color1'] ?? '#0ea5e9';
        $tenant['color_secondary'] = $tenant['color2'] ?? '#22c55e';
        $tenant['color_accent'] = $tenant['color3'] ?? '#f59e0b';
        $tenant['color_danger'] = $tenant['color4'] ?? '#ef4444';

        // Ensure theme mode
        $tenant['theme_mode'] = $tenant['theme'] ?? 'dark';

        // Initialize empty features and settings for MVP
        $tenant['features'] = [];
        $tenant['settings_parsed'] = [];

        // Add convenience methods
        $tenant['is_feature_enabled'] = function(string $feature) use ($tenant): bool {
            return !empty($tenant['features'][$feature]);
        };

        return $tenant;
    }

    /**
     * Get hardcoded defaults (fallback when no tenant in DB)
     *
     * @return array<string, mixed>
     */
    private static function getHardcodedDefaults(): array
    {
        return [
            'id' => 0,
            'code' => 'default',
            'name' => 'TouchBase',
            'logo_url' => null,
            'color1' => '#0284c7',
            'color2' => '#16a34a',
            'color3' => '#ea580c',
            'color4' => '#dc2626',
            'color_primary' => '#0284c7',
            'color_secondary' => '#16a34a',
            'color_accent' => '#ea580c',
            'color_danger' => '#dc2626',
            'theme' => 'dark',
            'theme_mode' => 'dark',
            'features' => [],
            'settings_parsed' => [],
            'is_feature_enabled' => fn(string $feature) => false,
        ];
    }

    /**
     * Set current tenant (for testing or manual override)
     *
     * @param int $tenantId Tenant ID
     * @return void
     */
    public static function set(int $tenantId): void
    {
        self::$currentTenantId = $tenantId;
        self::$currentTenant = null; // Force reload
        $_SESSION['touchbase_tenant_id'] = $tenantId;
    }

    /**
     * Clear current tenant context
     *
     * @return void
     */
    public static function clear(): void
    {
        self::$currentTenant = null;
        self::$currentTenantId = null;
        unset($_SESSION['touchbase_tenant_id']);
    }

    /**
     * Get current tenant ID
     *
     * @return int
     */
    public static function id(): int
    {
        if (self::$currentTenantId === null) {
            self::current(); // Load tenant to get ID
        }

        return self::$currentTenantId ?? 0;
    }

    /**
     * Check if feature is enabled for current tenant
     *
     * @param string $feature Feature key
     * @return bool
     */
    public static function isFeatureEnabled(string $feature): bool
    {
        $tenant = self::current();
        return !empty($tenant['features'][$feature]);
    }

    /**
     * Get tenant setting value
     *
     * @param string $key Setting key (supports dot notation)
     * @param mixed $default Default value if not found
     * @return mixed
     */
    public static function getSetting(string $key, mixed $default = null): mixed
    {
        $tenant = self::current();
        $settings = $tenant['settings_parsed'] ?? [];

        // Support dot notation (e.g., 'email.smtp_host')
        $keys = explode('.', $key);
        $value = $settings;

        foreach ($keys as $k) {
            if (!isset($value[$k])) {
                return $default;
            }
            $value = $value[$k];
        }

        return $value;
    }

    /**
     * Get CSS variables for current tenant branding
     *
     * @return string CSS custom properties
     */
    public static function getCssVariables(): string
    {
        $tenant = self::current();

        $css = ":root {\n";
        $css .= "  --tenant-color-1: {$tenant['color_primary']};\n";
        $css .= "  --tenant-color-2: {$tenant['color_secondary']};\n";
        $css .= "  --tenant-color-3: {$tenant['color_accent']};\n";
        $css .= "  --tenant-color-4: {$tenant['color_danger']};\n";
        $css .= "  --brand-primary: {$tenant['color_primary']};\n";
        $css .= "  --brand-secondary: {$tenant['color_secondary']};\n";
        $css .= "  --brand-accent: {$tenant['color_accent']};\n";
        $css .= "  --brand-danger: {$tenant['color_danger']};\n";

        if (!empty($tenant['font_family'])) {
            $css .= "  --font-sans: {$tenant['font_family']}, var(--font-sans);\n";
        }

        if (!empty($tenant['logo_url'])) {
            $css .= "  --tenant-logo-url: url('{$tenant['logo_url']}');\n";
        }

        $css .= "  --tenant-theme-mode: {$tenant['theme_mode']};\n";
        $css .= "}\n";

        // Apply theme mode attribute
        if ($tenant['theme_mode'] === 'light') {
            $css .= "\nhtml { data-theme: 'light'; }\n";
        }

        return $css;
    }

    /**
     * Track session for analytics
     *
     * @return void
     */
    public static function trackSession(): void
    {
        $tenantId = self::id();
        if ($tenantId === 0) {
            return; // No tenant to track
        }

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $sessionKey = session_id();
        $userId = $_SESSION['_user']['user_id'] ?? null;
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        Database::execute(
            'INSERT INTO pelota_tenant_sessions (tenant_id, user_id, session_key, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                last_accessed = CURRENT_TIMESTAMP,
                user_id = VALUES(user_id)',
            [$tenantId, $userId, $sessionKey, $ipAddress, $userAgent]
        );
    }

    /**
     * Record analytics metric for current tenant
     *
     * @param string $metricName Metric name
     * @param float $value Metric value
     * @param array<string, mixed>|null $metadata Optional metadata
     * @return void
     */
    public static function recordMetric(string $metricName, float $value, ?array $metadata = null): void
    {
        $tenantId = self::id();
        if ($tenantId === 0) {
            return;
        }

        $metadataJson = $metadata ? json_encode($metadata) : null;
        $today = date('Y-m-d');

        Database::execute(
            'INSERT INTO pelota_tenant_analytics (tenant_id, metric_name, metric_value, metric_date, metadata)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                metric_value = metric_value + VALUES(metric_value),
                metadata = VALUES(metadata)',
            [$tenantId, $metricName, $value, $today, $metadataJson]
        );
    }

    /**
     * Get analytics for current tenant
     *
     * @param string $metricName Metric name
     * @param int $days Number of days to retrieve
     * @return array<array<string, mixed>>
     */
    public static function getMetrics(string $metricName, int $days = 30): array
    {
        $tenantId = self::id();
        if ($tenantId === 0) {
            return [];
        }

        return Database::fetchAll(
            'SELECT metric_date, metric_value, metadata
             FROM pelota_tenant_analytics
             WHERE tenant_id = ? AND metric_name = ? AND metric_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
             ORDER BY metric_date DESC',
            [$tenantId, $metricName, $days]
        );
    }
}
