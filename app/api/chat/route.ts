import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, sessionId, agentId, userPrompt } = body;

    console.log('=== CHAT REQUEST START ===');
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!email || !sessionId || !agentId || !userPrompt) {
      console.log('Validation failed: Missing required fields');
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'MISSING_FIELDS',
            message: 'Email, sessionId, agentId, and userPrompt are required' 
          } 
        },
        { status: 400 }
      );
    }

    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    
    if (!accessToken) {
      console.log('Missing access token');
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'MISSING_TOKEN',
            message: 'Access token is required' 
          } 
        },
        { status: 401 }
      );
    }

    // Fetch knowledge base content first
    console.log('📚 Fetching knowledge base content...');
    let knowledgeBaseContent = "";
    
    try {
      const kbResponse = await fetch(`${request.nextUrl.origin}/api/knowledge-base`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (kbResponse.ok) {
        const kbData = await kbResponse.json();
        if (kbData.success && kbData.data?.content) {
          knowledgeBaseContent = kbData.data.content;
          console.log('✅ Knowledge base content fetched successfully');
          console.log('📄 Knowledge base content length:', knowledgeBaseContent.length);
          console.log('📄 Knowledge base content preview:', knowledgeBaseContent.substring(0, 200) + '...');
        } else {
          console.log('⚠️ Knowledge base fetch returned no content');
        }
      } else {
        console.log('⚠️ Knowledge base fetch failed with status:', kbResponse.status);
      }
    } catch (kbError) {
      console.log('⚠️ Knowledge base fetch error:', kbError);
    }

    // Forward the request to n8n webhook with knowledge base content
    const { API_ENDPOINTS } = await import('@/lib/api-config');
    const n8nEndpoint = API_ENDPOINTS.N8N_WEBHOOKS.CHAT;
    console.log('Calling n8n endpoint:', n8nEndpoint);
    
    const chatPayload: any = {
      email,
      'session-id': sessionId,
      'agent-id': agentId,
      'user-prompt': userPrompt
    };

    // Include knowledge base content if available
    if (knowledgeBaseContent) {
      chatPayload['knowledge-base'] = knowledgeBaseContent;
      console.log('📚 Including knowledge base content in chat request');
    }
    
    const n8nResponse = await fetch(n8nEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(chatPayload),
    });

    console.log('=== N8N CHAT RESPONSE ===');
    console.log('Status:', n8nResponse.status);
    console.log('Status Text:', n8nResponse.statusText);
    console.log('Headers:', Object.fromEntries(n8nResponse.headers.entries()));
    console.log('OK:', n8nResponse.ok);

    // Check for authentication failure (401 status)
    if (n8nResponse.status === 401) {
      console.log('Authentication failed (401)');
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired access token' 
          } 
        },
        { status: 401 }
      );
    }

    // Check for other errors
    if (!n8nResponse.ok) {
      console.log('Chat request failed with status:', n8nResponse.status);
      
      // Handle 404 errors gracefully
      if (n8nResponse.status === 404) {
        console.log('n8n webhook not found (404) - returning fallback response')
        return NextResponse.json({
          success: true,
          data: {
            response: "The AI agent service is currently unavailable. Please try again later.",
            type: 'service_unavailable',
            timestamp: new Date().toISOString()
          }
        })
      }
      
      // Handle 500 workflow errors gracefully
      if (n8nResponse.status === 500) {
        console.log('n8n webhook workflow error (500) - returning fallback response')
        return NextResponse.json({
          success: true,
          data: {
            response: "The AI agent is experiencing technical difficulties. Please try again in a moment.",
            type: 'workflow_error',
            timestamp: new Date().toISOString()
          }
        })
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'CHAT_FAILED',
            message: 'Failed to process chat request' 
          } 
        },
        { status: n8nResponse.status }
      );
    }

    // If we got here, the chat request was successful
    console.log('Chat request successful, parsing response...');
    
    // Check content type to handle different response formats
    const contentType = n8nResponse.headers.get('content-type');
    console.log('Response content type:', contentType);
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      // Parse JSON response
      try {
        const responseText = await n8nResponse.text();
        console.log('Raw JSON response text:', responseText);
        
        if (!responseText || responseText.trim() === '') {
          // Handle empty response
          data = {
            response: "The AI agent is currently processing your request. Please try again in a moment.",
            type: 'empty_response',
            timestamp: new Date().toISOString()
          };
        } else {
          data = JSON.parse(responseText);
          console.log('N8N JSON Response Data:', JSON.stringify(data, null, 2));
        }
      } catch (jsonError) {
        console.log('JSON parsing error:', jsonError);
        // Handle JSON parsing error
        data = {
          response: "Received an invalid response from the AI agent. Please try again.",
          type: 'json_error',
          timestamp: new Date().toISOString()
        };
      }
         } else {
       // Handle HTML or text response
       const textResponse = await n8nResponse.text();
       console.log('N8N Text Response:', textResponse.substring(0, 200) + '...');
       
       // Check if it's a credit limit error
       if (textResponse.includes("Don't have enough credit")) {
         data = {
           response: "You've reached your credit limit. Please upgrade your plan to continue using the AI agent.",
           type: 'credit_error',
           timestamp: new Date().toISOString()
         };
       } else {
         // Create a mock response structure for other HTML/text responses
         data = {
           response: textResponse,
           type: 'html',
           timestamp: new Date().toISOString()
         };
       }
     }
    
    // Return the response from n8n
    const responseData = {
      success: true,
      data: data
    };
    console.log('Final chat response data:', JSON.stringify(responseData, null, 2));
    
    console.log('=== CHAT REQUEST END ===');
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('=== CHAT ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SERVER_ERROR',
          message: 'Failed to process chat request' 
        } 
      },
      { status: 500 }
    );
  }
}
