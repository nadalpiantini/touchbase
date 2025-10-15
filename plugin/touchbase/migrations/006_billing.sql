-- Migration: 006_billing.sql
-- Description: Billing and payment tracking (Stripe integration)
-- Date: 2025-10-15

CREATE TABLE IF NOT EXISTS touchbase_billing_transactions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  checkout_id VARCHAR(255) UNIQUE NOT NULL COMMENT 'Stripe checkout session ID',
  team_id INT UNSIGNED NULL COMMENT 'Associated team (if applicable)',
  user_id INT UNSIGNED NULL COMMENT 'Associated user (payer)',
  amount INT UNSIGNED NOT NULL COMMENT 'Amount in cents (USD)',
  currency VARCHAR(3) DEFAULT 'USD' COMMENT 'Currency code',
  description VARCHAR(255) NOT NULL COMMENT 'Payment description',
  status ENUM('pending','completed','failed','refunded') DEFAULT 'pending' COMMENT 'Payment status',
  payment_method VARCHAR(50) NULL COMMENT 'Payment method (card, bank, etc)',
  metadata JSON NULL COMMENT 'Additional metadata',
  completed_at TIMESTAMP NULL COMMENT 'When payment completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_checkout (checkout_id),
  KEY idx_team (team_id),
  KEY idx_user (user_id),
  KEY idx_status (status),
  KEY idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Payment transaction log for billing and reconciliation';

-- Add billing preferences per team (future: per-player fees)
CREATE TABLE IF NOT EXISTS touchbase_billing_config (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  team_id INT UNSIGNED UNIQUE NOT NULL COMMENT 'Team ID',
  fee_per_player INT UNSIGNED DEFAULT 0 COMMENT 'Registration fee in cents',
  fee_per_season INT UNSIGNED DEFAULT 0 COMMENT 'Season fee in cents',
  stripe_account_id VARCHAR(255) NULL COMMENT 'Connected Stripe account (future)',
  payment_enabled BOOLEAN DEFAULT FALSE COMMENT 'Enable payment collection',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_team (team_id),
  FOREIGN KEY (team_id) REFERENCES touchbase_teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Billing configuration per team';
