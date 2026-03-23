import { apiCache } from '$lib/utils/cache.js';
import { browser } from '$app/environment';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * API client with error handling, caching, and authentication
 */
export const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const cacheKey = `${options.method || 'GET'}:${endpoint}`;
    
    // Add auth token if available
    const token = browser ? localStorage.getItem('auth_token') : null;
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
      const cached = apiCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle auth errors
        if (response.status === 401 && browser) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          return;
        }
        throw new Error(data.message || 'API request failed');
      }

      // Cache successful GET requests
      if (!options.method || options.method === 'GET') {
        apiCache.set(cacheKey, data, 300000); // 5 minutes
      }

      // Invalidate related cache on mutations
      if (options.method && ['POST', 'PATCH', 'DELETE'].includes(options.method)) {
        this.invalidateCache(endpoint);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  invalidateCache(endpoint) {
    // Simple cache invalidation - clear all cache for now
    // In production, you'd want more sophisticated invalidation
    if (endpoint.includes('/registrations')) {
      apiCache.delete('GET:/registrations');
      apiCache.delete('GET:/registrations/stats');
    }
    if (endpoint.includes('/draw')) {
      // Clear draw-related cache
      ['sma-putra', 'sma-putri', 'smp-putra', 'smp-putri'].forEach(category => {
        apiCache.delete(`GET:/draw/${category}/teams`);
        apiCache.delete(`GET:/draw/${category}/results`);
      });
    }
    if (endpoint.includes('/schedule/scores')) {
      apiCache.delete('GET:/schedule/scores');
    }
  },

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};
