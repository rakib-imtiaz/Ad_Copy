"use client"

import * as React from "react"
import { authService } from "@/lib/auth-service"
import { API_ENDPOINTS } from "@/lib/api-config"

interface KnowledgeBaseViewerProps {
  isOpen: boolean
  onClose: () => void
}

export function KnowledgeBaseViewer({ isOpen, onClose }: KnowledgeBaseViewerProps) {
  const [content, setContent] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

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

      console.log('=== VIEW KNOWLEDGE BASE BUTTON CLICKED ===')
      console.log('🔍 Fetching knowledge base content...')
      console.log('📡 Webhook URL:', API_ENDPOINTS.N8N_WEBHOOKS.SEE_KNOWLEDGE_BASE)
      console.log('🔐 Access Token Length:', accessToken.length)
      console.log('🔐 Access Token Preview:', accessToken.substring(0, 30) + '...')
      console.log('📤 Request Method: GET')
      console.log('📤 Request Headers:', {
        'Authorization': `Bearer ${accessToken.substring(0, 20)}...`,
        'Content-Type': 'application/json'
      })

      const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.SEE_KNOWLEDGE_BASE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📊 Response received:')
      console.log('  - Status:', response.status)
      console.log('  - Status Text:', response.statusText)
      console.log('  - OK:', response.ok)
      console.log('  - Headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        try {
          const result = await response.json()
          console.log('📄 Raw Response Data:')
          console.log('  - Type:', typeof result)
          console.log('  - Structure:', Array.isArray(result) ? 'Array' : 'Object')
          console.log('  - Full Response:', JSON.stringify(result, null, 2))
          
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
          
        } catch (jsonError) {
          console.log('📄 JSON parse failed, trying as text...')
          const textContent = await response.text()
          console.log('📄 Text content length:', textContent.length)
          console.log('📄 Text content preview:', textContent.substring(0, 100) + '...')
          
          setContent(textContent)
        }
      } else {
        const errorText = await response.text()
        console.error('❌ HTTP Error Response:')
        console.error('  - Status:', response.status)
        console.error('  - Status Text:', response.statusText)
        console.error('  - Error Response Body:', errorText)
        console.error('  - Response Headers:', Object.fromEntries(response.headers.entries()))
        setError(`Failed to fetch content: ${response.status} ${response.statusText}`)
      }
    } catch (error: any) {
      console.error('❌ Network/Catch Error:')
      console.error('  - Error Type:', error.constructor.name)
      console.error('  - Error Message:', error.message)
      console.error('  - Error Stack:', error.stack)
      console.error('  - Full Error Object:', error)
      setError(`Network error: ${error.message}`)
    } finally {
      setIsLoading(false)
      console.log('=== VIEW KNOWLEDGE BASE REQUEST COMPLETED ===')
    }
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
            <h2 className="text-xl font-semibold text-gray-900">Business Information Viewer</h2>
            <p className="text-sm text-gray-600">View your Business Information content</p>
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
               <span className="ml-3 text-gray-600 mt-4">Loading Business Information content...</span>
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
                     Business Information Content
                   </label>
                   <span className="text-xs text-gray-500">
                     {content.length.toLocaleString()} characters
                   </span>
                 </div>
                                   <textarea
                    value={content}
                    placeholder="Business Information content will appear here..."
                    className="flex-1 p-4 border border-gray-300 rounded-lg resize-none text-sm font-mono leading-relaxed overflow-y-auto text-black bg-gray-50"
                    readOnly
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
              className="px-4 py-2 text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 disabled:border-gray-400"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white bg-purple-600 border border-purple-600 rounded-lg hover:bg-purple-700"
            >
              Close
            </button>
          </div>
                 </div>
       </div>

     </div>
   )
 }
