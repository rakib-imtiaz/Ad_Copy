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
  Loader2
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
import { AgentSelector } from "@/components/agent-selector"
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

const mainNav = [
  { href: "/knowledge-base", icon: Search, label: "Knowledge Base" },
]

export function AppSidebar() {
  const [activeItem, setActiveItem] = React.useState("/knowledge-base")
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = React.useState(false)
  const [deletingChatId, setDeletingChatId] = React.useState<string | null>(null)
  const { user, logout } = useAuth()
  const { state } = useSidebar()
  
  // Get sidebar state data
  const {
    agents,
    selectedAgent,
    onSelectAgent,
    isLoadingAgents,
    onRefreshAgents,
    chatHistory,
    currentChatSession,
    onLoadChatSession,
    onRefreshChatHistory,
    onDeleteChatSession,
    isLoadingChatHistory,
    onStartNewChat
  } = useSidebarState()

  const handleLogout = () => {
    logout()
  }

  const handleNavigation = (href: string) => {
    setActiveItem(href)
    window.location.href = href
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

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r border-slate-200/60 bg-white">
      <SidebarHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white px-4 py-4">
        {state === 'expanded' ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
              <span className="text-xl font-bold text-white">C</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-900 truncate">Copy Ready</h1>
              <p className="text-xs text-slate-600 truncate">AI Ad Copy Platform</p>
            </div>
            <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
              <span className="text-xl font-bold text-white">C</span>
            </div>
            <SidebarTrigger className="h-6 w-6 rounded-md hover:bg-slate-100 transition-colors" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={`flex flex-col justify-between bg-white ${state === 'expanded' ? 'px-3 py-4' : 'px-0 py-4'}`}>
        <div className="space-y-8">
          {/* Main Features Section */}
          <SidebarGroup>
            {state === 'expanded' && (
              <SidebarGroupLabel className="px-3 text-slate-700 font-semibold text-sm mb-3">
                Main Features
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent className={state === 'expanded' ? '' : 'px-0'}>
              <SidebarMenu className="space-y-1">
                {mainNav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={activeItem === item.href}
                      tooltip={item.label}
                    >
                      <Button
                        variant={activeItem === item.href ? "secondary" : "ghost"}
                        onClick={() => handleNavigation(item.href)}
                        className={`w-full h-10 rounded-lg transition-all overflow-hidden ${
                          state === 'expanded' 
                            ? `justify-start px-3 ${activeItem === item.href 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' 
                                : 'hover:bg-slate-50 text-slate-700'}`
                            : `justify-center p-0 ${activeItem === item.href 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' 
                                : 'hover:bg-slate-50 text-slate-700'}`
                        }`}
                        size="sm"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {state === 'expanded' && <span className="font-medium truncate ml-3">{item.label}</span>}
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Agent Selector Section */}
          <SidebarGroup>
            {state === 'expanded' ? (
              <>
                <div className="flex items-center justify-between px-3 mb-3">
                  <SidebarGroupLabel className="text-slate-700 font-semibold text-sm">
                    Current Agent
                  </SidebarGroupLabel>
                  {onRefreshAgents && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRefreshAgents}
                            disabled={isLoadingAgents}
                            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingAgents ? 'animate-spin' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Refresh agents</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <SidebarGroupContent>
                  <div className="px-3 w-full">
                    <AgentSelector 
                      agents={agents}
                      selectedAgent={selectedAgent}
                      onSelectAgent={onSelectAgent}
                      onOpenChange={setIsAgentSelectorOpen}
                      isLoading={isLoadingAgents}
                      onRefresh={onRefreshAgents}
                    />
                  </div>
                </SidebarGroupContent>
              </>
            ) : (
              <SidebarGroupContent className={(state as string) === 'expanded' ? '' : 'px-0'}>
                <SidebarMenu>
                  <SidebarMenuItem>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <SidebarMenuButton
                                asChild
                                className="w-full h-10 p-0"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full h-10 p-0 hover:bg-emerald-50 rounded-lg justify-center"
                                  onClick={() => setIsAgentSelectorOpen(true)}
                                >
                                  <Bot className="h-5 w-5 text-emerald-600" />
                                </Button>
                              </SidebarMenuButton>
                            </TooltipTrigger>
                        <TooltipContent side="right">
                          <div className="text-sm">
                            <p className="font-medium">Current Agent</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedAgent || "Select an AI Agent"}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>

          {/* Chat History Section */}
          <SidebarGroup>
            {state === 'expanded' ? (
              <>
                <div className="flex items-center justify-between px-3 mb-3">
                  <SidebarGroupLabel className="text-slate-700 font-semibold text-sm">
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
                              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                            >
                              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingChatHistory ? 'animate-spin' : ''}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Refresh chat history</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {onStartNewChat && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={onStartNewChat}
                              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>New conversation</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
                <SidebarGroupContent>
                  <div className="px-3 w-full overflow-hidden">
                    <div className="space-y-2 max-h-80 overflow-y-auto overflow-x-hidden">
                      {isLoadingChatHistory ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                          <span className="ml-2 text-sm text-slate-500">Loading conversations...</span>
                        </div>
                      ) : chatHistory.length > 0 ? (
                        chatHistory.map((chat: any) => {
                          const isActive = currentChatSession === chat.session_id
                          const chatDate = new Date(chat.created_at)
                          const timeAgo = formatTimeAgo(chatDate)
                          const isDeleting = deletingChatId === chat.session_id
                          
                          return (
                            <div
                              key={chat.session_id}
                              className={`group relative p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                                isActive 
                                  ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 hover:shadow-sm'
                              } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                              onClick={() => !isDeleting && onLoadChatSession?.(chat.session_id)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <h4 className={`font-medium text-sm truncate ${
                                    isActive ? 'text-emerald-700' : 'text-slate-900'
                                  }`}>
                                    {chat.title || `Chat ${chat.session_id}`}
                                  </h4>
                                  <p className="text-xs text-slate-500 mt-1 truncate">{timeAgo}</p>
                                </div>
                                {!isDeleting && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this conversation? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteChat(chat.session_id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                                {isDeleting && (
                                  <div className="h-6 w-6 flex items-center justify-center">
                                    <Loader2 className="h-3 w-3 animate-spin text-slate-500" />
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-slate-400" />
                          </div>
                          <p className="text-sm text-slate-600 mb-1">No conversations yet</p>
                          <p className="text-xs text-slate-500">Start a new chat to begin</p>
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
                                className="w-full h-10 p-0"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`w-full h-10 p-0 rounded-lg transition-all justify-center ${
                                    isActive 
                                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' 
                                      : 'hover:bg-slate-50 text-slate-600'
                                  }`}
                                  onClick={() => onLoadChatSession?.(chat.session_id)}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </SidebarMenuButton>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <div className="text-sm max-w-48">
                                <p className="font-medium truncate">
                                  {chat.title || `Chat ${chat.session_id}`}
                                </p>
                                <p className="text-xs text-muted-foreground">{timeAgo}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </SidebarMenuItem>
                    )
                  })}
                  
                  {/* New Chat Button */}
                  {onStartNewChat && (
                    <SidebarMenuItem>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <SidebarMenuButton
                                asChild
                                className="w-full h-10 p-0"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full h-10 p-0 hover:bg-emerald-50 rounded-lg justify-center text-emerald-600"
                                  onClick={onStartNewChat}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </SidebarMenuButton>
                            </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>New conversation</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </SidebarMenuItem>
                  )}
                  
                  {/* Show empty state if no chats */}
                  {chatHistory.length === 0 && !isLoadingChatHistory && (
                    <SidebarMenuItem>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full h-10 flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-slate-400" />
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
        </div>

        {/* Settings Section */}
        <div className="space-y-2">
          <Separator className={state === 'expanded' ? 'mx-3' : 'mx-0'} />
          <SidebarMenu className={state === 'expanded' ? '' : 'flex items-center justify-center'}>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                tooltip="Settings"
              >
                <Button
                  variant="ghost"
                  className={`w-full h-10 rounded-lg hover:bg-slate-50 text-slate-700 overflow-hidden ${
                    state === 'expanded' 
                      ? 'justify-start px-3' 
                      : 'justify-center p-0'
                  }`}
                  size="sm"
                  onClick={() => handleNavigation('/profile')}
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  {state === 'expanded' && <span className="font-medium truncate ml-3">Settings</span>}
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className={`border-t border-slate-200/60 bg-gradient-to-r from-slate-50 to-white py-4 ${state === 'expanded' ? 'px-4' : 'px-0'}`}>
        <SidebarMenu className={`space-y-2 ${state === 'expanded' ? '' : 'flex flex-col items-center'}`}>
          <SidebarMenuItem>
            {state === 'expanded' ? (
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-slate-500 truncate cursor-help">
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
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
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
                className={`w-full h-10 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 overflow-hidden ${
                  state === 'expanded' 
                    ? 'justify-start px-3' 
                    : 'justify-center p-0'
                }`}
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {state === 'expanded' && <span className="font-medium truncate ml-3">Logout</span>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
} 