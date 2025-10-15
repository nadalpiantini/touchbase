-- ============================================================
-- PelotaPack Migration 000: Migrations Tracking Table
-- This must be the first migration to run
-- ============================================================

-- Migrations tracking table
CREATE TABLE IF NOT EXISTS touchbase_migrations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Migration Identification
    migration VARCHAR(255) UNIQUE NOT NULL COMMENT 'Migration filename (e.g., "001_init.sql")',
    batch INT UNSIGNED NOT NULL COMMENT 'Migration batch number',
    
    -- Execution Details
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INT UNSIGNED NULL COMMENT 'Time taken to execute in milliseconds',
    checksum VARCHAR(64) NULL COMMENT 'SHA-256 hash of migration file content',
    
    -- Status & Metadata
    status ENUM('pending', 'running', 'completed', 'failed', 'rolled_back') DEFAULT 'completed',
    error_message TEXT NULL COMMENT 'Error message if migration failed',
    
    -- Indexes
    INDEX idx_batch (batch),
    INDEX idx_status (status),
    INDEX idx_executed_at (executed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Track applied database migrations';

-- ============================================================
-- End of migration
-- ============================================================
