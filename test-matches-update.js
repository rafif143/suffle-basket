/**
 * Test matches API update functionality
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testMatchUpdate() {
  console.log('🧪 Testing match update functionality...');

  try {
    // Get a match to update
    console.log('\n1. Getting a match to update...');
    const { data: matches, error: getError } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'Not Play Yet')
      .limit(1);
    
    if (getError || !matches || matches.length === 0) {
      console.error('❌ No matches found to update');
      return;
    }
    
    const match = matches[0];
    console.log(`✅ Found match: ${match.category} ${match.round} M${match.match_number}`);
    console.log(`   Current status: ${match.status}`);
    console.log(`   Match ID: ${match.id}`);

    // Test direct database update
    console.log('\n2. Testing direct database update...');
    const { data: updateData, error: updateError } = await supabase
      .from('matches')
      .update({ status: 'Complete' })
      .eq('id', match.id)
      .select();
    
    if (updateError) {
      console.error('❌ Database update failed:', updateError.message);
    } else {
      console.log('✅ Database update successful');
      console.log(`   New status: ${updateData[0].status}`);
    }

    // Test API endpoint via fetch
    console.log('\n3. Testing API endpoint...');
    try {
      const response = await fetch(`http://localhost:3000/api/matches/${match.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Not Play Yet' })
      });
      
      const apiResult = await response.json();
      
      if (!response.ok) {
        console.error('❌ API update failed:', apiResult.error);
      } else {
        console.log('✅ API update successful');
        console.log(`   New status: ${apiResult.data.status}`);
      }
    } catch (fetchError) {
      console.error('❌ API fetch failed:', fetchError.message);
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testMatchUpdate();