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
  isLoading 
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
  }, [conversation?.messages])

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

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(timestamp))
  }

  return (
    <div className="relative flex flex-col h-full bg-gray-950">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#1ABC9C] rounded-lg">
              <Bot className="h-5 w-5 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">
                  {conversation?.title || "New Conversation"}
                </h3>
                {conversation?.pinnedMessages && conversation.pinnedMessages.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {conversation.pinnedMessages.length} pinned
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-400">
                  Agent: {currentAgent?.name || "No agent selected"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAgentSelector(!showAgentSelector)}
                  className="text-xs text-[#1ABC9C] hover:text-[#1ABC9C]/80"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Change
                </Button>
              </div>
            </div>
          </div>
          
          {/* Output Preset Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Output:</span>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value as OutputPreset)}
              className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
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
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium mb-3">Select AI Agent</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableAgents.map(agent => (
                <div
                  key={agent.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    agent.id === currentAgent?.id
                      ? 'border-[#1ABC9C] bg-[#1ABC9C]/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => {
                    onSelectAgent?.(agent.id)
                    setShowAgentSelector(false)
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-gray-700 rounded">
                      <Bot className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{agent.name}</p>
                      <p className="text-xs text-gray-400">{agent.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-40">
        {conversation?.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.type === 'user' ? 'ml-12' : 'mr-12'}`}>
              <div className={`flex items-start space-x-2 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {msg.type === 'user' ? (
                    <AvatarFallback className="bg-blue-500">U</AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-[#1ABC9C] text-black">AI</AvatarFallback>
                  )}
                </Avatar>
                
                <div className={`flex-1 ${msg.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    msg.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 text-gray-100'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* Generated Copy Preview */}
                    {msg.metadata?.generatedCopy && (
                      <div className="mt-3 p-2 bg-gray-700 rounded border-l-2 border-[#1ABC9C]">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {outputPresets.find(p => p.value === msg.metadata?.generatedCopy?.preset)?.label}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyToClipboard(msg.metadata?.generatedCopy?.content || "")}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onExportCopy?.(msg.id, selectedPreset)}
                              className="h-6 w-6 p-0"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm">{msg.metadata.generatedCopy.content}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center mt-1 space-x-2 text-xs text-gray-400 ${
                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{formatTimestamp(msg.timestamp)}</span>
                    
                    {/* Message Actions */}
                    {msg.type === 'ai' && (
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPinMessage?.(msg.id)}
                          className="h-5 w-5 p-0 hover:text-yellow-400"
                        >
                          <Pin className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(msg.content)}
                          className="h-5 w-5 p-0 hover:text-green-400"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 hover:text-green-400"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 hover:text-red-400"
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
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] mr-12">
              <div className="flex items-start space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#1ABC9C] text-black">AI</AvatarFallback>
                </Avatar>
                <div className="bg-gray-800 text-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
        <div className="p-4 border-t border-gray-800 bg-gray-900 sticky bottom-0 left-0 right-0 z-10">
          <div className="flex items-center space-x-2 mb-2">
            <Paperclip className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Attached Media ({attachedMedia.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {attachedMedia.map(mediaId => {
              const media = mediaItems.find(item => item.id === mediaId)
              return media ? (
                <Badge key={mediaId} variant="secondary" className="flex items-center space-x-1">
                  <span>{media.filename}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachedMedia(prev => prev.filter(id => id !== mediaId))}
                    className="h-3 w-3 p-0 ml-1"
                  >
                    <Trash2 className="h-2 w-2" />
                  </Button>
                </Badge>
              ) : null
            })}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-gray-900 sticky bottom-0 left-0 right-0 z-10">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={currentAgent ? `Ask ${currentAgent.name} to create ad copy...` : "Select an agent to start chatting..."}
              disabled={!currentAgent || isLoading}
              className="bg-gray-800 border-gray-700 text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || !currentAgent || isLoading}
            className="bg-[#1ABC9C] hover:bg-[#1ABC9C]/90 text-black"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {!currentAgent && (
          <p className="text-xs text-gray-400 mt-2">
            Please select an AI agent to start generating ad copy
          </p>
        )}
      </div>
    </div>
  )
}