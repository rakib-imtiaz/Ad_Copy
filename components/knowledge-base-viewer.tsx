"use client"

import * as React from "react"
import { authService } from "@/lib/auth-service"
import { API_ENDPOINTS } from "@/lib/api-config"
import { Toast } from "@/components/ui/toast"

interface KnowledgeBaseViewerProps {
  isOpen: boolean
  onClose: () => void
}

export function KnowledgeBaseViewer({ isOpen, onClose }: KnowledgeBaseViewerProps) {
  const [content, setContent] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  const [hasChanges, setHasChanges] = React.useState(false)
  const [originalContent, setOriginalContent] = React.useState("")
  const [showToast, setShowToast] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState("")
  const [toastType, setToastType] = React.useState<'success' | 'error' | 'info'>('success')

  // Fetch knowledge base content
  const fetchKnowledgeBaseContent = async () => {
    setIsLoading(true)
    setError("")
    try {
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        setError("Authentication required. Please log in again.")
        return
      }

      console.log('🔍 Fetching knowledge base content...')
      console.log('URL:', API_ENDPOINTS.N8N_WEBHOOKS.SEE_KNOWLEDGE_BASE)
      console.log('Token:', accessToken.substring(0, 20) + '...')

      const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.SEE_KNOWLEDGE_BASE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)

      if (response.ok) {
        try {
          const result = await response.json()
          console.log('📄 Response data type:', typeof result)
          console.log('📄 Response structure:', Array.isArray(result) ? 'Array' : 'Object')
          
          let contentText = ""
          
          // Handle array format with company_info
          if (Array.isArray(result) && result.length > 0) {
            contentText = result[0]?.company_info || result[0]?.business_info || ""
            console.log('📄 Found array format with company_info')
          }
          // Handle object format
          else if (result && typeof result === 'object') {
            contentText = result.company_info || result.business_info || result.data?.company_info || result.data?.business_info || result.data || ""
            console.log('📄 Found object format')
          }
          // Handle string format
          else if (typeof result === 'string') {
            contentText = result
            console.log('📄 Found string format')
          }
          
          console.log('📄 Content length:', contentText.length)
          console.log('📄 Content preview:', contentText.substring(0, 100) + '...')
          
          setContent(contentText)
          setOriginalContent(contentText)
          setHasChanges(false)
          
        } catch (jsonError) {
          console.log('📄 JSON parse failed, trying as text...')
          const textContent = await response.text()
          console.log('📄 Text content length:', textContent.length)
          console.log('📄 Text content preview:', textContent.substring(0, 100) + '...')
          
          setContent(textContent)
          setOriginalContent(textContent)
          setHasChanges(false)
        }
      } else {
        const errorText = await response.text()
        console.error('❌ HTTP Error:', response.status, response.statusText)
        console.error('❌ Error response:', errorText)
        setError(`Failed to fetch content: ${response.status} ${response.statusText}`)
      }
    } catch (error: any) {
      console.error('❌ Network error:', error)
      setError(`Network error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Update knowledge base content
  const updateKnowledgeBaseContent = async () => {
    setIsUpdating(true)
    setError("")
    setSuccess("")
    
    try {
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        setError("Authentication required. Please log in again.")
        return
      }

      console.log('💾 Updating knowledge base content...')
      console.log('URL:', API_ENDPOINTS.N8N_WEBHOOKS.MODIFY_KNOWLEDGE_BASE)
      console.log('Content length:', content.length)
      console.log('Content preview:', content.substring(0, 100) + '...')

      const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.MODIFY_KNOWLEDGE_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          business_info: content
        })
      })

      console.log('📡 Update response status:', response.status)
      console.log('📡 Update response ok:', response.ok)

      if (response.ok) {
        try {
          const result = await response.json()
          console.log('📄 Update response:', result)
          if (result.success || result.status === "success") {
            setToastMessage("Knowledge Base Updated Successfully!")
            setToastType('success')
            setShowToast(true)
            setOriginalContent(content)
            setHasChanges(false)
          } else {
            setToastMessage(result.message || "Failed to update knowledge base")
            setToastType('error')
            setShowToast(true)
          }
        } catch (jsonError) {
          console.log('📄 Update response is not JSON, treating as success')
          setToastMessage("Knowledge Base Updated Successfully!")
          setToastType('success')
          setShowToast(true)
          setOriginalContent(content)
          setHasChanges(false)
        }
      } else {
        const errorText = await response.text()
        console.error('❌ Update failed:', response.status, response.statusText)
        console.error('❌ Update error response:', errorText)
        setToastMessage(`Failed to update: ${response.status} ${response.statusText}`)
        setToastType('error')
        setShowToast(true)
      }
    } catch (error: any) {
      console.error('❌ Update network error:', error)
      setToastMessage(`Network error: ${error.message}`)
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    setHasChanges(newContent !== originalContent)
  }

  // Load content when modal opens
  React.useEffect(() => {
    if (isOpen) {
      fetchKnowledgeBaseContent()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Knowledge Base Viewer</h2>
            <p className="text-sm text-gray-600">View and edit your knowledge base content</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

                 {/* Content */}
         <div className="flex-1 p-6 overflow-hidden">
           {isLoading ? (
             <div className="flex flex-col items-center justify-center h-full">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
               <span className="ml-3 text-gray-600 mt-4">Loading knowledge base content...</span>
               <span className="text-xs text-gray-500 mt-2">This may take a moment for large content</span>
             </div>
           ) : (
            <div className="h-full flex flex-col">
              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              

                             {/* Text Editor */}
               <div className="flex-1 flex flex-col">
                 <div className="flex items-center justify-between mb-2">
                   <label className="block text-sm font-medium text-gray-700">
                     Knowledge Base Content
                   </label>
                   <span className="text-xs text-gray-500">
                     {content.length.toLocaleString()} characters
                   </span>
                 </div>
                                   <textarea
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Enter your knowledge base content here..."
                    className="flex-1 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm font-mono leading-relaxed overflow-y-auto text-black"
                    disabled={isUpdating}
                    style={{ minHeight: '400px' }}
                  />
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchKnowledgeBaseContent}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            {hasChanges && (
              <span className="text-sm text-orange-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Unsaved changes
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={updateKnowledgeBaseContent}
              disabled={isUpdating || !hasChanges}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isUpdating || !hasChanges
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
                 </div>
       </div>

       {/* Toast Notification */}
       <Toast
         message={toastMessage}
         type={toastType}
         isVisible={showToast}
         onClose={() => setShowToast(false)}
       />
     </div>
   )
 }
