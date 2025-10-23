// Knowledge Base Webhook Parser Service
// Handles parsing data from the get-knowledge-base-in-field webhook

export interface ParsedKnowledgeBaseData {
  brandIdentity: {
    businessNameTagline: { name: string; tagline: string }
    founderNameBackstory: { founders: string; backstory: string }
    missionStatement: { whyWeExist: string; principles: string }
    businessModelType: string
    uniqueSellingProposition: string
    tonePersonality: { style: string[] }
  }
  targetAudience: {
    idealCustomerProfile: { description: string[] }
    primaryPainPoints: string
    primaryDesiresGoals: string[]
    commonObjections: string[]
    audienceVocabulary: string[]
  }
  offers: Array<{ name: string; price: string; description: string }>
  clientAssets: {
    socialMediaProfiles: { instagram: string; youtube: string; facebook: string; tiktok: string }
    testimonialsCaseStudies: string[]
  }
  productName: string
  productPrice: string
  productDescription: string
  socialInstagram: string
  socialLinkedIn: string
  testimonial: string
  otherInformation: string
}

export class KnowledgeBaseWebhookParser {
  /**
   * Clean and parse string data that might contain JSON
   */
  private static cleanStringData(data: any): string {
    if (typeof data !== 'string') return data || ''
    
    // If the string looks like JSON, try to parse it
    if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(data)
        // If it's an object, extract meaningful text
        if (typeof parsed === 'object') {
          // Try to find text content in common fields
          const textFields = ['text', 'content', 'description', 'message', 'value']
          for (const field of textFields) {
            if (parsed[field] && typeof parsed[field] === 'string') {
              return parsed[field]
            }
          }
          // If no text field found, stringify and clean
          return JSON.stringify(parsed).replace(/[{}[\]"]/g, '').trim()
        }
        return parsed
      } catch {
        // If parsing fails, return the original string
        return data
      }
    }
    
    return data
  }

  /**
   * Parse webhook response data into form-compatible format
   */
  static parseWebhookData(webhookData: any): ParsedKnowledgeBaseData {
    console.log('🔍 Parsing webhook data:', webhookData)
    
    const parsedData: ParsedKnowledgeBaseData = {
      brandIdentity: {
        businessNameTagline: { 
          name: this.cleanStringData(webhookData.business_name), 
          tagline: this.cleanStringData(webhookData.business_tagline) 
        },
        founderNameBackstory: { 
          founders: this.cleanStringData(webhookData.founder_name), 
          backstory: this.cleanStringData(webhookData.founder_backstory) 
        },
        missionStatement: { 
          whyWeExist: this.cleanStringData(webhookData.mission_statement_why), 
          principles: this.cleanStringData(webhookData.mission_statement_principles) 
        },
        businessModelType: this.cleanStringData(webhookData.business_model_type),
        uniqueSellingProposition: this.cleanStringData(webhookData.unique_selling_proposition),
        tonePersonality: { 
          style: webhookData.tone_personality_style ? 
            webhookData.tone_personality_style.split(',').map((s: string) => s.trim()) : [] 
        }
      },
      targetAudience: {
        idealCustomerProfile: { 
          description: webhookData.ideal_customer_description ? 
            [this.cleanStringData(webhookData.ideal_customer_description)] : [] 
        },
        primaryPainPoints: webhookData.primary_pain_points ? 
          this.cleanStringData(webhookData.primary_pain_points) : "",
        primaryDesiresGoals: webhookData.primary_desires_goals ? 
          [this.cleanStringData(webhookData.primary_desires_goals)] : [],
        commonObjections: webhookData.common_objections ? 
          [this.cleanStringData(webhookData.common_objections)] : [],
        audienceVocabulary: webhookData.audience_vocabulary ? 
          [this.cleanStringData(webhookData.audience_vocabulary)] : []
      },
      offers: this.parseOffers(webhookData.offers),
      clientAssets: {
        socialMediaProfiles: this.parseSocialMediaProfiles(webhookData.social_media_profiles),
        testimonialsCaseStudies: this.parseTestimonials(webhookData.testimonials_case_studies)
      },
      productName: "",
      productPrice: "",
      productDescription: webhookData.offers || "",
      socialInstagram: this.extractSocialLink(webhookData.social_media_profiles, 'instagram'),
      socialLinkedIn: "",
      testimonial: this.extractFirstTestimonial(webhookData.testimonials_case_studies),
      otherInformation: this.cleanStringData(webhookData.extra_info)
    }
    
    console.log('✅ Parsed knowledge base data:', parsedData)
    return parsedData
  }

  /**
   * Parse offers from webhook data
   */
  private static parseOffers(offersData: string): Array<{ name: string; price: string; description: string }> {
    if (!offersData) return []
    
    // Parse the offers text format: "Offer Name: ...\nPrice: ...\nDescription: ..."
    const offerNameMatch = offersData.match(/Offer Name:\s*(.+?)(?:\n|$)/i)
    const priceMatch = offersData.match(/Price:\s*(.+?)(?:\n|$)/i)
    const descriptionMatch = offersData.match(/Description:\s*(.+?)$/i)
    
    return [{
      name: offerNameMatch?.[1]?.trim() || '',
      price: priceMatch?.[1]?.trim() || '',
      description: descriptionMatch?.[1]?.trim() || ''
    }]
  }

  /**
   * Parse social media profiles from webhook data
   */
  private static parseSocialMediaProfiles(socialData: string): { instagram: string; youtube: string; facebook: string; tiktok: string } {
    const profiles = { instagram: "", youtube: "", facebook: "", tiktok: "" }
    
    if (!socialData) return profiles
    
    // Extract Instagram
    const instagramMatch = socialData.match(/Instagram:\s*([^\s,]+)/i)
    if (instagramMatch) profiles.instagram = instagramMatch[1]
    
    // Extract YouTube
    const youtubeMatch = socialData.match(/YouTube:\s*([^\s,]+)/i)
    if (youtubeMatch) profiles.youtube = youtubeMatch[1]
    
    // Extract Facebook
    const facebookMatch = socialData.match(/Facebook:\s*([^\s,]+)/i)
    if (facebookMatch) profiles.facebook = facebookMatch[1]
    
    // Extract TikTok
    const tiktokMatch = socialData.match(/TikTok:\s*([^\s,]+)/i)
    if (tiktokMatch) profiles.tiktok = tiktokMatch[1]
    
    return profiles
  }

  /**
   * Parse testimonials from webhook data
   */
  private static parseTestimonials(testimonialsData: string): string[] {
    if (!testimonialsData) return []
    
    // Return the raw string as a single testimonial entry
    // This preserves the comma-separated format as requested
    return [testimonialsData.trim()]
  }

  /**
   * Extract specific social media link
   */
  private static extractSocialLink(socialData: string, platform: string): string {
    if (!socialData) return ""
    
    const platformMatch = socialData.match(new RegExp(`${platform}:\\s*([^\\s,]+)`, 'i'))
    return platformMatch ? platformMatch[1] : ""
  }

  /**
   * Extract first testimonial for quick access
   */
  private static extractFirstTestimonial(testimonialsData: string): string {
    if (!testimonialsData) return ""
    
    const testimonials = this.parseTestimonials(testimonialsData)
    return testimonials.length > 0 ? testimonials[0] : ""
  }
}
