-- Migration: 002_branding.sql
-- Description: Multi-tenant branding system (2-4 colors + logo per league/club)
-- Date: 2025-10-15

CREATE TABLE IF NOT EXISTS touchbase_tenants (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(64) UNIQUE NOT NULL COMMENT 'Unique identifier code for tenant',
  name VARCHAR(160) NOT NULL COMMENT 'Display name of league/club',
  logo_url VARCHAR(255) NULL COMMENT 'URL or path to logo image',

  -- Brand colors (2-4 colors for adaptive theming)
  color1 VARCHAR(7) DEFAULT '#0ea5e9' COMMENT 'Primary brand color (hex)',
  color2 VARCHAR(7) DEFAULT '#22c55e' COMMENT 'Secondary brand color (hex)',
  color3 VARCHAR(7) DEFAULT '#f59e0b' COMMENT 'Tertiary brand color (hex)',
  color4 VARCHAR(7) DEFAULT '#ef4444' COMMENT 'Quaternary brand color (hex)',

  -- Theme preference
  theme ENUM('dark','light') DEFAULT 'dark' COMMENT 'Default theme mode',

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_code (code),
  KEY idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Multi-tenant branding configuration for leagues and clubs';

-- Insert default tenant for MVP (WCAG AA compliant colors)
INSERT INTO touchbase_tenants (code, name, logo_url, color1, color2, color3, color4, theme) VALUES
('default', 'TouchBase', '/img/touchbase.svg', '#0284c7', '#16a34a', '#ea580c', '#dc2626', 'dark')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Add tenant_id to existing tables (for future multi-tenancy support)
-- Note: This is preparation for future Sprint - not enforced yet in MVP

ALTER TABLE touchbase_teams
  ADD COLUMN tenant_id INT UNSIGNED NULL COMMENT 'Reference to tenant (future use)',
  ADD KEY idx_tenant (tenant_id);

-- Note: touchbase_tournaments table will be created in migration 004_tournaments.sql
-- ALTER TABLE touchbase_tournaments
--   ADD COLUMN tenant_id INT UNSIGNED NULL COMMENT 'Reference to tenant (future use)',
--   ADD KEY idx_tenant (tenant_id);
