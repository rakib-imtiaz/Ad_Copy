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
    <Sidebar variant="inset" collapsible="icon" className="border-r border-yellow-600/30 bg-white">
      <SidebarHeader className="border-b border-yellow-600/30 bg-white px-2 py-2">
        {state === 'expanded' ? (
          <div className="flex items-center gap-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-sm">
              <span className="text-xs font-black text-black">C</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-black text-yellow-400 truncate">Copy Ready</h1>
              <p className="text-xs text-gray-600 truncate">AI Ad Copy Platform</p>
            </div>
            <SidebarTrigger className="h-5 w-5 rounded-md hover:bg-yellow-100 transition-colors text-gray-700 hover:text-yellow-600 [&>svg]:text-gray-700 [&>svg]:hover:text-yellow-600 [&[data-sidebar=trigger]]:text-gray-700 [&[data-sidebar=trigger]]:hover:text-yellow-600" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-sm">
              <span className="text-xs font-black text-black">C</span>
            </div>
            <SidebarTrigger className="h-4 w-4 rounded-md hover:bg-yellow-100 transition-colors text-gray-700 hover:text-yellow-600 [&>svg]:text-gray-700 [&>svg]:hover:text-yellow-600 [&[data-sidebar=trigger]]:text-gray-700 [&[data-sidebar=trigger]]:hover:text-yellow-600" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={`flex flex-col justify-between bg-white h-full overflow-hidden ${state === 'expanded' ? 'px-2 py-3' : 'px-0 py-3'}`}>
        <div className="flex-1 flex flex-col">

          {/* Chat History Section - Now takes up most of the space */}
          <SidebarGroup className="flex-1">
            {state === 'expanded' ? (
              <>
                <div className="flex items-center justify-between px-1 mb-2">
                  <SidebarGroupLabel className="text-yellow-600 font-black text-xs flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 text-yellow-600" />
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
                              className="h-5 w-5 p-0 text-gray-600 hover:text-yellow-600 hover:bg-yellow-100 rounded-md"
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
                    {onStartNewChat && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={onStartNewChat}
                              className="h-5 w-5 p-0 text-gray-600 hover:text-yellow-600 hover:bg-yellow-100 rounded-md"
                            >
                              <Plus className="h-2.5 w-2.5" />
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
                <SidebarGroupContent className="flex-1 overflow-hidden">
                  <div className="px-1 w-full h-full overflow-hidden">
                    <div className="space-y-2 h-full overflow-y-auto overflow-x-hidden">
                      {isLoadingChatHistory ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                          <span className="ml-2 text-xs text-gray-600">Loading conversations...</span>
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
                                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 shadow-sm border border-yellow-400'
                                  : 'bg-gray-50 hover:bg-yellow-50 hover:shadow-sm border border-gray-200 hover:border-yellow-300'
                              } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                              onClick={() => !isDeleting && onLoadChatSession?.(chat.session_id)}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <div className="flex items-center space-x-1">
                                    <h4 className={`font-bold text-xs truncate ${
                                      isActive ? 'text-gray-900' : 'text-gray-900'
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
                                        className="h-4 w-4 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white border-gray-200">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-gray-900">Delete Conversation</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-600">
                                          Are you sure you want to delete this conversation? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-900">Cancel</AlertDialogCancel>
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
                        <div className="text-center py-6">
                          <div className="w-10 h-10 mx-auto mb-2 bg-yellow-100 border border-yellow-300 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-yellow-600" />
                          </div>
                          <p className="text-xs text-gray-600 mb-1">No conversations yet</p>
                          <p className="text-xs text-gray-500">Start a new chat to begin</p>
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
                                      ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-400'
                                      : 'hover:bg-yellow-50 text-gray-600'
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
                  {onStartNewChat && (
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
                                  className="w-full h-8 p-0 hover:bg-yellow-50 rounded-lg justify-center text-gray-600"
                                  onClick={onStartNewChat}
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
                  )}
                  
                  {/* Show empty state if no chats */}
                  {chatHistory.length === 0 && !isLoadingChatHistory && (
                    <SidebarMenuItem>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full h-8 flex items-center justify-center">
                              <MessageSquare className="h-3 w-3 text-yellow-600" />
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
           <Separator className={`${state === 'expanded' ? 'mx-2' : 'mx-0'} border-yellow-600/30`} />
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
                       ? `justify-start px-2 hover:bg-yellow-100 text-yellow-600 hover:text-yellow-700`
                       : `justify-center p-0 hover:bg-yellow-100 text-yellow-600 hover:text-yellow-700`
                    }`}
                    size="sm"
                    onClick={() => handleNavigation('/knowledge-base')}
                  >
                    <Database className="h-3 w-3 flex-shrink-0 transition-all duration-200 group-hover:scale-110" />
                    {state === 'expanded' && (
                      <span className="font-bold text-xs truncate ml-2">
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
                  className={`w-full h-8 rounded-lg hover:bg-yellow-100 text-yellow-600 hover:text-yellow-700 overflow-hidden ${
                    state === 'expanded'
                      ? 'justify-start px-2'
                      : 'justify-center p-0'
                  }`}
                  size="sm"
                  onClick={() => handleNavigation('/profile')}
                >
                  <Settings className="h-3 w-3 flex-shrink-0" />
                  {state === 'expanded' && <span className="font-bold text-xs truncate ml-2">Settings</span>}
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className={`border-t border-yellow-600/30 bg-white py-2 ${state === 'expanded' ? 'px-2' : 'px-0'}`}>
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
                  <p className="text-xs font-black text-yellow-600 truncate">
                    {user?.name || 'User'}
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-gray-600 truncate cursor-help">
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
                className={`w-full h-8 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 overflow-hidden ${
                  state === 'expanded'
                    ? 'justify-start px-2'
                    : 'justify-center p-0'
                }`}
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-3 w-3 flex-shrink-0" />
                {state === 'expanded' && <span className="font-bold text-xs truncate ml-2">Logout</span>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
} 