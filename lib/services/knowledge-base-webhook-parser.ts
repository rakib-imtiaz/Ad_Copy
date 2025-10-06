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
    primaryPainPoints: string[]
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
   * Parse webhook response data into form-compatible format
   */
  static parseWebhookData(webhookData: any): ParsedKnowledgeBaseData {
    console.log('🔍 Parsing webhook data:', webhookData)
    
    const parsedData: ParsedKnowledgeBaseData = {
      brandIdentity: {
        businessNameTagline: { 
          name: webhookData.business_name || "", 
          tagline: webhookData.business_tagline || "" 
        },
        founderNameBackstory: { 
          founders: webhookData.founder_name || "", 
          backstory: webhookData.founder_backstory || "" 
        },
        missionStatement: { 
          whyWeExist: webhookData.mission_statement_why || "", 
          principles: webhookData.mission_statement_principles || "" 
        },
        businessModelType: webhookData.business_model_type || "",
        uniqueSellingProposition: webhookData.unique_selling_proposition || "",
        tonePersonality: { 
          style: webhookData.tone_personality_style ? 
            webhookData.tone_personality_style.split(',').map((s: string) => s.trim()) : [] 
        }
      },
      targetAudience: {
        idealCustomerProfile: { 
          description: webhookData.ideal_customer_description ? 
            [webhookData.ideal_customer_description] : [] 
        },
        primaryPainPoints: webhookData.primary_pain_points ? 
          webhookData.primary_pain_points.split(',').map((p: string) => p.trim()) : [],
        primaryDesiresGoals: webhookData.primary_desires_goals ? 
          webhookData.primary_desires_goals.split(',').map((g: string) => g.trim()) : [],
        commonObjections: webhookData.common_objections ? 
          webhookData.common_objections.split(',').map((o: string) => o.trim()) : [],
        audienceVocabulary: webhookData.audience_vocabulary ? 
          webhookData.audience_vocabulary.split(',').map((v: string) => v.trim()) : []
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
      otherInformation: webhookData.extra_info || ""
    }
    
    console.log('✅ Parsed knowledge base data:', parsedData)
    return parsedData
  }

  /**
   * Parse offers from webhook data
   */
  private static parseOffers(offersData: string): Array<{ name: string; price: string; description: string }> {
    if (!offersData) return []
    
    // For now, create a single offer from the offers text
    return [{
      name: "Coaching Services",
      price: "Contact for pricing",
      description: offersData
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
    
    // Split by common testimonial separators and clean up
    const testimonials = testimonialsData
      .split(/;\s*(?=[A-Z])/) // Split by semicolon followed by capital letter
      .map(t => t.trim())
      .filter(t => t.length > 20) // Only keep substantial testimonials
    
    return testimonials
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
