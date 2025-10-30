"use client"

import * as React from "react"
import { authService } from "@/lib/auth-service"

interface CreditValidationResult {
  hasCredits: boolean
  credits: number
  isLoading: boolean
  error: string | null
  checkCredits: () => Promise<void>
}

export function useCreditValidation(): CreditValidationResult {
  const [credits, setCredits] = React.useState<number>(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const checkCredits = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const currentUser = authService.getCurrentUser()
      const accessToken = authService.getAuthToken()
      
      if (!currentUser || !accessToken) {
        setError("Authentication required")
        return
      }

      const response = await fetch('/api/fetch-user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          user_email: currentUser.email,
          user_id: currentUser.id
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const creditAmount = parseFloat(result.data?.total_credit || "0")
          setCredits(creditAmount)
        } else {
          setError("Failed to fetch credits")
        }
      } else {
        setError("Failed to fetch credits")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setIsLoading(false)
    }
  }

  // Check credits on mount
  React.useEffect(() => {
    checkCredits()
  }, [])

  return {
    hasCredits: credits > 0,
    credits,
    isLoading,
    error,
    checkCredits
  }
}
