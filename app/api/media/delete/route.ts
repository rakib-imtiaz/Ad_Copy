import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { file_name } = body
    
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization')
    const access_token = authHeader?.replace('Bearer ', '')

    console.log('🔍 Received delete request:', {
      hasAuthHeader: !!authHeader,
      hasAccessToken: !!access_token,
      accessTokenLength: access_token?.length || 0,
      fileName: file_name,
      bodyKeys: Object.keys(body)
    })

    if (!access_token) {
      console.error('❌ No access token provided in Authorization header')
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      )
    }

    if (!file_name) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      )
    }

    console.log('🗑️ Deleting media file:', file_name)
    console.log('📊 Filename length:', file_name.length)
    console.log('📊 Filename contains special chars:', /[^a-zA-Z0-9._-]/.test(file_name))

    // Forward the request to the n8n webhook with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const n8nResponse = await fetch('https://n8n.srv934833.hstgr.cloud/webhook/delete-media-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token,
          file_name
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text()
        console.error('❌ n8n delete failed:', n8nResponse.status, errorText)
        
        return NextResponse.json(
          { 
            error: 'Failed to delete file on server',
            details: errorText,
            status: n8nResponse.status
          },
          { status: n8nResponse.status }
        )
      }

      const result = await n8nResponse.json()
      console.log('✅ File deleted successfully:', result)

      return NextResponse.json({
        success: true,
        message: 'File deleted successfully',
        data: result
      })

    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('❌ Request timeout')
        return NextResponse.json(
          { error: 'Request timeout - server took too long to respond' },
          { status: 408 }
        )
      }
      
      throw fetchError
    }

  } catch (error) {
    console.error('❌ Error in media delete API:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
