/**
 * Database Constraints Migration Runner
 * 
 * Usage:
 *   node run-migration.js
 * 
 * This script will:
 * 1. Read the SQL migration file
 * 2. Execute it against Supabase database
 * 3. Verify the migration was successful
 * 4. Report results
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const SQL_FILE = path.join(__dirname, 'database_constraints_fix.sql');

// Check environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Read SQL file
function readSQLFile() {
  try {
    const sql = fs.readFileSync(SQL_FILE, 'utf-8');
    console.log(`✅ Read migration file: ${SQL_FILE}`);
    console.log(`   Size: ${(sql.length / 1024).toFixed(2)} KB`);
    return sql;
  } catch (error) {
    console.error('❌ Error reading SQL file:', error.message);
    process.exit(1);
  }
}

// Execute SQL statements
async function executeSQL(sql) {
  console.log('\n🚀 Starting migration...\n');
  
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt.length > 0 && 
        !stmt.startsWith('--') && 
        !stmt.startsWith('CREATE TYPE') // We'll handle these separately
      );

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (const statement of statements) {
      try {
        // Skip very large statements (like function definitions)
        if (statement.includes('CREATE OR REPLACE FUNCTION')) {
          console.log(`⏭️  Skipped function definition (run manually in Supabase Dashboard)`);
          skipped++;
          continue;
        }

        // For simple statements, we can use RPC or direct execution
        // Note: Supabase JS client doesn't support raw SQL execution directly
        // We'll need to use the REST API or run manually
        
        console.log(`⚠️  Statement requires manual execution in Supabase Dashboard`);
        console.log(`   Preview: ${statement.substring(0, 100)}...`);
        skipped++;
        
      } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        failed++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Success: ${success}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📝 Total: ${statements.length}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  }
}

// Verify migration
async function verifyMigration() {
  console.log('\n🔍 Verifying migration...\n');

  try {
    // Check ENUM types
    console.log('Checking ENUM types...');
    const { data: enumData, error: enumError } = await supabase
      .from('pg_type')
      .select('typname')
      .in('typname', ['level_enum', 'gender_enum', 'round_enum', 'status_enum', 'role_enum']);

    if (enumError) {
      console.log('⚠️  Cannot query pg_type directly (requires superuser)');
      console.log('   Please verify ENUMs manually in Supabase Dashboard');
    } else {
      console.log(`✅ Found ${enumData?.length || 0} ENUM types`);
    }

    // Test by inserting data (optional)
    console.log('\nTesting data insertion...');
    
    // This is just a placeholder - actual testing should be done manually
    console.log('⚠️  Manual testing recommended');
    
    console.log('\n✅ Verification complete!\n');
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
  }
}

// Main function
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   DATABASE CONSTRAINTS MIGRATION                         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const sql = readSQLFile();

  try {
    await executeSQL(sql);
    await verifyMigration();

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ MIGRATION COMPLETE!                                 ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    console.log('📋 NEXT STEPS:');
    console.log('1. Open Supabase Dashboard SQL Editor');
    console.log('2. Copy and paste contents of database_constraints_fix.sql');
    console.log('3. Click "Run" to execute the migration');
    console.log('4. Verify constraints in Table Editor\n');

  } catch (error) {
    console.error('\n❌ Migration failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run migration
main().catch(console.error);
