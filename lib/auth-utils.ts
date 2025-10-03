/**
 * Authentication Utilities for Frontend
 * 
 * Provides helper functions to extract access tokens from various sources
 * Used by caching hooks to authenticate API requests
 */

/**
 * Extract access token from multiple possible sources
 */
export function getAccessToken(): string | null {
  // Private helper to get from localStorage
  function tokenFromLocalStorage(): string | null {
    try {
      return localStorage?.getItem('auth_token') || 
             localStorage?.getItem('token') ||
             localStorage?.getItem('access_token');
    } catch (e) {
      console.warn('Local storage access failed:', e);
      return null;
    }
  }

  // Try localStorage first (most common in your app)
  if (tokenFromLocalStorage() !== null) {
    return tokenFromLocalStorage();
  }

  // Try sessionStorage as fallback
  try {
    const sessionToken = sessionStorage?.getItem('auth_token');
    if (sessionToken) {
      return sessionToken;
    }
  } catch (e) {
    console.warn('Session storage access failed:', e);
  }

  // Try cookies as fallback (for SSR compatibility)
  try {
    if (typeof document !== 'undefined') {
      const cookieMatch = document.cookie.match(/auth_token=([^;]+)/);
      if (cookieMatch) {
        return cookieMatch[1];
      }
    }
  } catch (e) {
    console.warn('Cookie access failed:', e);
  }

  console.warn('No access token found in any storage');
  return null;
}

/**
 * Create authorization headers for API requests
 */
export function getAuthHeaders(token?: string): Record<string, string> {
  const accessToken = token || getAccessToken();
  
  if (!accessToken) {
    console.warn('No access token available for request');
    return {
      'Content-Type': 'application/json',
    };
  }

  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isUserAuthenticated(): boolean {
  const token = getAccessToken();
  return token !== null && token.length > 10; // Basic validation
}

/**
 * Wrapper for fetch with automatic auth headers
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = getAuthHeaders();
  
  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  };

  return fetch(url, mergedOptions);
}

/**
 * Wrapper for fetch with timeout and retry logic
 */
export async function robustFetch(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000,
  retries: number = 2
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const authHeaders = getAuthHeaders();
      const mergedOptions: RequestInit = {
        ...options,
        headers: {
          ...authHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      };

      const response = await fetch(url, mergedOptions);
      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      // If it's an auth error, don't retry
      if (response.status === 401 || response.status === 403) {
        console.error(`Authentication failed: ${response.status}`);
        throw new Error(`Authentication failed: ${response.status}`);
      }

      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`Request timeout after ${timeoutMs}ms (attempt ${attempt + 1})`);
      } else {
        console.warn(`Request failed (attempt ${attempt + 1}): ${error}`);
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('All retry attempts failed');
}

/**
 * Make authenticated request with automatic token handling
 */
export async function authenticatedRequest<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000,
  retries: number = 2
): Promise<T> {
  const response = await robustFetch(url, options, timeoutMs, retries);
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
