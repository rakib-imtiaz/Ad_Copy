"use client"

import * as React from "react"

interface SidebarState {
  agents: any[]
  selectedAgent: string
  isLoadingAgents: boolean
  chatHistory: any[]
  currentChatSession: string | null
  isLoadingChatHistory: boolean
}

interface SidebarActions {
  onSelectAgent: (agent: string) => void
  onRefreshAgents: () => void
  onLoadChatSession: (sessionId: string) => void
  onRefreshChatHistory: () => void
  onDeleteChatSession: (sessionId: string) => void
  onStartNewChat: () => void
  onStartChatting: () => void
  updateAgents: (agents: any[]) => void
  updateSelectedAgent: (agent: string) => void
  updateChatHistory: (history: any[]) => void
  updateCurrentChatSession: (sessionId: string | null) => void
  updateIsLoadingAgents: (loading: boolean) => void
  updateIsLoadingChatHistory: (loading: boolean) => void
  setActionRefs: (refs: {
    onSelectAgent?: (agent: string) => void
    onRefreshAgents?: () => void
    onLoadChatSession?: (sessionId: string) => void
    onRefreshChatHistory?: () => void
    onDeleteChatSession?: (sessionId: string) => void
    onStartNewChat?: () => void
    onStartChatting?: () => void
  }) => void
}

type SidebarContextType = SidebarState & SidebarActions

const SidebarStateContext = React.createContext<SidebarContextType | null>(null)

export function SidebarStateProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = React.useState<any[]>([])
  const [selectedAgent, setSelectedAgent] = React.useState<string>("")
  const [isLoadingAgents, setIsLoadingAgents] = React.useState<boolean>(false)
  const [chatHistory, setChatHistory] = React.useState<any[]>([])
  const [currentChatSession, setCurrentChatSession] = React.useState<string | null>(null)

  // Debug log for sidebar context currentChatSession changes
  React.useEffect(() => {
    console.log('🎯 Sidebar context currentChatSession changed:', currentChatSession)
  }, [currentChatSession])
  const [isLoadingChatHistory, setIsLoadingChatHistory] = React.useState<boolean>(false)
  
  // Action function refs that will be set by the dashboard
  const actionRefs = React.useRef<{
    onSelectAgent?: (agent: string) => void
    onRefreshAgents?: () => void
    onLoadChatSession?: (sessionId: string) => void
    onRefreshChatHistory?: () => void
    onDeleteChatSession?: (sessionId: string) => void
    onStartNewChat?: () => void
    onStartChatting?: () => void
  }>({})

  const contextValue: SidebarContextType = {
    // State
    agents,
    selectedAgent,
    isLoadingAgents,
    chatHistory,
    currentChatSession,
    isLoadingChatHistory,
    
    // Actions (these will be set by the dashboard)
    onSelectAgent: (agent: string) => actionRefs.current.onSelectAgent?.(agent),
    onRefreshAgents: () => actionRefs.current.onRefreshAgents?.(),
    onLoadChatSession: (sessionId: string) => actionRefs.current.onLoadChatSession?.(sessionId),
    onRefreshChatHistory: () => actionRefs.current.onRefreshChatHistory?.(),
    onDeleteChatSession: (sessionId: string) => actionRefs.current.onDeleteChatSession?.(sessionId),
    onStartNewChat: () => actionRefs.current.onStartNewChat?.(),
    onStartChatting: () => actionRefs.current.onStartChatting?.(),
    
    // State updaters
    updateAgents: setAgents,
    updateSelectedAgent: setSelectedAgent,
    updateChatHistory: setChatHistory,
    updateCurrentChatSession: (sessionId: string | null) => {
      console.log('🔄 Sidebar context updateCurrentChatSession called with:', sessionId)
      setCurrentChatSession(sessionId)
    },
    updateIsLoadingAgents: setIsLoadingAgents,
    updateIsLoadingChatHistory: setIsLoadingChatHistory,
    
    // Action setters (for dashboard to set the functions)
    setActionRefs: (refs: typeof actionRefs.current) => {
      actionRefs.current = refs
    }
  }

  return (
    <SidebarStateContext.Provider value={contextValue}>
      {children}
    </SidebarStateContext.Provider>
  )
}

export function useSidebarState() {
  const context = React.useContext(SidebarStateContext)
  if (!context) {
    throw new Error("useSidebarState must be used within a SidebarStateProvider")
  }
  return context
}
