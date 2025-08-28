"use client"

import * as React from "react"
import { X, ExternalLink, Calendar, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ContentViewerProps {
  isOpen: boolean
  onClose: () => void
  content: {
    title: string
    content: string
    sourceUrl?: string
    scrapedAt?: string
    filename?: string
  }
}

export function ContentViewer({ isOpen, onClose, content }: ContentViewerProps) {
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
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: formatContent(content.content) 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
