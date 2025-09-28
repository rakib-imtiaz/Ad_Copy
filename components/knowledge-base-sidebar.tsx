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
  Upload,
  Eye
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
  onViewKnowledgeBase?: () => void
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
  deletingItemId,
  onViewKnowledgeBase
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
      className="border-r border-gray-200 bg-white"
      style={{
        '--sidebar-width': '18rem',
        '--sidebar-width-icon': '3rem'
      } as React.CSSProperties}
    >
      <SidebarHeader className="border-b border-gray-200 bg-white px-2 py-2">
        {state === 'expanded' ? (
          <div className="flex items-center gap-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gray-900 shadow-sm">
              <span className="text-xs font-black text-white">C</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xs font-bold text-gray-900 truncate">Copy Ready</h1>
              <p className="text-xs text-gray-600 truncate">Knowledge Base</p>
            </div>
            <SidebarTrigger className="h-5 w-5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 [&>svg]:text-gray-600 [&>svg]:hover:text-gray-900 [&[data-sidebar=trigger]]:text-gray-600 [&[data-sidebar=trigger]]:hover:text-gray-900" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gray-900 shadow-sm">
              <span className="text-xs font-black text-white">C</span>
            </div>
            <SidebarTrigger className="h-4 w-4 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 [&>svg]:text-gray-600 [&>svg]:hover:text-gray-900 [&[data-sidebar=trigger]]:text-gray-600 [&[data-sidebar=trigger]]:hover:text-gray-900" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={`flex flex-col justify-between bg-white h-full overflow-hidden ${state === 'expanded' ? 'px-2 py-2' : 'px-0 py-2'}`}>
        <div className="flex-1 flex flex-col min-h-0">
          {/* Media Library Section */}
          <SidebarGroup className="flex-1 min-h-0">
            {state === 'expanded' ? (
              <>
                <div className="flex items-center justify-between px-1 mb-1">
                  <SidebarGroupLabel className="text-gray-900 font-semibold text-xs flex items-center gap-1">
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
                            className="h-4 w-4 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                          >
                            <RefreshCw className={`h-2 w-2 ${isRefreshing ? 'animate-spin' : ''}`} />
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
                      <div className="space-y-1">
                        <Select value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                          <SelectTrigger className="w-full bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 focus:ring-1 focus:ring-blue-500/20 text-xs h-7">
                            <SelectValue placeholder="Select media type">
                              <div className="flex items-center space-x-1">
                                {(() => {
                                  const currentTab = tabs.find(tab => tab.id === activeTab)
                                  return currentTab ? (
                                    <>
                                      <currentTab.icon className="h-2.5 w-2.5 text-gray-700" />
                                      <span className="text-gray-900 text-xs">{currentTab.label}</span>
                                    </>
                                  ) : null
                                })()}
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            {tabs.map((tab) => (
                              <SelectItem 
                                key={tab.id} 
                                value={tab.id}
                                className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer text-xs h-7"
                              >
                                <div className="flex items-center space-x-1">
                                  <tab.icon className="h-2.5 w-2.5 text-gray-700" />
                                  <span className="text-gray-900 text-xs">{tab.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Media Library Tab Content */}
                      <div className="space-y-1 flex-1 min-h-0 overflow-hidden">
                        <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                  </div>
                </SidebarGroupContent>
              </>
            ) : (
              <SidebarGroupContent className="px-0">
                <SidebarMenu className="space-y-1">
                  {/* Media Library Icon */}
                  <SidebarMenuItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            className="w-full h-6 p-0"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full h-6 p-0 hover:bg-gray-100 rounded-lg justify-center text-gray-600"
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
        <div className="space-y-1">
          <Separator className={state === 'expanded' ? 'mx-2' : 'mx-0'} />
          <SidebarMenu className={state === 'expanded' ? 'space-y-1' : 'flex flex-col items-center space-y-1'}>
            {/* Dashboard Button */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Dashboard"
              >
                 <Button
                   variant="ghost"
                   className={`w-full h-6 rounded-lg transition-all duration-200 overflow-hidden group ${
                     state === 'expanded'
                      ? `justify-start px-2 hover:bg-gray-100 text-gray-700 hover:text-gray-900`
                      : `justify-center p-0 hover:bg-gray-100 text-gray-700 hover:text-gray-900`
                   }`}
                   size="sm"
                   onClick={() => handleNavigation('/dashboard')}
                 >
                   <MessageSquare className="h-2.5 w-2.5 flex-shrink-0 transition-all duration-200 group-hover:scale-110" />
                   {state === 'expanded' && (
                     <span className="font-medium text-xs truncate ml-1">
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
                  className={`w-full h-6 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 overflow-hidden ${
                    state === 'expanded'
                      ? 'justify-start px-2'
                      : 'justify-center p-0'
                  }`}
                  size="sm"
                  onClick={() => handleNavigation('/profile')}
                >
                  <Settings className="h-2.5 w-2.5 flex-shrink-0" />
                  {state === 'expanded' && <span className="font-medium text-xs truncate ml-1">Settings</span>}
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className={`border-t border-gray-200 bg-white py-1 ${state === 'expanded' ? 'px-2' : 'px-0'}`}>
        <SidebarMenu className={`space-y-0.5 ${state === 'expanded' ? '' : 'flex flex-col items-center'}`}>
          {/* View Knowledge Base Button */}
          {onViewKnowledgeBase && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="View Knowledge Base"
              >
                <Button
                  variant="ghost"
                  className={`w-full h-6 rounded-lg bg-green-50 text-green-700 hover:text-green-800 hover:bg-green-100 overflow-hidden ${
                    state === 'expanded'
                      ? 'justify-start px-2'
                      : 'justify-center p-0'
                  }`}
                  size="sm"
                  onClick={onViewKnowledgeBase}
                >
                  <Eye className="h-2.5 w-2.5 flex-shrink-0" />
                  {state === 'expanded' && <span className="font-medium text-xs truncate ml-1">View Knowledge Base</span>}
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            {state === 'expanded' ? (
              <div className="flex items-center gap-1 min-w-0">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="bg-gray-900 text-white font-semibold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 truncate">
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
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="bg-gray-900 text-white font-semibold text-xs">
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
                className={`w-full h-6 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 overflow-hidden ${
                  state === 'expanded'
                    ? 'justify-start px-2'
                    : 'justify-center p-0'
                }`}
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-2.5 w-2.5 flex-shrink-0" />
                {state === 'expanded' && <span className="font-medium text-xs truncate ml-1">Logout</span>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
