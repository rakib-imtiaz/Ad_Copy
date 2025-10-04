// Modular Knowledge Base Parser
// This utility extracts structured data from knowledge base content

export interface ParsedKnowledgeBaseData {
  brandIdentity: {
    businessNameTagline: { 
      name: string
      tagline: string
    }
    founderNameBackstory: { 
      founders: string
      backstory: string
    }
    missionStatement: { 
      whyWeExist: string
      principles: string
    }
    businessModelType: string
    uniqueSellingProposition: string
    tonePersonality: { 
      style: string[]
    }
  }
  targetAudience: {
    idealCustomerProfile: { 
      description: string[]
    }
    primaryPainPoints: string[]
    primaryDesiresGoals: string[]
    commonObjections: string[]
    audienceVocabulary: string[]
  }
  offers: Array<{
    name: string
    price: string
    description: string
  }>
  clientAssets: {
    socialMediaProfiles: { 
      instagram: string
      youtube: string
      facebook: string
      tiktok: string
    }
    testimonialsCaseStudies: string[]
  }
  otherInformation: string
}

const DEFAULT_DATA: ParsedKnowledgeBaseData = {
  brandIdentity: {
    businessNameTagline: { name: "", tagline: "" },
    founderNameBackstory: { founders: "", backstory: "" },
    missionStatement: { whyWeExist: "", principles: "" },
    businessModelType: "",
    uniqueSellingProposition: "",
    tonePersonality: { style: [""] }
  },
  targetAudience: {
    idealCustomerProfile: { description: [""] },
    primaryPainPoints: [""],
    primaryDesiresGoals: [""],
    commonObjections: [""],
    audienceVocabulary: [""]
  },
  offers: [{ name: "", price: "", description: "" }],
  clientAssets: {
    socialMediaProfiles: { instagram: "", youtube: "", facebook: "", tiktok: "" },
    testimonialsCaseStudies: [""]
  },
  otherInformation: ""
}

export class KnowledgeBaseParser {
  /**
   * Parse raw knowledge base content into structured data
   */
  static parseContent(content: string): ParsedKnowledgeBaseData {
    const data = { ...DEFAULT_DATA }

    try {
      // Extract business information
      KnowledgeBaseParser.extractBusinessInfo(content, data)
      
      // Extract founder and mission information
      KnowledgeBaseParser.extractFounderInfo(content, data)
      
      // Extract target audience information
      KnowledgeBaseParser.extractTargetAudienceInfo(content, data)
      
      // Extract offers information
      KnowledgeBaseParser.extractOffersInfo(content, data)
      
      // Extract client assets
      KnowledgeBaseParser.extractClientAssets(content, data)
      
      // Extract additional information
      KnowledgeBaseParser.extractOtherInfo(content, data)
      
    } catch (error) {
      console.error('Error parsing knowledge base content:', error)
    }

    return data
  }

  private static extractBusinessInfo(content: string, data: ParsedKnowledgeBaseData): void {
    // Extract business name
    const businessNameMatch = content.match(/Business name:\s*(.+?)(?:\n|$)/i)
    if (businessNameMatch) {
      data.brandIdentity.businessNameTagline.name = businessNameMatch[1].trim()
    }

    // Extract tagline
    const taglineMatch = content.match(/Business Tagline:\s*(.+?)(?:\n|$)/i)
    if (taglineMatch) {
      data.brandIdentity.businessNameTagline.tagline = taglineMatch[1].trim()
    }

    // Extract Business Model Type
    const businessModelMatch = content.match(/Business Model Type:\s*(.+?)(?:\n|$)/i)
    if (businessModelMatch) {
      data.brandIdentity.businessModelType = businessModelMatch[1].trim()
    }

    // Extract USP - simplified without multiline regex
    const uspRegex = /Unique Selling Proposition[^:]+:\s*(.+?)(?:\n.*:|$)/
    const uspMatch = content.match(uspRegex)
    if (uspMatch) {
      data.brandIdentity.uniqueSellingProposition = uspMatch[1].trim()
    }

    // Extract Tone & Personality
    const toneRegex = /Tone & Personality:\s*(.+?)(?:\n.*:|$)/
    const toneMatch = content.match(toneRegex)
    if (toneMatch) {
      const toneText = toneMatch[1].trim()
      data.brandIdentity.tonePersonality.style = toneText.split(/[,;]/)
        .map(s => s.trim())
        .filter(s => s)
    }
  }

  private static extractFounderInfo(content: string, data: ParsedKnowledgeBaseData): void {
    // Extract founders
    const foundersMatch = content.match(/Founders:\s*(.+?)(?:\n|$)/i)
    if (foundersMatch) {
      data.brandIdentity.founderNameBackstory.founders = foundersMatch[1].trim()
    }

    // Extract backstory - simplified
    const backstoryRegex = /Backstory:\s*(.+?)(?:\n.*:|$)/
    const backstoryMatch = content.match(backstoryRegex)
    if (backstoryMatch) {
      data.brandIdentity.founderNameBackstory.backstory = backstoryMatch[1].trim()
    }

    // Extract Why We Exist
    const whyWeExistRegex = /Why We Exist:\s*(.+?)(?:\n.*:|$)/
    const whyWeExistMatch = content.match(whyWeExistRegex)
    if (whyWeExistMatch) {
      data.brandIdentity.missionStatement.whyWeExist = whyWeExistMatch[1].trim()
    }

    // Extract Principles
    const principlesRegex = /Principles:\s*(.+?)(?:\n.*:|$)/
    const principlesMatch = content.match(principlesRegex)
    if (principlesMatch) {
      data.brandIdentity.missionStatement.principles = principlesMatch[1].trim()
    }
  }

  private static extractTargetAudienceInfo(content: string, data: ParsedKnowledgeBaseData): void {
    // Extract Ideal Customer Profile
    const customerProfileRegex = /Ideal Customer Profile[^:]+:\s*(.+?)(?:\n.*:|$)/
    const customerProfileMatch = content.match(customerProfileRegex)
    if (customerProfileMatch) {
      const profileText = customerProfileMatch[1].trim()
      data.targetAudience.idealCustomerProfile.description = [profileText]
    }

    // Extract Pain Points
    const painPointsRegex = /Primary Pain Points:\s*(.+?)(?:\n.*:|$)/
    const painPointsMatch = content.match(painPointsRegex)
    if (painPointsMatch) {
      const painText = painPointsMatch[1].trim()
      data.targetAudience.primaryPainPoints = painText.split(',').map(p => p.trim()).filter(p => p)
    }

    // Extract Desires & Goals
    const desiresRegex = /Primary Desires[^:]+Goals:\s*(.+?)(?:\n.*:|$)/
    const desiresMatch = content.match(desiresRegex)
    if (desiresMatch) {
      const desiresText = desiresMatch[1].trim()
      data.targetAudience.primaryDesiresGoals = desiresText.split(',').map(d => d.trim()).filter(d => d)
    }

    // Extract Vocabulary
    const vocabularyRegex = /Audience Vocabulary:\s*(.+?)(?:\n.*:|$)/
    const vocabularyMatch = content.match(vocabularyRegex)
    if (vocabularyMatch) {
      const vocabText = vocabularyMatch[1].trim()
      data.targetAudience.audienceVocabulary = vocabText.split(',').map(v => v.trim()).filter(v => v)
    }

    // Extract Common Objections
    const objectionsRegex = /Common Objections:\s*(.+?)(?:\n.*:|$)/
    const objectionsMatch = content.match(objectionsRegex)
    if (objectionsMatch) {
      const objectionsText = objectionsMatch[1].trim()
      data.targetAudience.commonObjections = objectionsText.split(',').map(o => o.trim()).filter(o => o)
    }
  }

  private static extractOffersInfo(content: string, data: ParsedKnowledgeBaseData): void {
    // Extract Offers section - simplified without multiline
    const offerSectionRegex = /3\. Offers(.+?)(?:\n4\. Client Assets|$)/
    const offerSectionMatch = content.match(offerSectionRegex)
    if (offerSectionMatch) {
      const offersText = offerSectionMatch[1]
      // Split by offers to find individual offers
      const offerStrings = offersText.split(/Offer Name:/).filter(s => s.trim())
      
      if (offerStrings.length > 0) {
        data.offers = offerStrings.slice(1).map(offerText => {
          const lines = offerText.split('\n').map(l => l.trim()).filter(l => l)
          return {
            name: lines[0]?.trim() || '',
            price: lines[1]?.replace(/Price:\s*/, '') || '',
            description: lines.slice(2).join('\n') || ''
          }
        })
      }
    }
  }

  private static extractClientAssets(content: string, data: ParsedKnowledgeBaseData): void {
    // Extract Instagram
    const instagramMatch = content.match(/Instagram:\s*(.+?)(?:\n|$)/i)
    if (instagramMatch) {
      data.clientAssets.socialMediaProfiles.instagram = instagramMatch[1].trim()
    }

    // Extract YouTube
    const youtubeMatch = content.match(/YouTube:\s*(.+?)(?:\n|$)/i)
    if (youtubeMatch) {
      data.clientAssets.socialMediaProfiles.youtube = youtubeMatch[1].trim()
    }

    // Extract Facebook
    const facebookMatch = content.match(/Facebook:\s*(.+?)(?:\n|$)/i)
    if (facebookMatch) {
      data.clientAssets.socialMediaProfiles.facebook = facebookMatch[1].trim()
    }

    // Extract TikTok
    const tiktokMatch = content.match(/TikTok:\s*(.+?)(?:\n|$)/i)
    if (tiktokMatch) {
      data.clientAssets.socialMediaProfiles.tiktok = tiktokMatch[1].trim()
    }

    // Extract Testimonials - simplified
    const testimonialsRegex = /5\. Testimonials[^:]+:\s*(.+?)(?:\n6\. Additional Information|$)/
    const testimonialsSection = content.match(testimonialsRegex)
    if (testimonialsSection) {
      const testimonialsText = testimonialsSection[1].trim()
      data.clientAssets.testimonialsCaseStudies = testimonialsText.split('\n')
        .filter(t => t.trim())
        .map(t => t.trim())
    }
  }

  private static extractOtherInfo(content: string, data: ParsedKnowledgeBaseData): void {
    // Extract Other Information - simplified
    const otherInfoRegex = /6\. Additional Information:\s*(.+?)$/
    const otherInfoMatch = content.match(otherInfoRegex)
    if (otherInfoMatch) {
      data.otherInformation = otherInfoMatch[1].trim()
    }
  }
}