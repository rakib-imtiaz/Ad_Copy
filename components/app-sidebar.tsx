"use client"

import * as React from "react"
import { 
  FileText, 
  PenTool, 
  Search, 
  MessageCircle, 
  FolderOpen, 
  Users, 
  Settings, 
  Scale,
  Home,
  Calendar,
  Bell
} from "lucide-react"
import Image from "next/image"

import {
  Sidebar,
  SidebarBody,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const mainNav = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/chat", icon: MessageCircle, label: "AI Chat" },
  { href: "/knowledge-base", icon: Search, label: "Knowledge Base" },
  { href: "/media-library", icon: FolderOpen, label: "Media Library" },
  { href: "/agents", icon: Users, label: "AI Agents" },
  { href: "/export", icon: FileText, label: "Export" },
]

const secondaryNav = [
  { href: "/conversations", icon: PenTool, label: "Conversations" },
  { href: "/brand", icon: Calendar, label: "Brand Settings" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
]

export function AppSidebar() {
  const [activeItem, setActiveItem] = React.useState("/")

  return (
    <Sidebar className="border-r border-white/10">
      <SidebarContent>
        <SidebarHeader>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-green-400">
              <span className="text-lg font-bold text-black">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold">CopyForge</span>
              <span className="text-xs text-muted-foreground">AI Ad Copy Platform</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarBody className="flex flex-col justify-between">
          <div className="space-y-6">
            <SidebarMenu>
              <SidebarHeading>Main Features</SidebarHeading>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Button
                    variant={activeItem === item.href ? "secondary" : "ghost"}
                    onClick={() => setActiveItem(item.href)}
                    className="w-full justify-start space-x-3"
                    size="sm"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <SidebarMenu>
              <SidebarHeading>Workspace</SidebarHeading>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Button
                    variant={activeItem === item.href ? "secondary" : "ghost"}
                    onClick={() => setActiveItem(item.href)}
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

          <SidebarMenu>
            <SidebarMenuItem>
              <Button variant="ghost" className="w-full justify-start space-x-3" size="sm">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarBody>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50 border border-white/10">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center">
            <span className="text-sm font-bold text-black">CF</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">CopyForge Pro</p>
            <p className="text-xs text-muted-foreground truncate">Active License</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
} 