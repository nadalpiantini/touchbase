-- ============================================================
-- TouchBase Migration 005: Email Queue System (PostgreSQL)
-- Email queue system for async notifications
-- Prefix: touchbase_*
-- ============================================================

-- Email status enum
DO $$ BEGIN
    CREATE TYPE touchbase_email_status AS ENUM ('queued', 'sent', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS touchbase_email_queue (
    id SERIAL PRIMARY KEY,
    to_email VARCHAR(255) NOT NULL,
    to_name VARCHAR(160) NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status touchbase_email_status DEFAULT 'queued',
    attempts INTEGER DEFAULT 0,
    last_error TEXT NULL,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON touchbase_email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created ON touchbase_email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_to_email ON touchbase_email_queue(to_email);

COMMENT ON TABLE touchbase_email_queue IS 'Email queue for async notification delivery';
COMMENT ON COLUMN touchbase_email_queue.to_email IS 'Recipient email address';
COMMENT ON COLUMN touchbase_email_queue.to_name IS 'Recipient name';
COMMENT ON COLUMN touchbase_email_queue.subject IS 'Email subject';
COMMENT ON COLUMN touchbase_email_queue.body IS 'Email body (plain text or HTML)';
COMMENT ON COLUMN touchbase_email_queue.status IS 'Delivery status';
COMMENT ON COLUMN touchbase_email_queue.attempts IS 'Number of send attempts';
COMMENT ON COLUMN touchbase_email_queue.last_error IS 'Last error message if failed';
COMMENT ON COLUMN touchbase_email_queue.sent_at IS 'When successfully sent';

-- Trigger for updated_at
CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON touchbase_email_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- End of migration
-- ============================================================
