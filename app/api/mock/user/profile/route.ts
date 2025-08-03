import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock user profile data
    const mockResponse = {
      success: true,
      data: {
        id: "user_123",
        name: "John Doe",
        email: "user@example.com",
        role: "user",
        org_id: "org_456",
        avatar_url: "https://example.com/avatar.jpg",
        created_at: "2024-01-01T00:00:00Z",
        settings: {
          theme: "dark",
          notifications: {
            email: true,
            push: true,
            copyUpdates: true,
            systemAlerts: true
          },
          defaultOutputPreset: "custom",
          autoSave: true
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock profile update
    const mockResponse = {
      success: true,
      data: {
        id: "user_123",
        name: body.name || "John Doe",
        email: "user@example.com",
        avatar_url: body.avatar_url || "https://example.com/avatar.jpg",
        updated_at: new Date().toISOString()
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