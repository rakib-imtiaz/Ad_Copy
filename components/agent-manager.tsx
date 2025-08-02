"use client"

import * as React from "react"
import { 
  Bot, Plus, Settings, Star, Clock, Users, Zap, 
  Edit, Trash2, Copy, Eye, CheckCircle, AlertCircle,
  Crown, Globe, Building
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Agent } from "@/types"

interface AgentManagerProps {
  agents?: Agent[]
  onSelectAgent?: (agentId: string) => void
  onCreateConversation?: (agentId: string) => void
  selectedAgentId?: string
  isAdmin?: boolean
}

export function AgentManager({ 
  agents = [], 
  onSelectAgent, 
  onCreateConversation,
  selectedAgentId,
  isAdmin = false 
}: AgentManagerProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")

  // Filter agents based on search and category
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || 
                           (selectedCategory === "global" && agent.isGlobal) ||
                           (selectedCategory === "tenant" && !agent.isGlobal)
    return matchesSearch && matchesCategory && agent.isActive
  })

  // Get agent categories
  const categories = [
    { value: "all", label: "All Agents", count: agents.filter(a => a.isActive).length },
    { value: "global", label: "Global", count: agents.filter(a => a.isGlobal && a.isActive).length },
    { value: "tenant", label: "Custom", count: agents.filter(a => !a.isGlobal && a.isActive).length }
  ]

  const getAgentIcon = (agentName: string) => {
    // You could map specific agent types to different icons
    if (agentName.toLowerCase().includes('email')) return '📧'
    if (agentName.toLowerCase().includes('social')) return '📱'
    if (agentName.toLowerCase().includes('google')) return '🔍'
    if (agentName.toLowerCase().includes('facebook')) return '👥'
    if (agentName.toLowerCase().includes('linkedin')) return '💼'
    if (agentName.toLowerCase().includes('ppc')) return '💰'
    return '🤖'
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Agents</h2>
          <p className="text-muted-foreground">
            Choose from specialized copywriting agents for different platforms and purposes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{agents.filter(a => a.isActive).length} active agents</Badge>
          {isAdmin && (
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Agent</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents by name or description..."
                className="bg-gray-800 border-gray-700 text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
              {categories.map(category => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-[#1ABC9C] text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <Card 
            key={agent.id} 
            className={`bg-gray-900 border-gray-800 hover:bg-gray-800/50 transition-all cursor-pointer ${
              selectedAgentId === agent.id ? 'ring-2 ring-[#1ABC9C] border-[#1ABC9C]' : ''
            }`}
            onClick={() => onSelectAgent?.(agent.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getAgentIcon(agent.name)}</div>
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>{agent.name}</span>
                      {agent.isGlobal ? (
                        <Badge variant="secondary" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          Global
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Building className="h-3 w-3 mr-1" />
                          Custom
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      v{agent.version} • {formatDate(agent.updatedAt)}
                    </CardDescription>
                  </div>
                </div>
                
                {selectedAgentId === agent.id && (
                  <CheckCircle className="h-5 w-5 text-[#1ABC9C]" />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-sm text-gray-400 line-clamp-2">
                {agent.description}
              </p>

              {/* Specializations */}
              <div className="flex flex-wrap gap-1">
                {agent.name.toLowerCase().includes('facebook') && (
                  <Badge variant="outline" className="text-xs">Facebook</Badge>
                )}
                {agent.name.toLowerCase().includes('google') && (
                  <Badge variant="outline" className="text-xs">Google Ads</Badge>
                )}
                {agent.name.toLowerCase().includes('email') && (
                  <Badge variant="outline" className="text-xs">Email</Badge>
                )}
                {agent.name.toLowerCase().includes('linkedin') && (
                  <Badge variant="outline" className="text-xs">LinkedIn</Badge>
                )}
                {agent.name.toLowerCase().includes('social') && (
                  <Badge variant="outline" className="text-xs">Social Media</Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCreateConversation?.(agent.id)
                  }}
                  className="flex-1 bg-[#1ABC9C] hover:bg-[#1ABC9C]/90 text-black"
                  size="sm"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Start Chat
                </Button>
                
                {isAdmin && (
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" className="p-2">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="p-2">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-800 rounded-full">
                <Bot className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? "No matching agents found" : "No agents available"}
                </h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery 
                    ? "Try adjusting your search criteria" 
                    : "Contact your administrator to set up AI agents for your team"
                  }
                </p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Agents Section */}
      {!searchQuery && selectedCategory === "all" && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span>Popular Agents</span>
            </CardTitle>
            <CardDescription>
              Most commonly used agents for high-converting ad copy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agents
                .filter(agent => agent.isGlobal && agent.isActive)
                .slice(0, 3)
                .map((agent) => (
                  <div
                    key={agent.id}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                    onClick={() => onSelectAgent?.(agent.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{getAgentIcon(agent.name)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{agent.name}</h4>
                        <p className="text-xs text-gray-400 truncate">{agent.description}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Try Now
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Controls */}
      {isAdmin && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Admin Controls</span>
            </CardTitle>
            <CardDescription>
              Manage agents and assist users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create New Agent</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Copy className="h-4 w-4" />
                <span>Clone Agent</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>User Assist Mode</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}