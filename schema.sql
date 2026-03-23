-- ============================================
-- Tournament Management System Database Schema
-- Database: Supabase (PostgreSQL)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: registrations
-- Stores team registration information
-- ============================================
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_name VARCHAR(255) NOT NULL,
  school_address TEXT NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  level VARCHAR(10) NOT NULL CHECK (level IN ('SMA', 'SMP')),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('Putra', 'Putri')),
  logo_url TEXT,
  players JSONB NOT NULL, -- Array of {name: string, card_url: string}
  officials JSONB NOT NULL, -- Array of official names
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_level_gender ON registrations(level, gender);
CREATE INDEX idx_registrations_created_at ON registrations(created_at DESC);

-- ============================================
-- Table: teams
-- Stores teams for each category
-- ============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(20) NOT NULL CHECK (category IN ('sma-putra', 'sma-putri', 'smp-putra', 'smp-putri')),
  team_name VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_teams_category ON teams(category);
CREATE INDEX idx_teams_category_order ON teams(category, order_index);

-- ============================================
-- Table: draw_results
-- Stores draw/bracket results for each category
-- ============================================
CREATE TABLE draw_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(20) NOT NULL CHECK (category IN ('sma-putra', 'sma-putri', 'smp-putra', 'smp-putri')),
  match_index INTEGER NOT NULL,
  team1 VARCHAR(255) NOT NULL,
  team2 VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_draw_results_category ON draw_results(category);
CREATE INDEX idx_draw_results_category_match ON draw_results(category, match_index);

-- ============================================
-- Table: match_scores
-- Stores match scores
-- ============================================
CREATE TABLE match_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_key VARCHAR(100) UNIQUE NOT NULL, -- Format: "day-matchId-category"
  score1 INTEGER NOT NULL CHECK (score1 >= 0),
  score2 INTEGER NOT NULL CHECK (score2 >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_match_scores_key ON match_scores(match_key);

-- ============================================
-- Table: settings
-- Stores tournament settings (single row)
-- ============================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  registration_fee VARCHAR(20) NOT NULL,
  whatsapp_contact VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Storage Bucket Configuration
-- For storing logos and player cards
-- ============================================
-- Run this in Supabase Dashboard > Storage:
-- 1. Create bucket named: tournament-files
-- 2. Set as public bucket
-- 3. Configure policies:

-- Policy: Allow public read access
-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'tournament-files');

-- Policy: Allow authenticated uploads
-- CREATE POLICY "Authenticated Upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'tournament-files');

-- ============================================
-- Row Level Security (RLS)
-- Disable RLS for now (enable in production with proper policies)
-- ============================================
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE draw_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Insert default settings
INSERT INTO settings (bank_name, account_number, account_name, registration_fee, whatsapp_contact)
VALUES ('Bank BCA', '123 456 7890', 'Panitia Championship', '350000', '081234567890');

-- ============================================
-- Useful Queries
-- ============================================

-- Get all registrations with status count
-- SELECT status, COUNT(*) as count FROM registrations GROUP BY status;

-- Get teams by category
-- SELECT team_name FROM teams WHERE category = 'sma-putra' ORDER BY order_index;

-- Get draw results for a category
-- SELECT match_index, team1, team2 FROM draw_results WHERE category = 'sma-putra' ORDER BY match_index;

-- Get all match scores
-- SELECT match_key, score1, score2 FROM match_scores;
