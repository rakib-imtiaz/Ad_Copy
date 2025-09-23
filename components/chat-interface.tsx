"use client"

import * as React from "react"
import {
  Send, User, Download, Copy, RotateCcw, Zap, Star, MessageSquare,
  Pin, Trash2, Edit, CheckCircle, Plus, Bot, Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import ReactMarkdown from 'react-markdown'
import { Conversation, ChatMessage, Agent, MediaItem } from "@/types"

interface ChatInterfaceProps {
  conversation?: Conversation
  availableAgents?: Agent[]
  mediaItems?: MediaItem[]
      onSendMessage?: (content: string, attachedMedia?: string[]) => void
  onRetryMessage?: (originalMessage: string) => void
  onPinMessage?: (messageId: string) => void
  onDeleteMessage?: (messageId: string) => void
  isLoading?: boolean
  // New props for dashboard integration
  messages?: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
    animated?: boolean
    isError?: boolean
    showRetryButton?: boolean
    originalMessage?: string
  }>
  selectedAgent?: string
  // Media selector props
  onOpenMediaSelector?: () => void
  selectedMediaCount?: number
  selectedMediaItems?: Set<string>
  // File upload props
  onUploadFiles?: (files: File[]) => void
  // Chat history props
  currentChatSession?: string | null
  chatHistory?: Array<{
    session_id: string
    title: string
    created_at: string
  }>
}

export function ChatInterface({
  conversation,
  availableAgents = [],
  mediaItems = [],
  onSendMessage,
  onRetryMessage,
  onPinMessage,
  onDeleteMessage,
  isLoading,
  messages,
  selectedAgent,
  onOpenMediaSelector,
  selectedMediaCount = 0,
  selectedMediaItems,
  onUploadFiles,
  currentChatSession,
  chatHistory = []
}: ChatInterfaceProps) {
  const [message, setMessage] = React.useState("")
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const currentAgent = availableAgents.find(agent => agent.id === conversation?.agentId)

  // Get the current chat session title from chat history
  const currentChatTitle = currentChatSession
    ? chatHistory.find(chat => chat.session_id === currentChatSession)?.title
    : null



  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation?.messages, messages])

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }, [message])

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim(), [])
      setMessage("")
      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // Show success feedback - you can replace this with a proper toast system
      console.log('✅ Content copied to clipboard')
      // For now, we'll use a simple visual feedback
      // In a real app, you'd want to show a toast notification here
    } catch (err) {
      console.error('❌ Failed to copy content:', err)
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = content
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        console.log('✅ Content copied to clipboard (fallback)')
      } catch (fallbackErr) {
        console.error('❌ Fallback copy also failed:', fallbackErr)
      }
    }
  }

  const formatTimestamp = (timestamp: Date | string) => {
    // If it's already a string, return it as is
    if (typeof timestamp === 'string') {
      return timestamp
    }
    // If it's a Date object, format it
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp)
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set drag over to false if we're leaving the main container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && onUploadFiles) {
      setIsUploading(true)
      try {
        await onUploadFiles(files)
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <div 
      className={`relative flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 transition-all duration-200 ${
        isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-400' : ''
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >

      {/* Messages Container - Properly Scrolled */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 sm:p-6 pt-20 space-y-4 sm:space-y-6 pb-32">
        {(messages || conversation?.messages || []).map((msg) => {
          // Handle both ChatMessage (with type) and dashboard messages (with role)
          const isUser = 'role' in msg ? msg.role === 'user' : msg.type === 'user'
          return (
          <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
            <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? 'ml-4 sm:ml-16' : 'mr-4 sm:mr-16'}`}>
              <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                {/* Avatar for both user and agent */}
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 shadow-lg ring-2 ring-white">
                  {isUser ? (
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold text-sm flex items-center justify-center">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-black text-white font-semibold text-sm flex items-center justify-center">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  {/* Message bubble with improved styling */}
                  <div className={`relative inline-block max-w-full ${
                    isUser 
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg' 
                      : 'bg-black text-white shadow-md'
                  } rounded-2xl px-4 py-3`} style={isUser ? {'--tw-gradient-to': '#1d4ed8 var(--tw-gradient-to-position)'} as React.CSSProperties : {}}>
                    <div className="break-words overflow-hidden">
                      <div className={`text-sm leading-relaxed ${
                        isUser 
                          ? 'text-white' 
                          : 'text-white'
                      }`}>
                      <ReactMarkdown
                        components={{
                          // Headings
                          h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2 mt-3 first:mt-0">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-semibold text-white mb-2 mt-3 first:mt-0">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold text-white mb-1 mt-2 first:mt-0">{children}</h3>,
                          h4: ({ children }) => <h4 className="text-sm font-medium text-white mb-1 mt-2 first:mt-0">{children}</h4>,
                          
                          // Paragraphs
                          p: ({ children }) => <p className="text-white leading-relaxed mb-2 last:mb-0">{children}</p>,
                          
                          // Lists
                          ul: ({ children }) => <ul className="list-disc list-outside text-white mb-3 space-y-1 pl-4 marker:text-white">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-outside text-white mb-3 space-y-1 pl-4 marker:text-white">{children}</ol>,
                          li: ({ children }) => <li className="text-white leading-relaxed">{children}</li>,
                          
                          // Text formatting
                          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                          em: ({ children }) => <em className="italic text-white">{children}</em>,
                          
                          // Code
                          code: ({ children, className }) => {
                            const isInline = !className
                            if (isInline) {
                              return <code className={`bg-gray-700 text-white px-1 py-0.5 rounded text-xs font-mono ${isUser ? 'bg-blue-500/20' : 'bg-gray-700'}`}>{children}</code>
                            }
                            return <code className={className}>{children}</code>
                          },
                          pre: ({ children }) => <pre className={`p-3 rounded-lg overflow-x-auto mb-3 whitespace-pre-wrap break-words ${isUser ? 'bg-blue-500/20 text-white' : 'bg-gray-700 text-white'}`}>{children}</pre>,
                          
                          // Links
                          a: ({ href, children }) => <a href={href} className="text-blue-300 hover:text-blue-200 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                          
                          // Blockquotes
                          blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-400 pl-3 italic text-gray-200 mb-3">{children}</blockquote>,
                          
                          // Horizontal rule
                          hr: () => <hr className="border-gray-400 my-3" />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      </div>
                    </div>
                    
                    {/* Generated Copy Preview */}
                    {'metadata' in msg && msg.metadata?.generatedCopy && (
                      <div className="mt-4 p-4 bg-gray-800 rounded-xl border border-gray-600">
                        <div className="flex items-center justify-end mb-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyToClipboard(msg.metadata?.generatedCopy?.content || "")}
                            className="h-8 w-8 p-0 hover:bg-gray-700 text-white rounded-lg"
                          >
                            <Copy className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                        <div className="break-words overflow-hidden">
                          <div className="text-sm text-white">
                          <ReactMarkdown
                            components={{
                              // Headings
                              h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2 mt-3 first:mt-0">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-base font-semibold text-white mb-2 mt-3 first:mt-0">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-semibold text-white mb-1 mt-2 first:mt-0">{children}</h3>,
                              h4: ({ children }) => <h4 className="text-sm font-medium text-white mb-1 mt-2 first:mt-0">{children}</h4>,
                              
                              // Paragraphs
                              p: ({ children }) => <p className="text-white leading-relaxed mb-2 last:mb-0">{children}</p>,
                              
                              // Lists
                              ul: ({ children }) => <ul className="list-disc list-outside text-white mb-3 space-y-1 pl-4 marker:text-white">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-outside text-white mb-3 space-y-1 pl-4 marker:text-white">{children}</ol>,
                              li: ({ children }) => <li className="text-white leading-relaxed">{children}</li>,
                              
                              // Text formatting
                              strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                              em: ({ children }) => <em className="italic text-white">{children}</em>,
                              
                              // Code
                              code: ({ children, className }) => {
                                const isInline = !className
                                if (isInline) {
                                  return <code className="bg-gray-600 text-white px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                                }
                                return <code className={className}>{children}</code>
                              },
                              pre: ({ children }) => <pre className="bg-gray-600 text-white p-3 rounded-lg overflow-x-auto mb-3 whitespace-pre-wrap break-words">{children}</pre>,
                              
                              // Links
                              a: ({ href, children }) => <a href={href} className="text-blue-300 hover:text-blue-200 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                              
                              // Blockquotes
                              blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-400 pl-3 italic text-gray-200 mb-3">{children}</blockquote>,
                              
                              // Horizontal rule
                              hr: () => <hr className="border-gray-400 my-3" />,
                            }}
                          >
                            {msg.metadata?.generatedCopy?.content || ""}
                          </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp and Actions */}
                  <div className={`flex items-center mt-2 space-x-2 text-xs text-gray-500 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="font-medium">{formatTimestamp(msg.timestamp)}</span>
                    
                    {/* Message Actions */}
                    {!isUser && (
                      <div className="flex space-x-1 opacity-60 hover:opacity-100 transition-opacity">
                        {/* Retry button for error messages */}
                        {('isError' in msg && msg.isError && 'showRetryButton' in msg && msg.showRetryButton && 'originalMessage' in msg && msg.originalMessage && onRetryMessage) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRetryMessage(('originalMessage' in msg ? msg.originalMessage : '')!)}
                            className="h-6 w-6 p-0 hover:text-green-600 hover:bg-green-50 rounded-md"
                            title="Retry this message"
                          >
                            <RotateCcw className="h-3 w-3 text-black" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPinMessage?.(msg.id)}
                          className="h-6 w-6 p-0 hover:text-amber-600 hover:bg-amber-50 rounded-md"
                          title="Pin message"
                        >
                          <Pin className="h-3 w-3 text-black" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(msg.content)}
                          className="h-6 w-6 p-0 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"
                          title="Copy message"
                        >
                          <Copy className="h-3 w-3 text-black" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )})}
        
        {isLoading && (
          <div className="flex justify-start mb-6">
            <div className="max-w-[85%] sm:max-w-[75%] mr-4 sm:mr-16">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 shadow-lg ring-2 ring-white">
                  <AvatarFallback className="bg-black text-white font-semibold text-sm flex items-center justify-center">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="relative inline-block max-w-full bg-black text-white shadow-md rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-white font-medium">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        </div>
      </div>



      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop files to upload</h3>
            <p className="text-gray-600">Files will be added to your media library</p>
          </div>
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Uploading files...</h3>
            <p className="text-gray-600">Please wait while your files are being uploaded</p>
          </div>
        </div>
      )}


      {/* Input Area - Fixed at Bottom */}
      <div className="flex-shrink-0 p-4 sm:p-6 pb-8 bg-white/95 backdrop-blur-sm border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          {/* ChatGPT-style input bar */}
          <div className="relative">
            <div className="flex items-center bg-white rounded-full px-4 py-3 transition-all duration-200 focus-within:outline-none" style={{ boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 20px 35px -3px rgba(0, 0, 0, 0.5), 0 8px 10px -2px rgba(0, 0, 0, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'}>
              {/* Plus icon on the left */}
              <div className="relative mr-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenMediaSelector}
                  className="rounded-full p-2 hover:bg-gray-100 text-gray-600"
                  title="Add attachment or drag & drop files anywhere in chat"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                {selectedMediaCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {selectedMediaCount}
                  </div>
                )}
              </div>
              
              {/* Textarea field */}
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything or drag & drop files here"
                disabled={!currentAgent && !selectedAgent || isLoading}
                className="flex-1 border-0 border-none bg-transparent text-gray-800 placeholder:text-gray-500 focus:ring-0 focus:outline-none focus:border-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 text-sm resize-none min-h-[24px] max-h-[160px] overflow-y-auto shadow-none rounded-none"
                rows={1}
              />
              
              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={!message.trim() || !currentAgent && !selectedAgent || isLoading}
                className="ml-3 bg-blue-600 hover:bg-blue-700 text-white border-2 border-white rounded-lg px-4 py-2 h-10 flex items-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                <span className="text-sm font-medium">Send</span>
              </Button>
              
            </div>
            
          </div>
          
          {!currentAgent && !selectedAgent && (
            <p className="text-sm text-slate-600 mt-3 text-center">
              Please select an AI agent to start generating ad copy
            </p>
          )}
        </div>
      </div>
    </div>
  )
}