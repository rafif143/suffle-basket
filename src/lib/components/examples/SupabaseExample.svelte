<script>
  import { onMount } from 'svelte'
  import { getAllRegistrations, getTeamsByCategory } from '../../examples/supabase-example.js'
  
  let registrations = []
  let teams = []
  let loading = true
  let selectedCategory = 'putra'
  
  onMount(async () => {
    await loadData()
  })
  
  async function loadData() {
    loading = true
    
    // Fetch registrations
    const regData = await getAllRegistrations()
    if (regData) {
      registrations = regData
    }
    
    // Fetch teams for selected category
    const teamData = await getTeamsByCategory(selectedCategory)
    if (teamData) {
      teams = teamData
    }
    
    loading = false
  }
  
  async function handleCategoryChange() {
    const teamData = await getTeamsByCategory(selectedCategory)
    if (teamData) {
      teams = teamData
    }
  }
</script>

<div class="p-6 max-w-4xl mx-auto">
  <h1 class="text-2xl font-bold mb-6">Supabase Power Example</h1>
  
  {#if loading}
    <div class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading data...</p>
    </div>
  {:else}
    <!-- Registrations Section -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Team Registrations ({registrations.length})</h2>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each registrations as registration}
          <div class="bg-white rounded-lg shadow p-4 border">
            <h3 class="font-semibold text-lg">{registration.school_name}</h3>
            <p class="text-sm text-gray-600">{registration.level} - {registration.gender}</p>
            <p class="text-sm text-gray-500 mt-2">{registration.school_address}</p>
            <span class="inline-block mt-2 px-2 py-1 text-xs rounded-full 
              {registration.status === 'approved' ? 'bg-green-100 text-green-800' : 
               registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
               'bg-gray-100 text-gray-800'}">
              {registration.status || 'pending'}
            </span>
          </div>
        {/each}
      </div>
    </section>
    
    <!-- Teams Section -->
    <section>
      <div class="flex items-center gap-4 mb-4">
        <h2 class="text-xl font-semibold">Teams</h2>
        <select 
          bind:value={selectedCategory} 
          on:change={handleCategoryChange}
          class="px-3 py-1 border rounded-md"
        >
          <option value="putra">Putra</option>
          <option value="putri">Putri</option>
        </select>
      </div>
      
      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {#each teams as team}
          <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div class="font-medium">{team.team_name}</div>
            <div class="text-sm text-blue-600">{team.category}</div>
            <div class="text-xs text-gray-500">Order: {team.order_index}</div>
          </div>
        {/each}
      </div>
      
      {#if teams.length === 0}
        <p class="text-gray-500 text-center py-8">No teams found for {selectedCategory} category</p>
      {/if}
    </section>
  {/if}
</div>