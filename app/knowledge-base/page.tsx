"use client"

import * as React from "react"
import { authService } from "@/lib/auth-service"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"

export default function KnowledgeBasePage() {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = React.useState('brand')
  const [isSaving, setIsSaving] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([])
  const [uploadProgress, setUploadProgress] = React.useState<{[key: string]: number}>({})
  const [userProfile, setUserProfile] = React.useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(false)
  const [referralCode, setReferralCode] = React.useState('')
  const [isApplyingReferral, setIsApplyingReferral] = React.useState(false)
  
  // Change password state
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)
  const [passwordError, setPasswordError] = React.useState('')
  const [passwordSuccess, setPasswordSuccess] = React.useState('')

  // Debug: Monitor userProfile state changes
  React.useEffect(() => {
    console.log('🔄 userProfile state changed:', userProfile)
  }, [userProfile])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSaving(false)
  }

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

  // Test API route function
  const testApiRoute = async () => {
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'data' })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Test API response:', result)
        alert('API test successful! Check console for details.')
      } else {
        console.error('Test API failed:', response.status, response.statusText)
        alert('API test failed! Check console for details.')
      }
    } catch (error) {
      console.error('Test API error:', error)
      alert('API test error! Check console for details.')
    }
  }

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setUploadedFiles(prev => [...prev, ...files])
    
    // Process each file
    for (const file of files) {
      try {
        // Read file content
        const content = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            if (file.type === 'text/plain' || file.type === 'text/csv') {
              resolve(e.target?.result as string)
            } else if (file.type === 'application/pdf') {
              resolve(`[PDF Content from ${file.name} - PDF parsing requires additional library setup]`)
            } else if (file.type.includes('word') || file.type.includes('document')) {
              resolve(`[Word Document Content from ${file.name} - DOCX parsing requires additional library setup]`)
            } else {
              resolve(`[File Content from ${file.name}]`)
            }
          }
          reader.readAsText(file)
        })

        // Initialize progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100))
          setUploadProgress(prev => ({ ...prev, [file.name]: i }))
        }

        console.log(`Uploading file: ${file.name}`)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('content', content)

        // Get access token for authorization
        const accessToken = authService.getAuthToken()
        if (!accessToken) {
          console.error('No access token available for file upload')
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 }))
          continue
        }

        const response = await fetch('/api/upload-knowledge-base', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData
        })

        console.log(`Response status for ${file.name}:`, response.status)

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            console.log(`File ${file.name} uploaded and parsed successfully`)
            setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
          } else {
            console.error(`Failed to upload file ${file.name}:`, result.error)
            setUploadProgress(prev => ({ ...prev, [file.name]: -1 })) // -1 indicates error
          }
        } else {
          const errorText = await response.text()
          console.error(`Failed to upload file ${file.name}:`, response.status, response.statusText, errorText)
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 })) // -1 indicates error
        }
      } catch (fetchError) {
        console.error(`Network error uploading file ${file.name}:`, fetchError)
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 }))
      }
    }
  }

  // Remove file from list
  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'profile') {
      fetchUserProfile()
    }
  }

  // Function to apply referral code
  const handleApplyReferralCode = async () => {
    if (!referralCode.trim()) {
      alert('Please enter a referral code')
      return
    }

    setIsApplyingReferral(true)
    try {
      console.log('=== APPLY REFERRAL CODE CLIENT START ===')
      console.log('Timestamp:', new Date().toISOString())
      
      // Get access token
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        console.log('❌ No access token available')
        alert('Authentication required. Please log in again.')
        return
      }

      console.log('🔍 STEP 1: Preparing request data...')
      const requestData = {
        referralCode: referralCode.trim(),
        accessToken
      }
      console.log('Request data:', JSON.stringify({
        ...requestData,
        accessToken: `${accessToken.substring(0, 20)}...`
      }, null, 2))

      console.log('🌐 STEP 2: Making API request...')
      console.log('URL: /api/referral/apply')
      console.log('Method: POST')

      const response = await fetch('/api/referral/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      console.log('📡 STEP 3: Response received...')
      console.log('Response status:', response.status)
      console.log('Response status text:', response.statusText)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log('✅ STEP 4: Referral code applied successfully!')
        console.log('Response data:', JSON.stringify(result, null, 2))
        
        if (result.success || result.message === "credit has been added" || result.message === "Workflow was started") {
          alert('Referral code applied successfully! The workflow has been started and credit will be added to your account.')
          setReferralCode('') // Clear the input
          // Refresh user profile to show updated credits with a small delay
          if (activeTab === 'profile') {
            setTimeout(() => {
              console.log('🔄 Refreshing user profile after referral code application...')
              fetchUserProfile()
            }, 2000) // Wait 2 seconds for the credit to be updated in the database
          }
        } else {
          alert(`Failed to apply referral code: ${result.error?.message || 'Unknown error'}`)
        }
      } else {
        const errorText = await response.text()
        console.log('❌ STEP 4: HTTP error response')
        console.log('Error details:', errorText)
        alert(`Failed to apply referral code: ${response.status} ${response.statusText}`)
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
      
      const data = await response.json()
      
      if (data.success) {
        setPasswordSuccess('Password changed successfully!')
        // Reset form
        setCurrentPassword('')
        setNewPassword('')
      } else {
        setPasswordError(data.error?.message || 'Failed to change password')
      }
    } catch (error: any) {
      setPasswordError('Network error. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Brand Customization</h1>
              <p className="text-gray-600">Customize your brand appearance and voice.</p>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
              <button
                onClick={() => handleTabChange('brand')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'brand'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Brand Settings
              </button>
              <button
                onClick={() => handleTabChange('profile')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                User Profile
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'brand' && (
              <div className="space-y-8">
                {/* Business Files Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Business Files</h2>
                    <p className="text-gray-600 mt-1">Upload and manage your business-related documents</p>
                  </div>
                  <div className="p-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                      <div className="w-12 h-12 bg-gray-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-white text-lg">📁</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">Upload Files</h4>
                      <p className="text-sm text-gray-500 mb-3">Upload documents, presentations, or other business-related files</p>
                      <p className="text-xs text-gray-400 mb-4">PDF, DOC, PPT, XLS, TXT up to 10MB</p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.csv,.ppt,.pptx,.xls,.xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        disabled={isUploading}
                      />
                      <div className="flex gap-2 justify-center">
                        <label 
                          htmlFor="file-upload"
                          className={`inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer ${
                            isUploading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isUploading ? 'Uploading...' : 'Choose Files'}
                        </label>
                        <button
                          onClick={testApiRoute}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Test API
                        </button>
                      </div>
                    </div>

                    {/* Upload Progress */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Upload Progress</h4>
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                  <span className="text-blue-600 text-xs">📄</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {uploadProgress[file.name] === 100 && (
                                  <span className="text-green-600 text-sm">✓ Complete</span>
                                )}
                                {uploadProgress[file.name] === -1 && (
                                  <span className="text-red-600 text-sm">✗ Error</span>
                                )}
                                {uploadProgress[file.name] >= 0 && uploadProgress[file.name] < 100 && (
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${uploadProgress[file.name]}%` }}
                                    ></div>
                                  </div>
                                )}
                                <button 
                                  onClick={() => removeFile(file.name)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* User Profile Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">User Profile</h2>
                    <p className="text-gray-600 mt-1">Manage your account information and settings</p>
                  </div>
                  <div className="p-6 space-y-6">
                    {isLoadingProfile ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <span className="ml-3 text-gray-600">Loading profile...</span>
                      </div>
                    ) : (
                      <>
                        {/* Profile Information */}
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">User Email</label>
                            <div className="flex gap-2">
                              <input 
                                type="email" 
                                value={userProfile?.email || ""}
                                placeholder="Not set"
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                                readOnly
                              />
                              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg" disabled>
                                Update
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Account Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Available Credit</label>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <span className="text-2xl font-bold text-blue-600">{userProfile?.total_credit || "0.00"}</span>
                              <span className="text-sm text-blue-600 ml-2">tokens</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Signup Date</label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <span className="text-gray-900">
                                {userProfile?.created_at 
                                  ? new Date(userProfile.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })
                                  : "Not available"
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Purchase Credit */}
                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Purchase Credit</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-purple-400 transition-colors cursor-pointer">
                              <div className="text-2xl font-bold text-purple-600 mb-2">$10</div>
                              <div className="text-sm text-gray-600 mb-2">10,000 tokens</div>
                              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm">
                                Purchase
                              </button>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-purple-400 transition-colors cursor-pointer">
                              <div className="text-2xl font-bold text-purple-600 mb-2">$25</div>
                              <div className="text-sm text-gray-600 mb-2">30,000 tokens</div>
                              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm">
                                Purchase
                              </button>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-purple-400 transition-colors cursor-pointer">
                              <div className="text-2xl font-bold text-purple-600 mb-2">$50</div>
                              <div className="text-sm text-gray-600 mb-2">75,000 tokens</div>
                              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm">
                                Purchase
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Password Change */}
                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                          
                          {/* Error/Success Messages */}
                          {passwordError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-red-600 text-sm">{passwordError}</p>
                            </div>
                          )}
                          
                          {passwordSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-green-600 text-sm">{passwordSuccess}</p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                              <input 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                                disabled={isChangingPassword}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                              <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                                disabled={isChangingPassword}
                              />
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <button 
                              onClick={handleChangePassword}
                              disabled={isChangingPassword || (!currentPassword || !newPassword)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                isChangingPassword || (!currentPassword || !newPassword)
                                  ? 'bg-gray-400 cursor-not-allowed text-white'
                                  : 'bg-purple-600 hover:bg-purple-700 text-white'
                              }`}
                            >
                              {isChangingPassword ? 'Updating...' : 'Update Password'}
                            </button>
                          </div>
                        </div>

                        {/* Referral Code */}
                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Apply Referral Code</h3>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code</label>
                              <input 
                                type="text" 
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value)}
                                placeholder="Enter referral code"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                                disabled={isApplyingReferral}
                              />
                            </div>
                            <div className="flex items-end">
                              <button 
                                onClick={handleApplyReferralCode}
                                disabled={isApplyingReferral || !referralCode.trim()}
                                className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                                  isApplyingReferral || !referralCode.trim()
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                              >
                                {isApplyingReferral ? 'Applying...' : 'Apply Code'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <div className="space-y-8">
            {/* System Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                {[
                  { label: "API Status", value: "Online", isOnline: true },
                  { label: "Response Time", value: "2.3s", isOnline: true },
                  { label: "Uptime", value: "99.9%", isOnline: true }
                ].map((status, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{status.label}</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${status.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`text-sm font-medium ${status.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                        {status.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                  Refresh
                </button>
                <button className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}