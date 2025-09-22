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

const mainNav = [
  // Knowledge Base moved to bottom section for better placement
]

export function AppSidebar() {
  const [activeItem, setActiveItem] = React.useState("/knowledge-base")
  const [deletingChatId, setDeletingChatId] = React.useState<string | null>(null)
  const { user, logout } = useAuth()
  const { state } = useSidebar()
  
  // Get sidebar state data
  const {
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
    <Sidebar variant="inset" collapsible="icon" className="border-r border-gray-700 bg-black">
      <SidebarHeader className="border-b border-gray-700 bg-black px-4 py-4">
        {state === 'expanded' ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <span className="text-xl font-black text-black">C</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black text-white truncate">Copy Ready</h1>
              <p className="text-xs text-gray-300 truncate">AI Ad Copy Platform</p>
            </div>
            <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-gray-800 transition-colors text-white hover:text-white [&>svg]:text-white [&>svg]:hover:text-white [&[data-sidebar=trigger]]:text-white [&[data-sidebar=trigger]]:hover:text-white" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <span className="text-xl font-black text-black">C</span>
            </div>
            <SidebarTrigger className="h-6 w-6 rounded-md hover:bg-gray-800 transition-colors text-white hover:text-white [&>svg]:text-white [&>svg]:hover:text-white [&[data-sidebar=trigger]]:text-white [&[data-sidebar=trigger]]:hover:text-white" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={`flex flex-col justify-between bg-black ${state === 'expanded' ? 'px-3 py-4' : 'px-0 py-4'}`}>
        <div className="flex-1 flex flex-col">

          {/* Chat History Section - Now takes up most of the space */}
          <SidebarGroup className="flex-1">
            {state === 'expanded' ? (
              <>
                <div className="flex items-center justify-between px-3 mb-3">
                  <SidebarGroupLabel className="text-white font-black text-sm">
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
                              className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
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
                              className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
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
                <SidebarGroupContent className="flex-1">
                  <div className="px-3 w-full overflow-hidden h-full">
                    <div className="space-y-2 h-full overflow-y-auto overflow-x-hidden">
                      {isLoadingChatHistory ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
                          <span className="ml-2 text-sm text-gray-300">Loading conversations...</span>
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
                              className={`group relative p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                                isActive 
                                  ? 'bg-gray-800 border-gray-600 shadow-sm' 
                                  : 'bg-gray-900 border-gray-700 hover:bg-gray-800 hover:border-gray-600 hover:shadow-sm'
                              } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                              onClick={() => !isDeleting && onLoadChatSession?.(chat.session_id)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className={`font-bold text-sm truncate ${
                                      isActive ? 'text-white' : 'text-white'
                                    }`}>
                                      {chat.title || `Chat ${chat.session_id}`}
                                    </h4>
                                    {chat.agent_id && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200 border border-blue-700">
                                        <Bot className="h-2.5 w-2.5 mr-1" />
                                        Agent
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 truncate">{timeAgo}</p>
                                </div>
                                {!isDeleting && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-gray-500 hover:text-red-400 hover:bg-red-900 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                    <Loader2 className="h-3 w-3 animate-spin text-gray-300" />
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 mx-auto mb-3 bg-gray-800 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-300 mb-1">No conversations yet</p>
                          <p className="text-xs text-gray-400">Start a new chat to begin</p>
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
                                      ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                                      : 'hover:bg-gray-800 text-gray-300'
                                  }`}
                                  onClick={() => onLoadChatSession?.(chat.session_id)}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </SidebarMenuButton>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <div className="text-sm max-w-48">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="font-medium truncate">
                                    {chat.title || `Chat ${chat.session_id}`}
                                  </p>
                                  {chat.agent_id && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      <Bot className="h-2.5 w-2.5 mr-1" />
                                      Agent
                                    </span>
                                  )}
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
                                  className="w-full h-10 p-0 hover:bg-gray-800 rounded-lg justify-center text-gray-300"
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
                              <MessageSquare className="h-4 w-4 text-gray-500" />
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

        {/* Knowledge Base & Settings Section */}
        <div className="space-y-2">
          <Separator className={state === 'expanded' ? 'mx-3' : 'mx-0'} />
          <SidebarMenu className={state === 'expanded' ? 'space-y-1' : 'flex flex-col items-center space-y-1'}>
            {/* Knowledge Base Button */}
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                tooltip="Knowledge Base"
              >
                 <Button
                   variant="ghost"
                   className={`w-full h-10 rounded-lg transition-all duration-200 overflow-hidden group ${
                     state === 'expanded' 
                       ? `justify-start px-3 hover:bg-gray-800 text-gray-300 hover:text-white`
                       : `justify-center p-0 hover:bg-gray-800 text-gray-300 hover:text-white`
                   }`}
                   size="sm"
                   onClick={() => handleNavigation('/knowledge-base')}
                 >
                   <Database className="h-4 w-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110" />
                   {state === 'expanded' && (
                     <span className="font-bold truncate ml-3">
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
                  className={`w-full h-10 rounded-lg hover:bg-gray-800 text-gray-300 overflow-hidden ${
                    state === 'expanded' 
                      ? 'justify-start px-3' 
                      : 'justify-center p-0'
                  }`}
                  size="sm"
                  onClick={() => handleNavigation('/profile')}
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  {state === 'expanded' && <span className="font-bold truncate ml-3">Settings</span>}
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className={`border-t border-gray-700 bg-black py-4 ${state === 'expanded' ? 'px-4' : 'px-0'}`}>
        <SidebarMenu className={`space-y-2 ${state === 'expanded' ? '' : 'flex flex-col items-center'}`}>
          <SidebarMenuItem>
            {state === 'expanded' ? (
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-white text-black font-black">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="text-sm font-black text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-gray-400 truncate cursor-help">
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
                  <AvatarFallback className="bg-white text-black font-black">
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
                {state === 'expanded' && <span className="font-bold truncate ml-3">Logout</span>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
} 