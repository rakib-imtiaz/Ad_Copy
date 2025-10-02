// API Configuration for AdCopy
// This file manages the API base URL for real endpoints

export const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  
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

// Helper function to check if we're using mock API (deprecated)
export function isMockApi(): boolean {
  return false // No longer using mock API
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
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
  },
  
  // n8n webhooks
  N8N_WEBHOOKS: {
    REGISTRATION: 'https://n8n.srv934833.hstgr.cloud/webhook/user-registration',
    LOGIN: 'https://n8n.srv934833.hstgr.cloud/webhook/user-log-in',
    VERIFY_CODE: 'https://n8n.srv934833.hstgr.cloud/webhook/verification-code-validate',
    REFRESH_TOKEN: 'https://n8n.srv934833.hstgr.cloud/webhook/refresh-token',
    CHAT: 'https://n8n.srv934833.hstgr.cloud/webhook/chat-window',
    NEW_CHAT: 'https://n8n.srv934833.hstgr.cloud/webhook/new-chat',
    CHAT_WINDOW: 'https://n8n.srv934833.hstgr.cloud/webhook/chat-window',
    FETCH_USER_PROFILE: 'https://n8n.srv934833.hstgr.cloud/webhook/fetch-user-profile',
          AGENT_LIST: 'https://n8n.srv934833.hstgr.cloud/webhook/agent-list',
          ACTIVE_AGENT_LIST: 'https://n8n.srv934833.hstgr.cloud/webhook/active-agent-list',
          CREATE_AGENT: 'https://n8n.srv934833.hstgr.cloud/webhook/create-agent',
          DELETE_AGENT: 'https://n8n.srv934833.hstgr.cloud/webhook/delete-agent',
          UPDATE_SYSTEM_PROMPT: 'https://n8n.srv934833.hstgr.cloud/webhook/update-system-prompt',
          ACTIVATE_AGENT: 'https://n8n.srv934833.hstgr.cloud/webhook/activate-agent',
    UPLOAD_KNOWLEDGE_BASE: 'https://n8n.srv934833.hstgr.cloud/webhook/upload-knowledge-base',
    UPLOAD_KNOWLEDGE_BASE_BY_FIELD: 'https://n8n.srv934833.hstgr.cloud/webhook/upload-knowledgebase-by-field',
    SEE_KNOWLEDGE_BASE: 'https://n8n.srv934833.hstgr.cloud/webhook/see-knowledgebase-data',
    MODIFY_KNOWLEDGE_BASE: 'https://n8n.srv934833.hstgr.cloud/webhook/modify-knowledge-base',
    UPLOAD_MEDIA_FILE: 'https://n8n.srv934833.hstgr.cloud/webhook/upload-media-file',
    LIST_MEDIA_FILES: 'https://n8n.srv934833.hstgr.cloud/webhook/view-media-library',
    DELETE_MEDIA_FILE: 'https://n8n.srv934833.hstgr.cloud/webhook/delete-media-file',
          WEBPAGE_SCRAPE: 'https://n8n.srv934833.hstgr.cloud/webhook/webpage-scrape',
      SAVE_SCRAPED_CONTENT: 'https://n8n.srv934833.hstgr.cloud/webhook/save-scraped-content',
      GET_SCRAPED_CONTENTS: 'https://n8n.srv934833.hstgr.cloud/webhook/show-extra-resources-list',
      DELETE_SCRAPED_CONTENT: 'https://n8n.srv934833.hstgr.cloud/webhook/delete-extra-resource-file',
      ANALYZE_IMAGE: 'https://n8n.srv934833.hstgr.cloud/webhook/image-content-extract',
      UPLOAD_RAG_DOCUMENT: 'https://n8n.srv934833.hstgr.cloud/webhook/upload-rag-document',
      DELETE_RAG_DOCUMENT: 'https://n8n.srv934833.hstgr.cloud/webhook/delete-separate-file-embedding',
      GET_CHAT_HISTORY: 'https://n8n.srv934833.hstgr.cloud/webhook/user-chat-history',
      GET_CHAT_MESSAGES: 'https://n8n.srv934833.hstgr.cloud/webhook/show-specific-chat-history',
      DELETE_CHAT: 'https://n8n.srv934833.hstgr.cloud/webhook/delte-chat',
      DELETE_USER: 'https://n8n.srv934833.hstgr.cloud/webhook/delete-a-user',
      GET_USER_INFO: 'https://n8n.srv934833.hstgr.cloud/webhook/see-user-info',
      CHANGE_USER_ROLE: 'https://n8n.srv934833.hstgr.cloud/webhook/create-new-admin',
      GENERATE_REFERRAL_CODE: 'https://n8n.srv934833.hstgr.cloud/webhook/generate-referral-code',
      VIEW_REFERRAL_CODES: 'https://n8n.srv934833.hstgr.cloud/webhook/view-referral-codes',
      DELETE_REFERRAL: 'https://n8n.srv934833.hstgr.cloud/webhook/delete-referral',
      SET_TOKEN_PRICE: 'https://n8n.srv934833.hstgr.cloud/webhook/set-token-price',
      GET_TOKEN_PRICE: 'https://n8n.srv934833.hstgr.cloud/webhook/show-token-price',
      YOUTUBE_TRANSCRIBE: 'https://n8n.srv934833.hstgr.cloud/webhook/youtube-video-transcribe',
      EXTRA_RESOURCES_CONTENT_EXTRACT: 'https://n8n.srv934833.hstgr.cloud/webhook/extra-resources-content-extract',
      SEE_USER_PASSWORD: 'https://n8n.srv934833.hstgr.cloud/webhook/see-user-password',
      GET_KNOWLEDGE_BASE_IN_FIELD: 'https://n8n.srv934833.hstgr.cloud/webhook/get-knowledge-base-in-field',
      UPDATE_WEBPAGE_CONTENT: 'https://n8n.srv934833.hstgr.cloud/webhook/update-webpage-content',
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