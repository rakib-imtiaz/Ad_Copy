"use client"

import * as React from "react"
import { X, ExternalLink, Calendar, Globe, Edit3, Save, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { authService } from "@/lib/auth-service"
import { API_ENDPOINTS } from "@/lib/api-config"

interface ContentViewerProps {
  isOpen: boolean
  onClose: () => void
  content: {
    title: string
    content: string
    sourceUrl?: string
    scrapedAt?: string
    filename?: string
    isPdf?: boolean
    pdfUrl?: string
    fileType?: string
    resourceId?: string
  }
}

export function ContentViewer({ isOpen, onClose, content }: ContentViewerProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedContent, setEditedContent] = React.useState(content.content)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveMessage, setSaveMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Reset editing state when content changes
  React.useEffect(() => {
    setEditedContent(content.content)
    setIsEditing(false)
    setSaveMessage(null)
  }, [content.content])

  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatContent = (content: string) => {
    // Convert markdown-like content to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-800">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-6 text-gray-900">$1</h1>')
      .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">')
      .replace(/^/g, '<p class="mb-4 leading-relaxed">')
      .replace(/$/g, '</p>')
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedContent(content.content)
    setIsEditing(false)
    setSaveMessage(null)
  }

  const handleSave = async () => {
    if (!content.resourceId) {
      setSaveMessage({ type: 'error', text: 'No resource ID available for editing' })
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        setSaveMessage({ type: 'error', text: 'Authentication required. Please log in again.' })
        return
      }

      const response = await fetch('/api/webhook/update-webpage-content', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resource_id: content.resourceId,
          updated_content: editedContent
        })
      })

      if (response.ok) {
        setSaveMessage({ type: 'success', text: 'Content updated successfully!' })
        setIsEditing(false)
        // Update the content prop by calling a callback if provided
        // For now, we'll just show success message
      } else {
        const errorData = await response.json().catch(() => ({}))
        setSaveMessage({ 
          type: 'error', 
          text: `Failed to update content: ${errorData.error || response.statusText}` 
        })
      }
    } catch (error) {
      console.error('Error updating webpage content:', error)
      setSaveMessage({ type: 'error', text: 'Network error occurred while updating content' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center space-x-4">
            {content.sourceUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(content.sourceUrl, '_blank')}
                className="flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open Source</span>
              </Button>
            )}
            {content.resourceId && !isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Cancel</span>
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {/* Save Message */}
            {saveMessage && (
              <div className={`mb-4 p-3 rounded-lg ${
                saveMessage.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {saveMessage.text}
              </div>
            )}

            {/* Metadata */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
                {content.filename && (
                  <span className="text-sm text-gray-500 font-mono bg-gray-200 px-2 py-1 rounded">
                    {content.filename}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                {content.scrapedAt && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Scraped: {formatDate(content.scrapedAt)}</span>
                  </div>
                )}
                {content.sourceUrl && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span className="truncate max-w-xs">{content.sourceUrl}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Body */}
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edit Content
                  </label>
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-96 text-sm font-mono"
                    placeholder="Enter the updated content..."
                  />
                </div>
              </div>
            ) : content.isPdf && content.pdfUrl ? (
              <div className="w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden">
                <iframe
                  src={content.pdfUrl}
                  className="w-full h-full"
                  title={content.title}
                  style={{ border: 'none' }}
                >
                  <p>
                    Your browser doesn't support PDFs. 
                    <a href={content.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                      Download the PDF
                    </a>
                  </p>
                </iframe>
              </div>
            ) : content.fileType === 'image' ? (
              <div 
                className="text-center"
                dangerouslySetInnerHTML={{ 
                  __html: content.content 
                }}
              />
            ) : (
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(content.content) 
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
