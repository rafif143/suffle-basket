# Tournament Rounds Database Solution

## Problem
Saat ini sistem hanya menyimpan match 16 besar di tabel `draw_results` dengan `match_index` (0-7), tapi tidak ada cara yang baik untuk menandai round tournament (16 besar, 8 besar, semi final, final) di database.

## Solution
Membuat tabel `matches` baru yang comprehensive untuk menyimpan semua pertandingan dengan informasi round yang jelas.

## Database Schema

### New Table: `matches`
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(20) NOT NULL CHECK (category IN ('sma-putra', 'sma-putri', 'smp-putra', 'smp-putri')),
  round VARCHAR(20) NOT NULL CHECK (round IN ('16 Besar', '8 Besar', 'Perempat Final', 'Semi Final', 'Final')),
  match_number INTEGER NOT NULL, -- 1, 2, 3, etc within the round
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 13),
  match_time VARCHAR(20) NOT NULL, -- e.g., '15:30'
  team1 VARCHAR(255) NOT NULL,
  team2 VARCHAR(255) NOT NULL,
  team1_from VARCHAR(100), -- e.g., 'Winner M01' for dependency tracking
  team2_from VARCHAR(100), -- e.g., 'Winner M02' for dependency tracking
  status VARCHAR(20) DEFAULT 'Not Play Yet' CHECK (status IN ('Not Play Yet', 'Complete')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Features
1. **Round Information**: Explicit `round` field dengan nilai yang jelas
2. **Match Dependencies**: `team1_from` dan `team2_from` untuk tracking winner dari match sebelumnya
3. **Status Tracking**: Status match ('Not Play Yet', 'Complete')
4. **Complete Schedule**: Semua round dari 16 besar sampai final
5. **Time Management**: Day dan time untuk setiap match

## Tournament Structure

### 16 Besar (32 matches total)
- **SMA Putra**: 8 matches (Day 1, 3, 5)
- **SMA Putri**: 8 matches (Day 1, 3, 5)  
- **SMP Putra**: 8 matches (Day 2, 4, 6)
- **SMP Putri**: 8 matches (Day 2, 4, 6)

### 8 Besar (16 matches total)
- **SMA**: Day 7, 9
- **SMP**: Day 8, 10
- Teams: Winner dari 16 besar

### Semi Final (8 matches total)
- **SMA**: Day 11
- **SMP**: Day 12
- Teams: Winner dari 8 besar

### Final (4 matches total)
- **All Categories**: Day 13
- Teams: Winner dari semi final

## API Endpoints

### GET /api/matches
Get all matches with optional filtering:
```javascript
// Get all matches
GET /api/matches

// Get by category
GET /api/matches?category=sma-putra

// Get by round
GET /api/matches?round=16%20Besar

// Get by day
GET /api/matches?day=1

// Combined filters
GET /api/matches?category=sma-putra&round=Semi%20Final
```

### GET /api/matches/:id
Get single match by ID

### POST /api/matches
Create new match

### PUT /api/matches/:id
Update match (including status when score is inputted)

## Frontend Service

### matchService.js
```javascript
import { matchService } from '$lib/services';

// Get tournament bracket
const bracket = await matchService.getTournamentBracket('sma-putra');

// Get matches by round
const matches = await matchService.getMatchesByRound('sma-putra', '16 Besar');

// Update match status when score is inputted
await matchService.completeMatch(matchId);

// Get upcoming matches
const upcoming = await matchService.getUpcomingMatches(5);
```

## Migration Process

1. **Run SQL Schema**:
   ```bash
   # Execute database-update-rounds.sql in Supabase dashboard
   ```

2. **Migrate Data**:
   ```bash
   node migrate-to-matches-table.js
   ```

3. **Update Frontend**:
   - Replace `scheduleGenerator.js` logic with `matchService`
   - Update components to use new match structure
   - Update status handling

## Benefits

1. **Clear Round Tracking**: Setiap match punya round yang jelas
2. **Better Status Management**: Status 'Not Play Yet' vs 'Complete'
3. **Dependency Tracking**: Tahu team mana yang advance dari round sebelumnya
4. **Scalable**: Mudah add round baru atau modify tournament structure
5. **Performance**: Proper indexing untuk query yang cepat
6. **Data Integrity**: Constraints untuk ensure data consistency

## Usage Examples

### Schedule Page
```javascript
// Get matches for specific day
const dayMatches = await matchService.getMatchesByDay(1);

// When score is inputted, update status
await matchService.completeMatch(matchId);
```

### Live Scores Page
```javascript
// Get all completed matches with scores
const completedMatches = await matchService.getCompletedMatches();

// Get bracket structure
const bracket = await matchService.getTournamentBracket('sma-putra');
```

### Draw Page
```javascript
// Get 16 besar matches for drawing
const drawMatches = await matchService.getMatchesByRound('sma-putra', '16 Besar');
```

## Status Flow

1. **Match Created**: Status = 'Not Play Yet'
2. **Score Inputted**: Status = 'Complete'
3. **Winner Advances**: Next round match gets real team name instead of 'Winner M01'

## Next Steps

1. Run migration script
2. Update frontend components
3. Test all functionality
4. Deploy to production
5. Monitor and optimize

This solution provides a robust foundation for tournament management with clear round tracking and proper status management.