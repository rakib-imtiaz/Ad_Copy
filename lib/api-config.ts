// API Configuration for AdCopy
// This file manages the API base URL and allows switching between mock and real endpoints

export const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/mock',
  
  // API version
  VERSION: 'v1',
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Rate limiting configuration
  RATE_LIMITS: {
    AUTH: 10, // requests per minute
    AGENT_EXECUTION: 30,
    FILE_UPLOAD: 5,
    DEFAULT: 100,
  },
  
  // Timeout settings
  TIMEOUTS: {
    REQUEST: 30000, // 30 seconds
    UPLOAD: 300000, // 5 minutes
  },
}

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '') // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, '') // Remove leading slash
  return `${baseUrl}/${cleanEndpoint}`
}

// Helper function to check if we're using mock API
export function isMockApi(): boolean {
  return API_CONFIG.BASE_URL.includes('/api/mock')
}

// Helper function to get auth headers
export function getAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    ...API_CONFIG.DEFAULT_HEADERS,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

// API endpoint constants
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    OAUTH: '/auth/oauth',
    REFRESH: '/auth/refresh',
  },
  
  // User Management
  USER: {
    PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/changePwd',
  },
  
  // Agent Management
  AGENT: {
    LIST: '/agents/list',
    RUN: '/agent/run',
  },
  
  // Prompt Management
  PROMPT: {
    UPDATE: '/prompt/update',
  },
  
  // Knowledge Base
  KB: {
    INGEST: '/kb/ingest',
    LIST: '/kb/list',
    DELETE: '/kb/delete',
    LINK_ADD: '/kb/linkAdd',
    YT_INGEST: '/kb/ytIngest',
  },
  
  // Conversations
  CONVERSATION: {
    LIST: '/conversation/list',
    GET: '/conversation/get',
    RENAME: '/conversation/rename',
    DELETE: '/conversation',
  },
  
  // Media Library
  MEDIA: {
    LIST: '/media/list',
    UPLOAD: '/media/upload',
  },
  
  // Organization
  ORG: {
    BRAND: '/org/brand',
    LIMITS: '/org/limits',
  },
  
  // Usage
  USAGE: {
    ORG_MONTH: '/usage/orgMonth',
  },
  
  // Webhooks
  WEBHOOK: {
    KB_PROCESSING_COMPLETE: '/webhook/kb-processing-complete',
    CONVERSATION_UPDATED: '/webhook/conversation-updated',
  },
} as const

// Type for API endpoints
export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS][keyof typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS]]

// Helper function to build endpoint URL
export function buildEndpointUrl(category: keyof typeof API_ENDPOINTS, endpoint: string): string {
  return getApiUrl(`${API_ENDPOINTS[category][endpoint as keyof typeof API_ENDPOINTS[typeof category]]}`)
} 