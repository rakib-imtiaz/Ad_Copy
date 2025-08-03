import { NextRequest, NextResponse } from 'next/server'
import { sampleConversations } from '@/lib/sample-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Conversation ID is required"
          }
        },
        { status: 400 }
      )
    }

    // Find conversation by ID
    const conversation = sampleConversations.find(conv => conv.id === id)

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Conversation not found"
          }
        },
        { status: 404 }
      )
    }

    // Convert to API format
    const mockResponse = {
      success: true,
      data: {
        id: conversation.id,
        user_id: conversation.userId,
        agent_id: conversation.agentId,
        title: conversation.title,
        messages: conversation.messages.map(msg => ({
          id: msg.id,
          conversation_id: msg.conversationId,
          content: msg.content,
          type: msg.type,
          timestamp: msg.timestamp.toISOString(),
          metadata: msg.metadata
        })),
        pinned_messages: conversation.pinnedMessages,
        knowledge_base_snapshot: {
          id: conversation.knowledgeBaseSnapshot.id,
          user_id: conversation.knowledgeBaseSnapshot.userId,
          company_name: conversation.knowledgeBaseSnapshot.companyName,
          service: conversation.knowledgeBaseSnapshot.service,
          industry: conversation.knowledgeBaseSnapshot.industry,
          niche: conversation.knowledgeBaseSnapshot.niche
        },
        attached_media: conversation.attachedMedia,
        created_at: conversation.createdAt.toISOString(),
        updated_at: conversation.updatedAt.toISOString()
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