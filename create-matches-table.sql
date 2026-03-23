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

-- Disable RLS for now (same as other tables)
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;