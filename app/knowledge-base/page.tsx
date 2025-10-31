"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/protected-route"
import { BrandFormClean } from "@/components/brand-form-clean"
import { KnowledgeBaseViewer } from "@/components/knowledge-base-viewer"
import { KnowledgeBaseSidebar } from "@/components/knowledge-base-sidebar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Eye, CheckCircle } from "lucide-react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { authService } from "@/lib/auth-service"
import { API_ENDPOINTS } from "@/lib/api-config"
import { toast } from "sonner"

export default function KnowledgeBasePage() {
  const [isSaving, setIsSaving] = React.useState(false)
  const [isKnowledgeViewerOpen, setIsKnowledgeViewerOpen] = React.useState(false)
  const [isFormCompleted, setIsFormCompleted] = React.useState(false)
  
  // Media library state
  const [mediaItems, setMediaItems] = React.useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isLoadingTabContent, setIsLoadingTabContent] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [deletingItemId, setDeletingItemId] = React.useState<string | null>(null)
  const [isScraping, setIsScraping] = React.useState(false)
  const [isClearingKnowledgeBase, setIsClearingKnowledgeBase] = React.useState(false)
  const [formResetKey, setFormResetKey] = React.useState(0)

  const handleFormSuccess = () => {
    setIsFormCompleted(true)
    // Removed auto-trigger for knowledge base viewer - user must manually click the button
  }

  // Show toast helper
  const showToastMessage = (message: string, type: 'success' | 'error' | 'info') => {
    if (type === 'success') {
      toast.success(message)
    } else if (type === 'error') {
      toast.error(message)
    } else {
      toast(message)
    }
  }


  // Helper function to detect file type from webhook data
  const getFileType = (fileType: string | null): string => {
    if (!fileType) return 'doc'
    
    // Handle specific file types from the API
    if (fileType === 'pdf') return 'pdf'
    if (fileType === 'image') return 'image'
    if (fileType === 'video') return 'video'
    if (fileType === 'audio') return 'audio'
    if (fileType === 'youtube') return 'youtube'
    if (fileType === 'transcript') return 'transcript'
    if (fileType === 'scraped') return 'scraped'
    if (fileType === 'url') return 'url'
    
    // Handle MIME types
    if (fileType.startsWith('image/')) return 'image'
    if (fileType.startsWith('video/')) return 'video'
    if (fileType.startsWith('audio/')) return 'audio'
    
    // Handle file extensions
    if (fileType.includes('pdf')) return 'pdf'
    if (fileType.includes('doc')) return 'doc'
    if (fileType.includes('txt')) return 'txt'
    if (fileType.includes('png') || fileType.includes('jpg') || fileType.includes('jpeg') || fileType.includes('gif')) return 'image'
    if (fileType.includes('mp4') || fileType.includes('avi') || fileType.includes('mov')) return 'video'
    if (fileType.includes('mp3') || fileType.includes('wav') || fileType.includes('m4a')) return 'audio'
    
    return 'doc'
  }

  // Media library functions
  const fetchMediaLibrary = async () => {
    try {
      console.log('📚 ===== FETCH MEDIA LIBRARY START =====')
      console.log('📊 Current mediaItems before fetch:', mediaItems.length)
      
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("No access token available")
        setMediaItems([])
        return
      }

      console.log('🔍 Fetching media library from: /api/media/list (proxied to n8n)')
      console.log('🔍 Access token:', accessToken ? 'Present' : 'Missing')
      
      // Fetch both media library and scraped contents in parallel (like dashboard)
      console.log('📡 Making parallel requests to:')
      console.log('  - /api/media/list (media library)')
      console.log('  - /api/scraped-contents (scraped content)')
      
      const [mediaResponse, scrapedResponse] = await Promise.all([
        fetch('/api/media/list', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('/api/scraped-contents', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      ])

      console.log('📡 Media response status:', mediaResponse.status)
      console.log('📡 Scraped response status:', scrapedResponse.status)

      let mediaData = []
      let scrapedData = []

      // Process media library response
      if (mediaResponse.ok) {
        const mediaResult = await mediaResponse.json()
        console.log('✅ Media library data received:', mediaResult)
        
        let rawMediaData = []
        if (Array.isArray(mediaResult)) {
          rawMediaData = mediaResult
        } else if (mediaResult.data && Array.isArray(mediaResult.data)) {
          rawMediaData = mediaResult.data
        }

        // Transform media items like dashboard does
        mediaData = rawMediaData.map((item: any) => {
          console.log(`🔄 Processing media item: ${item.file_name || item.filename || item.name}`)
          console.log(`  - Media ID: ${item.media_id}`)
          console.log(`  - File type: ${item.file_type}`)
          
          return {
            id: item.media_id?.toString() || item.id?.toString() || `item-${Math.random()}`,
            userId: 'current_user',
            filename: item.file_name || item.filename || item.name || 'Unknown file',
            type: getFileType(item.file_type || item.file_name || item.filename),
            size: parseFloat(item.media_size || item.size || 0) * 1024, // Convert KB to bytes
            uploadedAt: item.timestamp ? new Date(item.timestamp) : new Date(),
            tags: [],
            url: item.drive_link || item.url,
            metadata: {
              storageStatus: item.storage_status || 'unknown',
              fileType: item.file_type,
              originalSize: item.media_size
            }
          }
        })
      } else {
        console.error('❌ Failed to fetch media library:', mediaResponse.status, mediaResponse.statusText)
      }

      // Process scraped contents response
      if (scrapedResponse.ok) {
        const scrapedResult = await scrapedResponse.json()
        console.log('✅ Scraped contents data received:', scrapedResult)
        
        if (scrapedResult.data && Array.isArray(scrapedResult.data)) {
          // Transform scraped contents into media items format
          scrapedData = scrapedResult.data.map((item: any) => ({
            id: `scraped-${item.resource_id || item.id || Math.random()}`,
            filename: item.resource_name || item.filename || 'Unknown',
            type: item.type || 'scraped',
            content: item.content,
            transcript: item.transcript,
            url: item.url,
            uploadedAt: new Date(item.created_at || Date.now()),
            size: item.content ? item.content.length : 0,
            title: item.resource_name || item.title || 'Scraped Content',
            resourceId: item.resource_id,
            resourceName: item.resource_name
          }))
        }
      } else {
        console.error('❌ Failed to fetch scraped contents:', scrapedResponse.status, scrapedResponse.statusText)
      }

      // Merge both data sources and ensure all items have proper IDs
      const mergedItems = [...mediaData]
      
      // Add scraped items, but avoid duplicates with media items
      scrapedData.forEach((scrapedItem: any) => {
        // Check if this scraped item matches an existing media item by filename AND is an image analysis
        const existingMediaIndex = mergedItems.findIndex(mediaItem => 
          mediaItem.filename === scrapedItem.filename && 
          mediaItem.type === 'image' && // Only check for image duplicates
          scrapedItem.type === 'image'  // Only merge image analysis scraped content
        )
        
        if (existingMediaIndex !== -1) {
          // Merge scraped content with existing media item
          const existingItem = mergedItems[existingMediaIndex]
          mergedItems[existingMediaIndex] = {
            ...existingItem,
            ...scrapedItem,
            // Keep the original media ID but use scraped content
            id: existingItem.id,
            content: scrapedItem.content || existingItem.content,
            analysisStatus: scrapedItem.content ? 'completed' : existingItem.analysisStatus,
            // Preserve resourceId from scraped item
            resourceId: scrapedItem.resourceId || existingItem.resourceId,
            resourceName: scrapedItem.resourceName || existingItem.resourceName
          }
          console.log('🔄 Merged scraped analysis with media item:', {
            filename: scrapedItem.filename,
            hasContent: !!scrapedItem.content,
            resourceId: scrapedItem.resourceId,
            resourceName: scrapedItem.resourceName
          })
        } else {
          // Add as new item if no duplicate found
          console.log('➕ Adding new scraped item:', {
            filename: scrapedItem.filename,
            resourceId: scrapedItem.resourceId,
            resourceName: scrapedItem.resourceName
          })
          mergedItems.push(scrapedItem)
        }
      })
      
      // Ensure all items have proper IDs
      const finalItems = mergedItems.map((item: any, index: number) => ({
        ...item,
        id: item.id || `item-${index}-${Date.now()}`,
        filename: item.filename || item.name || item.title || 'Unknown',
        type: item.type || 'unknown',
        // Ensure resourceId is preserved
        resourceId: item.resourceId,
        resourceName: item.resourceName
      }))
      
      console.log('📊 Final merged items count:', finalItems.length)
      console.log('📊 Media items:', mediaData.length)
      console.log('📊 Scraped items:', scrapedData.length)
      
      // Debug: Log file types being processed
      console.log('🔍 File types in final items:')
      finalItems.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.filename} - Type: ${item.type} - ResourceId: ${item.resourceId} - Original data:`, {
          file_name: item.file_name,
          filename: item.filename,
          name: item.name,
          title: item.title,
          type: item.type,
          resourceId: item.resourceId,
          resourceName: item.resourceName
        })
      })
      
      setMediaItems(finalItems)
      console.log('✅ Media library fetch completed successfully')
      
    } catch (error) {
      console.error('❌ Error fetching media library:', error)
      setMediaItems([])
    }
  }

  const uploadMediaFiles = async (files: File[]) => {
    try {
      console.log('📤 ===== UPLOAD MEDIA FILES START =====')
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        console.error("No access token available")
        return
      }

      console.log('📤 Uploading files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })))

      // Upload files one by one (like dashboard)
      for (const file of files) {
        console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type)
        
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        })

        if (!response.ok) {
          console.error('Upload failed for file:', file.name, 'Status:', response.status)
          const errorData = await response.json().catch(() => ({}))
          console.error('Error details:', errorData)
          continue
        }

        const result = await response.json()
        console.log('✅ File uploaded successfully:', file.name, result)
      }

      console.log('✅ All files uploaded successfully')
      
      // Refresh the media library to show the newly uploaded files
      setTimeout(() => {
        console.log('Refreshing media library to show uploaded files...')
        fetchMediaLibrary()
      }, 500)
      
    } catch (error) {
      console.error('❌ Error uploading files:', error)
    }
  }

  const deleteMediaFile = async (id: string, resourceName?: string) => {
    let loadingToast: any = null
    
    try {
      console.log('🗑️ ===== DELETE MEDIA FILE START =====')
      console.log('🗑️ Deleting media file:', id)
      console.log('🗑️ Resource name:', resourceName)
      setIsDeleting(true)
      setDeletingItemId(id)
      
      // Show loading toast
      loadingToast = toast.loading("Deleting item...", {
        description: "Please wait while we remove the item from your knowledge base."
      })

      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        console.error("No access token available")
        toast.dismiss(loadingToast)
        showToastMessage("Authentication required", 'error')
        return
      }

      // Find the item to get its filename
      const item = mediaItems.find(item => item.id === id)
      if (!item) {
        console.error('Item not found:', id)
        toast.dismiss(loadingToast)
        showToastMessage("Item not found", 'error')
        return
      }

      console.log('🗑️ Item found:', {
        id: item.id,
        filename: item.filename,
        title: item.title,
        resourceId: item.resourceId,
        resourceName: item.resourceName
      })

      const filename = item.filename || item.title || resourceName || 'Unknown'
      console.log('🗑️ Deleting file:', filename)

      // Check if this is scraped content
      const isScrapedContent = (id && id.startsWith('scraped-')) || item.resourceId
      
      let response
      if (isScrapedContent) {
        console.log('🗑️ Deleting scraped content via webhook')
        response = await fetch('/api/scraped-contents', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            file_name: item.resourceName || filename,
            resource_id: item.resourceId
          }),
        })
      } else {
        console.log('🗑️ Deleting regular media file')
        response = await fetch('/api/media/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            file_name: filename
          }),
        })
      }

      if (!response.ok) {
        console.error('Delete failed for file:', filename, 'Status:', response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error details:', errorData)
        toast.dismiss(loadingToast)
        showToastMessage(`Failed to delete ${filename}`, 'error')
        return
      }

      const result = await response.json()
      console.log('✅ File deleted successfully:', filename, result)
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      showToastMessage(`${filename} deleted successfully!`, 'success')
      
      // Refresh media library after deletion
      setTimeout(() => {
        console.log('Refreshing media library after deletion...')
        fetchMediaLibrary()
      }, 500)
      
    } catch (error) {
      console.error('❌ Error deleting file:', error)
      toast.dismiss(loadingToast)
      showToastMessage("Failed to delete item", 'error')
    } finally {
      setIsDeleting(false)
      setDeletingItemId(null)
    }
  }

  const refreshAllTabs = async () => {
    console.log('🔄 Refreshing all media tabs...')
    setIsRefreshing(true)
    setIsLoadingTabContent(true)
    
    try {
      await fetchMediaLibrary()
    } catch (error) {
      console.error('❌ Error refreshing media library:', error)
    } finally {
      setIsRefreshing(false)
      setIsLoadingTabContent(false)
    }
  }

  const clearKnowledgeBase = async () => {
    try {
      console.log('🗑️ ===== CLEAR KNOWLEDGE BASE START =====')
      setIsClearingKnowledgeBase(true)

      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        console.error("No access token available")
        showToastMessage("Authentication required", 'error')
        return
      }

      console.log('🗑️ Clearing knowledge base...')

      const response = await fetch('/api/knowledge-base/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          accessToken
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Clear failed:', response.status, errorData)
        showToastMessage(`Failed to clear knowledge base: ${errorData.error?.message || 'Unknown error'}`, 'error')
        return
      }

      const result = await response.json()
      console.log('✅ Knowledge base cleared successfully:', result)
      showToastMessage("Knowledge base cleared successfully!", 'success')
      
      // Clear pending knowledge base data from window
      if (typeof window !== 'undefined') {
        delete (window as any).pendingKnowledgeBaseData
        delete (window as any).pendingKnowledgeBaseDataTimestamp
        console.log('🧹 Cleared pending knowledge base data from window')
      }
      
      // Reset form by changing the key to force remount
      setFormResetKey(prev => prev + 1)
      console.log('🔄 Form reset key updated to force form reset')
      
      // Refresh media library to reflect changes
      setTimeout(() => {
        console.log('Refreshing media library after clearing knowledge base...')
        fetchMediaLibrary()
      }, 500)
      
    } catch (error) {
      console.error('❌ Error clearing knowledge base:', error)
      showToastMessage("Failed to clear knowledge base", 'error')
    } finally {
      setIsClearingKnowledgeBase(false)
    }
  }

  // Helper function to check if knowledge base data has meaningful content
  const hasMeaningfulData = (data: any): boolean => {
    if (!data) return false
    
    // Check brand identity fields
    const hasBusinessInfo = data.brandIdentity?.businessNameTagline?.name?.trim() ||
                           data.brandIdentity?.businessNameTagline?.tagline?.trim() ||
                           data.brandIdentity?.founderNameBackstory?.founders?.trim() ||
                           data.brandIdentity?.founderNameBackstory?.backstory?.trim() ||
                           data.brandIdentity?.missionStatement?.whyWeExist?.trim() ||
                           data.brandIdentity?.missionStatement?.principles?.trim() ||
                           data.brandIdentity?.businessModelType?.trim() ||
                           data.brandIdentity?.uniqueSellingProposition?.trim()
    
    // Check target audience fields
    const hasAudienceInfo = data.targetAudience?.idealCustomerProfile?.description?.some((desc: string) => desc?.trim()) ||
                           data.targetAudience?.primaryPainPoints?.trim() ||
                           data.targetAudience?.primaryDesiresGoals?.some((goal: string) => goal?.trim()) ||
                           data.targetAudience?.commonObjections?.some((obj: string) => obj?.trim())
    
    // Check offers
    const hasOffers = data.offers?.some((offer: any) => 
      offer?.name?.trim() || offer?.price?.trim() || offer?.description?.trim()
    )
    
    // Check client assets
    const hasClientAssets = data.clientAssets?.socialMediaProfiles?.instagram?.trim() ||
                           data.clientAssets?.socialMediaProfiles?.youtube?.trim() ||
                           data.clientAssets?.socialMediaProfiles?.facebook?.trim() ||
                           data.clientAssets?.testimonialsCaseStudies?.some((testimonial: string) => testimonial?.trim())
    
    // Check other information
    const hasOtherInfo = data.otherInformation?.trim() ||
                        data.productName?.trim() ||
                        data.productDescription?.trim()
    
    return !!(hasBusinessInfo || hasAudienceInfo || hasOffers || hasClientAssets || hasOtherInfo)
  }

  // Auto-populate knowledge base data on component mount
  const autoPopulateKnowledgeBase = React.useCallback(async () => {
    try {
      console.log('🔄 Auto-populating knowledge base data...')
      
      // Use the webhook parser approach instead of the service
      const { WebhookService } = await import('@/lib/services/webhook-service')
      const { KnowledgeBaseWebhookParser } = await import('@/lib/services/knowledge-base-webhook-parser')
      
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        console.log('No access token available')
        return
      }

      // Test webhook and get data
      const webhookResponse = await WebhookService.testKnowledgeBaseWebhook(accessToken)
      
      if (!webhookResponse.success || !webhookResponse.data) {
        console.log('No data received from webhook')
        return
      }

      // Parse the data
      console.log('📝 Parsing webhook data...')
      const parsedData = KnowledgeBaseWebhookParser.parseWebhookData(webhookResponse.data)
      
      // Check if the parsed data has meaningful content
      const hasData = hasMeaningfulData(parsedData)
      
      if (!hasData) {
        console.log('⚠️ Parsed knowledge base data is empty or has no meaningful content')
        // Don't show success toast if there's no meaningful data
        return
      }
      
      // Store the parsed data globally so the form can access it
      // The form will check for this data and populate itself
      ;(window as any).pendingKnowledgeBaseData = parsedData
      
      // Also store a timestamp to help with debugging
      ;(window as any).pendingKnowledgeBaseDataTimestamp = Date.now()
      
      console.log('✅ Knowledge base data prepared for form population')
      console.log('📊 Stored data keys:', Object.keys(parsedData))
      console.log('📊 Testimonials data:', parsedData.clientAssets?.testimonialsCaseStudies)
      
      // Only show success toast if there's meaningful data
      showToastMessage("Knowledge base data loaded !", 'success')
      
    } catch (error: any) {
      console.error('❌ Error auto-populating knowledge base data:', error)
      // Don't show error to user for auto-population failures
    }
  }, [])

  // Fetch media library and auto-populate knowledge base on component mount
  React.useEffect(() => {
    fetchMediaLibrary()
    // Auto-populate knowledge base data after a short delay to ensure form is ready
    setTimeout(() => {
      autoPopulateKnowledgeBase()
    }, 1000)
  }, [autoPopulateKnowledgeBase])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }
  
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <KnowledgeBaseSidebar
          mediaItems={mediaItems}
          setMediaItems={setMediaItems}
          onRefresh={refreshAllTabs}
          onUpload={uploadMediaFiles}
          onDelete={deleteMediaFile}
          isRefreshing={isRefreshing}
          isLoadingTabContent={isLoadingTabContent}
          isDeleting={isDeleting}
          deletingItemId={deletingItemId}
          isScraping={isScraping}
          setIsScraping={setIsScraping}
          onViewKnowledgeBase={() => {
            console.log('=== VIEW KNOWLEDGE BASE BUTTON CLICKED ===')
            console.log('🔘 Button clicked - opening knowledge base viewer modal')
            console.log('📅 Timestamp:', new Date().toISOString())
            setIsKnowledgeViewerOpen(true)
          }}
          onClearKnowledgeBase={clearKnowledgeBase}
        />
        <SidebarInset>
          <main className="flex-1 overflow-y-auto">
            <motion.div 
              className="min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-100"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Form Container - Full Width for Scrolling */}
              <div className="w-full">
                <motion.div variants={itemVariants}>
                  <BrandFormClean 
                    key={formResetKey}
                    onSuccess={handleFormSuccess} 
                  />
                </motion.div>
              </div>

              {/* Knowledge Base Viewer Modal */}
              <KnowledgeBaseViewer
                isOpen={isKnowledgeViewerOpen}
                onClose={() => setIsKnowledgeViewerOpen(false)}
              />
            </motion.div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}