"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useKnowledgeBase } from './use-cache'

export interface KnowledgeBaseSafetyHook {
  isKnowledgeBaseEmpty: boolean
  isValidating: boolean
  error: string | null
  canStartChat: boolean
  refreshValidation: () => void
}

/**
 * Hook to check if knowledge base is empty and determine if chat should be allowed
 */
export function useKnowledgeBaseSafety(): KnowledgeBaseSafetyHook {
  const { isAuthenticated } = useAuth()
  const { 
    data: knowledgeBaseContent, 
    isLoading, 
    error, 
    refresh: refreshKnowledgeBase 
  } = useKnowledgeBase()
  
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Calculate if knowledge base is empty
  const isKnowledgeBaseEmpty = useCallback(() => {
    if (!knowledgeBaseContent) return true
    
    // Check if content is empty or just whitespace
    const trimmedContent = knowledgeBaseContent.trim()
    if (!trimmedContent) return true
    
    // Check if content is too short (less than 50 characters)
    if (trimmedContent.length < 50) return true
    
    // Check if content contains only placeholder text
    const placeholderPatterns = [
      /^empty!/i,
      /^no content available/i,
      /^placeholder/i,
      /^demo content/i,
      /^sample text/i,
    ]
    
    for (const pattern of placeholderPatterns) {
      if (pattern.test(trimmedContent)) return true
    }
    
    return false
  }, [knowledgeBaseContent])

  // Determine if chat can start
  const canStartChat = isAuthenticated && !isKnowledgeBaseEmpty() && !isLoading

  const refreshValidation = useCallback(async () => {
    if (!isAuthenticated) return
    
    setIsValidating(true)
    setValidationError(null)
    
    try {
      await refreshKnowledgeBase()
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to validate knowledge base')
    } finally {
      setIsValidating(false)
    }
  }, [isAuthenticated, refreshKnowledgeBase])

  return {
    isKnowledgeBaseEmpty: isKnowledgeBaseEmpty(),
    isValidating: isLoading || isValidating,
    error: error?.message || validationError,
    canStartChat,
    refreshValidation
  }
}
