"use client"

import { AgentManager } from "@/components/agent-manager"
import { sampleAgents } from "@/lib/sample-data"

export default function AgentsPage() {
  // Enhanced sample data
  const mockAgents = sampleAgents

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