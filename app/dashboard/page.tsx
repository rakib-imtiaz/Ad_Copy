"use client"

import * as React from "react"
import { motion } from "motion/react"
import { 
  Menu, Search, Bell, User, MessageSquare, Plus, 
  Bot, Settings, Upload, FileText, Link2, Mic, 
  PanelLeftClose, PanelRightClose, Send, Paperclip,
  ChevronRight, MoreHorizontal, Star, Clock, Zap, RefreshCw, Image, Activity,
  Sparkles, ArrowRight, ChevronDown, Check, Power, Headphones, Video
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import { AnimatedText, FadeInText, SlideInText, WordByWordText } from "@/components/ui/animated-text"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { authService } from "@/lib/auth-service"
import { ChatInterface } from "@/components/chat-interface"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { API_ENDPOINTS, getAuthHeaders } from "@/lib/api-config"
import { Toast } from "@/components/ui/toast"
import { ContentViewer } from "@/components/content-viewer"
import { useSidebarState } from "@/lib/sidebar-state-context"

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 48) return "Yesterday"
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Component to render markdown content
function MarkdownContent({ content }: { content: string }) {
  // Simple markdown rendering for bold text and basic formatting
  const renderContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs">$1</code>')
  }

  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: renderContent(content) 
      }} 
    />
  )
}

// Modern Initial Interface with Enhanced UX
function InitialInterface({ agents, selectedAgent, onSelectAgent, onStartChatting, onRefreshAgents, isLoadingAgents, isStartingChat }: any) {
  const handleStartChatting = () => {
    if (selectedAgent && onStartChatting) {
      onStartChatting()
    }
  }

  const quickPrompts = [
    {
      title: "Instagram Ad",
      description: "Create an Instagram ad for a new fitness app",
      icon: "📱",
      category: "Social Media"
    },
    {
      title: "Local Restaurant",
      description: "Write a Facebook ad for a local restaurant",
      icon: "🍽️",
      category: "Facebook"
    },
    {
      title: "Email Subject Lines",
      description: "Generate email subject lines for a sale",
      icon: "📧",
      category: "Email"
    },
    {
      title: "B2B LinkedIn",
      description: "Draft LinkedIn ad copy for B2B software",
      icon: "💼",
      category: "LinkedIn"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
    <motion.div 
          className="text-center mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <img 
              src="/logo.png" 
              alt="Copy Ready logo" 
                  width={40} 
                  height={40}
              className="rounded-lg"
            />
          </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            What can I help with?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose an AI agent and start creating high-converting ad copy that drives results
          </p>
        </motion.div>

        {/* Agent Selection Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Select Your AI Agent</h2>
              <p className="text-sm text-muted-foreground">Choose the perfect assistant for your copywriting needs</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshAgents}
              disabled={isLoadingAgents || isStartingChat}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingAgents ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
          <AgentSelector 
            agents={agents}
            selectedAgent={selectedAgent}
            onSelectAgent={onSelectAgent}
            onOpenChange={() => {}}
            isLoading={isLoadingAgents || isStartingChat}
            onRefresh={onRefreshAgents}
          />
        </motion.div>

        {/* Start Button */}
        <motion.div 
          className="mb-12 flex justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button
            onClick={handleStartChatting}
            disabled={!selectedAgent || isStartingChat}
            size="lg"
            className="w-full max-w-md h-14 px-8 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
          >
            {isStartingChat ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Starting Chat...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <MessageSquare className="h-5 w-5" />
                <span>Start Chatting</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            )}
          </Button>
        </motion.div>

        {/* Quick Prompts Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-2">Quick Start Templates</h3>
            <p className="text-muted-foreground">Get started with these popular ad copy templates</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickPrompts.map((prompt, index) => (
              <motion.div
              key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 border-2 hover:border-primary/50 hover:shadow-lg group ${
                    isStartingChat ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              onClick={() => {
                    if (!isStartingChat) {
                if (typeof window !== 'undefined') {
                        localStorage.setItem('pending_prompt', prompt.description)
                      }
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-lg">
                          {prompt.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base group-hover:text-primary transition-colors">
                            {prompt.title}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {prompt.category}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm leading-relaxed">
                      {prompt.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-12 pt-8 border-t border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-xs text-muted-foreground">
            ⚡ AI can make mistakes. Verify important information and review all generated content.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

// Three Dots Menu Component
function ThreeDotsMenu({ onDelete }: any) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 text-[#929AAB] hover:text-[#393E46] hover:bg-[#F7F7F7]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="h-3 w-3" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[90]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 top-full mt-1 bg-white border border-[#EEEEEE] rounded-lg shadow-lg z-[100] min-w-[120px]"
          >
            <div className="p-1">
              <button
                onClick={() => { onDelete?.(); setIsOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#F9FAFB] rounded-md transition-colors text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

// Modern Agent Selector Component with Command Search
function AgentSelector({ agents, selectedAgent, onSelectAgent, onOpenChange, isLoading, onRefresh }: any) {
  const [open, setOpen] = React.useState(false)
  
  // Memoize currentAgent to prevent unnecessary recalculations
  const currentAgent = React.useMemo(() => 
    agents.find((agent: any) => agent.name === selectedAgent), 
    [agents, selectedAgent]
  )

  // Memoize the click handler to prevent unnecessary re-renders
  const handleAgentSelect = React.useCallback((agentName: string) => {
    onSelectAgent(agentName)
    setOpen(false)
    onOpenChange?.(false)
  }, [onSelectAgent, onOpenChange])

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="text-center">
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto p-0 border-0 bg-transparent"
        >
          <Card className="w-full cursor-pointer border-2 border-muted hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-lg">
                    {currentAgent?.icon || "🤖"}
            </div>
          </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-semibold text-sm text-foreground">
                    {currentAgent?.name || "Select an AI Agent"}
        </div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {currentAgent?.description || "Choose your AI assistant to start creating amazing ad copy"}
            </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" side="bottom" align="start">
        <Command>
          <CommandInput placeholder="Search agents..." className="h-9" />
          <CommandEmpty>No agents found.</CommandEmpty>
          <CommandGroup>
            <CommandList className="max-h-[300px]">
            {agents.map((agent: any) => (
                <CommandItem
                key={agent.id}
                  value={agent.name}
                  onSelect={() => handleAgentSelect(agent.name)}
                  className="flex items-center space-x-3 p-3 cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm">
                      {agent.icon}
                  </div>
                </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{agent.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {agent.description}
          </div>
        </div>
                  {selectedAgent === agent.name && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [leftPanelOpen, setLeftPanelOpen] = React.useState(true)
  const [rightPanelOpen, setRightPanelOpen] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<'files' | 'links' | 'youtube' | 'image-analyzer' | 'transcripts'>('files')
  
  // Handle tab change with loading state
  const handleTabChange = async (newTab: 'files' | 'links' | 'youtube' | 'image-analyzer' | 'transcripts') => {
    if (newTab === activeTab) return
    
    // Show loading immediately
    setIsLoadingTabContent(true)
    setActiveTab(newTab)
    
    // Wait for content to be ready (simulate async loading)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Hide loading
    setIsLoadingTabContent(false)
  }
  
  const [selectedAgent, setSelectedAgent] = React.useState("")
  
  // Get sidebar state updaters
  const {
    updateAgents,
    updateSelectedAgent,
    updateChatHistory,
    updateCurrentChatSession,
    updateIsLoadingAgents,
    updateIsLoadingChatHistory,
    setActionRefs
  } = useSidebarState()
  
  
  // Memoize the setSelectedAgent function to prevent unnecessary re-renders
  const handleSelectAgent = React.useCallback((agentName: string) => {
    // Prevent unnecessary re-renders if the same agent is selected
    if (selectedAgent !== agentName) {
      setSelectedAgent(agentName)
      updateSelectedAgent(agentName)
    }
  }, [selectedAgent, updateSelectedAgent])
  const [agents, setAgents] = React.useState<any[]>([])
  const [isLoadingAgents, setIsLoadingAgents] = React.useState(false)
  const [chatStarted, setChatStarted] = React.useState(false)
  const [hasInitializedChat, setHasInitializedChat] = React.useState(false)
  const [previousAgent, setPreviousAgent] = React.useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = React.useState(true)
  const [messages, setMessages] = React.useState<Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
    animated?: boolean
  }>>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [sessionId, setSessionId] = React.useState<string>('')
  const [showCreditPopup, setShowCreditPopup] = React.useState(false)
  const [mediaItems, setMediaItems] = React.useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isLoadingMedia, setIsLoadingMedia] = React.useState(false)
  const [isLoadingTabContent, setIsLoadingTabContent] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [deletingItemId, setDeletingItemId] = React.useState<string | null>(null)
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = React.useState(false)
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = React.useState(false)
  const [selectedMediaItems, setSelectedMediaItems] = React.useState<Set<string>>(new Set())
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  })
  // Add chat history state
  const [chatHistory, setChatHistory] = React.useState<Array<{
    session_id: string
    title: string
    created_at: string
  }>>([])
  const [isLoadingChatHistory, setIsLoadingChatHistory] = React.useState(false)
  const [currentChatSession, setCurrentChatSession] = React.useState<string | null>(null)

  // Debug log for currentChatSession changes
  React.useEffect(() => {
    console.log('🎯 Dashboard currentChatSession changed:', currentChatSession)
  }, [currentChatSession])
  const [isLoadingChat, setIsLoadingChat] = React.useState(false)
  
  const [isStartingChat, setIsStartingChat] = React.useState(false)
  const [knowledgeBaseStatus, setKnowledgeBaseStatus] = React.useState<{
    isLoaded: boolean;
    contentLength: number;
    lastFetched: string | null;
  }>({
    isLoaded: false,
    contentLength: 0,
    lastFetched: null
  })

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({
      message,
      type,
      isVisible: true
    })
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }))
    }, 3000)
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  // Fetch knowledge base status
  const fetchKnowledgeBaseStatus = async () => {
    try {
      const accessToken = authService.getAuthToken()
      if (!accessToken) return

      const response = await fetch('/api/knowledge-base', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.content) {
          setKnowledgeBaseStatus({
            isLoaded: true,
            contentLength: data.data.content.length,
            lastFetched: new Date().toISOString()
          })
          console.log('✅ Knowledge base status updated:', {
            isLoaded: true,
            contentLength: data.data.content.length
          })
        } else {
          setKnowledgeBaseStatus({
            isLoaded: false,
            contentLength: 0,
            lastFetched: new Date().toISOString()
          })
        }
      } else {
        setKnowledgeBaseStatus({
          isLoaded: false,
          contentLength: 0,
          lastFetched: new Date().toISOString()
        })
      }
    } catch (error) {
      console.log('⚠️ Failed to fetch knowledge base status:', error)
      setKnowledgeBaseStatus({
        isLoaded: false,
        contentLength: 0,
        lastFetched: new Date().toISOString()
      })
    }
  }

  // Fetch knowledge base status when user is authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      fetchKnowledgeBaseStatus()
    }
  }, [isAuthenticated, user])

  // Load session data from localStorage on component mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user wants a fresh start (URL parameter or localStorage flag)
      const urlParams = new URLSearchParams(window.location.search)
      const freshStart = urlParams.get('fresh') === 'true' || localStorage.getItem('fresh_start') === 'true'
      
      if (freshStart) {
        console.log('🔄 Fresh start requested - clearing localStorage')
        localStorage.removeItem('chat_session_id')
        localStorage.removeItem('chat_started')
        localStorage.removeItem('chat_messages')
        localStorage.removeItem('fresh_start')
        // Clear URL parameter
        window.history.replaceState({}, document.title, window.location.pathname)
        return
      }
      
      const savedSessionId = localStorage.getItem('chat_session_id')
      const savedChatStarted = localStorage.getItem('chat_started') === 'true'
      const savedMessages = localStorage.getItem('chat_messages')
      
      if (savedSessionId) {
        setSessionId(savedSessionId)
        console.log('📱 Loaded saved session ID from localStorage:', savedSessionId)
      }
      
      if (savedChatStarted && savedMessages) {
        // Only restore chat state if there are actual messages
        try {
          const parsedMessages = JSON.parse(savedMessages)
          if (parsedMessages.length > 0) {
            setChatStarted(true)
            console.log('📱 Loaded saved chat state from localStorage')
          } else {
            console.log('📱 No saved messages found - starting fresh dashboard')
          }
        } catch (error) {
          console.log('📱 Error parsing saved messages - starting fresh dashboard')
        }
      }
      
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages)
          // Ensure all messages have proper role assignment
          const validatedMessages = parsedMessages.map((msg: any) => {
            // If message has role property, keep it; otherwise assign based on type
            if (!msg.role && msg.type) {
              msg.role = msg.type === 'user' ? 'user' : 'assistant'
            } else if (!msg.role && !msg.type) {
              // Fallback: assume it's a user message if no role/type specified
              msg.role = 'user'
            }
            return msg
          })
          setMessages(validatedMessages)
          console.log('📱 Loaded saved messages from localStorage:', validatedMessages.length, 'messages')
          console.log('📱 Message roles:', validatedMessages.map((m: any) => ({ id: m.id, role: m.role, type: m.type })))
        } catch (error) {
          console.error('Error parsing saved messages:', error)
        }
      }
    }
    
    // Mark initial load as complete
    setIsInitialLoad(false)
  }, [])

  // Check for refresh parameter on component mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const shouldRefreshAgents = urlParams.get('refreshAgents')
      
      if (shouldRefreshAgents === 'true') {
        console.log('🔄 Detected refreshAgents=true parameter - automatically refreshing agents')
        
        // Remove the parameter from URL
        const url = new URL(window.location.href)
        url.searchParams.delete('refreshAgents')
        window.history.replaceState({}, document.title, url.toString())
        
        // Refresh agents after a short delay to ensure component is mounted
        setTimeout(() => {
          refreshAgents()
        }, 500)
      }
    }
  }, [])

  // Watch for agent changes and clear session when agent is changed
  React.useEffect(() => {
    // Skip on initial load to avoid unnecessary actions
    if (isInitialLoad) {
      return
    }
    
    if (selectedAgent && agents.length > 0 && previousAgent && previousAgent !== selectedAgent) {
      console.log('🔄 Agent changed from', previousAgent, 'to:', selectedAgent)
      
      // Only clear chat state when agent changes (don't create new session yet)
      // Session will be created when user clicks "Start Chatting"
      setChatStarted(false)
      setMessages([])
      setSessionId('')
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chat_session_id')
        localStorage.removeItem('chat_started')
        localStorage.removeItem('chat_messages')
      }
      
      console.log('💡 Chat state cleared. New session will be created when user starts chatting.')
    }
    
    // Update previous agent
    setPreviousAgent(selectedAgent)
  }, [selectedAgent, agents, isInitialLoad])

  // Fetch agents from n8n webhook
  const fetchAgents = async () => {
    try {
      setIsLoadingAgents(true)
      updateIsLoadingAgents(true)
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("No access token available")
        // Show a fallback agent if no token is available
        setAgents([{
          id: 'default-agent',
          name: 'Default Agent',
          description: 'Default AI agent for ad copy generation',
          icon: '🤖'
        }])
        setSelectedAgent('Default Agent')
        
        // Redirect to login page if we've lost our token
        setTimeout(() => {
          console.log('No valid token found, redirecting to login')
          window.location.href = '/auth/signin?error=invalid_token'
        }, 100)
        return
      }

      console.log('Fetching active agents from n8n webhook...')
      console.log('Request URL:', '/api/agents/active-list')
      console.log('Request headers:', {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      })

      const response = await fetch('/api/agents/active-list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        console.error('Failed to fetch agents. Status:', response.status)
        console.error('Response headers:', response.headers)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error details:', errorData)
        return
      }

      const data = await response.json()
      console.log('Agents API response:', data)
      console.log('Response data type:', typeof data)
      console.log('Is array?', Array.isArray(data))
      console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array')
      
      // Handle case where data might be empty or null
      if (!data) {
        console.log('No valid agents data received, data is:', data)
        setAgents([])
        return
      }
      
      // Convert single agent object to array if needed
      const agentsArray = Array.isArray(data) ? data : [data]
      console.log('Processing', agentsArray.length, 'agents from API response')
      
      // Transform the API response to match our agent interface
      const transformedAgents = agentsArray.map((agent: any, index: number) => {
        console.log(`Processing agent ${index}:`, agent)
        console.log(`Agent ${index} type:`, typeof agent)
        console.log(`Agent ${index} keys:`, Object.keys(agent))
        
        const transformedAgent = {
          id: agent.agent_id || `agent_${index}`,
          name: agent.agent_id ? agent.agent_id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : `Agent ${index + 1}`,
          description: agent.short_description || (agent.agent_id ? `AI Agent: ${agent.agent_id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}` : 'AI Agent for ad copy generation'),
          icon: ["📱", "📧", "🎯", "✍️", "🎨"][index] || "🤖"
        }
        
        console.log(`Transformed agent ${index}:`, transformedAgent)
        return transformedAgent
      })

      console.log('Transformed agents:', transformedAgents)
      console.log(`Total agents loaded: ${transformedAgents.length}`)
      console.log('Agent details:', transformedAgents.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        hasDescription: !!agent.description && agent.description !== `AI Agent: ${agent.name}`
      })))
      
      setAgents(transformedAgents)
      updateAgents(transformedAgents)
      
      // Set the first agent as selected if none is selected
      if (transformedAgents.length > 0 && !selectedAgent) {
        setSelectedAgent(transformedAgents[0].name)
        updateSelectedAgent(transformedAgents[0].name)
      } else if (transformedAgents.length === 0) {
        // Fallback: If no agents loaded, show default agents
        console.log('No agents loaded, showing fallback agents')
        const fallbackAgents = [
          {
            id: 'default-agent',
            name: 'Default Agent',
            description: 'Default AI agent for ad copy generation',
            icon: '🤖'
          }
        ]
        setAgents(fallbackAgents)
        if (!selectedAgent) {
          setSelectedAgent('Default Agent')
        }
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
      
      // Type guard to check if error is an Error object
      if (error instanceof Error) {
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)
        
        if (error.name === 'AbortError') {
          console.error('Request timed out after 10 seconds')
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          console.error('Network error - possible causes:')
          console.error('- CORS issue')
          console.error('- Network connectivity problem')
          console.error('- Invalid URL')
          console.error('- Server not responding')
        }
      }
      
      setAgents([])
      } finally {
        setIsLoadingAgents(false)
        updateIsLoadingAgents(false)
      
      // Fallback: If no agents loaded, show default agents
      // Note: This fallback is now handled in the main logic above
    }
  }

  // Refresh agents function
  const refreshAgents = async () => {
    console.log('🔄 refreshAgents function called')
    console.log('🔄 Current agents state:', agents)
    console.log('🔄 isLoadingAgents state:', isLoadingAgents)
    await fetchAgents()
    console.log('🔄 fetchAgents completed')
  }

  // Comprehensive refresh function for all media tabs
  const refreshAllTabs = async () => {
    console.log('🔄 refreshAllTabs function called - refreshing all media tabs')
    setIsRefreshing(true)
    setIsLoadingTabContent(true)
    
    try {
      // 1. Refresh main media library (Files tab)
      console.log('🔄 Refreshing main media library...')
      await fetchMediaLibrary()
      
      // 2. Refresh knowledge base status
      console.log('🔄 Refreshing knowledge base status...')
      await fetchKnowledgeBaseStatus()
      
      // 3. Force refresh of scraped contents for Links and YouTube tabs
      console.log('🔄 Refreshing scraped contents for Links and YouTube tabs...')
      const accessToken = authService.getAuthToken()
      
      if (accessToken) {
        try {
          const response = await fetch('/api/scraped-contents', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const result = await response.json()
            console.log('✅ Scraped contents refreshed:', result.data?.length || 0, 'items')
            
            if (result.data && Array.isArray(result.data)) {
              // Transform scraped contents into media items
              const scrapedItems = result.data.map((item: any) => ({
                id: `scraped-${item.resource_id || item.id || Math.random()}`,
                filename: item.resource_name || item.filename || 'Unknown',
                type: item.type || 'scraped',
                content: item.content,
                transcript: item.transcript,
                url: item.url,
                uploadedAt: new Date(item.created_at || Date.now()),
                size: item.content ? item.content.length : 0,
                title: item.resource_name || item.title || 'Scraped Content',
                resourceId: item.resource_id,
                resourceName: item.resource_name
              }))
              
              console.log('🔄 Updating media items with refreshed scraped contents...')
              console.log('📊 Scraped items by type:', {
                youtube: scrapedItems.filter((item: any) => item.type === 'youtube').length,
                webpage: scrapedItems.filter((item: any) => item.type === 'webpage').length,
                scraped: scrapedItems.filter((item: any) => item.type === 'scraped').length,
                other: scrapedItems.filter((item: any) => !['youtube', 'webpage', 'scraped'].includes(item.type)).length
              })
              
              // Update the media items state
              setMediaItems((prevItems: any[]) => {
                // Remove existing scraped items and add new ones
                const nonScrapedItems = prevItems.filter((item: any) => !item.id.startsWith('scraped-'))
                const updatedItems = [...nonScrapedItems, ...scrapedItems]
                console.log('📊 Total items after refresh:', updatedItems.length)
                console.log('📊 Non-scraped items:', nonScrapedItems.length)
                console.log('📊 Scraped items added:', scrapedItems.length)
                
                return [...updatedItems]
              })
            }
          } else {
            console.error('❌ Failed to refresh scraped contents:', response.status, response.statusText)
          }
        } catch (error) {
          console.error('❌ Error refreshing scraped contents:', error)
        }
      }
      
      console.log('✅ All tabs refreshed successfully')
      
    } catch (error) {
      console.error('❌ Error during comprehensive refresh:', error)
    } finally {
      setIsRefreshing(false)
      setIsLoadingTabContent(false)
      console.log('🔄 refreshAllTabs completed')
    }
  }

  // Start new conversation function
  const startNewConversation = () => {
    console.log('🔄 Starting new conversation...')
    setSessionId('') // Clear existing session
    setHasInitializedChat(false) // Reset initialization flag
    setChatStarted(false) // Reset chat state
    setMessages([]) // Clear messages
    setCurrentChatSession(null) // Clear current chat session
    updateCurrentChatSession(null) // Also clear sidebar context state
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chat_session_id')
      localStorage.removeItem('chat_started')
      localStorage.removeItem('chat_messages')
      
      // Clear URL parameter
      const url = new URL(window.location.href)
      url.searchParams.delete('chatid')
      window.history.replaceState({}, document.title, url.toString())
    }
    
    console.log('💡 Chat state cleared. User can now select agent and start chatting.')
  }

  // Load specific chat session
  const loadChatSession = async (sessionId: string) => {
    console.log('🔄 loadChatSession called with sessionId:', sessionId)
    console.log('📊 Current state before loading:', {
      currentChatSession,
      sessionId: sessionId,
      isLoadingChat
    })

    // Prevent multiple clicks
    if (isLoadingChat) {
      console.log('⚠️ Already loading chat, skipping...')
      return
    }

    setIsLoadingChat(true)

    try {
      // Set the session ID and current chat session immediately
      console.log('✅ Setting sessionId and currentChatSession to:', sessionId)
      setSessionId(sessionId)
      setCurrentChatSession(sessionId)
      
      // Also update the sidebar context state
      console.log('🔄 Syncing sidebar context currentChatSession to:', sessionId)
      updateCurrentChatSession(sessionId)
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('chat_session_id', sessionId)
      }
      
      // Mark chat as started
      setChatStarted(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem('chat_started', 'true')
      }
      
      // Load messages for this specific session
      await loadMessagesForSession(sessionId)
    } catch (error) {
      console.error('❌ Error loading chat session:', error)
    } finally {
      setIsLoadingChat(false)
    }
  }

  // Delete specific chat session
  const deleteChatSession = async (sessionId: string) => {
    console.log('🗑️ Deleting chat session:', sessionId)
    
    try {
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("❌ No access token available for deleting chat")
        showToast('Authentication required', 'error')
        return
      }

      console.log('🗑️ Sending delete request for session:', sessionId)
      
      const response = await fetch('/api/chat-delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId
        }),
      })

      console.log('📡 Delete response received:')
      console.log('  - Status:', response.status)
      console.log('  - Status text:', response.statusText)
      console.log('  - OK:', response.ok)

      if (!response.ok) {
        console.error('❌ Failed to delete chat. Status:', response.status)
        console.error('❌ Status text:', response.statusText)
        
        try {
          const errorData = await response.json()
          console.error('❌ Delete error details:', errorData)
        } catch (jsonError) {
          console.error('❌ Could not parse error response as JSON')
          try {
            const errorText = await response.text()
            console.error('❌ Error response text:', errorText)
          } catch (textError) {
            console.error('❌ Could not read error response text')
          }
        }
        
        showToast('Failed to delete chat session', 'error')
        return
      }

      console.log('✅ Response is OK, parsing JSON...')
      const data = await response.json()
      console.log('✅ Chat delete successful:')
      console.log('  - Data type:', typeof data)
      console.log('  - Data keys:', Object.keys(data))
      console.log('  - Success:', data.success)
      console.log('  - Message:', data.message)
      
      // Remove the chat from the chat history
      setChatHistory(prev => prev.filter(chat => chat.session_id !== sessionId))
      
      // If the deleted chat was the current one, clear the current session
      if (currentChatSession === sessionId) {
        setCurrentChatSession(null)
        updateCurrentChatSession(null)
        setSessionId('')
        setChatStarted(false)
        setMessages([])
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('chat_session_id')
          localStorage.removeItem('chat_started')
          localStorage.removeItem('chat_messages')
        }
      }
      
      // Auto-refresh chat history to ensure consistency with server
      console.log('🔄 Auto-refreshing chat history after deletion...')
      try {
        await fetchChatHistory()
        console.log('✅ Chat history refreshed successfully after deletion')
      } catch (refreshError) {
        console.error('❌ Error refreshing chat history after deletion:', refreshError)
        // Don't show error toast for refresh failure as deletion was successful
      }
      
      showToast('Chat session deleted successfully', 'success')
      console.log('✅ Chat session deleted:', sessionId)
      
    } catch (error) {
      console.error('❌ Error deleting chat session:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown'
      })
      
      showToast('Error deleting chat session', 'error')
    }
  }

  // Load messages for a specific chat session
  const loadMessagesForSession = async (sessionId: string) => {
    console.log('📚 Loading messages for session:', sessionId)
    
    try {
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("❌ No access token available for loading messages")
        return
      }

      console.log('📚 Fetching messages from API for session:', sessionId)
      
      const response = await fetch(`/api/chat-messages?session_id=${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 Chat messages response received:')
      console.log('  - Status:', response.status)
      console.log('  - Status text:', response.statusText)
      console.log('  - OK:', response.ok)

      if (!response.ok) {
        console.error('❌ Failed to fetch chat messages. Status:', response.status)
        console.error('❌ Status text:', response.statusText)
        
        try {
          const errorData = await response.json()
          console.error('❌ Chat messages error details:', errorData)
        } catch (jsonError) {
          console.error('❌ Could not parse error response as JSON')
          try {
            const errorText = await response.text()
            console.error('❌ Error response text:', errorText)
          } catch (textError) {
            console.error('❌ Could not read error response text')
          }
        }
        
        // Set empty messages on error
        setMessages([])
        if (typeof window !== 'undefined') {
          localStorage.setItem('chat_messages', JSON.stringify([]))
        }
        return
      }

      console.log('✅ Response is OK, parsing JSON...')
      const data = await response.json()
      console.log('✅ Chat messages fetched successfully:')
      console.log('  - Data type:', typeof data)
      console.log('  - Data keys:', Object.keys(data))
      console.log('  - Has messages property:', 'messages' in data)
      console.log('  - Messages type:', typeof data.messages)
      console.log('  - Messages is array:', Array.isArray(data.messages))
      if (Array.isArray(data.messages)) {
        console.log('  - Messages array length:', data.messages.length)
        console.log('  - First message:', data.messages[0])
      }
      
      // Process the messages data
      let messagesData: any[] = []
      
      if (Array.isArray(data.messages)) {
        // Direct messages array
        messagesData = data.messages
      } else if (data && Array.isArray(data.data)) {
        // Nested data array
        messagesData = data.data
      } else if (data && typeof data === 'object') {
        // Convert object with numeric keys to array
        const keys = Object.keys(data).filter(key => !isNaN(Number(key)))
        if (keys.length > 0) {
          messagesData = keys.map(key => data[key]).filter(Boolean)
        }
      }
      
      console.log('📚 Processed messages data:', messagesData)
      console.log('📚 Messages count:', messagesData.length)
      
      // Transform messages to match our interface
      const transformedMessages = messagesData.map((msg: any, index: number) => {
        console.log(`\n🔍 DEBUGGING MESSAGE ${index + 1}/${messagesData.length}:`)
        console.log('📝 Raw message object:', msg)
        console.log('📝 Message keys:', Object.keys(msg))
        console.log('📝 Message type:', typeof msg)
        
        // Map sender field to role field
        let role = 'assistant' // default
        if (msg.role) {
          role = msg.role
          console.log('👤 Role from msg.role:', role)
        } else if (msg.sender) {
          console.log('👤 Sender from msg.sender:', msg.sender)
          // Map API sender values to frontend role values
          if (msg.sender === 'human') {
            role = 'user'
          } else if (msg.sender === 'ai') {
            role = 'assistant'
          } else if (msg.sender === 'user') {
            role = 'user'
          } else if (msg.sender === 'assistant') {
            role = 'assistant'
          }
          console.log('👤 Mapped role:', role)
        } else {
          console.log('👤 No role/sender found, using default:', role)
        }
        
        const messageId = msg.message_id || msg.id || `session-${sessionId}-${index}`
        const content = msg.content || msg.message || msg.text || 'No content'
        const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        
        console.log('🆔 Message ID:', messageId)
        console.log('💬 Content length:', content.length)
        console.log('💬 Content preview:', content.substring(0, 100) + (content.length > 100 ? '...' : ''))
        console.log('⏰ Timestamp:', timestamp)
        console.log('⏰ Original timestamp:', msg.timestamp)
        
        const transformedMessage = {
          id: messageId,
          role: role as 'user' | 'assistant',
          content: content,
          timestamp: timestamp,
          originalTimestamp: msg.timestamp, // Keep original timestamp for sorting
          animated: false
        }
        
        console.log('✅ Transformed message:', transformedMessage)
        console.log('---')
        
        return transformedMessage
      })
      
      // Sort messages by timestamp to ensure proper chronological order
      const sortedMessages = transformedMessages.sort((a, b) => {
        // Use original timestamp for accurate sorting
        const timeA = new Date((a as any).originalTimestamp).getTime()
        const timeB = new Date((b as any).originalTimestamp).getTime()
        return timeA - timeB // Oldest first (chronological order)
      })
      
      console.log('🔄 Messages sorted by timestamp:')
      sortedMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.role} - ${msg.timestamp} - ${msg.content.substring(0, 50)}...`)
      })
      
      // Update messages state
      setMessages(sortedMessages)
      if (typeof window !== 'undefined') {
        localStorage.setItem('chat_messages', JSON.stringify(sortedMessages))
      }
      
      console.log('✅ Messages loaded for session:', sessionId)
      console.log('✅ Final sorted messages:', sortedMessages)
      
    } catch (error) {
      console.error('❌ Error loading messages for session:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown'
      })
      
      // Set empty messages on error
      setMessages([])
      if (typeof window !== 'undefined') {
        localStorage.setItem('chat_messages', JSON.stringify([]))
      }
    }
  }

  // Handle starting chat from initial interface
  const handleStartChatting = async () => {
    console.log('🚀 Starting chat with agent:', selectedAgent)
    
    setIsStartingChat(true)
    
    try {
    // Create new session for the selected agent
    const success = await initiateNewChat(true)
    
    if (success) {
      setChatStarted(true)
        
        // Set the current chat session to the newly created session
        if (sessionId) {
          setCurrentChatSession(sessionId)
          updateCurrentChatSession(sessionId)
          
          // Update URL with the new chat ID
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.set('chatid', sessionId)
            window.history.replaceState({}, document.title, url.toString())
          }
        }
        
        console.log('✅ Chat started successfully with session:', sessionId)
      
      // Check if there's a pending prompt from quick prompts
      if (typeof window !== 'undefined') {
        const pendingPrompt = localStorage.getItem('pending_prompt')
        if (pendingPrompt) {
          localStorage.removeItem('pending_prompt')
          // Send the pending prompt
          setTimeout(() => {
            handleSendMessage(pendingPrompt)
          }, 500)
        }
      }
    } else {
      console.error('❌ Failed to start chat')
        showToast('Failed to start chat. Please try again.', 'error')
      }
    } catch (error) {
      console.error('❌ Error starting chat:', error)
      showToast('Error starting chat. Please try again.', 'error')
    } finally {
      setIsStartingChat(false)
    }
  }

  // Start fresh dashboard function (clear everything)
  const startFreshDashboard = () => {
    console.log('🔄 Starting fresh dashboard...')
    setSessionId('') // Clear existing session
    setHasInitializedChat(false) // Reset initialization flag
    setChatStarted(false) // Reset chat state
    setMessages([]) // Clear messages
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chat_session_id')
      localStorage.removeItem('chat_started')
      localStorage.removeItem('chat_messages')
    }
    
    // Redirect to fresh dashboard
    window.location.href = '/dashboard?fresh=true'
  }

  // Empty conversations array
  const conversations: any[] = []

  // Get current user info from auth context
  const currentUser = user

  // Fetch agents and media library on component mount
  React.useEffect(() => {
    if (isAuthenticated && currentUser) {
      console.log('Dashboard mounted - fetching agents and media library...')
      
      // Check for access token before fetching
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        console.log('No access token available - redirecting to login page')
        // If we don't have an access token, clear authentication state and redirect to login
        logout()
        return
      }
      
      // Set a small delay to ensure token is properly loaded from storage
      setTimeout(async () => {
        fetchAgents()
        fetchMediaLibrary()
        // Fetch chat history on dashboard load
        await fetchChatHistory()
      }, 300)
    }
  }, [isAuthenticated, currentUser, logout])

  // Only restore existing chat session, don't create new ones automatically
  React.useEffect(() => {
    if (agents.length > 0 && !sessionId && isAuthenticated && !hasInitializedChat) {
      // Only restore existing session, don't create new one automatically
      if (chatStarted && messages.length > 0) {
        console.log('📱 Restoring existing chat session from localStorage')
        setHasInitializedChat(true)
      } else {
        console.log('🔄 Fresh dashboard - no webhook call needed until user starts chatting')
        setHasInitializedChat(true) // Mark as initialized to prevent future calls
      }
    }
  }, [agents, sessionId, isAuthenticated, hasInitializedChat, chatStarted, messages.length])

  // Reset initialization flag when session is cleared
  React.useEffect(() => {
    if (!sessionId) {
      setHasInitializedChat(false)
    }
  }, [sessionId])

  // Update URL when chat session changes
  React.useEffect(() => {
    if (typeof window !== 'undefined' && currentChatSession) {
      const url = new URL(window.location.href)
      url.searchParams.set('chatid', currentChatSession)
      window.history.replaceState({}, document.title, url.toString())
    } else if (typeof window !== 'undefined' && !currentChatSession) {
      const url = new URL(window.location.href)
      url.searchParams.delete('chatid')
      window.history.replaceState({}, document.title, url.toString())
    }
  }, [currentChatSession])

  // Load chat session from URL on page load
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !currentChatSession && !isStartingChat) {
      const urlParams = new URLSearchParams(window.location.search)
      const chatId = urlParams.get('chatid')
      if (chatId && chatHistory.length > 0) {
        const sessionExists = chatHistory.find(chat => chat.session_id === chatId)
        if (sessionExists) {
          loadChatSession(chatId)
        }
      }
    }
  }, [chatHistory, currentChatSession, isStartingChat])

  // Role-based routing check
  React.useEffect(() => {
    if (!loading && isAuthenticated && user) {
      console.log('🔐 Role-based routing check - User role:', user.role)
      
      // Redirect based on user role
      if (user.role === 'Superking') {
        console.log('👑 Admin user detected, redirecting to admin dashboard')
        window.location.href = '/admin'
        return
      } else if (user.role !== 'paid-user') {
        console.log('❌ Unauthorized role detected, redirecting to sign-in')
        window.location.href = '/auth/signin'
        return
      }
      
      console.log('✅ User authorized for dashboard access')
    }
  }, [isAuthenticated, loading, user])

  // Additional authentication check - if somehow we get here without being authenticated, redirect
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('🔒 Dashboard - User not authenticated, redirecting to sign-in')
      window.location.href = '/auth/signin'
    }
  }, [isAuthenticated, loading])



  // Handle new chat webhook - just get session ID
  const initiateNewChat = async (forceNew = false) => {
    try {
      console.log('🎯 ===== INITIATE NEW CHAT START =====')
      console.log('🎯 Force new:', forceNew)
      console.log('🎯 Current session ID:', sessionId || 'None')
      console.log('🎯 Chat started:', chatStarted)
      console.log('🎯 Messages count:', messages.length)
      console.log('🎯 Selected agent:', selectedAgent)
      console.log('🎯 Available agents:', agents.length)
      console.log('🎯 Media items count:', mediaItems.length)
      console.log('🎯 Selected media items:', selectedMediaItems.size)
      
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("No access token available")
        return false
      }

      // Don't create new session if one already exists and we're not forcing
      if (sessionId && !forceNew) {
        console.log('🎯 Session ID already exists, skipping new chat webhook:', sessionId)
        return true
      }

      // Don't create new session if chat is already active (has messages)
      if (chatStarted && messages.length > 0 && !forceNew) {
        console.log('🎯 Chat already active with messages, skipping new chat webhook')
        return true
      }

      // Find the selected agent's ID from the agents array
      const selectedAgentData = agents.find(agent => agent.name === selectedAgent)
      const agentId = selectedAgentData?.id || selectedAgent

      console.log('🎯 Initiating new chat to get session ID...')
      console.log('Request URL:', '/api/webhook/new-chat')
      console.log('Selected Agent Name:', selectedAgent)
      console.log('Selected Agent ID:', agentId)
      console.log('🎯 KNOWLEDGE BASE DATA BEING SENT:')
      console.log('  - Media items count:', mediaItems.length)
      console.log('  - Media items by type:', {
        pdf: mediaItems.filter(item => item.type === 'pdf').length,
        doc: mediaItems.filter(item => item.type === 'doc').length,
        txt: mediaItems.filter(item => item.type === 'txt').length,
        audio: mediaItems.filter(item => item.type === 'audio').length,
        video: mediaItems.filter(item => item.type === 'video').length,
        url: mediaItems.filter(item => item.type === 'url').length,
        transcript: mediaItems.filter(item => item.type === 'transcript').length,
        image: mediaItems.filter(item => item.type === 'image').length,
        scraped: mediaItems.filter(item => item.type === 'scraped').length,
        webpage: mediaItems.filter(item => item.type === 'webpage').length,
        youtube: mediaItems.filter(item => item.type === 'youtube').length
      })
      
      if (mediaItems.length > 0) {
        console.log('  - Media items details:')
        mediaItems.forEach((item, index) => {
          console.log(`    ${index + 1}. ${item.filename || item.title} (${item.type})`)
          console.log(`       ID: ${item.id}`)
          console.log(`       Content length: ${item.content ? item.content.length : 0}`)
          console.log(`       Transcript length: ${item.transcript ? item.transcript.length : 0}`)
        })
      }

      // Prepare knowledge base data for new chat
      const knowledgeBaseData = mediaItems.map(item => ({
        id: item.id,
        filename: item.filename || item.title,
        type: item.type,
        content: item.content,
        transcript: item.transcript,
        url: item.url,
        resource_id: item.resource_id
      }))

      console.log('🎯 SENDING KNOWLEDGE BASE TO NEW-CHAT WEBHOOK:')
      console.log('  - Knowledge base items count:', knowledgeBaseData.length)
      console.log('  - Items with content:', knowledgeBaseData.filter(item => item.content).length)
      console.log('  - Items with transcript:', knowledgeBaseData.filter(item => item.transcript).length)
      if (knowledgeBaseData.length > 0) {
        knowledgeBaseData.forEach((item, index) => {
          console.log(`    ${index + 1}. ${item.filename} (${item.type})`)
          console.log(`       Content length: ${item.content ? item.content.length : 0}`)
          console.log(`       Transcript length: ${item.transcript ? item.transcript.length : 0}`)
        })
      }

      const response = await fetch('/api/webhook/new-chat', {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({
          agent_id: agentId,
          knowledge_base: knowledgeBaseData.length > 0 ? knowledgeBaseData : undefined
        }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      console.log('New chat webhook response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      if (!response.ok) {
        console.error('Failed to initiate new chat. Status:', response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error details:', errorData)
        
        // If webhook is not registered (404), create a fallback session ID
        if (response.status === 404) {
          console.log('⚠️ Webhook not registered, creating fallback session ID')
          const fallbackSessionId = `fallback_${Date.now()}`
          setSessionId(fallbackSessionId)
          console.log('🎯 FALLBACK SESSION ID STORED:', fallbackSessionId)
          return true
        }
        
        return false
      }

      const data = await response.json()
      console.log('✅ New chat webhook success:', data)
      
      // Store session ID from webhook response
      let finalSessionId = sessionId
      if (data.session_id) {
        setSessionId(data.session_id)
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('chat_session_id', data.session_id)
        }
        console.log('🎯 SESSION ID STORED:', data.session_id)
        console.log('📋 Full webhook response:', data)
        finalSessionId = data.session_id
      } else {
        console.warn('⚠️ No session_id in webhook response')
        console.log('📋 Full webhook response:', data)
        // Create a fallback session ID
        const fallbackSessionId = `fallback_${Date.now()}`
        setSessionId(fallbackSessionId)
        if (typeof window !== 'undefined') {
          localStorage.setItem('chat_session_id', fallbackSessionId)
        }
        console.log('🎯 FALLBACK SESSION ID STORED:', fallbackSessionId)
        finalSessionId = fallbackSessionId
      }
      
      // Fetch chat history when new chat is initiated
      console.log('📚 Fetching chat history for new chat...')
      await fetchChatHistory()
      
      console.log('🎯 ===== INITIATE NEW CHAT END (SUCCESS) =====')
      return finalSessionId
    } catch (error) {
      console.error('Error initiating new chat:', error)
      console.log('🎯 ===== INITIATE NEW CHAT END (ERROR) =====')
      return false
    }
  }

  // Fetch chat history from n8n webhook with retry mechanism
  const fetchChatHistory = async (retryCount = 0) => {
    console.log('=== FETCH CHAT HISTORY CLIENT START ===')
    console.log('Timestamp:', new Date().toISOString())
    
    try {
      setIsLoadingChatHistory(true)
      updateIsLoadingChatHistory(true)
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("❌ No access token available for chat history")
        console.log('=== FETCH CHAT HISTORY CLIENT END (NO TOKEN) ===')
        return null
      }

      console.log('🔐 Access token available, length:', accessToken.length)
      console.log('📚 Fetching chat history from /api/chat-history...')
      
      const response = await fetch('/api/chat-history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      console.log('📡 Chat history response received:')
      console.log('  - Status:', response.status)
      console.log('  - Status text:', response.statusText)
      console.log('  - OK:', response.ok)
      console.log('  - Headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        console.error('❌ Failed to fetch chat history. Status:', response.status)
        console.error('❌ Status text:', response.statusText)
        
        try {
          const errorData = await response.json()
          console.error('❌ Chat history error details:', errorData)
        } catch (jsonError) {
          console.error('❌ Could not parse error response as JSON')
          try {
            const errorText = await response.text()
            console.error('❌ Error response text:', errorText)
          } catch (textError) {
            console.error('❌ Could not read error response text')
          }
        }
        
        console.log('=== FETCH CHAT HISTORY CLIENT END (ERROR) ===')
        return null
      }

      console.log('✅ Response is OK, parsing JSON...')
      const data = await response.json()
      console.log('✅ Chat history fetched successfully:')
      console.log('  - Data type:', typeof data)
      console.log('  - Data keys:', Object.keys(data))
      console.log('  - Has data property:', 'data' in data)
      if ('data' in data && Array.isArray(data.data)) {
        console.log('  - Data array length:', data.data.length)
        console.log('  - First item:', data.data[0])
      }
      
      // Process the chat history data
      let chatHistoryData: any[] = []
      
      // Handle different response formats
      if (Array.isArray(data)) {
        // Direct array response
        chatHistoryData = data
      } else if (data && Array.isArray(data.data)) {
        // Nested data array
        chatHistoryData = data.data
      } else if (data && typeof data === 'object') {
        // Convert object with numeric keys to array
        const keys = Object.keys(data).filter(key => !isNaN(Number(key)))
        if (keys.length > 0) {
          chatHistoryData = keys.map(key => data[key]).filter(Boolean)
        }
      }
      
      console.log('📚 Processed chat history data:', chatHistoryData)
      console.log('📚 Chat history count:', chatHistoryData.length)
      
      // Sort chat history by creation date (newest first)
      chatHistoryData.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateB - dateA // Newest first
      })
      
      console.log('📚 Sorted chat history (newest first):', chatHistoryData)
      console.log('🎯 Current chat session after fetch:', currentChatSession)

      // Check if current chat session exists in the loaded data
      const currentSessionExists = chatHistoryData.some((chat: any) => chat.session_id === currentChatSession)
      console.log('✅ Current session exists in loaded data:', currentSessionExists)

      // Update chat history state
      setChatHistory(chatHistoryData)
      updateChatHistory(chatHistoryData)
      
      // Sync current chat session with sidebar context
      if (currentChatSession) {
        updateCurrentChatSession(currentChatSession)
      }
      
      // Set current chat session if none is set and we have history
      // Only auto-select if no current session AND no URL parameter
      if (!currentChatSession && chatHistoryData.length > 0) {
        const urlParams = new URLSearchParams(window.location.search)
        const chatIdFromUrl = urlParams.get('chatid')
        
        if (!chatIdFromUrl) {
          const latestSession = chatHistoryData[0] // Assuming newest first
          setCurrentChatSession(latestSession.session_id)
          updateCurrentChatSession(latestSession.session_id)
          console.log('🎯 Set current chat session to latest:', latestSession.session_id)
        } else {
          console.log('🎯 URL has chatid parameter, not auto-selecting latest session')
        }
      }
      
      console.log('=== FETCH CHAT HISTORY CLIENT END (SUCCESS) ===')
      return data
    } catch (error) {
      console.error('❌ Error fetching chat history:')
      console.error('  - Error:', error)
      console.error('  - Error message:', error instanceof Error ? error.message : 'Unknown error')
      console.error('  - Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      
      // Handle specific error types and retry logic
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('❌ Request timed out after 10 seconds')
          if (retryCount < 2) {
            console.log(`🔄 Retrying chat history fetch (attempt ${retryCount + 1}/2)...`)
            setTimeout(() => fetchChatHistory(retryCount + 1), 2000) // Retry after 2 seconds
            return null
          }
          showToast('Chat history request timed out. Please try again.', 'error')
        } else if (error.message.includes('Failed to fetch')) {
          console.error('❌ Network error - unable to reach the server')
          console.error('❌ This could be due to:')
          console.error('  - Network connectivity issues')
          console.error('  - n8n webhook server being down')
          console.error('  - CORS issues')
          console.error('  - Firewall blocking the request')
          
          if (retryCount < 2) {
            console.log(`🔄 Retrying chat history fetch (attempt ${retryCount + 1}/2)...`)
            setTimeout(() => fetchChatHistory(retryCount + 1), 2000) // Retry after 2 seconds
            return null
          }
          showToast('Unable to load chat history. Please check your connection and try again.', 'error')
        } else {
          showToast('Failed to load chat history. Please try again.', 'error')
        }
      } else {
        showToast('An unexpected error occurred while loading chat history.', 'error')
      }
      
      // Return empty chat history instead of null to prevent UI errors
      console.log('🔄 Returning empty chat history due to error')
      setChatHistory([])
      updateChatHistory([])
      
      console.log('=== FETCH CHAT HISTORY CLIENT END (EXCEPTION) ===')
      return null
    } finally {
      setIsLoadingChatHistory(false)
      updateIsLoadingChatHistory(false)
    }
  }

  // Set up action refs for sidebar
  React.useEffect(() => {
    setActionRefs({
      onSelectAgent: handleSelectAgent,
      onRefreshAgents: refreshAgents,
      onLoadChatSession: loadChatSession,
      onRefreshChatHistory: fetchChatHistory,
      onDeleteChatSession: deleteChatSession,
      onStartNewChat: () => {
        setChatStarted(false)
        setMessages([])
        setSessionId('')
        if (typeof window !== 'undefined') {
          localStorage.removeItem('chat_session_id')
          localStorage.removeItem('chat_started')
          localStorage.removeItem('chat_messages')
        }
      }
    })
  }, [setActionRefs, handleSelectAgent, refreshAgents, loadChatSession, fetchChatHistory, deleteChatSession])

  // Send message to chat window webhook
  const sendMessageToChatWindow = async (userPrompt: string, isFirstMessage: boolean = false, sessionIdParam?: string) => {
    try {
      console.log('🌐 ===== SEND MESSAGE TO CHAT WINDOW START =====')
      console.log('🌐 Is First Message:', isFirstMessage)
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("No access token available")
        return null
      }

      const currentSessionId = sessionIdParam || sessionId
      if (!currentSessionId) {
        console.error("No session ID available")
        return null
      }

      // Find the selected agent's ID from the agents array
      const selectedAgentData = agents.find(agent => agent.name === selectedAgent)
      const agentId = selectedAgentData?.id || selectedAgent

      console.log('💬 Sending message to chat window...')
      console.log('Request URL:', '/api/webhook/chat-window')
      console.log('Session ID:', currentSessionId)
      console.log('User Prompt:', userPrompt)
      console.log('Selected Agent Name:', selectedAgent)
      console.log('Selected Agent ID:', agentId)
      
      // Log what context is being sent
      console.log('📊 CONTEXT BEING SENT TO CHAT:')
      console.log('  - Session ID:', currentSessionId)
      console.log('  - User Prompt:', userPrompt)
      console.log('  - Agent ID:', agentId)
      console.log('  - Selected Media Items Count:', selectedMediaItems.size)
      
      if (selectedMediaItems.size > 0) {
        console.log('  - Selected Media Items:')
        selectedMediaItems.forEach(itemId => {
          const item = mediaItems.find(m => m.id === itemId)
          if (item) {
            console.log(`    * ${item.filename || item.title} (${item.type})`)
            console.log(`      ID: ${itemId}`)
            if (item.content) {
              console.log(`      Content length: ${item.content.length} chars`)
            }
            if (item.transcript) {
              console.log(`      Transcript length: ${item.transcript.length} chars`)
            }
          }
        })
      } else {
        console.log('  - No media items selected for context')
      }

      // Prepare scraped content for direct message passing
      interface ScrapedContentItem {
        id: string;
        filename: string;
        type: string;
        content?: string;
        transcript?: string;
        url?: string;
      }
      const scrapedContentForMessage: ScrapedContentItem[] = []
      if (selectedMediaItems.size > 0) {
        selectedMediaItems.forEach(itemId => {
          const item = mediaItems.find(m => m.id === itemId)
          if (item && ((item.content && item.resource_id) || item.type === 'scraped' || item.id.startsWith('scraped-'))) {
            scrapedContentForMessage.push({
              id: item.id,
              filename: item.filename || item.title,
              type: item.type,
              content: item.content,
              transcript: item.transcript,
              url: item.url
            })
          }
        })
      }

      console.log('📄 ===== SCRAPED CONTENT ANALYSIS =====')
      console.log('📄 Selected media items count:', selectedMediaItems.size)
      console.log('📄 Selected media items:', Array.from(selectedMediaItems))
      console.log('📄 Available media items:', mediaItems.map(item => ({
        id: item.id,
        filename: item.filename,
        type: item.type,
        hasContent: !!item.content,
        hasResourceId: !!item.resource_id
      })))
      
      console.log('📄 Scraped content being sent with message:', scrapedContentForMessage.length, 'items')
      if (scrapedContentForMessage.length > 0) {
        scrapedContentForMessage.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.filename} (${item.type})`)
          console.log(`     Content length: ${item.content ? item.content.length : 0}`)
          console.log(`     Transcript length: ${item.transcript ? item.transcript.length : 0}`)
        })
      } else {
        console.log('📄 No scraped content found - checking why...')
        selectedMediaItems.forEach(itemId => {
          const item = mediaItems.find(m => m.id === itemId)
          if (item) {
            console.log(`📄 Item ${itemId} (${item.filename}):`)
            console.log(`  - Type: ${item.type}`)
            console.log(`  - Has content: ${!!item.content}`)
            console.log(`  - Has resource_id: ${!!item.resource_id}`)
            console.log(`  - Content length: ${item.content ? item.content.length : 0}`)
            console.log(`  - Resource ID: ${item.resource_id || 'N/A'}`)
            console.log(`  - Would be scraped: ${!!((item.content && item.resource_id) || item.type === 'scraped' || item.id.startsWith('scraped-'))}`)
          } else {
            console.log(`📄 Item ${itemId}: NOT FOUND in mediaItems`)
          }
        })
      }
      console.log('📄 ===== END SCRAPED CONTENT ANALYSIS =====')

      // Prepare knowledge base data for every message
      let knowledgeBaseForMessage: ScrapedContentItem[] = []
      console.log('📚 ===== FETCHING KNOWLEDGE BASE FOR MESSAGE =====')
      try {
        // Fetch knowledge base data from n8n webhook
        const kbResponse = await fetch('/api/webhook/see-knowledge-base', {
          method: 'GET',
          headers: getAuthHeaders(accessToken),
          signal: AbortSignal.timeout(10000), // 10 second timeout
        })
        
        if (kbResponse.ok) {
          const kbData = await kbResponse.json()
          console.log('📚 Knowledge base API response:', kbData)
          
          // Extract knowledge base items from the response
          if (kbData && Array.isArray(kbData)) {
            knowledgeBaseForMessage = kbData.map((item: any) => ({
              id: item.id || item.resource_id || `kb-${Math.random()}`,
              filename: item.filename || item.resource_name || item.title || 'Unknown',
              type: item.type || 'document',
              content: item.content,
              transcript: item.transcript,
              url: item.url
            }))
          } else if (kbData && kbData.data && Array.isArray(kbData.data)) {
            knowledgeBaseForMessage = kbData.data.map((item: any) => ({
              id: item.id || item.resource_id || `kb-${Math.random()}`,
              filename: item.filename || item.resource_name || item.title || 'Unknown',
              type: item.type || 'document',
              content: item.content,
              transcript: item.transcript,
              url: item.url
            }))
          }
          
          console.log('📚 Knowledge base items fetched:', knowledgeBaseForMessage.length)
          if (knowledgeBaseForMessage.length > 0) {
            knowledgeBaseForMessage.forEach((item, index) => {
              console.log(`  ${index + 1}. ${item.filename} (${item.type})`)
              console.log(`     Content length: ${item.content ? item.content.length : 0}`)
              console.log(`     Transcript length: ${item.transcript ? item.transcript.length : 0}`)
            })
          } else {
            console.log('📚 No knowledge base items found in API response')
          }
        } else {
          console.error('📚 Failed to fetch knowledge base:', kbResponse.status, kbResponse.statusText)
        }
      } catch (error) {
        console.error('📚 Error fetching knowledge base:', error)
      }
      console.log('📚 ===== END KNOWLEDGE BASE FOR MESSAGE =====')

      // Enhance user prompt with scraped content context if available
      let enhancedUserPrompt = userPrompt
      if (scrapedContentForMessage.length > 0) {
        const contentContext = scrapedContentForMessage.map(item => {
          let context = `\n\n--- ${item.filename} (${item.type}) ---\n`
          if (item.content) {
            context += item.content
          }
          if (item.transcript) {
            context += `\n\nTranscript: ${item.transcript}`
          }
          if (item.url) {
            context += `\n\nSource URL: ${item.url}`
          }
          return context
        }).join('\n')
        
        enhancedUserPrompt = `${userPrompt}\n\nPlease refer to the following attached content for context:${contentContext}`
        console.log('📝 Enhanced user prompt with scraped content context')
        console.log('📝 Original prompt length:', userPrompt.length)
        console.log('📝 Enhanced prompt length:', enhancedUserPrompt.length)
      }

      const requestPayload = {
        session_id: currentSessionId,
        user_prompt: enhancedUserPrompt,
        agent_id: agentId,
        scraped_content: scrapedContentForMessage.length > 0 ? scrapedContentForMessage : undefined,
        knowledge_base: knowledgeBaseForMessage.length > 0 ? knowledgeBaseForMessage : undefined
      }
      
      console.log('📤 ===== REQUEST PAYLOAD TO N8N =====')
      console.log('📤 Full payload:', JSON.stringify(requestPayload, null, 2))
      console.log('📤 Scraped content included:', !!requestPayload.scraped_content)
      console.log('📤 Knowledge base included:', !!requestPayload.knowledge_base)
      if (requestPayload.scraped_content) {
        console.log('📤 Scraped content count:', requestPayload.scraped_content.length)
        requestPayload.scraped_content.forEach((item, index) => {
          console.log(`📤   ${index + 1}. ${item.filename} - Content: ${item.content ? item.content.substring(0, 100) + '...' : 'No content'}`)
        })
      }
      if (requestPayload.knowledge_base) {
        console.log('📤 Knowledge base count:', requestPayload.knowledge_base.length)
        requestPayload.knowledge_base.forEach((item, index) => {
          console.log(`📤   ${index + 1}. ${item.filename} - Content: ${item.content ? item.content.substring(0, 100) + '...' : 'No content'}`)
        })
      }
      console.log('📤 ===== END REQUEST PAYLOAD =====')

      const response = await fetch('/api/webhook/chat-window', {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify(requestPayload),
        signal: AbortSignal.timeout(30000), // 30 second timeout for chat
      })

      console.log('Chat window webhook response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      if (!response.ok) {
        console.error('Failed to send message to chat window. Status:', response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error details:', errorData)
        
        // If webhook is not registered (404), return a fallback response
        if (response.status === 404) {
          console.log('⚠️ Chat window webhook not registered, returning fallback response')
          return {
            response: "I'm currently in test mode. The webhook needs to be activated in n8n. Please click 'Execute workflow' in your n8n canvas to activate the webhook.",
            fallback: true
          }
        }
        
        return null
      }

      const data = await response.json()
      console.log('✅ Chat window webhook success:', data)
      console.log('🌐 ===== SEND MESSAGE TO CHAT WINDOW END =====')
      return data
    } catch (error) {
      console.error('Error sending message to chat window:', error)
      console.log('🌐 ===== SEND MESSAGE TO CHAT WINDOW END (ERROR) =====')
      return null
    }
  }

  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentUser) return

    console.log('🚀 ===== CHAT MESSAGE FLOW START =====')
    console.log('📝 User message content:', content.trim())
    console.log('👤 Current user:', currentUser?.email || 'Unknown')
    console.log('🤖 Selected agent:', selectedAgent)
    console.log('🆔 Session ID:', sessionId || 'Not set')
    console.log('💬 Chat started:', chatStarted)
    console.log('📊 Current messages count:', messages.length)
    console.log('📎 Selected media items count:', selectedMediaItems.size)
    console.log('📎 Selected media items:', Array.from(selectedMediaItems))
    
    // Log selected media details
    if (selectedMediaItems.size > 0) {
      console.log('📎 Selected media details:')
      selectedMediaItems.forEach(itemId => {
        const item = mediaItems.find(m => m.id === itemId)
        if (item) {
          console.log(`  - ${item.filename || item.title} (${item.type}) - ID: ${itemId}`)
          if (item.content) {
            console.log(`    Content preview: ${item.content.substring(0, 100)}...`)
          }
          if (item.transcript) {
            console.log(`    Transcript preview: ${item.transcript.substring(0, 100)}...`)
          }
        }
      })
    }

    // Mark chat as started on first message
    let currentSessionId = sessionId
    if (!chatStarted) {
      console.log('🎯 FIRST MESSAGE - Initializing chat session...')
      setChatStarted(true)
      // Save chat state to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('chat_started', 'true')
      }
      
      // Call webhook to get session ID only when user actually starts chatting
      if (!sessionId) {
        console.log('🎯 User started first conversation - calling new chat webhook...')
        const newSessionId = await initiateNewChat()
        if (newSessionId && typeof newSessionId === 'string') {
          currentSessionId = newSessionId
          console.log('🎯 New session ID obtained:', newSessionId)
        } else {
          console.warn('New chat webhook failed, but continuing with conversation')
        }
      } else {
        console.log('🎯 Using existing session ID for new conversation:', sessionId)
      }
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      animated: false
    }

    // Add user message to chat
    setMessages(prev => {
      const newMessages = [...prev, userMessage]
      // Save messages to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('chat_messages', JSON.stringify(newMessages))
        console.log('💾 Saved user message to localStorage:', userMessage.role, userMessage.content.substring(0, 50))
      }
      return newMessages
    })
    setIsLoading(true)

    try {
      // Send message to chat window webhook
      console.log('💬 Sending message with Session ID:', currentSessionId || 'new-session')
      console.log('📤 About to call sendMessageToChatWindow with content:', content.trim())
      const isFirstMessage = !chatStarted
      const response = await sendMessageToChatWindow(content.trim(), isFirstMessage, currentSessionId)
      console.log('📥 Response received from sendMessageToChatWindow:', response)

      if (response) {
        // Add AI response to chat
        let content = 'I received your message but couldn\'t generate a response.';
        
        // Handle different response formats from chat window webhook
        if (response.fallback) {
          content = response.response;
        } else if (response.empty_response) {
          content = response.response;
        } else if (response.raw_response) {
          content = response.response;
        } else if (response.response) {
          content = response.response;
        } else if (response.content) {
          content = response.content;
        } else if (response.message) {
          content = response.message;
        } else if (response.ai_response) {
          content = response.ai_response;
        } else if (response.pageContent) {
          // Handle n8n response with pageContent field (direct response)
          const pageContent = response.pageContent;
          // Extract AI response from the conversation format
          if (pageContent.includes('ai :')) {
            const aiResponse = pageContent.split('ai :')[1]?.trim();
            content = aiResponse || pageContent;
          } else {
            content = pageContent;
          }
        } else if (response.data?.response) {
          content = response.data.response;
        } else if (response.data?.content) {
          content = response.data.content;
        } else if (response.data?.pageContent) {
          // Handle n8n response with pageContent field (nested in data)
          const pageContent = response.data.pageContent;
          // Extract AI response from the conversation format
          if (pageContent.includes('ai :')) {
            const aiResponse = pageContent.split('ai :')[1]?.trim();
            content = aiResponse || pageContent;
          } else {
            content = pageContent;
          }
        }
        
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: content,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          animated: false
        }
        
        console.log('🤖 AI Response processed:')
        console.log('  - Message ID:', aiMessage.id)
        console.log('  - Content length:', content.length)
        console.log('  - Content preview:', content.substring(0, 200) + (content.length > 200 ? '...' : ''))
        
        setMessages(prev => {
          const newMessages = [...prev, aiMessage]
          // Save messages to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('chat_messages', JSON.stringify(newMessages))
            console.log('💾 Saved AI message to localStorage:', aiMessage.role, aiMessage.content.substring(0, 50))
          }
          return newMessages
        })
      } else {
        // Add error message
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: `Error: Failed to send message to chat window`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          animated: false
        }
        setMessages(prev => {
          const newMessages = [...prev, errorMessage]
          // Save messages to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('chat_messages', JSON.stringify(newMessages))
          }
          return newMessages
        })
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        animated: false
      }
      setMessages(prev => {
        const newMessages = [...prev, errorMessage]
        // Save messages to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('chat_messages', JSON.stringify(newMessages))
        }
        return newMessages
      })
    } finally {
      // Clear scraped content from selection after sending message
      if (selectedMediaItems.size > 0) {
        const scrapedItemsToRemove = new Set<string>()
        selectedMediaItems.forEach(itemId => {
          const item = mediaItems.find(m => m.id === itemId)
          if (item && ((item.content && item.resource_id) || item.type === 'scraped' || item.id.startsWith('scraped-'))) {
            scrapedItemsToRemove.add(itemId)
          }
        })
        
        if (scrapedItemsToRemove.size > 0) {
          console.log('🧹 Clearing scraped content from selection after message sent:', scrapedItemsToRemove.size, 'items')
          setSelectedMediaItems(prev => {
            const newSet = new Set(prev)
            scrapedItemsToRemove.forEach(itemId => newSet.delete(itemId))
            return newSet
          })
        }
      }
      
      setIsLoading(false)
      console.log('🏁 ===== CHAT MESSAGE FLOW END =====')
    }
  }

  // Fetch media library data
  const fetchMediaLibrary = async () => {
    try {
      console.log('📚 ===== FETCH MEDIA LIBRARY START =====')
      console.log('📊 Current mediaItems before fetch:', mediaItems.length)
      console.log('📊 Current mediaItems types:', mediaItems.map(item => item.type))
      console.log('📊 Current mediaItems details:', mediaItems.map(item => ({
        id: item.id,
        filename: item.filename || item.title,
        type: item.type,
        hasContent: !!item.content,
        hasTranscript: !!item.transcript
      })))
      
      setIsRefreshing(true)
      setIsLoadingMedia(true)
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("No access token available")
        setMediaItems([]) // Set empty media items
        return
      }

      console.log('🔍 Fetching media library from: /api/media/list (proxied to n8n)')
      console.log('🔍 Access token:', accessToken ? 'Present' : 'Missing')
      console.log('🔍 Session ID:', sessionId || 'Not set')

      // Fetch both media library and scraped contents
      console.log('📡 Making parallel requests to:')
      console.log('  - /api/media/list (media library)')
      console.log('  - /api/scraped-contents (scraped content)')
      
      const [mediaResponse, scrapedResponse] = await Promise.all([
        fetch('/api/media/list', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('/api/scraped-contents', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }).catch(err => {
          console.log('Could not fetch scraped contents:', err)
          return null
        })
      ])

      const response = mediaResponse

      console.log('📡 Media Library Response:')
      console.log('  - Status:', response.status, response.statusText)
      console.log('  - OK:', response.ok)
      
      console.log('📡 Scraped Contents Response:')
      console.log('  - Status:', scrapedResponse?.status || 'No response')
      console.log('  - OK:', scrapedResponse?.ok || false)
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized - token may be expired")
          return
        }
        if (response.status === 404) {
          console.log("No media items found (404) - setting empty array")
          setMediaItems([])
          setIsLoadingMedia(false)
          setIsRefreshing(false)
          return
        }
        console.error('🔍 Response not OK:', response.status, response.statusText)
        const errorText = await response.text().catch(() => 'Unable to read error response')
        console.error('🔍 Error response body:', errorText)
        throw new Error(`Failed to fetch media library: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('📊 Media library API response:', result)
      console.log('📊 Media response type:', typeof result)
      console.log('📊 Media response is array:', Array.isArray(result))
      
      // Extract the data array from the response
      const data = result.data || result
      console.log('📊 Extracted data:', data)
      console.log('📊 Extracted data type:', typeof data)
      console.log('📊 Extracted data is array:', Array.isArray(data))
      console.log('📊 Extracted data length:', Array.isArray(data) ? data.length : 'N/A')
      
      // Handle case where data might be empty or null
      if (!data || !Array.isArray(data)) {
        console.log('No valid data received, setting empty array')
        setMediaItems([])
        setIsLoadingMedia(false)
        setIsRefreshing(false)
        return
      }
      
      // Get scraped content data
      let scrapedItems: any[] = []
      if (scrapedResponse && scrapedResponse.ok) {
        try {
          const scrapedData = await scrapedResponse.json()
          console.log('📊 Scraped content data:', scrapedData)
          console.log('📊 Scraped data type:', typeof scrapedData)
          console.log('📊 Scraped data is array:', Array.isArray(scrapedData))
          if (scrapedData && scrapedData.data && Array.isArray(scrapedData.data)) {
            scrapedItems = scrapedData.data
            console.log('📊 Found scraped items:', scrapedItems.length)
            console.log('📊 Scraped items details:', scrapedItems.map(item => ({
              resource_id: item.resource_id,
              resource_name: item.resource_name,
              type: item.type,
              content_length: item.content ? item.content.length : 0
            })))
          }
        } catch (err) {
          console.log('Error parsing scraped content:', err)
        }
      }

      // Transform the API response to match our MediaItem interface
      console.log('🔄 Transforming media items...')
      const transformedItems = data.map((item: any) => {
        // Find matching scraped content by filename
        const matchingScraped = scrapedItems.find(scraped => 
          scraped.resource_name === (item.file_name || item.filename || item.name)
        )
        
        console.log(`🔄 Processing item: ${item.file_name || item.filename || item.name}`)
        console.log(`  - Media ID: ${item.media_id}`)
        console.log(`  - File type: ${item.file_type}`)
        console.log(`  - Has matching scraped content: ${!!matchingScraped}`)
        if (matchingScraped) {
          console.log(`  - Scraped content length: ${matchingScraped.content ? matchingScraped.content.length : 0}`)
        }
        
        return {
          id: item.media_id?.toString() || item.id?.toString() || `item-${Math.random()}`,
          userId: 'current_user',
          filename: item.file_name || item.filename || item.name || 'Unknown file',
          type: getFileType(item.file_type || item.file_name || item.filename),
          size: parseFloat(item.media_size || item.size || 0) * 1024, // Convert KB to bytes
          uploadedAt: item.timestamp ? new Date(item.timestamp) : new Date(),
          tags: [],
          // Add content from scraped data if available
          content: matchingScraped?.content || undefined,
          resource_id: matchingScraped?.resource_id || undefined,
          created_at: matchingScraped?.created_at || item.timestamp,
          metadata: {
            storageStatus: item.storage_status || 'unknown',
            // Only include essential metadata, exclude drive_link, media_drive_id, owner
            fileType: item.file_type,
            originalSize: item.media_size
          }
        }
      })

      // Skip creating sample_content_ entries - scraped content will not be displayed as media items
      const scrapedItemsTransformed: any[] = []

      // Only use regular media items (no scraped content items)
      const allTransformedItems = [...transformedItems]

      console.log('Transformed media items:', transformedItems.length)
      console.log('Transformed scraped items:', scrapedItemsTransformed.length)
      console.log('Total items:', allTransformedItems.length)
      console.log('📊 Items with content:', allTransformedItems.filter(item => item.content).length)
      console.log('📊 File items to display:', allTransformedItems.filter(item => ['pdf', 'doc', 'txt', 'audio', 'video', 'image'].includes(item.type)))
      console.log('📊 YouTube items:', allTransformedItems.filter(item => item.type === 'youtube').length)
      console.log('📊 Transcript items:', allTransformedItems.filter(item => item.type === 'transcript').length)
      console.log('📊 Image items:', allTransformedItems.filter(item => item.type === 'image').length)
      
      // Preserve locally created items (like YouTube transcripts) that might not be on the server
      setMediaItems(prevItems => {
        const serverItems = allTransformedItems
        const localItems = prevItems.filter(item => 
          item.type === 'youtube' || item.type === 'transcript' || item.type === 'scraped' || 
          item.type === 'webpage' || item.type === 'url' || item.type === 'image'
        )
        
        console.log('🔄 MERGING PROCESS:')
        console.log('📊 Server items count:', serverItems.length)
        console.log('📊 Server items types:', serverItems.map(item => item.type))
        console.log('📊 Local items count:', localItems.length)
        console.log('📊 Local items types:', localItems.map(item => item.type))
        console.log('📊 Local items details:', localItems.map(item => ({
          id: item.id,
          type: item.type,
          filename: item.filename,
          title: item.title
        })))
        
        // Merge server items with local items, avoiding duplicates
        // Use filename as the primary key for deduplication since IDs might differ
        const mergedItems = [...serverItems]
        localItems.forEach(localItem => {
          // Check if local item exists in server items by filename (more reliable than ID)
          const existsInServer = serverItems.find(serverItem => 
            serverItem.filename === localItem.filename && 
            serverItem.type === localItem.type
          )
          
          if (!existsInServer) {
            console.log('➕ Adding local item to merged list:', {
              id: localItem.id,
              type: localItem.type,
              filename: localItem.filename
            })
            mergedItems.push(localItem)
          } else {
            console.log('⚠️ Local item already exists in server items (deduplicated by filename):', {
              id: localItem.id,
              type: localItem.type,
              filename: localItem.filename
            })
          }
        })
        
        console.log('📊 Final merged items count:', mergedItems.length)
        console.log('📊 Final merged items types:', mergedItems.map(item => item.type))
        console.log('📊 Final merged items by type:', {
          youtube: mergedItems.filter(item => item.type === 'youtube').length,
          transcript: mergedItems.filter(item => item.type === 'transcript').length,
          scraped: mergedItems.filter(item => item.type === 'scraped').length,
          audio: mergedItems.filter(item => item.type === 'audio').length,
          video: mergedItems.filter(item => item.type === 'video').length,
          image: mergedItems.filter(item => item.type === 'image').length,
          file: mergedItems.filter(item => ['pdf', 'doc', 'txt'].includes(item.type)).length,
          url: mergedItems.filter(item => item.type === 'url').length
        })
        
        return mergedItems
      })

      // Always fetch scraped contents for all tabs to ensure complete refresh
      console.log('🔄 Fetching scraped contents for all tabs...')
      await fetchScrapedContentsForTab()
    } catch (error) {
      console.error('❌ Error fetching media library:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown'
      })
      
      // Check if it's a 404 error (n8n webhook not found)
      if (error instanceof Error && error.message.includes('404')) {
        console.log('🔄 n8n webhook not found - this is expected if the webhook is not set up yet')
      }
      
      // Set empty array on error to prevent UI issues
      setMediaItems([])
    } finally {
      setIsRefreshing(false)
      setIsLoadingMedia(false)
      console.log('📚 ===== FETCH MEDIA LIBRARY END =====')
    }
  }

  const getFileType = (fileType: string | null): any => {
    if (!fileType) return 'doc'
    
    // Handle specific file types from the API
    if (fileType === 'pdf') return 'pdf'
    if (fileType === 'image') return 'image'
    if (fileType === 'video') return 'video'
    if (fileType === 'audio') return 'audio'
    if (fileType === 'youtube') return 'youtube'
    if (fileType === 'transcript') return 'transcript'
    if (fileType === 'scraped') return 'scraped'
    if (fileType === 'url') return 'url'
    
    // Handle MIME types
    if (fileType.startsWith('image/')) return 'image'
    if (fileType.startsWith('video/')) return 'video'
    if (fileType.startsWith('audio/')) return 'audio'
    
    // Handle file extensions
    if (fileType.includes('pdf')) return 'pdf'
    if (fileType.includes('doc')) return 'doc'
    if (fileType.includes('txt')) return 'txt'
    if (fileType.includes('png') || fileType.includes('jpg') || fileType.includes('jpeg') || fileType.includes('gif')) return 'image'
    if (fileType.includes('mp4') || fileType.includes('avi') || fileType.includes('mov')) return 'video'
    if (fileType.includes('mp3') || fileType.includes('wav') || fileType.includes('m4a')) return 'audio'
    
    return 'doc'
  }

  // Fetch scraped contents for the Links tab
  const fetchScrapedContentsForTab = async () => {
    try {
      console.log('🔄 Fetching scraped contents for Links tab...')
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error('❌ No access token available for scraped contents')
        return
      }

      console.log('🔍 Making request to: /api/scraped-contents')
      console.log('🔍 Access token present:', !!accessToken)

      const response = await fetch('/api/scraped-contents', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 Scraped contents response status:', response.status)
      console.log('📡 Scraped contents response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        console.error('❌ Failed to fetch scraped contents:', response.status, response.statusText)
        const errorText = await response.text().catch(() => 'Unable to read error response')
        console.error('❌ Error response:', errorText)
        return
      }

      const result = await response.json()
      console.log('✅ Scraped contents data received:')
      console.log('📊 Result type:', typeof result)
      console.log('📊 Result keys:', Object.keys(result || {}))
      console.log('📊 Full result:', JSON.stringify(result, null, 2))
      console.log('📊 Number of scraped items:', result.data?.length || 0)
      
      // Debug the data structure
      if (result.data) {
        console.log('📊 Data array details:')
        console.log('📊 Data type:', typeof result.data)
        console.log('📊 Is array:', Array.isArray(result.data))
        console.log('📊 Data length:', Array.isArray(result.data) ? result.data.length : 'N/A')
        
        if (Array.isArray(result.data)) {
          result.data.forEach((item: any, index: number) => {
            console.log(`📄 Scraped item ${index + 1}:`)
            console.log(`   Type: ${typeof item}`)
            console.log(`   Keys: ${Object.keys(item || {}).join(', ')}`)
            console.log(`   Content:`, JSON.stringify(item, null, 2))
          })
        }
      }
      
      // Update the media items with scraped contents
      console.log('🔍 Frontend data analysis:')
      console.log('🔍 Result data type:', typeof result.data)
      console.log('🔍 Result data is array:', Array.isArray(result.data))
      console.log('🔍 Result data length:', Array.isArray(result.data) ? result.data.length : 'N/A')
      console.log('🔍 Result data sample:', result.data ? result.data.slice(0, 2) : 'No data')
      
      if (result.data && Array.isArray(result.data)) {
        // Transform scraped contents into media items
        const scrapedItems = result.data.map((item: any) => ({
          id: `scraped-${item.resource_id || item.id || Math.random()}`,
          filename: item.resource_name || item.filename || 'Unknown',
          type: item.type || 'scraped',
          content: item.content,
          transcript: item.transcript,
          url: item.url,
          uploadedAt: new Date(item.created_at || Date.now()),
          size: item.content ? item.content.length : 0,
          title: item.resource_name || item.title || 'Scraped Content',
          resourceId: item.resource_id,
          resourceName: item.resource_name
        }))
        
        console.log('🔄 Updating media items with scraped contents...')
        console.log('📊 Scraped items to add:', scrapedItems.length)
        console.log('📊 Scraped items by type:', {
          youtube: scrapedItems.filter((item: any) => item.type === 'youtube').length,
          webpage: scrapedItems.filter((item: any) => item.type === 'webpage').length,
          scraped: scrapedItems.filter((item: any) => item.type === 'scraped').length,
          other: scrapedItems.filter((item: any) => !['youtube', 'webpage', 'scraped'].includes(item.type)).length
        })
        
        // Update the media items state
        setMediaItems((prevItems: any[]) => {
          // Remove existing scraped items and add new ones
          const nonScrapedItems = prevItems.filter((item: any) => !item.id.startsWith('scraped-'))
          const updatedItems = [...nonScrapedItems, ...scrapedItems]
          console.log('📊 Total items after update:', updatedItems.length)
          console.log('📊 Non-scraped items:', nonScrapedItems.length)
          console.log('📊 Scraped items added:', scrapedItems.length)
          console.log('📊 YouTube items in final list:', updatedItems.filter(item => item.type === 'youtube').length)
          return updatedItems
        })
      } else {
        console.log('⚠️ No scraped contents data or invalid format')
      }
    } catch (error) {
      console.error('❌ Error fetching scraped contents:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown'
      })
    }
  }

  // Upload media files
  const uploadMediaFiles = async (files: File[]) => {
    try {
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("No access token available")
        return
      }

      console.log(`Starting upload of ${files.length} files...`)

      for (const file of files) {
        console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type)
        
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        })

        if (!response.ok) {
          console.error('Upload failed for file:', file.name, 'Status:', response.status)
          const errorData = await response.json().catch(() => ({}))
          console.error('Error details:', errorData)
          continue
        }

        const data = await response.json()
        console.log('Upload successful for file:', file.name, data)
        
        // Handle different response formats
        let newMediaItem = null
        
        if (data.success && data.data) {
          // Standard response format
          newMediaItem = {
            id: data.data.media_id,
            userId: 'current_user',
            filename: data.data.file_name,
            type: getFileType(data.data.file_type),
            size: parseFloat(data.data.media_size) * 1024 * 1024, // Convert MB to bytes
            uploadedAt: new Date(),
            tags: [],
            metadata: {
              storageStatus: data.data.storage_status
            }
          }
        } else if (data.status === 'successful' && data.file_name) {
          // Direct n8n response format
          newMediaItem = {
            id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: 'current_user',
            filename: data.file_name,
            type: getFileType(file.type),
            size: file.size,
            uploadedAt: new Date(),
            tags: [],
            metadata: {
              storageStatus: 'enough space'
            }
          }
        } else if (data.success) {
          // Generic success response
          newMediaItem = {
            id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: 'current_user',
            filename: file.name,
            type: getFileType(file.type),
            size: file.size,
            uploadedAt: new Date(),
            tags: [],
            metadata: {
              storageStatus: 'enough space'
            }
          }
        }
        
        // Log successful upload but don't immediately add to state to avoid duplicates
        if (newMediaItem) {
          console.log('Upload successful, file will appear after refresh:', newMediaItem)
        } else {
          console.warn('Could not create media item from upload response:', data)
        }
      }

      console.log('All uploads completed')
      
      // Refresh the media library to show the newly uploaded files
      // This ensures all uploaded files are visible and properly integrated
      setTimeout(() => {
        console.log('Refreshing media library to show uploaded files...')
        fetchMediaLibrary()
      }, 500)
      
    } catch (error) {
      console.error('Error uploading files:', error)
    }
  }

  // Delete media file via n8n webhook
  const deleteMediaFile = async (mediaId: string, filename: string) => {
    try {
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("No access token available")
        return
      }

      // Find the media item to determine its type
      const mediaItem = mediaItems.find(item => 
        item.id === mediaId || 
        item.filename === filename || 
        item.title === filename
      )

      console.log('🗑️ Deleting file:', filename, 'with media ID:', mediaId)
      console.log('🔍 Found media item for deletion:', mediaItem)

      // Determine if this is scraped content or regular media
      const isScrapedContent = mediaItem?.type === 'scraped' || 
                              mediaItem?.type === 'url' || 
                              mediaItem?.type === 'youtube' ||
                              mediaItem?.type === 'transcript' ||
                              filename.includes('scraped') ||
                              filename.includes('sample_content')

      console.log('🎯 File type determination:', {
        isScrapedContent,
        mediaItemType: mediaItem?.type,
        filename
      })

      let response
      if (isScrapedContent) {
        // Use the scraped content delete API endpoint
        console.log('🔄 Using scraped content delete API endpoint')
        console.log('Request URL:', '/api/scraped-contents')
        response = await fetch('/api/scraped-contents', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            file_name: filename
          }),
        })
      } else {
        // Use the regular media delete API endpoint
        console.log('🔄 Using regular media delete API endpoint')
        console.log('Request URL:', '/api/media/delete')
        response = await fetch('/api/media/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            file_name: filename
          }),
        })
      }

      console.log('Access token present:', !!accessToken)
      console.log('Access token length:', accessToken?.length || 0)
      console.log('Filename length:', filename.length)
      console.log('Filename contains special chars:', /[^a-zA-Z0-9._-]/.test(filename))
      console.log('Request body:', {
        file_name: filename
      })
      console.log('API endpoint being called:', isScrapedContent ? '/api/scraped-contents' : '/api/media/delete')

      if (!response.ok) {
        console.error('Delete failed for file:', filename, 'Status:', response.status)
        console.error('Response headers:', response.headers)
        
        // Get the raw response text for better debugging
        let responseText = ''
        try {
          responseText = await response.text()
          console.error('Raw error response:', responseText)
        } catch (textError) {
          console.error('Could not read response text:', textError)
        }
        
        let errorMessage = 'Failed to delete file'
        try {
          const errorData = responseText ? JSON.parse(responseText) : {}
          console.error('Error details:', errorData)
          errorMessage = errorData.message || errorData.error || errorData.details || `Server error (${response.status})`
        } catch (parseError) {
          console.error('Could not parse error response:', parseError)
          console.error('Response text that failed to parse:', responseText)
          errorMessage = `Server error (${response.status}): ${responseText || 'No response body'}`
        }
        
        console.error('Request details:', {
          webhook_url: isScrapedContent ? API_ENDPOINTS.N8N_WEBHOOKS.DELETE_SCRAPED_CONTENT : API_ENDPOINTS.N8N_WEBHOOKS.DELETE_MEDIA_FILE,
          file_name: filename,
          is_scraped_content: isScrapedContent,
          media_item: mediaItem
        })
        
        // Show user-friendly error message
        showToast(`Failed to delete "${filename}": ${errorMessage}`, 'error')
        return false
      }

      const data = await response.json()
      console.log('Delete successful for file:', filename, data)
      
      // Remove the file from the local state
      setMediaItems(prev => prev.filter(item => item.id !== mediaId))
      
      // Show success message
      showToast(`Successfully deleted "${filename}"`, 'success')
      
      return true
    } catch (error) {
      console.error('Error deleting file:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showToast(`Failed to delete "${filename}": ${errorMessage}`, 'error')
      return false
    }
  }

  // Handle media item selection for RAG with optimistic updates
  const handleMediaSelection = async (itemId: string, isSelected: boolean) => {
    console.log('📎 ===== MEDIA SELECTION START =====')
    console.log('📎 Item ID:', itemId)
    console.log('📎 Is Selected:', isSelected)
    console.log('📎 Current selected items count:', selectedMediaItems.size)
    
    const accessToken = authService.getAuthToken()
    if (!accessToken) {
      console.error("No access token available")
      return
    }

    const item = mediaItems.find(item => item.id === itemId)
    if (!item) {
      console.error("Item not found:", itemId)
      return
    }

    console.log('📎 Media item details:')
    console.log('  - Filename:', item.filename || item.title)
    console.log('  - Type:', item.type)
    console.log('  - ID:', item.id)
    console.log('  - Content length:', item.content ? item.content.length : 0)
    console.log('  - Transcript length:', item.transcript ? item.transcript.length : 0)
    console.log('  - URL:', item.url || 'N/A')
    console.log('  - Resource ID:', item.resource_id || 'N/A')
    console.log('  - Has content:', !!item.content)
    console.log('  - Has resource_id:', !!item.resource_id)

    // Prevent rapid clicking on the same item
    const currentSelection = selectedMediaItems.has(itemId)
    if (currentSelection === isSelected) {
      console.log('📎 Item already in desired state, skipping')
      return // Already in the desired state
    }

    // Optimistic update - update UI immediately
    if (isSelected) {
      setSelectedMediaItems(prev => new Set([...prev, itemId]))
    } else {
      setSelectedMediaItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }

    // Make API call in background
    try {
      // Check if this is scraped content (including images) that should be passed directly with messages
      // Items with scraped content have a 'content' property and 'resource_id' property
      const isScrapedContent = (item.content && item.resource_id) || item.type === 'scraped' || item.id.startsWith('scraped-')
      console.log('📎 Scraped content detection:')
      console.log('  - Has content and resource_id:', !!(item.content && item.resource_id))
      console.log('  - Type is scraped:', item.type === 'scraped')
      console.log('  - ID starts with scraped-:', item.id.startsWith('scraped-'))
      console.log('  - Final decision - isScrapedContent:', isScrapedContent)
      
      if (isSelected) {
        if (isScrapedContent) {
          // For scraped content (including images), just mark as selected for direct message passing
          console.log('📄 Adding scraped content for direct message passing:', item.filename)
          console.log('📄 Content will be passed directly with the next message')
          console.log('📄 Content preview:', item.content ? item.content.substring(0, 100) + '...' : 'No content')
          showToast('Scraped content added - will be included with your next message', 'success')
        } else {
          // For regular media files, add to RAG
          console.log('🔗 Adding item to RAG:', item.filename)
          console.log('🔗 RAG Upload Request Details:')
          console.log('  - URL: /api/rag/upload')
          console.log('  - Session ID:', sessionId)
          console.log('  - Media ID:', itemId)
          console.log('  - Item Type:', item.type)
          console.log('  - Item Name:', item.filename || item.title)
          
          const response = await fetch('/api/rag/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: accessToken,
              session_id: sessionId,
              media_id: itemId
            })
          })

          if (!response.ok) {
            // Revert optimistic update on failure
            setSelectedMediaItems(prev => {
              const newSet = new Set(prev)
              newSet.delete(itemId)
              return newSet
            })
            console.error('❌ Failed to add item to RAG:', response.status, response.statusText)
            const errorText = await response.text().catch(() => 'Unable to read error response')
            console.error('❌ Error response body:', errorText)
            showToast('Failed to add item to chat context', 'error')
          } else {
            console.log('✅ Successfully added item to RAG context')
            showToast('Item added to chat context', 'success')
          }
        }
      } else {
        if (isScrapedContent) {
          // For scraped content, just remove from selection
          console.log('📄 Removing scraped content from direct message passing:', item.filename)
          showToast('Scraped content removed from next message', 'success')
        } else {
          // For regular media files, remove from RAG
          console.log('🗑️ Removing item from RAG:', item.filename)
          console.log('🗑️ RAG Delete Request Details:')
          console.log('  - URL: /api/rag/delete')
          console.log('  - Session ID:', sessionId)
          console.log('  - Media ID:', itemId)
          console.log('  - Item Type:', item.type)
          console.log('  - Item Name:', item.filename || item.title)
          
          const response = await fetch('/api/rag/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: accessToken,
              session_id: sessionId,
              media_id: itemId
            })
          })

          if (!response.ok) {
            // Revert optimistic update on failure
            setSelectedMediaItems(prev => new Set([...prev, itemId]))
            console.error('❌ Failed to remove item from RAG:', response.status, response.statusText)
            const errorText = await response.text().catch(() => 'Unable to read error response')
            console.error('❌ Error response body:', errorText)
            showToast('Failed to remove item from chat context', 'error')
          } else {
            console.log('✅ Successfully removed item from RAG context')
            showToast('Item removed from chat context', 'success')
          }
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      if (isSelected) {
        setSelectedMediaItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(itemId)
          return newSet
        })
      } else {
        setSelectedMediaItems(prev => new Set([...prev, itemId]))
      }
      console.error('❌ Error handling media selection:', error)
      showToast('Error updating chat context', 'error')
    }
    
    console.log('📎 ===== MEDIA SELECTION END =====')
  }

  // Delete scraped content via n8n webhook
  const deleteScrapedContent = async (resourceId: string, resourceName: string) => {
    try {
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("No access token available")
        return
      }

      console.log('Deleting scraped content:', resourceName, 'with resource ID:', resourceId)
      console.log('Request URL:', API_ENDPOINTS.N8N_WEBHOOKS.DELETE_SCRAPED_CONTENT)
      console.log('Request headers:', {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      })
      console.log('Request body:', {
        access_token: accessToken,
        resource_id: resourceId
      })

      const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.DELETE_SCRAPED_CONTENT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          resource_id: resourceId
        }),
      })

      if (!response.ok) {
        console.error('Delete failed for scraped content:', resourceName, 'Status:', response.status)
        console.error('Response headers:', response.headers)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error details:', errorData)
        console.error('Request body sent:', {
          access_token: accessToken,
          resource_id: resourceId
        })
        return false
      }

      const data = await response.json()
      console.log('Delete successful for scraped content:', resourceName, data)
      
      // Note: UI update is handled by handleDeleteItem function
      // No need to refresh here to avoid conflicts
      
      return true
    } catch (error) {
      console.error('Error deleting scraped content:', error)
      return false
    }
  }

  // Unified delete function that handles both media files and scraped content
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    try {
      setIsDeleting(true)
      setDeletingItemId(itemId)
      
      // Check if this is a scraped content item by looking for resource_id
      const item = mediaItems.find(item => item.id === itemId)
      let deleteResult = false
      
      if (item && (item.resourceId || item.type === 'scraped' || item.type === 'youtube' || item.type === 'transcript' || item.type === 'url' || item.type === 'webpage')) {
        // For scraped content, YouTube, transcripts, and URLs, we need to use the resource_id from the item
        const resourceId = item.resourceId || itemId
        console.log('🗑️ Deleting scraped content/YouTube/transcript with resource ID:', resourceId, 'and name:', itemName)
        const result = await deleteScrapedContent(resourceId, itemName)
        deleteResult = result === true
      } else {
        // For regular media files, use the existing delete function
        console.log('🗑️ Deleting media file with ID:', itemId, 'and name:', itemName)
        const result = await deleteMediaFile(itemId, itemName)
        deleteResult = result === true
      }
      
      if (deleteResult) {
        console.log('🔄 Deletion successful, removing item from local state...')
        // Immediately remove the item from local state
        setMediaItems(prevItems => prevItems.filter(mediaItem => mediaItem.id !== itemId))
        showToast(`Successfully deleted "${itemName}"`, 'success')
      }
      
      return deleteResult
    } catch (error) {
      console.error('Error in handleDeleteItem:', error)
      showToast(`Failed to delete "${itemName}"`, 'error')
      return false
    } finally {
      setIsDeleting(false)
      setDeletingItemId(null)
    }
  }

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access the dashboard.</p>
          <button 
            onClick={() => window.location.href = '/auth/signin'}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 text-slate-800 font-sans">
      {!chatStarted ? (
        // Initial interface without separate sidebar
        <div className="flex h-screen">
          {/* Main Content - Initial Interface */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Initial Interface Content */}
            <div className="flex-1">
        <InitialInterface
          agents={agents}
          selectedAgent={selectedAgent}
          onSelectAgent={handleSelectAgent}
          onStartChatting={handleStartChatting}
          onRefreshAgents={refreshAgents}
          isLoadingAgents={isLoadingAgents}
          isStartingChat={isStartingChat}
        />
            </div>
          </div>
        </div>
      ) : (
        // Full dashboard with chat interface
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full"
        >
      {/* Chat Interface Content */}

      <div className="flex h-screen">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 h-full">
          {/* Knowledge Base Status Indicator */}
          {knowledgeBaseStatus.isLoaded && (
            <div className="bg-green-50 border-b border-green-200 px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700 font-medium">
                    Knowledge Base Active
                  </span>
                  <span className="text-xs text-green-600">
                    ({knowledgeBaseStatus.contentLength.toLocaleString()} characters)
                  </span>
                </div>
                <button
                  onClick={fetchKnowledgeBaseStatus}
                  className="text-xs text-green-600 hover:text-green-800 underline"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
          {!knowledgeBaseStatus.isLoaded && knowledgeBaseStatus.lastFetched && (
            <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-yellow-700 font-medium">
                  Knowledge Base Not Available
                </span>
                <button
                  onClick={fetchKnowledgeBaseStatus}
                  className="text-xs text-yellow-600 hover:text-yellow-800 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          <div className="flex-1 w-full h-full">
            <ChatInterface 
              messages={messages} 
              selectedAgent={selectedAgent}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onOpenMediaSelector={() => {
                console.log('🚀 MEDIA SELECTOR OPENED - Starting debug...')
                console.log('📊 Current mediaItems count:', mediaItems.length)
                console.log('📊 Current mediaItems:', mediaItems)
                console.log('📊 MediaItems by type:', {
                  youtube: mediaItems.filter(item => item.type === 'youtube').length,
                  transcript: mediaItems.filter(item => item.type === 'transcript').length,
                  scraped: mediaItems.filter(item => item.type === 'scraped').length,
                  webpage: mediaItems.filter(item => item.type === 'webpage').length,
                  audio: mediaItems.filter(item => item.type === 'audio').length,
                  video: mediaItems.filter(item => item.type === 'video').length,
                  image: mediaItems.filter(item => item.type === 'image').length,
                  file: mediaItems.filter(item => ['pdf', 'doc', 'txt'].includes(item.type)).length,
                  url: mediaItems.filter(item => item.type === 'url').length
                })
                
                // Log each item with full details
                mediaItems.forEach((item, index) => {
                  console.log(`📄 Item ${index + 1}:`, {
                    id: item.id,
                    type: item.type,
                    filename: item.filename,
                    title: item.title,
                    content: item.content ? `${item.content.substring(0, 100)}...` : 'No content',
                    transcript: item.transcript ? `${item.transcript.substring(0, 100)}...` : 'No transcript',
                    resourceName: item.resourceName,
                    url: item.url,
                    allKeys: Object.keys(item)
                  })
                })
                
                // Open the media selector immediately for better UX
                setIsMediaSelectorOpen(true)
                // Only refresh if we don't have media items or they're stale
                if (mediaItems.length === 0) {
                  console.log('🔄 No media items found, fetching from server...')
                  fetchMediaLibrary()
                } else {
                  console.log('✅ Using existing media items, no server fetch needed')
                }
              }}
              selectedMediaCount={selectedMediaItems.size}
              selectedMediaItems={selectedMediaItems}
              onUploadFiles={uploadMediaFiles}
              currentChatSession={currentChatSession}
              chatHistory={chatHistory}
            />
          </div>
        </div>

        {/* Right Media Drawer */}
        <motion.div 
          className={`hidden xl:flex flex-col bg-gradient-to-b from-white via-slate-50 to-white border-l border-slate-200/60 transition-all duration-300 shadow-sm ${
            rightPanelOpen ? 'w-96' : 'w-0'
          }`}
          initial={false}
          animate={{ width: rightPanelOpen ? 384 : 0 }}
        >
                  <div className="flex-1 h-[80vh] overflow-hidden">
          <MediaDrawer 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            mediaItems={mediaItems}
            setMediaItems={setMediaItems}
            onRefresh={refreshAllTabs}
            onUpload={uploadMediaFiles}
            onDelete={deleteMediaFile}
            handleDeleteItem={handleDeleteItem}
            isRefreshing={isRefreshing}
            isLoadingTabContent={isLoadingTabContent}
            isDeleting={isDeleting}
            deletingItemId={deletingItemId}
          />
        </div>
        </motion.div>
      </div>

      {/* Professional Chat Loading Overlay */}
      {isLoadingChat && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4"
          >
            <div className="text-center">
              {/* Animated loader with Framer Motion */}
              <div className="relative mb-6">
                <motion.div 
                  className="w-16 h-16 mx-auto relative"
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                >
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                  <motion.div 
                    className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                  ></motion.div>
                </motion.div>
              </div>
              
              {/* Loading text with fade animation */}
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-xl font-semibold text-gray-900 mb-2"
              >
                Loading Chat
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-gray-600 text-sm"
              >
                Please wait while we load your conversation...
              </motion.p>
              
              {/* Progress dots with staggered animation */}
              <div className="flex justify-center space-x-2 mt-6">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-2 h-2 bg-blue-600 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mobile New Chat FAB */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button 
          onClick={startNewConversation}
          className="h-16 w-16 rounded-full bg-gradient-to-r from-[#1ABC9C] to-emerald-500 hover:from-[#1ABC9C]/90 hover:to-emerald-500/90 shadow-xl hover:shadow-2xl transition-all duration-200"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Credit Limit Popup */}
      {showCreditPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Credit Limit Reached</h3>
                <p className="text-sm text-gray-600">You've used all your available credits</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              To continue using the AI agent and generate more ad copy, please upgrade your plan to get more credits.
            </p>
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => setShowCreditPopup(false)}
                variant="outline"
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button 
                onClick={() => {
                  setShowCreditPopup(false);
                  // TODO: Navigate to upgrade page
                  console.log('Navigate to upgrade page');
                }}
                className="flex-1 bg-[#1ABC9C] hover:bg-[#1ABC9C]/90"
              >
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Media Selector */}
              <MediaSelector
          mediaItems={mediaItems}
          selectedMediaItems={selectedMediaItems}
          onMediaSelection={handleMediaSelection}
          isOpen={isMediaSelectorOpen}
          onClose={() => setIsMediaSelectorOpen(false)}
          isLoading={isLoadingMedia}
        />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
        </motion.div>
      )}
      </div>
  )
}

// Media Selector Component
function MediaSelector({ 
  mediaItems, 
  selectedMediaItems, 
  onMediaSelection, 
  isOpen, 
  onClose,
  isLoading
}: { 
  mediaItems: any[]
  selectedMediaItems: Set<string>
  onMediaSelection: (itemId: string, isSelected: boolean) => void
  isOpen: boolean
  onClose: () => void
  isLoading: boolean
}) {
  if (!isOpen) return null

  console.log('🎯 MEDIA SELECTOR COMPONENT RENDERED')
  console.log('🔍 MediaSelector - All mediaItems count:', mediaItems.length)
  console.log('🔍 MediaSelector - All mediaItems:', mediaItems)
  console.log('🔍 MediaSelector - Items with type "scraped":', mediaItems.filter(item => item.type === 'scraped'))
  console.log('🔍 MediaSelector - Items with type "youtube":', mediaItems.filter(item => item.type === 'youtube'))
  console.log('🔍 MediaSelector - Items with type "transcript":', mediaItems.filter(item => item.type === 'transcript'))
  console.log('🔍 MediaSelector - Items with type "url":', mediaItems.filter(item => item.type === 'url'))
  console.log('🔍 MediaSelector - Items with type "audio":', mediaItems.filter(item => item.type === 'audio'))
  console.log('🔍 MediaSelector - Items with type "video":', mediaItems.filter(item => item.type === 'video'))

  const availableItems = mediaItems.filter((item, index) => {
    // Only include content types that should pass context to chat
    // Exclude media files (pdf, doc, txt, audio, video, image) but include scraped content, transcriptions, and YouTube links
    const contextTypes = ['url', 'transcript', 'scraped', 'youtube', 'webpage']
    const hasValidType = contextTypes.includes(item.type)
    const hasContent = !!item.content
    const hasTranscript = !!item.transcript
    const hasResourceName = !!item.resourceName
    const hasTitle = !!item.title
    const hasFilename = !!item.filename
    
    const shouldInclude = hasValidType || hasContent || hasTranscript || hasResourceName || hasTitle || hasFilename
    
    console.log(`🔍 Filtering item ${index + 1}:`, {
      id: item.id,
      type: item.type,
      filename: item.filename,
      hasValidType,
      hasContent,
      hasTranscript,
      hasResourceName,
      hasTitle,
      hasFilename,
      shouldInclude,
      allKeys: Object.keys(item)
    })
    
    if (item.type === 'scraped' || item.type === 'transcript' || item.type === 'audio' || item.type === 'video' || item.type === 'youtube' || item.type === 'url') {
      console.log('🎯 SPECIAL ITEM DETAILS:', {
        type: item.type,
        filename: item.filename,
        content: item.content ? `${item.content.substring(0, 50)}...` : 'No content',
        transcript: item.transcript ? `${item.transcript.substring(0, 50)}...` : 'No transcript',
        resourceName: item.resourceName,
        title: item.title,
        url: item.url
      })
    }
    
    return shouldInclude
  })

  console.log('🔍 MediaSelector - Available items after filtering:', availableItems.length)
  console.log('🔍 MediaSelector - Available items by type (context-enabled only):', {
    youtube: availableItems.filter(item => item.type === 'youtube').length,
    transcript: availableItems.filter(item => item.type === 'transcript').length,
    scraped: availableItems.filter(item => item.type === 'scraped').length,
    url: availableItems.filter(item => item.type === 'url').length,
    webpage: availableItems.filter(item => item.type === 'webpage').length
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Select Media for Chat Context
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose media items to include in your chat context
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Loading Media...</h4>
              <p className="text-gray-600">Please wait while we fetch your media items.</p>
            </div>
          ) : availableItems.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Media Available</h4>
              <p className="text-gray-600">Upload files or scrape content to make them available for chat context.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableItems.map((item, index) => {
                console.log(`🎨 Rendering item ${index + 1}:`, {
                  id: item.id,
                  type: item.type,
                  filename: item.filename,
                  title: item.title,
                  content: item.content ? `${item.content.substring(0, 30)}...` : 'No content',
                  transcript: item.transcript ? `${item.transcript.substring(0, 30)}...` : 'No transcript'
                })
                
                const isSelected = selectedMediaItems.has(item.id)
                const isLink = item.type === 'url' || item.type === 'scraped'
                const isTranscript = item.type === 'transcript' || item.type === 'youtube'
                
                return (
                  <div 
                    key={item.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => onMediaSelection(item.id, !isSelected)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {isLink ? (
                            <Link2 className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                          ) : isTranscript ? (
                            <Mic className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                          ) : (
                            <FileText className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.filename || item.title || item.url || `Media Item ${item.id.slice(0, 8)}`}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isLink ? 'bg-blue-100 text-blue-800' :
                              isTranscript ? 'bg-indigo-100 text-indigo-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {isLink ? 'Link' : 
                               isTranscript ? 'Transcript' :
                               'Content'}
                            </span>
                            {(item.content || item.transcript || item.resourceName || item.title) ? (
                              <span className="text-xs text-gray-500">
                                {(() => {
                                  const content = item.content || item.transcript || item.resourceName || item.title || ''
                                  return content.length > 100 ? `${content.substring(0, 100)}...` : content
                                })()}
                              </span>
                            ) : item.filename && (
                              <span className="text-xs text-gray-500">
                                {item.filename}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedMediaItems.size} item{selectedMediaItems.size !== 1 ? 's' : ''} selected
            </div>
            <Button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Left Sidebar Component
function LeftSidebar({ 
  agents, 
  conversations, 
  selectedAgent, 
  onSelectAgent, 
  isLoadingAgents, 
  onRefreshAgents, 
  setChatStarted, 
  setMessages, 
  setSessionId, 
  initiateNewChat, 
  messages, 
  chatStarted,
  chatHistory,
  isLoadingChatHistory,
  currentChatSession,
  onLoadChatSession,
  onRefreshChatHistory,
  onDeleteChatSession
}: any) {
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = React.useState(false)

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Agent Selector */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Current Agent</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('🔄 Refresh button clicked in LeftSidebar')
              console.log('🔄 Event target:', e.target)
              console.log('🔄 onRefreshAgents function:', typeof onRefreshAgents)
              try {
                onRefreshAgents()
              } catch (error) {
                console.error('🔄 Error calling onRefreshAgents:', error)
              }
            }}
            disabled={isLoadingAgents}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingAgents ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </Button>
        </div>
        <AgentSelector 
          agents={agents} 
          selectedAgent={selectedAgent} 
          onSelectAgent={onSelectAgent}
          onOpenChange={setIsAgentSelectorOpen}
          isLoading={isLoadingAgents}
          onRefresh={onRefreshAgents}
        />
      </div>

      {/* Chat History Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 pb-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Chat History</h3>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={onRefreshChatHistory}
                      disabled={isLoadingChatHistory}
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoadingChatHistory ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh chat history</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => {
                      console.log('🔄 Starting new chat (sidebar) - clearing chat state')
                      setChatStarted(false)
                      setMessages([])
                      setSessionId('') // Clear session ID for new chat
                      
                      // Clear localStorage
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('chat_session_id')
                        localStorage.removeItem('chat_started')
                        localStorage.removeItem('chat_messages')
                      }
                      
                      console.log('💡 Chat state cleared. User can now select agent and start chatting.')
                    }}
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New conversation</p>
                </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        <div className={`flex-1 p-4 pt-3 min-h-[500px] ${isAgentSelectorOpen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {isLoadingChatHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading chat history...</span>
              </div>
          ) : chatHistory.length > 0 ? (
            <div className="space-y-2" key={`chat-history-${currentChatSession}`}>
              {chatHistory.map((chat: any) => {
                const chatDate = new Date(chat.created_at)
                const timeAgo = formatTimeAgo(chatDate)
                const isSelected = currentChatSession === chat.session_id

                // Debug logs
                console.log('Chat item:', {
                  session_id: chat.session_id,
                  title: chat.title,
                  currentChatSession,
                  isSelected
                })

                return (
                <div
                    key={chat.session_id}
                    className={`p-3 rounded-lg border transition-all duration-150 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
              >
                <div className="flex items-start justify-between mb-2">
                      <div 
                        className={`flex-1 min-w-0 ${isLoadingChat ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        onClick={() => !isLoadingChat && onLoadChatSession(chat.session_id)}
                      >
                        <h4 className="font-medium text-sm truncate text-gray-900">
                          {chat.title || `Chat ${chat.session_id}`}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
                      </div>
                  <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteChatSession(chat.session_id)
                          }}
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                  </div>
                </div>

              </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-2">No chat history yet</p>
              <p className="text-xs text-gray-500">Start a new chat to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Mobile Sidebar Component
function MobileSidebar({ agents, conversations, chatHistory, isLoadingChatHistory, currentChatSession, onLoadChatSession, onRefreshChatHistory, onDeleteChatSession }: any) {
  return (
    <div className="h-full relative flex flex-col bg-white">
      <div className="p-4 border-b border-[#EEEEEE]">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Copy Ready logo" 
              width={32} 
              height={32}
              className="rounded-lg"
            />
          </div>
          <div>
            <div className="font-semibold">Copy Ready</div>
            <div className="text-xs text-[#929AAB]">AI Ad Copy Platform</div>
          </div>
        </div>
      </div>
      <LeftSidebar 
        agents={agents} 
        conversations={conversations} 
        selectedAgent="Social Media Agent" 
        onSelectAgent={() => {}} 
        isLoadingAgents={false}
        onRefreshAgents={() => {}}
        setChatStarted={() => {}}
        setMessages={() => {}}
        setSessionId={() => {}}
        initiateNewChat={async () => true}
        messages={[]}
        chatStarted={false}
          chatHistory={chatHistory}
          isLoadingChatHistory={isLoadingChatHistory}
          currentChatSession={currentChatSession}
        onLoadChatSession={onLoadChatSession}
        onRefreshChatHistory={onRefreshChatHistory}
        onDeleteChatSession={onDeleteChatSession}
        />
          </div>
  )
}

// Media Drawer Component  
function MediaDrawer({ activeTab, onTabChange, mediaItems, setMediaItems, onRefresh, onUpload, onDelete, handleDeleteItem, isRefreshing, isLoadingTabContent, isDeleting, deletingItemId }: any) {
  const tabs = [
    { id: 'files' as const, label: 'Files', icon: FileText },
    { id: 'links' as const, label: 'Links', icon: Link2 },
    { id: 'youtube' as const, label: 'YouTube', icon: Mic },
    { id: 'image-analyzer' as const, label: 'Images', icon: Image },
    { id: 'transcripts' as const, label: 'Transcripts', icon: Mic },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with tabs */}
      <div className="border-b border-[#EEEEEE] p-6 pt-12">
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <SlideInText text="Media Library" className="font-semibold text-lg" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="flex items-center space-x-2 bg-[#1ABC9C] hover:bg-[#1ABC9C]/90 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium">Refresh All</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh all media tabs and content (Files, Links, YouTube, Images, Transcripts, Knowledge Base)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="bg-[#EEEEEE] p-1.5 rounded-xl shadow-inner">
          <div className="flex space-x-1 flex-wrap justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-[#393E46] shadow-md border border-[#E0E0E0] transform scale-105'
                    : 'text-[#929AAB] hover:text-[#393E46] hover:bg-white/50 hover:shadow-sm'
                }`}
              >
                <tab.icon className={`h-4 w-4 flex-shrink-0 transition-colors duration-200 ${
                  activeTab === tab.id ? 'text-[#1ABC9C]' : 'text-[#929AAB]'
                }`} />
                <span className="tracking-wide">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {activeTab === 'files' && <FilesTab mediaItems={mediaItems} onUpload={onUpload} onDelete={handleDeleteItem} isDeleting={isDeleting} deletingItemId={deletingItemId} isLoadingTabContent={isLoadingTabContent} />}
        {activeTab === 'links' && <LinksTab mediaItems={mediaItems} onDelete={handleDeleteItem} onRefresh={onRefresh} setMediaItems={setMediaItems} isDeleting={isDeleting} deletingItemId={deletingItemId} isLoadingTabContent={isLoadingTabContent} />}
        {activeTab === 'youtube' && <YouTubeTab mediaItems={mediaItems} onDelete={handleDeleteItem} onRefresh={onRefresh} setMediaItems={setMediaItems} isDeleting={isDeleting} deletingItemId={deletingItemId} isLoadingTabContent={isLoadingTabContent} />}
        {activeTab === 'image-analyzer' && <ImageAnalyzerTab mediaItems={mediaItems} onUpload={onUpload} onDelete={handleDeleteItem} isDeleting={isDeleting} deletingItemId={deletingItemId} isLoadingTabContent={isLoadingTabContent} />}
        {activeTab === 'transcripts' && <TranscriptsTab mediaItems={mediaItems} onDelete={handleDeleteItem} isDeleting={isDeleting} deletingItemId={deletingItemId} isLoadingTabContent={isLoadingTabContent} />}
      </div>
    </div>
  )
}

// Media Tab Components
function FilesTab({ mediaItems, onUpload, onDelete, isDeleting, deletingItemId, isLoadingTabContent }: any) {
  const [dragActive, setDragActive] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const fileItems = mediaItems.filter((item: any) => 
    ['pdf', 'doc', 'txt', 'audio', 'video'].includes(item.type)
  )

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && onUpload) {
      setIsUploading(true)
      await onUpload(files)
      setIsUploading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0 && onUpload) {
      setIsUploading(true)
      await onUpload(files)
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Dropzone */}
      <div 
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
          dragActive 
            ? 'border-[#1ABC9C] bg-[#1ABC9C]/10 scale-[1.02] shadow-lg' 
            : 'border-[#EEEEEE] hover:border-[#1ABC9C] hover:bg-[#1ABC9C]/5 hover:shadow-md'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full transition-all duration-200 ${
            dragActive 
              ? 'bg-gradient-to-br from-[#1ABC9C] to-[#16A085] shadow-lg' 
              : 'bg-gradient-to-br from-[#EEEEEE] to-[#F5F5F5]'
          }`}>
            <Upload className={`h-8 w-8 transition-all duration-200 ${isUploading ? 'animate-bounce' : ''} ${
              dragActive ? 'text-white' : 'text-[#929AAB]'
            }`} />
          </div>
          <div className="space-y-2">
            <FadeInText 
              text={isUploading ? "Uploading files..." : "Drop files here or click to browse"} 
              className={`text-lg font-semibold text-center transition-colors duration-200 ${
                isUploading ? 'text-[#1ABC9C]' : dragActive ? 'text-[#1ABC9C]' : 'text-[#393E46]'
              }`} 
            />
            <FadeInText 
              text={isUploading ? "Please wait..." : "Supports PDF, DOC, TXT, MP3, MP4, and more"} 
              className="text-sm text-[#929AAB] text-center" 
              delay={0.1} 
            />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.mp3,.mp4,.wav,.m4a,.jpg,.jpeg,.png,.gif"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* File list */}
      <div className="space-y-1">
        {fileItems.length > 0 ? (
          fileItems.slice(0, 8).map((item: any, index: number) => {
            // Get appropriate icon based on file type
            const getFileIcon = (type: string) => {
              switch (type) {
                case 'pdf':
                  return (
                    <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 18h12V6l-4-4H4v16zm2-2V4h6v2H6v12z"/>
                    </svg>
                  )
                case 'image':
                  return (
                    <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                    </svg>
                  )
                case 'video':
                  return (
                    <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                    </svg>
                  )
                case 'audio':
                  return (
                    <svg className="h-4 w-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  )
                default:
                  return <FileText className="h-4 w-4 text-[#929AAB]" />
              }
            }


            // Format file size
            const formatFileSize = (sizeInBytes: number) => {
              if (!sizeInBytes) return 'Unknown size'
              const sizeInMB = sizeInBytes / (1024 * 1024)
              if (sizeInMB >= 1) {
                return `${sizeInMB.toFixed(1)} MB`
              } else {
                const sizeInKB = sizeInBytes / 1024
                return `${sizeInKB.toFixed(1)} KB`
              }
            }

            return (
              <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#EEEEEE] transition-colors">
                {getFileIcon(item.type)}
                <div className="flex-1 min-w-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm font-medium text-gray-900 truncate cursor-default" title={item.filename}>
                          {item.filename}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.filename}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(item.size)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(item.id, item.filename)
                    }}
                    disabled={isDeleting && deletingItemId === item.id}
                    className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {isDeleting && deletingItemId === item.id ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-[#929AAB] mx-auto mb-2" />
            <p className="text-sm text-[#929AAB]">No files uploaded yet</p>
            <p className="text-xs text-[#929AAB] mt-1">Upload your first file to get started</p>
          </div>
        )}
      </div>
      
    </div>
  )
}

function LinksTab({ mediaItems, onDelete, onRefresh, setMediaItems, isDeleting, deletingItemId, isLoadingTabContent }: any) {
  // Filter to show only webpage type items
  const webpageItems = mediaItems.filter((item: any) => item.type === 'webpage')
  const [urlInput, setUrlInput] = React.useState("")
  const [isScraping, setIsScraping] = React.useState(false)
  const [isLoadingContents, setIsLoadingContents] = React.useState(false)
  const [toast, setToast] = React.useState<{
    message: string
    type: 'success' | 'error' | 'info'
    isVisible: boolean
  }>({
    message: '',
    type: 'info',
    isVisible: false
  })
  
  const [viewerContent, setViewerContent] = React.useState<{
    title: string
    content: string
    sourceUrl?: string
    scrapedAt?: string
    filename?: string
  } | null>(null)
  
  const [isViewerOpen, setIsViewerOpen] = React.useState(false)
  
  // Fetch scraped contents when component mounts
  React.useEffect(() => {
    console.log('🔄 LinksTab useEffect - fetching scraped contents...')
    const fetchScrapedContents = async () => {
      try {
        const accessToken = authService.getAuthToken()
        
        if (!accessToken) {
          console.error('❌ No access token available for scraped contents')
          return
        }

        console.log('🔍 Making request to: /api/scraped-contents')
        console.log('🔍 Access token present:', !!accessToken)

        const response = await fetch('/api/scraped-contents', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        console.log('📡 Scraped contents response status:', response.status)

        if (!response.ok) {
          console.error('❌ Failed to fetch scraped contents:', response.status, response.statusText)
          return
        }

        const result = await response.json()
        console.log('✅ Scraped contents data received:', result.data?.length || 0, 'items')
        
        if (result.data && Array.isArray(result.data)) {
          // Transform scraped contents into media items
          const scrapedItems = result.data.map((item: any) => ({
            id: `scraped-${item.resource_id || item.id || Math.random()}`,
            filename: item.resource_name || item.filename || 'Unknown',
            type: item.type || 'scraped',
            content: item.content,
            transcript: item.transcript,
            url: item.url,
            uploadedAt: new Date(item.created_at || Date.now()),
            size: item.content ? item.content.length : 0,
            title: item.resource_name || item.title || 'Scraped Content',
            resourceId: item.resource_id,
            resourceName: item.resource_name
          }))
          
          console.log('🔄 LinksTab - Updating media items with scraped contents...')
          console.log('📊 Scraped items to add:', scrapedItems.length)
          console.log('📊 Scraped items by type:', {
            webpage: scrapedItems.filter((item: any) => item.type === 'webpage').length,
            youtube: scrapedItems.filter((item: any) => item.type === 'youtube').length,
            scraped: scrapedItems.filter((item: any) => item.type === 'scraped').length,
            other: scrapedItems.filter((item: any) => !['webpage', 'youtube', 'scraped'].includes(item.type)).length
          })
          
          // Update the media items state
          setMediaItems((prevItems: any[]) => {
            // Remove existing scraped items and add new ones
            const nonScrapedItems = prevItems.filter((item: any) => !item.id.startsWith('scraped-'))
            const updatedItems = [...nonScrapedItems, ...scrapedItems]
            console.log('📊 Total items after update:', updatedItems.length)
            console.log('📊 Non-scraped items:', nonScrapedItems.length)
            console.log('📊 Scraped items added:', scrapedItems.length)
            console.log('📊 Webpage items in final list:', updatedItems.filter(item => item.type === 'webpage').length)
            
            // Force a re-render by returning a completely new array
            return [...updatedItems]
          })
        }
      } catch (error) {
        console.error('❌ Error fetching scraped contents:', error)
      }
    }
    
    fetchScrapedContents()
  }, [])
  
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({
      message,
      type,
      isVisible: true
    })
  }
  
  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }
  


  const handleViewContent = (item: any) => {
    // Check if this is scraped content with actual content
    if (item.content) {
      setViewerContent({
        title: item.resourceName || item.filename || 'Scraped Content',
        content: item.content,
        sourceUrl: item.url,
        scrapedAt: item.uploadedAt?.toISOString(),
        filename: item.filename
      })
    } else {
      // Fallback for items without content
      setViewerContent({
        title: item.resourceName || item.filename || 'Scraped Content',
        content: 'Content not available...',
        sourceUrl: item.url,
        scrapedAt: item.uploadedAt?.toISOString(),
        filename: item.filename
      })
    }
    setIsViewerOpen(true)
  }
  
  const handleScrapeUrl = async () => {
    console.log('🔍 handleScrapeUrl called with URL:', urlInput)
    
    if (!urlInput.trim()) {
      console.log('❌ URL input is empty, returning early')
      showToast('Please enter a URL to scrape', 'error')
      return
    }
    
    try {
      setIsScraping(true)
      console.log('🔍 Getting access token...')
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("❌ No access token available")
        showToast('Authentication required. Please sign in again.', 'error')
        return
      }

      console.log('✅ Access token found:', accessToken ? 'Present' : 'Missing')
      console.log('🔍 Scraping URL:', urlInput)
      
      const apiUrl = `/api/webpage-scrape?url=${encodeURIComponent(urlInput.trim())}`
      console.log('🔍 Making request to:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('🔍 Response received:', response.status, response.statusText)

      if (!response.ok) {
        console.error('❌ Scraping failed:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Error details:', errorData)
        
        // Show user-friendly error message
        if (response.status === 404) {
          showToast('Webpage scraping service is currently unavailable. Please try again later.', 'error')
        } else if (response.status === 401) {
          showToast('Authentication failed. Please sign in again.', 'error')
        } else if (response.status === 400) {
          showToast('Invalid URL. Please check the URL and try again.', 'error')
        } else {
          showToast(`Failed to scrape webpage. Error: ${response.status} ${response.statusText}`, 'error')
        }
        return
      }

      const data = await response.json()
      console.log('✅ URL scraped successfully:', data)
      
      // Show success message
      showToast('Webpage scraped and saved successfully!', 'success')
      
      // Clear the input after successful scraping
      setUrlInput("")
      
      // Refresh the scraped contents list
      try {
        const refreshResponse = await fetch('/api/scraped-contents', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (refreshResponse.ok) {
          const refreshResult = await refreshResponse.json()
          console.log('✅ Scraped contents refreshed after scraping:', refreshResult.data?.length || 0, 'items')
          
          if (refreshResult.data && Array.isArray(refreshResult.data)) {
            // Skip creating sample_content_ entries - scraped content will not be displayed as media items
            const scrapedItems: any[] = []
            
            setMediaItems((prevItems: any[]) => {
              const nonScrapedItems = prevItems.filter((item: any) => !item.id.startsWith('scraped-'))
              const updatedItems = [...nonScrapedItems, ...scrapedItems]
              console.log('📊 Total items after scraping refresh:', updatedItems.length)
              console.log('📊 Scraped items after scraping:', scrapedItems.length)
              return updatedItems
            })
          }
        }
      } catch (refreshError) {
        console.error('❌ Error refreshing scraped contents after scraping:', refreshError)
      }
      
    } catch (error) {
      console.error('❌ Error scraping URL:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown'
      })
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showToast(`Failed to scrape webpage: ${errorMessage}`, 'error')
    } finally {
      console.log('🔍 Setting isScraping to false')
      setIsScraping(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      {viewerContent && (
        <ContentViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          content={viewerContent}
        />
      )}
      <div className="flex space-x-2">
        <Input 
          placeholder="Paste URL here..." 
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleScrapeUrl()}
          className="flex-1 text-sm border-[#D1D5DB] focus:ring-[#393E46] focus:border-[#393E46] bg-[#F9FAFB]" 
        />
        <Button 
          size="sm" 
          onClick={() => {
            console.log('🔍 Add button clicked!')
            console.log('🔍 URL input value:', urlInput)
            console.log('🔍 isScraping:', isScraping)
            console.log('🔍 urlInput.trim():', urlInput.trim())
            handleScrapeUrl()
          }}
          disabled={isScraping || !urlInput.trim()}
          className="bg-[#393E46] hover:bg-[#2C3036] text-white disabled:opacity-50"
        >
          {isScraping ? 'Scraping...' : 'Add'}
        </Button>

            </div>
      
      <div className="space-y-2">
        {isLoadingTabContent ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-2 rounded-lg border border-gray-200 animate-pulse">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : webpageItems.length > 0 ? (
          webpageItems.map((item: any, index: number) => (
            <div 
              key={item.id} 
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#EEEEEE] cursor-pointer transition-colors"
              onClick={() => handleViewContent(item)}
            >
              <Link2 className="h-4 w-4 text-[#929AAB]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.resourceName || item.filename}</p>
                <p className="text-xs text-[#929AAB]">
                  Webpage Content
                </p>
                <p className="text-xs text-blue-500 mt-1 opacity-75">
                  👆 Click to view
                </p>
          </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(item.id, item.filename)
                  }}
                  disabled={isDeleting && deletingItemId === item.id}
                  className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  {isDeleting && deletingItemId === item.id ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </Button>
        </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Link2 className="h-8 w-8 text-[#929AAB] mx-auto mb-2" />
            <p className="text-sm text-[#929AAB]">No links or scraped content yet</p>
            <p className="text-xs text-[#929AAB] mt-1">Add a URL to scrape content</p>
          </div>
        )}
      </div>
    </div>
  )
}

// YouTube Transcription Tab Component
function YouTubeTab({ mediaItems, onDelete, onRefresh, setMediaItems, isDeleting, deletingItemId, isLoadingTabContent }: any) {
  const youtubeItems = mediaItems.filter((item: any) => item.type === 'youtube')
  const [urlInput, setUrlInput] = React.useState("")
  const [isTranscribing, setIsTranscribing] = React.useState(false)
  const [toast, setToast] = React.useState<{
    message: string
    type: 'success' | 'error' | 'info'
    isVisible: boolean
  }>({
    message: '',
    type: 'info',
    isVisible: false
  })
  
  const [viewerContent, setViewerContent] = React.useState<{
    title: string
    content: string
    sourceUrl?: string
    transcribedAt?: string
    filename?: string
  } | null>(null)
  
  const [isViewerOpen, setIsViewerOpen] = React.useState(false)
  
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({
      message,
      type,
      isVisible: true
    })
  }
  
  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  const handleViewContent = (item: any) => {
    if (item.content) {
      setViewerContent({
        title: item.filename || 'YouTube Transcription',
        content: item.content,
        sourceUrl: item.url,
        transcribedAt: item.uploadedAt?.toISOString(),
        filename: item.filename
      })
    } else {
      setViewerContent({
        title: item.filename || 'YouTube Transcription',
        content: 'Transcription not available...',
        sourceUrl: item.url,
        transcribedAt: item.uploadedAt?.toISOString(),
        filename: item.filename
      })
    }
    setIsViewerOpen(true)
  }
  
  const handleTranscribeYouTube = async () => {
    console.log('🎥 handleTranscribeYouTube called with URL:', urlInput)
    
    if (!urlInput.trim()) {
      console.log('❌ URL input is empty, returning early')
      showToast('Please enter a YouTube URL to transcribe', 'error')
      return
    }
    
    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    if (!youtubeRegex.test(urlInput.trim())) {
      showToast('Please enter a valid YouTube URL', 'error')
      return
    }
    
    try {
      setIsTranscribing(true)
      console.log('🎥 Getting access token...')
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("❌ No access token available")
        showToast('Authentication required. Please sign in again.', 'error')
        return
      }

      console.log('✅ Access token found:', accessToken ? 'Present' : 'Missing')
      console.log('🎥 Transcribing YouTube URL:', urlInput)
      
      const apiUrl = `/api/youtube-transcribe?url=${encodeURIComponent(urlInput.trim())}`
      console.log('🎥 Making request to:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 YouTube transcription response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ YouTube transcription failed:', response.status, errorData)
        showToast(`Failed to transcribe video: ${errorData.error || response.statusText}`, 'error')
        return
      }

      const result = await response.json()
      console.log('✅ YouTube transcription result:', result)
      
       if (result.success) {
         if (result.data && result.data.status === 'processing') {
           // Transcription is being processed
           showToast('YouTube transcription submitted! It will be available shortly in your media library.', 'info')
           setUrlInput("")
           
           // Refresh media items to show the new transcription
           setTimeout(() => {
             onRefresh()
           }, 2000)
         } else if (result.data && result.data.content) {
           // Transcription completed immediately
           const transcriptionItem = {
             id: `youtube-${Date.now()}`,
             filename: result.data.resource_name || `youtube_transcription_${new Date().toISOString().split('T')[0]}.txt`,
             type: 'youtube',
             url: urlInput.trim(),
             uploadedAt: new Date(),
             size: result.data.content?.length || 0,
             content: result.data.content || 'No transcription available',
             title: result.data.resource_name || result.data.title || 'YouTube Video',
             duration: result.data.duration,
             channel: result.data.channel,
             resourceName: result.data.resource_name
           }
           
           // Add to media items
           setMediaItems((prevItems: any[]) => [...prevItems, transcriptionItem])
           
           // Clear input
           setUrlInput("")
           
           showToast('YouTube video transcribed successfully!', 'success')
         } else {
           // Success but no data - might be processing
           showToast('YouTube transcription submitted! Check your media library shortly.', 'info')
           setUrlInput("")
           
           // Refresh media items
           setTimeout(() => {
             onRefresh()
           }, 2000)
         }
       } else {
         showToast('Failed to transcribe video. Please try again.', 'error')
       }
      
    } catch (error) {
      console.error('❌ Error transcribing YouTube video:', error)
      showToast('An error occurred while transcribing the video', 'error')
    } finally {
      setIsTranscribing(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      {viewerContent && (
        <ContentViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          content={viewerContent}
        />
      )}
      
      <div className="flex space-x-2">
        <Input 
          placeholder="Paste YouTube URL here..." 
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleTranscribeYouTube()}
          className="flex-1 text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" 
        />
        <Button 
          size="sm" 
          onClick={handleTranscribeYouTube}
          disabled={isTranscribing || !urlInput.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {isTranscribing ? 'Transcribing...' : 'Transcribe'}
        </Button>
      </div>
      
      <div className="space-y-2">
        {isLoadingTabContent ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : youtubeItems.length > 0 ? (
          youtubeItems.map((item: any, index: number) => (
            <div 
              key={item.id} 
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
              onClick={() => handleViewContent(item)}
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-900">{item.resourceName || item.title || item.filename}</p>
                <p className="text-xs text-gray-500">
                  {item.channel && `Channel: ${item.channel}`}
                  {item.duration && ` • ${item.duration}`}
                </p>
                <p className="text-xs text-blue-500 mt-1 opacity-75">
                  👆 Click to view
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(item.id, item.filename)
                  }}
                  disabled={isDeleting && deletingItemId === item.id}
                  className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  {isDeleting && deletingItemId === item.id ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-2">No YouTube transcriptions yet</p>
            <p className="text-xs text-gray-500">Paste a YouTube URL to transcribe the video</p>
        </div>
      )}
    </div>
    </div>
  )
}

function ImageAnalyzerTab({ mediaItems, onUpload, onDelete, isDeleting, deletingItemId, isLoadingTabContent }: any) {
  const [dragActive, setDragActive] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [analyzingImageId, setAnalyzingImageId] = React.useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = React.useState<{[key: string]: any}>({})
  const [selectedImageAnalysis, setSelectedImageAnalysis] = React.useState<any>(null)
  const [showAnalysisPopup, setShowAnalysisPopup] = React.useState<any>(null)
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  })
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const imageItems = React.useMemo(() => 
    mediaItems.filter((item: any) => 
      ['image', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(item.type)
    ), [mediaItems]
  )
  
  // Check for existing analysis content when component mounts
  React.useEffect(() => {
    const checkExistingAnalysis = async () => {
      const imageItemsWithContent = imageItems.filter((item: any) => item.content)
      
      if (imageItemsWithContent.length > 0) {
        const existingAnalysis: Record<string, any> = {}
        
        imageItemsWithContent.forEach((item: any) => {
          existingAnalysis[item.id] = {
            id: item.id,
            filename: item.filename,
            analysis: {
              textContent: item.content,
              description: item.content,
              objects: [],
              colors: [],
              suggestions: []
            },
            analyzedAt: item.created_at || new Date().toISOString()
          }
        })
        
        setAnalysisResults(prev => ({
          ...prev,
          ...existingAnalysis
        }))
      }
    }
    
    checkExistingAnalysis()
  }, [imageItems])
  
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({
      message,
      type,
      isVisible: true
    })
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }))
    }, 3000)
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    if (files.length > 0 && onUpload) {
      setIsUploading(true)
      await onUpload(files)
      setIsUploading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type.startsWith('image/')
    )
    if (files.length > 0 && onUpload) {
      setIsUploading(true)
      await onUpload(files)
      setIsUploading(false)
    }
  }

  const handleAnalyzeImage = async (imageId: string, imageItem: any) => {
    setIsAnalyzing(true)
    setAnalyzingImageId(imageId)
    
    try {
      const token = await authService.getAuthToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      console.log('🔍 Analyzing image:', imageId)
      
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          media_id: imageId
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Image analysis result:', result)
      
      // Extract the data from the API response
      const analysisData = result.data || result
      
      // Process the real analysis result from the webhook
      // Only use data from the API, no frontend defaults
      let analysisText = ''
      if (Array.isArray(analysisData) && analysisData.length > 0) {
        analysisText = analysisData[0]?.text || analysisData[0] || ''
      } else if (typeof analysisData === 'string') {
        analysisText = analysisData
      } else if (analysisData?.text) {
        analysisText = analysisData.text
      } else {
        analysisText = ''
      }

      const analysisResult = {
        id: imageId,
        filename: imageItem.filename,
        analysis: {
          textContent: analysisText,
          description: analysisText,
          // Only use API data, no defaults
          objects: analysisData.objects || analysisData.detected_objects || [],
          colors: analysisData.colors || analysisData.color_palette || [],
          sentiment: analysisData.sentiment || '',
          adElements: {
            hasCallToAction: analysisData.has_cta || analysisData.ad_elements?.hasCallToAction || false,
            hasProductImage: analysisData.has_product || analysisData.ad_elements?.hasProductImage || false,
            hasCompanyLogo: analysisData.has_logo || analysisData.ad_elements?.hasLogo || false,
            hasContactInfo: analysisData.has_contact || analysisData.ad_elements?.hasContactInfo || false
          },
          suggestions: analysisData.suggestions || analysisData.recommendations || []
        },
        analyzedAt: new Date().toISOString(),
        rawData: analysisData // Store the complete response for debugging
      }
      
      setAnalysisResults(prev => ({
        ...prev,
        [imageId]: {
          ...analysisResult,
          // Preserve existing content if new analysis doesn't provide it
          analysis: {
            ...analysisResult.analysis,
            textContent: analysisResult.analysis.textContent || imageItem.content || '',
            description: analysisResult.analysis.description || imageItem.content || ''
          }
        }
      }))
      
      showToast('Image analysis completed!', 'success')
    } catch (error) {
      console.error('❌ Error analyzing image:', error)
      showToast('Failed to analyze image. Please try again.', 'error')
    } finally {
      setIsAnalyzing(false)
      setAnalyzingImageId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer group ${
          dragActive 
            ? 'border-[#1ABC9C] bg-[#1ABC9C]/10 scale-[1.02]' 
            : 'border-gray-300 hover:border-[#1ABC9C] hover:bg-gray-50'
        } ${isUploading ? 'pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center">
          <div className={`p-3 rounded-full mb-4 transition-colors ${
            dragActive ? 'bg-[#1ABC9C]/20' : 'bg-gray-100 group-hover:bg-[#1ABC9C]/10'
          }`}>
            <Image className={`h-8 w-8 ${
              isUploading ? 'animate-pulse text-[#1ABC9C]' : 
              dragActive ? 'text-[#1ABC9C]' : 'text-gray-400 group-hover:text-[#1ABC9C]'
            }`} />
          </div>
          
          <h3 className={`text-lg font-semibold mb-2 transition-colors ${
            isUploading ? 'text-[#1ABC9C]' : 'text-gray-700'
          }`}>
            {isUploading ? "Processing images..." : "Upload Ad Images"}
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            {isUploading ? "Please wait while we upload your images" : "Drag and drop your ad images here, or click to browse"}
          </p>
          
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span>Supports:</span>
            <span className="px-2 py-1 bg-gray-100 rounded">JPG</span>
            <span className="px-2 py-1 bg-gray-100 rounded">PNG</span>
            <span className="px-2 py-1 bg-gray-100 rounded">GIF</span>
            <span className="px-2 py-1 bg-gray-100 rounded">WEBP</span>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Image list */}
      <div className="space-y-2">
        {imageItems.length > 0 ? (
          imageItems.map((item: any, index: number) => {
            const hasAnalysis = analysisResults[item.id] || item.content
            const isCurrentlyAnalyzing = analyzingImageId === item.id
            
            return (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Image className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.filename}</h4>
                                          <div className="flex items-center space-x-3 mt-1 mb-3">
                      {hasAnalysis && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                          Analyzed
                        </span>
                      )}
                      {isCurrentlyAnalyzing && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1 animate-pulse"></div>
                          Analyzing...
                        </span>
                      )}
                    </div>
                      <p className="text-xs text-blue-500 mt-1 opacity-75">
                        👆 Click buttons to view/analyze
                      </p>
                      
                      {/* Buttons moved under the filename */}
                      <div className="flex items-center space-x-2">
                        {hasAnalysis ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAnalysisPopup({
                              id: item.id,
                              filename: item.filename,
                              analysis: {
                                textContent: item.content || analysisResults[item.id]?.analysis?.textContent || '',
                                description: item.content || analysisResults[item.id]?.analysis?.description || '',
                                objects: analysisResults[item.id]?.analysis?.objects || [],
                                colors: analysisResults[item.id]?.analysis?.colors || [],
                                suggestions: analysisResults[item.id]?.analysis?.suggestions || []
                              },
                              analyzedAt: item.created_at || analysisResults[item.id]?.analyzedAt || new Date().toISOString()
                            })}
                            className="h-8 px-3 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            View Analysis
                          </Button>
                        ) : null}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAnalyzeImage(item.id, item)}
                          disabled={isAnalyzing}
                          className="h-8 px-3 text-xs border-[#1ABC9C] text-[#1ABC9C] hover:bg-[#1ABC9C]/10 disabled:opacity-50"
                        >
                          {isCurrentlyAnalyzing ? 'Analyzing...' : hasAnalysis ? 'Re-analyze' : 'Analyze'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(item.id, item.filename)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <Image className="h-8 w-8 text-[#929AAB] mx-auto mb-2" />
            <p className="text-sm text-[#929AAB]">No ad images uploaded yet</p>
            <p className="text-xs text-[#929AAB] mt-1">Upload images to analyze ad content</p>
          </div>
        )}
      </div>

      {/* Analysis Results Panel */}
      {selectedImageAnalysis && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Analysis Results</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImageAnalysis(null)}
              className="h-6 w-6 p-0 hover:bg-gray-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">{selectedImageAnalysis.filename}</h4>
              <div className="bg-white p-4 rounded-lg border">
                <h5 className="font-medium text-gray-800 mb-3">AI Analysis</h5>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedImageAnalysis.analysis.textContent}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Detected Objects</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedImageAnalysis.analysis.objects.map((obj: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {obj}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-2">Color Palette</h5>
                <div className="flex gap-2">
                  {selectedImageAnalysis.analysis.colors.map((color: string, idx: number) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: color }}
                      title={color}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-700 mb-2">Ad Elements</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${selectedImageAnalysis.analysis.adElements.hasCallToAction ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Call to Action</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${selectedImageAnalysis.analysis.adElements.hasProductImage ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Product Image</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${selectedImageAnalysis.analysis.adElements.hasCompanyLogo ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Company Logo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${selectedImageAnalysis.analysis.adElements.hasContactInfo ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Contact Info</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-700 mb-2">Analysis Summary</h5>
              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  {selectedImageAnalysis.analysis.description}
                </p>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-700 mb-2">Suggestions</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {selectedImageAnalysis.analysis.suggestions.map((suggestion: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-gray-400">
              Analyzed at: {new Date(selectedImageAnalysis.analyzedAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Popup */}
      {showAnalysisPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Image Analysis Results
                </h3>
                <p className="text-sm text-gray-600 mt-1">{showAnalysisPopup.filename}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(showAnalysisPopup.analysis.textContent)
                    showToast('Analysis copied to clipboard!', 'success')
                  }}
                  className="h-8 px-3 text-xs border-green-200 text-green-600 hover:bg-green-50"
                >
                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnalysisPopup(null)}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              <div className="space-y-6">
                {/* Main Analysis Content - Only API Data */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI Analysis
                    </h4>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {showAnalysisPopup.analysis.textContent ? 'Content Available' : 'No Content'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-lg border border-blue-200">
                    {showAnalysisPopup.analysis.textContent || 'No analysis content available'}
                  </div>
                </div>

                {/* Only show other sections if API provides data */}
                {showAnalysisPopup.analysis.objects && showAnalysisPopup.analysis.objects.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                      <svg className="h-4 w-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                      </svg>
                      Detected Objects
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {showAnalysisPopup.analysis.objects.map((obj: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200">
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {showAnalysisPopup.analysis.colors && showAnalysisPopup.analysis.colors.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                      <svg className="h-4 w-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                      </svg>
                      Color Palette
                    </h4>
                    <div className="flex gap-3">
                      {showAnalysisPopup.analysis.colors.map((color: string, idx: number) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div
                            className="w-10 h-10 rounded-lg border-2 border-white shadow-md"
                            style={{ backgroundColor: color }}
                            title={color}
                          ></div>
                          <span className="text-xs text-gray-500 mt-2 font-mono">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showAnalysisPopup.analysis.suggestions && showAnalysisPopup.analysis.suggestions.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                      <svg className="h-4 w-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Suggestions
                    </h4>
                    <ul className="space-y-2">
                      {showAnalysisPopup.analysis.suggestions.map((suggestion: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-3 bg-white p-3 rounded border-l-4 border-yellow-400">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span className="text-sm text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-xs text-gray-400 pt-4 border-t bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Analyzed at: {new Date(showAnalysisPopup.analyzedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
}

function TranscriptsTab({ mediaItems, onDelete, isDeleting, deletingItemId, isLoadingTabContent }: any) {
  const audioVideoItems = mediaItems.filter((item: any) => 
    ['audio', 'video'].includes(item.type)
  )
  
  return (
    <div className="space-y-4">
      {audioVideoItems.length > 0 ? (
        <div className="space-y-2">
          {audioVideoItems.map((item: any, index: number) => (
            <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#EEEEEE]">
              <Mic className="h-4 w-4 text-[#929AAB]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.filename}</p>
                <p className="text-xs text-[#929AAB]">
                  {item.metadata?.duration || 'Unknown duration'}
                </p>
              </div>
              <ThreeDotsMenu 
                onDelete={() => onDelete(item.id, item.filename)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Mic className="h-8 w-8 text-[#929AAB] mx-auto mb-2" />
          <p className="text-sm text-[#929AAB]">No transcripts yet</p>
          <p className="text-xs text-[#929AAB] mt-1">Upload audio or video files to transcribe</p>
        </div>
      )}
    </div>
  )
}