"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authService } from './auth-service'

interface AuthContextType {
  isAuthenticated: boolean
  user: any | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  
  console.log('🔥 AuthProvider rendered - isAuthenticated:', isAuthenticated, 'loading:', loading)

  // Check authentication status on mount and token changes
  const checkAuthStatus = async () => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth) {
      console.log('🔐 Auth check - already in progress, skipping')
      return
    }
    
    console.log('🔐 Auth check - starting authentication check')
    setIsCheckingAuth(true)
    setLoading(true)
    
    try {
      // First, check if there's a token at all
      const token = authService.getAuthToken()
      console.log('🔐 Auth check - token exists:', !!token)
      
      // Check if user is authenticated (includes token validation)
      const authenticated = token ? authService.isAuthenticated() : false
      console.log('🔐 Auth check - isAuthenticated:', authenticated)
      console.log('🔥 Setting isAuthenticated to:', authenticated)
      
      if (authenticated && token) {
        // Get current user from token
        const currentUser = authService.getCurrentUser()
        console.log('👤 Auth check - current user:', currentUser)
        
        // Set authenticated state
        setIsAuthenticated(true)
        setUser(currentUser)
        
        // Optional server validation (don't block UI rendering)
        const validateTokenWithServer = async () => {
          try {
            if (typeof window !== 'undefined') {
              console.log('🔐 Auth check - validating token with server')
              const response = await fetch('/api/auth/validate-token', {
                method: 'POST',
                headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }).catch(e => {
                console.log('🔐 Auth check - server validation network error, continuing anyway:', e)
                return null
              })
              
              if (response && !response.ok) {
                console.log('🔐 Auth check - server token validation failed')
                throw new Error('Token validation failed')
              }
              
              if (response) {
                console.log('🔐 Auth check - server token validation successful')
              }
            }
          } catch (error) {
            console.log('Token validation failed, logging out')
            setTimeout(() => {
              console.log('🔐 Scheduled logout due to token validation failure')
              authService.signOut()
              setIsAuthenticated(false)
              setUser(null)
            }, 0)
          }
        }
        
        // Start validation but don't await it
        validateTokenWithServer()
      } else {
        console.log('❌ Auth check - user not authenticated')
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      console.log('🔐 Auth check - setting loading to false')
      setLoading(false)
      setIsCheckingAuth(false)
      
      // Force loading to false in case it got stuck
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Login attempt for:', email)
      const result = await authService.signIn({ email, password })
      console.log('🔐 Login result:', result)
      
      if (result.success && result.data?.token) {
        console.log('🔐 Login successful, setting authentication state')
        
        // Mark as explicitly logged in
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('explicit_login', 'true')
        }
        
        // Immediately set authenticated state
        setIsAuthenticated(true)
        setUser(result.data?.user || null)
        setLoading(false) // Make sure loading is false
        
        // Force UI update
        setTimeout(() => {
          console.log('🔐 Forcing UI update after login')
          setIsAuthenticated(true) // Force a re-render
        }, 100)
        
        return true
      } else {
        console.log('🔐 Login failed:', result.error?.message)
        setIsAuthenticated(false)
        setUser(null)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  // Logout function
  const logout = () => {
    authService.signOut()
    setIsAuthenticated(false)
    setUser(null)
  }

  // Refresh user data
  const refreshUser = async () => {
    if (isAuthenticated) {
      const currentUser = authService.getCurrentUser()
      setUser(currentUser)
    }
  }

  // Check auth status on mount
  useEffect(() => {
    console.log('🔐 AuthProvider - Checking auth status on mount')
    checkAuthStatus()
    
    // Fallback: Force loading to false after 5 seconds if it gets stuck
    const timeout = setTimeout(() => {
      setLoading(false)
      setIsCheckingAuth(false)
    }, 5000)
    
    return () => clearTimeout(timeout)
  }, []) // Empty dependency array - only run on mount

  // Listen for storage changes (in case token is updated in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'refresh_token') {
        checkAuthStatus()
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, []) // Empty dependency array - only run on mount

  const value: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
