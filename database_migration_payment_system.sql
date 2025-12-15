-- ============================================================================
-- PAYMENT SYSTEM DATABASE MIGRATIONS
-- ============================================================================
-- This migration creates the database tables required for the contact payment
-- system: transactions, contact_access, and profile extensions.
-- Requirements: 4.1, 4.3, 5.1, 6.1, 6.2, 7.1
-- ============================================================================

-- ============================================================================
-- 1. TRANSACTIONS TABLE
-- Stores all payment records for tracking and verification
-- Requirements: 6.1, 6.2
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('single', 'package_3', 'package_6', 'package_10', 'subscription')),
  phone_number VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS transactions_updated_at ON transactions;
CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);


-- ============================================================================
-- 2. CONTACT_ACCESS TABLE
-- Stores which users have paid to view which contacts
-- Requirements: 4.1, 4.3
-- ============================================================================

CREATE TABLE IF NOT EXISTS contact_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  swap_id UUID NOT NULL REFERENCES swaps(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('single', 'package', 'subscription')),
  UNIQUE(user_id, swap_id)
);

-- Index for efficient access checks
CREATE INDEX IF NOT EXISTS idx_contact_access_user_swap ON contact_access(user_id, swap_id);

-- Enable Row Level Security
ALTER TABLE contact_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own access records
CREATE POLICY "Users can view own contact access"
  ON contact_access FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contact access"
  ON contact_access FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================================
-- 3. PROFILES TABLE EXTENSION
-- Add payment-related columns to existing profiles table
-- Requirements: 5.1, 7.1
-- ============================================================================

-- Add views_remaining column for package purchases
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS views_remaining INTEGER DEFAULT 0;

-- Add subscription_expires_at column for K50 subscription tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
