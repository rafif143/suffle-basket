/**
 * Simple test to verify matches API is working
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testMatchesAPI() {
  console.log('🧪 Testing matches API...');

  try {
    // Test 1: Get all matches
    console.log('\n1. Testing: Get all matches');
    const { data: allMatches, error: allError } = await supabase
      .from('matches')
      .select('*')
      .limit(5);
    
    if (allError) {
      console.error('❌ Error getting all matches:', allError.message);
    } else {
      console.log(`✅ Found ${allMatches.length} matches (showing first 5)`);
      allMatches.forEach(match => {
        console.log(`   - ${match.category} ${match.round} M${match.match_number}: ${match.team1} vs ${match.team2} (${match.status})`);
      });
    }

    // Test 2: Get matches by category
    console.log('\n2. Testing: Get SMA Putra matches');
    const { data: smaMatches, error: smaError } = await supabase
      .from('matches')
      .select('*')
      .eq('category', 'sma-putra')
      .limit(3);
    
    if (smaError) {
      console.error('❌ Error getting SMA Putra matches:', smaError.message);
    } else {
      console.log(`✅ Found ${smaMatches.length} SMA Putra matches (showing first 3)`);
      smaMatches.forEach(match => {
        console.log(`   - ${match.round} M${match.match_number}: ${match.team1} vs ${match.team2} (Day ${match.day}, ${match.match_time})`);
      });
    }

    // Test 3: Get matches by round
    console.log('\n3. Testing: Get 16 Besar matches');
    const { data: roundMatches, error: roundError } = await supabase
      .from('matches')
      .select('*')
      .eq('round', '16 Besar')
      .limit(5);
    
    if (roundError) {
      console.error('❌ Error getting 16 Besar matches:', roundError.message);
    } else {
      console.log(`✅ Found ${roundMatches.length} 16 Besar matches (showing first 5)`);
      roundMatches.forEach(match => {
        console.log(`   - ${match.category} M${match.match_number}: ${match.team1} vs ${match.team2} (${match.status})`);
      });
    }

    // Test 4: Get matches by day
    console.log('\n4. Testing: Get Day 1 matches');
    const { data: dayMatches, error: dayError } = await supabase
      .from('matches')
      .select('*')
      .eq('day', 1)
      .order('match_number');
    
    if (dayError) {
      console.error('❌ Error getting Day 1 matches:', dayError.message);
    } else {
      console.log(`✅ Found ${dayMatches.length} Day 1 matches`);
      dayMatches.forEach(match => {
        console.log(`   - ${match.match_time} ${match.category} M${match.match_number}: ${match.team1} vs ${match.team2}`);
      });
    }

    // Test 5: Count matches by status
    console.log('\n5. Testing: Count matches by status');
    const { data: statusCount, error: statusError } = await supabase
      .from('matches')
      .select('status')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        
        const counts = data.reduce((acc, match) => {
          acc[match.status] = (acc[match.status] || 0) + 1;
          return acc;
        }, {});
        
        return { data: counts, error: null };
      });
    
    if (statusError) {
      console.error('❌ Error counting status:', statusError.message);
    } else {
      console.log('✅ Match status counts:');
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count} matches`);
      });
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testMatchesAPI();