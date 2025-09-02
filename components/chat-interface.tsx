"use client"

import * as React from "react"
import {
  Send, User, Download, Copy, ThumbsUp,
  ThumbsDown, RotateCcw, Zap, Star, MessageSquare,
  Pin, Trash2, Edit, CheckCircle, Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    // TODO: Show toast notification
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
      <div className="p-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-800 text-lg">
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
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
        {(messages || conversation?.messages || []).map((msg) => {
          // Handle both ChatMessage (with type) and dashboard messages (with role)
          const isUser = 'role' in msg ? msg.role === 'user' : msg.type === 'user'
          return (
          <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] ${isUser ? 'ml-16' : 'mr-16'}`}>
              <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="h-10 w-10 flex-shrink-0 shadow-md">
                  {isUser ? (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">U</AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-[#1ABC9C] to-emerald-500 text-white font-semibold">AI</AvatarFallback>
                  )}
                </Avatar>
                
                <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
                  <div className={`inline-block p-4 rounded-2xl shadow-sm ${
                    isUser 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* Generated Copy Preview */}
                    {'metadata' in msg && msg.metadata?.generatedCopy && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-end mb-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyToClipboard(msg.metadata?.generatedCopy?.content || "")}
                            className="h-8 w-8 p-0 hover:bg-slate-200 text-slate-600"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{msg.metadata?.generatedCopy?.content}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center mt-2 space-x-3 text-xs text-slate-500 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="font-medium">{formatTimestamp(msg.timestamp)}</span>
                    
                    {/* Message Actions */}
                    {!isUser && (
                      <div className="flex space-x-1 opacity-70 hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPinMessage?.(msg.id)}
                          className="h-6 w-6 p-0 hover:text-amber-500 hover:bg-amber-50 rounded-lg"
                        >
                          <Pin className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(msg.content)}
                          className="h-6 w-6 p-0 hover:text-[#1ABC9C] hover:bg-[#1ABC9C]/10 rounded-lg"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:text-green-500 hover:bg-green-50 rounded-lg"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <ThumbsDown className="h-3 w-3" />
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
            <div className="max-w-[75%] mr-16">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10 shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-[#1ABC9C] to-emerald-500 text-white font-semibold">AI</AvatarFallback>
                </Avatar>
                <div className="bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl shadow-sm">
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
      <div className="p-6 bg-white/95 backdrop-blur-sm border-t border-slate-200 sticky bottom-0 left-0 right-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={currentAgent || selectedAgent ? `Ask ${currentAgent?.name || selectedAgent} to create ad copy...` : "Select an agent to start chatting..."}
                disabled={!currentAgent && !selectedAgent || isLoading}
                className="bg-white border-2 border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-[#1ABC9C] focus:ring-2 focus:ring-[#1ABC9C]/20 rounded-2xl px-6 py-4 text-base shadow-sm"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenMediaSelector}
              className={`rounded-xl p-3 relative ${
                selectedMediaCount > 0 
                  ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title="Select media for chat context"
            >
              <Plus className="h-5 w-5" />
              {selectedMediaCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {selectedMediaCount}
                </span>
              )}
            </Button>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || (!currentAgent && !selectedAgent) || isLoading}
              className="bg-gradient-to-r from-[#1ABC9C] to-emerald-500 hover:from-[#1ABC9C]/90 hover:to-emerald-500/90 text-white rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Send className="h-5 w-5" />
            </Button>
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