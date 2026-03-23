/**
 * Match Service
 * Handles all match-related operations with round information
 */

import { apiClient } from '$lib/api/client.js';

export const matchService = {
  /**
   * Get all matches with optional filtering
   */
  async getMatches(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.round) params.append('round', filters.round);
    if (filters.day) params.append('day', filters.day);
    
    const url = `/matches${params.toString() ? '?' + params.toString() : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Get matches by category and round
   */
  async getMatchesByRound(category, round) {
    return await this.getMatches({ category, round });
  },

  /**
   * Get matches by day
   */
  async getMatchesByDay(day) {
    return await this.getMatches({ day });
  },

  /**
   * Get single match by ID
   */
  async getMatch(id) {
    const response = await apiClient.get(`/matches/${id}`);
    return response.data;
  },

  /**
   * Create new match
   */
  async createMatch(matchData) {
    const response = await apiClient.post('/matches', matchData);
    return response.data;
  },

  /**
   * Update match
   */
  async updateMatch(id, updates) {
    const response = await apiClient.patch(`/matches/${id}`, updates);
    return response.data;
  },

  /**
   * Update match status (when score is inputted)
   */
  async updateMatchStatus(id, status) {
    return await this.updateMatch(id, { status });
  },

  /**
   * Mark match as complete
   */
  async completeMatch(id) {
    return await this.updateMatchStatus(id, 'Complete');
  },

  /**
   * Delete match
   */
  async deleteMatch(id) {
    const response = await apiClient.delete(`/matches/${id}`);
    return response.data;
  },

  /**
   * Get tournament bracket structure
   */
  async getTournamentBracket(category) {
    const matches = await this.getMatches({ category });
    
    // Group matches by round
    const bracket = {
      '16 Besar': [],
      '8 Besar': [],
      'Perempat Final': [],
      'Semi Final': [],
      'Final': []
    };
    
    matches.forEach(match => {
      if (bracket[match.round]) {
        bracket[match.round].push(match);
      }
    });
    
    // Sort matches within each round by match_number
    Object.keys(bracket).forEach(round => {
      bracket[round].sort((a, b) => a.match_number - b.match_number);
    });
    
    return bracket;
  },

  /**
   * Get round statistics
   */
  async getRoundStats(category, round) {
    const matches = await this.getMatchesByRound(category, round);
    
    const total = matches.length;
    const completed = matches.filter(m => m.status === 'Complete').length;
    const notPlayedYet = matches.filter(m => m.status === 'Not Play Yet').length;
    
    return {
      total,
      completed,
      notPlayedYet,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  },

  /**
   * Get next matches to be played
   */
  async getUpcomingMatches(limit = 5) {
    const allMatches = await this.getMatches();
    
    return allMatches
      .filter(m => m.status === 'Not Play Yet')
      .sort((a, b) => {
        // Sort by day first, then by match time
        if (a.day !== b.day) return a.day - b.day;
        return a.match_time.localeCompare(b.match_time);
      })
      .slice(0, limit);
  },

  /**
   * Get completed matches with scores
   */
  async getCompletedMatches() {
    const allMatches = await this.getMatches();
    return allMatches.filter(m => m.status === 'Complete');
  }
};