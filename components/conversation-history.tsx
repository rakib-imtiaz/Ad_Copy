"use client"

import * as React from "react"
import { 
  MessageSquare, Search, Filter, Clock, Bot, Pin, 
  Trash2, Edit, Star, ChevronDown, Calendar, User,
  Tag, Eye, Download, Archive, MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Conversation, Agent } from "@/types"

interface ConversationHistoryProps {
  conversations?: Conversation[]
  agents?: Agent[]
  onSelectConversation?: (conversationId: string) => void
  onDeleteConversation?: (conversationId: string) => void
  onArchiveConversation?: (conversationId: string) => void
  onCreateNewConversation?: () => void
  selectedConversationId?: string
}

export function ConversationHistory({ 
  conversations = [],
  agents = [],
  onSelectConversation,
  onDeleteConversation,
  onArchiveConversation,
  onCreateNewConversation,
  selectedConversationId
}: ConversationHistoryProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortBy, setSortBy] = React.useState<"recent" | "title" | "agent">("recent")
  const [filterAgent, setFilterAgent] = React.useState<string>("all")

  // Filter and sort conversations
  const filteredConversations = React.useMemo(() => {
    let filtered = conversations.filter(conversation => {
      const matchesSearch = conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           conversation.messages.some(msg => 
                             msg.content.toLowerCase().includes(searchQuery.toLowerCase())
                           )
      const matchesAgent = filterAgent === "all" || conversation.agentId === filterAgent
      return matchesSearch && matchesAgent
    })

    // Sort conversations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "agent":
          const agentA = agents.find(agent => agent.id === a.agentId)?.name || ""
          const agentB = agents.find(agent => agent.id === b.agentId)?.name || ""
          return agentA.localeCompare(agentB)
        default:
          return 0
      }
    })

    return filtered
  }, [conversations, searchQuery, sortBy, filterAgent, agents])

  const getAgentName = (agentId: string) => {
    return agents.find(agent => agent.id === agentId)?.name || "Unknown Agent"
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: diffInHours > 8760 ? 'numeric' : undefined
    }).format(new Date(date))
  }

  const getLastMessagePreview = (conversation: Conversation) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    if (!lastMessage) return "No messages"
    
    const preview = lastMessage.content.length > 100 
      ? lastMessage.content.substring(0, 100) + "..."
      : lastMessage.content
    
    return preview
  }

  const getConversationStats = (conversation: Conversation) => {
    const messageCount = conversation.messages.length
    const pinnedCount = conversation.pinnedMessages?.length || 0
    const mediaCount = conversation.attachedMedia?.length || 0
    
    return { messageCount, pinnedCount, mediaCount }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conversation History</h2>
          <p className="text-muted-foreground">
            Your AI chat sessions and generated copy
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{conversations.length} conversations</Badge>
          <Button 
            onClick={onCreateNewConversation}
            className="flex items-center space-x-2 bg-[#1ABC9C] hover:bg-[#1ABC9C]/90 text-black"
          >
            <MessageSquare className="h-4 w-4" />
            <span>New Chat</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations by title or content..."
                className="pl-10 bg-gray-800 border-gray-700 text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
                >
                  <option value="recent">Most Recent</option>
                  <option value="title">Title A-Z</option>
                  <option value="agent">Agent Name</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Agent:</span>
                <select
                  value={filterAgent}
                  onChange={(e) => setFilterAgent(e.target.value)}
                  className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
                >
                  <option value="all">All Agents</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversations List */}
      <div className="space-y-3">
        {filteredConversations.map((conversation) => {
          const stats = getConversationStats(conversation)
          const isSelected = selectedConversationId === conversation.id
          
          return (
            <Card 
              key={conversation.id}
              className={`transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-white hover:bg-gray-50 ring-2 ring-[#1ABC9C] border-[#1ABC9C] shadow-lg' 
                  : 'bg-black hover:border-gray-600 border-gray-700 shadow-md'
              }`}
              onClick={() => onSelectConversation?.(conversation.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    {/* Title */}
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className={`font-semibold truncate ${isSelected ? 'text-black' : 'text-white'}`}>{conversation.title}</h3>
                    </div>

                    {/* Last Message Preview */}
                    <p className={`text-sm line-clamp-2 mb-2 ${isSelected ? 'text-gray-600' : 'text-gray-300'}`}>
                      {getLastMessagePreview(conversation)}
                    </p>

                    {/* Stats and Metadata */}
                    <div className={`flex items-center space-x-4 text-xs ${isSelected ? 'text-gray-700' : 'text-gray-400'}`}>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{stats.messageCount} messages</span>
                      </div>
                      
                      {stats.pinnedCount > 0 && (
                        <div className="flex items-center space-x-1">
                          <Pin className="h-3 w-3" />
                          <span>{stats.pinnedCount} pinned</span>
                        </div>
                      )}
                      
                      {stats.mediaCount > 0 && (
                        <div className="flex items-center space-x-1">
                          <Tag className="h-3 w-3" />
                          <span>{stats.mediaCount} media</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(conversation.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Show conversation details
                      }}
                      className={`p-1 ${isSelected ? 'text-gray-600 hover:text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onArchiveConversation?.(conversation.id)
                      }}
                      className={`p-1 ${isSelected ? 'text-gray-600 hover:text-orange-600' : 'text-gray-400 hover:text-orange-400'}`}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteConversation?.(conversation.id)
                      }}
                      className={`p-1 ${isSelected ? 'text-gray-600 hover:text-white hover:bg-red-500' : 'text-gray-400 hover:text-white hover:bg-red-500'}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredConversations.length === 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-800 rounded-full">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery || filterAgent !== "all" ? "No matching conversations" : "No conversations yet"}
                </h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery || filterAgent !== "all"
                    ? "Try adjusting your search criteria or filters"
                    : "Start your first AI chat to generate high-converting ad copy"
                  }
                </p>
                {!searchQuery && filterAgent === "all" && (
                  <Button 
                    onClick={onCreateNewConversation}
                    className="bg-[#1ABC9C] hover:bg-[#1ABC9C]/90 text-black"
                  >
                    Start Your First Chat
                  </Button>
                )}
                {(searchQuery || filterAgent !== "all") && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("")
                      setFilterAgent("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {conversations.length > 0 && !searchQuery && filterAgent === "all" && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>
              Your conversation activity overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1ABC9C]">{conversations.length}</div>
                <div className="text-sm text-gray-400">Total Chats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1ABC9C]">
                  {conversations.reduce((sum, conv) => sum + conv.messages.length, 0)}
                </div>
                <div className="text-sm text-gray-400">Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1ABC9C]">
                  {conversations.reduce((sum, conv) => sum + (conv.pinnedMessages?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-400">Pinned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1ABC9C]">
                  {new Set(conversations.map(conv => conv.agentId)).size}
                </div>
                <div className="text-sm text-gray-400">Agents Used</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}