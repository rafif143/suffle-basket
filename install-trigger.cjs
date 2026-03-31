/**
 * Install Winner Resolution Trigger
 * 
 * This script executes the SQL to create the auto-update winner trigger
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Check credentials
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function installTrigger() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   INSTALLING WINNER RESOLUTION TRIGGER                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Read SQL file
  const sqlPath = path.join(__dirname, 'database_winner_trigger.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  console.log(`📄 Read SQL file: ${sqlPath}`);
  console.log(`   Size: ${(sql.length / 1024).toFixed(2)} KB\n`);

  try {
    // Execute SQL via Supabase RPC (if available) or direct connection
    console.log('🚀 Executing SQL...\n');

    // Split SQL into statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      // Skip comments
      if (stmt.startsWith('--')) continue;

      try {
        // Try to execute via Supabase
        const { error } = await supabase.rpc('exec_sql', { sql: stmt });
        
        if (error) {
          // If RPC not available, that's okay - Supabase doesn't always allow direct SQL execution
          if (error.message.includes('function') || error.message.includes('does not exist')) {
            console.log(`⚠️  Statement ${i + 1}: Direct SQL execution not available via API`);
            console.log(`   Please run this in Supabase Dashboard SQL Editor\n`);
          } else {
            console.error(`❌ Statement ${i + 1} failed:`, error.message);
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1}: ${err.message}`);
      }
    }

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ⚠️  MANUAL INSTALLATION REQUIRED                        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log('Supabase JS Client cannot execute raw SQL directly.\n');
    console.log('📋 PLEASE FOLLOW THESE STEPS:\n');
    console.log('1. Open Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/pejazpkzhgrafusepcvb\n');
    console.log('2. Go to SQL Editor (left sidebar)\n');
    console.log('3. Click "New query"\n');
    console.log('4. Copy and paste the contents of: database_winner_trigger.sql\n');
    console.log('5. Click "Run" or press Ctrl+Enter\n');
    console.log('6. Wait for "Success" message\n');
    console.log('7. Verify trigger was created (see verification queries in SQL file)\n');

    console.log('✅ After installation, test with:');
    console.log('   UPDATE match_scores SET score1 = 30, score2 = 20');
    console.log('   WHERE match_key = \'1-M01-sma-putra\';\n');
    
    console.log('   Then check:');
    console.log('   SELECT team1, team2 FROM matches');
    console.log('   WHERE round = \'8 Besar\' AND team1_from = \'M01\';\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nPlease install manually via Supabase Dashboard.\n');
    process.exit(1);
  }
}

installTrigger();
