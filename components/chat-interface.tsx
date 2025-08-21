"use client"

import * as React from "react"
import { 
  Send, Bot, User, Paperclip, Download, Copy, ThumbsUp, 
  ThumbsDown, RotateCcw, Zap, Star, MessageSquare, Settings,
  ChevronDown, Facebook, Linkedin, Twitter, Mail, Chrome,
  Pin, Trash2, Edit, CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Conversation, ChatMessage, Agent, MediaItem, OutputPreset } from "@/types"

interface ChatInterfaceProps {
  conversation?: Conversation
  availableAgents?: Agent[]
  mediaItems?: MediaItem[]
  onSendMessage?: (content: string, attachedMedia?: string[]) => void
  onSelectAgent?: (agentId: string) => void
  onExportCopy?: (messageId: string, preset: OutputPreset) => void
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
}

export function ChatInterface({ 
  conversation,
  availableAgents = [],
  mediaItems = [],
  onSendMessage,
  onSelectAgent,
  onExportCopy,
  onPinMessage,
  onDeleteMessage,
  isLoading,
  messages,
  selectedAgent
}: ChatInterfaceProps) {
  const [message, setMessage] = React.useState("")
  const [attachedMedia, setAttachedMedia] = React.useState<string[]>([])
  const [selectedPreset, setSelectedPreset] = React.useState<OutputPreset>("facebook")
  const [showAgentSelector, setShowAgentSelector] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const currentAgent = availableAgents.find(agent => agent.id === conversation?.agentId)

  const outputPresets: { value: OutputPreset; label: string; icon: React.ComponentType }[] = [
    { value: "facebook", label: "Facebook", icon: Facebook },
    { value: "google", label: "Google Ads", icon: Chrome },
    { value: "linkedin", label: "LinkedIn", icon: Linkedin },
    { value: "x", label: "X (Twitter)", icon: Twitter },
    { value: "email-subject", label: "Email Subject", icon: Mail },
    { value: "custom", label: "Custom", icon: Settings }
  ]

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation?.messages, messages])

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim(), attachedMedia)
      setMessage("")
      setAttachedMedia([])
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
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-[#1ABC9C] to-emerald-500 rounded-xl shadow-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
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
              <div className="flex items-center space-x-2">
                <p className="text-sm text-slate-600">
                  Agent: {currentAgent?.name || selectedAgent || "No agent selected"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAgentSelector(!showAgentSelector)}
                  className="text-xs text-[#1ABC9C] hover:text-[#1ABC9C]/80 hover:bg-[#1ABC9C]/10 rounded-lg"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Change
                </Button>
              </div>
            </div>
          </div>
          
          {/* Output Preset Selector */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-slate-600 font-medium">Output:</span>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value as OutputPreset)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm focus:border-[#1ABC9C] focus:ring-2 focus:ring-[#1ABC9C]/20 focus:outline-none"
            >
              {outputPresets.map(preset => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Agent Selector */}
        {showAgentSelector && (
          <div className="mt-4 p-5 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 shadow-lg">
            <h4 className="text-sm font-semibold mb-4 text-slate-800">Select AI Agent</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableAgents.map(agent => (
                <div
                  key={agent.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    agent.id === currentAgent?.id
                      ? 'border-[#1ABC9C] bg-gradient-to-br from-[#1ABC9C]/10 to-emerald-50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    onSelectAgent?.(agent.id)
                    setShowAgentSelector(false)
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      agent.id === currentAgent?.id 
                        ? 'bg-[#1ABC9C] text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{agent.name}</p>
                      <p className="text-xs text-slate-600">{agent.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="secondary" className="text-xs bg-[#1ABC9C]/10 text-[#1ABC9C] border-[#1ABC9C]/20">
                            {outputPresets.find(p => p.value === msg.metadata?.generatedCopy?.preset)?.label}
                          </Badge>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyToClipboard(msg.metadata?.generatedCopy?.content || "")}
                              className="h-8 w-8 p-0 hover:bg-slate-200 text-slate-600"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onExportCopy?.(msg.id, selectedPreset)}
                              className="h-8 w-8 p-0 hover:bg-slate-200 text-slate-600"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* Attached Media Preview */}
      {attachedMedia.length > 0 && (
        <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-slate-200 sticky bottom-20 left-0 right-0 z-10">
          <div className="flex items-center space-x-3 mb-3">
            <Paperclip className="h-4 w-4 text-slate-600" />
            <span className="text-sm text-slate-700 font-medium">Attached Media ({attachedMedia.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {attachedMedia.map(mediaId => {
              const media = mediaItems.find(item => item.id === mediaId)
              return media ? (
                <Badge key={mediaId} variant="secondary" className="flex items-center space-x-2 bg-slate-100 text-slate-700 border-slate-200 px-3 py-1">
                  <span>{media.filename}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachedMedia(prev => prev.filter(id => id !== mediaId))}
                    className="h-4 w-4 p-0 ml-1 hover:bg-slate-200 rounded-full"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ) : null
            })}
          </div>
        </div>
      )}

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
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl p-3"
            >
              <Paperclip className="h-5 w-5" />
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