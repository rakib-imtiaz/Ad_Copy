"use client"

import * as React from "react"
import {
  Send, User, Download, Copy, RotateCcw, Zap, Star, MessageSquare,
  Pin, Trash2, Edit, CheckCircle, Plus, Mic, Volume2, Bot
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { Conversation, ChatMessage, Agent, MediaItem } from "@/types"

interface ChatInterfaceProps {
  conversation?: Conversation
  availableAgents?: Agent[]
  mediaItems?: MediaItem[]
      onSendMessage?: (content: string, attachedMedia?: string[]) => void
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
  }>
  selectedAgent?: string
  // Media selector props
  onOpenMediaSelector?: () => void
  selectedMediaCount?: number
}

export function ChatInterface({
  conversation,
  availableAgents = [],
  mediaItems = [],
  onSendMessage,
  onPinMessage,
  onDeleteMessage,
  isLoading,
  messages,
  selectedAgent,
  onOpenMediaSelector,
  selectedMediaCount = 0
}: ChatInterfaceProps) {
  const [message, setMessage] = React.useState("")

  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const currentAgent = availableAgents.find(agent => agent.id === conversation?.agentId)



  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation?.messages, messages])

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim(), [])
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
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

  return (
    <div className="relative flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Chat Header */}
      <div className="p-3 sm:p-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-800 text-base sm:text-lg">
                  {conversation?.title || "New Conversation"}
                </h3>
                {conversation?.pinnedMessages && conversation.pinnedMessages.length > 0 && (
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                    {conversation.pinnedMessages.length} pinned
                  </Badge>
                )}
              </div>

            </div>


        </div>

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 pb-32">
        {(messages || conversation?.messages || []).map((msg) => {
          // Handle both ChatMessage (with type) and dashboard messages (with role)
          const isUser = 'role' in msg ? msg.role === 'user' : msg.type === 'user'
          return (
          <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] sm:max-w-[70%] ${isUser ? 'ml-3 sm:ml-12' : 'mr-3 sm:mr-12'}`}>
              <div className={`flex items-start ${isUser ? 'flex-row-reverse' : 'space-x-3 sm:space-x-4'}`}>
                {!isUser && (
                  <Avatar className="h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-[#1ABC9C] to-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center">
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
                  <div className={`inline-block p-2.5 sm:p-3 rounded-2xl shadow-sm chat-message ${isUser ? 'user' : 'ai'} ${
                    isUser 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}>
                    <div className={`break-words overflow-hidden space-y-2 ${isUser ? 'text-white' : ''}`}>
                      <MarkdownRenderer 
                        content={msg.content} 
                        className={isUser ? 'prose-invert [&_*]:text-white [&_p]:text-white [&_strong]:text-white [&_em]:text-white [&_li]:text-white [&_ul]:text-white [&_ol]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white' : ''}
                      />
                    </div>
                    
                    {/* Generated Copy Preview */}
                    {'metadata' in msg && msg.metadata?.generatedCopy && (
                      <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200 chat-message ai">
                        <div className="flex items-center justify-end mb-2 sm:mb-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyToClipboard(msg.metadata?.generatedCopy?.content || "")}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-slate-200 text-slate-600"
                          >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                        <div className="break-words overflow-hidden">
                          <MarkdownRenderer content={msg.metadata?.generatedCopy?.content || ""} className="text-sm" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center mt-1.5 sm:mt-2 space-x-1.5 sm:space-x-2 text-xs text-slate-500 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="font-medium">{formatTimestamp(msg.timestamp)}</span>
                    
                    {/* Message Actions */}
                    {!isUser && (
                      <div className="flex space-x-0.5 sm:space-x-1 opacity-70 hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPinMessage?.(msg.id)}
                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:text-amber-500 hover:bg-amber-50 rounded-lg"
                        >
                          <Pin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(msg.content)}
                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:text-[#1ABC9C] hover:bg-[#1ABC9C]/10 rounded-lg"
                        >
                          <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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
          <div className="flex justify-start">
            <div className="max-w-[80%] sm:max-w-[70%] mr-3 sm:mr-12">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <Avatar className="h-7 w-7 sm:h-9 sm:w-9 shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-[#1ABC9C] to-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-slate-200 text-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#1ABC9C] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#1ABC9C] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#1ABC9C] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>



      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-white/95 backdrop-blur-sm border-t border-slate-200 sticky bottom-0 left-0 right-0 z-10">
        <div className="max-w-4xl mx-auto">
          {/* ChatGPT-style input bar */}
          <div className="relative">
            <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-3 shadow-sm hover:shadow-md transition-shadow focus-within:border-gray-300 focus-within:shadow-md focus-within:outline-none">
              {/* Plus icon on the left */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenMediaSelector}
                className="rounded-full p-2 mr-3 hover:bg-gray-100 text-gray-600"
                title="Add attachment"
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              {/* Input field */}
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything"
                disabled={!currentAgent && !selectedAgent || isLoading}
                className="flex-1 border-0 bg-transparent text-gray-800 placeholder:text-gray-500 focus:ring-0 focus:outline-none focus:border-0 focus-visible:ring-0 focus-visible:outline-none text-sm"
              />
              
              {/* Voice icons on the right */}
              <div className="flex items-center space-x-2 ml-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2 hover:bg-gray-100 text-gray-600"
                  title="Voice input"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2 hover:bg-gray-100 text-gray-600"
                  title="Voice output"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Disclaimer text */}
            <p className="text-xs text-gray-600 mt-2 text-center">
              AI can make mistakes. Check important info.
            </p>
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