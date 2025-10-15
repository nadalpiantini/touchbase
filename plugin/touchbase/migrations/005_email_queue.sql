-- Migration: 005_email_queue.sql
-- Description: Email queue system for notifications
-- Date: 2025-10-15

CREATE TABLE IF NOT EXISTS touchbase_email_queue (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL COMMENT 'Recipient email address',
  to_name VARCHAR(160) NULL COMMENT 'Recipient name',
  subject VARCHAR(255) NOT NULL COMMENT 'Email subject',
  body TEXT NOT NULL COMMENT 'Email body (plain text or HTML)',
  status ENUM('queued','sent','failed') DEFAULT 'queued' COMMENT 'Delivery status',
  attempts INT UNSIGNED DEFAULT 0 COMMENT 'Number of send attempts',
  last_error TEXT NULL COMMENT 'Last error message if failed',
  sent_at TIMESTAMP NULL COMMENT 'When successfully sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_status (status),
  KEY idx_created (created_at),
  KEY idx_to_email (to_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Email queue for async notification delivery';

-- Add email preferences to users (future: opt-out)
-- Note: This extends Chamilo user table indirectly via settings
