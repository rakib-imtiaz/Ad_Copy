import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

// Transformation function to convert old format to new format
function transformKnowledgeBaseData(oldData: any): any {
  const transformed: any = {
    brandIdentity: {},
    targetAudience: {},
    offers: [],
    clientAssets: {},
    otherInformation: ''
  }

  // Transform Brand Identity
  if (oldData['1. Brand & Identity']) {
    const brandData = oldData['1. Brand & Identity']
    
    // Business Name & Tagline
    if (brandData['Business Name & Tagline']) {
      transformed.brandIdentity.businessNameTagline = {
        name: brandData['Business Name & Tagline']['Name'] || '',
        tagline: brandData['Business Name & Tagline']['Tagline'] || ''
      }
    }
    
    // Founder's Name & Backstory
    if (brandData['Founder\'s Name & Backstory']) {
      transformed.brandIdentity.founderNameBackstory = {
        founders: brandData['Founder\'s Name & Backstory']['Founders'] || '',
        backstory: brandData['Founder\'s Name & Backstory']['Backstory'] || ''
      }
    }
    
    // Mission Statement
    if (brandData['Mission Statement']) {
      transformed.brandIdentity.missionStatement = {
        whyWeExist: brandData['Mission Statement']['Why We Exist'] || '',
        principles: brandData['Mission Statement']['Principles'] || ''
      }
    }
    
    // Other brand fields
    transformed.brandIdentity.businessModelType = brandData['Business Model Type'] || ''
    transformed.brandIdentity.uniqueSellingProposition = brandData['Unique Selling Proposition (USP)'] || ''
    
    // Tone & Personality
    if (brandData['Tone & Personality']) {
      transformed.brandIdentity.tonePersonality = {
        style: brandData['Tone & Personality']['Style'] || []
      }
    }
    
  }

  // Transform Target Audience
  if (oldData['2. Target Audience']) {
    const audienceData = oldData['2. Target Audience']
    
    // Ideal Customer Profile
    if (audienceData['Ideal Customer Profile(s)']) {
      transformed.targetAudience.idealCustomerProfile = {
        description: audienceData['Ideal Customer Profile(s)']['Description'] || []
      }
    }
    
    // Other audience fields
    transformed.targetAudience.primaryPainPoints = audienceData['Primary Pain Points'] || []
    transformed.targetAudience.primaryDesiresGoals = audienceData['Primary Desires & Goals'] || []
    transformed.targetAudience.commonObjections = audienceData['Common Objections'] || []
    transformed.targetAudience.audienceVocabulary = audienceData['Audience Vocabulary'] || []
  }

  // Transform Offers
  if (oldData['3. Offers']) {
    const offersData = oldData['3. Offers']
    transformed.offers = []
    
    // Convert offers object to array format
    Object.keys(offersData).forEach(key => {
      if (offersData[key] && typeof offersData[key] === 'string') {
        // Split the key to extract name and price (format: "name – price")
        const namePriceParts = key.split(' – ')
        const name = namePriceParts[0] || key
        const price = namePriceParts[1] || ''
        
        transformed.offers.push({
          name: name,
          price: price,
          description: offersData[key]
        })
      }
    })
  }

  // Transform Client Assets
  if (oldData['4. Client Assets']) {
    const assetsData = oldData['4. Client Assets']
    
    // Social Media Profiles
    if (assetsData['Links to All Social Media Profiles']) {
      const socialData = assetsData['Links to All Social Media Profiles']
      transformed.clientAssets.socialMediaProfiles = {
        instagram: socialData['Instagram'] || '',
        youtube: socialData['YouTube'] || '',
        facebook: socialData['Facebook'] || '',
        tiktok: socialData['TikTok'] || ''
      }
    }
    
    // Testimonials & Case Studies
    if (assetsData['Testimonials & Case Studies']) {
      const testimonialsData = assetsData['Testimonials & Case Studies']
      // Handle both old categorized format and new single array format
      if (Array.isArray(testimonialsData)) {
        transformed.clientAssets.testimonialsCaseStudies = testimonialsData.filter(t => t.trim() !== '')
      } else {
        // Combine all testimonials from different categories into one array
        const allTestimonials = [
          ...(testimonialsData['Ecommerce'] || []),
          ...(testimonialsData['Financial Services'] || []),
          ...(testimonialsData['Entertainment'] || []),
          ...(testimonialsData['Coaches / Consultants'] || []),
          ...(testimonialsData['Brick & Mortar'] || []),
          ...(testimonialsData['Others'] || [])
        ].filter(t => t.trim() !== '')
        
        transformed.clientAssets.testimonialsCaseStudies = allTestimonials.length > 0 ? allTestimonials : ['']
      }
    }
  }

  // Transform Other Information
  if (oldData['6. Other Information']) {
    transformed.otherInformation = oldData['6. Other Information']
  }

  return transformed
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD KNOWLEDGE BASE API START ===')
    console.log('Timestamp:', new Date().toISOString())
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      console.log('❌ No authorization header found')
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTH_ERROR",
            message: "Authorization header is required"
          }
        },
        { status: 401 }
      )
    }

    console.log('✅ Authorization header found')
    console.log('🔗 Webhook URL being used:', API_ENDPOINTS.N8N_WEBHOOKS.UPLOAD_KNOWLEDGE_BASE_BY_FIELD)

    // Parse the JSON data from brand form
    const contentType = request.headers.get('content-type')
    console.log('📋 Content-Type:', contentType)
    
    let brandData
    let file: File | null = null
    
    if (contentType?.includes('application/json')) {
      brandData = await request.json()
      console.log('📋 Brand data received (JSON):')
      console.log(JSON.stringify(brandData, null, 2))
    } else {
      // Fallback for form data (file uploads)
      const formData = await request.formData()
      file = formData.get('file') as File
      const content = formData.get('content') as string
      
      if (!file) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "File is required"
            }
          },
          { status: 400 }
        )
      }

      // Validate file properties
      if (!file.name || !file.size || file.size === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid file: file must have a name and size"
            }
          },
          { status: 400 }
        )
      }

      console.log('Form data received:', {
        hasFile: !!file,
        hasContent: !!content,
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type,
        contentLength: content?.length
      })

      console.log('File received:', {
        name: file.name,
        size: file.size,
        type: file.type
      })
    }

    // Extract access token from authorization header
    const accessToken = authHeader.replace('Bearer ', '')
    
    let requestBody
    let requestHeaders: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
    }

    if (brandData) {
      // Transform the old format to new format (don't wrap under body - n8n will do that)
      const transformedData = transformKnowledgeBaseData(brandData)
      requestBody = JSON.stringify(transformedData)
      requestHeaders['Content-Type'] = 'application/json'
      
      console.log('📤 Sending transformed brand data to n8n webhook:', {
        url: API_ENDPOINTS.N8N_WEBHOOKS.UPLOAD_KNOWLEDGE_BASE_BY_FIELD,
        data_type: 'JSON',
        data_size: requestBody.length,
        auth_method: 'Bearer',
        access_token_length: accessToken.length,
        transformed: true
      })
      
      // Debug: Log the actual transformed data being sent
      console.log('🔍 Transformed data being sent to webhook:')
      console.log(JSON.stringify(JSON.parse(requestBody), null, 2))
    } else if (file) {
      // Handle file upload (existing logic)
      const n8nFormData = new FormData()
      n8nFormData.append('file', file)
      requestBody = n8nFormData
      
      console.log('📤 Sending file to n8n webhook:', {
        url: API_ENDPOINTS.N8N_WEBHOOKS.UPLOAD_KNOWLEDGE_BASE,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        auth_method: 'Bearer',
        access_token_length: accessToken.length
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Either brand data or file is required"
          }
        },
        { status: 400 }
      )
    }

    // Call the n8n webhook with Bearer token authentication
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    try {
      const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.UPLOAD_KNOWLEDGE_BASE_BY_FIELD, {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

    console.log('📊 N8N webhook response status:', response.status)
    console.log('📊 N8N webhook response headers:', Object.fromEntries(response.headers.entries()))

    // Try to get response text first
    const responseText = await response.text()
    console.log('📊 N8N webhook response text length:', responseText.length)
    console.log('📊 N8N webhook response text:', responseText)
    console.log('📊 N8N webhook response is empty:', responseText.trim() === '')

    if (!response.ok) {
      console.error('❌ N8N webhook failed with status:', response.status)
      console.error('❌ N8N webhook error response:', responseText)
      
      // Try to parse as JSON if possible
      let errorDetails = responseText
      try {
        if (responseText.trim()) {
          const errorJson = JSON.parse(responseText)
          errorDetails = JSON.stringify(errorJson, null, 2)
        } else {
          errorDetails = 'Empty response from webhook'
        }
      } catch (e) {
        // If not JSON, use as text
        errorDetails = responseText || 'No response content'
      }
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "N8N_ERROR",
            message: `N8N webhook failed with status ${response.status}`,
            details: errorDetails
          }
        },
        { status: response.status }
      )
    }

    // Try to parse response as JSON
    let data
    try {
      if (responseText.trim()) {
        data = JSON.parse(responseText)
        console.log('N8N webhook response data:', data)
      } else {
        console.log('Empty response from webhook, providing default success response')
        data = { 
          success: true,
          message: file ? 'File uploaded successfully' : 'Data uploaded successfully',
          data: file ? {
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            uploaded_at: new Date().toISOString()
          } : {
            uploaded_at: new Date().toISOString()
          }
        }
      }
    } catch (e) {
      console.log('Response is not JSON, treating as text:', responseText)
      data = { 
        success: true,
        message: responseText || (file ? 'File uploaded successfully' : 'Data uploaded successfully'),
        data: file ? {
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          uploaded_at: new Date().toISOString()
        } : {
          uploaded_at: new Date().toISOString()
        }
      }
    }

    // If n8n webhook returns an error, return the error
    if (response.status === 500 || responseText.trim() === '' || !data.success) {
      console.log('🔍 Webhook error details:', {
        status: response.status,
        responseText: responseText,
        data: data
      })
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "N8N_WEBHOOK_ERROR",
            message: `N8N webhook failed with status ${response.status}`,
            details: responseText || 'No response from webhook'
          }
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
    
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error('Error calling n8n webhook:', fetchError)
      
      // Type guard to check if fetchError is an Error object
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "TIMEOUT_ERROR",
                message: "Request to n8n webhook timed out"
              }
            },
            { status: 408 }
          )
        }
        
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "N8N_ERROR",
              message: "Failed to connect to n8n webhook",
              details: fetchError.message
            }
          },
          { status: 500 }
        )
      }
      
      // Handle unknown error types
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "N8N_ERROR",
            message: "Failed to connect to n8n webhook",
            details: String(fetchError)
          }
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in knowledge base upload API:', error)
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
