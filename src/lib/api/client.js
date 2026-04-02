import { apiCache } from '$lib/utils/cache.js';
import { browser } from '$app/environment';

// Simple, environment-agnostic API URL
// Works in both dev (Vite proxy) and prod (Vercel serverless)
const API_URL = '/api';

/**
 * API client with error handling, caching, and authentication
 * Works seamlessly in development and production
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

      let data = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        // Handle auth errors (avoid infinite loops)
        if (response.status === 401 && browser && !window.location.pathname.startsWith('/login')) {
          localStorage.removeItem('auth_token');
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          return;
        }
        throw new Error(data.message || data.error || `API request failed with status ${response.status}`);
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
    if (endpoint.includes('/schedule')) {
      apiCache.delete('GET:/schedule?scores=true');
    }
    if (endpoint.includes('/matches')) {
      apiCache.delete('GET:/matches');
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
