"use client"

import * as React from "react"
import {
  Search,
  Settings,
  LogOut,
  User
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
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const mainNav = [
  { href: "/knowledge-base", icon: Search, label: "Knowledge Base" },
]

export function AppSidebar() {
  const [activeItem, setActiveItem] = React.useState("/knowledge-base")
  const { user, logout } = useAuth()
  const { state } = useSidebar()

  const handleLogout = () => {
    logout()
  }

  const handleNavigation = (href: string) => {
    setActiveItem(href)
    window.location.href = href
  }

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center justify-center gap-2 px-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-green-400">
              <span className="text-lg font-bold text-white">C</span>
            </div>
            {state === 'expanded' && (
              <div className="overflow-hidden min-w-0 flex-1">
                <h1 className="font-bold text-gray-900 truncate">Copy Ready</h1>
                <p className="text-xs text-gray-600 truncate">AI Ad Copy Platform</p>
              </div>
            )}
          </div>
          {state === 'expanded' && (
            <SidebarTrigger className="h-8 w-8 rounded-md hover:bg-gray-100 transition-colors" />
          )}
        </div>
        {state === 'collapsed' && (
          <div className="flex justify-center py-2">
            <SidebarTrigger className="h-8 w-8 rounded-md hover:bg-gray-100 transition-colors" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="flex flex-col justify-between bg-white">
        <div className="space-y-6">
          <SidebarGroup>
            {state === 'expanded' && (
              <SidebarGroupLabel className="px-2 text-gray-700 font-medium">Main Features</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
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
                        className={`w-full justify-start space-x-3 ${activeItem === item.href ? 'bg-blue-50 text-blue-700 border-blue-200' : 'hover:bg-gray-50'}`}
                        size="sm"
                      >
                        <item.icon className="h-4 w-4" />
                        {state === 'expanded' && <span>{item.label}</span>}
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Settings */}
        <div className="space-y-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                tooltip="Settings"
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start space-x-3 hover:bg-gray-50"
                  size="sm"
                  onClick={() => handleNavigation('/profile')}
                >
                  <Settings className="h-4 w-4" />
                  {state === 'expanded' && <span>Settings</span>}
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 bg-gray-50/30">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5 min-w-0">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-primary to-green-400">
                  <User className="h-5 w-5 text-white" />
                </AvatarFallback>
              </Avatar>
              {state === 'expanded' && (
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-gray-500 truncate cursor-help">
                          {user?.email || 'Loading...'}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{user?.email || 'Loading...'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Logout"
            >
              <Button
                variant="ghost"
                className="w-full justify-start space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                {state === 'expanded' && <span>Logout</span>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
} 