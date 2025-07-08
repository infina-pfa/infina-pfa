-- Migration: Add onboarding_chat table for chat history
-- Created: 2025-01-03
-- Purpose: Store chat history during onboarding flow for continuity

-- ENUM sender already exists in the system (public.message_sender)
-- We'll reuse it for consistency: ('user', 'ai', 'system')

------------------------------------------------------------
-- Table to store onboarding chat history
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.onboarding_chat (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id)         ON DELETE CASCADE,
  sender          public.message_sender NOT NULL,   -- 'user' | 'ai' | 'system'
  content         TEXT NOT NULL,                    -- pure text content
  component_id    TEXT,                             -- link to component (if any)
  metadata        JSONB,                            -- additional data (tool-call, tokens, etc.)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.onboarding_chat                IS 'Store all user <-> AI messages during onboarding process';
COMMENT ON COLUMN public.onboarding_chat.component_id   IS 'If message is linked to a UI component (multiple_choice, etc.) store ID here';
COMMENT ON COLUMN public.onboarding_chat.metadata       IS 'JSON data: token usage, function_call, component_data, etc.';

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger only if it doesn't exist
DROP TRIGGER IF EXISTS trg_onboarding_chat_updated ON public.onboarding_chat;
CREATE TRIGGER trg_onboarding_chat_updated
BEFORE UPDATE ON public.onboarding_chat
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index for fast queries by conversation
CREATE INDEX IF NOT EXISTS idx_onboarding_chat_conv_created
  ON public.onboarding_chat (conversation_id, created_at);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_onboarding_chat_user_id
  ON public.onboarding_chat (user_id);

-- RLS: only allow owners to access their data
ALTER TABLE public.onboarding_chat ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own onboarding chat" ON public.onboarding_chat;
DROP POLICY IF EXISTS "Users can insert own onboarding chat" ON public.onboarding_chat;
DROP POLICY IF EXISTS "Users can update own onboarding chat" ON public.onboarding_chat;
DROP POLICY IF EXISTS "Users can delete own onboarding chat" ON public.onboarding_chat;

-- Create RLS policies
CREATE POLICY "Users can view own onboarding chat"
  ON public.onboarding_chat
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding chat"
  ON public.onboarding_chat
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding chat"
  ON public.onboarding_chat
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own onboarding chat"
  ON public.onboarding_chat
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_chat TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 