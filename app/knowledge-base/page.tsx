"use client"

import * as React from "react"
import { authService } from "@/lib/auth-service"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { KnowledgeBaseViewer } from "@/components/knowledge-base-viewer"
import { BrandForm } from "@/components/brand-form"
import { API_ENDPOINTS } from "@/lib/api-config"

export default function KnowledgeBasePage() {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = React.useState('brand')
  const [isSaving, setIsSaving] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([])
  const [uploadProgress, setUploadProgress] = React.useState<{[key: string]: number}>({})
  const [userProfile, setUserProfile] = React.useState<any>(null)
  const [isKnowledgeViewerOpen, setIsKnowledgeViewerOpen] = React.useState(false)

  // Debug: Monitor userProfile state changes
  React.useEffect(() => {
    console.log('🔄 userProfile state changed:', userProfile)
  }, [userProfile])

  // Load user profile for storage information
  React.useEffect(() => {
    fetchUserProfile()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSaving(false)
  }

  // Function to fetch user profile from webhook (for storage info)
  const fetchUserProfile = async () => {
    console.log('=== FETCH USER PROFILE CLIENT START ===')
    console.log('Timestamp:', new Date().toISOString())
    
    try {
      console.log('🔍 STEP 1: Getting current user and access token...')
      
      // Get current user and access token
      const currentUser = authService.getCurrentUser()
      const accessToken = authService.getAuthToken()
      
      if (!currentUser || !accessToken) {
        console.log('❌ ERROR: No user or access token available')
        return
      }

      // Prepare request data
      const requestData = {
        user_email: currentUser.email,
        user_id: currentUser.id
      }
      
      const response = await fetch('/api/fetch-user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        try {
          const result = await response.json()
          
          if (result.success) {
            console.log('🎉 Profile fetch successful!')
            setUserProfile(result.data)
          }
        } catch (jsonError) {
          console.error('❌ Failed to parse JSON response:', jsonError)
        }
      }
    } catch (e) {
      console.error('❌ Exception during API call:', e)
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
        try {
          const result = await response.json()
          console.log('Test API response:', result)
          alert('API test successful! Check console for details.')
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError)
          try {
            const errorText = await response.text()
            console.error('Response text:', errorText)
          } catch (textError) {
            console.error('Could not read response text:', textError)
          }
          alert('API test failed - invalid JSON response! Check console for details.')
        }
      } else {
        console.error('Test API failed:', response.status, response.statusText)
        alert('API test failed! Check console for details.')
      }
    } catch (error) {
      console.error('Test API error:', error)
      alert('API test error! Check console for details.')
    }
  }

  // Test n8n webhook connectivity
  const testN8nWebhook = async () => {
    console.log('🧪 Testing n8n webhook connectivity...')
    try {
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        console.error('❌ No access token available for webhook test')
        alert('No access token available. Please log in first.')
        return
      }

      console.log('🌐 Making test request to n8n webhook...')
      const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.UPLOAD_KNOWLEDGE_BASE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      console.log('📡 Test response status:', response.status)
      console.log('📡 Test response status text:', response.statusText)
      console.log('📡 Test response headers:', Object.fromEntries(response.headers.entries()))

      try {
        const responseText = await response.text()
        console.log('📄 Test response text:', responseText)
        console.log('📄 Test response text length:', responseText.length)
        
        if (response.ok) {
          alert(`Webhook test successful! Status: ${response.status}\nResponse: ${responseText.substring(0, 100)}...`)
        } else {
          alert(`Webhook test failed! Status: ${response.status}\nResponse: ${responseText.substring(0, 100)}...`)
        }
      } catch (textError) {
        console.error('❌ Could not read response text:', textError)
        alert(`Webhook test completed with status ${response.status} but could not read response.`)
      }
    } catch (error) {
      console.error('❌ Webhook test error:', error)
      if (error instanceof Error) {
        alert(`Webhook test error: ${error.message}`)
      } else {
        alert(`Webhook test error: ${String(error)}`)
      }
    }
  }

  // Test with a simple text file
  const testWithTextFile = async () => {
    console.log('🧪 Creating and uploading test text file...')
    try {
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        console.error('❌ No access token available')
        alert('No access token available. Please log in first.')
        return
      }

      // Create a simple text file
      const testContent = 'This is a test file for n8n webhook testing.\nIt contains some sample text content.\nThis should trigger the text processing workflow.'
      const testFile = new File([testContent], 'test-file.txt', { type: 'text/plain' })

      console.log('📄 Created test file:', testFile.name, testFile.size, 'bytes')
      console.log('📄 File content:', testContent)

      const formData = new FormData()
      formData.append('file', testFile)

      console.log('🌐 Uploading test file to n8n webhook...')
      const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.UPLOAD_KNOWLEDGE_BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData
      })

      console.log('📡 Test file response status:', response.status)
      console.log('📡 Test file response ok:', response.ok)

      try {
        const result = await response.json()
        console.log('✅ Test file upload response:', result)
        alert(`Test file uploaded successfully!\nResponse: ${JSON.stringify(result, null, 2)}`)
      } catch (jsonError) {
        const responseText = await response.text()
        console.log('📄 Test file response text:', responseText)
        alert(`Test file uploaded! Response: ${responseText}`)
      }

    } catch (error) {
      console.error('❌ Test file upload error:', error)
      if (error instanceof Error) {
        alert(`Test file upload error: ${error.message}`)
      } else {
        alert(`Test file upload error: ${String(error)}`)
      }
    }
  }

  // Simple file upload function
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🚀 File upload started!')
    
    const files = Array.from(event.target.files || [])
    if (files.length === 0) {
      console.log('❌ No files selected')
      return
    }

    // Validate file types
    const allowedTypes = ['.pdf', '.docx', '.txt']
    const invalidFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      return !allowedTypes.includes(extension)
    })

    if (invalidFiles.length > 0) {
      const invalidFileNames = invalidFiles.map(f => f.name).join(', ')
      alert(`Invalid file type(s): ${invalidFileNames}\nOnly .pdf, .docx, and .txt files are accepted.`)
      return
    }

    // Validate file sizes (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    const oversizedFiles = files.filter(file => file.size > maxSize)

    if (oversizedFiles.length > 0) {
      const oversizedFileNames = oversizedFiles.map(f => f.name).join(', ')
      alert(`File(s) too large: ${oversizedFileNames}\nMaximum file size is 10MB.`)
      return
    }

    console.log(`📁 Selected ${files.length} file(s):`, files.map(f => f.name))
    setUploadedFiles(prev => [...prev, ...files])
    
    // Get access token
    const accessToken = authService.getAuthToken()
    if (!accessToken) {
      console.error('❌ No access token available')
      alert('Please log in first')
      return
    }

    // Check storage space before uploading
    if (userProfile) {
      const totalFileSize = files.reduce((sum, file) => sum + file.size, 0)
      const totalFileSizeMB = totalFileSize / (1024 * 1024)
      const currentStorage = userProfile.kb_storage || 0
      const maxStorage = userProfile.max_kb_storage_mb || 500
      const remainingStorage = maxStorage - currentStorage

      if (totalFileSizeMB > remainingStorage) {
        const shouldContinue = confirm(
          `Warning: You have ${remainingStorage.toFixed(1)} MB remaining storage space, but the selected files total ${totalFileSizeMB.toFixed(1)} MB.\n\n` +
          `This upload may fail due to insufficient storage space. Do you want to continue anyway?`
        )
        if (!shouldContinue) {
          setUploadedFiles(prev => prev.filter(f => !files.includes(f)))
          return
        }
      } else if (remainingStorage < 50) {
        alert(`Warning: You have only ${remainingStorage.toFixed(1)} MB remaining storage space. Consider deleting some files or upgrading your storage plan.`)
      }
    }

    // Process each file
    for (const file of files) {
      console.log(`📤 Uploading: ${file.name}`)
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

      try {
        // Create FormData
        const formData = new FormData()
        formData.append('file', file)

        console.log('🌐 Sending to n8n webhook...')
        console.log('URL:', API_ENDPOINTS.N8N_WEBHOOKS.UPLOAD_KNOWLEDGE_BASE)
        console.log('File:', file.name, file.size, 'bytes')
        console.log('File type:', file.type)
        console.log('FormData contents:')
        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`  - ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`)
          } else {
            console.log(`  - ${key}: ${value}`)
          }
        }

        // Make the request
        const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.UPLOAD_KNOWLEDGE_BASE, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData
        })

        console.log(`📡 Response status: ${response.status}`)
        console.log(`📡 Response ok: ${response.ok}`)

        if (response.ok) {
          console.log('🎉 Response is OK! Reading response...')
          try {
            const result = await response.json()
            console.log('📄 JSON Response received:')
            console.log('📄 Response object:', result)
            console.log('📄 Response status:', result.status)
            console.log('📄 Response message:', result.message)
            console.log('📄 Full response JSON:', JSON.stringify(result, null, 2))
            setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
            alert(`File ${file.name} uploaded successfully!\nResponse: ${result.message}`)
          } catch (jsonError) {
            console.log('📄 Response is not JSON, reading as text...')
            const responseText = await response.text()
            console.log('📄 Raw response text:', responseText)
            console.log('📄 Response text length:', responseText.length)
            console.log('📄 Response text (quoted):', JSON.stringify(responseText))
            
            if (responseText.trim() === '') {
              console.log('✅ Empty response - treating as success')
              setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
              alert(`File ${file.name} uploaded successfully! (Empty response)`)
            } else {
              console.log('✅ Non-empty response - treating as success')
              console.log('📄 Response content:', responseText)
              setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
              alert(`File ${file.name} uploaded successfully!\nResponse: ${responseText}`)
            }
          }
        } else {
          console.log('❌ Response is not OK, reading error response...')
          const errorText = await response.text()
          console.error('❌ Upload failed!')
          console.error('❌ Status:', response.status)
          console.error('❌ Status text:', response.statusText)
          console.error('❌ Error response text:', errorText)
          console.error('❌ Error response length:', errorText.length)
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 }))
          
          // Parse error response to provide more specific messages
          let errorMessage = 'Upload failed'
          
          try {
            const errorData = JSON.parse(errorText)
            if (errorData.error) {
              errorMessage = errorData.error.message || errorMessage
            } else if (errorData.message) {
              errorMessage = errorData.message
            }
          } catch (parseError) {
            // If we can't parse the error, use the raw text
            if (errorText.toLowerCase().includes('storage') || errorText.toLowerCase().includes('space') || errorText.toLowerCase().includes('full')) {
              errorMessage = 'Storage space is full. Please delete some files or upgrade your storage plan.'
            } else if (errorText.toLowerCase().includes('size') || errorText.toLowerCase().includes('large')) {
              errorMessage = 'File is too large. Please use a smaller file (max 10MB).'
            } else if (errorText.toLowerCase().includes('type') || errorText.toLowerCase().includes('format')) {
              errorMessage = 'File type not supported. Only .pdf, .docx, and .txt files are accepted.'
            } else if (errorText.toLowerCase().includes('invalid') || errorText.toLowerCase().includes('corrupted')) {
              errorMessage = 'File appears to be corrupted or invalid. Please try a different file.'
            } else {
              errorMessage = `Upload failed: ${errorText}`
            }
          }
                      alert(`Failed to upload ${file.name}: ${errorMessage}`)
        }

      } catch (error) {
        console.error('❌ Network error:', error)
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 }))
        alert(`Network error uploading ${file.name}`)
      }
    }

    // Clear the input
    event.target.value = ''
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
  }

  console.log('🔄 Knowledge base component rendering...')
  console.log('🔄 Active tab:', activeTab)
  console.log('🔄 Uploaded files count:', uploadedFiles.length)
  console.log('🔄 Is uploading:', isUploading)
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Brand Customization</h1>
                <p className="text-gray-600">Customize your brand appearance and voice.</p>
              </div>
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
                onClick={() => handleTabChange('structured')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'structured'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Structured Form
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
                    {/* View Knowledge Button */}
                    <div className="mb-6">
                      <button
                        onClick={() => setIsKnowledgeViewerOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Knowledge</span>
                      </button>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                      <div className="w-12 h-12 bg-gray-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-white text-lg">📁</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">Upload Files</h4>
                      <p className="text-sm text-gray-500 mb-3">Upload documents, presentations, or other business-related files</p>
                      <p className="text-xs text-gray-400 mb-4">Only .pdf, .docx, and .txt files are accepted (up to 10MB)</p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.docx,.txt"
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
                        <button
                          onClick={() => {
                            console.log('🧪 Test button clicked!')
                            console.log('🧪 handleFileUpload function exists:', typeof handleFileUpload)
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Test Function
                        </button>
                        <button
                          onClick={testN8nWebhook}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Test Webhook
                        </button>
                        <button
                          onClick={testWithTextFile}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Test Text File
                        </button>
                      </div>
                    </div>

                    {/* Storage Warning */}
                    {userProfile && (userProfile.kb_storage || 0) > ((userProfile.max_kb_storage_mb || 500) * 0.8) && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-yellow-800">
                            Storage space is running low. You have used {(userProfile.kb_storage || 0)} MB of {(userProfile.max_kb_storage_mb || 500)} MB.
                          </span>
                        </div>
                      </div>
                    )}

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

            {activeTab === 'structured' && (
              <div className="space-y-8">
                {/* Structured Brand Form Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Brand Information Form</h2>
                    <p className="text-gray-600 mt-1">Fill out your comprehensive brand information to update the knowledge base</p>
                  </div>
                  <div className="p-6">
                    <BrandForm />
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

      {/* Knowledge Base Viewer Modal */}
      <KnowledgeBaseViewer
        isOpen={isKnowledgeViewerOpen}
        onClose={() => setIsKnowledgeViewerOpen(false)}
      />

    </ProtectedRoute>
  )
}