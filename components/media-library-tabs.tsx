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
  Video
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

// Files Tab Component
export function FilesTab({ mediaItems, onUpload, onDelete, isDeleting, deletingItemId, isLoadingTabContent }: any) {
  const [dragActive, setDragActive] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const fileItems = mediaItems.filter((item: any) => 
    ['pdf', 'doc', 'txt', 'audio', 'video'].includes(item.type)
  )

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

      {/* File list */}
      <div className="space-y-1">
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
                case 'image':
                  return <Image className="h-4 w-4 text-green-500" />
                case 'audio':
                  return <Mic className="h-4 w-4 text-blue-500" />
                case 'video':
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
                        {item.name || item.title || `File ${index + 1}`}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {item.type?.toUpperCase()} • {item.size ? `${(item.size / 1024).toFixed(1)}KB` : 'Unknown size'}
                      </p>
                    </div>
                  </div>
                  {!isDeletingItem && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-gray-200">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-900">Delete File</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600">
                            Are you sure you want to delete this file? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-900">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
            <p className="text-sm text-gray-500 mb-1">No files uploaded yet</p>
            <p className="text-xs text-gray-400">Upload your first file to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Links Tab Component
export function LinksTab({ mediaItems, onDelete, onRefresh, setMediaItems, isDeleting, deletingItemId, isLoadingTabContent }: any) {
  const [urlInput, setUrlInput] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const linkItems = mediaItems.filter((item: any) => item.type === 'link')

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Simulate URL submission - replace with actual API call
      console.log('Submitting URL:', urlInput)
      // Add your URL submission logic here
      setUrlInput("")
    } catch (error) {
      console.error('Error submitting URL:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* URL Input Form */}
      <form onSubmit={handleSubmitUrl} className="space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Add Web Link</label>
          <div className="flex space-x-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com"
              className="flex-1"
              disabled={isSubmitting}
            />
            <Button 
              type="submit" 
              disabled={!urlInput.trim() || isSubmitting}
              className="bg-[#1ABC9C] hover:bg-[#16A085] text-white"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
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
        ) : linkItems.length > 0 ? (
          linkItems.slice(0, 8).map((item: any, index: number) => {
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-gray-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-900">Delete Link</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              Are you sure you want to delete this link? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-900">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(item.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
    </div>
  )
}

// YouTube Tab Component
export function YouTubeTab({ mediaItems, onDelete, onRefresh, setMediaItems, isDeleting, deletingItemId, isLoadingTabContent }: any) {
  const [urlInput, setUrlInput] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const youtubeItems = mediaItems.filter((item: any) => item.type === 'youtube')

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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-gray-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-900">Delete Video</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              Are you sure you want to delete this video transcription? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-900">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(item.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
  
  const imageItems = mediaItems.filter((item: any) => item.type === 'image')

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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-500 hover:text-green-600 hover:bg-green-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Add image preview logic here
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Preview image</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {!isDeletingItem && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-gray-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-900">Delete Image</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              Are you sure you want to delete this image? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-900">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(item.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
  const transcriptItems = mediaItems.filter((item: any) => item.type === 'transcript')

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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-gray-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-900">Delete Transcript</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              Are you sure you want to delete this transcript? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-900">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(item.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
