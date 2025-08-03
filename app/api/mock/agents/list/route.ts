import { NextRequest, NextResponse } from 'next/server'
import { sampleAgents } from '@/lib/sample-data'

export async function GET(request: NextRequest) {
  try {
    // Convert sample agents to API format
    const agents = sampleAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      prompt: agent.prompt,
      is_global: agent.isGlobal,
      version: agent.version,
      is_active: agent.isActive,
      created_at: agent.createdAt.toISOString(),
      updated_at: agent.updatedAt.toISOString(),
      created_by: agent.createdBy
    }))

    const mockResponse = {
      success: true,
      data: agents
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred"
        }
      },
      { status: 500 }
    )
  }
} 