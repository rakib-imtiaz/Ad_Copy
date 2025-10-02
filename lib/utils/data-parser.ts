// Data Parsing Utilities
// Handles parsing and transformation of scraped data

export interface ParsedBusinessData {
  companyName?: string
  tagline?: string
  mission?: string
  founders?: string
  backstory?: string
  principles?: string
  businessModel?: string
  usp?: string
  industry?: string
  service?: string
  socialMedia?: {
    instagram?: string
    facebook?: string
    youtube?: string
    tiktok?: string
  }
  testimonials?: string[]
  products?: Array<{
    name: string
    price: string
    description: string
  }>
  targetAudience?: string[]
  painPoints?: string[]
  goals?: string[]
  otherInfo?: string
}

export class DataParser {
  static parseScrapedData(scrapedData: any): ParsedBusinessData {
    console.log('🔍 Parsing scraped data:', {
      type: typeof scrapedData,
      isArray: Array.isArray(scrapedData),
      hasText: scrapedData?.text ? 'Yes' : 'No',
      isArrayWithText: Array.isArray(scrapedData) && scrapedData[0]?.text ? 'Yes' : 'No',
      firstChars: JSON.stringify(scrapedData).substring(0, 200) + '...'
    })
    
    const parsed: ParsedBusinessData = {}

    // Handle different response formats
    let textData = ''
    if (Array.isArray(scrapedData) && scrapedData[0]?.text) {
      textData = scrapedData[0].text
      console.log('✅ Found text data in array format')
    } else if (scrapedData?.text) {
      textData = scrapedData.text
      console.log('✅ Found text data in object format')
    } else if (typeof scrapedData === 'string') {
      textData = scrapedData
      console.log('✅ Found text data as string')
    }

    if (!textData) {
      console.log('⚠️ No text data found in scraped response')
      console.log('📊 Available keys:', Object.keys(scrapedData || {}))
      return parsed
    }

    console.log('📊 Text data length:', textData.length)
    console.log('📊 Text data preview:', textData.substring(0, 300) + '...')

    // Parse structured text data
    this.parseStructuredText(textData, parsed)
    
    // Parse JSON-like data if present
    this.parseJSONData(scrapedData, parsed)

    console.log('✅ Parsed data:', parsed)
    return parsed
  }

  private static parseStructuredText(text: string, parsed: ParsedBusinessData): void {
    // Extract business name
    const businessNameMatch = text.match(/Business name:\s*([^\n]+)/i)
    if (businessNameMatch) {
      parsed.companyName = businessNameMatch[1].trim()
    }

    // Extract tagline
    const taglineMatch = text.match(/Business Tagline:\s*([^\n]+)/i)
    if (taglineMatch) {
      parsed.tagline = taglineMatch[1].trim()
    }

    // Extract founders
    const foundersMatch = text.match(/Founders:\s*([^\n]+)/i)
    if (foundersMatch) {
      parsed.founders = foundersMatch[1].trim()
    }

    // Extract mission/why we exist
    const missionMatch = text.match(/Why We Exist:\s*([^\n]+)/i)
    if (missionMatch) {
      parsed.mission = missionMatch[1].trim()
    }

    // Extract principles
    const principlesMatch = text.match(/Principles:\s*([^\n]+)/i)
    if (principlesMatch) {
      parsed.principles = principlesMatch[1].trim()
    }

    // Extract business model
    const businessModelMatch = text.match(/Business Model Type:\s*([^\n]+)/i)
    if (businessModelMatch) {
      parsed.businessModel = businessModelMatch[1].trim()
    }

    // Extract USP
    const uspMatch = text.match(/Unique Selling Proposition[^:]*:\s*([^\n]+)/i)
    if (uspMatch) {
      parsed.usp = uspMatch[1].trim()
    }

    // Extract social media links
    const instagramMatch = text.match(/Instagram:\s*([^\n,]+)/i)
    const youtubeMatch = text.match(/YouTube:\s*([^\n,]+)/i)
    const facebookMatch = text.match(/Facebook:\s*([^\n,]+)/i)
    const tiktokMatch = text.match(/TikTok:\s*([^\n,]+)/i)

    if (instagramMatch || youtubeMatch || facebookMatch || tiktokMatch) {
      parsed.socialMedia = {}
      if (instagramMatch) parsed.socialMedia.instagram = instagramMatch[1].trim()
      if (youtubeMatch) parsed.socialMedia.youtube = youtubeMatch[1].trim()
      if (facebookMatch) parsed.socialMedia.facebook = facebookMatch[1].trim()
      if (tiktokMatch) parsed.socialMedia.tiktok = tiktokMatch[1].trim()
    }

    // Extract testimonials
    const testimonialsSection = text.match(/5\. Testimonials & Case Studies([\s\S]*?)(?=6\.|$)/i)
    if (testimonialsSection) {
      const testimonials = testimonialsSection[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.match(/^(Ecommerce|Financial|Entertainment|Coaches|Brick)/i))
        .filter(line => line.includes('→') || line.includes('$') || line.includes('leads'))
      
      if (testimonials.length > 0) {
        parsed.testimonials = testimonials
      }
    }

    // Extract products/offers
    const offersSection = text.match(/3\. Offers([\s\S]*?)(?=4\.|$)/i)
    if (offersSection) {
      const offers = this.parseOffers(offersSection[1])
      if (offers.length > 0) {
        parsed.products = offers
      }
    }

    // Extract target audience
    const audienceMatch = text.match(/Ideal Customer Profile[^:]*:\s*{([^}]+)}/i)
    if (audienceMatch) {
      parsed.targetAudience = audienceMatch[1]
        .split(',')
        .map(item => item.trim().replace(/^["']|["']$/g, ''))
        .filter(item => item.length > 0)
    }

    // Extract pain points
    const painPointsMatch = text.match(/Primary Pain Points:\s*{([^}]+)}/i)
    if (painPointsMatch) {
      parsed.painPoints = painPointsMatch[1]
        .split(',')
        .map(item => item.trim().replace(/^["']|["']$/g, ''))
        .filter(item => item.length > 0)
    }

    // Extract goals
    const goalsMatch = text.match(/Primary Desires & Goals:\s*{([^}]+)}/i)
    if (goalsMatch) {
      parsed.goals = goalsMatch[1]
        .split(',')
        .map(item => item.trim().replace(/^["']|["']$/g, ''))
        .filter(item => item.length > 0)
    }
  }

  private static parseOffers(offersText: string): Array<{name: string, price: string, description: string}> {
    const offers: Array<{name: string, price: string, description: string}> = []
    
    // Match offer patterns
    const offerMatches = offersText.match(/Offer Name:\s*([^\n]+)\nPrice:\s*([^\n]+)\nDescription:\s*([^\n]+(?:\n(?!Offer Name:)[^\n]+)*)/gi)
    
    if (offerMatches) {
      offerMatches.forEach(match => {
        const nameMatch = match.match(/Offer Name:\s*([^\n]+)/i)
        const priceMatch = match.match(/Price:\s*([^\n]+)/i)
        const descMatch = match.match(/Description:\s*([\s\S]+?)(?=Offer Name:|$)/i)
        
        if (nameMatch && priceMatch) {
          offers.push({
            name: nameMatch[1].trim(),
            price: priceMatch[1].trim(),
            description: descMatch ? descMatch[1].trim() : ''
          })
        }
      })
    }
    
    return offers
  }

  private static parseJSONData(scrapedData: any, parsed: ParsedBusinessData): void {
    // Handle direct JSON properties
    if (scrapedData.companyName) parsed.companyName = scrapedData.companyName
    if (scrapedData.businessName) parsed.companyName = scrapedData.businessName
    if (scrapedData.name) parsed.companyName = scrapedData.name
    if (scrapedData.tagline) parsed.tagline = scrapedData.tagline
    if (scrapedData.description) parsed.tagline = scrapedData.description
    if (scrapedData.mission) parsed.mission = scrapedData.mission
    if (scrapedData.missionStatement) parsed.mission = scrapedData.missionStatement
    if (scrapedData.founders) parsed.founders = scrapedData.founders
    if (scrapedData.founder) parsed.founders = scrapedData.founder
    if (scrapedData.backstory) parsed.backstory = scrapedData.backstory
    if (scrapedData.story) parsed.backstory = scrapedData.story
    if (scrapedData.principles) parsed.principles = scrapedData.principles
    if (scrapedData.values) parsed.principles = scrapedData.values
    if (scrapedData.businessModel) parsed.businessModel = scrapedData.businessModel
    if (scrapedData.usp) parsed.usp = scrapedData.usp
    if (scrapedData.uniqueSellingProposition) parsed.usp = scrapedData.uniqueSellingProposition
    if (scrapedData.industry) parsed.industry = scrapedData.industry
    if (scrapedData.service) parsed.service = scrapedData.service
    if (scrapedData.product) parsed.service = scrapedData.product
    if (scrapedData.services) parsed.service = scrapedData.services
    if (scrapedData.socialMedia) parsed.socialMedia = scrapedData.socialMedia
    if (scrapedData.testimonials) parsed.testimonials = scrapedData.testimonials
    if (scrapedData.products) parsed.products = scrapedData.products
    if (scrapedData.targetAudience) parsed.targetAudience = scrapedData.targetAudience
    if (scrapedData.audience) parsed.targetAudience = scrapedData.audience
    if (scrapedData.painPoints) parsed.painPoints = scrapedData.painPoints
    if (scrapedData.goals) parsed.goals = scrapedData.goals
    if (scrapedData.about) parsed.otherInfo = scrapedData.about
    if (scrapedData.overview) parsed.otherInfo = scrapedData.overview
    if (scrapedData.content) parsed.otherInfo = scrapedData.content
  }
}
