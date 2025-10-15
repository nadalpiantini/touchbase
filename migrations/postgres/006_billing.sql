-- ============================================================
-- TouchBase Migration 006: Billing & Payment Tracking (PostgreSQL)
-- Billing and payment tracking (Stripe integration)
-- Prefix: touchbase_*
-- ============================================================

-- Payment status enum
DO $$ BEGIN
    CREATE TYPE touchbase_payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS touchbase_billing_transactions (
    id SERIAL PRIMARY KEY,
    checkout_id VARCHAR(255) UNIQUE NOT NULL,
    team_id INTEGER NULL,
    user_id UUID NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description VARCHAR(255) NOT NULL,
    status touchbase_payment_status DEFAULT 'pending',
    payment_method VARCHAR(50) NULL,
    metadata JSONB NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_billing_checkout ON touchbase_billing_transactions(checkout_id);
CREATE INDEX IF NOT EXISTS idx_billing_team ON touchbase_billing_transactions(team_id);
CREATE INDEX IF NOT EXISTS idx_billing_user ON touchbase_billing_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON touchbase_billing_transactions(status);
CREATE INDEX IF NOT EXISTS idx_billing_created ON touchbase_billing_transactions(created_at);

COMMENT ON TABLE touchbase_billing_transactions IS 'Payment transaction log for billing and reconciliation';
COMMENT ON COLUMN touchbase_billing_transactions.checkout_id IS 'Stripe checkout session ID';
COMMENT ON COLUMN touchbase_billing_transactions.team_id IS 'Associated team (if applicable)';
COMMENT ON COLUMN touchbase_billing_transactions.user_id IS 'Associated user (payer) - Supabase UUID';
COMMENT ON COLUMN touchbase_billing_transactions.amount IS 'Amount in cents (USD)';
COMMENT ON COLUMN touchbase_billing_transactions.currency IS 'Currency code';
COMMENT ON COLUMN touchbase_billing_transactions.description IS 'Payment description';
COMMENT ON COLUMN touchbase_billing_transactions.status IS 'Payment status';
COMMENT ON COLUMN touchbase_billing_transactions.payment_method IS 'Payment method (card, bank, etc)';
COMMENT ON COLUMN touchbase_billing_transactions.metadata IS 'Additional metadata';
COMMENT ON COLUMN touchbase_billing_transactions.completed_at IS 'When payment completed';

-- Add billing preferences per team (future: per-player fees)
CREATE TABLE IF NOT EXISTS touchbase_billing_config (
    id SERIAL PRIMARY KEY,
    team_id INTEGER UNIQUE NOT NULL,
    fee_per_player INTEGER DEFAULT 0,
    fee_per_season INTEGER DEFAULT 0,
    stripe_account_id VARCHAR(255) NULL,
    payment_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_billing_config_team
        FOREIGN KEY (team_id) REFERENCES touchbase_teams(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_billing_config_team ON touchbase_billing_config(team_id);

COMMENT ON TABLE touchbase_billing_config IS 'Billing configuration per team';
COMMENT ON COLUMN touchbase_billing_config.team_id IS 'Team ID';
COMMENT ON COLUMN touchbase_billing_config.fee_per_player IS 'Registration fee in cents';
COMMENT ON COLUMN touchbase_billing_config.fee_per_season IS 'Season fee in cents';
COMMENT ON COLUMN touchbase_billing_config.stripe_account_id IS 'Connected Stripe account (future)';
COMMENT ON COLUMN touchbase_billing_config.payment_enabled IS 'Enable payment collection';

-- Triggers for updated_at
CREATE TRIGGER update_billing_transactions_updated_at BEFORE UPDATE ON touchbase_billing_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_config_updated_at BEFORE UPDATE ON touchbase_billing_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- End of migration
-- ============================================================
