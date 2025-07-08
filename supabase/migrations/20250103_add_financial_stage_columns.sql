-- Migration: Add financial stage columns to users table
-- Created: 2025-01-03
-- Purpose: Store financial stage analysis results from onboarding

-- Add financial stage columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS financial_stage TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stage_confidence REAL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stage_reasoning TEXT;

-- Create index for financial_stage queries
CREATE INDEX IF NOT EXISTS idx_users_financial_stage ON public.users(financial_stage);

-- Add comments for documentation
COMMENT ON COLUMN public.users.financial_stage IS 'User financial stage determined by AI analysis (survival, debt, foundation, investing, optimizing, protecting, retirement)';
COMMENT ON COLUMN public.users.stage_confidence IS 'AI confidence level (0.0 to 1.0) for the financial stage determination';
COMMENT ON COLUMN public.users.stage_reasoning IS 'AI reasoning explanation for why this financial stage was selected';

-- Add check constraints for data integrity
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS check_financial_stage_valid 
CHECK (financial_stage IS NULL OR financial_stage IN ('survival', 'debt', 'foundation', 'investing', 'optimizing', 'protecting', 'retirement'));

ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS check_stage_confidence_range 
CHECK (stage_confidence IS NULL OR (stage_confidence >= 0.0 AND stage_confidence <= 1.0)); 