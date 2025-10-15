-- ============================================================
-- PelotaPack Migration 003: Tenant Branding System
-- Enables per-league/club customization with 2-4 colors + logo
-- ============================================================

-- Tenants table (leagues, clubs, or organizations)
CREATE TABLE IF NOT EXISTS touchbase_tenants (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Identification
    code VARCHAR(64) UNIQUE NOT NULL COMMENT 'Unique tenant identifier (e.g., "rddominicana", "nyc-youth")',
    name VARCHAR(160) NOT NULL COMMENT 'Display name (e.g., "República Dominicana Baseball Federation")',
    slug VARCHAR(100) UNIQUE NULL COMMENT 'URL-friendly version of name',
    
    -- Branding Assets
    logo_url VARCHAR(255) NULL COMMENT 'Full URL to tenant logo',
    logo_dark_url VARCHAR(255) NULL COMMENT 'Optional dark mode logo variant',
    favicon_url VARCHAR(255) NULL COMMENT 'Optional custom favicon',
    
    -- Color Palette (2-4 customizable colors)
    color_primary VARCHAR(7) DEFAULT '#0ea5e9' COMMENT 'Primary brand color (hex)',
    color_secondary VARCHAR(7) DEFAULT '#22c55e' COMMENT 'Secondary brand color (hex)',
    color_accent VARCHAR(7) DEFAULT '#f59e0b' COMMENT 'Accent/highlight color (hex)',
    color_danger VARCHAR(7) DEFAULT '#ef4444' COMMENT 'Error/danger color (hex)',
    
    -- Theme Configuration
    theme_mode ENUM('dark', 'light', 'auto') DEFAULT 'dark' COMMENT 'Default theme preference',
    font_family VARCHAR(255) NULL COMMENT 'Optional custom font (Google Fonts name or CSS stack)',
    
    -- Contact & Metadata
    website_url VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    address TEXT NULL,
    timezone VARCHAR(64) DEFAULT 'America/Santo_Domingo',
    locale VARCHAR(10) DEFAULT 'en_US',
    
    -- Feature Flags
    features_enabled JSON NULL COMMENT 'JSON object of enabled features {"tournaments": true, "payments": false}',
    settings JSON NULL COMMENT 'Tenant-specific settings and overrides',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_active (is_active),
    INDEX idx_code (code),
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tenant branding and configuration';

-- ============================================================
-- Migrate existing clubs to tenants
-- ============================================================

INSERT INTO touchbase_tenants (code, name, color_primary, color_secondary, is_active)
SELECT 
    LOWER(REPLACE(REPLACE(name, ' ', '-'), '.', '')),
    name,
    '#0ea5e9', -- default primary
    '#22c55e', -- default secondary
    TRUE
FROM touchbase_clubs
WHERE NOT EXISTS (
    SELECT 1 FROM touchbase_tenants 
    WHERE touchbase_tenants.code = LOWER(REPLACE(REPLACE(touchbase_clubs.name, ' ', '-'), '.', ''))
);

-- ============================================================
-- Add tenant_id to clubs (link clubs to tenants)
-- ============================================================

ALTER TABLE touchbase_clubs 
ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id,
ADD CONSTRAINT fk_club_tenant 
    FOREIGN KEY (tenant_id) REFERENCES touchbase_tenants(id) ON DELETE SET NULL;

-- Link existing clubs to their corresponding tenants
UPDATE touchbase_clubs c
INNER JOIN touchbase_tenants t ON t.code = LOWER(REPLACE(REPLACE(c.name, ' ', '-'), '.', ''))
SET c.tenant_id = t.id;

-- ============================================================
-- Sample tenant (default/demo)
-- ============================================================

INSERT INTO touchbase_tenants (
    code, 
    name, 
    logo_url,
    color_primary, 
    color_secondary, 
    color_accent, 
    color_danger,
    theme_mode,
    website_url,
    email,
    timezone,
    locale,
    features_enabled,
    is_active
) VALUES (
    'pelota-pack-demo',
    'PelotaPack Demo League',
    '/pelota/assets/img/logo-demo.svg',
    '#0ea5e9', -- Caribbean sky blue
    '#22c55e', -- Field green
    '#f59e0b', -- Sun/warning amber
    '#ef4444', -- Error red
    'dark',
    'https://pelota-pack.demo',
    'admin@pelota-pack.demo',
    'America/Santo_Domingo',
    'en_US',
    '{"tournaments": true, "notifications": true, "payments": false, "ai_assistant": false}',
    TRUE
) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- Tenant Session Tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS touchbase_tenant_sessions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NULL COMMENT 'Chamilo user ID (NULL for anonymous)',
    session_key VARCHAR(64) NOT NULL COMMENT 'Unique session identifier',
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    
    UNIQUE KEY uniq_session (session_key),
    INDEX idx_tenant_user (tenant_id, user_id),
    INDEX idx_last_accessed (last_accessed),
    
    CONSTRAINT fk_session_tenant 
        FOREIGN KEY (tenant_id) REFERENCES touchbase_tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Track active tenant context per session';

-- ============================================================
-- Tenant Usage Analytics
-- ============================================================

CREATE TABLE IF NOT EXISTS touchbase_tenant_analytics (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT UNSIGNED NOT NULL,
    
    -- Metrics
    metric_name VARCHAR(100) NOT NULL COMMENT 'e.g., "page_views", "api_calls", "storage_mb"',
    metric_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    metric_date DATE NOT NULL,
    
    -- Metadata
    metadata JSON NULL COMMENT 'Additional context for the metric',
    
    -- Timestamps
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    UNIQUE KEY uniq_tenant_metric_date (tenant_id, metric_name, metric_date),
    INDEX idx_metric_date (metric_name, metric_date),
    
    CONSTRAINT fk_analytics_tenant 
        FOREIGN KEY (tenant_id) REFERENCES touchbase_tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tenant usage metrics and analytics';

-- ============================================================
-- End of migration
-- ============================================================
