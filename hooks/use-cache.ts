'use client'

/**
 * React Hook for Cache Management
 * 
 * Provides a clean React interface for the cache system
 */

import { useState, useCallback, useEffect } from 'react';
import { cacheManager, cacheHelpers, CacheConfig, CACHE_CONFIG } from '@/lib/cache-manager';
import { authenticatedRequest } from '@/lib/auth-utils';

export interface UseCacheReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
  clear: () => void;
}

export interface UseCacheOptions {
  autoFetch?: boolean;
  cacheTime?: number;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Hook for cached data fetching
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
): UseCacheReturn<T> {
  const {
    autoFetch = true,
    cacheTime = CACHE_CONFIG[key as keyof CacheConfig] || 300000,
    retryCount = 2,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(() => {
    // Initialize with cache if exists
    return cacheManager.get<T>(key);
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWithRetry = useCallback(async (attempt = 0): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await cacheHelpers.getOrFetch(
        key,
        fetcher,
        cacheTime
      );

      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      if (attempt < retryCount) {
        console.log(`🔄 Retry attempt ${attempt + 1}/${retryCount} for ${key}`);
        setTimeout(async () => {
          await fetchWithRetry(attempt + 1);
        }, retryDelay * Math.pow(2, attempt)); // Exponential backoff
      } else {
        setError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, cacheTime, retryCount, retryDelay]);

  const refresh = useCallback(async (): Promise<void> => {
    // Clear cache and fetch fresh data
    cacheManager.clear(key);
    await fetchWithRetry();
  }, [key, fetchWithRetry]);

  const clear = useCallback((): void => {
    cacheManager.clear(key);
    setData(null);
    setError(null);
  }, [key]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && !cacheManager.get<T>(key)) {
      fetchWithRetry();
    }
  }, [autoFetch, key, fetchWithRetry]);

  return {
    data,
    isLoading,
    error,
    fetch: fetchWithRetry,
    refresh,
    clear,
  };
}

/**
 * Hook for knowledge base with specialized config
 */
export function useKnowledgeBase() {
  return useCache(
    'knowledgeBase',
    async () => {
      const result = await authenticatedRequest(
        '/api/knowledge-base',
        { method: 'GET' }
      ) as { data?: { content?: string } };
      return result.data?.content || '';
    },
    {
      autoFetch: true,
      cacheTime: CACHE_CONFIG.knowledgeBase,
      retryCount: 1, // Less retries for KB since it's not critical
    }
  );
}

/**
 * Hook for agents with specialized config
 */
export function useAgents() {
  return useCache(
    'agents',
    async () => {
      const data = await authenticatedRequest(
        '/api/agents/active-list',
        { method: 'GET' }
      );
      
      // Transform the API response to match our agent interface
      const agentsArray = Array.isArray(data) ? data : [data];
      
      return agentsArray.map((agent: any, index: number) => ({
        id: agent.agent_id || `agent_${index}`,
        name: agent.agent_id 
          ? agent.agent_id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
          : `Agent ${index + 1}`,
        description: agent.short_description || 
          `AI Agent: ${agent.agent_id?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Default'}`,
        icon: ["📱", "📧", "🎯", "✍️", "🎨"][index] || "🤖",
      }));
    },
    {
      autoFetch: true,
      cacheTime: CACHE_CONFIG.agents,
    }
  );
}

/**
 * Hook for media library with specialized config
 */
export function useMediaLibrary() {
  return useCache(
    'mediaLibrary',
    async () => {
      // Fetch both media and scraped content in parallel
      const [mediaResponse, scrapedResponse] = await Promise.allSettled([
        authenticatedRequest('/api/media/list', { method: 'GET' }),
        authenticatedRequest('/api/scraped-contents', { method: 'GET' })
      ]);

      const mediaItems = [];
      
      // Process media files
      if (mediaResponse.status === 'fulfilled') {
        const mediaData = mediaResponse.value as { data?: any[] };
        if (mediaData.data && Array.isArray(mediaData.data)) {
          mediaItems.push(...mediaData.data.map((item: any) => ({
            id: `media-${item.id}`,
            filename: item.filename,
            type: item.type,
            content: item.content,
            uploadedAt: new Date(item.created_at || Date.now()),
            size: item.size || 0,
            title: item.filename,
          })));
        }
      }

      // Process scraped content
      if (scrapedResponse.status === 'fulfilled') {
        const scrapedData = scrapedResponse.value as { data?: any[] };
        if (scrapedData.data && Array.isArray(scrapedData.data)) {
          mediaItems.push(...scrapedData.data.map((item: any) => ({
            id: `scraped-${item.resource_id || item.id || Math.random()}`,
            filename: item.resource_name || item.filename || 'Unknown',
            type: item.type || 'scraped',
            content: item.content,
            transcript: item.transcript,
            url: item.url,
            uploadedAt: new Date(item.created_at || Date.now()),
            size: item.content ? item.content.length : 0,
            title: item.resource_name || item.title || 'Scraped Content',
            resourceId: item.resource_id,
            resourceName: item.resource_name,
          })));
        }
      }

      return mediaItems;
    },
    {
      autoFetch: true,
      cacheTime: CACHE_CONFIG.mediaLibrary,
    }
  );
}

/**
 * Hook for chat history with specialized config
 */
export function useChatHistory() {
  return useCache(
    'chatHistory',
    async () => {
      const result = await authenticatedRequest(
        '/api/chat-history',
        { method: 'GET' }
      ) as { data?: any[] };
      return result.data || [];
    },
    {
      autoFetch: true,
      cacheTime: CACHE_CONFIG.chatHistory,
    }
  );
}

/**
 * Cache debugging hook for development
 */
export function useCacheDebug() {
  const [stats, setStats] = useState(cacheManager.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cacheManager.getStats());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const clearAllCache = useCallback(() => {
    cacheManager.clearAll();
    setStats(cacheManager.getStats());
  }, []);

  return {
    stats,
    clearAllCache,
    cacheManager,
  };
}
