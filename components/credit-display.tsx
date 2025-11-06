"use client"

import * as React from "react"
import { authService } from "@/lib/auth-service"
import { Coins, Loader2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CreditDisplayProps {
  className?: string
  compact?: boolean
  onRefresh?: () => void
}

export const CreditDisplay = React.forwardRef<{ refresh: () => void }, CreditDisplayProps>(
  ({ className = "", compact = false, onRefresh }, ref) => {
    const [userProfile, setUserProfile] = React.useState<any>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

  const fetchUserProfile = async () => {
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
          setUserProfile(result.data)
        } else {
          setError("Failed to fetch profile")
        }
      } else {
        setError("Failed to fetch profile")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setIsLoading(false)
    }
  }

  // Expose refresh function via ref
  React.useImperativeHandle(ref, () => ({
    refresh: fetchUserProfile
  }))

  // Fetch profile on mount
  React.useEffect(() => {
    fetchUserProfile()
  }, [])

  const credits = userProfile?.total_credit ? userProfile.total_credit : "0"
  const isLowCredit = parseFloat(credits) < 10

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center justify-center w-full py-1.5 ${className}`}>
              <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                isLowCredit 
                  ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-sm' 
                  : 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm'
              }`}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : error ? (
                  <AlertCircle className="h-4 w-4 text-white" />
                ) : (
                  <Coins className="h-4 w-4 text-white" />
                )}
                {!isLoading && !error && isLowCredit && (
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white" />
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            <div className="space-y-1">
              <p className="font-semibold">Credits</p>
              <p className="text-sm">{credits} tokens</p>
              {isLowCredit && (
                <p className="text-xs text-red-500 font-medium">Low credit warning</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-2 shadow-sm ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
          <Coins className="h-3 w-3 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Credits</p>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
              <span className="text-xs text-slate-500">Loading...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-red-500" />
              <span className="text-xs text-red-500">Error</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`text-xs font-medium ${isLowCredit ? 'text-red-600' : 'text-slate-900'} whitespace-nowrap`}>
                {credits}
              </span>
              <span className="text-xs text-slate-500 font-medium flex-shrink-0">tokens</span>
              {isLowCredit && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5 flex-shrink-0">
                  Low
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

CreditDisplay.displayName = "CreditDisplay"
