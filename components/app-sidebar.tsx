"use client"

import * as React from "react"
import { 
  Search, 
  MessageCircle, 
  Users, 
  Settings, 
  Scale,
  Bell,
  LogOut,
  User,
  Moon,
  Sun
} from "lucide-react"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const mainNav = [
  { href: "/chat", icon: MessageCircle, label: "Chat History" },
  { href: "/agents", icon: Users, label: "Choose Agent" },
  { href: "/knowledge-base", icon: Search, label: "Knowledge Base" },
]

export function AppSidebar() {
  const [activeItem, setActiveItem] = React.useState("/")
  const [isDark, setIsDark] = React.useState(true)
  const { user, logout } = useAuth()

  React.useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const handleLogout = () => {
    logout()
  }

  const handleNavigation = (href: string) => {
    setActiveItem(href)
    window.location.href = href
  }

  return (
    <Sidebar className="border-r border-white/10">
      <SidebarHeader>
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-green-400">
            <span className="text-lg font-bold text-black">C</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold">Copy Ready</span>
            <span className="text-xs text-muted-foreground">AI Ad Copy Platform</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col justify-between">
          <div className="space-y-6">
            <SidebarMenu>
              <SidebarGroupLabel>Main Features</SidebarGroupLabel>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Button
                    variant={activeItem === item.href ? "secondary" : "ghost"}
                    onClick={() => handleNavigation(item.href)}
                    className="w-full justify-start space-x-3"
                    size="sm"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>


          </div>

          {/* Settings and Theme Toggle */}
          <div className="space-y-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start space-x-3" 
                  size="sm"
                  onClick={() => handleNavigation('/knowledge-base')}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start space-x-3" 
                  size="sm"
                  onClick={toggleTheme}
                >
                  {isDark ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarContent>

      <SidebarFooter>
        {/* User Profile Section with Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-white/10"
            >
              <div className="flex items-center space-x-3 w-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-green-400">
                    <User className="h-5 w-5 text-black" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{user?.name || 'John Doe'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.role || 'Senior Partner'}</p>
                </div>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            align="end" 
            className="w-56 p-2"
            side="top"
          >
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-9 px-2"
                onClick={() => handleNavigation('/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start h-9 px-2"
                onClick={() => handleNavigation('/knowledge-base')}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start h-9 px-2"
              >
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </Button>
              <div className="border-t border-border my-2" />
              <Button 
                variant="ghost" 
                className="w-full justify-start h-9 px-2 text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarFooter>
    </Sidebar>
  )
} 