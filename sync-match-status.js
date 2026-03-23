/**
 * Sync match status based on existing scores
 * This script updates match status to 'Complete' if scores exist
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function syncMatchStatus() {
  console.log('🔄 Syncing match status with existing scores...');

  try {
    // Get all matches
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('*');
    
    if (matchError) {
      throw new Error(`Failed to get matches: ${matchError.message}`);
    }

    // Get all match scores
    const { data: scores, error: scoreError } = await supabase
      .from('match_scores')
      .select('*');
    
    if (scoreError) {
      throw new Error(`Failed to get scores: ${scoreError.message}`);
    }

    console.log(`✅ Found ${matches.length} matches and ${scores.length} scores`);

    // Create score lookup map
    const scoreMap = {};
    scores.forEach(score => {
      scoreMap[score.match_key] = score;
    });

    // Update match status based on scores
    let updatedCount = 0;
    
    for (const match of matches) {
      // Generate score key for this match
      const scoreKey = `${match.day}-M${String(match.match_number).padStart(2, '0')}-${match.category.toLowerCase().replace(' ', '-')}`;
      
      const hasScore = scoreMap[scoreKey] && 
                      scoreMap[scoreKey].score1 !== undefined && 
                      scoreMap[scoreKey].score2 !== undefined;
      
      const shouldBeComplete = hasScore;
      const currentlyComplete = match.status === 'Complete';
      
      if (shouldBeComplete && !currentlyComplete) {
        // Update to Complete
        const { error: updateError } = await supabase
          .from('matches')
          .update({ status: 'Complete' })
          .eq('id', match.id);
        
        if (updateError) {
          console.error(`❌ Failed to update match ${match.id}:`, updateError.message);
        } else {
          console.log(`✅ Updated ${match.category} ${match.round} M${match.match_number} → Complete`);
          updatedCount++;
        }
      } else if (!shouldBeComplete && currentlyComplete) {
        // Update to Not Play Yet
        const { error: updateError } = await supabase
          .from('matches')
          .update({ status: 'Not Play Yet' })
          .eq('id', match.id);
        
        if (updateError) {
          console.error(`❌ Failed to update match ${match.id}:`, updateError.message);
        } else {
          console.log(`✅ Updated ${match.category} ${match.round} M${match.match_number} → Not Play Yet`);
          updatedCount++;
        }
      }
    }

    console.log(`\n🎉 Sync completed! Updated ${updatedCount} matches`);

    // Show final status counts
    const { data: finalMatches, error: finalError } = await supabase
      .from('matches')
      .select('status');
    
    if (!finalError) {
      const statusCounts = finalMatches.reduce((acc, match) => {
        acc[match.status] = (acc[match.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\nFinal status counts:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count} matches`);
      });
    }

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
  }
}

// Run sync
syncMatchStatus();