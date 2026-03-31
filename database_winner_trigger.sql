-- ============================================================
-- YADIKA CUP - AUTO WINNER RESOLUTION TRIGGER (CLEAN VERSION)
-- ============================================================
-- Auto-updates matches.team1/team2 when score is saved
-- ============================================================

-- Drop existing
DROP TRIGGER IF EXISTS trg_auto_resolve_winner ON match_scores;
DROP FUNCTION IF EXISTS auto_resolve_winner();
DROP FUNCTION IF EXISTS generate_match_key(INTEGER, TEXT, INTEGER, TEXT);

-- Helper function to generate match_key
CREATE OR REPLACE FUNCTION generate_match_key(
  p_day INTEGER,
  p_round TEXT,
  p_match_number INTEGER,
  p_category TEXT
) RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
BEGIN
  IF p_round = '16 Besar' THEN
    v_prefix := 'M' || LPAD(p_match_number::TEXT, 2, '0');
  ELSIF p_round = '8 Besar' THEN
    v_prefix := 'QF' || p_match_number::TEXT;
  ELSIF p_round = 'Semi Final' THEN
    v_prefix := 'SF' || p_match_number::TEXT;
  ELSIF p_round = 'Final' THEN
    v_prefix := 'F1';
  ELSE
    v_prefix := 'M' || LPAD(p_match_number::TEXT, 2, '0');
  END IF;
  
  RETURN p_day::TEXT || '-' || v_prefix || '-' || p_category;
END;
$$ LANGUAGE plpgsql;

-- Main trigger function
CREATE OR REPLACE FUNCTION auto_resolve_winner()
RETURNS TRIGGER AS $$
DECLARE
  v_winner_team TEXT;
  v_loser_team TEXT;
  v_source_match RECORD;
  v_match_ref TEXT;
BEGIN
  -- Find the source match using the match_key
  -- Parse match_key: "7-QF1-sma-putra" → day=7, round="8 Besar", number=1, category="sma-putra"
  SELECT INTO v_source_match * FROM matches m
  WHERE generate_match_key(m.day, m.round, m.match_number, m.category) = NEW.match_key;
  
  -- If no match found, nothing to do
  IF v_source_match IS NULL THEN
    RAISE NOTICE 'No match found for match_key: %', NEW.match_key;
    RETURN NEW;
  END IF;
  
  -- Determine winner (no draws allowed)
  IF NEW.score1 > NEW.score2 THEN
    v_winner_team := v_source_match.team1;
  ELSIF NEW.score2 > NEW.score1 THEN
    v_winner_team := v_source_match.team2;
  ELSE
    -- Draw - no winner yet
    RAISE NOTICE 'Match is a draw, no winner yet for: %', NEW.match_key;
    RETURN NEW;
  END IF;
  
  -- Generate match reference (M01, QF1, SF1)
  IF v_source_match.round = '16 Besar' THEN
    v_match_ref := 'M' || LPAD(v_source_match.match_number::TEXT, 2, '0');
  ELSIF v_source_match.round = '8 Besar' THEN
    v_match_ref := 'QF' || v_source_match.match_number::TEXT;
  ELSIF v_source_match.round = 'Semi Final' THEN
    v_match_ref := 'SF' || v_source_match.match_number::TEXT;
  ELSE
    -- Final - no next round
    RAISE NOTICE 'Final match completed: %', NEW.match_key;
    RETURN NEW;
  END IF;
  
  -- Update next round matches
  -- Update team1 where team1_from matches
  UPDATE matches 
  SET team1 = v_winner_team, 
      updated_at = NOW()
  WHERE team1_from = v_match_ref 
    AND category = v_source_match.category
    AND (team1 = 'TBD' OR team1 LIKE 'Winner %');
  
  -- Update team2 where team2_from matches
  UPDATE matches 
  SET team2 = v_winner_team, 
      updated_at = NOW()
  WHERE team2_from = v_match_ref 
    AND category = v_source_match.category
    AND (team2 = 'TBD' OR team2 LIKE 'Winner %');
  
  -- Log the update
  RAISE NOTICE 'Updated matches: winner % from match % (key: %)', 
    v_winner_team, v_match_ref, NEW.match_key;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trg_auto_resolve_winner
AFTER INSERT OR UPDATE ON match_scores
FOR EACH ROW
EXECUTE FUNCTION auto_resolve_winner();

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Check if trigger was created:
-- SELECT tgname, tgrelid::regclass as table_name, tgenabled 
-- FROM pg_trigger 
-- WHERE tgname = 'trg_auto_resolve_winner';

-- Check if function was created:
-- SELECT proname as function_name 
-- FROM pg_proc 
-- WHERE proname = 'auto_resolve_winner';

-- ============================================================
-- TEST SCRIPT (Uncomment to test)
-- ============================================================
-- -- Test 1: Update a 16 Besar score
-- UPDATE match_scores 
-- SET score1 = 30, score2 = 20, updated_at = NOW()
-- WHERE match_key = '1-M01-sma-putra';

-- -- Test 2: Check if 8 Besar was updated
-- SELECT category, match_number, team1, team2, team1_from, team2_from
-- FROM matches 
-- WHERE round = '8 Besar' 
--   AND category = 'sma-putra' 
--   AND team1_from = 'M01';

-- -- Expected: team1 should be the winner from M01

-- ============================================================
-- ROLLBACK (if needed)
-- ============================================================
-- DROP TRIGGER IF EXISTS trg_auto_resolve_winner ON match_scores;
-- DROP FUNCTION IF EXISTS auto_resolve_winner();
-- DROP FUNCTION IF EXISTS generate_match_key(INTEGER, TEXT, INTEGER, TEXT);
