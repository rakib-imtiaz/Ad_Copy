"use client"

import * as React from "react"
import { SidebarProvider } from "@/lib/sidebar-context"

interface DashboardWrapperProps {
  children: React.ReactNode
  agents: any[]
  selectedAgent: string
  onSelectAgent: (agent: string) => void
  isLoadingAgents: boolean
  onRefreshAgents: () => void
  chatHistory: any[]
  currentChatSession: string | null
  onLoadChatSession: (sessionId: string) => void
  onRefreshChatHistory: () => void
  onDeleteChatSession: (sessionId: string) => void
  isLoadingChatHistory: boolean
  onStartNewChat: () => void
}

export function DashboardWrapper({
  children,
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
}: DashboardWrapperProps) {
  return (
    <SidebarProvider
      agents={agents}
      selectedAgent={selectedAgent}
      onSelectAgent={onSelectAgent}
      isLoadingAgents={isLoadingAgents}
      onRefreshAgents={onRefreshAgents}
      chatHistory={chatHistory}
      currentChatSession={currentChatSession}
      onLoadChatSession={onLoadChatSession}
      onRefreshChatHistory={onRefreshChatHistory}
      onDeleteChatSession={onDeleteChatSession}
      isLoadingChatHistory={isLoadingChatHistory}
      onStartNewChat={onStartNewChat}
    >
      {children}
    </SidebarProvider>
  )
}

