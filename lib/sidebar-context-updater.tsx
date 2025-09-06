"use client"

import * as React from "react"
import { SidebarContext } from "./sidebar-context"

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
    // Add other update functions as needed
  }
}

