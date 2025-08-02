"use client"

import { KnowledgeBaseComponent } from "@/components/knowledge-base"

export default function KnowledgeBasePage() {
  // Mock data - in a real app, this would come from your backend
  const mockKnowledgeBase = {
    id: "kb-1",
    userId: "user-1",
    companyName: "TechCorp Solutions",
    service: "B2B Software Solutions",
    industry: "Technology",
    niche: "AI-powered project management for remote teams",
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1
  }

  const handleSave = async (data: any) => {
    console.log("Saving knowledge base:", data)
    // In a real app, you would save to your backend here
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <div className="p-6">
        <KnowledgeBaseComponent 
          knowledgeBase={mockKnowledgeBase}
          onSave={handleSave}
          isLoading={false}
        />
      </div>
    </div>
  )
}