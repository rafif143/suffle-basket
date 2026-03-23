import { supabase } from '../supabase.js'

// Example 1: Fetch all registrations
export async function getAllRegistrations() {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
  
  if (error) {
    console.error('Error fetching registrations:', error)
    return null
  }
  
  return data
}

// Example 2: Fetch teams by category
export async function getTeamsByCategory(category) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('category', category)
    .order('order_index')
  
  if (error) {
    console.error('Error fetching teams:', error)
    return null
  }
  
  return data
}

// Example 3: Insert a new team
export async function addTeam(teamData) {
  const { data, error } = await supabase
    .from('teams')
    .insert([teamData])
    .select()
  
  if (error) {
    console.error('Error adding team:', error)
    return null
  }
  
  return data[0]
}

// Example 4: Update match score
export async function updateMatchScore(matchKey, score1, score2) {
  const { data, error } = await supabase
    .from('match_scores')
    .upsert({
      match_key: matchKey,
      score1,
      score2,
      updated_at: new Date().toISOString()
    })
    .select()
  
  if (error) {
    console.error('Error updating match score:', error)
    return null
  }
  
  return data[0]
}

// Example 5: Real-time subscription to match scores
export function subscribeToMatchScores(callback) {
  const subscription = supabase
    .channel('match_scores')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'match_scores' }, 
      callback
    )
    .subscribe()
  
  return subscription
}