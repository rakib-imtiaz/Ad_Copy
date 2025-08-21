"use client"

import { useState, useEffect } from "react"
import { MediaLibrary } from "@/components/media-library"
import { MediaItem } from "@/types"
import { authService } from "@/lib/auth-service"

export default function MediaLibraryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchMediaLibrary = async () => {
    try {
      setIsLoading(true)
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("No access token available")
        setMediaItems([])
        return
      }

      const response = await fetch('/api/mock/media/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized - token may be expired")
          setMediaItems([])
          return
        }
        throw new Error('Failed to fetch media library')
      }

      const data = await response.json()
      console.log('Media library API response:', data)
      
      // Transform the API response to match our MediaItem interface
      const transformedItems: MediaItem[] = data.map((item: any) => {
        return {
          id: item.media_id.toString(),
          userId: 'current_user', // You might want to get this from auth context
          filename: item.file_name,
          type: getFileType(item.file_type || item.file_name),
          size: parseFloat(item.media_size) * 1024 * 1024, // Convert MB to bytes
          uploadedAt: new Date(),
          tags: [], // You might want to get this from the API
          metadata: {
            storageStatus: item.storage_status
          }
        }
      })

      console.log('Transformed media items:', transformedItems)
      setMediaItems(transformedItems)
    } catch (error) {
      console.error('Error fetching media library:', error)
      setMediaItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const getFileType = (fileType: string | null): MediaItem['type'] => {
    if (!fileType) return 'doc'
    
    if (fileType === 'image') return 'image'
    if (fileType.startsWith('image/')) return 'image'
    if (fileType.startsWith('video/')) return 'video'
    if (fileType.startsWith('audio/')) return 'audio'
    if (fileType.includes('pdf')) return 'pdf'
    if (fileType.includes('doc')) return 'doc'
    if (fileType.includes('txt')) return 'txt'
    
    return 'doc'
  }

  const handleUpload = async (files: File[]) => {
    console.log("Uploading files:", files)
    // In a real app, you would upload to your backend here
  }

  const handleTranscribe = async (mediaId: string) => {
    console.log("Transcribing media:", mediaId)
    // In a real app, you would trigger transcription here
  }

  const handleScrapeUrl = async (url: string) => {
    console.log("Scraping URL:", url)
    // In a real app, you would scrape the URL here
  }

  const handleDelete = async (mediaId: string) => {
    console.log("Deleting media:", mediaId)
    // In a real app, you would delete from your backend here
  }

  // Delete media file via n8n webhook
  const deleteMediaFile = async (mediaId: string, filename: string) => {
    try {
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("No access token available")
        return
      }

      console.log('Deleting file:', filename, 'with media ID:', mediaId)
      console.log('Request URL:', 'https://n8n.srv934833.hstgr.cloud/webhook/delete-media-file')
      console.log('Request headers:', {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      })
      console.log('Request body:', {
        access_token: accessToken,
        file_name: filename
      })

      const response = await fetch('https://n8n.srv934833.hstgr.cloud/webhook/delete-media-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          file_name: filename
        }),
      })

      if (!response.ok) {
        console.error('Delete failed for file:', filename, 'Status:', response.status)
        console.error('Response headers:', response.headers)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error details:', errorData)
        console.error('Request body sent:', {
          access_token: accessToken,
          file_name: filename
        })
        return false
      }

      const data = await response.json()
      console.log('Delete successful for file:', filename, data)
      
      // Remove the file from the local state
      setMediaItems(prev => prev.filter(item => item.id !== mediaId))
      
      return true
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }

  const handleRefresh = async () => {
    await fetchMediaLibrary()
  }

  // Fetch media library on component mount
  useEffect(() => {
    fetchMediaLibrary()
  }, [])

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <div className="p-6">
        <MediaLibrary 
          mediaItems={mediaItems}
          onUpload={handleUpload}
          onTranscribe={handleTranscribe}
          onScrapeUrl={handleScrapeUrl}
          onDelete={deleteMediaFile}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}