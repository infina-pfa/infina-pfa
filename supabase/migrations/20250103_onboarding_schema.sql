-- Migration: Create onboarding system tables
-- Created: 2025-01-03

-- Table for storing onboarding responses from components
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  component_id TEXT NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure one response per user per component
  UNIQUE(user_id, component_id)
);

-- Table for storing user profiles during onboarding
CREATE TABLE IF NOT EXISTS public.onboarding_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_data JSONB NOT NULL DEFAULT '{}',
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add onboarding columns to existing users table if they don't exist
DO $$ 
BEGIN
  -- Add onboarding_completed column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE public.users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add onboarding_completed_at column  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'onboarding_completed_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN onboarding_completed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_onboarding_responses_user_id ON public.onboarding_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_responses_component_id ON public.onboarding_responses(component_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_responses_created_at ON public.onboarding_responses(created_at);

CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_user_id ON public.onboarding_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_completed ON public.onboarding_profiles(is_completed);
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_created_at ON public.onboarding_profiles(created_at);

CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON public.users(onboarding_completed);

-- Row Level Security (RLS) policies
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only access their own onboarding responses
CREATE POLICY "Users can view own onboarding responses" ON public.onboarding_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding responses" ON public.onboarding_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding responses" ON public.onboarding_responses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own onboarding responses" ON public.onboarding_responses
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own onboarding profile
CREATE POLICY "Users can view own onboarding profile" ON public.onboarding_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding profile" ON public.onboarding_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding profile" ON public.onboarding_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own onboarding profile" ON public.onboarding_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_onboarding_responses_updated_at 
  BEFORE UPDATE ON public.onboarding_responses 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_profiles_updated_at 
  BEFORE UPDATE ON public.onboarding_profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.onboarding_responses IS 'Stores user responses from onboarding UI components';
COMMENT ON TABLE public.onboarding_profiles IS 'Stores user profile data collected during onboarding';

COMMENT ON COLUMN public.onboarding_responses.component_id IS 'Unique identifier of the UI component that generated this response';
COMMENT ON COLUMN public.onboarding_responses.response_data IS 'JSON data containing the user response (selectedOption, textValue, financialValue, etc.)';

COMMENT ON COLUMN public.onboarding_profiles.profile_data IS 'JSON data containing user profile information (name, income, goals, risk tolerance, etc.)';
COMMENT ON COLUMN public.onboarding_profiles.is_completed IS 'Whether the user has completed the full onboarding process';
COMMENT ON COLUMN public.onboarding_profiles.completed_at IS 'Timestamp when onboarding was completed';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_profiles TO authenticated;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 