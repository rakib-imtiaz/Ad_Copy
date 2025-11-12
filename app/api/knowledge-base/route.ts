import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api-config";

export async function GET(request: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    
    if (!accessToken) {
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

    // Fetch knowledge base from n8n webhook
    const n8nResponse = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.SEE_KNOWLEDGE_BASE, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Check for authentication failure (401 status)
    if (n8nResponse.status === 401) {
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
      // Handle 404 errors gracefully
      if (n8nResponse.status === 404) {
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
            message: 'Failed to fetch Business Info' 
          } 
        },
        { status: n8nResponse.status }
      );
    }

    // Parse the response
    const responseText = await n8nResponse.text();
    let knowledgeBaseContent = "";
    
    try {
      const result = JSON.parse(responseText);
      
      // Handle different response formats
      if (Array.isArray(result) && result.length > 0) {
        knowledgeBaseContent = result[0]?.company_info || result[0]?.business_info || "";
      } else if (result && typeof result === 'object') {
        knowledgeBaseContent = result.company_info || result.business_info || result.data?.company_info || result.data?.business_info || result.data || "";
      } else if (typeof result === 'string') {
        knowledgeBaseContent = result;
      }
      
    } catch (jsonError) {
      knowledgeBaseContent = responseText;
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
    
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Knowledge base fetch error:', error);
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
