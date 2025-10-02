// Core CopyForge platform types

// Knowledge Base - Per User (FR-3.1) - Comprehensive Brand Information
// Wrapped under body object as per new JSON structure requirements
export interface KnowledgeBaseResponse {
  body: {
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
    
    // Target Audience
    targetAudience: {
      idealCustomerProfile: {
        description: string[]
      }
      primaryPainPoints: string[]
      primaryDesiresGoals: string[]
      commonObjections: string[]
      audienceVocabulary: string[]
    }
    
    // Offers
    offers: {
      name: string
      price: string
      description: string
    }[]
    
    // Client Assets
    clientAssets: {
      socialMediaProfiles: {
        instagram: string
        youtube: string
        facebook: string
        tiktok: string
      }
      testimonialsCaseStudies: string[]
    }
  }
}

// Legacy KnowledgeBase interface for backward compatibility
export interface KnowledgeBase {
  id: string
  userId: string
  createdAt: Date
  updatedAt: Date
  version: number
  
  // Brand Identity
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
  
  // Target Audience
  targetAudience: {
    idealCustomerProfile: {
      description: string[]
    }
    primaryPainPoints: string[]
    primaryDesiresGoals: string[]
    commonObjections: string[]
    audienceVocabulary: string[]
  }
  
  // Offers
  offers: {
    name: string
    price: string
    description: string
  }[]
  
  // Client Assets
  clientAssets: {
    socialMediaProfiles: {
      instagram: string
      youtube: string
      facebook: string
      tiktok: string
    }
    testimonialsCaseStudies: string[]
  }
  
  // Other Information
  otherInformation?: string
  
  // Legacy fields for backward compatibility
  companyName?: string
  service?: string
  industry?: string
  niche?: string
}

// Media Library (FR-3.2)
export interface MediaItem {
  id: string
  userId: string
  filename: string
  type: 'pdf' | 'doc' | 'txt' | 'audio' | 'video' | 'url' | 'transcript' | 'image'
  size?: number
  uploadedAt: Date
  content?: string
  transcript?: string
  tags: string[]
  url?: string // for web links
  metadata?: Record<string, any>
}

// Admin-Managed Agents (FR-3.3)
export interface Agent {
  id: string
  name: string
  description: string
  prompt: string
  isGlobal: boolean
  tenantId?: string
  version: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string // admin user ID
}

// Chat & Conversation History (FR-3.4)
export interface Conversation {
  id: string
  userId: string
  agentId: string
  title: string
  messages: ChatMessage[]
  pinnedMessages: string[] // message IDs
  knowledgeBaseSnapshot: KnowledgeBase
  attachedMedia: string[] // MediaItem IDs
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  conversationId: string
  content: string
  type: 'user' | 'ai' | 'system'
  timestamp: Date
  citations?: Citation[]
  metadata?: {
    generatedCopy?: GeneratedCopy
    templateVariables?: Record<string, string>
    outputPreset?: OutputPreset
  }
}

// Output Presets (FR-3.4.3)
export type OutputPreset = 'facebook' | 'google' | 'linkedin' | 'x' | 'email-subject' | 'custom'

export interface GeneratedCopy {
  id: string
  content: string
  preset: OutputPreset
  templateVariables: Record<string, string>
  createdAt: Date
  conversationId: string
  isSaved: boolean
}

// Template Variables (FR-3.4.2)
export interface TemplateVariable {
  name: string
  type: 'text' | 'date' | 'number' | 'select'
  required: boolean
  placeholder?: string
  options?: string[] // for select type
}

// Research & Scraping (FR-3.5)
export interface ScrapedContent {
  id: string
  url: string
  content: string
  title?: string
  scrapedAt: Date
  userId: string
  isDeduplicated: boolean
  sourcesCited: string[]
}

// Transcription (FR-3.6)
export interface Transcription {
  id: string
  mediaItemId: string
  content: string
  segments: TranscriptionSegment[]
  language: string
  confidence: number
  createdAt: Date
}

export interface TranscriptionSegment {
  start: number // seconds
  end: number // seconds
  text: string
  confidence: number
}

// Brand Customization (FR-3.7)
export interface BrandSettings {
  id: string
  tenantId: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  logo?: string
  wordmark?: string
  voiceTone: {
    style: string
    guidelines: string[]
  }
  createdAt: Date
  updatedAt: Date
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  actionUrl?: string
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    copyUpdates: boolean
    systemAlerts: boolean
  }
  defaultOutputPreset: OutputPreset
  autoSave: boolean
}

// Component prop types
export interface SidebarProps {
  activeItem?: string
  onItemSelect?: (item: string) => void
}

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void
  acceptedTypes?: string[]
  maxSize?: number
  multiple?: boolean
}

// Citation type for references
export interface Citation {
  id: string
  source: string
  title?: string
  url?: string
  page?: number
  quote?: string
}