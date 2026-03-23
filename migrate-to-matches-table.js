/**
 * Migration Script: Convert draw_results to matches table
 * This script migrates existing draw_results data to the new matches table structure
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function migrateToMatchesTable() {
  console.log('🔄 Starting migration to matches table...');

  try {
    // 1. First, create the matches table (run the SQL from database-update-rounds.sql)
    console.log('📋 Make sure you have run the SQL from database-update-rounds.sql first!');

    // 2. Get existing draw_results
    console.log('📥 Fetching existing draw_results...');
    const { data: drawResults, error: fetchError } = await supabase
      .from('draw_results')
      .select('*')
      .order('category')
      .order('match_index');

    if (fetchError) {
      throw new Error(`Failed to fetch draw_results: ${fetchError.message}`);
    }

    console.log(`✅ Found ${drawResults.length} draw results to migrate`);

    // 3. Convert draw_results to matches format
    const matches = [];
    
    drawResults.forEach(draw => {
      const [level, gender] = draw.category.split('-');
      
      // Determine day based on category and match_index
      let day;
      if (level === 'sma') {
        if (draw.match_index < 3) day = 1;
        else if (draw.match_index < 5) day = 3;
        else day = 5;
      } else { // smp
        if (draw.match_index < 3) day = 2;
        else if (draw.match_index < 5) day = 4;
        else day = 6;
      }
      
      // Determine time based on match position in day
      const matchInDay = draw.match_index % 3;
      const times = ['15:30', '16:30', '17:30'];
      const match_time = times[matchInDay] || '15:30';
      
      matches.push({
        category: draw.category,
        round: '16 Besar',
        match_number: draw.match_index + 1,
        day: day,
        match_time: match_time,
        team1: draw.team1 === '?' ? 'TBD' : draw.team1,
        team2: draw.team2 === '?' ? 'TBD' : draw.team2,
        status: 'Not Play Yet'
      });
    });

    // 4. Add 8 Besar matches
    const categories = ['sma-putra', 'sma-putri', 'smp-putra', 'smp-putri'];
    
    categories.forEach(category => {
      const [level, gender] = category.split('-');
      const baseDay = level === 'sma' ? 7 : 8;
      
      for (let i = 1; i <= 4; i++) {
        const day = i <= 2 ? baseDay : baseDay + 2;
        const timeSlot = gender === 'putra' ? (i % 2 === 1 ? '19:00' : '20:00') : (i % 2 === 1 ? '15:30' : '16:30');
        
        matches.push({
          category: category,
          round: '8 Besar',
          match_number: i,
          day: day,
          match_time: timeSlot,
          team1: `Winner M${(i-1)*2 + 1}`,
          team2: `Winner M${(i-1)*2 + 2}`,
          team1_from: `Winner 16 Besar M${(i-1)*2 + 1}`,
          team2_from: `Winner 16 Besar M${(i-1)*2 + 2}`,
          status: 'Not Play Yet'
        });
      }
    });

    // 5. Add Semi Final matches
    categories.forEach(category => {
      const [level, gender] = category.split('-');
      const day = level === 'sma' ? 11 : 12;
      
      for (let i = 1; i <= 2; i++) {
        const timeSlot = gender === 'putra' ? (i === 1 ? '19:00' : '20:00') : (i === 1 ? '15:30' : '16:30');
        
        matches.push({
          category: category,
          round: 'Semi Final',
          match_number: i,
          day: day,
          match_time: timeSlot,
          team1: `Winner QF${(i-1)*2 + 1}`,
          team2: `Winner QF${(i-1)*2 + 2}`,
          team1_from: `Winner 8 Besar M${(i-1)*2 + 1}`,
          team2_from: `Winner 8 Besar M${(i-1)*2 + 2}`,
          status: 'Not Play Yet'
        });
      }
    });

    // 6. Add Final matches
    categories.forEach(category => {
      const [level, gender] = category.split('-');
      let timeSlot;
      
      if (level === 'smp' && gender === 'putri') timeSlot = '15:30';
      else if (level === 'smp' && gender === 'putra') timeSlot = '16:30';
      else if (level === 'sma' && gender === 'putri') timeSlot = '19:00';
      else timeSlot = '20:00';
      
      matches.push({
        category: category,
        round: 'Final',
        match_number: 1,
        day: 13,
        match_time: timeSlot,
        team1: 'Winner SF1',
        team2: 'Winner SF2',
        team1_from: 'Winner Semi Final M1',
        team2_from: 'Winner Semi Final M2',
        status: 'Not Play Yet'
      });
    });

    console.log(`📊 Generated ${matches.length} total matches`);
    console.log('   - 16 Besar:', matches.filter(m => m.round === '16 Besar').length);
    console.log('   - 8 Besar:', matches.filter(m => m.round === '8 Besar').length);
    console.log('   - Semi Final:', matches.filter(m => m.round === 'Semi Final').length);
    console.log('   - Final:', matches.filter(m => m.round === 'Final').length);

    // 7. Insert matches into database
    console.log('💾 Inserting matches into database...');
    
    // Insert in batches to avoid timeout
    const batchSize = 50;
    for (let i = 0; i < matches.length; i += batchSize) {
      const batch = matches.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('matches')
        .insert(batch);
      
      if (insertError) {
        throw new Error(`Failed to insert batch ${Math.floor(i/batchSize) + 1}: ${insertError.message}`);
      }
      
      console.log(`   ✅ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(matches.length/batchSize)}`);
    }

    console.log('🎉 Migration completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update your frontend to use the new matchService');
    console.log('2. Update API endpoints to use matches table');
    console.log('3. Test the new functionality');
    console.log('4. Consider backing up and dropping draw_results table if no longer needed');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateToMatchesTable();