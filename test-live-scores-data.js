/**
 * Test live scores data loading
 */

async function testLiveScoresData() {
  console.log('🧪 Testing live scores data loading...');

  try {
    // Test 1: Direct API call
    console.log('\n1. Testing direct API call...');
    const response = await fetch('http://localhost:3000/api/matches');
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API call failed:', data.error);
      return;
    }
    
    console.log(`✅ API returned ${data.data.length} matches`);
    
    // Show first few matches
    data.data.slice(0, 3).forEach(match => {
      console.log(`   - ${match.category} ${match.round} M${match.match_number}: ${match.team1} vs ${match.team2}`);
    });

    // Test 2: Check data structure
    console.log('\n2. Checking data structure...');
    if (data.data.length > 0) {
      const match = data.data[0];
      console.log('✅ Sample match structure:');
      console.log(`   - id: ${match.id}`);
      console.log(`   - category: ${match.category}`);
      console.log(`   - round: ${match.round}`);
      console.log(`   - day: ${match.day}`);
      console.log(`   - match_time: ${match.match_time}`);
      console.log(`   - team1: ${match.team1}`);
      console.log(`   - team2: ${match.team2}`);
      console.log(`   - status: ${match.status}`);
    }

    // Test 3: Check scores API
    console.log('\n3. Testing scores API...');
    const scoresResponse = await fetch('http://localhost:3000/api/schedule/scores');
    const scoresData = await scoresResponse.json();
    
    if (!scoresResponse.ok) {
      console.error('❌ Scores API failed:', scoresData.error);
    } else {
      console.log(`✅ Scores API returned ${Object.keys(scoresData.data || {}).length} scores`);
      
      // Show scores
      Object.entries(scoresData.data || {}).forEach(([key, score]) => {
        console.log(`   - ${key}: ${score.score1} - ${score.score2}`);
      });
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testLiveScoresData();