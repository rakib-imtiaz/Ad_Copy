"use client"

import * as React from "react"
import {
  Search,
  Settings,
  LogOut,
  User,
  RefreshCw,
  Plus,
  MessageSquare,
  ChevronDown,
  Bot,
  Trash2,
  Loader2,
  Database,
  BookOpen
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useSidebarState } from "@/lib/sidebar-state-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { AgentSelectionModal } from "@/components/agent-selection-modal"
import { TypingText } from "@/components/ui/animated-text"

const mainNav = [
  // Knowledge Base moved to bottom section for better placement
]

// Custom looping typewriter component
function LoopingTypewriter({ 
  texts, 
  className, 
  typingSpeed = 100, 
  pauseDuration = 2000 
}: { 
  texts: string[]
  className?: string
  typingSpeed?: number
  pauseDuration?: number
}) {
  const [currentTextIndex, setCurrentTextIndex] = React.useState(0)
  const [displayedText, setDisplayedText] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(true)
  const [showCursor, setShowCursor] = React.useState(true)

  React.useEffect(() => {
    const currentText = texts[currentTextIndex]
    
    if (isTyping) {
      // Typing phase
      if (displayedText.length < currentText.length) {
        const timer = setTimeout(() => {
          setDisplayedText(currentText.slice(0, displayedText.length + 1))
        }, typingSpeed)
        return () => clearTimeout(timer)
      } else {
        // Finished typing, pause then start erasing
        const timer = setTimeout(() => {
          setIsTyping(false)
        }, pauseDuration)
        return () => clearTimeout(timer)
      }
    } else {
      // Erasing phase
      if (displayedText.length > 0) {
        const timer = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1))
        }, typingSpeed / 2)
        return () => clearTimeout(timer)
      } else {
        // Finished erasing, move to next text
        setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        setIsTyping(true)
      }
    }
  }, [displayedText, isTyping, currentTextIndex, texts, typingSpeed, pauseDuration])

  // Cursor blinking effect
  React.useEffect(() => {
    const timer = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(timer)
  }, [])

  return (
    <span className={className}>
      {displayedText}
      {showCursor && <span className="animate-pulse">|</span>}
    </span>
  )
}

export function AppSidebar() {
  const [activeItem, setActiveItem] = React.useState("/knowledge-base")
  const [deletingChatId, setDeletingChatId] = React.useState<string | null>(null)
  const [isAgentModalOpen, setIsAgentModalOpen] = React.useState(false)
  const [isStartingChat, setIsStartingChat] = React.useState(false)
  const { user, logout } = useAuth()
  const { state } = useSidebar()
  
  // Get sidebar state data
  const {
    agents,
    selectedAgent,
    chatHistory,
    currentChatSession,
    onLoadChatSession,
    onRefreshChatHistory,
    onDeleteChatSession,
    isLoadingChatHistory,
    onStartNewChat,
    onStartChatting,
    onSelectAgent,
    onRefreshAgents,
    isLoadingAgents
  } = useSidebarState()

  const handleLogout = () => {
    logout()
  }

  const handleNavigation = (href: string) => {
    setActiveItem(href)
    window.location.href = href
  }

  const handleNewChatClick = () => {
    setIsAgentModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsAgentModalOpen(false)
  }

  const handleStartChatting = async () => {
    setIsStartingChat(true)
    // Call the onStartChatting function to properly initialize the chat
    if (onStartChatting) {
      try {
        await onStartChatting()
        // Close modal after successful chat start
        setIsAgentModalOpen(false)
      } catch (error) {
        console.error('Error starting chat:', error)
      } finally {
        setIsStartingChat(false)
      }
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    setDeletingChatId(chatId)
    try {
      await onDeleteChatSession?.(chatId)
    } finally {
      setDeletingChatId(null)
    }
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return '1d ago'
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  // Debug: Watch for currentChatSession changes
  React.useEffect(() => {
    console.log('🎯 Sidebar currentChatSession changed:', currentChatSession)
  }, [currentChatSession])

  return (
    <>
    <Sidebar variant="inset" collapsible="icon" className="border-r border-gray-800 bg-black">
      <SidebarHeader className="border-b border-gray-800 bg-black px-2 py-2">
        {state === 'expanded' ? (
          <div className="flex items-center gap-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-sm">
              <span className="text-xs font-black text-black">C</span>
            </div>
             <div className="flex-1 min-w-0">
               <LoopingTypewriter 
                 texts={["Copy Ready", "AI Ad Copy Platform"]}
                 className="text-xs font-medium text-yellow-400 truncate"
                 typingSpeed={80}
                 pauseDuration={1500}
               />
             </div>
            <SidebarTrigger className="h-5 w-5 rounded-md hover:bg-gray-800 transition-colors text-white hover:text-yellow-400 [&>svg]:text-white [&>svg]:hover:text-yellow-400 [&[data-sidebar=trigger]]:text-white [&[data-sidebar=trigger]]:hover:text-yellow-400" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-sm">
              <span className="text-xs font-black text-black">C</span>
            </div>
            <SidebarTrigger className="h-4 w-4 rounded-md hover:bg-gray-800 transition-colors text-white hover:text-yellow-400 [&>svg]:text-white [&>svg]:hover:text-yellow-400 [&[data-sidebar=trigger]]:text-white [&[data-sidebar=trigger]]:hover:text-yellow-400" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={`flex flex-col bg-black h-full overflow-hidden ${state === 'expanded' ? 'px-2 py-3' : 'px-0 py-3'}`}>
        {/* Chat History Section - Fixed height with scroll */}
        <SidebarGroup className="flex-1 min-h-0">
            {state === 'expanded' ? (
              <>
                <div className="flex items-center justify-between px-1 mb-2">
                  <SidebarGroupLabel className="text-white font-medium text-xs flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 text-white" />
                    Chat History
                  </SidebarGroupLabel>
                  <div className="flex items-center space-x-1">
                    {onRefreshChatHistory && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={onRefreshChatHistory}
                              disabled={isLoadingChatHistory}
                              className="h-5 w-5 p-0 text-white hover:text-white hover:bg-gray-600 rounded-md"
                            >
                              <RefreshCw className={`h-2.5 w-2.5 ${isLoadingChatHistory ? 'animate-spin' : ''}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Refresh chat history</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNewChatClick}
                            className="h-5 w-5 p-0 text-white hover:text-white hover:bg-gray-600 rounded-md"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>New conversation</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <SidebarGroupContent className="flex-1 overflow-hidden">
                  <div className="px-1 w-full h-full overflow-hidden">
                    <div 
                      className="space-y-2 h-full overflow-y-auto overflow-x-hidden pr-1 chat-scroll" 
                      style={{ 
                        maxHeight: 'calc(100vh - 300px)',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#facc15 #000000'
                      }}
                    >
                      {isLoadingChatHistory ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
                          <span className="ml-2 text-xs text-white">Loading conversations...</span>
                        </div>
                      ) : chatHistory.length > 0 ? (
                        chatHistory.map((chat: any) => {
                          const isActive = currentChatSession === chat.session_id
                          const chatDate = new Date(chat.created_at)
                          const timeAgo = formatTimeAgo(chatDate)
                          const isDeleting = deletingChatId === chat.session_id

                          // Debug logs for sidebar
                          console.log('Sidebar Chat item:', {
                            session_id: chat.session_id,
                            title: chat.title,
                            currentChatSession,
                            isActive
                          })
                          
                          return (
                            <div
                              key={chat.session_id}
                              className={`group relative p-2 rounded-md transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? 'bg-slate-700 shadow-sm border border-yellow-400 text-white'
                                  : 'bg-slate-700 hover:bg-slate-600 hover:shadow-sm border border-slate-700 hover:border-yellow-400 text-white'
                              } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                              onClick={() => !isDeleting && onLoadChatSession?.(chat.session_id)}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <div className="flex items-center space-x-1">
                                    <h4 className={`font-normal text-xs truncate ${
                                      isActive ? 'text-white' : 'text-white'
                                    }`}>
                                      {chat.title || `Chat ${chat.session_id}`}
                                    </h4>
                                  </div>
                                </div>
                                {!isDeleting && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-2.5 w-2.5 p-0 hover:text-red-600 hover:bg-red-900/50 opacity-0 group-hover:opacity-100 transition-opacity ${
                                          isActive ? 'text-gray-300' : 'text-gray-400'
                                        }`}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Trash2 className="h-1.5 w-1.5" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-gray-900 border-gray-700">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Delete Conversation</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-400">
                                          Are you sure you want to delete this conversation? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteChat(chat.session_id)}
                                          className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                                {isDeleting && (
                                  <div className="h-6 w-6 flex items-center justify-center">
                                    <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-6">
                          <div className="w-10 h-10 mx-auto mb-2 bg-gray-800 border border-yellow-500 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-yellow-400" />
                          </div>
                          <p className="text-xs text-white mb-1">No conversations yet</p>
                          <p className="text-xs text-gray-300">Start a new chat to begin</p>
                        </div>
                      )}
                    </div>
                  </div>
                </SidebarGroupContent>
              </>
            ) : (
              <SidebarGroupContent className={(state as string) === 'expanded' ? '' : 'px-0'}>
                <SidebarMenu className="space-y-1">
                  {/* Recent Chat History Icons - Show top 3 */}
                  {chatHistory.slice(0, 3).map((chat: any) => {
                    const isActive = currentChatSession === chat.session_id
                    const chatDate = new Date(chat.created_at)
                    const timeAgo = formatTimeAgo(chatDate)
                    
                    return (
                      <SidebarMenuItem key={chat.session_id}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <SidebarMenuButton
                                asChild
                                className="w-full h-8 p-0"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`w-full h-8 p-0 rounded-lg transition-all justify-center ${
                                    isActive
                                      ? 'bg-slate-700 hover:bg-slate-600 text-white border border-yellow-400'
                                      : 'hover:bg-slate-600 text-white'
                                  }`}
                                  onClick={() => onLoadChatSession?.(chat.session_id)}
                                >
                                  <MessageSquare className="h-3 w-3" />
                                </Button>
                              </SidebarMenuButton>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <div className="text-sm max-w-48">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="font-medium truncate">
                                    {chat.title || `Chat ${chat.session_id}`}
                                  </p>
                                </div>
                                <p className="text-xs text-muted-foreground">{timeAgo}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </SidebarMenuItem>
                    )
                  })}
                  
                  {/* New Chat Button */}
                  <SidebarMenuItem>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              className="w-full h-8 p-0"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full h-8 p-0 hover:bg-slate-600 rounded-lg justify-center text-white"
                                onClick={handleNewChatClick}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>New conversation</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                  
                  {/* Show empty state if no chats */}
                  {chatHistory.length === 0 && !isLoadingChatHistory && (
                    <SidebarMenuItem>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full h-8 flex items-center justify-center">
                              <MessageSquare className="h-3 w-3 text-white" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>No conversations yet</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
        </SidebarGroup>

        {/* Knowledge Base & Settings Section - Fixed at bottom */}
        <div className="mt-auto space-y-2 pt-2">
           <Separator className={`${state === 'expanded' ? 'mx-2' : 'mx-0'} border-gray-800`} />
          <SidebarMenu className={state === 'expanded' ? 'space-y-1' : 'flex flex-col items-center space-y-1'}>
            {/* Knowledge Base Button */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Knowledge Base"
              >
                  <Button
                    variant="ghost"
                    className={`w-full h-8 rounded-lg transition-all duration-200 overflow-hidden group ${
                      state === 'expanded'
                       ? `justify-start px-2 hover:bg-gray-100 text-white hover:text-white`
                       : `justify-center p-0 hover:bg-gray-100 text-white hover:text-white`
                    }`}
                    size="sm"
                    onClick={() => handleNavigation('/knowledge-base')}
                  >
                    <Database className="h-3 w-3 flex-shrink-0 transition-all duration-200 group-hover:scale-110" />
                    {state === 'expanded' && (
                      <span className="font-normal text-xs truncate ml-2">
                        Knowledge Base
                      </span>
                    )}
                  </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {/* Settings Button */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Settings"
              >
                <Button
                  variant="ghost"
                  className={`w-full h-8 rounded-lg hover:bg-gray-100 text-white hover:text-white overflow-hidden ${
                    state === 'expanded'
                      ? 'justify-start px-2'
                      : 'justify-center p-0'
                  }`}
                  size="sm"
                  onClick={() => handleNavigation('/profile')}
                >
                  <Settings className="h-3 w-3 flex-shrink-0" />
                  {state === 'expanded' && <span className="font-normal text-xs truncate ml-2">Settings</span>}
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className={`border-t border-gray-800 bg-black py-2 ${state === 'expanded' ? 'px-2' : 'px-0'}`}>
        <SidebarMenu className={`space-y-0.5 ${state === 'expanded' ? '' : 'flex flex-col items-center'}`}>
          <SidebarMenuItem>
            {state === 'expanded' ? (
              <div className="flex items-center gap-1 min-w-0">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-black text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="text-xs font-medium text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-gray-300 truncate cursor-help">
                          {user?.email || 'Loading...'}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{user?.email || 'Loading...'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-black text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Logout"
            >
              <Button
                variant="ghost"
                className={`w-full h-8 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/50 overflow-hidden ${
                  state === 'expanded'
                    ? 'justify-start px-2'
                    : 'justify-center p-0'
                }`}
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-3 w-3 flex-shrink-0" />
                {state === 'expanded' && <span className="font-normal text-xs truncate ml-2">Logout</span>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>

    {/* Agent Selection Modal */}
    <AgentSelectionModal
      isOpen={isAgentModalOpen}
      onClose={handleCloseModal}
      agents={agents}
      selectedAgent={selectedAgent}
      onSelectAgent={onSelectAgent || (() => {})}
      onStartChatting={handleStartChatting}
      onRefreshAgents={onRefreshAgents || (() => {})}
      isLoadingAgents={isLoadingAgents}
      isStartingChat={isStartingChat}
    />
    </>
  )
} 