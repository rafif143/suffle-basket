-- ============================================
-- Database Update: Add Round Information
-- ============================================

-- Add round column to draw_results table
ALTER TABLE draw_results 
ADD COLUMN round VARCHAR(20) DEFAULT '16 Besar' 
CHECK (round IN ('16 Besar', '8 Besar', 'Perempat Final', 'Semi Final', 'Final'));

-- Update existing records to have proper round
UPDATE draw_results SET round = '16 Besar' WHERE round IS NULL;

-- Add index for better performance
CREATE INDEX idx_draw_results_round ON draw_results(round);

-- ============================================
-- Alternative: Create new matches table for all rounds
-- ============================================

-- Create comprehensive matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(20) NOT NULL CHECK (category IN ('sma-putra', 'sma-putri', 'smp-putra', 'smp-putri')),
  round VARCHAR(20) NOT NULL CHECK (round IN ('16 Besar', '8 Besar', 'Perempat Final', 'Semi Final', 'Final')),
  match_number INTEGER NOT NULL, -- 1, 2, 3, etc within the round
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 13),
  match_time VARCHAR(20) NOT NULL, -- e.g., '15:30'
  team1 VARCHAR(255) NOT NULL,
  team2 VARCHAR(255) NOT NULL,
  team1_from VARCHAR(100), -- e.g., 'Winner M01' for dependency tracking
  team2_from VARCHAR(100), -- e.g., 'Winner M02' for dependency tracking
  status VARCHAR(20) DEFAULT 'Not Play Yet' CHECK (status IN ('Not Play Yet', 'Complete')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_matches_category ON matches(category);
CREATE INDEX idx_matches_round ON matches(round);
CREATE INDEX idx_matches_day ON matches(day);
CREATE INDEX idx_matches_category_round ON matches(category, round);

-- ============================================
-- Sample data for new matches table
-- ============================================

-- Insert 16 Besar matches for SMA Putra (example)
INSERT INTO matches (category, round, match_number, day, match_time, team1, team2, status) VALUES
('sma-putra', '16 Besar', 1, 1, '15:30', 'SMA Negeri 1 Jakarta', 'SMA Negeri 2 Jakarta', 'Not Play Yet'),
('sma-putra', '16 Besar', 2, 1, '16:30', 'SMA Negeri 3 Jakarta', 'SMA Negeri 4 Jakarta', 'Not Play Yet'),
('sma-putra', '16 Besar', 3, 1, '17:30', 'SMA Negeri 5 Jakarta', 'SMA Negeri 6 Jakarta', 'Not Play Yet'),
('sma-putra', '16 Besar', 4, 3, '15:30', 'SMA Negeri 7 Jakarta', 'SMA Negeri 8 Jakarta', 'Not Play Yet'),
('sma-putra', '16 Besar', 5, 3, '16:30', 'SMA Negeri 9 Jakarta', 'SMA Negeri 10 Jakarta', 'Not Play Yet'),
('sma-putra', '16 Besar', 6, 5, '15:30', 'SMA Negeri 11 Jakarta', 'SMA Negeri 12 Jakarta', 'Not Play Yet'),
('sma-putra', '16 Besar', 7, 5, '16:30', 'SMA Negeri 13 Jakarta', 'SMA Negeri 14 Jakarta', 'Not Play Yet'),
('sma-putra', '16 Besar', 8, 5, '17:30', 'SMA Negeri 15 Jakarta', 'SMA Negeri 16 Jakarta', 'Not Play Yet');

-- Insert 8 Besar matches for SMA Putra (example)
INSERT INTO matches (category, round, match_number, day, match_time, team1, team2, team1_from, team2_from, status) VALUES
('sma-putra', '8 Besar', 1, 7, '19:00', 'Winner M01', 'Winner M02', 'Winner 16 Besar M1', 'Winner 16 Besar M2', 'Not Play Yet'),
('sma-putra', '8 Besar', 2, 7, '20:00', 'Winner M03', 'Winner M04', 'Winner 16 Besar M3', 'Winner 16 Besar M4', 'Not Play Yet'),
('sma-putra', '8 Besar', 3, 9, '19:00', 'Winner M05', 'Winner M06', 'Winner 16 Besar M5', 'Winner 16 Besar M6', 'Not Play Yet'),
('sma-putra', '8 Besar', 4, 9, '20:00', 'Winner M07', 'Winner M08', 'Winner 16 Besar M7', 'Winner 16 Besar M8', 'Not Play Yet');

-- Insert Semi Final matches for SMA Putra (example)
INSERT INTO matches (category, round, match_number, day, match_time, team1, team2, team1_from, team2_from, status) VALUES
('sma-putra', 'Semi Final', 1, 11, '19:00', 'Winner QF01', 'Winner QF02', 'Winner 8 Besar M1', 'Winner 8 Besar M2', 'Not Play Yet'),
('sma-putra', 'Semi Final', 2, 11, '20:00', 'Winner QF03', 'Winner QF04', 'Winner 8 Besar M3', 'Winner 8 Besar M4', 'Not Play Yet');

-- Insert Final match for SMA Putra (example)
INSERT INTO matches (category, round, match_number, day, match_time, team1, team2, team1_from, team2_from, status) VALUES
('sma-putra', 'Final', 1, 13, '20:00', 'Winner SF01', 'Winner SF02', 'Winner Semi Final M1', 'Winner Semi Final M2', 'Not Play Yet');

-- ============================================
-- Migration script to populate matches table from existing data
-- ============================================

-- This would need to be run to migrate existing draw_results to matches table
-- INSERT INTO matches (category, round, match_number, day, match_time, team1, team2, status)
-- SELECT 
--   category,
--   '16 Besar' as round,
--   match_index + 1 as match_number,
--   CASE 
--     WHEN category LIKE 'sma-%' THEN 
--       CASE WHEN match_index < 3 THEN 1
--            WHEN match_index < 5 THEN 3  
--            ELSE 5 END
--     ELSE 
--       CASE WHEN match_index < 3 THEN 2
--            WHEN match_index < 5 THEN 4
--            ELSE 6 END
--   END as day,
--   '15:30' as match_time, -- This would need proper time calculation
--   team1,
--   team2,
--   'Not Play Yet' as status
-- FROM draw_results;