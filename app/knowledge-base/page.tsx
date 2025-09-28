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

  const handleFormSuccess = () => {
    setIsFormCompleted(true)
    setIsKnowledgeViewerOpen(true)
  }

  // Media library functions
  const fetchMediaLibrary = async () => {
    try {
      console.log('📚 Fetching media library for knowledge base...')
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        console.error("No access token available")
        setMediaItems([])
        return
      }

      const response = await fetch('/api/media/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch media library:', response.status, response.statusText)
        setMediaItems([])
        return
      }

      const result = await response.json()
      console.log('📊 Media library response:', result)
      
      if (Array.isArray(result)) {
        setMediaItems(result)
      } else if (result.data && Array.isArray(result.data)) {
        setMediaItems(result.data)
      } else {
        setMediaItems([])
      }
    } catch (error) {
      console.error('❌ Error fetching media library:', error)
      setMediaItems([])
    }
  }

  const uploadMediaFiles = async (files: File[]) => {
    try {
      console.log('📤 Uploading files to media library...')
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        console.error("No access token available")
        return
      }

      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData
      })

      if (!response.ok) {
        console.error('Failed to upload files:', response.status, response.statusText)
        return
      }

      const result = await response.json()
      console.log('📤 Upload result:', result)
      
      // Refresh media library after upload
      setTimeout(() => {
        fetchMediaLibrary()
      }, 500)
    } catch (error) {
      console.error('❌ Error uploading files:', error)
    }
  }

  const deleteMediaFile = async (id: string) => {
    try {
      console.log('🗑️ Deleting media file:', id)
      setIsDeleting(true)
      setDeletingItemId(id)
      
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        console.error("No access token available")
        return
      }

      const response = await fetch(`/api/media/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Failed to delete file:', response.status, response.statusText)
        return
      }

      // Remove item from local state
      setMediaItems(prev => prev.filter(item => item.id !== id))
      console.log('✅ File deleted successfully')
    } catch (error) {
      console.error('❌ Error deleting file:', error)
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

  // Fetch media library on component mount
  React.useEffect(() => {
    fetchMediaLibrary()
  }, [])

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
        />
        <SidebarInset>
          <main className="flex-1 overflow-hidden">
            <motion.div 
              className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
        {/* Clean Header */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-8"
          variants={itemVariants}
        >
          <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                onClick={() => window.history.back()}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full"
              >
                  <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
                </Button>
                              <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Brand Information
                    </h1>
                    <p className="text-slate-600 mt-1">
                      {isFormCompleted 
                        ? "Your brand profile has been saved successfully!" 
                        : "Fill out your comprehensive brand information to enhance AI copy generation"
                      }
                    </p>
                    {isFormCompleted && (
                      <div className="flex items-center space-x-2 text-green-600 mt-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Profile completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  console.log('=== VIEW KNOWLEDGE BASE BUTTON CLICKED ===')
                  console.log('🔘 Button clicked - opening knowledge base viewer modal')
                  console.log('📅 Timestamp:', new Date().toISOString())
                  setIsKnowledgeViewerOpen(true)
                }}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Knowledge Base
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Clean Form Container */}
        <div className="max-w-4xl mx-auto p-6">
          <motion.div variants={itemVariants}>
            <BrandFormClean onSuccess={handleFormSuccess} />
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