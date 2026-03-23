/**
 * Simple in-memory cache for API responses
 */

class Cache {
	constructor() {
		this.cache = new Map();
		this.ttl = new Map(); // Time to live
	}

	set(key, value, ttlMs = 300000) { // Default 5 minutes
		this.cache.set(key, value);
		this.ttl.set(key, Date.now() + ttlMs);
	}

	get(key) {
		const expiry = this.ttl.get(key);
		if (!expiry || Date.now() > expiry) {
			this.delete(key);
			return null;
		}
		return this.cache.get(key);
	}

	delete(key) {
		this.cache.delete(key);
		this.ttl.delete(key);
	}

	clear() {
		this.cache.clear();
		this.ttl.clear();
	}

	has(key) {
		const expiry = this.ttl.get(key);
		if (!expiry || Date.now() > expiry) {
			this.delete(key);
			return false;
		}
		return this.cache.has(key);
	}
}

export const apiCache = new Cache();