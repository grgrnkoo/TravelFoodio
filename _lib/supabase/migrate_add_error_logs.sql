-- =============================================
-- Migration: Create error_logs table
-- Run this in Supabase SQL Editor
-- =============================================

-- Create error_logs table to track application errors
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    endpoint TEXT,
    request_data JSONB,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role has full access to error_logs"
    ON error_logs FOR ALL
    USING (auth.role() = 'service_role');

-- Only service role can read error logs (admin access via service role)
CREATE POLICY "Service role can read error_logs"
    ON error_logs FOR SELECT
    USING (auth.role() = 'service_role');

-- Only service role can insert error logs
CREATE POLICY "Service role can insert error_logs"
    ON error_logs FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

