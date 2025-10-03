/**
 * Cache Management System for Chat Application
 * 
 * This module provides intelligent caching for API responses with:
 * - Automatic expiration handling
 * - Request deduplication
 * - Cache invalidation strategies
 */

export interface CacheItem<T> {
  data: T | null;
  timestamp: number;
  expiresIn: number; // milliseconds
}

export interface CacheConfig {
  knowledgeBase: number; // 5 minutes = 300000ms
  agents: number;        // 10 minutes = 600000ms
  mediaLibrary: number;  // 2 minutes = 120000ms
  chatHistory: number;   // 1 minute = 60000ms
  userProfile: number;   // 15 minutes = 900000ms
}

export const CACHE_CONFIG: CacheConfig = {
  knowledgeBase: 300000,  // 5 minutes - KB doesn't change often
  agents: 600000,         // 10 minutes - agents rarely change
  mediaLibrary: 120000,   // 2 minutes - media might update
  chatHistory: 60000,     // 1 minute - chat history updates frequently
  userProfile: 900000,    // 15 minutes - user profile is stable
};

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private pendingRequests = new Map<string, Promise<any>>();

  /**
   * Check if cache item is valid (not expired)
   */
  private isCacheValid<T>(cacheItem: CacheItem<T>): boolean {
    if (!cacheItem.data) return false;
    
    const now = Date.now();
    const isExpired = (now - cacheItem.timestamp) > cacheItem.expiresIn;
    
    return !isExpired;
  }

  /**
   * Get item from cache if valid
   */
  get<T>(key: string): T | null {
    const cacheItem = this.cache.get(key);
    
    if (!cacheItem || !this.isCacheValid(cacheItem)) {
      // Clean up expired cache
      if (cacheItem && !this.isCacheValid(cacheItem)) {
        this.cache.delete(key);
      }
      return null;
    }

    console.log(`📦 Cache HIT for ${key}`);
    return cacheItem.data;
  }

  /**
   * Set item in cache with expiration
   */
  set<T>(key: string, data: T, expiresIn: number): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };

    this.cache.set(key, cacheItem);
    console.log(`💾 Cached ${key} for ${expiresIn/1000}s`);
    
    // Clean up expired caches periodically
    this.cleanup();
  }

  /**
   * Clear specific cache item
   */
  clear(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️ Cleared cache for ${key}`);
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    console.log(`🗑️ Cleared all cache`);
  }

  /**
   * Check if request is already pending to prevent duplicates
   */
  isRequestPending(key: string): boolean {
    return this.pendingRequests.has(key);
  }

  /**
   * Set pending request promise
   */
  setPendingRequest(key: string, promise: Promise<any>): void {
    this.pendingRequests.set(key, promise);
    
    // Clean up pending request after it completes
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
  }

  /**
   * Get pending request promise
   */
  getPendingRequest(key: string): Promise<any> | null {
    return this.pendingRequests.get(key) || null;
  }

  /**
   * Get all cache keys
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Clean up expired cache entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if ((now - item.timestamp) > item.expiresIn) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
    });

    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getStats(): {
    totalEntries: number;
    expiredEntries: number;
    pendingRequests: number;
    memUsage: string;
  } {
    const totalEntries = this.cache.size;
    const now = Date.now();
    
    let expiredEntries = 0;
    for (const [, item] of this.cache.entries()) {
      if ((now - item.timestamp) > item.expiresIn) {
        expiredEntries++;
      }
    }

    const pendings = this.pendingRequests.size;
    
    // Estimate memory usage (rough calculation)
    const memUsage = `${totalEntries} entries (~${Math.round(totalEntries * 1.2)}KB)`;

    return {
      totalEntries,
      expiredEntries,
      pendingRequests: pendings,
      memUsage,
    };
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Helper functions for easier usage
export const cacheHelpers = {
  /**
   * Get from cache or fetch with caching
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    expiresIn: number
  ): Promise<T> {
    // Check cache first
    const cached = cacheManager.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Check if request is already pending
    const pending = cacheManager.getPendingRequest(key);
    if (pending) {
      console.log(`⏳ Waiting for pending request: ${key}`);
      return pending;
    }

    // Make new request
    console.log(`🌐 Fetching fresh data: ${key}`);
    const promise = fetcher()
      .then(data => {
        // Cache successful response
        cacheManager.set(key, data, expiresIn);
        return data;
      })
      .catch(error => {
        // Don't cache errors
        console.error(`❌ Fetch failed for ${key}:`, error);
        throw error;
      });

    // Track pending request
    cacheManager.setPendingRequest(key, promise);
    
    return promise;
  },

  /**
   * Clear cache when user makes changes
   */
  invalidate(keyPattern?: string): void {
    if (!keyPattern) {
      cacheManager.clearAll();
      return;
    }

    // Clear specific keys matching pattern
    const keys = cacheManager.getKeys();
    for (const key of keys) {
      if (key.includes(keyPattern)) {
        cacheManager.clear(key);
      }
    }
    
    console.log(`🔄 Invalidated cache matching: ${keyPattern}`);
  }
};
