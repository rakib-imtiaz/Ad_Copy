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
import { useKnowledgeBaseSafety } from "@/hooks/use-knowledge-base-safety"
import { KnowledgeBaseWarningModal } from "@/components/ui/knowledge-base-warning-modal"

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
  const [showKnowledgeBaseWarning, setShowKnowledgeBaseWarning] = React.useState(false)

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Knowledge base safety check
  const { 
    isKnowledgeBaseEmpty, 
    isValidating, 
    error: kbError, 
    canStartChat, 
    refreshValidation 
  } = useKnowledgeBaseSafety()

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
    // Check knowledge base safety before allowing send
    if (isKnowledgeBaseEmpty && !showKnowledgeBaseWarning) {
      setShowKnowledgeBaseWarning(true)
      return
    }

    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim(), [])
      setMessage("")
      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleUploadContent = () => {
    setShowKnowledgeBaseWarning(false)
    // You can navigate to knowledge base upload page or trigger upload modal
    // For now, we'll just close the modal - navigation logic can be added later
    window.location.href = '/admin/branding' // Adjust URL as needed
  }

  const handleRetryValidation = () => {
    refreshValidation()
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
        <div className="p-2 sm:p-3 pt-12 space-y-2 sm:space-y-3 pb-16">
        {(messages || conversation?.messages || []).map((msg) => {
          // Handle both ChatMessage (with type) and dashboard messages (with role)
          const isUser = 'role' in msg ? msg.role === 'user' : msg.type === 'user'
          return (
          <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`max-w-[90%] sm:max-w-[80%] ${isUser ? 'ml-2 sm:ml-8' : 'mr-2 sm:mr-8'}`}>
              <div className={`flex items-start gap-1.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                {/* Avatar for agent only - removed for user */}
                {!isUser && (
                  <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 shadow-lg ring-2 ring-black">
                    <AvatarFallback className="bg-black text-white font-semibold text-xs flex items-center justify-center">
                      <Bot className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className="flex-1 min-w-0">
                  {/* Message bubble with improved styling */}
                  <div className={`relative inline-block max-w-full ${
                    isUser
                      ? 'bg-white text-black shadow-lg border border-gray-300'
                      : 'bg-black text-white shadow-md'
                  } rounded-lg px-2 py-1`}>
                    <div className="break-words overflow-hidden">
                      <div className={`text-sm leading-relaxed ${
                        isUser 
                          ? 'text-black' 
                          : 'text-white'
                      }`}>
                      <ReactMarkdown
                        components={{
                          // Headings
                          h1: ({ children }) => <h1 className={`text-base font-bold mb-1 mt-2 first:mt-0 ${isUser ? 'text-black' : 'text-white'}`}>{children}</h1>,
                          h2: ({ children }) => <h2 className={`text-sm font-semibold mb-1 mt-2 first:mt-0 ${isUser ? 'text-black' : 'text-white'}`}>{children}</h2>,
                          h3: ({ children }) => <h3 className={`text-sm font-semibold mb-1 mt-1 first:mt-0 ${isUser ? 'text-black' : 'text-white'}`}>{children}</h3>,
                          h4: ({ children }) => <h4 className={`text-sm font-medium mb-1 mt-1 first:mt-0 ${isUser ? 'text-black' : 'text-white'}`}>{children}</h4>,
                          
                          // Paragraphs
                          p: ({ children }) => <p className={`leading-relaxed mb-1 last:mb-0 text-sm ${isUser ? 'text-black' : 'text-white'}`}>{children}</p>,
                          
                          // Lists
                          ul: ({ children }) => <ul className={`list-disc list-outside mb-2 space-y-0.5 pl-3 text-sm ${isUser ? 'text-black marker:text-black' : 'text-white marker:text-white'}`}>{children}</ul>,
                          ol: ({ children }) => <ol className={`list-decimal list-outside mb-2 space-y-0.5 pl-3 text-sm ${isUser ? 'text-black marker:text-black' : 'text-white marker:text-white'}`}>{children}</ol>,
                          li: ({ children }) => <li className={`leading-relaxed text-sm ${isUser ? 'text-black' : 'text-white'}`}>{children}</li>,
                          
                          // Text formatting
                          strong: ({ children }) => <strong className={`font-semibold text-sm ${isUser ? 'text-black' : 'text-white'}`}>{children}</strong>,
                          em: ({ children }) => <em className={`italic text-sm ${isUser ? 'text-black' : 'text-white'}`}>{children}</em>,
                          
                          // Code
                          code: ({ children, className }) => {
                            const isInline = !className
                            if (isInline) {
                              return <code className={`px-1 py-0.5 rounded text-xs font-mono ${isUser ? 'bg-gray-200 text-black' : 'bg-gray-700 text-white'}`}>{children}</code>
                            }
                            return <code className={className}>{children}</code>
                          },
                          pre: ({ children }) => <pre className={`p-2 rounded-lg overflow-x-auto mb-2 whitespace-pre-wrap break-words text-xs ${isUser ? 'bg-gray-200 text-black' : 'bg-gray-700 text-white'}`}>{children}</pre>,
                          
                          // Links
                          a: ({ href, children }) => <a href={href} className={`underline text-xs ${isUser ? 'text-blue-600 hover:text-blue-800' : 'text-blue-300 hover:text-blue-200'}`} target="_blank" rel="noopener noreferrer">{children}</a>,
                          
                          // Blockquotes
                          blockquote: ({ children }) => <blockquote className={`border-l-4 pl-2 italic mb-2 text-xs ${isUser ? 'border-gray-400 text-gray-800' : 'border-gray-400 text-gray-200'}`}>{children}</blockquote>,
                          
                          // Horizontal rule
                          hr: () => <hr className="border-gray-400 my-2" />,
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
          <div className="flex justify-start mb-3">
            <div className="max-w-[90%] sm:max-w-[80%] mr-2 sm:mr-8">
              <div className="flex items-start gap-1.5">
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 shadow-lg ring-2 ring-white">
                  <AvatarFallback className="bg-black text-white font-semibold text-xs flex items-center justify-center">
                    <Bot className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="relative inline-block max-w-full bg-black text-white shadow-md rounded-lg px-2 py-1.5">
                    <div className="flex items-center space-x-1.5">
                      <div className="flex space-x-0.5">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-white font-medium">AI is thinking...</span>
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


      {/* Input Area - Modern Full Width Design */}
      <div className="flex-shrink-0 border-t bg-gradient-to-b from-gray-50/80 to-white backdrop-blur-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          {/* Main Input Container with glassmorphism effect */}
          <div className="relative w-full">
            {/* Selected Media Count Badge - Top Left */}
            {selectedMediaCount > 0 && (
              <div className="absolute -top-8 left-0 z-10">
                <Badge variant="secondary" className="bg-blue-500 text-white shadow-lg border-0 px-3 py-1">
                  <span className="font-semibold">{selectedMediaCount}</span>
                  <span className="ml-1 text-xs">file{selectedMediaCount > 1 ? 's' : ''} selected</span>
                </Badge>
              </div>
            )}

            {/* Input Wrapper with shadow and border */}
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200/60 hover:border-gray-300/80 transition-all duration-300 overflow-hidden">
              {/* Top gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Main input area */}
              <div className="flex items-end gap-2 p-3 sm:p-4">
                {/* Attachment Button - Left */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenMediaSelector}
                  className="flex-shrink-0 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 h-10 w-10 sm:h-11 sm:w-11 transition-all duration-200 group"
                  title="Add attachment or drag & drop files anywhere"
                  disabled={isLoading}
                >
                  <Plus className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
                </Button>

                {/* Text Input Container */}
                <div className="flex-1 min-w-0">
                  <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={!currentAgent && !selectedAgent 
                      ? "Please select an AI agent to start..." 
                      : "Ask anything or drag & drop files here"
                    }
                    disabled={!currentAgent && !selectedAgent || isLoading}
                    className="w-full border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base resize-none min-h-[40px] max-h-[200px] overflow-y-auto py-2 px-1 leading-relaxed"
                    style={{ boxShadow: 'none', border: 'none', outline: 'none' }}
                    rows={1}
                  />
                  
                  {/* Helper text */}
                  {!currentAgent && !selectedAgent && (
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <p className="text-xs text-amber-600 font-medium">
                        Select an agent to start chatting
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Right */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Voice Input Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 h-10 w-10 sm:h-11 sm:w-11 transition-all duration-200 hover:scale-105"
                    title="Voice input (coming soon)"
                    disabled={isLoading}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  </Button>

                  {/* Send Button with loading state */}
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim() || !currentAgent && !selectedAgent || isLoading || isValidating}
                    className={`rounded-xl px-4 py-2 h-10 sm:h-11 flex items-center justify-center gap-2 transition-colors duration-200 ${
                      message.trim() && (currentAgent || selectedAgent) && !isLoading && !isValidating
                        ? 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-600 text-black shadow-md font-semibold'
                        : 'bg-white text-gray-400 opacity-60 cursor-not-allowed shadow-md border border-gray-200'
                    }`}
                    title={
                      isKnowledgeBaseEmpty 
                        ? "Business Information is empty - upload content first"
                        : isValidating 
                        ? "Validating Business Information..."
                        : "Send message (Enter)"
                    }
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span className="text-sm font-bold">Send</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Character counter for longer messages */}
              {message.length > 100 && (
                <div className="flex justify-end px-4 pb-3 pt-0">
                  <span className="text-xs text-gray-400 font-mono">
                    {message.length} chars
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Base Warning Modal */}
      <KnowledgeBaseWarningModal
        isOpen={showKnowledgeBaseWarning}
        onClose={() => setShowKnowledgeBaseWarning(false)}
        onUploadContent={handleUploadContent}
        onRetryValidation={handleRetryValidation}
        isLoading={isValidating}
        error={kbError}
      />
    </div>
  )
}