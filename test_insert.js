import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testInsert() {
  const match = {
    category: 'sma-putra',
    round: '16 Besar',
    match_number: 1,
    day: 1,
    match_time: '15:00 - 16:00',
    team1: 'Test Team 1',
    team2: 'Test Team 2',
    status: 'Not Play Yet'
  };

  const { data, error } = await supabase.from('matches').insert([match]).select();
  if (error) {
    console.error('Insert Error:', error);
  } else {
    console.log('Insert Success:', data);
  }
}

testInsert();
