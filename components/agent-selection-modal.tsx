"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  Bot, 
  Check, 
  RefreshCw, 
  ArrowRight, 
  Sparkles,
  X,
  Search,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Agent {
  id: string
  name: string
  description: string
  is_active?: boolean
}

interface AgentSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  agents: Agent[]
  selectedAgent: string
  onSelectAgent: (agent: string) => void
  onStartChatting: () => void
  onRefreshAgents: () => void
  isLoadingAgents: boolean
  isStartingChat: boolean
}

export function AgentSelectionModal({
  isOpen,
  onClose,
  agents,
  selectedAgent,
  onSelectAgent,
  onStartChatting,
  onRefreshAgents,
  isLoadingAgents,
  isStartingChat
}: AgentSelectionModalProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [localSelectedAgent, setLocalSelectedAgent] = React.useState(selectedAgent)

  // Update local state when selectedAgent prop changes
  React.useEffect(() => {
    setLocalSelectedAgent(selectedAgent)
  }, [selectedAgent])

  // Filter agents based on search query
  const filteredAgents = React.useMemo(() => {
    if (!searchQuery.trim()) return agents
    return agents.filter(agent => 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [agents, searchQuery])

  const handleAgentSelect = (agentName: string) => {
    setLocalSelectedAgent(agentName)
    onSelectAgent(agentName)
  }

  const handleStartChatting = () => {
    if (localSelectedAgent) {
      onStartChatting()
    }
  }

  const selectedAgentData = agents.find(agent => agent.name === localSelectedAgent)

  return (
    <Dialog open={isOpen} onOpenChange={isStartingChat ? undefined : onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden bg-white border-0 shadow-2xl">
        {/* Loading Overlay */}
        {isStartingChat && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <RefreshCw className="h-8 w-8 text-black animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Starting Your Chat</h3>
                <p className="text-gray-600">Setting up your AI agent and preparing the conversation...</p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-black" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  What can I help with?
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Choose an AI agent and start creating high-converting ad copy that drives results.
                </p>
              </div>
            </div>
            {!isStartingChat && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Agent Selection Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Select Your AI Agent</h3>
                <p className="text-sm text-gray-600">Choose the perfect assistant for your copywriting needs.</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {agents.length} agents available
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRefreshAgents}
                        disabled={isLoadingAgents}
                        className="h-8 w-8 p-0 text-gray-600 hover:text-yellow-600 hover:bg-yellow-100"
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoadingAgents ? 'animate-spin' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Refresh agents</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
              />
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingAgents ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredAgents.length > 0 ? (
                filteredAgents.map((agent) => {
                  const isSelected = localSelectedAgent === agent.name
                  
                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-200 border-2 ${
                          isSelected 
                            ? 'border-yellow-500 bg-yellow-50 shadow-lg' 
                            : 'border-gray-200 hover:border-yellow-300 hover:shadow-md'
                        }`}
                        onClick={() => handleAgentSelect(agent.name)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                              isSelected 
                                ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' 
                                : 'bg-gradient-to-br from-gray-600 to-gray-700'
                            }`}>
                              <Bot className={`h-5 w-5 ${isSelected ? 'text-black' : 'text-white'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className={`font-semibold text-sm truncate ${
                                  isSelected ? 'text-gray-900' : 'text-gray-900'
                                }`}>
                                  {agent.name}
                                </h4>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Check className="h-4 w-4 text-yellow-600" />
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {agent.description}
                              </p>
                              {agent.is_active === false && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bot className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                  <p className="text-gray-600">
                    {searchQuery ? 'Try adjusting your search terms.' : 'No agents are currently available.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isStartingChat && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {selectedAgentData && (
                <span>Selected: <span className="font-medium text-gray-900">{selectedAgentData.name}</span></span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartChatting}
                disabled={!localSelectedAgent || isStartingChat}
                className="px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
              >
                Start Chatting
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
