"use client"

import { AgentManager } from "@/components/agent-manager"

export default function AgentsPage() {
  // Empty agents array - will be populated from API
  const mockAgents: any[] = []

  const handleSelectAgent = (agentId: string) => {
    console.log("Selected agent:", agentId)
    // In a real app, you would handle agent selection here
  }

  const handleCreateConversation = (agentId: string) => {
    console.log("Creating conversation with agent:", agentId)
    // In a real app, you would navigate to chat with this agent
    window.location.href = `/chat?agent=${agentId}`
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <div className="p-6">
        <AgentManager 
          agents={mockAgents}
          onSelectAgent={handleSelectAgent}
          onCreateConversation={handleCreateConversation}
          isAdmin={false}
        />
      </div>
    </div>
  )
}