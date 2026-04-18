-- Migration: Add genre_preferences to profiles
-- Run this in your Supabase SQL editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS genre_preferences text[] DEFAULT '{}';
