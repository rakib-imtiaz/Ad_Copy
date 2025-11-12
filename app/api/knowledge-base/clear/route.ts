import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken } = body;

    console.log('=== CLEAR KNOWLEDGE BASE REQUEST START ===');
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!accessToken) {
      console.log('Validation failed: Missing accessToken');
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'MISSING_ACCESS_TOKEN',
            message: 'Access token is required' 
          } 
        },
        { status: 400 }
      );
    }

    // Forward the request to n8n webhook
    const n8nEndpoint = 'https://n8n.srv934833.hstgr.cloud/webhook/empty-knowledge-base';
    console.log('Calling n8n endpoint:', n8nEndpoint);
    
    const n8nResponse = await fetch(n8nEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        accessToken
      }),
    });

    console.log('=== N8N RESPONSE ===');
    console.log('Status:', n8nResponse.status);
    console.log('Status Text:', n8nResponse.statusText);
    console.log('Headers:', Object.fromEntries(n8nResponse.headers.entries()));
    console.log('OK:', n8nResponse.ok);

    // Check if response has content before parsing
    const responseText = await n8nResponse.text();
    console.log('N8N Response Text:', responseText);
    
    let data: any = {};
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
        console.log('N8N Response Data:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('Failed to parse n8n response:', parseError);
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'INVALID_RESPONSE',
              message: 'Invalid response from Business Info service' 
            } 
          },
          { status: 500 }
        );
      }
    }

    if (!n8nResponse.ok) {
      console.log('N8N returned error status:', n8nResponse.status);
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'CLEAR_FAILED',
            message: data.message || 'Failed to clear Business Info' 
          } 
        },
        { status: n8nResponse.status }
      );
    }

    // Success response
    const responseData = {
      success: true,
      message: 'Business Info cleared successfully',
      data: data
    };
    
    console.log('Final response data:', JSON.stringify(responseData, null, 2));
    console.log('=== CLEAR KNOWLEDGE BASE REQUEST END ===');
    
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('=== CLEAR KNOWLEDGE BASE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SERVER_ERROR',
          message: 'Failed to process clear Business Info request' 
        } 
      },
      { status: 500 }
    );
  }
}
