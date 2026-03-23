import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? '✓ Found' : '✗ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing environment variables!');
  console.log('Check your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test connection
async function testConnection() {
  try {
    console.log('\n🔄 Testing database connection...');
    
    // Test 1: Check registrations table
    const { data: regData, error: regError } = await supabase
      .from('registrations')
      .select('count');
    
    if (regError) {
      console.error('❌ Registrations table error:', regError.message);
      console.log('\n💡 Did you run schema.sql in Supabase SQL Editor?');
      return;
    }
    
    console.log('✅ Registrations table: OK');
    
    // Test 2: Check teams table
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('count');
    
    if (teamError) {
      console.error('❌ Teams table error:', teamError.message);
      return;
    }
    
    console.log('✅ Teams table: OK');
    
    // Test 3: Check draw_results table
    const { data: drawData, error: drawError } = await supabase
      .from('draw_results')
      .select('count');
    
    if (drawError) {
      console.error('❌ Draw results table error:', drawError.message);
      return;
    }
    
    console.log('✅ Draw results table: OK');
    
    // Test 4: Check match_scores table
    const { data: scoreData, error: scoreError } = await supabase
      .from('match_scores')
      .select('count');
    
    if (scoreError) {
      console.error('❌ Match scores table error:', scoreError.message);
      return;
    }
    
    console.log('✅ Match scores table: OK');
    
    // Test 5: Check settings table
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('count');
    
    if (settingsError) {
      console.error('❌ Settings table error:', settingsError.message);
      return;
    }
    
    console.log('✅ Settings table: OK');
    
    // Test 6: Check storage bucket
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.error('❌ Storage error:', bucketError.message);
      return;
    }
    
    const tournamentBucket = buckets.find(b => b.name === 'tournament-files');
    
    if (tournamentBucket) {
      console.log('✅ Storage bucket: OK');
    } else {
      console.log('⚠️  Storage bucket "tournament-files" not found');
      console.log('   Create it in Supabase Dashboard → Storage');
    }
    
    console.log('\n🎉 All tests passed! Database is ready!');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
  }
}

testConnection();
