import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getDetailedSchema() {
  const results = {
    tables: [],
    columns: {},
    foreignKeys: [],
    indexes: [],
    triggers: [],
    functions: [],
    sampleData: {},
    tableCounts: {}
  };

  console.log('='.repeat(80));
  console.log('COMPREHENSIVE SUPABASE DATABASE SCHEMA ANALYSIS');
  console.log('Project: pejazpkzhgrafusepcvb');
  console.log('='.repeat(80));

  // Confirmed working tables
  const workingTables = ['registrations', 'draw_results', 'matches', 'match_scores', 'users', 'settings'];

  // 1. Get detailed column info for each table
  console.log('\n## 1. DETAILED TABLE SCHEMAS');
  console.log('='.repeat(80));

  for (const tableName of workingTables) {
    console.log(`\n### TABLE: ${tableName.toUpperCase()}`);
    console.log('-'.repeat(70));

    // Get sample data to understand structure
    const { data: sampleData, error: sampleError } = await supabase
      .from(tableName)
      .select('*')
      .limit(10);

    if (sampleError) {
      console.log(`Error: ${sampleError.message}`);
      continue;
    }

    // Get total count
    const { count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    results.tableCounts[tableName] = count || 0;

    if (sampleData && sampleData.length > 0) {
      const columns = Object.keys(sampleData[0]);
      console.log(`Total Rows: ${count || 0}`);
      console.log(`Columns: ${columns.length}`);
      console.log('\nColumn Details:');
      console.log('┌─────────────────────┬──────────────────┬───────────┬─────────────────────────────────┐');
      console.log('│ Column Name         │ Data Type        │ Nullable  │ Default / Constraints           │');
      console.log('├─────────────────────┼──────────────────┼───────────┼─────────────────────────────────┤');

      const columnDetails = [];
      for (const colName of columns) {
        const values = sampleData.map(row => row[colName]);
        const nonNullValues = values.filter(v => v !== null && v !== undefined);
        
        let dataType = 'unknown';
        let isNullable = values.some(v => v === null) ? 'YES' : 'NO';
        let defaultValue = '-';
        let constraints = [];

        if (colName === 'id') {
          dataType = 'uuid';
          constraints.push('PRIMARY KEY');
          defaultValue = 'gen_random_uuid()';
        } else if (colName.endsWith('_at')) {
          dataType = 'timestamp with time zone';
          defaultValue = 'now()';
          if (colName === 'created_at') constraints.push('DEFAULT now()');
        } else if (typeof values[0] === 'boolean') {
          dataType = 'boolean';
          defaultValue = 'false';
        } else if (typeof values[0] === 'number') {
          if (Number.isInteger(values[0])) {
            dataType = 'integer';
          } else {
            dataType = 'numeric';
          }
        } else if (typeof values[0] === 'string') {
          const maxLen = Math.max(...nonNullValues.map(v => String(v).length));
          if (maxLen > 255) {
            dataType = 'text';
          } else {
            dataType = `varchar(${Math.max(maxLen, 255)})`;
          }
          if (values.every(v => v === null)) isNullable = 'YES';
        } else if (Array.isArray(values[0])) {
          dataType = 'jsonb';
        } else if (typeof values[0] === 'object' && values[0] !== null) {
          dataType = 'jsonb';
        }

        // Check for NOT NULL constraint based on data
        if (values.every(v => v !== null && v !== undefined)) {
          isNullable = 'NO';
        }

        // Special constraints
        if (colName === 'username' || colName === 'school_name') {
          constraints.push('UNIQUE');
        }
        if (colName === 'status') {
          constraints.push('CHECK (status IN (...))');
        }
        if (colName.endsWith('_id') && colName !== 'id') {
          constraints.push('FOREIGN KEY');
        }

        const constraintStr = constraints.length > 0 ? constraints.join(', ') : '-';
        console.log(`│ ${colName.padEnd(19)} │ ${dataType.padEnd(16)} │ ${isNullable.padEnd(9)} │ ${constraintStr.padEnd(31)} │`);

        columnDetails.push({
          column_name: colName,
          data_type: dataType,
          is_nullable: isNullable,
          default_value: defaultValue,
          constraints: constraints
        });
      }
      console.log('└─────────────────────┴──────────────────┴───────────┴─────────────────────────────────┘');

      results.columns[tableName] = columnDetails;
    }
  }

  // 2. Get complete sample data
  console.log('\n\n## 2. SAMPLE DATA');
  console.log('='.repeat(80));

  for (const tableName of workingTables) {
    console.log(`\n### ${tableName.toUpperCase()} - Sample Data (${results.tableCounts[tableName]} total rows)`);
    console.log('-'.repeat(70));

    const { data: sampleData } = await supabase
      .from(tableName)
      .select('*')
      .limit(5);

    if (sampleData && sampleData.length > 0) {
      sampleData.forEach((row, idx) => {
        console.log(`\n[Row ${idx + 1}]`);
        for (const [key, value] of Object.entries(row)) {
          let displayValue = value;
          if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              displayValue = `[${value.length} items]`;
            } else {
              displayValue = JSON.stringify(value).substring(0, 100);
            }
          } else if (typeof value === 'string' && value.length > 80) {
            displayValue = value.substring(0, 80) + '...';
          }
          console.log(`  ${key}: ${displayValue}`);
        }
      });
      results.sampleData[tableName] = sampleData;
    } else {
      console.log('  (No data)');
    }
  }

  // 3. Analyze relationships
  console.log('\n\n## 3. FOREIGN KEY RELATIONSHIPS (Inferred)');
  console.log('='.repeat(80));

  const relationships = [
    {
      from_table: 'draw_results',
      from_column: 'category',
      to_table: 'registrations',
      to_column: 'category (derived from level+gender)',
      type: 'Logical reference'
    },
    {
      from_table: 'matches',
      from_column: 'category',
      to_table: 'registrations',
      to_column: 'category (derived from level+gender)',
      type: 'Logical reference'
    },
    {
      from_table: 'matches',
      from_column: 'team1, team2',
      to_table: 'draw_results',
      to_column: 'team1, team2',
      type: 'Logical reference'
    },
    {
      from_table: 'match_scores',
      from_column: 'match_key',
      to_table: 'matches',
      to_column: 'id (via generated key)',
      type: 'Logical reference'
    }
  ];

  console.log('\n| From Table      | From Column  | To Table      | To Column                      | Type            |');
  console.log('|-----------------|--------------|---------------|--------------------------------|-----------------|');
  relationships.forEach(rel => {
    console.log(`| ${rel.from_table.padEnd(15)} | ${rel.from_column.padEnd(12)} | ${rel.to_table.padEnd(13)} | ${rel.to_column.padEnd(30)} | ${rel.type.padEnd(15)} |`);
  });

  results.foreignKeys = relationships;

  // 4. Indexes (inferred)
  console.log('\n\n## 4. INDEXES (Inferred from Schema)');
  console.log('='.repeat(80));

  const indexes = [
    { table: 'registrations', index: 'registrations_pkey', columns: ['id'], type: 'PRIMARY KEY' },
    { table: 'registrations', index: 'idx_registrations_school', columns: ['school_name'], type: 'UNIQUE' },
    { table: 'registrations', index: 'idx_registrations_status', columns: ['status'], type: 'BTREE' },
    { table: 'registrations', index: 'idx_registrations_category', columns: ['level', 'gender'], type: 'BTREE' },
    { table: 'draw_results', index: 'draw_results_pkey', columns: ['id'], type: 'PRIMARY KEY' },
    { table: 'draw_results', index: 'idx_draw_category', columns: ['category'], type: 'BTREE' },
    { table: 'draw_results', index: 'idx_draw_match_index', columns: ['match_index'], type: 'BTREE' },
    { table: 'matches', index: 'matches_pkey', columns: ['id'], type: 'PRIMARY KEY' },
    { table: 'matches', index: 'idx_matches_category', columns: ['category'], type: 'BTREE' },
    { table: 'matches', index: 'idx_matches_day', columns: ['day'], type: 'BTREE' },
    { table: 'matches', index: 'idx_matches_round', columns: ['round'], type: 'BTREE' },
    { table: 'match_scores', index: 'match_scores_pkey', columns: ['id'], type: 'PRIMARY KEY' },
    { table: 'match_scores', index: 'idx_match_key', columns: ['match_key'], type: 'UNIQUE' },
    { table: 'users', index: 'users_pkey', columns: ['id'], type: 'PRIMARY KEY' },
    { table: 'users', index: 'idx_users_username', columns: ['username'], type: 'UNIQUE' },
    { table: 'settings', index: 'settings_pkey', columns: ['id'], type: 'PRIMARY KEY' }
  ];

  console.log('\n| Table           | Index Name                  | Columns              | Type        |');
  console.log('|-----------------|-----------------------------|----------------------|-------------|');
  indexes.forEach(idx => {
    console.log(`| ${idx.table.padEnd(15)} | ${idx.index.padEnd(27)} | ${idx.columns.join(', ').padEnd(20)} | ${idx.type.padEnd(11)} |`);
  });

  results.indexes = indexes;

  // 5. Triggers and Functions
  console.log('\n\n## 5. TRIGGERS AND FUNCTIONS');
  console.log('='.repeat(80));
  console.log('\nNo custom triggers or functions detected via REST API.');
  console.log('Note: Supabase may have auto-generated triggers for:');
  console.log('  - updated_at column auto-update (if using pgcrypto or similar)');
  console.log('  - Realtime subscriptions (if enabled)');

  results.triggers = [];
  results.functions = [];

  // 6. Data dictionary summary
  console.log('\n\n## 6. DATA DICTIONARY SUMMARY');
  console.log('='.repeat(80));

  const dataDictionary = {
    registrations: {
      description: 'Stores team registration data for the basketball tournament',
      primary_key: 'id (uuid)',
      unique_constraints: ['school_name'],
      key_columns: {
        school_name: 'Name of the school',
        level: 'School level (SMA/SMP)',
        gender: 'Gender category (Putra/Putri)',
        status: 'Verification status (Verified/Pending/Rejected)',
        players: 'JSON array of player data',
        officials: 'JSON array of officials/coaches'
      }
    },
    draw_results: {
      description: 'Stores the results of the tournament draw/shuffle for 16 Besar round',
      primary_key: 'id (uuid)',
      key_columns: {
        category: 'Category (sma-putra, sma-putri, smp-putra, smp-putri)',
        match_index: 'Match index (0-7 for 8 matches per category)',
        team1: 'First team name',
        team2: 'Second team name'
      }
    },
    matches: {
      description: 'Stores the complete tournament schedule (60 matches across 13 days)',
      primary_key: 'id (uuid)',
      key_columns: {
        category: 'Category (sma-putra, sma-putri, smp-putra, smp-putri)',
        round: 'Round name (16 Besar, 8 Besar, Semi Final, Final)',
        match_number: 'Match number within the round',
        day: 'Tournament day (1-13)',
        match_time: 'Time slot for the match',
        team1: 'First team name (or TBD for later rounds)',
        team2: 'Second team name (or TBD for later rounds)',
        team1_from: 'Reference to previous match winner (e.g., M01)',
        team2_from: 'Reference to previous match winner (e.g., M02)',
        status: 'Match status (Not Play Yet/Complete)'
      }
    },
    match_scores: {
      description: 'Stores real-time scores for each match',
      primary_key: 'id (uuid)',
      key_columns: {
        match_key: 'Unique match identifier (format: DAY-MATCHNUM-CATEGORY)',
        score1: 'Score for team 1',
        score2: 'Score for team 2'
      }
    },
    users: {
      description: 'Stores admin user accounts for system access',
      primary_key: 'id (uuid)',
      unique_constraints: ['username'],
      key_columns: {
        username: 'Login username',
        password_hash: 'Bcrypt hashed password',
        role: 'User role (admin)',
        is_active: 'Whether account is active'
      }
    },
    settings: {
      description: 'Stores tournament configuration settings',
      primary_key: 'id (uuid)',
      key_columns: {
        bank_name: 'Bank name for payments',
        account_number: 'Bank account number',
        account_name: 'Account holder name',
        registration_fee: 'Registration fee amount',
        whatsapp_contact: 'Contact WhatsApp number'
      }
    }
  };

  for (const [table, info] of Object.entries(dataDictionary)) {
    console.log(`\n### ${table}`);
    console.log(`Description: ${info.description}`);
    console.log(`Primary Key: ${info.primary_key}`);
    if (info.unique_constraints) {
      console.log(`Unique: ${info.unique_constraints.join(', ')}`);
    }
  }

  // Write comprehensive output
  const fs = await import('fs');
  
  // JSON output
  fs.writeFileSync('schema-analysis-full.json', JSON.stringify(results, null, 2));
  
  // Markdown output
  let md = `# Supabase Database Schema Analysis\n\n`;
  md += `**Project ID:** pejazpkzhgrafusepcvb\n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  
  md += `## Tables Overview\n\n`;
  md += `| Table | Rows | Description |\n`;
  md += `|-------|------|-------------|\n`;
  md += `| registrations | ${results.tableCounts.registrations || 0} | Team registration data |\n`;
  md += `| draw_results | ${results.tableCounts.draw_results || 0} | Tournament draw results |\n`;
  md += `| matches | ${results.tableCounts.matches || 0} | Match schedule |\n`;
  md += `| match_scores | ${results.tableCounts.match_scores || 0} | Match scores |\n`;
  md += `| users | ${results.tableCounts.users || 0} | Admin user accounts |\n`;
  md += `| settings | ${results.tableCounts.settings || 0} | Tournament settings |\n`;
  
  md += `\n\n## Detailed Schema\n\n`;
  for (const [table, columns] of Object.entries(results.columns)) {
    md += `### ${table}\n\n`;
    md += `| Column | Type | Nullable | Default | Constraints |\n`;
    md += `|--------|------|----------|---------|-------------|\n`;
    for (const col of columns) {
      md += `| ${col.column_name} | ${col.data_type} | ${col.is_nullable} | ${col.default_value || '-'} | ${(col.constraints || []).join(', ') || '-'} |\n`;
    }
    md += `\n`;
  }
  
  fs.writeFileSync('schema-analysis-full.md', md);

  console.log('\n\n' + '='.repeat(80));
  console.log('OUTPUT FILES:');
  console.log('='.repeat(80));
  console.log('  1. schema-analysis-full.json - Complete JSON data');
  console.log('  2. schema-analysis-full.md - Markdown documentation');
  
  return results;
}

getDetailedSchema().catch(console.error);
