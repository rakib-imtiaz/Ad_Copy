import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, freeze_email, freeze_status, freeze_duration } = body;

    console.log('=== ACCOUNT FREEZE REQUEST START ===');
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    // Note: allow freeze_duration to be 0 for unfreeze operations
    const isFreezeDurationMissing = freeze_duration === undefined || freeze_duration === null;
    if (!accessToken || !freeze_email || freeze_status === undefined || isFreezeDurationMissing) {
      console.log('Validation failed: Missing required fields');
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'MISSING_FIELDS',
            message: 'accessToken, freeze_email, freeze_status, and freeze_duration are required' 
          } 
        },
        { status: 400 }
      );
    }

    // Additional validation: freeze_duration must be a non-negative integer
    if (typeof freeze_duration !== 'number' || !Number.isFinite(freeze_duration) || freeze_duration < 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_DURATION',
            message: 'freeze_duration must be a non-negative number',
          }
        },
        { status: 400 }
      );
    }

    // Forward the request to n8n webhook
    const n8nEndpoint = 'https://n8n.srv934833.hstgr.cloud/webhook/account-freeze';
    console.log('Calling n8n endpoint:', n8nEndpoint);
    
    const n8nResponse = await fetch(n8nEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        accessToken,
        freeze_email,
        freeze_status,
        freeze_duration
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
              message: 'Invalid response from freeze service' 
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
            code: 'FREEZE_FAILED',
            message: data.message || `Failed to ${freeze_status ? 'freeze' : 'unfreeze'} account` 
          } 
        },
        { status: n8nResponse.status }
      );
    }

    // Success response
    const responseData = {
      success: true,
      message: freeze_status 
        ? `Account ${freeze_email} has been frozen for ${freeze_duration} days`
        : `Account ${freeze_email} has been unfrozen`,
      data: data
    };
    
    console.log('Final response data:', JSON.stringify(responseData, null, 2));
    console.log('=== ACCOUNT FREEZE REQUEST END ===');
    
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('=== ACCOUNT FREEZE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SERVER_ERROR',
          message: 'Failed to process account freeze request' 
        } 
      },
      { status: 500 }
    );
  }
}
