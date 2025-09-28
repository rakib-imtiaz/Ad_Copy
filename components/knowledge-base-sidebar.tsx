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
  BookOpen,
  FileText,
  Link2,
  Mic,
  Image,
  Upload
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilesTab, LinksTab, YouTubeTab, ImageAnalyzerTab, TranscriptsTab } from "@/components/media-library-tabs"

interface KnowledgeBaseSidebarProps {
  mediaItems: any[]
  setMediaItems: (items: any[]) => void
  onRefresh: () => void
  onUpload: (files: File[]) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isRefreshing: boolean
  isLoadingTabContent: boolean
  isDeleting: boolean
  deletingItemId: string | null
}

export function KnowledgeBaseSidebar({
  mediaItems,
  setMediaItems,
  onRefresh,
  onUpload,
  onDelete,
  isRefreshing,
  isLoadingTabContent,
  isDeleting,
  deletingItemId
}: KnowledgeBaseSidebarProps) {
  const [activeTab, setActiveTab] = React.useState<'files' | 'links' | 'youtube' | 'image-analyzer' | 'transcripts'>('files')
  const [deletingChatId, setDeletingChatId] = React.useState<string | null>(null)
  const { user, logout } = useAuth()
  const { state } = useSidebar()

  const handleLogout = () => {
    logout()
  }

  const handleNavigation = (href: string) => {
    window.location.href = href
  }

  const handleDeleteChat = async (chatId: string) => {
    setDeletingChatId(chatId)
    try {
      await onDelete(chatId)
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

  const tabs = [
    { id: 'files' as const, label: 'Files', icon: FileText },
    { id: 'links' as const, label: 'Links', icon: Link2 },
    { id: 'youtube' as const, label: 'YouTube', icon: Mic },
    { id: 'image-analyzer' as const, label: 'Images', icon: Image },
    { id: 'transcripts' as const, label: 'Transcripts', icon: Mic },
  ]

  return (
    <Sidebar 
      variant="inset" 
      collapsible="icon" 
      className="border-r border-gray-700 bg-black"
      style={{
        '--sidebar-width': '20rem',
        '--sidebar-width-icon': '3rem'
      } as React.CSSProperties}
    >
      <SidebarHeader className="border-b border-gray-700 bg-black px-2 py-2">
        {state === 'expanded' ? (
          <div className="flex items-center gap-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-sm">
              <span className="text-sm font-black text-black">C</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-black text-white truncate">Copy Ready</h1>
              <p className="text-xs text-gray-300 truncate">Knowledge Base</p>
            </div>
            <SidebarTrigger className="h-6 w-6 rounded-md hover:bg-gray-800 transition-colors text-white hover:text-white [&>svg]:text-white [&>svg]:hover:text-white [&[data-sidebar=trigger]]:text-white [&[data-sidebar=trigger]]:hover:text-white" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-sm">
              <span className="text-sm font-black text-black">C</span>
            </div>
            <SidebarTrigger className="h-5 w-5 rounded-md hover:bg-gray-800 transition-colors text-white hover:text-white [&>svg]:text-white [&>svg]:hover:text-white [&[data-sidebar=trigger]]:text-white [&[data-sidebar=trigger]]:hover:text-white" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={`flex flex-col justify-between bg-black h-full overflow-hidden ${state === 'expanded' ? 'px-2 py-3' : 'px-0 py-3'}`}>
        <div className="flex-1 flex flex-col">
          {/* Media Library Section */}
          <SidebarGroup className="flex-1">
            {state === 'expanded' ? (
              <>
                <div className="flex items-center justify-between px-1 mb-1">
                  <SidebarGroupLabel className="text-white font-black text-xs flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    Media Library
                  </SidebarGroupLabel>
                  <div className="flex items-center space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            className="h-5 w-5 p-0 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                          >
                            <RefreshCw className={`h-2.5 w-2.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Refresh media library</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <SidebarGroupContent className="flex-1 overflow-hidden">
                  <div className="px-1 w-full h-full overflow-hidden">
                    <div className="space-y-2 h-full overflow-y-auto overflow-x-hidden">
                      {/* Media Library Tabs */}
                      <div className="space-y-2">
                        <Select value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                          <SelectTrigger className="w-full bg-white border border-gray-300 text-black hover:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 text-xs">
                            <SelectValue placeholder="Select media type">
                              <div className="flex items-center space-x-2">
                                {(() => {
                                  const currentTab = tabs.find(tab => tab.id === activeTab)
                                  return currentTab ? (
                                    <>
                                      <currentTab.icon className="h-3 w-3 text-black" />
                                      <span className="text-black text-xs">{currentTab.label}</span>
                                    </>
                                  ) : null
                                })()}
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-300 shadow-xl">
                            {tabs.map((tab) => (
                              <SelectItem 
                                key={tab.id} 
                                value={tab.id}
                                className="text-black hover:bg-gray-100 focus:bg-gray-100 cursor-pointer text-xs"
                              >
                                <div className="flex items-center space-x-2">
                                  <tab.icon className="h-3 w-3 text-black" />
                                  <span className="text-black text-xs">{tab.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Media Library Tab Content */}
                      <div className="space-y-2">
                        {activeTab === 'files' && (
                          <FilesTab 
                            mediaItems={mediaItems} 
                            onUpload={onUpload} 
                            onDelete={onDelete} 
                            isDeleting={isDeleting} 
                            deletingItemId={deletingItemId} 
                            isLoadingTabContent={isLoadingTabContent}
                            onDownload={(item: any) => {
                              if (item.url) {
                                window.open(item.url, '_blank')
                              }
                            }}
                            onView={(item: any) => {
                              if (item.url) {
                                window.open(item.url, '_blank')
                              } else if (item.content) {
                                const newWindow = window.open('', '_blank')
                                if (newWindow) {
                                  newWindow.document.write(`
                                    <html>
                                      <head><title>${item.filename || 'File Content'}</title></head>
                                      <body style="font-family: monospace; padding: 20px; white-space: pre-wrap;">
                                        ${item.content}
                                      </body>
                                    </html>
                                  `)
                                }
                              }
                            }}
                          />
                        )}
                        {activeTab === 'links' && (
                          <LinksTab 
                            mediaItems={mediaItems} 
                            onDelete={onDelete} 
                            onRefresh={onRefresh} 
                            setMediaItems={setMediaItems} 
                            isDeleting={isDeleting} 
                            deletingItemId={deletingItemId} 
                            isLoadingTabContent={isLoadingTabContent} 
                          />
                        )}
                        {activeTab === 'youtube' && (
                          <YouTubeTab 
                            mediaItems={mediaItems} 
                            onDelete={onDelete} 
                            onRefresh={onRefresh} 
                            setMediaItems={setMediaItems} 
                            isDeleting={isDeleting} 
                            deletingItemId={deletingItemId} 
                            isLoadingTabContent={isLoadingTabContent} 
                          />
                        )}
                        {activeTab === 'image-analyzer' && (
                          <ImageAnalyzerTab 
                            mediaItems={mediaItems} 
                            onUpload={onUpload} 
                            onDelete={onDelete} 
                            isDeleting={isDeleting} 
                            deletingItemId={deletingItemId} 
                            isLoadingTabContent={isLoadingTabContent} 
                          />
                        )}
                        {activeTab === 'transcripts' && (
                          <TranscriptsTab 
                            mediaItems={mediaItems} 
                            onDelete={onDelete} 
                            isDeleting={isDeleting} 
                            deletingItemId={deletingItemId} 
                            isLoadingTabContent={isLoadingTabContent} 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </SidebarGroupContent>
              </>
            ) : (
              <SidebarGroupContent className={(state as string) === 'expanded' ? '' : 'px-0'}>
                <SidebarMenu className="space-y-1">
                  {/* Media Library Icon */}
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
                              className="w-full h-8 p-0 hover:bg-gray-50 rounded-lg justify-center text-gray-600"
                            >
                              <Database className="h-3 w-3" />
                            </Button>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>Media Library</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        </div>

        {/* Navigation Section */}
        <div className="space-y-2">
          <Separator className={state === 'expanded' ? 'mx-3' : 'mx-0'} />
          <SidebarMenu className={state === 'expanded' ? 'space-y-1' : 'flex flex-col items-center space-y-1'}>
            {/* Dashboard Button */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Dashboard"
              >
                 <Button
                   variant="ghost"
                   className={`w-full h-8 rounded-lg transition-all duration-200 overflow-hidden group ${
                     state === 'expanded'
                      ? `justify-start px-2 hover:bg-gray-800 text-white hover:text-white`
                      : `justify-center p-0 hover:bg-gray-800 text-white hover:text-white`
                   }`}
                   size="sm"
                   onClick={() => handleNavigation('/dashboard')}
                 >
                   <MessageSquare className="h-3 w-3 flex-shrink-0 transition-all duration-200 group-hover:scale-110" />
                   {state === 'expanded' && (
                     <span className="font-bold text-xs truncate ml-2">
                       Dashboard
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
                  className={`w-full h-8 rounded-lg hover:bg-gray-800 text-white overflow-hidden ${
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

      <SidebarFooter className={`border-t border-gray-700 bg-black py-2 ${state === 'expanded' ? 'px-2' : 'px-0'}`}>
        <SidebarMenu className={`space-y-0.5 ${state === 'expanded' ? '' : 'flex flex-col items-center'}`}>
          <SidebarMenuItem>
            {state === 'expanded' ? (
              <div className="flex items-center gap-1 min-w-0">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-white text-black font-black text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="text-xs font-black text-white truncate">
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
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-white text-black font-black text-xs">
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
