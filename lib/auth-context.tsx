"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
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

  // Check authentication status on mount and token changes
  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      
      // Check if user is authenticated
      const authenticated = authService.isAuthenticated()
      console.log('🔐 Auth check - isAuthenticated:', authenticated)
      setIsAuthenticated(authenticated)
      
      if (authenticated) {
        // Get current user from token
        const currentUser = authService.getCurrentUser()
        console.log('👤 Auth check - current user:', currentUser)
        setUser(currentUser)
        
        // Optionally validate token with server
        // This could be a simple API call to verify the token is still valid
        try {
          // You could add a token validation endpoint here
          // const response = await fetch('/api/auth/validate-token', {
          //   headers: { 'Authorization': `Bearer ${authService.getAuthToken()}` }
          // })
          // if (!response.ok) throw new Error('Token invalid')
        } catch (error) {
          console.log('Token validation failed, logging out')
          logout()
        }
      } else {
        console.log('❌ Auth check - user not authenticated')
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authService.signIn({ email, password })
      if (result.success) {
        setIsAuthenticated(true)
        setUser(result.data?.user || null)
        return true
      }
      return false
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
    checkAuthStatus()
  }, [])

  // Listen for storage changes (in case token is updated in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'refresh_token') {
        checkAuthStatus()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

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
