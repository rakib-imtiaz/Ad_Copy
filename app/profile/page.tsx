"use client"

import * as React from "react"
import { authService } from "@/lib/auth-service"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { ArrowLeft } from "lucide-react"
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
  
  // Change password state
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)
  const [passwordError, setPasswordError] = React.useState('')
  const [passwordSuccess, setPasswordSuccess] = React.useState('')

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="outline" size="icon" onClick={() => window.history.back()} className="h-10 w-10 flex-shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage your account information and settings</p>
            </div>
          </div>

          {isLoadingProfile ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <Label htmlFor="email" className="text-sm font-medium mb-2 sm:mb-0">User Email</Label>
                        <p id="email" className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md w-full sm:w-auto">
                          {userProfile?.email || "Not available"}
                        </p>
                    </div>
                    <Separator/>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <Label className="text-sm font-medium mb-2 sm:mb-0">Signup Date</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {userProfile?.created_at 
                              ? new Date(userProfile.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : "Not available"
                            }
                        </p>
                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>Credits & Usage</CardTitle>
                    <CardDescription>Your current balance, storage, and options to add more.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label>Available Credit</Label>
                        <p className="text-3xl font-bold text-purple-600">{parseFloat(userProfile?.total_credit || "0.00").toFixed(2)} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">tokens</span></p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label className="text-sm font-medium">Knowledge Base Storage</Label>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{userProfile?.kb_storage || "0"} MB / {userProfile?.max_kb_storage_mb || "500"} MB</span>
                            </div>
                            <Progress value={Math.min(100, ((userProfile?.kb_storage || 0) / (userProfile?.max_kb_storage_mb || 500)) * 100)} className="h-2 [&>div]:bg-green-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label className="text-sm font-medium">Media Storage</Label>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{userProfile?.media_storage || "0"} MB / {userProfile?.max_media_storage_mb || "1000"} MB</span>
                            </div>
                            <Progress value={Math.min(100, ((userProfile?.media_storage || 0) / (userProfile?.max_media_storage_mb || 1000)) * 100)} className="h-2" />
                        </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Purchase Credit</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { price: 10, tokens: "10,000" },
                          { price: 25, tokens: "30,000" },
                          { price: 50, tokens: "75,000" },
                        ].map(plan => (
                          <div key={plan.price} className="text-center p-6 bg-gray-100 dark:bg-gray-900 rounded-lg flex flex-col justify-between space-y-4">
                            <div>
                              <p className="text-3xl font-bold text-purple-600">${plan.price}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{plan.tokens} tokens</p>
                            </div>
                            <Button className="w-full">Purchase</Button>
                          </div>
                        ))}
                      </div>
                    </div>

                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {passwordSuccess && (
                    <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                       <AlertTitle>Success</AlertTitle>
                      <AlertDescription className="text-green-800 dark:text-green-300">{passwordSuccess}</AlertDescription>
                    </Alert>
                  )}
                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertTitle>Error updating password</AlertTitle>
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input 
                        id="current-password" 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isChangingPassword}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                        id="new-password" 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isChangingPassword}
                      />
                    </div>
                  </div>
                   <div className="flex justify-end">
                     <Button 
                        onClick={handleChangePassword}
                        disabled={isChangingPassword || (!currentPassword || !newPassword)}
                      >
                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                      </Button>
                   </div>
                </CardContent>
              </Card>

              <Card className="border-red-500/50 dark:border-red-500/30 bg-red-50/50 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="text-red-600 dark:text-red-500">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  {deleteError && (
                     <Alert variant="destructive" className="mb-4">
                      <AlertTitle>Error deleting account</AlertTitle>
                      <AlertDescription>{deleteError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-4 sm:mb-0">
                      <h4 className="font-semibold">Delete Account</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and all associated data.</p>
                    </div>
                    <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={isDeletingUser}>
                      Delete My Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers, including knowledge base, chat history, and credits.
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
