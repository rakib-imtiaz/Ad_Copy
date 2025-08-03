import { NextRequest, NextResponse } from 'next/server'
import { sampleConversations } from '@/lib/sample-data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock validation
    if (!body.user_id || !body.agent_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "User ID and agent ID are required"
          }
        },
        { status: 400 }
      )
    }

    // Generate conversation ID if not provided
    const conversationId = body.conversation_id || `conv_${Date.now()}`
    
    // Mock AI response based on agent type
    let aiResponse = ""
    let generatedCopy = null
    
    if (body.agent_id === "agent-1") { // CopyMaster Pro
      aiResponse = "Perfect! I'll help you create compelling ad copy. Let me start by understanding your key value propositions and then craft some high-converting ad copy."
      generatedCopy = {
        id: `copy_${Date.now()}`,
        content: "Stop Losing Money on Missed Deadlines - Streamline your projects with our intuitive SaaS platform.",
        preset: "facebook",
        template_variables: {
          product: body.inputs?.product_type || "SaaS",
          audience: body.inputs?.target_audience || "business owners"
        },
        created_at: new Date().toISOString(),
        conversation_id: conversationId,
        is_saved: false
      }
    } else if (body.agent_id === "agent-2") { // Social Media Specialist
      aiResponse = "Great! Let me create engaging social media content for your brand. I'll focus on the busy professional lifestyle and make the content relatable and motivating."
      generatedCopy = {
        id: `copy_${Date.now()}`,
        content: "No time for the gym? No problem! 💪 This 15-minute home workout will torch calories and build strength - perfect for busy professionals.",
        preset: "custom",
        template_variables: {
          platform: "Instagram",
          content_type: "workout"
        },
        created_at: new Date().toISOString(),
        conversation_id: conversationId,
        is_saved: false
      }
    } else if (body.agent_id === "agent-3") { // Email Marketing Expert
      aiResponse = "Perfect! Email subject lines are crucial for open rates. Let me create some compelling options for your brand that will make subscribers want to click."
      generatedCopy = {
        id: `copy_${Date.now()}`,
        content: "Only 24 hours left: 50% off luxury skincare",
        preset: "email-subject",
        template_variables: {
          industry: "skincare",
          audience: "e-commerce customers"
        },
        created_at: new Date().toISOString(),
        conversation_id: conversationId,
        is_saved: false
      }
    } else if (body.agent_id === "agent-4") { // Google Ads Specialist
      aiResponse = "Excellent! B2B Google Ads require a different approach than B2C. Let me create compelling ad copy that speaks to business decision-makers and emphasizes ROI and efficiency."
      generatedCopy = {
        id: `copy_${Date.now()}`,
        content: "Automated Bookkeeping Software | Save 20+ Hours Monthly | Free 30-Day Trial",
        preset: "google",
        template_variables: {
          industry: "B2B software",
          audience: "business owners"
        },
        created_at: new Date().toISOString(),
        conversation_id: conversationId,
        is_saved: false
      }
    } else {
      aiResponse = "I'm here to help you create compelling marketing copy. What specific type of content are you looking to create today?"
    }

    const mockResponse = {
      success: true,
      data: {
        conversation_id: conversationId,
        messages: [
          {
            id: `msg_${Date.now()}`,
            conversation_id: conversationId,
            content: aiResponse,
            type: "ai",
            timestamp: new Date().toISOString(),
            metadata: generatedCopy ? {
              generated_copy: generatedCopy
            } : undefined
          }
        ]
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