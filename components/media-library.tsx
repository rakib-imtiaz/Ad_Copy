"use client"

import * as React from "react"
import { 
  Upload, FileText, Video, Headphones, Link, Tag, Search, 
  Filter, Download, Trash2, Play, Pause, ExternalLink,
  Plus, Mic, Globe, File, Image, Clock, User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { MediaItem } from "@/types"

interface MediaLibraryProps {
  mediaItems?: MediaItem[]
  onUpload?: (files: File[]) => void
  onTranscribe?: (mediaId: string) => void
  onScrapeUrl?: (url: string) => void
  onDelete?: (mediaId: string) => void
  isLoading?: boolean
}

export function MediaLibrary({ 
  mediaItems = [], 
  onUpload, 
  onTranscribe, 
  onScrapeUrl, 
  onDelete, 
  isLoading 
}: MediaLibraryProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedType, setSelectedType] = React.useState<string>("all")
  const [dragActive, setDragActive] = React.useState(false)
  const [urlInput, setUrlInput] = React.useState("")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Filter media items based on search and type
  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedType === "all" || item.type === selectedType
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => item.tags.includes(tag))
    return matchesSearch && matchesType && matchesTags
  })

  // Get unique tags from all media items
  const allTags = React.useMemo(() => {
    const tags = new Set<string>()
    mediaItems.forEach(item => item.tags.forEach(tag => tags.add(tag)))
    return Array.from(tags).sort()
  }, [mediaItems])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && onUpload) {
      onUpload(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0 && onUpload) {
      onUpload(files)
    }
  }

  const handleScrapeUrl = () => {
    if (urlInput.trim() && onScrapeUrl) {
      onScrapeUrl(urlInput.trim())
      setUrlInput("")
    }
  }

  const getMediaIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'pdf':
      case 'doc':
      case 'txt':
        return FileText
      case 'audio':
        return Headphones
      case 'video':
        return Video
      case 'url':
        return Link
      case 'transcript':
        return Mic
      default:
        return File
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Media Library</h2>
          <p className="text-muted-foreground">
            Central repository for files, links, and transcripts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{mediaItems.length} items</Badge>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Add Media</CardTitle>
          <CardDescription>
            Upload files, transcribe audio/video, or scrape web content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-[#1ABC9C] bg-[#1ABC9C]/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-gray-800 rounded-full">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium">Drop files here or click to upload</p>
                <p className="text-sm text-gray-400">
                  Supports PDF, DOC, TXT, MP3, MP4, and more
                </p>
              </div>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Choose Files</span>
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.mp3,.mp4,.wav,.m4a"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <Separator />

          {/* URL Scraping */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Web Content Scraping
            </label>
            <div className="flex space-x-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter URL to scrape (e.g., blog post, article)"
                className="flex-1 bg-gray-800 border-gray-700 text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
              />
              <Button 
                onClick={handleScrapeUrl}
                disabled={!urlInput.trim() || isLoading}
                className="flex items-center space-x-2"
              >
                <Globe className="h-4 w-4" />
                <span>Scrape</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by filename or tags..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="min-w-[150px]">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
              >
                <option value="all">All Types</option>
                <option value="pdf">PDF</option>
                <option value="doc">Documents</option>
                <option value="txt">Text</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="url">Web Links</option>
                <option value="transcript">Transcripts</option>
              </select>
            </div>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-300 mb-2">Filter by tags:</p>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 10).map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      )
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
                {allTags.length > 10 && (
                  <Badge variant="outline">+{allTags.length - 10} more</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const IconComponent = getMediaIcon(item.type)
          return (
            <Card key={item.id} className="bg-gray-900 border-gray-800 hover:bg-gray-800/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <IconComponent className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.filename}</h4>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(item.size)} • {new Date(item.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(item.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Transcript Status */}
                {(item.type === 'audio' || item.type === 'video') && (
                  <div className="mb-3">
                    {item.transcript ? (
                      <div className="flex items-center space-x-2 text-green-400">
                        <Mic className="h-3 w-3" />
                        <span className="text-xs">Transcribed</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTranscribe?.(item.id)}
                        className="flex items-center space-x-2 text-xs"
                      >
                        <Mic className="h-3 w-3" />
                        <span>Transcribe</span>
                      </Button>
                    )}
                  </div>
                )}

                {/* URL Link */}
                {item.type === 'url' && item.url && (
                  <div className="mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(item.url, '_blank')}
                      className="flex items-center space-x-2 text-xs"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Open Link</span>
                    </Button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Use in Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-800 rounded-full">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery || selectedType !== "all" || selectedTags.length > 0 
                    ? "No matching media found" 
                    : "No media uploaded yet"
                  }
                </h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery || selectedType !== "all" || selectedTags.length > 0
                    ? "Try adjusting your search criteria or filters"
                    : "Upload files, transcribe media, or scrape web content to get started"
                  }
                </p>
                {!searchQuery && selectedType === "all" && selectedTags.length === 0 && (
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Upload Your First File
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}