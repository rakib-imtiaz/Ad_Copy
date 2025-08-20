"use client"

import * as React from "react"
import { motion } from "motion/react"
import { 
  Menu, Search, Bell, User, MessageSquare, Plus, 
  Bot, Settings, Upload, FileText, Link2, Mic, 
  PanelLeftClose, PanelRightClose, Send, Paperclip,
  ChevronRight, MoreHorizontal, Star, Clock, Zap
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
import { sampleAgents, sampleConversations, sampleMediaItems } from "@/lib/sample-data"
import { authService } from "@/lib/auth-service"
import { ChatInterface } from "@/components/chat-interface"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"

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

// Three Dots Menu Component
function ThreeDotsMenu({ onShare, onDelete, onRename }: any) {
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
                onClick={() => { onShare?.(); setIsOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#F9FAFB] rounded-md transition-colors"
              >
                Share
              </button>
              <button
                onClick={() => { onRename?.(); setIsOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#F9FAFB] rounded-md transition-colors"
              >
                Rename
              </button>
              <button
                onClick={() => { onDelete?.(); setIsOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#FEF2F2] text-red-600 rounded-md transition-colors"
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
function AgentSelector({ agents, selectedAgent, onSelectAgent, onOpenChange }: any) {
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

  // Enhanced sample data
  const agents = sampleAgents.map((agent, index) => ({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    icon: ["📱", "📧", "🎯", "✍️", "🎨"][index] || "🤖"
  }))

  const conversations = sampleConversations.map(conv => ({
    id: conv.id,
    title: conv.title,
    agent: agents.find(a => a.id === conv.agentId)?.name || "Unknown Agent",
    lastMessage: conv.messages[conv.messages.length - 1]?.content.substring(0, 50) + "...",
    time: formatTimeAgo(conv.updatedAt),
    status: "active"
  }))

  const [messages, setMessages] = React.useState<Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
    animated?: boolean
  }>>([
    { 
      id: '1',
      role: 'assistant' as const, 
      content: "Hi! I'm your AI agent. I can help you create high-converting ad copy and marketing content. What would you like to work on today?", 
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      animated: false 
    }
  ])
  const [isLoading, setIsLoading] = React.useState(false)
  const [sessionId, setSessionId] = React.useState(1)
  const [showCreditPopup, setShowCreditPopup] = React.useState(false)

  // Get current user info from auth context
  const currentUser = user

  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentUser) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      animated: false
    }

    // Add user message to chat
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Send message to n8n via auth service
      const response = await authService.sendChatMessage({
        email: currentUser.email,
        sessionId: sessionId,
        agentId: selectedAgent || 'adcopyaishahed@gmail.com',
        userPrompt: content.trim()
      })

      if (response.success) {
        // Add AI response to chat
        let content = 'I received your message but couldn\'t generate a response.';
        
        if (response.data?.response) {
          if (response.data.type === 'credit_error') {
            // Handle credit limit error
            content = response.data.response;
            setShowCreditPopup(true); // Show credit popup
          } else if (response.data.type === 'empty_response' || response.data.type === 'json_error') {
            // Handle empty or invalid responses
            content = response.data.response;
          } else if (response.data.type === 'html') {
            // Handle HTML response - extract text content
            const htmlContent = response.data.response;
            // Simple HTML to text conversion
            content = htmlContent
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
              .replace(/&amp;/g, '&') // Replace &amp; with &
              .replace(/&lt;/g, '<') // Replace &lt; with <
              .replace(/&gt;/g, '>') // Replace &gt; with >
              .trim();
            
            // If content is empty after HTML stripping, use a fallback
            if (!content) {
              content = 'Received HTML response from AI agent.';
            }
          } else {
            content = response.data.response;
          }
        } else if (response.data?.content) {
          content = response.data.content;
        } else if (response.data?.pageContent) {
          // Handle n8n response with pageContent field
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
        setMessages(prev => [...prev, aiMessage])
      } else {
        // Add error message
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: `Error: ${response.error?.message || 'Failed to send message'}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          animated: false
        }
        setMessages(prev => [...prev, errorMessage])
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
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white text-[#393E46] font-sans">
      {/* Header */}
      <header className="h-14 border-b border-[#EEEEEE] bg-white px-4 flex items-center justify-between sticky top-0 z-40">
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

      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left Sidebar - Agents & Conversations */}
        <motion.div 
          className={`hidden lg:flex flex-col bg-[#F7F7F7] border-r border-[#EEEEEE] transition-all duration-300 ${
            leftPanelOpen ? 'w-80' : 'w-0'
          }`}
          initial={false}
          animate={{ width: leftPanelOpen ? 320 : 0 }}
        >
          <div className="flex-1 overflow-y-auto">
            <LeftSidebar agents={agents} conversations={conversations} selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent} />
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white h-full">
          <div className="flex-1 w-full bg-white h-full">
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
          className={`hidden xl:flex flex-col bg-[#F7F7F7] border-l border-[#EEEEEE] transition-all duration-300 ${
            rightPanelOpen ? 'w-96' : 'w-0'
          }`}
          initial={false}
          animate={{ width: rightPanelOpen ? 384 : 0 }}
        >
          <div className="flex-1 overflow-y-auto">
            <MediaDrawer activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </motion.div>
      </div>

      {/* Mobile New Chat FAB */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button className="h-14 w-14 rounded-full bg-[#393E46] hover:bg-[#2C3036] shadow-lg">
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
    </div>
    </ProtectedRoute>
  )
}

// Left Sidebar Component
function LeftSidebar({ agents, conversations, selectedAgent, onSelectAgent }: any) {
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = React.useState(false)

  return (
    <div className="h-full flex flex-col">
      {/* Agent Selector */}
      <div className="p-4 border-b border-[#EEEEEE]">
        <h3 className="text-xs font-medium text-[#929AAB] uppercase tracking-wider mb-3">Current Agent</h3>
        <AgentSelector 
          agents={agents} 
          selectedAgent={selectedAgent} 
          onSelectAgent={onSelectAgent}
          onOpenChange={setIsAgentSelectorOpen}
        />
      </div>

      {/* Conversations Section */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 pb-2 border-b border-[#EEEEEE]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-[#929AAB] uppercase tracking-wider">Conversations</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-[#929AAB] hover:text-[#393E46] hover:bg-white/50">
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
        <div className={`flex-1 p-4 pt-2 ${isAgentSelectorOpen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <div className="space-y-1">
          {conversations.map((conv: any) => (
            <motion.div
              key={conv.id}
              className="p-3 rounded-lg hover:bg-white/50 cursor-pointer border border-transparent hover:border-[#EEEEEE]"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-medium text-sm truncate pr-2">{conv.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-[#929AAB] flex-shrink-0">{conv.time}</span>
                  <ThreeDotsMenu 
                    onShare={() => console.log('Share conversation:', conv.title)}
                    onRename={() => console.log('Rename conversation:', conv.title)}
                    onDelete={() => console.log('Delete conversation:', conv.title)}
                  />
                </div>
              </div>
              <p className="text-xs text-[#929AAB] mb-2 line-clamp-2">{conv.lastMessage}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#929AAB]">{conv.agent}</span>
                <div className={`w-2 h-2 rounded-full ${
                  conv.status === 'active' ? 'bg-green-400' : 
                  conv.status === 'review' ? 'bg-yellow-400' : 'bg-gray-400'
                }`} />
              </div>
            </motion.div>
          ))}
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
      <LeftSidebar agents={agents} conversations={conversations} selectedAgent="Social Media Agent" onSelectAgent={() => {}} />
    </div>
  )
}



// Media Drawer Component  
function MediaDrawer({ activeTab, onTabChange }: any) {
  const tabs = [
    { id: 'files' as const, label: 'Files', icon: FileText },
    { id: 'links' as const, label: 'Links', icon: Link2 },
    { id: 'transcripts' as const, label: 'Transcripts', icon: Mic },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header with tabs */}
      <div className="border-b border-[#EEEEEE] p-4">
        <SlideInText text="Media Library" className="font-medium mb-3" />
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
        {activeTab === 'files' && <FilesTab />}
        {activeTab === 'links' && <LinksTab />}
        {activeTab === 'transcripts' && <TranscriptsTab />}
      </div>
    </div>
  )
}

// Media Tab Components
function FilesTab() {
  const [dragActive, setDragActive] = React.useState(false)
  
  const fileItems = sampleMediaItems.filter(item => 
    ['pdf', 'doc', 'txt', 'audio', 'video'].includes(item.type)
  )

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-[#393E46] bg-[#F4F5F7]' 
            : 'border-[#EEEEEE] hover:border-[#393E46] hover:bg-[#F4F5F7]'
        }`}
      >
        <Upload className="h-6 w-6 text-[#929AAB] mx-auto mb-2" />
        <FadeInText text="Drop files here " className="text-sm font-medium mb-1 text-center" />
        <FadeInText text="or click to browse" className="text-xs text-[#929AAB] text-center" delay={0.1} />
      </div>

      {/* File list */}
      <div className="space-y-2">
        {fileItems.slice(0, 8).map((item, index) => (
          <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#EEEEEE]">
            <FileText className="h-4 w-4 text-[#929AAB]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.filename}</p>
              <p className="text-xs text-[#929AAB]">
                {item.size ? `${(item.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'} • {formatTimeAgo(item.uploadedAt)}
              </p>
            </div>
            <ThreeDotsMenu 
              onShare={() => console.log('Share file:', item.filename)}
              onRename={() => console.log('Rename file:', item.filename)}
              onDelete={() => console.log('Delete file:', item.filename)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function LinksTab() {
  const urlItems = sampleMediaItems.filter(item => item.type === 'url')
  
  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input placeholder="Paste URL here..." className="flex-1 text-sm border-[#D1D5DB] focus:ring-[#393E46] focus:border-[#393E46] bg-[#F9FAFB]" />
        <Button size="sm" className="bg-[#393E46] hover:bg-[#2C3036] text-white">Add</Button>
      </div>
      
      <div className="space-y-2">
        {urlItems.map((item, index) => (
          <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#EEEEEE]">
            <Link2 className="h-4 w-4 text-[#929AAB]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.filename}</p>
              <p className="text-xs text-[#929AAB]">Scraped • {formatTimeAgo(item.uploadedAt)}</p>
            </div>
            <ThreeDotsMenu 
              onShare={() => console.log('Share link:', item.filename)}
              onRename={() => console.log('Rename link:', item.filename)}
              onDelete={() => console.log('Delete link:', item.filename)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function TranscriptsTab() {
  const audioVideoItems = sampleMediaItems.filter(item => 
    ['audio', 'video'].includes(item.type)
  )
  
  return (
    <div className="space-y-4">
      {audioVideoItems.length > 0 ? (
        <div className="space-y-2">
          {audioVideoItems.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#EEEEEE]">
              <Mic className="h-4 w-4 text-[#929AAB]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.filename}</p>
                <p className="text-xs text-[#929AAB]">
                  {item.metadata?.duration || 'Unknown duration'} • {formatTimeAgo(item.uploadedAt)}
                </p>
              </div>
              <ThreeDotsMenu 
                onShare={() => console.log('Share transcript:', item.filename)}
                onRename={() => console.log('Rename transcript:', item.filename)}
                onDelete={() => console.log('Delete transcript:', item.filename)}
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