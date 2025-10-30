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
  temporarilyModifyUserRole: (newRole: string) => void
  restoreOriginalUserRole: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const [justLoggedIn, setJustLoggedIn] = useState(false)
  const [originalUser, setOriginalUser] = useState<any | null>(null)
  
  console.log('🔥 AuthProvider rendered - isAuthenticated:', isAuthenticated, 'loading:', loading)

  // Check authentication status on mount and token changes
  const checkAuthStatus = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth) {
      console.log('🔐 Auth check - already in progress, skipping')
      return
    }
    
    // Skip auth check if user just logged in
    if (justLoggedIn) {
      console.log('🔐 Auth check - skipping due to recent login')
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
        
        // Optional server validation (only if not explicitly logged in recently)
        const explicitLogin = typeof window !== 'undefined' ? 
          sessionStorage.getItem('explicit_login') : null;
          
        if (typeof window !== 'undefined' && !explicitLogin) {
          console.log('🔐 Auth check - validating token with server')
          try {
            const response = await fetch('/api/auth/validate-token', {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (!response.ok) {
              console.log('🔐 Auth check - server token validation failed')
              throw new Error('Token validation failed')
            }
            
            console.log('🔐 Auth check - server token validation successful')
          } catch (error) {
            console.log('Token validation failed, but keeping user logged in due to explicit login')
            // Don't immediately log out if there was an explicit login
          }
        } else if (explicitLogin) {
          console.log('🔐 Auth check - skipping server validation due to explicit login')
        }
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
    }
  }, [])

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
        
        // Set authenticated state
        setIsAuthenticated(true)
        setUser(result.data?.user || null)
        setLoading(false)
        setJustLoggedIn(true)
        
        console.log('🔐 Login successful - state set to authenticated:', true)
        console.log('🔐 Login successful - user:', result.data?.user)
        console.log('🔐 Login successful - loading:', false)
        
        // Role-based redirect after successful login
        if (result.data?.user?.role) {
          console.log('🔐 Login successful - user role:', result.data.user.role)
          
          if (result.data.user.role === 'Superking') {
            console.log('👑 Admin user detected, redirecting to admin dashboard')
            if (typeof window !== 'undefined') {
              window.location.href = '/admin'
            }
          } else if (result.data.user.role === 'paid-user') {
            console.log('✅ Paid user detected, redirecting to user dashboard')
            if (typeof window !== 'undefined') {
              window.location.href = '/dashboard'
            }
          } else {
            console.log('❌ Unauthorized role detected:', result.data.user.role)
            // Don't redirect - let the user see an error or handle appropriately
          }
        }
        
        // Clear the just logged in flag after a short delay
        setTimeout(() => {
          setJustLoggedIn(false)
          console.log('🔐 Cleared justLoggedIn flag')
        }, 2000)
        
        return true
      } else {
        console.log('🔐 Login failed:', result.error?.message)
        setIsAuthenticated(false)
        setUser(null)
        
        // Throw error with the specific message so the signin page can handle it
        if (result.error?.message) {
          throw new Error(result.error.message)
        }
        
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      setIsAuthenticated(false)
      setUser(null)
      
      // Re-throw the error so the signin page can handle it
      throw error
    }
  }

  // Logout function
  const logout = () => {
    authService.signOut()
    setIsAuthenticated(false)
    setUser(null)
    setJustLoggedIn(false)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('explicit_login')
    }
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
  }, [checkAuthStatus])

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
  }, [checkAuthStatus])

  // Function to temporarily modify user role for admin dashboard access
  const temporarilyModifyUserRole = useCallback((newRole: string) => {
    if (user) {
      console.log('🔄 Auth - Temporarily modifying user role from', user.role, 'to', newRole)
      setOriginalUser(user) // Store original user
      setUser({ ...user, role: newRole })
    }
  }, [user])

  // Function to restore original user role
  const restoreOriginalUserRole = useCallback(() => {
    if (originalUser) {
      console.log('🔄 Auth - Restoring original user role to', originalUser.role)
      setUser(originalUser)
      setOriginalUser(null)
    }
  }, [originalUser])

  const value: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    refreshUser,
    temporarilyModifyUserRole,
    restoreOriginalUserRole
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
