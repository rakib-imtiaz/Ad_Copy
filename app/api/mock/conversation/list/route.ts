import { NextRequest, NextResponse } from 'next/server'
import { sampleConversations } from '@/lib/sample-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const agentId = searchParams.get('agent_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "User ID is required"
          }
        },
        { status: 400 }
      )
    }

    // Convert sample conversations to API format
    let conversations = sampleConversations.map(conv => ({
      id: conv.id,
      user_id: conv.userId,
      agent_id: conv.agentId,
      title: conv.title,
      message_count: conv.messages.length,
      created_at: conv.createdAt.toISOString(),
      updated_at: conv.updatedAt.toISOString(),
      agent_name: sampleConversations.find(c => c.agentId === conv.agentId)?.title || "Unknown Agent"
    }))

    // Filter by agent if specified
    if (agentId) {
      conversations = conversations.filter(conv => conv.agent_id === agentId)
    }

    // Mock pagination
    const total = conversations.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedConversations = conversations.slice(startIndex, endIndex)

    const mockResponse = {
      success: true,
      data: {
        conversations: paginatedConversations,
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages
        }
      }
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