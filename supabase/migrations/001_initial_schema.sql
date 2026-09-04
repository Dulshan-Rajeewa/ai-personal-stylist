-- ═══════════════════════════════════════════════════════════════════════════
-- AI Personal Stylist — Initial Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. Profiles ────────────────────────────────────────────────────────────
-- Automatically created/synced when a user signs up via auth.users trigger.

CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name        TEXT,
  avatar_url       TEXT,
  gender_preference TEXT,
  avg_style_score  NUMERIC(4, 2) DEFAULT 0 CHECK (avg_style_score >= 0 AND avg_style_score <= 10),
  budget_tier      TEXT CHECK (budget_tier IN ('budget', 'mid', 'luxury')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: auto-insert a profile row when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── 2. Wardrobe Items ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.wardrobe_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  category   TEXT NOT NULL CHECK (category IN ('top', 'bottom', 'shoes', 'accessory', 'outerwear', 'dress', 'other')),
  color      TEXT,
  tags       TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wardrobe_items_user_id ON public.wardrobe_items(user_id);
CREATE INDEX idx_wardrobe_items_category ON public.wardrobe_items(category);

ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own wardrobe items"
  ON public.wardrobe_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 3. Outfit Analyses ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.outfit_analyses (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url           TEXT NOT NULL,
  style_score         NUMERIC(4, 2) NOT NULL CHECK (style_score >= 0 AND style_score <= 10),
  color_feedback      TEXT,
  fit_feedback        TEXT,
  accessory_feedback  TEXT,
  suggestion          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outfit_analyses_user_id ON public.outfit_analyses(user_id);

ALTER TABLE public.outfit_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own analyses"
  ON public.outfit_analyses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger: recalculate avg_style_score in profiles after each analysis insert
CREATE OR REPLACE FUNCTION public.update_avg_style_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET avg_style_score = (
    SELECT ROUND(AVG(style_score)::NUMERIC, 2)
    FROM public.outfit_analyses
    WHERE user_id = NEW.user_id
  )
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_analysis_inserted ON public.outfit_analyses;
CREATE TRIGGER on_analysis_inserted
  AFTER INSERT ON public.outfit_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_avg_style_score();

-- ─── 4. Community Polls ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.community_polls (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  image_a_url TEXT NOT NULL,
  image_b_url TEXT NOT NULL,
  votes_a     INTEGER NOT NULL DEFAULT 0,
  votes_b     INTEGER NOT NULL DEFAULT 0,
  occasion    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_community_polls_user_id ON public.community_polls(user_id);
CREATE INDEX idx_community_polls_created_at ON public.community_polls(created_at DESC);

ALTER TABLE public.community_polls ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read polls
CREATE POLICY "Authenticated users can read polls"
  ON public.community_polls FOR SELECT
  TO authenticated
  USING (TRUE);

-- Only the poll creator can update/delete
CREATE POLICY "Poll creators can manage their polls"
  ON public.community_polls FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow the vote-casting function to increment counters
CREATE POLICY "Service can update vote counts"
  ON public.community_polls FOR UPDATE
  USING (TRUE);

-- ─── 5. Poll Votes ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id    UUID NOT NULL REFERENCES public.community_polls(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  choice     TEXT NOT NULL CHECK (choice IN ('A', 'B')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (poll_id, user_id)   -- One vote per user per poll
);

CREATE INDEX idx_poll_votes_poll_id ON public.poll_votes(poll_id);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all votes"
  ON public.poll_votes FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can insert their own vote"
  ON public.poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── Atomic Vote-Casting Function ────────────────────────────────────────────
-- This Postgres function atomically records a vote and increments the counter.
-- Call via: SELECT cast_poll_vote(poll_id, user_id, 'A');

CREATE OR REPLACE FUNCTION public.cast_poll_vote(
  p_poll_id  UUID,
  p_user_id  UUID,
  p_choice   TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  existing_vote TEXT;
  result        JSONB;
BEGIN
  -- Check if user already voted
  SELECT choice INTO existing_vote
  FROM public.poll_votes
  WHERE poll_id = p_poll_id AND user_id = p_user_id;

  IF existing_vote IS NOT NULL THEN
    -- Return current state without changing anything
    SELECT jsonb_build_object(
      'success', false,
      'message', 'Already voted',
      'existing_choice', existing_vote
    ) INTO result;
    RETURN result;
  END IF;

  -- Insert vote record
  INSERT INTO public.poll_votes (poll_id, user_id, choice)
  VALUES (p_poll_id, p_user_id, p_choice);

  -- Atomically increment the correct counter
  IF p_choice = 'A' THEN
    UPDATE public.community_polls
    SET votes_a = votes_a + 1
    WHERE id = p_poll_id;
  ELSE
    UPDATE public.community_polls
    SET votes_b = votes_b + 1
    WHERE id = p_poll_id;
  END IF;

  SELECT jsonb_build_object(
    'success', true,
    'message', 'Vote cast successfully',
    'choice', p_choice
  ) INTO result;

  RETURN result;
END;
$$;

-- ─── Storage Buckets ─────────────────────────────────────────────────────────

-- Wardrobe images bucket (private, per-user storage paths)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wardrobe',
  'wardrobe',
  FALSE,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Outfit analysis images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'analyses',
  'analyses',
  FALSE,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: wardrobe bucket
CREATE POLICY "Users can upload to their own wardrobe folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'wardrobe' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Users can read their own wardrobe images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'wardrobe' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Users can delete their own wardrobe images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'wardrobe' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Storage RLS: analyses bucket
CREATE POLICY "Users can upload to their own analyses folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'analyses' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Users can read their own analysis images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'analyses' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Users can delete their own analysis images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'analyses' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );
