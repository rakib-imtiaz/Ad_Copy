"use client"

import * as React from "react"

interface SidebarContextType {
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

const SidebarContext = React.createContext<SidebarContextType | null>(null)

export function SidebarProvider({ children, ...props }: { children: React.ReactNode } & SidebarContextType) {
  return (
    <SidebarContext.Provider value={props}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarContext() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider")
  }
  return context
}

// Context updater hook for updating sidebar data
export function useSidebarUpdater() {
  const context = React.useContext(SidebarContext)
  
  if (!context) {
    throw new Error("useSidebarUpdater must be used within a SidebarProvider")
  }
  
  return {
    updateAgents: (agents: any[]) => {
      // This would need to be implemented with a state updater
      console.log('Updating agents:', agents)
    },
    updateSelectedAgent: (agent: string) => {
      console.log('Updating selected agent:', agent)
    },
    updateChatHistory: (history: any[]) => {
      console.log('Updating chat history:', history)
    },
  }
}
