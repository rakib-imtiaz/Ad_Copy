"use client"

import * as React from "react"
import {
  Upload,
  FileText,
  Link2,
  Mic,
  Image,
  Trash2,
  Loader2,
  RefreshCw,
  ExternalLink,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Plus,
  Video,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedText, FadeInText, SlideInText } from "@/components/ui/animated-text"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ContentViewer } from "@/components/content-viewer"
import { Toast } from "@/components/ui/toast"
import { authService } from "@/lib/auth-service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Three Dots Menu Component
function ThreeDotsMenu({ onDelete, onDownload, onView, item }: any) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleDownload = () => {
    if (onDownload && item) {
      onDownload(item)
    }
    setIsOpen(false)
  }

  const handleView = () => {
    if (onView && item) {
      onView(item)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="h-3 w-3" />
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-6 z-20 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]">
            {onView && (
              <button
                className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                onClick={handleView}
              >
                <Eye className="h-3 w-3" />
                <span>View</span>
              </button>
            )}
            {onDownload && (
              <button
                className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center space-x-2"
                onClick={handleDownload}
              >
                <Download className="h-3 w-3" />
                <span>Download</span>
              </button>
            )}
            <button
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              onClick={() => {
                onDelete()
                setIsOpen(false)
              }}
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Files Tab Component
export function FilesTab({ mediaItems, onUpload, onDelete, isDeleting, deletingItemId, isLoadingTabContent, onDownload, onView }: any) {
  const [dragActive, setDragActive] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  // Helper function to format file sizes
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Handle file download
  const handleDownload = (item: any) => {
    if (item.url) {
      window.open(item.url, '_blank')
    } else if (item.filename) {
      // Create a download link for files without URL
      const link = document.createElement('a')
      link.href = item.url || '#'
      link.download = item.filename
      link.click()
    }
  }

  // Handle file view
  const handleView = (item: any) => {
    if (item.url) {
      window.open(item.url, '_blank')
    } else if (item.content) {
      // For text-based files, show content in a modal or new window
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${item.filename || 'File Content'}</title></head>
            <body style="font-family: monospace; padding: 20px; white-space: pre-wrap;">
              ${item.content}
            </body>
          </html>
        `)
      }
    }
  }
  
  const fileItems = mediaItems.filter((item: any) => {
    if (!item || !item.type) return false
    // Exclude images from files tab - they should only appear in Images tab
    const isFileType = ['pdf', 'doc', 'docx', 'txt', 'audio', 'video', 'mp3', 'mp4', 'wav', 'm4a'].includes(item.type)
    const matchesSearch = !searchQuery || 
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.filename && item.filename.toLowerCase().includes(searchQuery.toLowerCase()))
    return isFileType && matchesSearch
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && onUpload) {
      setIsUploading(true)
      await onUpload(files)
      setIsUploading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0 && onUpload) {
      setIsUploading(true)
      await onUpload(files)
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="space-y-2">
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Enhanced Dropzone */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dragActive 
            ? 'border-[#1ABC9C] bg-[#1ABC9C]/10 scale-[1.02] shadow-lg' 
            : 'border-[#EEEEEE] hover:border-[#1ABC9C] hover:bg-[#1ABC9C]/5 hover:shadow-md'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className={`p-3 rounded-full transition-all duration-200 ${
            dragActive 
              ? 'bg-gradient-to-br from-[#1ABC9C] to-[#16A085] shadow-lg' 
              : 'bg-gradient-to-br from-[#EEEEEE] to-[#F5F5F5]'
          }`}>
            <Upload className={`h-6 w-6 transition-all duration-200 ${isUploading ? 'animate-bounce' : ''} ${
              dragActive ? 'text-white' : 'text-black'
            }`} />
          </div>
          <div className="space-y-1">
            <FadeInText 
              text={isUploading ? "Uploading files..." : "Drop files here or click to browse"} 
              className={`text-sm font-bold text-center transition-colors duration-200 ${
                isUploading ? 'text-[#1ABC9C]' : dragActive ? 'text-[#1ABC9C]' : 'text-slate-800'
              }`} 
            />
            <FadeInText 
              text={isUploading ? "Please wait..." : "Supports PDF, DOC, TXT, MP3, MP4, and more"} 
              className="text-xs text-slate-600 text-center" 
              delay={0.1} 
            />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.mp3,.mp4,.wav,.m4a,.jpg,.jpeg,.png,.gif"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* File count and list */}
      <div className="space-y-1">
        {fileItems.length > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            {fileItems.length} file{fileItems.length !== 1 ? 's' : ''} found
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
        {isLoadingTabContent ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : fileItems.length > 0 ? (
          fileItems.slice(0, 8).map((item: any, index: number) => {
            const getFileIcon = (type: string) => {
              switch (type) {
                case 'pdf':
                  return <FileText className="h-4 w-4 text-red-500" />
                case 'doc':
                case 'docx':
                  return <FileText className="h-4 w-4 text-blue-600" />
                case 'txt':
                  return <FileText className="h-4 w-4 text-gray-600" />
                case 'image':
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                  return <Image className="h-4 w-4 text-green-500" />
                case 'audio':
                case 'mp3':
                case 'wav':
                case 'm4a':
                  return <Mic className="h-4 w-4 text-blue-500" />
                case 'video':
                case 'mp4':
                  return <Video className="h-4 w-4 text-purple-500" />
                default:
                  return <FileText className="h-4 w-4 text-gray-500" />
              }
            }

            const isDeletingItem = deletingItemId === item.id

            return (
              <div
                key={item.id}
                className={`group relative p-2 rounded-md transition-all duration-200 cursor-pointer ${
                  'bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-200'
                } ${isDeletingItem ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getFileIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate text-gray-900">
                        {item.filename || item.name || item.title || `File ${index + 1}`}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {item.type?.toUpperCase()} • {item.size ? formatFileSize(item.size) : 'Unknown size'}
                        {item.uploadedAt && (
                          <span className="ml-2">
                            • {new Date(item.uploadedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {!isDeletingItem && (
                    <ThreeDotsMenu 
                      onDelete={() => onDelete(item.id)}
                      onDownload={handleDownload}
                      onView={handleView}
                      item={item}
                    />
                  )}
                  {isDeletingItem && (
                    <div className="h-6 w-6 flex items-center justify-center">
                      <Loader2 className="h-3 w-3 animate-spin text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            {searchQuery ? (
              <>
                <p className="text-sm text-gray-500 mb-1">No files found</p>
                <p className="text-xs text-gray-400">Try adjusting your search terms</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-1">No files uploaded yet</p>
                <p className="text-xs text-gray-400">Upload your first file to get started</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Links Tab Component
export function LinksTab({ mediaItems, onDelete, onRefresh, setMediaItems, isDeleting, deletingItemId, isLoadingTabContent }: any) {
  // Filter to show only webpage/url/scraped type items
  const webpageItems = mediaItems.filter((item: any) => 
    item && (item.type === 'webpage' || item.type === 'url' || item.type === 'scraped' || item.type === 'link')
  )
  const [urlInput, setUrlInput] = React.useState("")
  const [isScraping, setIsScraping] = React.useState(false)
  const [isLoadingContents, setIsLoadingContents] = React.useState(false)
  const [toast, setToast] = React.useState<{
    message: string
    type: 'success' | 'error' | 'info'
    isVisible: boolean
  }>({
    message: '',
    type: 'info',
    isVisible: false
  })
  
  const [viewerContent, setViewerContent] = React.useState<{
    title: string
    content: string
    sourceUrl?: string
    scrapedAt?: string
    filename?: string
  } | null>(null)
  
  const [isViewerOpen, setIsViewerOpen] = React.useState(false)
  
  // Fetch scraped contents when component mounts
  React.useEffect(() => {
    console.log('🔄 LinksTab useEffect - fetching scraped contents...')
    const fetchScrapedContents = async () => {
      try {
        const accessToken = authService.getAuthToken()
        
        if (!accessToken) {
          console.error('❌ No access token available for scraped contents')
          return
        }

        console.log('🔍 Making request to: /api/scraped-contents')
        console.log('🔍 Access token present:', !!accessToken)

        const response = await fetch('/api/scraped-contents', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        console.log('📡 Scraped contents response status:', response.status)

        if (!response.ok) {
          console.error('❌ Failed to fetch scraped contents:', response.status, response.statusText)
          return
        }

        const result = await response.json()
        console.log('✅ Scraped contents data received:', result.data?.length || 0, 'items')
        
        if (result.data && Array.isArray(result.data)) {
          // Transform scraped contents into media items
          const scrapedItems = result.data.map((item: any) => ({
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
          
          console.log('🔄 LinksTab - Updating media items with scraped contents...')
          console.log('📊 Scraped items to add:', scrapedItems.length)
          
          // Update the media items state
          setMediaItems((prevItems: any[]) => {
            // Remove existing scraped items and add new ones
            const nonScrapedItems = prevItems.filter((item: any) => 
              item && item.id && !item.id.startsWith('scraped-')
            )
            const updatedItems = [...nonScrapedItems, ...scrapedItems]
            console.log('📊 Total items after update:', updatedItems.length)
            
            // Force a re-render by returning a completely new array
            return [...updatedItems]
          })
        }
      } catch (error) {
        console.error('❌ Error fetching scraped contents:', error)
      }
    }
    
    fetchScrapedContents()
  }, [])
  
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({
      message,
      type,
      isVisible: true
    })
  }
  
  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  const handleViewContent = (item: any) => {
    // Check if this is scraped content with actual content
    if (item.content) {
      setViewerContent({
        title: item.resourceName || item.filename || 'Scraped Content',
        content: item.content,
        sourceUrl: item.url,
        scrapedAt: item.uploadedAt?.toISOString(),
        filename: item.filename
      })
    } else {
      // Fallback for items without content
      setViewerContent({
        title: item.resourceName || item.filename || 'Scraped Content',
        content: 'Content not available...',
        sourceUrl: item.url,
        scrapedAt: item.uploadedAt?.toISOString(),
        filename: item.filename
      })
    }
    setIsViewerOpen(true)
  }
  
  const handleScrapeUrl = async () => {
    console.log('🔍 handleScrapeUrl called with URL:', urlInput)
    
    if (!urlInput.trim()) {
      console.log('❌ URL input is empty, returning early')
      showToast('Please enter a URL to scrape', 'error')
      return
    }
    
    // Basic URL validation
    try {
      new URL(urlInput.trim())
    } catch {
      showToast('Please enter a valid URL', 'error')
      return
    }
    
    try {
      setIsScraping(true)
      console.log('🔍 Getting access token...')
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("❌ No access token available")
        showToast('Authentication required. Please sign in again.', 'error')
        return
      }

      console.log('✅ Access token found:', accessToken ? 'Present' : 'Missing')
      console.log('🔍 Scraping URL:', urlInput)
      
      const apiUrl = `/api/webpage-scrape?url=${encodeURIComponent(urlInput.trim())}`
      console.log('🔍 Making request to:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 Webpage scraping response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Webpage scraping failed:', response.status, errorData)
        showToast(`Failed to scrape webpage: ${errorData.error || response.statusText}`, 'error')
        return
      }

      const result = await response.json()
      console.log('✅ Webpage scraping result:', result)
      
      if (result.success) {
        showToast('Webpage scraped successfully! Content will be available shortly.', 'success')
        setUrlInput("")
        
        // Refresh media items to show the new scraped content
        setTimeout(() => {
          onRefresh()
        }, 2000)
      } else {
        showToast(`Scraping failed: ${result.error || 'Unknown error'}`, 'error')
      }
    } catch (error) {
      console.error('❌ Error scraping webpage:', error)
      showToast('Network error occurred while scraping', 'error')
    } finally {
      setIsScraping(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* URL Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleScrapeUrl(); }} className="space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Add Web Link</label>
          <div className="flex space-x-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com"
              className="flex-1"
              disabled={isScraping}
            />
            <Button 
              type="submit" 
              disabled={!urlInput.trim() || isScraping}
              className="bg-[#1ABC9C] hover:bg-[#16A085] text-white"
            >
              {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </form>

      {/* Links list */}
      <div className="space-y-1">
        {isLoadingTabContent ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : webpageItems.length > 0 ? (
          webpageItems.slice(0, 8).map((item: any, index: number) => {
            const isDeletingItem = deletingItemId === item.id

            return (
              <div
                key={item.id}
                className={`group relative p-2 rounded-md transition-all duration-200 cursor-pointer ${
                  'bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-200'
                } ${isDeletingItem ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Link2 className="h-4 w-4 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate text-gray-900">
                        {item.title || item.name || `Link ${index + 1}`}
                      </h4>
                      <p className="text-xs text-blue-600 truncate">
                        {item.url || item.link}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewContent(item)
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View content</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-500 hover:text-green-600 hover:bg-green-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(item.url || item.link, '_blank')
                            }}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open link</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {!isDeletingItem && (
                      <ThreeDotsMenu 
                        onDelete={() => onDelete(item.id)}
                      />
                    )}
                    {isDeletingItem && (
                      <div className="h-6 w-6 flex items-center justify-center">
                        <Loader2 className="h-3 w-3 animate-spin text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <Link2 className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-1">No links added yet</p>
            <p className="text-xs text-gray-400">Add web links to scrape content</p>
          </div>
        )}
      </div>
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      {/* Content Viewer */}
      {viewerContent && (
        <ContentViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          content={viewerContent}
        />
      )}
    </div>
  )
}

// YouTube Tab Component
export function YouTubeTab({ mediaItems, onDelete, onRefresh, setMediaItems, isDeleting, deletingItemId, isLoadingTabContent }: any) {
  const [urlInput, setUrlInput] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const youtubeItems = mediaItems.filter((item: any) => item && item.type === 'youtube')

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Simulate YouTube URL submission - replace with actual API call
      console.log('Submitting YouTube URL:', urlInput)
      // Add your YouTube transcription logic here
      setUrlInput("")
    } catch (error) {
      console.error('Error submitting YouTube URL:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* YouTube URL Input Form */}
      <form onSubmit={handleSubmitUrl} className="space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Add YouTube Video</label>
          <div className="flex space-x-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1"
              disabled={isSubmitting}
            />
            <Button 
              type="submit" 
              disabled={!urlInput.trim() || isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </form>

      {/* YouTube videos list */}
      <div className="space-y-1">
        {isLoadingTabContent ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : youtubeItems.length > 0 ? (
          youtubeItems.slice(0, 8).map((item: any, index: number) => {
            const isDeletingItem = deletingItemId === item.id

            return (
              <div
                key={item.id}
                className={`group relative p-2 rounded-md transition-all duration-200 cursor-pointer ${
                  'bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-200'
                } ${isDeletingItem ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Mic className="h-4 w-4 text-red-500" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate text-gray-900">
                        {item.title || item.name || `Video ${index + 1}`}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        YouTube • {item.duration || 'Unknown duration'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(item.url || item.link, '_blank')
                            }}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open video</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {!isDeletingItem && (
                      <ThreeDotsMenu 
                        onDelete={() => onDelete(item.id)}
                      />
                    )}
                    {isDeletingItem && (
                      <div className="h-6 w-6 flex items-center justify-center">
                        <Loader2 className="h-3 w-3 animate-spin text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <Mic className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-1">No YouTube videos yet</p>
            <p className="text-xs text-gray-400">Add YouTube videos to transcribe</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Image Analyzer Tab Component
export function ImageAnalyzerTab({ mediaItems, onUpload, onDelete, isDeleting, deletingItemId, isLoadingTabContent }: any) {
  const [dragActive, setDragActive] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const imageItems = mediaItems.filter((item: any) => item && item.type === 'image')

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    if (files.length > 0 && onUpload) {
      setIsUploading(true)
      await onUpload(files)
      setIsUploading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0 && onUpload) {
      setIsUploading(true)
      await onUpload(files)
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Image Dropzone */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dragActive 
            ? 'border-[#1ABC9C] bg-[#1ABC9C]/10 scale-[1.02] shadow-lg' 
            : 'border-[#EEEEEE] hover:border-[#1ABC9C] hover:bg-[#1ABC9C]/5 hover:shadow-md'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className={`p-3 rounded-full transition-all duration-200 ${
            dragActive 
              ? 'bg-gradient-to-br from-[#1ABC9C] to-[#16A085] shadow-lg' 
              : 'bg-gradient-to-br from-[#EEEEEE] to-[#F5F5F5]'
          }`}>
            <Image className={`h-6 w-6 transition-all duration-200 ${isUploading ? 'animate-bounce' : ''} ${
              dragActive ? 'text-white' : 'text-black'
            }`} />
          </div>
          <div className="space-y-1">
            <FadeInText 
              text={isUploading ? "Uploading images..." : "Drop images here or click to browse"} 
              className={`text-sm font-bold text-center transition-colors duration-200 ${
                isUploading ? 'text-[#1ABC9C]' : dragActive ? 'text-[#1ABC9C]' : 'text-slate-800'
              }`} 
            />
            <FadeInText 
              text={isUploading ? "Please wait..." : "Supports JPG, PNG, GIF, and more"} 
              className="text-xs text-slate-600 text-center" 
              delay={0.1} 
            />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Images list */}
      <div className="space-y-1">
        {isLoadingTabContent ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : imageItems.length > 0 ? (
          imageItems.slice(0, 8).map((item: any, index: number) => {
            const isDeletingItem = deletingItemId === item.id

            return (
              <div
                key={item.id}
                className={`group relative p-2 rounded-md transition-all duration-200 cursor-pointer ${
                  'bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-200'
                } ${isDeletingItem ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Image className="h-4 w-4 text-green-500" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate text-gray-900">
                        {item.name || item.title || `Image ${index + 1}`}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        IMAGE • {item.size ? `${(item.size / 1024).toFixed(1)}KB` : 'Unknown size'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {!isDeletingItem && (
                      <ThreeDotsMenu 
                        onDelete={() => onDelete(item.id)}
                      />
                    )}
                    {isDeletingItem && (
                      <div className="h-6 w-6 flex items-center justify-center">
                        <Loader2 className="h-3 w-3 animate-spin text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <Image className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-1">No images uploaded yet</p>
            <p className="text-xs text-gray-400">Upload images for AI analysis</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Transcripts Tab Component
export function TranscriptsTab({ mediaItems, onDelete, isDeleting, deletingItemId, isLoadingTabContent }: any) {
  const transcriptItems = mediaItems.filter((item: any) => item && item.type === 'transcript')

  return (
    <div className="space-y-4">
      {/* Transcripts list */}
      <div className="space-y-1">
        {isLoadingTabContent ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : transcriptItems.length > 0 ? (
          transcriptItems.slice(0, 8).map((item: any, index: number) => {
            const isDeletingItem = deletingItemId === item.id

            return (
              <div
                key={item.id}
                className={`group relative p-2 rounded-md transition-all duration-200 cursor-pointer ${
                  'bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-200'
                } ${isDeletingItem ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Mic className="h-4 w-4 text-purple-500" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate text-gray-900">
                        {item.title || item.name || `Transcript ${index + 1}`}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        TRANSCRIPT • {item.duration || 'Unknown duration'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Add transcript view logic here
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View transcript</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {!isDeletingItem && (
                      <ThreeDotsMenu 
                        onDelete={() => onDelete(item.id)}
                      />
                    )}
                    {isDeletingItem && (
                      <div className="h-6 w-6 flex items-center justify-center">
                        <Loader2 className="h-3 w-3 animate-spin text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <Mic className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-1">No transcripts available</p>
            <p className="text-xs text-gray-400">Transcripts will appear here after processing</p>
          </div>
        )}
      </div>
    </div>
  )
}
