"use client"

import * as React from "react"
import { authService } from "@/lib/auth-service"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { ArrowLeft, User, CreditCard, Shield, Gift, Mail, Calendar, Settings, LogOut, CheckCircle2, Copy, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const [userProfile, setUserProfile] = React.useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(false)
  const [referralCode, setReferralCode] = React.useState('')
  const [isApplyingReferral, setIsApplyingReferral] = React.useState(false)
  const [isReadOnly, setIsReadOnly] = React.useState(true)
  const referralInputRef = React.useRef<HTMLInputElement>(null)
  
  // Change password state
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)
  const [passwordError, setPasswordError] = React.useState('')
  const [passwordSuccess, setPasswordSuccess] = React.useState('')
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [selectedPlan, setSelectedPlan] = React.useState<number | null>(null)

  // Delete user state
  const [isDeletingUser, setIsDeletingUser] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState('')

  // Debug: Monitor userProfile state changes
  React.useEffect(() => {
    console.log('🔄 userProfile state changed:', userProfile)
  }, [userProfile])

  // Function to fetch user profile from webhook
  const fetchUserProfile = async () => {
    console.log('=== FETCH USER PROFILE CLIENT START ===')
    console.log('Timestamp:', new Date().toISOString())
    
    setIsLoadingProfile(true)
    try {
      console.log('🔍 STEP 1: Getting current user and access token...')
      
      // Get current user and access token
      const currentUser = authService.getCurrentUser()
      const accessToken = authService.getAuthToken()
      
      console.log('👤 CURRENT USER:')
      console.log(JSON.stringify(currentUser, null, 2))
      
      console.log('🔐 ACCESS TOKEN:')
      console.log('Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NULL')
      console.log('Token length:', accessToken?.length || 0)
      console.log('Is authenticated:', authService.isAuthenticated())
      
      if (!currentUser || !accessToken) {
        console.log('❌ ERROR: No user or access token available')
        console.log('Current user exists:', !!currentUser)
        console.log('Access token exists:', !!accessToken)
        return
      }

      // Prepare request data
      const requestData = {
        user_email: currentUser.email,
        user_id: currentUser.id
      }
      
      console.log('📤 STEP 2: Preparing request data...')
      console.log('Request data:', JSON.stringify(requestData, null, 2))
      
      console.log('🌐 STEP 3: Making API request...')
      console.log('URL: /api/fetch-user-profile')
      console.log('Method: POST')
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.substring(0, 20)}...`
      })
      
      const response = await fetch('/api/fetch-user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestData)
      })

      console.log('📡 STEP 4: Response received...')
      console.log('Response status:', response.status)
      console.log('Response status text:', response.statusText)
      console.log('Response ok:', response.ok)
      
      // Log response headers
      console.log('📋 RESPONSE HEADERS:')
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
      console.log(JSON.stringify(responseHeaders, null, 2))

      if (response.ok) {
        console.log('✅ STEP 5: Parsing success response...')
        try {
          const result = await response.json()
          console.log('Raw response:', JSON.stringify(result, null, 2))
          
          if (result.success) {
            console.log('🎉 STEP 6: Profile fetch successful!')
            console.log('Profile data:', JSON.stringify(result.data, null, 2))
            console.log('💰 Current credit in profile:', result.data?.total_credit)
            setUserProfile(result.data)
            console.log('✅ User profile state updated with data:', result.data)
          } else {
            console.log('❌ STEP 6: Profile fetch failed - API returned error')
            console.log('Error details:', JSON.stringify(result.error, null, 2))
          }
        } catch (jsonError) {
          console.error('❌ Failed to parse JSON response:', jsonError)
          try {
            const errorText = await response.text()
            console.error('Response text:', errorText)
          } catch (textError) {
            console.error('Could not read response text:', textError)
          }
        }
      } else {
        console.log('❌ STEP 5: HTTP error response')
        console.log('Status:', response.status)
        console.log('Status text:', response.statusText)
      }
    } catch (e) {
      console.error('❌ STEP 4: Exception during API call:', e)
    } finally {
      setIsLoadingProfile(false)
      console.log('=== FETCH USER PROFILE CLIENT END ===')
    }
  }

  const handleApplyReferralCode = async () => {
    if (!referralCode.trim()) {
      alert('Please enter a referral code')
      return
    }

    setIsApplyingReferral(true)
    try {
      console.log('=== APPLY REFERRAL CODE CLIENT START ===')
      console.log('Timestamp:', new Date().toISOString())

      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        console.log('❌ No access token available')
        alert('Authentication required. Please log in again.')
        return
      }

      console.log('🔍 STEP 1: Preparing request data...')
      const requestData = {
        referralCode: referralCode.trim(),
        accessToken,
      }
      console.log('Request data:', JSON.stringify({
        ...requestData,
        accessToken: `${accessToken.substring(0, 20)}...`,
      }, null, 2))

      console.log('🌐 STEP 2: Making API request...')
      console.log('URL: /api/referral/apply')
      console.log('Method: POST')

      const response = await fetch('/api/referral/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      console.log('📡 STEP 3: Response received...')
      console.log('Response status:', response.status)
      console.log('Response status text:', response.statusText)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        try {
          const result = await response.json()
          console.log('✅ STEP 4: Referral code applied successfully!')
          console.log('Response data:', JSON.stringify(result, null, 2))

          if (result.success || result.message === "credit has been added" || result.message === "Workflow was started") {
            alert('Referral code applied successfully! Credits will be added to your account shortly.')
            setReferralCode('')
            setTimeout(() => {
              console.log('🔄 Refreshing user profile after referral code application...')
              fetchUserProfile()
            }, 2000)
          } else {
            const errorMessage = result.error?.message || 'Unknown error'
            alert(`Failed to apply referral code: ${errorMessage}`)
          }
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError)
          try {
            const errorText = await response.text()
            console.error('Response text:', errorText)
          } catch (textError) {
            console.error('Could not read response text:', textError)
          }
          alert('Failed to apply referral code - invalid response format')
        }
      } else {
        const errorText = await response.text()
        console.log('❌ STEP 4: HTTP error response')
        console.log('Error details:', errorText)

        let errorMessage = `Failed to apply referral code: ${response.status} ${response.statusText}`

        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (parseError) {
          if (errorText.trim() && errorText.length < 200) {
            errorMessage = errorText
          }
        }

        alert(errorMessage)
      }
    } catch (error) {
      console.error('❌ Exception during referral code application:', error)
      alert('An error occurred while applying the referral code. Please try again.')
    } finally {
      setIsApplyingReferral(false)
      console.log('=== APPLY REFERRAL CODE CLIENT END ===')
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')
    
    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in all fields')
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long')
      return
    }
    
    setIsChangingPassword(true)
    try {
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        setPasswordError('Authentication token not found')
        return
      }
      
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          old_password: currentPassword,
          new_password: newPassword
        })
      })
      
      try {
        const data = await response.json()
        
        if (data.success) {
          setPasswordSuccess('Password changed successfully!')
          // Reset form
          setCurrentPassword('')
          setNewPassword('')
        } else {
          setPasswordError(data.error?.message || 'Failed to change password')
        }
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError)
        try {
          const errorText = await response.text()
          console.error('Response text:', errorText)
        } catch (textError) {
          console.error('Could not read response text:', textError)
        }
        setPasswordError('Failed to change password - invalid response format')
      }
    } catch (error: any) {
      setPasswordError('Network error. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteUser = async () => {
    setIsDeletingUser(true)
    setDeleteError('')
    
    try {
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        setDeleteError('Authentication token not found')
        return
      }

      const currentUser = authService.getCurrentUser()
      if (!currentUser) {
        setDeleteError('User information not found')
        return
      }

      console.log('🗑️ Client - Deleting user ID:', currentUser.id, 'Email:', currentUser.email)
      console.log('🔑 Client - Token exists:', !!accessToken)

      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          accessToken: accessToken,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }

      console.log('✅ User deleted successfully')
      
      // Sign out the user after successful deletion
      authService.signOut()
      
    } catch (error) {
      console.error('❌ Error deleting user:', error)
      setDeleteError(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsDeletingUser(false)
    }
  }

  // Load profile on component mount
  React.useEffect(() => {
    fetchUserProfile()
  }, [])

  // Ensure referral code field is empty on mount and clear any browser autofill
  React.useEffect(() => {
    setReferralCode('')
    setIsReadOnly(true)
    // Clear the input value directly in case browser autofilled it
    if (referralInputRef.current) {
      referralInputRef.current.value = ''
    }
    // Also clear after a short delay to catch late autofill
    const timeout = setTimeout(() => {
      setReferralCode('')
      if (referralInputRef.current) {
        referralInputRef.current.value = ''
      }
    }, 100)
    return () => clearTimeout(timeout)
  }, [])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(userProfile?.email || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      console.error(e)
    }
  }

  const formatNumber = (n: number): string => {
    return n.toLocaleString("en-US")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-gray-950">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-gray-200 dark:border-gray-800">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.history.back()} 
                className="mr-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black shadow-sm">
                <Settings size={18} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Account Settings</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your profile, billing, and security</p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700">Admin</span>
          </div>
        </header>

        <main className="w-full px-6 py-8">
          <div className="mx-auto max-w-6xl space-y-10">

          {isLoadingProfile ? (
            <div className="flex items-center justify-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
            </div>
          ) : (
            <>
              {/* Profile Section */}
              <section id="profile" className="scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Profile</h2>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Your account details</p>
                </div>
                <div className="rounded-2xl border bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-sm border-gray-200 dark:border-gray-800">
                  <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-black dark:bg-white text-white dark:text-black grid place-content-center font-semibold">
                        {userProfile?.email ? userProfile.email.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>EMAIL</span>
                          <button onClick={copyEmail} className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Copy email">
                            <Copy size={16} className="text-gray-600 dark:text-gray-400" />
                          </button>
                          {copied && (
                            <span className="text-xs text-gray-700 dark:text-gray-300 inline-flex items-center gap-1">
                              <CheckCircle2 size={14}/> Copied
                            </span>
                          )}
                        </div>
                        <p className="text-base font-medium text-gray-900 dark:text-white">{userProfile?.email || "Not available"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Member since {userProfile?.created_at 
                            ? new Date(userProfile.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : "Not available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          if (confirm('Sign out of all devices?')) {
                            authService.signOut()
                          }
                        }}
                        className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm border-gray-300 dark:border-gray-700"
                      >
                        Sign out <LogOut className="ml-2 inline" size={16}/>
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Credits & Billing Section */}
              <section id="billing" className="scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Credits & Billing</h2>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Manage your credits and purchases</p>
                </div>
                <div className="rounded-2xl border bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-sm border-gray-200 dark:border-gray-800">
                  {/* Balance */}
                  <div className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Available Balance</p>
                      <div className="mt-1 text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                        {parseFloat(userProfile?.total_credit || "0.00").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                        <span className="text-base font-normal text-gray-500 dark:text-gray-400"> tokens</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => alert("View invoices")}
                        className="rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        View invoices
                      </Button>
                      <Button 
                        onClick={() => alert("Add payment method")}
                        className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm"
                      >
                        Add payment method
                      </Button>
                    </div>
                  </div>
                  <div className="h-px w-full bg-gray-100 dark:bg-gray-800" />
                  
                   {/* Purchase credits */}
                   {/* <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                     {[
                       { price: 10, tokens: 10000 },
                       { price: 25, tokens: 30000 },
                       { price: 50, tokens: 75000 },
                     ].map((plan, i) => {
                       const isSelected = selectedPlan === plan.price
                       return (
                         <div 
                           key={plan.price} 
                           onClick={() => setSelectedPlan(plan.price)}
                           className={`mx-auto w-full max-w-[320px] flex h-full flex-col rounded-2xl shadow-sm transition hover:shadow-md cursor-pointer bg-white dark:bg-gray-800 ${isSelected ? "border-2 border-black dark:border-white" : "border border-gray-200 dark:border-gray-700"}`}
                         >
                           <div className="p-5 text-center">
                             <div className="mb-1 text-2xl font-semibold text-gray-900 dark:text-white">${plan.price}</div>
                             <div className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(plan.tokens)} tokens</div>
                           </div>
                           <div className="h-px w-full bg-gray-100 dark:bg-gray-700" />
                           <div className="p-5 pt-4 mt-auto">
                             <button 
                               onClick={(e) => {
                                 e.preventDefault()
                                 e.stopPropagation()
                                 setSelectedPlan(plan.price)
                                 // TODO: Implement purchase functionality
                                 alert(`Purchasing $${plan.price} - ${formatNumber(plan.tokens)} tokens`)
                               }}
                               className="w-40 md:w-48 block mx-auto bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm cursor-pointer transition"
                               type="button"
                             >
                               Purchase
                             </button>
                           </div>
                         </div>
                       )
                     })}
                   </div> */}
                </div>
              </section>

              {/* Referral Section */}
              <section id="referral" className="scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Apply Referral Code</h2>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Have a code? Add it here for perks.</p>
                </div>
                <div className="rounded-2xl border bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-sm border-gray-200 dark:border-gray-800">
                  <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="w-full">
                      <label htmlFor="referral-code-input" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Referral code</label>
                      <div className="flex items-center gap-2 md:max-w-xl">
                        <Input
                          ref={referralInputRef}
                          id="referral-code-input"
                          type="text"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value)}
                          onFocus={(e) => {
                            setIsReadOnly(false)
                            const input = e.target as HTMLInputElement
                            if (input.value && input.value.includes('@')) {
                              setReferralCode('')
                              input.value = ''
                            }
                          }}
                          onBlur={() => {}}
                          readOnly={isReadOnly}
                          placeholder="Enter referral code"
                          disabled={isApplyingReferral}
                          autoComplete="off"
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck="false"
                          name="referral-code"
                          data-form-type="other"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          className="h-11 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700"
                        />
                        <Button
                          onClick={handleApplyReferralCode}
                          disabled={isApplyingReferral || !referralCode.trim()}
                          className="h-11 px-5 shrink-0 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-xl text-sm font-medium shadow-sm disabled:opacity-50"
                        >
                          {isApplyingReferral ? 'Applying...' : 'Apply'}
                        </Button>
                      </div>
                    </div>
                    <div className="md:w-1/3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Share with friends and both of you get bonus tokens when they make their first purchase.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Security Section */}
              <section id="security" className="scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Security</h2>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Protect your account with strong credentials</p>
                </div>
                <div className="rounded-2xl border bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-sm border-gray-200 dark:border-gray-800">
                  <div className="space-y-6 p-6">
                    {passwordSuccess && (
                      <Alert variant="default" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 py-2">
                        <AlertTitle className="text-sm text-green-900 dark:text-green-100">Success</AlertTitle>
                        <AlertDescription className="text-xs text-green-800 dark:text-green-300">{passwordSuccess}</AlertDescription>
                      </Alert>
                    )}
                    {passwordError && (
                      <Alert variant="destructive" className="py-2">
                        <AlertTitle className="text-sm">Error updating password</AlertTitle>
                        <AlertDescription className="text-xs">{passwordError}</AlertDescription>
                      </Alert>
                    )}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="w-full">
                        <label htmlFor="current-password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Current password</label>
                        <div className="relative">
                          <Input 
                            id="current-password" 
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            disabled={isChangingPassword}
                            className="h-11 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 pr-10"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowCurrentPassword(v => !v)} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-700" 
                            aria-label="Toggle password visibility"
                          >
                            {showCurrentPassword ? <EyeOff size={18} className="text-gray-600 dark:text-gray-400"/> : <Eye size={18} className="text-gray-600 dark:text-gray-400"/>}
                          </button>
                        </div>
                      </div>
                      <div className="w-full">
                        <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">New password</label>
                        <div className="relative">
                          <Input 
                            id="new-password" 
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            disabled={isChangingPassword}
                            className="h-11 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 pr-10"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowNewPassword(v => !v)} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-700" 
                            aria-label="Toggle password visibility"
                          >
                            {showNewPassword ? <EyeOff size={18} className="text-gray-600 dark:text-gray-400"/> : <Eye size={18} className="text-gray-600 dark:text-gray-400"/>}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Use 12+ characters with a mix of letters, numbers, and symbols.</p>
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <Button 
                          onClick={handleChangePassword}
                          disabled={isChangingPassword || (!currentPassword || !newPassword)}
                          className="px-5 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-xl text-sm font-medium shadow-sm disabled:opacity-50"
                        >
                          Update Password
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
          </div>
        </main>

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers, including Business Information, chat history, and credits.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} disabled={isDeletingUser}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} disabled={isDeletingUser} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                {isDeletingUser ? 'Deleting...' : 'Yes, delete my account'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  )
}
