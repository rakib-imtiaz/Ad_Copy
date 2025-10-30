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
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'
import rehypeRaw from 'rehype-raw'
import { toast } from "sonner"
import { authService } from "@/lib/auth-service"
import { API_ENDPOINTS } from "@/lib/api-config"
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

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
    }
    setIsOpen(false)
  }

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-5 w-5 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="h-2.5 w-2.5" />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-5 z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[100px]">
          <button
            className="w-full px-2 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center space-x-1.5"
            onClick={handleDelete}
          >
            <Trash2 className="h-2.5 w-2.5" />
            <span>Delete</span>
          </button>
        </div>
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
    // Only allow document types in Files tab
    const isFileType = ['pdf', 'doc', 'docx', 'txt'].includes(item.type)
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
    
    const allowedExt = ['pdf', 'doc', 'docx', 'txt']
    const files = Array.from(e.dataTransfer.files)
      .filter(f => {
        const name = f.name.toLowerCase()
        const ext = name.split('.').pop() || ''
        return allowedExt.includes(ext)
      })
    if (files.length === 0) {
      toast.error('Only PDF, DOC/DOCX, and TXT files are allowed')
      return
    }
    if (files.length > 0 && onUpload) {
      setIsUploading(true)
      await onUpload(files)
      setIsUploading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const allowedExt = ['pdf', 'doc', 'docx', 'txt']
    const files = Array.from(e.target.files || [])
      .filter(f => {
        const name = f.name.toLowerCase()
        const ext = name.split('.').pop() || ''
        return allowedExt.includes(ext)
      })
    if ((e.target.files || []).length > 0 && files.length === 0) {
      toast.error('Only PDF, DOC/DOCX, and TXT files are allowed')
      return
    }
    if (files.length > 0 && onUpload) {
      setIsUploading(true)
      await onUpload(files)
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* Search Input */}
      <div className="space-y-1">
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-6 text-xs"
        />
      </div>

      {/* Enhanced Dropzone */}
      <div 
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer ${
          dragActive 
            ? 'border-[#1ABC9C] bg-[#1ABC9C]/10 scale-[1.01] shadow-md' 
            : 'border-gray-200 hover:border-[#1ABC9C] hover:bg-[#1ABC9C]/5 hover:shadow-sm'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center space-y-2">
          <div className={`p-2 rounded-full transition-all duration-200 ${
            dragActive 
              ? 'bg-gradient-to-br from-[#1ABC9C] to-[#16A085] shadow-md' 
              : 'bg-gradient-to-br from-gray-100 to-gray-200'
          }`}>
            <Upload className={`h-4 w-4 transition-all duration-200 ${isUploading ? 'animate-pulse' : ''} ${
              dragActive ? 'text-white' : 'text-gray-700'
            }`} />
          </div>
          <div className="space-y-1">
            <FadeInText 
              text={isUploading ? "Uploading files..." : "Drop files here or click to browse"} 
              className={`text-xs font-medium text-center transition-colors duration-200 ${
                isUploading ? 'text-[#1ABC9C]' : dragActive ? 'text-[#1ABC9C]' : 'text-gray-700'
              }`} 
            />
            <FadeInText 
              text={isUploading ? "Please wait..." : "Supports pdf, doc and text files only"} 
              className="text-xs text-gray-500 text-center" 
              delay={0.1} 
            />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* File count and list */}
      <div className="space-y-1">
        {fileItems.length > 0 && (
          <div className="text-xs text-gray-500 mb-1">
            {fileItems.length} file{fileItems.length !== 1 ? 's' : ''} found
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
        {isLoadingTabContent ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
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
                className={`group relative p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                  'bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-200'
                } ${isDeletingItem ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                    {getFileIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs truncate text-gray-900">
                        {item.filename || item.name || item.title || `File ${index + 1}`}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {item.type?.toUpperCase()} • {item.size ? formatFileSize(item.size) : 'Unknown size'}
                        {item.uploadedAt && (
                          <span className="ml-1">
                            • {new Date(item.uploadedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {!isDeletingItem && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(item.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </Button>
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
          <div className="text-center py-4">
            <div className="w-8 h-8 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            {searchQuery ? (
              <>
                <p className="text-xs text-gray-500 mb-1">No files found</p>
                <p className="text-xs text-gray-400">Try adjusting your search terms</p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-1">No files uploaded yet</p>
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
export function LinksTab({ mediaItems, onDelete, onRefresh, setMediaItems, isDeleting, deletingItemId, isLoadingTabContent, isScraping, setIsScraping }: any) {
  const [urlInput, setUrlInput] = React.useState("")
  const [isLoadingContents, setIsLoadingContents] = React.useState(false)
  
  // Filter to show only webpage/url/scraped type items
  const webpageItems = mediaItems.filter((item: any) => {
    if (!item) return false
    return item.type === 'webpage' || item.type === 'url' || item.type === 'scraped' || item.type === 'link'
  })
  
  const [viewerContent, setViewerContent] = React.useState<{
    title: string
    content: string
    sourceUrl?: string
    scrapedAt?: string
    filename?: string
    resourceId?: string
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
  

  const handleViewContent = (item: any) => {
    // Check if this is scraped content with actual content
    if (item.content) {
      setViewerContent({
        title: item.resourceName || item.filename || 'Scraped Content',
        content: item.content,
        sourceUrl: item.url,
        scrapedAt: item.uploadedAt?.toISOString(),
        filename: item.filename,
        resourceId: item.resourceId
      })
    } else {
      // Fallback for items without content
      setViewerContent({
        title: item.resourceName || item.filename || 'Scraped Content',
        content: 'Content not available...',
        sourceUrl: item.url,
        scrapedAt: item.uploadedAt?.toISOString(),
        filename: item.filename,
        resourceId: item.resourceId
      })
    }
    setIsViewerOpen(true)
  }

  const handleContentUpdate = (updatedContent: string) => {
    // Update the content locally in the media items
    setMediaItems((prevItems: any[]) => {
      return prevItems.map((item: any) => {
        if (item.id === viewerContent?.resourceId || 
            (viewerContent?.resourceId && item.resourceId === viewerContent.resourceId)) {
          return {
            ...item,
            content: updatedContent
          }
        }
        return item
      })
    })
    
    // Refresh the media library to get the latest data from the server
    setTimeout(() => {
      onRefresh()
    }, 2000)
  }

  
  const handleScrapeUrl = async () => {
    
    if (!urlInput.trim()) {
      console.log('❌ URL input is empty, returning early')
      toast.error('Please enter a URL to scrape')
      return
    }
    
    // Basic URL validation
    try {
      new URL(urlInput.trim())
    } catch {
      toast.error('Please enter a valid URL')
      return
    }
    
    try {
      setIsScraping(true)
      console.log('🔍 Getting access token...')
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("❌ No access token available")
        toast.error('Authentication required. Please sign in again.')
        return
      }

      console.log('✅ Access token found:', accessToken ? 'Present' : 'Missing')
      console.log('🔍 Scraping URL:', urlInput)
      
      // Use API route to avoid CORS issues (API route calls the webhook server-side)
      const apiUrl = `/api/webpage-scrape?url=${encodeURIComponent(urlInput.trim())}`
      console.log('🔍 Making request to API route:', apiUrl)
      console.log('🔍 URL parameter:', urlInput.trim())
      console.log('🔍 Access token length:', accessToken.length)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      console.log('📡 Webpage scraping response status:', response.status)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Webpage scraping failed:', response.status, errorData)
        console.error('❌ Response status text:', response.statusText)
        console.error('❌ Response URL:', response.url)
        
        // Handle specific error cases
        if (response.status === 0) {
          console.error('❌ Network error or CORS issue - request blocked')
          toast.error('Network error: Unable to reach the webhook. This might be a CORS issue.')
        } else if (response.status === 404) {
          console.error('❌ Webhook not found')
          toast.error('Webhook endpoint not found. Please check the configuration.')
        } else if (response.status === 401) {
          console.error('❌ Authentication failed')
          toast.error('Authentication failed. Please sign in again.')
        } else {
          // Handle error data properly
          let errorMessage = response.statusText
          if (errorData.error) {
            if (typeof errorData.error === 'string') {
              errorMessage = errorData.error
            } else if (typeof errorData.error === 'object') {
              errorMessage = errorData.error.message || errorData.error.details || JSON.stringify(errorData.error)
            }
          }
          toast.error(`Failed to scrape webpage: ${errorMessage}`)
        }
        return
      }

      const result = await response.json()
      console.log('✅ Webpage scraping result:', result)
      console.log('📊 Result type:', typeof result)
      console.log('📊 Result keys:', Object.keys(result))
      console.log('📊 Result success field:', result.success)
      console.log('📊 Result error field:', result.error)
      
      if (result.success) {
        toast.success('Webpage scraped successfully! Content will be available shortly.')
        setUrlInput("")
        
        // Refresh media items to show the new scraped content
        setTimeout(() => {
          onRefresh()
        }, 2000)
      } else if (result.success === false) {
        // Handle explicit failure response
        let errorMessage = 'Unknown error'
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error
          } else if (typeof result.error === 'object') {
            errorMessage = result.error.message || result.error.details || JSON.stringify(result.error)
          }
        }
        console.error('❌ Scraping failed with result:', result)
        toast.error(`Scraping failed: ${errorMessage}`)
      } else {
        // Handle empty or unexpected response format
        console.error('❌ Unexpected response format:', result)
        console.error('❌ Response was empty object or missing success field')
        
        // Check if the response might be successful despite missing success field
        if (Object.keys(result).length === 0) {
          toast.error('Scraping failed: Empty response from server. Please try again.')
        } else {
          // Try to extract any meaningful information from the response
          const responseText = JSON.stringify(result)
          toast.error(`Scraping failed: Unexpected response format. Response: ${responseText}`)
        }
      }
    } catch (error) {
      console.error('❌ Error scraping webpage:', error)
      console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error')
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      
      // Provide more specific error messages based on the error type
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('❌ Network fetch error - likely CORS or connectivity issue')
        toast.error('Unable to connect to scraping service. This might be a CORS issue. Please check your internet connection and try again.')
      } else if (error instanceof Error && error.name === 'TimeoutError') {
        console.error('❌ Request timeout')
        toast.error('Scraping request timed out. The service may be busy. Please try again.')
      } else if (error instanceof Error && error.name === 'AbortError') {
        console.error('❌ Request aborted')
        toast.error('Request was aborted. Please try again.')
      } else if (error instanceof Error) {
        console.error('❌ General error:', error.message)
        toast.error(`Scraping error: ${error.message}`)
      } else {
        console.error('❌ Unknown error type')
        toast.error('Network error occurred while scraping')
      }
    } finally {
      setIsScraping(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* URL Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleScrapeUrl(); }} className="space-y-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Add Web Link</label>
          <div className="flex space-x-1">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 h-6 text-xs"
              disabled={isScraping}
            />
            <Button 
              type="submit" 
              disabled={!urlInput.trim() || isScraping}
              className="bg-[#1ABC9C] hover:bg-[#16A085] text-white h-6 px-2"
            >
              {isScraping ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        {/* Loading indicator for scraping */}
        {isScraping && (
          <div className="flex items-center space-x-2 text-xs text-gray-600 bg-blue-50 p-2 rounded border">
            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
            <span>Scraping webpage content...</span>
          </div>
        )}
      </form>

      {/* Links count and list */}
      <div className="space-y-1">
        {webpageItems.length > 0 && (
          <div className="text-xs text-gray-500 mb-1">
            {webpageItems.length} link{webpageItems.length !== 1 ? 's' : ''} found
          </div>
        )}
        {isLoadingTabContent ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : webpageItems.length > 0 ? (
          webpageItems.slice(0, 8).map((item: any, index: number) => {
            const isDeletingItem = deletingItemId === item.id

            return (
              <div
                key={item.id}
                className={`group relative p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                  'bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-200'
                } ${isDeletingItem ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                    <Link2 className="h-3.5 w-3.5 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs truncate text-gray-900">
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
                            className="h-5 w-5 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewContent(item)
                            }}
                          >
                            <Eye className="h-2.5 w-2.5" />
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
                            className="h-5 w-5 p-0 text-gray-500 hover:text-green-600 hover:bg-green-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(item.url || item.link, '_blank')
                            }}
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open link</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {!isDeletingItem && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDelete(item.id, item.resourceName || item.filename || item.title)
                              }}
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete link</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
          <div className="text-center py-4">
            <div className="w-8 h-8 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
              <Link2 className="h-4 w-4 text-gray-400" />
            </div>
            <>
              <p className="text-xs text-gray-500 mb-1">No links added yet</p>
              <p className="text-xs text-gray-400">Add web links to scrape content</p>
            </>
          </div>
        )}
      </div>
      
      
      {/* Content Viewer */}
      {viewerContent && (
        <ContentViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          content={viewerContent}
          onContentUpdate={handleContentUpdate}
        />
      )}
    </div>
  )
}

// YouTube Tab Component
export function YouTubeTab({ mediaItems, onDelete, onRefresh, setMediaItems, isDeleting, deletingItemId, isLoadingTabContent, isScraping, setIsScraping }: any) {
  const [urlInput, setUrlInput] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const [viewerContent, setViewerContent] = React.useState<{
    title: string
    content: string
    sourceUrl?: string
    scrapedAt?: string
    filename?: string
    resourceId?: string
  } | null>(null)
  
  const [isViewerOpen, setIsViewerOpen] = React.useState(false)
  
  const handleViewContent = (item: any) => {
    // Check if this is YouTube content with actual content
    if (item.content || item.transcript) {
      setViewerContent({
        title: item.title || item.name || 'YouTube Transcript',
        content: item.content || item.transcript || 'Content not available...',
        sourceUrl: item.url,
        scrapedAt: item.uploadedAt?.toISOString(),
        filename: item.filename,
        resourceId: item.resourceId || item.id
      })
    } else {
      // Fallback for items without content
      setViewerContent({
        title: item.title || item.name || 'YouTube Transcript',
        content: 'Transcript not available yet...',
        sourceUrl: item.url,
        scrapedAt: item.uploadedAt?.toISOString(),
        filename: item.filename,
        resourceId: item.resourceId || item.id
      })
    }
    setIsViewerOpen(true)
  }
  
  const youtubeItems = mediaItems.filter((item: any) => {
    if (!item) return false
    const isYouTubeType = item.type === 'youtube' || item.type === 'video'
    const matchesSearch = !searchQuery || 
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.filename && item.filename.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.url && item.url.toLowerCase().includes(searchQuery.toLowerCase()))
    return isYouTubeType && matchesSearch
  })

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim() || isScraping) return

    setIsScraping(true)
    try {
      console.log('🎥 Submitting YouTube URL for transcription:', urlInput)
      
      // Basic URL validation
      try {
        new URL(urlInput.trim())
      } catch {
        toast.error('Please enter a valid YouTube URL')
        return
      }

      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("❌ No access token available")
        toast.error('Authentication required. Please sign in again.')
        return
      }

      console.log('✅ Access token found, making API request...')
      
      const apiUrl = `/api/youtube-transcribe?url=${encodeURIComponent(urlInput.trim())}`
      console.log('🔍 Making request to:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      console.log('📡 YouTube transcription response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ YouTube transcription failed:', response.status, errorData)
        toast.error(`Transcription failed: ${errorData.error?.message || response.statusText}`)
        return
      }

      const result = await response.json()
      console.log('✅ YouTube transcription result:', result)
      
      if (result.success) {
        toast.success('YouTube transcript scraped successfully! Content will be available shortly.')
        setUrlInput("")
        
        // Refresh media items to show the new transcript
        setTimeout(() => {
          onRefresh()
        }, 2000)
      } else {
        toast.error(`Transcription failed: ${result.error?.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Error submitting YouTube URL:', error)
      
      // Provide more specific error messages based on the error type
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error('Unable to connect to transcription service. Please check your internet connection and try again.')
      } else if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('Transcription request timed out. The service may be busy. Please try again.')
      } else if (error instanceof Error) {
        toast.error(`Transcription error: ${error.message}`)
      } else {
        toast.error('Network error occurred while transcribing video')
      }
    } finally {
      setIsScraping(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* YouTube URL Input Form */}
      <form onSubmit={handleSubmitUrl} className="space-y-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Scrape youtube transcript</label>
          <div className="flex space-x-1">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 h-6 text-xs"
              disabled={isScraping}
            />
            <Button 
              type="submit" 
              disabled={!urlInput.trim() || isScraping}
              className="bg-red-600 hover:bg-red-700 text-white h-6 px-2"
            >
              {isScraping ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mic className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        {/* Loading indicator for transcription */}
        {isScraping && (
          <div className="flex items-center space-x-2 text-xs text-gray-600 bg-red-50 p-2 rounded border">
            <Loader2 className="h-3 w-3 animate-spin text-red-500" />
            <span>Transcribing YouTube video...</span>
          </div>
        )}
      </form>

      {/* YouTube videos count and list */}
      <div className="space-y-1">
        {youtubeItems.length > 0 && (
          <div className="text-xs text-gray-500 mb-1">
            {youtubeItems.length} video{youtubeItems.length !== 1 ? 's' : ''} found
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
        {isLoadingTabContent ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
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
                            className="h-5 w-5 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewContent(item)
                            }}
                          >
                            <Eye className="h-2.5 w-2.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View transcript</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(item.url || item.link, '_blank')
                            }}
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open video</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {!isDeletingItem && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDelete(item.id, item.title || item.name)
                              }}
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete video</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
          <div className="text-center py-4">
            <div className="w-8 h-8 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
              <Mic className="h-4 w-4 text-gray-400" />
            </div>
            {searchQuery ? (
              <>
                <p className="text-xs text-gray-500 mb-1">No videos found</p>
                <p className="text-xs text-gray-400">Try adjusting your search terms</p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-1">No YouTube videos yet</p>
                <p className="text-xs text-gray-400">Add YouTube videos to transcribe</p>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Content Viewer */}
      {viewerContent && (
        <ContentViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          content={viewerContent}
          onContentUpdate={() => {}} // YouTube transcripts are read-only
        />
      )}
    </div>
  )
}

// Compact Markdown Renderer for Image Analysis
function CompactMarkdownRenderer({ content }: { content: string }) {
  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-sm font-bold mt-3 mb-2 text-gray-900">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xs font-bold mt-3 mb-2 text-gray-900">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xs font-semibold mt-2 mb-1 text-gray-800">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-xs font-semibold mt-2 mb-1 text-gray-800">{children}</h4>
    ),
    h5: ({ children }: any) => (
      <h5 className="text-xs font-semibold mt-2 mb-1 text-gray-800">{children}</h5>
    ),
    h6: ({ children }: any) => (
      <h6 className="text-xs font-semibold mt-2 mb-1 text-gray-800">{children}</h6>
    ),
    p: ({ children }: any) => (
      <p className="text-xs leading-relaxed mb-2 text-gray-700">{children}</p>
    ),
    ul: ({ children }: any) => (
      <ul className="text-xs mb-2 ml-3 list-disc">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="text-xs mb-2 ml-3 list-decimal">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="text-xs mb-1">{children}</li>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-gray-800">{children}</em>
    ),
    code: ({ children }: any) => (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800">{children}</code>
    ),
    pre: ({ children }: any) => (
      <pre className="bg-gray-100 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">{children}</pre>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-2 border-gray-300 pl-3 italic text-gray-600 mb-2">{children}</blockquote>
    ),
    hr: () => (
      <hr className="border-gray-300 my-2" />
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto mb-2">
        <table className="min-w-full text-xs border-collapse border border-gray-300">{children}</table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="border border-gray-300 px-1 py-1 bg-gray-100 font-semibold text-left">{children}</th>
    ),
    td: ({ children }: any) => (
      <td className="border border-gray-300 px-1 py-1">{children}</td>
    ),
  }

  return (
    <div className="max-w-none text-xs">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSanitize, rehypeRaw]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

// Image Analyzer Tab Component
export function ImageAnalyzerTab({ mediaItems, onUpload, onDelete, isDeleting, deletingItemId, isLoadingTabContent, setMediaItems }: any) {
  const [dragActive, setDragActive] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [analyzingImageId, setAnalyzingImageId] = React.useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = React.useState<{[key: string]: any}>({})
  const [selectedImageAnalysis, setSelectedImageAnalysis] = React.useState<any>(null)
  const [showAnalysisPopup, setShowAnalysisPopup] = React.useState<any>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const imageItems = React.useMemo(() => {
    return mediaItems.filter((item: any) => {
      if (!item) return false
      const isImageType = item.type === 'image' || 
        (item.type && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(item.type.toLowerCase()))
      const matchesSearch = !searchQuery || 
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.filename && item.filename.toLowerCase().includes(searchQuery.toLowerCase()))
      return isImageType && matchesSearch
    })
  }, [mediaItems, searchQuery])

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

  // Check for existing analysis content when component mounts
  React.useEffect(() => {
    const existingResults: {[key: string]: any} = {}
    imageItems.forEach((item: any) => {
      if (item.content && item.content.trim()) {
        existingResults[item.id] = {
          id: item.id,
          analysis: item.content,
          timestamp: new Date().toISOString(),
          status: 'completed'
        }
      }
    })
    if (Object.keys(existingResults).length > 0) {
      setAnalysisResults(existingResults)
    }
  }, [mediaItems])

  const handleAnalyzeImage = async (imageId: string, imageItem: any) => {
    setIsAnalyzing(true)
    setAnalyzingImageId(imageId)
    
    try {
      const token = authService.getAuthToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      console.log('🔍 Analyzing image:', imageId)
      
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          media_id: imageId
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Image analysis result:', result)
      
      // Extract the data from the API response
      const analysisData = result.data || result
      
      // Process the real analysis result from the webhook
      let analysisText = ''
      if (Array.isArray(analysisData) && analysisData.length > 0) {
        analysisText = analysisData[0]?.text || analysisData[0] || ''
      } else if (typeof analysisData === 'string') {
        analysisText = analysisData
      } else if (analysisData?.text) {
        analysisText = analysisData.text
      } else {
        analysisText = ''
      }

      const analysisResult = {
        id: imageId,
        analysis: analysisText,
        timestamp: new Date().toISOString(),
        status: 'completed'
      }

      setAnalysisResults(prev => ({
        ...prev,
        [imageId]: analysisResult
      }))

      // Update the media items to include the analysis content
      if (setMediaItems) {
        setMediaItems((prevItems: any[]) => {
          return prevItems.map((item: any) => {
            if (item.id === imageId) {
              return {
                ...item,
                content: analysisText,
                analyzedAt: new Date().toISOString(),
                analysisStatus: 'completed'
              }
            }
            return item
          })
        })
      }

      toast.success('Image analysis completed successfully!')

    } catch (error: any) {
      console.error('❌ Error analyzing image:', error)
      toast.error(`Analysis failed: ${error.message}`)
    } finally {
      setIsAnalyzing(false)
      setAnalyzingImageId(null)
    }
  }

  const handleViewImage = (item: any) => {
    if (item.url) {
      window.open(item.url, '_blank')
    } else if (item.content) {
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${item.filename || 'Image Content'}</title></head>
            <body style="font-family: monospace; padding: 20px; white-space: pre-wrap;">
              ${item.content}
            </body>
          </html>
        `)
      }
    }
  }

  const handleDownloadImage = (item: any) => {
    if (item.url) {
      window.open(item.url, '_blank')
    } else {
      // Create a download link for the content
      const blob = new Blob([item.content || ''], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = item.filename || 'image-content.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="space-y-2">
      {/* Search Input */}
      <div className="space-y-1">
        <Input
          placeholder="Search images..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-6 text-xs"
        />
      </div>

      {/* Image Dropzone */}
      <div 
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer ${
          dragActive 
            ? 'border-[#1ABC9C] bg-[#1ABC9C]/10 scale-[1.01] shadow-md' 
            : 'border-gray-200 hover:border-[#1ABC9C] hover:bg-[#1ABC9C]/5 hover:shadow-sm'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center space-y-2">
          <div className={`p-2 rounded-full transition-all duration-200 ${
            dragActive 
              ? 'bg-gradient-to-br from-[#1ABC9C] to-[#16A085] shadow-md' 
              : 'bg-gradient-to-br from-gray-100 to-gray-200'
          }`}>
            <Image className={`h-4 w-4 transition-all duration-200 ${isUploading ? 'animate-pulse' : ''} ${
              dragActive ? 'text-white' : 'text-gray-700'
            }`} />
          </div>
          <div className="space-y-1">
            <FadeInText 
              text={isUploading ? "Uploading images..." : "Drop images here or click to browse"} 
              className={`text-xs font-medium text-center transition-colors duration-200 ${
                isUploading ? 'text-[#1ABC9C]' : dragActive ? 'text-[#1ABC9C]' : 'text-gray-700'
              }`} 
            />
            <FadeInText 
              text={isUploading ? "Please wait..." : "Supports JPG, PNG, GIF, and more"} 
              className="text-xs text-gray-500 text-center" 
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

      {/* Images count and list */}
      <div className="space-y-1">
        {imageItems.length > 0 && (
          <div className="text-xs text-gray-500 mb-1">
            {imageItems.length} image{imageItems.length !== 1 ? 's' : ''} found
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
        {isLoadingTabContent ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : imageItems.length > 0 ? (
          imageItems.slice(0, 8).map((item: any, index: number) => {
            const isDeletingItem = deletingItemId === item.id

            // Check if image has been analyzed - use simple backup approach
            const hasAnalysis = analysisResults[item.id] || (item.content && item.content.trim())
            const isAnalyzed = hasAnalysis && (analysisResults[item.id]?.status === 'completed' || item.content)

            return (
              <div
                key={item.id}
                className={`group relative p-1.5 rounded-md transition-all duration-200 ${
                  'bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-200'
                } ${isDeletingItem ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-start gap-1.5">
                  {/* Image Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
                      <Image className="h-2.5 w-2.5 text-gray-500" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs text-gray-900 truncate">
                      {item.name || item.title || item.filename || `Image ${index + 1}`}
                    </h4>
                    
                    {/* Analysis Status */}
                    {isAnalyzed ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-700">Analyzed</span>
                      </div>
                    ) : (
                      <div className="mt-0.5">
                        <span className="text-xs text-gray-500">Click buttons to view/analyze</span>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    {!isAnalyzed && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-5 px-1.5 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleAnalyzeImage(item.id, item)}
                          disabled={isAnalyzing && analyzingImageId === item.id}
                        >
                          {isAnalyzing && analyzingImageId === item.id ? (
                            <Loader2 className="h-2.5 w-2.5 animate-spin" />
                          ) : (
                            <span className="text-blue-600">Analyze</span>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {isAnalyzed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => setShowAnalysisPopup({ 
                          id: item.id, 
                          filename: item.filename || item.name || 'Unknown Image',
                          analysis: item.content || analysisResults[item.id]?.analysis || '' 
                        })}
                        title="View Analysis"
                      >
                        <Eye className="h-2.5 w-2.5" />
                      </Button>
                    )}
                    {!isDeletingItem ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(item.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    ) : (
                      <div className="h-5 w-5 flex items-center justify-center">
                        <Loader2 className="h-2.5 w-2.5 animate-spin text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-4">
            <div className="w-8 h-8 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
              <Image className="h-4 w-4 text-gray-400" />
            </div>
            {searchQuery ? (
              <>
                <p className="text-xs text-gray-500 mb-1">No images found</p>
                <p className="text-xs text-gray-400">Try adjusting your search terms</p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-1">No images uploaded yet</p>
                <p className="text-xs text-gray-400">Upload images for AI analysis</p>
              </>
            )}
          </div>
        )}
      </div>



      {/* Analysis Popup */}
      {showAnalysisPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Image Analysis - {showAnalysisPopup.filename || 'Unknown Image'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnalysisPopup(null)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh] bg-white">
              <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                {(() => {
                  let content = showAnalysisPopup.analysis || ''
                  // Remove the "Use this information as resources:" prefix
                  content = content.replace(/^Use this information as resources:\s*/, '')
                  // Remove square brackets if they wrap the entire content (multiline)
                  if (content.startsWith('[') && content.endsWith(']')) {
                    content = content.slice(1, -1)
                  }
                  return content
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

