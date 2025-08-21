"use client"

import * as React from "react"
import { motion } from "motion/react"
import { 
  Menu, Search, Bell, User, MessageSquare, Plus, 
  Bot, Settings, Upload, FileText, Link2, Mic, 
  PanelLeftClose, PanelRightClose, Send, Paperclip,
  ChevronRight, MoreHorizontal, Star, Clock, Zap, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { AnimatedText, FadeInText, SlideInText, WordByWordText } from "@/components/ui/animated-text"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { sampleAgents, sampleConversations } from "@/lib/sample-data"
import { authService } from "@/lib/auth-service"
import { ChatInterface } from "@/components/chat-interface"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { API_ENDPOINTS, getAuthHeaders } from "@/lib/api-config"

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

// Initial ChatGPT-like Interface
function InitialInterface({ agents, selectedAgent, onSelectAgent, onSendMessage, onRefreshAgents, isLoadingAgents }: any) {
  const [message, setMessage] = React.useState("")

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickPrompts = [
    "Create an Instagram ad for a new fitness app",
    "Write a Facebook ad for a local restaurant",
    "Generate email subject lines for a sale",
    "Draft LinkedIn ad copy for B2B software"
  ]

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full max-w-2xl mx-auto">
        {/* Logo and Title */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="Copy Ready logo" 
              width={64} 
              height={64}
              className="rounded-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-[#393E46] mb-2">What can I help with?</h1>
          <p className="text-lg text-[#929AAB]">Choose an AI agent and start creating high-converting ad copy</p>
        </motion.div>

        {/* Agent Selector */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#929AAB] uppercase tracking-wider">Select AI Agent</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshAgents}
              disabled={isLoadingAgents}
              className="flex items-center space-x-2 bg-[#1ABC9C] hover:bg-[#1ABC9C]/90 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingAgents ? 'animate-spin' : ''}`} />
              <span className="text-xs font-medium">Refresh</span>
            </Button>
          </div>
          <AgentSelector 
            agents={agents}
            selectedAgent={selectedAgent}
            onSelectAgent={onSelectAgent}
            onOpenChange={() => {}}
            isLoading={isLoadingAgents}
            onRefresh={onRefreshAgents}
          />
        </motion.div>

        {/* Input Area */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center space-x-2 p-4 border border-[#EEEEEE] rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedAgent ? `Ask ${selectedAgent} to create ad copy...` : "Select an agent to start chatting..."}
              disabled={!selectedAgent}
              className="flex-1 border-0 text-lg placeholder:text-[#929AAB] focus:ring-0 focus:outline-none bg-transparent"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || !selectedAgent}
              size="sm"
              className="bg-[#1ABC9C] hover:bg-[#1ABC9C]/90 text-black px-4 py-2 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Quick Prompts */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {quickPrompts.map((prompt, index) => (
            <motion.button
              key={index}
              onClick={() => setMessage(prompt)}
              className="p-4 text-left border border-[#EEEEEE] rounded-xl hover:border-[#1ABC9C] hover:bg-[#1ABC9C]/5 transition-all duration-200 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="text-sm text-[#393E46] group-hover:text-[#1ABC9C]">{prompt}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Footer Text */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-xs text-[#929AAB]">
            AI can make mistakes. Verify important information and review all generated content.
          </p>
        </motion.div>
      </div>
    </motion.div>
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

// Agent Selector Component
function AgentSelector({ agents, selectedAgent, onSelectAgent, onOpenChange, isLoading, onRefresh }: any) {
  const [isOpen, setIsOpen] = React.useState(false)
  const currentAgent = agents.find((agent: any) => agent.name === selectedAgent)

  const handleOpenChange = (newIsOpen: boolean) => {
    setIsOpen(newIsOpen)
    onOpenChange?.(newIsOpen)
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => handleOpenChange(!isOpen)}
        onMouseEnter={() => handleOpenChange(true)}
        className="w-full text-left p-3 rounded-lg border border-[#EEEEEE] bg-white hover:bg-[#F9FAFB] transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <span className="text-lg flex-shrink-0">{currentAgent?.icon || "🤖"}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{currentAgent?.name || "Select Agent"}</div>
              <div className="text-xs text-[#929AAB] line-clamp-2 leading-relaxed mt-0.5">{currentAgent?.description || "Choose an AI agent"}</div>
            </div>
          </div>
          <ChevronRight className={`h-4 w-4 text-[#929AAB] transition-transform flex-shrink-0 mt-0.5 ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </motion.button>

      {/* Agent Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onMouseLeave={() => handleOpenChange(false)}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#EEEEEE] rounded-lg shadow-xl z-[100] max-h-72 overflow-y-auto"
        >
          <div className="p-2">
            <div className="text-xs font-medium text-[#929AAB] uppercase tracking-wider px-2 py-1 mb-1">
              Available Agents
            </div>
            {agents.map((agent: any) => (
              <motion.button
                key={agent.id}
                onClick={() => {
                  onSelectAgent(agent.name)
                  handleOpenChange(false)
                }}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  selectedAgent === agent.name 
                    ? 'bg-[#F0F9FF] border border-[#0EA5E9]' 
                    : 'hover:bg-[#F9FAFB]'
                }`}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-lg flex-shrink-0">{agent.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{agent.name}</div>
                    <div className="text-xs text-[#929AAB] line-clamp-2 leading-relaxed mt-0.5">{agent.description}</div>
                  </div>
                  {selectedAgent === agent.name && (
                    <div className="w-2 h-2 bg-[#0EA5E9] rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [leftPanelOpen, setLeftPanelOpen] = React.useState(true)
  const [rightPanelOpen, setRightPanelOpen] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<'files' | 'links' | 'transcripts'>('files')
  const [selectedAgent, setSelectedAgent] = React.useState("CopyMaster Pro")
  const [agents, setAgents] = React.useState<any[]>([])
  const [isLoadingAgents, setIsLoadingAgents] = React.useState(false)
  const [chatStarted, setChatStarted] = React.useState(false)
  const [hasInitializedChat, setHasInitializedChat] = React.useState(false)

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
          setMessages(parsedMessages)
          console.log('📱 Loaded saved messages from localStorage:', parsedMessages.length, 'messages')
        } catch (error) {
          console.error('Error parsing saved messages:', error)
        }
      }
    }
  }, [])

  // Fetch agents from n8n webhook
  const fetchAgents = async () => {
    try {
      setIsLoadingAgents(true)
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("No access token available")
        return
      }

      console.log('Fetching agents from n8n webhook...')
      console.log('Request URL:', '/api/agents/list')
      console.log('Request headers:', {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      })

      const response = await fetch('/api/agents/list', {
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
      
      // Set the first agent as selected if none is selected
      if (transformedAgents.length > 0 && !selectedAgent) {
        setSelectedAgent(transformedAgents[0].name)
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
      
      // Fallback: If no agents loaded, show default agents
      // Note: This fallback is now handled in the main logic above
    }
  }

  // Refresh agents function
  const refreshAgents = async () => {
    console.log('Refreshing agents...')
    await fetchAgents()
  }

  // Start new conversation function
  const startNewConversation = async () => {
    console.log('🔄 Starting new conversation...')
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
    
    // Wait a bit then initialize new chat
    setTimeout(async () => {
      await initiateNewChat(true) // Force new session
    }, 100)
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

  // Empty conversations array - no mock data
  const conversations: any[] = []

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

  // Get current user info from auth context
  const currentUser = user

  // Fetch agents and media library on component mount
  React.useEffect(() => {
    if (isAuthenticated && currentUser) {
      console.log('Dashboard mounted - fetching agents and media library...')
      fetchAgents()
      fetchMediaLibrary()
    }
  }, [isAuthenticated, currentUser])

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



  // Handle new chat webhook - just get session ID
  const initiateNewChat = async (forceNew = false) => {
    try {
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

      const response = await fetch('/api/webhook/new-chat', {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({
          agent_id: agentId
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
      if (data.session_id) {
        setSessionId(data.session_id)
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('chat_session_id', data.session_id)
        }
        console.log('🎯 SESSION ID STORED:', data.session_id)
        console.log('📋 Full webhook response:', data)
      } else {
        console.warn('⚠️ No session_id in webhook response')
        console.log('📋 Full webhook response:', data)
      }
      
      return true
    } catch (error) {
      console.error('Error initiating new chat:', error)
      return false
    }
  }

  // Send message to chat window webhook
  const sendMessageToChatWindow = async (userPrompt: string) => {
    try {
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("No access token available")
        return null
      }

      if (!sessionId) {
        console.error("No session ID available")
        return null
      }

      // Find the selected agent's ID from the agents array
      const selectedAgentData = agents.find(agent => agent.name === selectedAgent)
      const agentId = selectedAgentData?.id || selectedAgent

      console.log('💬 Sending message to chat window...')
      console.log('Request URL:', '/api/webhook/chat-window')
      console.log('Session ID:', sessionId)
      console.log('User Prompt:', userPrompt)
      console.log('Selected Agent Name:', selectedAgent)
      console.log('Selected Agent ID:', agentId)

      const response = await fetch('/api/webhook/chat-window', {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({
          session_id: sessionId,
          user_prompt: userPrompt,
          agent_id: agentId
        }),
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
      return data
    } catch (error) {
      console.error('Error sending message to chat window:', error)
      return null
    }
  }

  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentUser) return

        // Mark chat as started on first message
    if (!chatStarted) {
      setChatStarted(true)
      // Save chat state to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('chat_started', 'true')
      }
      
      // Call webhook to get session ID only when user actually starts chatting
      if (!sessionId) {
        console.log('🎯 User started first conversation - calling new chat webhook...')
        const webhookSuccess = await initiateNewChat()
        if (!webhookSuccess) {
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
      }
      return newMessages
    })
    setIsLoading(true)

    try {
      // Send message to chat window webhook
      console.log('💬 Sending message with Session ID:', sessionId || 'new-session')
      const response = await sendMessageToChatWindow(content.trim())

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
        setMessages(prev => {
          const newMessages = [...prev, aiMessage]
          // Save messages to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('chat_messages', JSON.stringify(newMessages))
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
      setIsLoading(false)
    }
  }

  // Fetch media library data
  const fetchMediaLibrary = async () => {
    try {
      setIsRefreshing(true)
      const accessToken = authService.getAuthToken()
      
      if (!accessToken) {
        console.error("No access token available")
        return
      }

      const response = await fetch('/api/mock/media/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized - token may be expired")
          return
        }
        if (response.status === 404) {
          console.log("No media items found (404) - setting empty array")
          setMediaItems([])
          return
        }
        throw new Error('Failed to fetch media library')
      }

      const data = await response.json()
      console.log('Media library API response:', data)
      
      // Handle case where data might be empty or null
      if (!data || !Array.isArray(data)) {
        console.log('No valid data received, setting empty array')
        setMediaItems([])
        return
      }
      
      // Transform the API response to match our MediaItem interface
      const transformedItems = data.map((item: any) => ({
        id: item.media_id.toString(),
        userId: 'current_user',
        filename: item.file_name,
        type: getFileType(item.file_type || item.file_name),
        size: parseFloat(item.media_size) * 1024 * 1024, // Convert MB to bytes
        uploadedAt: new Date(),
        tags: [],
        metadata: {
          storageStatus: item.storage_status
        }
      }))

      console.log('Transformed media items:', transformedItems)
      setMediaItems(transformedItems)
    } catch (error) {
      console.error('Error fetching media library:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getFileType = (fileType: string | null): any => {
    if (!fileType) return 'doc'
    
    if (fileType.startsWith('image/')) return 'doc'
    if (fileType.startsWith('video/')) return 'video'
    if (fileType.startsWith('audio/')) return 'audio'
    if (fileType.includes('pdf')) return 'pdf'
    if (fileType.includes('doc')) return 'doc'
    if (fileType.includes('txt')) return 'txt'
    
    return 'doc'
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

        const response = await fetch('/api/mock/media/upload', {
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
        
        // Add the new file to the media items list if we have valid data
        if (newMediaItem) {
          setMediaItems(prev => [newMediaItem, ...prev])
          console.log('Added new file to media items:', newMediaItem)
        } else {
          console.warn('Could not create media item from upload response:', data)
        }
      }

      console.log('All uploads completed')
      
      // Fallback: Refresh the media library to ensure all files are visible
      // This ensures that even if the immediate state update fails, the files will appear
      setTimeout(() => {
        console.log('Performing fallback refresh of media library...')
        fetchMediaLibrary()
      }, 1000)
      
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

      console.log('Deleting file:', filename, 'with media ID:', mediaId)
      console.log('Request URL:', 'https://n8n.srv934833.hstgr.cloud/webhook/delete-media-file')
      console.log('Request headers:', {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      })
      console.log('Request body:', {
        access_token: accessToken,
        file_name: filename
      })

      const response = await fetch('https://n8n.srv934833.hstgr.cloud/webhook/delete-media-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          file_name: filename
        }),
      })

      if (!response.ok) {
        console.error('Delete failed for file:', filename, 'Status:', response.status)
        console.error('Response headers:', response.headers)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error details:', errorData)
        console.error('Request body sent:', {
          access_token: accessToken,
          file_name: filename
        })
        return false
      }

      const data = await response.json()
      console.log('Delete successful for file:', filename, data)
      
      // Remove the file from the local state
      setMediaItems(prev => prev.filter(item => item.id !== mediaId))
      
      return true
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 text-slate-800 font-sans">
      {!chatStarted ? (
        // Initial ChatGPT-like interface
        <InitialInterface 
          agents={agents}
          selectedAgent={selectedAgent}
          onSelectAgent={setSelectedAgent}
          onSendMessage={handleSendMessage}
          onRefreshAgents={refreshAgents}
          isLoadingAgents={isLoadingAgents}
        />
      ) : (
        // Full dashboard with chat interface
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full"
        >
      {/* Header */}
      <header className="h-16 border-b border-slate-200/60 bg-white/90 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 bg-white border-[#EEEEEE]">
                <MobileSidebar agents={agents} conversations={conversations} />
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
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
            <span className="font-semibold text-lg hidden sm:block">Copy Ready</span>
          </div>

          {/* Active Agent Chip */}
          <div className="hidden md:flex items-center space-x-2 bg-[#F7F7F7] px-3 py-1.5 rounded-full border border-[#EEEEEE]">
            <Bot className="h-4 w-4 text-[#393E46]" />
            <span className="text-sm font-medium">{selectedAgent}</span>
          </div>

          {/* New Chat Button */}
          <Button
            onClick={startNewConversation}
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center space-x-2 text-[#393E46] border-[#EEEEEE] hover:bg-[#F7F7F7]"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </Button>

          {/* Fresh Start Button */}
          <Button
            onClick={startFreshDashboard}
            variant="ghost"
            size="sm"
            className="hidden sm:flex items-center space-x-2 text-[#929AAB] hover:text-[#393E46] hover:bg-[#F7F7F7]"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Fresh Start</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Desktop panel toggles */}
          <TooltipProvider>
            <div className="hidden xl:flex items-center space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                    className="h-8 w-8 text-[#929AAB] hover:text-[#393E46] hover:bg-[#F7F7F7]"
                  >
                    <PanelLeftClose className={`h-4 w-4 transition-transform ${!leftPanelOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{leftPanelOpen ? 'Hide sidebar' : 'Show sidebar'}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                    className="h-8 w-8 text-[#929AAB] hover:text-[#393E46] hover:bg-[#F7F7F7]"
                  >
                    <PanelRightClose className={`h-4 w-4 transition-transform ${!rightPanelOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{rightPanelOpen ? 'Hide media library' : 'Show media library'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-[#929AAB] hover:text-[#393E46] hover:bg-[#F7F7F7]"
                  onClick={() => window.location.href = '/knowledge-base'}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Brand Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3 text-[#929AAB] hover:text-[#393E46] hover:bg-[#F7F7F7] text-xs"
                  onClick={logout}
                >
                  Logout
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Return to landing page</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#393E46] text-white text-xs">SJ</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Agents & Conversations */}
        <motion.div 
          className={`hidden lg:flex flex-col bg-gradient-to-b from-white via-slate-50 to-white border-r border-slate-200/60 transition-all duration-300 shadow-sm ${
            leftPanelOpen ? 'w-80' : 'w-0'
          }`}
          initial={false}
          animate={{ width: leftPanelOpen ? 320 : 0 }}
        >
          <div className="flex-1 overflow-y-auto">
            <LeftSidebar 
          agents={agents} 
          conversations={conversations} 
          selectedAgent={selectedAgent} 
          onSelectAgent={setSelectedAgent} 
          isLoadingAgents={isLoadingAgents} 
          onRefreshAgents={refreshAgents}
          setChatStarted={setChatStarted}
          setMessages={setMessages}
          setSessionId={setSessionId}
          initiateNewChat={initiateNewChat}
        />
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 h-full">
          <div className="flex-1 w-full h-full">
            <ChatInterface 
              messages={messages} 
              selectedAgent={selectedAgent}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
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
                  <div className="flex-1 overflow-y-auto">
          <MediaDrawer 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            mediaItems={mediaItems}
            onRefresh={fetchMediaLibrary}
            onUpload={uploadMediaFiles}
            onDelete={deleteMediaFile}
            isRefreshing={isRefreshing}
          />
        </div>
        </motion.div>
      </div>

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
        </motion.div>
      )}
    </div>
    </ProtectedRoute>
  )
}

// Left Sidebar Component
function LeftSidebar({ agents, conversations, selectedAgent, onSelectAgent, isLoadingAgents, onRefreshAgents, setChatStarted, setMessages, setSessionId, initiateNewChat }: any) {
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = React.useState(false)

  return (
    <div className="h-full flex flex-col">
      {/* Agent Selector */}
      <div className="p-5 border-b border-slate-200/60">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Current Agent</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshAgents}
            disabled={isLoadingAgents}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#1ABC9C] to-emerald-500 hover:from-[#1ABC9C]/90 hover:to-emerald-500/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
          >
            <RefreshCw className={`h-3 w-3 ${isLoadingAgents ? 'animate-spin' : ''}`} />
            <span className="text-xs font-medium">Refresh</span>
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

      {/* Conversations Section */}
      <div className="flex-1 flex flex-col">
        <div className="p-5 pb-3 border-b border-slate-200/60">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Conversations</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={async () => {
                      console.log('🔄 Starting new chat (sidebar) - clearing session ID')
                      setChatStarted(false)
                      setMessages([])
                      setSessionId('') // Clear session ID for new chat
                      
                      // Call new chat webhook when user clicks sidebar new chat button
                      const webhookSuccess = await initiateNewChat()
                      if (!webhookSuccess) {
                        console.warn('New chat webhook failed, but continuing with new chat')
                      }
                    }}
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
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
        <div className={`flex-1 p-5 pt-3 ${isAgentSelectorOpen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <div className="space-y-2">
          {conversations.length > 0 ? (
            conversations.map((conv: any) => (
              <motion.div
                key={conv.id}
                className="p-4 rounded-xl hover:bg-white/80 cursor-pointer border border-slate-200/60 hover:border-slate-300 bg-white/40 hover:shadow-sm transition-all duration-200"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm truncate pr-2 text-slate-800">{conv.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 flex-shrink-0 font-medium">{conv.time}</span>
                    <ThreeDotsMenu 
                      onDelete={() => console.log('Delete conversation:', conv.title)}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed">{conv.lastMessage}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">{conv.agent}</span>
                  <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                    conv.status === 'active' ? 'bg-emerald-400' : 
                    conv.status === 'review' ? 'bg-amber-400' : 'bg-slate-400'
                  }`} />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 mb-2">No conversations yet</p>
              <p className="text-xs text-slate-500">Start a new chat to begin</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Mobile Sidebar Component
function MobileSidebar({ agents, conversations }: any) {
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
      />
    </div>
  )
}

// Media Drawer Component  
function MediaDrawer({ activeTab, onTabChange, mediaItems, onRefresh, onUpload, onDelete, isRefreshing }: any) {
  const tabs = [
    { id: 'files' as const, label: 'Files', icon: FileText },
    { id: 'links' as const, label: 'Links', icon: Link2 },
    { id: 'transcripts' as const, label: 'Transcripts', icon: Mic },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header with tabs */}
      <div className="border-b border-[#EEEEEE] p-4">
        <div className="flex items-center justify-between mb-3">
          <SlideInText text="Media Library" className="font-medium" />
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 bg-[#1ABC9C] hover:bg-[#1ABC9C]/90 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-xs font-medium">Refresh</span>
          </Button>
        </div>
        <div className="flex space-x-1 bg-[#EEEEEE] p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-white text-[#393E46] shadow-sm' 
                  : 'text-[#929AAB] hover:text-[#393E46]'
              }`}
            >
              <tab.icon className="h-3 w-3" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'files' && <FilesTab mediaItems={mediaItems} onUpload={onUpload} onDelete={onDelete} />}
        {activeTab === 'links' && <LinksTab mediaItems={mediaItems} onDelete={onDelete} />}
        {activeTab === 'transcripts' && <TranscriptsTab mediaItems={mediaItems} onDelete={onDelete} />}
      </div>
    </div>
  )
}

// Media Tab Components
function FilesTab({ mediaItems, onUpload, onDelete }: any) {
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
      {/* Dropzone */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragActive 
            ? 'border-[#1ABC9C] bg-[#1ABC9C]/10' 
            : 'border-[#EEEEEE] hover:border-[#1ABC9C] hover:bg-[#1ABC9C]/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className={`h-6 w-6 mx-auto mb-2 ${isUploading ? 'animate-bounce' : ''} ${dragActive ? 'text-[#1ABC9C]' : 'text-[#929AAB]'}`} />
        <FadeInText 
          text={isUploading ? "Uploading files..." : "Drop files here"} 
          className={`text-sm font-medium mb-1 text-center ${isUploading ? 'text-[#1ABC9C]' : ''}`} 
        />
        <FadeInText 
          text={isUploading ? "Please wait..." : "or click to browse"} 
          className="text-xs text-[#929AAB] text-center" 
          delay={0.1} 
        />
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
      <div className="space-y-2">
        {fileItems.length > 0 ? (
          fileItems.slice(0, 8).map((item: any, index: number) => (
            <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#EEEEEE]">
              <FileText className="h-4 w-4 text-[#929AAB]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.filename}</p>
                <p className="text-xs text-[#929AAB]">
                  {item.size ? `${(item.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                </p>
              </div>
              <ThreeDotsMenu 
                onDelete={() => onDelete(item.id, item.filename)}
              />
            </div>
          ))
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

function LinksTab({ mediaItems, onDelete }: any) {
  const urlItems = mediaItems.filter((item: any) => item.type === 'url')
  
  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input placeholder="Paste URL here..." className="flex-1 text-sm border-[#D1D5DB] focus:ring-[#393E46] focus:border-[#393E46] bg-[#F9FAFB]" />
        <Button size="sm" className="bg-[#393E46] hover:bg-[#2C3036] text-white">Add</Button>
      </div>
      
      <div className="space-y-2">
        {urlItems.length > 0 ? (
          urlItems.map((item: any, index: number) => (
            <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#EEEEEE]">
              <Link2 className="h-4 w-4 text-[#929AAB]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.filename}</p>
                <p className="text-xs text-[#929AAB]">Scraped</p>
              </div>
              <ThreeDotsMenu 
                onDelete={() => onDelete(item.id, item.filename)}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Link2 className="h-8 w-8 text-[#929AAB] mx-auto mb-2" />
            <p className="text-sm text-[#929AAB]">No links added yet</p>
            <p className="text-xs text-[#929AAB] mt-1">Add a URL to scrape content</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TranscriptsTab({ mediaItems, onDelete }: any) {
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