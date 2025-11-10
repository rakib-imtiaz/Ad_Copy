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
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden bg-background text-foreground border border-border shadow-2xl">
        {/* Loading Overlay */}
        {isStartingChat && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <RefreshCw className="h-8 w-8 text-black animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Starting Your Chat</h3>
                <p className="text-muted-foreground">Setting up your AI agent and preparing the conversation...</p>
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
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Select Your AI Agent
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose the perfect assistant for your copywriting needs.
                </p>
              </div>
            </div>
            {!isStartingChat && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Agent Selection Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-brand-light text-black">
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
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-brand hover:bg-brand/10"
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
            <div className="relative px-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-background border border-border text-foreground focus:border-brand focus:ring-brand"
              />
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
              {isLoadingAgents ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="border-border h-full flex flex-col bg-background">
                    <CardContent className="p-3 h-full flex flex-col">
                      <div className="flex items-start space-x-2 flex-1">
                        <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-1.5">
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
                        className={`cursor-pointer transition-all duration-200 border-2 h-full flex flex-col bg-background ${
                          isSelected 
                            ? 'border-brand bg-brand/20 shadow-lg' 
                            : 'border-border hover:border-brand/60 hover:shadow-md'
                        }`}
                        onClick={() => handleAgentSelect(agent.name)}
                      >
                        <CardContent className="p-3 h-full flex flex-col">
                          <div className="flex items-start space-x-2 flex-1 min-h-0">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected 
                                ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' 
                                : 'bg-muted'
                            }`}>
                              <Bot className={`h-4 w-4 ${isSelected ? 'text-black' : 'text-foreground'}`} />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col">
                              <div className="flex items-start justify-between gap-2 mb-0.5">
                                <h4 className="font-semibold text-sm text-foreground break-words line-clamp-2 flex-1 min-w-0">
                                  {agent.name}
                                </h4>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex-shrink-0 mt-0.5"
                                  >
                                    <Check className="h-3.5 w-3.5 text-yellow-600" />
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 break-words leading-tight">
                                {agent.description}
                              </p>
                              {agent.is_active === false && (
                                <Badge variant="secondary" className="mt-1.5 text-xs w-fit">
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
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Bot className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No agents found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Try adjusting your search terms.' : 'No agents are currently available.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isStartingChat && (
          <div className="flex items-center justify-end pt-6 border-t border-border">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 text-foreground"
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
