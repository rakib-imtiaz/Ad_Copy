import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Media upload API endpoint called')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No authorization header provided')
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7) // Remove 'Bearer ' prefix
    console.log('Making upload request to n8n webhook with access token')

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('File received:', file.name, file.size, file.type)

    // Create form data for the n8n webhook
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    // Make request to n8n webhook
    const response = await fetch(
      'https://n8n.srv934833.hstgr.cloud/webhook/upload-media-file',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: uploadFormData,
      }
    )

    console.log('N8N upload webhook response status:', response.status)

    if (!response.ok) {
      console.log('N8N upload webhook request failed')
      return NextResponse.json(
        { error: 'Failed to upload media file' },
        { status: response.status }
      )
    }

    // Check if response has content before trying to parse JSON
    const responseText = await response.text()
    console.log('N8N upload webhook response text:', responseText)
    
    let data
    try {
      data = responseText ? JSON.parse(responseText) : { success: true, message: 'File uploaded successfully' }
    } catch (error) {
      console.log('Response is not JSON, treating as success')
      data = { success: true, message: 'File uploaded successfully' }
    }
    
    console.log('N8N upload webhook response data:', data)
    
    // Handle the n8n response format
    if (data.status === 'successful' && data.file_name) {
      // Return a standardized response format
      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          media_id: `media_${Date.now()}`,
          file_name: data.file_name,
          file_type: file.type,
          media_size: (file.size / 1024 / 1024).toFixed(1), // Convert to MB
          storage_status: 'enough space'
        }
      })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error uploading media file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 