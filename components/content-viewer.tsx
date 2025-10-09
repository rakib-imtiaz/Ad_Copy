"use client"

import * as React from "react"
import { X, ExternalLink, Calendar, Globe, Edit3, Save, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { authService } from "@/lib/auth-service"
import { API_ENDPOINTS } from "@/lib/api-config"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github.css'

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
  onContentUpdate?: (updatedContent: string) => void
}

export function ContentViewer({ isOpen, onClose, content, onContentUpdate }: ContentViewerProps) {
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

  // Custom components for ReactMarkdown
  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-lg font-bold mt-4 mb-3 text-gray-900">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-base font-bold mt-4 mb-2 text-gray-900">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-sm font-semibold mt-3 mb-2 text-gray-800">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-sm font-semibold mt-3 mb-2 text-gray-800">{children}</h4>
    ),
    h5: ({ children }: any) => (
      <h5 className="text-sm font-semibold mt-3 mb-2 text-gray-800">{children}</h5>
    ),
    h6: ({ children }: any) => (
      <h6 className="text-sm font-semibold mt-3 mb-2 text-gray-800">{children}</h6>
    ),
    p: ({ children }: any) => (
      <p className="text-xs leading-relaxed mb-2 text-gray-700">{children}</p>
    ),
    ul: ({ children }: any) => (
      <ul className="text-xs mb-3 ml-4 list-disc">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="text-xs mb-3 ml-4 list-decimal">{children}</ol>
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
      <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-xs font-mono mb-3">{children}</pre>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-3">{children}</blockquote>
    ),
    hr: () => (
      <hr className="border-gray-300 my-4" />
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto mb-3">
        <table className="min-w-full text-xs border-collapse border border-gray-300">{children}</table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold text-left">{children}</th>
    ),
    td: ({ children }: any) => (
      <td className="border border-gray-300 px-2 py-1">{children}</td>
    ),
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
        setIsEditing(false)
        
        // Call the callback to update content locally
        if (onContentUpdate) {
          onContentUpdate(editedContent)
        }
        
        // Close the modal immediately
        onClose()
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
              <div className="max-w-none text-xs">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeSanitize, rehypeRaw]}
                  components={markdownComponents}
                >
                  {content.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
