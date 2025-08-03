import { NextRequest, NextResponse } from 'next/server'
import { sampleMediaItems } from '@/lib/sample-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type')
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

    // Convert sample media items to API format
    let items = sampleMediaItems.map(item => ({
      id: item.id,
      user_id: item.userId,
      filename: item.filename,
      type: item.type,
      size: item.size,
      uploaded_at: item.uploadedAt.toISOString(),
      content: item.content,
      tags: item.tags,
      metadata: item.metadata
    }))

    // Filter by type if specified
    if (type) {
      items = items.filter(item => item.type === type)
    }

    // Mock pagination
    const total = items.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedItems = items.slice(startIndex, endIndex)

    const mockResponse = {
      success: true,
      data: {
        items: paginatedItems,
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