import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api-config";

export async function GET(request: NextRequest) {
  try {
    console.log('=== KNOWLEDGE BASE FETCH START ===');
    console.log('Timestamp:', new Date().toISOString());

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

    console.log('🔐 Auth header present:', !!authHeader);
    console.log('🔐 Auth header starts with Bearer:', authHeader?.startsWith('Bearer '));
    console.log('🔐 Access token length:', accessToken.length);
    console.log('🔐 Access token preview:', accessToken.substring(0, 20) + '...');

    // Fetch knowledge base from n8n webhook
    console.log('📚 Fetching knowledge base from n8n webhook');
    console.log('🔗 Webhook URL:', API_ENDPOINTS.N8N_WEBHOOKS.SEE_KNOWLEDGE_BASE);
    console.log('🔗 Full webhook URL:', API_ENDPOINTS.N8N_WEBHOOKS.SEE_KNOWLEDGE_BASE);
    
    console.log('📤 Making request with:');
    console.log('  - Method: GET');
    console.log('  - Headers:', {
      Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
      'Content-Type': 'application/json'
    });

    const n8nResponse = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.SEE_KNOWLEDGE_BASE, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Response received:');
    console.log('  - Status:', n8nResponse.status);
    console.log('  - Status text:', n8nResponse.statusText);
    console.log('  - OK:', n8nResponse.ok);
    console.log('  - Headers:', Object.fromEntries(n8nResponse.headers.entries()));

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
      console.log('Knowledge base fetch failed with status:', n8nResponse.status);
      
      // Handle 404 errors gracefully
      if (n8nResponse.status === 404) {
        console.log('n8n webhook not found (404) - returning empty knowledge base')
        return NextResponse.json({
          success: true,
          data: {
            content: "",
            type: 'empty',
            timestamp: new Date().toISOString()
          }
        })
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'KB_FETCH_FAILED',
            message: 'Failed to fetch knowledge base' 
          } 
        },
        { status: n8nResponse.status }
      );
    }

    // Parse the response
    console.log('📄 Reading response text...');
    const responseText = await n8nResponse.text();
    console.log('📄 Raw response text length:', responseText.length);
    console.log('📄 Raw response text (first 500 chars):', responseText.substring(0, 500));
    console.log('📄 Raw response text (last 500 chars):', responseText.substring(Math.max(0, responseText.length - 500)));

    let knowledgeBaseContent = "";
    
    try {
      console.log('📄 Parsing JSON response...');
      const result = JSON.parse(responseText);
      console.log('📄 Parsed result type:', typeof result);
      console.log('📄 Parsed result keys:', Object.keys(result));
      
      // Handle different response formats
      if (Array.isArray(result) && result.length > 0) {
        knowledgeBaseContent = result[0]?.company_info || result[0]?.business_info || "";
        console.log('📄 Found array format with company_info');
      } else if (result && typeof result === 'object') {
        knowledgeBaseContent = result.company_info || result.business_info || result.data?.company_info || result.data?.business_info || result.data || "";
        console.log('📄 Found object format');
      } else if (typeof result === 'string') {
        knowledgeBaseContent = result;
        console.log('📄 Found string format');
      }
      
      console.log('📄 Knowledge base content length:', knowledgeBaseContent.length);
      console.log('📄 Knowledge base content preview:', knowledgeBaseContent.substring(0, 200) + '...');
      
    } catch (jsonError) {
      console.log('📄 JSON parse failed, treating as text content');
      knowledgeBaseContent = responseText;
      console.log('📄 Text content length:', knowledgeBaseContent.length);
      console.log('📄 Text content preview:', knowledgeBaseContent.substring(0, 200) + '...');
    }

    // Transform and return the knowledge base content wrapped under body
    let transformedContent = knowledgeBaseContent;
    
    try {
      // Try to parse as JSON and transform if needed
      const parsedContent = JSON.parse(knowledgeBaseContent);
      
      // If it's already wrapped under body, use as is
      if (parsedContent.body) {
        transformedContent = JSON.stringify(parsedContent);
      } else {
        // Wrap the content under body object
        const wrappedContent = { body: parsedContent };
        transformedContent = JSON.stringify(wrappedContent);
      }
    } catch (parseError) {
      // If not JSON, wrap the text content under body
      const wrappedContent = { body: { content: knowledgeBaseContent } };
      transformedContent = JSON.stringify(wrappedContent);
    }

    const responseData = {
      success: true,
      data: {
        content: transformedContent,
        type: 'knowledge_base',
        timestamp: new Date().toISOString(),
        length: transformedContent.length
      }
    };
    
    console.log('✅ Knowledge base fetched successfully:');
    console.log('  - Content length:', knowledgeBaseContent.length);
    console.log('  - Content preview:', knowledgeBaseContent.substring(0, 100) + '...');
    console.log('=== KNOWLEDGE BASE FETCH END ===');
    
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('=== KNOWLEDGE BASE FETCH ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SERVER_ERROR',
          message: 'Failed to fetch knowledge base' 
        } 
      },
      { status: 500 }
    );
  }
}
