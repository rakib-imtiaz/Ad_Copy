"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { authService } from "@/lib/auth-service"
import { toast } from "sonner"
import { SuccessModal } from "@/components/ui/success-modal"
import { API_ENDPOINTS } from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Check, Save, Plus, Trash2, ArrowLeft } from "lucide-react"
import { URLScrapingSection } from "@/components/url-scraping-section"
import { PopulateDataButton } from "@/components/populate-data-button"
import { KnowledgeBaseSidebarNav } from "@/components/knowledge-base-sidebar-nav"
import { BrandVoiceLinkExtractor } from "@/components/brand-voice-link-extractor"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import { ParsedKnowledgeBaseData } from "@/lib/services/knowledge-base-webhook-parser"

interface BrandFormData {
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
    primaryPainPoints: string
    primaryDesiresGoals: string[]
    commonObjections: string[]
    audienceVocabulary: string[]
  }
  offers: {
    name: string
    price: string
    description: string
  }[]
  clientAssets: {
    socialMediaProfiles: {
      instagram: string
      youtube: string
      facebook: string
      tiktok: string
    }
    testimonialsCaseStudies: string[]
  }
  // Additional fields used in the form
  productName: string
  productPrice: string
  productDescription: string
  socialInstagram: string
  socialLinkedIn: string
  testimonial: string
  otherInformation: string
}

const defaultFormData: BrandFormData = {
  brandIdentity: {
    businessNameTagline: {
      name: "",
      tagline: ""
    },
    founderNameBackstory: {
      founders: "",
      backstory: ""
    },
    missionStatement: {
      whyWeExist: "",
      principles: ""
    },
    businessModelType: "",
    uniqueSellingProposition: "",
      tonePersonality: {
        style: [""]
      }
  },
  targetAudience: {
    idealCustomerProfile: {
      description: [""]
    },
    primaryPainPoints: "",
    primaryDesiresGoals: [""],
    commonObjections: [""],
    audienceVocabulary: [""]
  },
  offers: [
    {
      name: "",
      price: "",
      description: ""
    }
  ],
  clientAssets: {
    socialMediaProfiles: {
      instagram: "",
      youtube: "",
      facebook: "",
      tiktok: ""
    },
    testimonialsCaseStudies: [""]
  },
  // Additional fields
  productName: "",
  productPrice: "",
  productDescription: "",
  socialInstagram: "",
  socialLinkedIn: "",
  testimonial: "",
  otherInformation: ""
}

// Transform parsed webhook data to form data format
const transformParsedDataToFormData = (parsedData: ParsedKnowledgeBaseData): BrandFormData => {
  return {
    brandIdentity: {
      businessNameTagline: {
        name: parsedData.brandIdentity.businessNameTagline.name,
        tagline: parsedData.brandIdentity.businessNameTagline.tagline
      },
      founderNameBackstory: {
        founders: parsedData.brandIdentity.founderNameBackstory.founders,
        backstory: parsedData.brandIdentity.founderNameBackstory.backstory
      },
      missionStatement: {
        whyWeExist: parsedData.brandIdentity.missionStatement.whyWeExist,
        principles: parsedData.brandIdentity.missionStatement.principles
      },
      businessModelType: parsedData.brandIdentity.businessModelType,
      uniqueSellingProposition: parsedData.brandIdentity.uniqueSellingProposition,
      tonePersonality: {
        style: parsedData.brandIdentity.tonePersonality.style
      }
    },
    targetAudience: {
      idealCustomerProfile: {
        description: parsedData.targetAudience.idealCustomerProfile.description
      },
      primaryPainPoints: parsedData.targetAudience.primaryPainPoints,
      primaryDesiresGoals: parsedData.targetAudience.primaryDesiresGoals,
      commonObjections: parsedData.targetAudience.commonObjections,
      audienceVocabulary: parsedData.targetAudience.audienceVocabulary
    },
    offers: parsedData.offers,
    clientAssets: {
      socialMediaProfiles: parsedData.clientAssets.socialMediaProfiles,
      testimonialsCaseStudies: parsedData.clientAssets.testimonialsCaseStudies
    },
    productName: parsedData.productName,
    productPrice: parsedData.productPrice,
    productDescription: parsedData.productDescription,
    socialInstagram: parsedData.socialInstagram,
    socialLinkedIn: parsedData.socialLinkedIn,
    testimonial: parsedData.testimonial,
    otherInformation: parsedData.otherInformation
  }
}

interface BrandFormProps {
  onSuccess?: () => void
}

export function BrandFormClean({ onSuccess }: BrandFormProps) {
  const [formData, setFormData] = React.useState<BrandFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(1)
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([])
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)
  const [showAutoFill, setShowAutoFill] = React.useState(false)
  const [testimonialCarouselApi, setTestimonialCarouselApi] = React.useState<any>()
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = React.useState(0)
  
  // Carousel state for other sections
  const [audienceCarouselApi, setAudienceCarouselApi] = React.useState<any>()
  const [currentAudienceIndex, setCurrentAudienceIndex] = React.useState(0)
  
  // Pain points now a single textarea; carousel state removed
  
  const [customerGoalsCarouselApi, setCustomerGoalsCarouselApi] = React.useState<any>()
  const [currentCustomerGoalsIndex, setCurrentCustomerGoalsIndex] = React.useState(0)
  
  const [productsCarouselApi, setProductsCarouselApi] = React.useState<any>()
  const [currentProductsIndex, setCurrentProductsIndex] = React.useState(0)
  
  const [audienceVocabularyCarouselApi, setAudienceVocabularyCarouselApi] = React.useState<any>()
  const [currentAudienceVocabularyIndex, setCurrentAudienceVocabularyIndex] = React.useState(0)
  
  const [commonObjectionsCarouselApi, setCommonObjectionsCarouselApi] = React.useState<any>()
  const [currentCommonObjectionsIndex, setCurrentCommonObjectionsIndex] = React.useState(0)
  
  // Brand Voice extraction state - persists across step changes
  const [isBrandVoiceExtracting, setIsBrandVoiceExtracting] = React.useState(false)
  const [brandVoiceExtractionError, setBrandVoiceExtractionError] = React.useState<string | null>(null)
  
  // Check for pending knowledge base data on component mount and periodically
  React.useEffect(() => {
    const checkForPendingData = () => {
      const pendingData = (window as any).pendingKnowledgeBaseData
      const timestamp = (window as any).pendingKnowledgeBaseDataTimestamp
      
      if (pendingData) {
        console.log('🔄 Found pending knowledge base data, populating form...')
        console.log('📊 Data timestamp:', timestamp)
        console.log('📊 Testimonials in data:', pendingData.clientAssets?.testimonialsCaseStudies)
        
        const transformedData = transformParsedDataToFormData(pendingData)
        setFormData(transformedData)
        
        // Clear the pending data
        delete (window as any).pendingKnowledgeBaseData
        delete (window as any).pendingKnowledgeBaseDataTimestamp
        
        console.log('✅ Form populated with knowledge base data')
        return true // Data found and processed
      }
      return false // No data found
    }

    // Check immediately on mount
    if (checkForPendingData()) {
      return // Data was found and processed
    }

    // If no data found, set up polling to check periodically
    const pollInterval = setInterval(() => {
      if (checkForPendingData()) {
        clearInterval(pollInterval) // Stop polling once data is found
      }
    }, 500) // Check every 500ms

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval)
  }, [])
  
  React.useEffect(() => {
    if (!testimonialCarouselApi) return

    setCurrentTestimonialIndex(testimonialCarouselApi.selectedScrollSnap())

    testimonialCarouselApi.on("select", () => {
      setCurrentTestimonialIndex(testimonialCarouselApi.selectedScrollSnap())
    })
  }, [testimonialCarouselApi])

  // Audience carousel effect
  React.useEffect(() => {
    if (!audienceCarouselApi) return

    setCurrentAudienceIndex(audienceCarouselApi.selectedScrollSnap())

    audienceCarouselApi.on("select", () => {
      setCurrentAudienceIndex(audienceCarouselApi.selectedScrollSnap())
    })
  }, [audienceCarouselApi])

  // Pain Points carousel effect
  // Pain points carousel effect removed

  // Customer Goals carousel effect
  React.useEffect(() => {
    if (!customerGoalsCarouselApi) return

    setCurrentCustomerGoalsIndex(customerGoalsCarouselApi.selectedScrollSnap())

    customerGoalsCarouselApi.on("select", () => {
      setCurrentCustomerGoalsIndex(customerGoalsCarouselApi.selectedScrollSnap())
    })
  }, [customerGoalsCarouselApi])

  // Products carousel effect
  React.useEffect(() => {
    if (!productsCarouselApi) return

    setCurrentProductsIndex(productsCarouselApi.selectedScrollSnap())

    productsCarouselApi.on("select", () => {
      setCurrentProductsIndex(productsCarouselApi.selectedScrollSnap())
    })
  }, [productsCarouselApi])

  // Audience Vocabulary carousel effect
  React.useEffect(() => {
    if (!audienceVocabularyCarouselApi) return

    setCurrentAudienceVocabularyIndex(audienceVocabularyCarouselApi.selectedScrollSnap())

    audienceVocabularyCarouselApi.on("select", () => {
      setCurrentAudienceVocabularyIndex(audienceVocabularyCarouselApi.selectedScrollSnap())
    })
  }, [audienceVocabularyCarouselApi])

  // Common Objections carousel effect
  React.useEffect(() => {
    if (!commonObjectionsCarouselApi) return

    setCurrentCommonObjectionsIndex(commonObjectionsCarouselApi.selectedScrollSnap())

    commonObjectionsCarouselApi.on("select", () => {
      setCurrentCommonObjectionsIndex(commonObjectionsCarouselApi.selectedScrollSnap())
    })
  }, [commonObjectionsCarouselApi])

  const totalSteps = 12

  // Function to populate form with structured data
  const populateFormWithData = React.useCallback((data: BrandFormData) => {
    setFormData(data)
    
    // Show success message
    showToastMessage("Knowledge base data loaded successfully! You can now edit each step.", 'success')
    
    // Navigate to first step to show the data
    setCurrentStep(1)
    
    console.log('✅ Form populated with knowledge base data:', data)
  }, [])

  // Global reference for form population - accessible from parent
  React.useEffect(() => {
    (window as any).brandFormPopulation = {
      populateFormWithData
    }
    return () => {
      delete (window as any).brandFormPopulation
    }
  }, [populateFormWithData])

  // Show toast helper
  const showToastMessage = (message: string, type: 'success' | 'error' | 'info') => {
    if (type === 'success') {
      toast.success(message)
    } else if (type === 'error') {
      toast.error(message)
    } else {
      toast(message)
    }
  }

  // Simple data handler for URL scraping
  const handleDataScraped = (data: any) => {
    console.log('📊 Scraped data received:', data)
    // The URLScrapingSection component handles the auto-filling internally
  }

  // Load saved progress on component mount
  React.useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        const accessToken = authService.getAuthToken()
        if (!accessToken) {
          setIsLoading(false)
          return
        }

        const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.GET_KNOWLEDGE_BASE_IN_FIELD, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data?.content) {
            try {
              const content = JSON.parse(result.data.content)
              const bodyContent = content.body || content
              
              // Check if this is a draft with progress metadata
              if (bodyContent._progress && bodyContent._progress.isDraft) {
                const progress = bodyContent._progress
                setCurrentStep(progress.currentStep || 1)
                setCompletedSteps(progress.completedSteps || [])
                
                // Transform the data back to form format
                const transformedData = transformFromWebhookFormat(bodyContent)
                setFormData(transformedData)
                
                showToastMessage("Previous progress loaded successfully!", 'info')
              } else {
                // Load regular knowledge base data
                const transformedData = transformFromWebhookFormat(bodyContent)
                setFormData(transformedData)
              }
            } catch (parseError) {
              console.log('Could not parse saved data:', parseError)
            }
          }
        }
      } catch (error) {
        console.log('Error loading saved progress:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSavedProgress()
  }, [])

  // Transform webhook format back to form format
  const transformFromWebhookFormat = (data: any): BrandFormData => {
    const transformed: BrandFormData = { ...defaultFormData }

    // Transform Brand Identity
    if (data['1. Brand & Identity']) {
      const brandData = data['1. Brand & Identity']
      
      if (brandData['Business Name & Tagline']) {
        transformed.brandIdentity.businessNameTagline = {
          name: brandData['Business Name & Tagline']['Name'] || '',
          tagline: brandData['Business Name & Tagline']['Tagline'] || ''
        }
      }
      
      if (brandData['Founder\'s Name & Backstory']) {
        transformed.brandIdentity.founderNameBackstory = {
          founders: brandData['Founder\'s Name & Backstory']['Founders'] || '',
          backstory: brandData['Founder\'s Name & Backstory']['Backstory'] || ''
        }
      }
      
      if (brandData['Mission Statement']) {
        transformed.brandIdentity.missionStatement = {
          whyWeExist: brandData['Mission Statement']['Why We Exist'] || '',
          principles: brandData['Mission Statement']['Principles'] || ''
        }
      }
      
      transformed.brandIdentity.businessModelType = brandData['Business Model Type'] || ''
      transformed.brandIdentity.uniqueSellingProposition = brandData['Unique Selling Proposition (USP)'] || ''
      
      if (brandData['Tone & Personality']) {
        transformed.brandIdentity.tonePersonality = {
          style: brandData['Tone & Personality']['Style'] || ['']
        }
      }
      
    }

    // Transform Target Audience
    if (data['2. Target Audience']) {
      const audienceData = data['2. Target Audience']
      
      if (audienceData['Ideal Customer Profile(s)']) {
        transformed.targetAudience.idealCustomerProfile = {
          description: audienceData['Ideal Customer Profile(s)']['Description'] || ['']
        }
      }
      
      transformed.targetAudience.primaryPainPoints = audienceData['Primary Pain Points'] || ""
      transformed.targetAudience.primaryDesiresGoals = audienceData['Primary Desires & Goals'] || ['']
      transformed.targetAudience.commonObjections = audienceData['Common Objections'] || ['']
      transformed.targetAudience.audienceVocabulary = audienceData['Audience Vocabulary'] || ['']
    }

    // Transform Offers
    if (data['3. Offers']) {
      const offersData = data['3. Offers']
      transformed.offers = []
      
      Object.keys(offersData).forEach(key => {
        if (offersData[key] && typeof offersData[key] === 'string') {
          const parts = key.split(' – ')
          transformed.offers.push({
            name: parts[0] || key,
            price: parts[1] || '',
            description: offersData[key]
          })
        }
      })
      
      if (transformed.offers.length === 0) {
        transformed.offers = [{ name: '', price: '', description: '' }]
      }
    }

    // Transform Client Assets
    if (data['4. Client Assets']) {
      const assetsData = data['4. Client Assets']
      
      if (assetsData['Links to All Social Media Profiles']) {
        const socialData = assetsData['Links to All Social Media Profiles']
        transformed.clientAssets.socialMediaProfiles = {
          instagram: socialData['Instagram'] || '',
          youtube: socialData['YouTube'] || '',
          facebook: socialData['Facebook'] || '',
          tiktok: socialData['TikTok'] || ''
        }
      }
      
      if (assetsData['Testimonials & Case Studies']) {
        const testimonialsData = assetsData['Testimonials & Case Studies']
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

    // Transform Other Information
    if (data['6. Other Information']) {
      transformed.otherInformation = data['6. Other Information']
    }

    return transformed
  }

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])])
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (step: number) => {
    // Allow navigation to any step - users can jump directly to any step
    setCurrentStep(step)
    
    // Mark all steps up to the current step as completed (except the current step itself)
    const newCompletedSteps = []
    for (let i = 1; i < step; i++) {
      newCompletedSteps.push(i)
    }
    setCompletedSteps(newCompletedSteps)
  }

  // Update simple fields
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Update nested object fields
  const updateNestedField = (path: string[], value: any) => {
    setFormData(prev => {
      const newData = JSON.parse(JSON.stringify(prev))
      let current = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      current[path[path.length - 1]] = value
      return newData
    })
  }

  // Update array fields
  const updateArrayField = (path: string[], index: number, value: string) => {
    setFormData(prev => {
      const newData = JSON.parse(JSON.stringify(prev))
      let current = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      current[path[path.length - 1]][index] = value
      return newData
    })
  }

  // Add item to array
  const addArrayItem = (path: string[]) => {
    console.log('Adding array item to path:', path)
    setFormData(prev => {
      console.log('Previous data:', prev)
      const newData = JSON.parse(JSON.stringify(prev))
      let current = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      if (Array.isArray(current[path[path.length - 1]])) {
        current[path[path.length - 1]].push("")
        console.log('Added item, new array:', current[path[path.length - 1]])
      } else {
        console.log('Target is not an array:', current[path[path.length - 1]])
      }
      return newData
    })
  }

  // Remove item from array
  const removeArrayItem = (path: string[], index: number) => {
    setFormData(prev => {
      const newData = JSON.parse(JSON.stringify(prev))
      let current = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      current[path[path.length - 1]].splice(index, 1)
      return newData
    })
  }

  // Add new offer
  const addOffer = () => {
    setFormData(prev => ({
      ...prev,
      offers: [...prev.offers, { name: "", price: "", description: "" }]
    }))
    // Scroll to the newly added offer
    setTimeout(() => {
      productsCarouselApi?.scrollTo(formData.offers.length)
    }, 100)
  }

  // Remove offer
  const removeOffer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      offers: prev.offers.filter((_, i) => i !== index)
    }))
  }

  // Update offer field
  const updateOfferField = (index: number, field: 'name' | 'price' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      offers: prev.offers.map((offer, i) => 
        i === index ? { ...offer, [field]: value } : offer
      )
    }))
  }

  // Save progress function
  const saveProgress = async () => {
    setIsSaving(true)
    
    try {
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        showToastMessage("Authentication required. Please log in again.", 'error')
        return
      }

      // Transform form data to match expected webhook structure
      const transformToWebhookFormat = (data: any, isDraft: boolean = false): any => {
        const baseData = {
          "1. Brand & Identity": {
            "Business Name & Tagline": {
              "Name": data.brandIdentity?.businessNameTagline?.name || null,
              "Tagline": data.brandIdentity?.businessNameTagline?.tagline || null
            },
            "Founder's Name & Backstory": {
              "Founders": data.brandIdentity?.founderNameBackstory?.founders || null,
              "Backstory": data.brandIdentity?.founderNameBackstory?.backstory || null
            },
            "Mission Statement": {
              "Why We Exist": data.brandIdentity?.missionStatement?.whyWeExist || null,
              "Principles": data.brandIdentity?.missionStatement?.principles || null
            },
            "Business Model Type": data.brandIdentity?.businessModelType || null,
            "Unique Selling Proposition (USP)": data.brandIdentity?.uniqueSellingProposition || null,
            "Tone & Personality": {
              "Style": data.brandIdentity?.tonePersonality?.style?.filter((s: string) => s.trim() !== '') || []
            },
          },
          "2. Target Audience": {
            "Ideal Customer Profile(s)": {
              "Description": data.targetAudience?.idealCustomerProfile?.description?.filter((d: string) => d.trim() !== '') || []
            },
            "Primary Pain Points": data.targetAudience?.primaryPainPoints || "",
            "Primary Desires & Goals": data.targetAudience?.primaryDesiresGoals?.filter((g: string) => g.trim() !== '') || [],
            "Common Objections": data.targetAudience?.commonObjections?.filter((o: string) => o.trim() !== '') || [],
            "Audience Vocabulary": data.targetAudience?.audienceVocabulary?.filter((v: string) => v.trim() !== '') || []
          },
          "3. Offers": (() => {
            const offers: any = {}
            
            // Add offers from the offers array
            data.offers?.forEach((offer: any) => {
              if (offer.name && offer.name.trim() !== '') {
                if (offer.price && offer.price.trim() !== '') {
                  offers[`${offer.name} – ${offer.price}`] = offer.description || null
                } else {
                  offers[offer.name] = offer.description || null
                }
              }
            })
            
            // Add main product if it exists
            if (data.productName && data.productName.trim() !== '') {
              if (data.productPrice && data.productPrice.trim() !== '') {
                offers[`${data.productName} – ${data.productPrice}`] = data.productDescription || null
              } else {
                offers[data.productName] = data.productDescription || null
              }
            }
            
            return offers
          })(),
          "4. Client Assets": {
            "Links to All Social Media Profiles": {
              "Instagram": data.socialInstagram || data.clientAssets?.socialMediaProfiles?.instagram || null,
              "YouTube": data.clientAssets?.socialMediaProfiles?.youtube || null,
              "Facebook": data.clientAssets?.socialMediaProfiles?.facebook || null,
              "TikTok": data.clientAssets?.socialMediaProfiles?.tiktok || null
            },
            "Testimonials & Case Studies": {
              "Ecommerce": data.clientAssets?.testimonialsCaseStudies?.filter((t: string) => t.trim() !== '') || [],
              "Financial Services": [],
              "Entertainment": [],
              "Coaches / Consultants": [],
              "Brick & Mortar": [],
              "Others": data.clientAssets?.testimonialsCaseStudies?.filter((t: string) => t.trim() !== '') || []
            }
          },
          "6. Other Information": data.otherInformation && data.otherInformation.trim() !== '' ? data.otherInformation : null
        }

        // Add progress metadata only for drafts
        if (isDraft) {
          return {
            ...baseData,
            "_progress": {
              "currentStep": currentStep,
              "completedSteps": completedSteps,
              "isDraft": true
            }
          }
        }

        return baseData
      }

      const transformedData = transformToWebhookFormat(formData, true) // true for draft

      const response = await fetch('/api/upload-knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(transformedData),
      })

      if (response.ok) {
        setShowSuccessModal(true)
      } else {
        showToastMessage("Failed to save progress", 'error')
      }
    } catch (error: any) {
      showToastMessage("Error saving progress: " + error.message, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 FORM SUBMISSION TRIGGERED')
    console.log('📊 Event type:', e.type)
    console.log('📊 Current step:', currentStep)
    console.log('📊 Total steps:', totalSteps)
    setIsSubmitting(true)

    try {
      console.log('=== FORM SUBMISSION START ===')
      console.log('Timestamp:', new Date().toISOString())
      
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        console.log('❌ No access token found')
        showToastMessage("Authentication required. Please log in again.", 'error')
        return
      }

      console.log('✅ Access token found, length:', accessToken.length)
      console.log('🔗 API Route: /api/upload-knowledge-base')

      // Log raw form data
      console.log('📋 Raw Form Data:')
      console.log(JSON.stringify(formData, null, 2))

      // Transform form data to match expected webhook structure
      const transformToWebhookFormat = (data: any, isDraft: boolean = false): any => {
        const baseData = {
          "1. Brand & Identity": {
            "Business Name & Tagline": {
              "Name": data.brandIdentity?.businessNameTagline?.name || null,
              "Tagline": data.brandIdentity?.businessNameTagline?.tagline || null
            },
            "Founder's Name & Backstory": {
              "Founders": data.brandIdentity?.founderNameBackstory?.founders || null,
              "Backstory": data.brandIdentity?.founderNameBackstory?.backstory || null
            },
            "Mission Statement": {
              "Why We Exist": data.brandIdentity?.missionStatement?.whyWeExist || null,
              "Principles": data.brandIdentity?.missionStatement?.principles || null
            },
            "Business Model Type": data.brandIdentity?.businessModelType || null,
            "Unique Selling Proposition (USP)": data.brandIdentity?.uniqueSellingProposition || null,
            "Tone & Personality": {
              "Style": data.brandIdentity?.tonePersonality?.style?.filter((s: string) => s.trim() !== '') || []
            },
          },
          "2. Target Audience": {
            "Ideal Customer Profile(s)": {
              "Description": data.targetAudience?.idealCustomerProfile?.description?.filter((d: string) => d.trim() !== '') || []
            },
            "Primary Pain Points": data.targetAudience?.primaryPainPoints || "",
            "Primary Desires & Goals": data.targetAudience?.primaryDesiresGoals?.filter((g: string) => g.trim() !== '') || [],
            "Common Objections": data.targetAudience?.commonObjections?.filter((o: string) => o.trim() !== '') || [],
            "Audience Vocabulary": data.targetAudience?.audienceVocabulary?.filter((v: string) => v.trim() !== '') || []
          },
          "3. Offers": (() => {
            const offers: any = {}
            
            // Add offers from the offers array
            data.offers?.forEach((offer: any) => {
              if (offer.name && offer.name.trim() !== '') {
                if (offer.price && offer.price.trim() !== '') {
                  offers[`${offer.name} – ${offer.price}`] = offer.description || null
                } else {
                  offers[offer.name] = offer.description || null
                }
              }
            })
            
            // Add main product if it exists
            if (data.productName && data.productName.trim() !== '') {
              if (data.productPrice && data.productPrice.trim() !== '') {
                offers[`${data.productName} – ${data.productPrice}`] = data.productDescription || null
              } else {
                offers[data.productName] = data.productDescription || null
              }
            }
            
            return offers
          })(),
          "4. Client Assets": {
            "Links to All Social Media Profiles": {
              "Instagram": data.socialInstagram || data.clientAssets?.socialMediaProfiles?.instagram || null,
              "YouTube": data.clientAssets?.socialMediaProfiles?.youtube || null,
              "Facebook": data.clientAssets?.socialMediaProfiles?.facebook || null,
              "TikTok": data.clientAssets?.socialMediaProfiles?.tiktok || null
            },
            "Testimonials & Case Studies": {
              "Ecommerce": data.clientAssets?.testimonialsCaseStudies?.filter((t: string) => t.trim() !== '') || [],
              "Financial Services": [],
              "Entertainment": [],
              "Coaches / Consultants": [],
              "Brick & Mortar": [],
              "Others": data.clientAssets?.testimonialsCaseStudies?.filter((t: string) => t.trim() !== '') || []
            }
          },
          "6. Other Information": data.otherInformation && data.otherInformation.trim() !== '' ? data.otherInformation : null
        }

        // Add progress metadata only for drafts
        if (isDraft) {
          return {
            ...baseData,
            "_progress": {
              "currentStep": currentStep,
              "completedSteps": completedSteps,
              "isDraft": true
            }
          }
        }

        return baseData
      }

      const transformedData = transformToWebhookFormat(formData, false) // false for final submission
      
      // Log filtered/transformed data
      console.log('🔄 Filtered/Transformed Data:')
      console.log(JSON.stringify(transformedData, null, 2))

      // Log request details
      console.log('📤 Making request to API route:')
      console.log('  - URL: /api/upload-knowledge-base')
      console.log('  - Method: POST')
      console.log('  - Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.substring(0, 20)}...`
      })
      console.log('  - Body size:', JSON.stringify(transformedData).length, 'characters')

      // Add timeout and more detailed error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout after 30 seconds')
        controller.abort()
      }, 30000)

      // Call our Next.js API route instead of the webhook directly
      const response = await fetch('/api/upload-knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(transformedData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log('📊 Webhook Response:')
      console.log('  - Status:', response.status)
      console.log('  - Status Text:', response.statusText)
      console.log('  - OK:', response.ok)
      console.log('  - Headers:', Object.fromEntries(response.headers.entries()))

      // Try to get response text
      const responseText = await response.text()
      console.log('  - Response Text:', responseText)
      console.log('  - Response Length:', responseText.length)

      if (response.ok) {
        console.log('✅ Form submission successful!')
        showToastMessage("Brand information updated successfully!", 'success')
        onSuccess?.()
      } else {
        console.log('❌ Form submission failed with status:', response.status)
        showToastMessage(`Failed to update brand information (${response.status})`, 'error')
      }
    } catch (error: any) {
      console.log('💥 Form submission error:')
      console.log('  - Error type:', error.constructor.name)
      console.log('  - Error message:', error.message)
      console.log('  - Error stack:', error.stack)
      console.log('  - Full error object:', error)
      
      // Handle specific error types
      let errorMessage = 'Network error: '
      if (error.name === 'AbortError') {
        errorMessage += 'Request timed out (30 seconds)'
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Unable to connect to server. Please check your internet connection and try again.'
      } else if (error.message.includes('CORS')) {
        errorMessage += 'CORS error - server configuration issue'
      } else {
        errorMessage += error.message
      }
      
      showToastMessage(errorMessage, 'error')
    } finally {
      console.log('=== FORM SUBMISSION END ===')
      setIsSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  }

  // All steps map function (removed StepIndicator component as we now use sidebar)
  const renderSteps = () => (
    <div className="w-full mb-8 bg-white rounded-xl shadow-sm border border-slate-100 p-6 w-[919px] max-w-[919px] mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-700">Step {currentStep} of {totalSteps}</span>
          <div className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full border border-yellow-200">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Step indicators - compact */}
      <div className="flex items-center justify-center overflow-x-auto pb-1">
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1
            const isCompleted = completedSteps.includes(stepNumber)
            const isCurrent = currentStep === stepNumber
            
            return (
              <React.Fragment key={stepNumber}>
                <div className="flex flex-col items-center min-w-0">
                  <button
                    type="button"
                    onClick={() => goToStep(stepNumber)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-all duration-200 ${
                      isCompleted
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-sm hover:from-yellow-500 hover:to-yellow-700'
                        : isCurrent
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-sm'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {isCompleted ? <Check className="w-2.5 h-2.5" /> : stepNumber}
                  </button>
                  <span className={`mt-0.5 text-[10px] font-medium text-center hidden sm:block max-w-12 ${
                    isCurrent ? 'text-yellow-600' : 
                    isCompleted ? 'text-yellow-600' : 'text-gray-500'
                  }`}>
                    {stepNumber === 1 && 'Basic'}
                    {stepNumber === 2 && 'Mission'}
                    {stepNumber === 3 && 'Vision'}
                    {stepNumber === 4 && 'Audience'}
                    {stepNumber === 5 && 'Products'}
                    {stepNumber === 6 && 'Social'}
                    {stepNumber === 7 && 'Reviews'}
                    {stepNumber === 8 && 'Social Media'}
                    {stepNumber === 9 && 'Testimonials'}
                    {stepNumber === 10 && 'Founders'}
                    {stepNumber === 11 && 'Other'}
                    {stepNumber === 12 && 'Done'}
                  </span>
                </div>
                {stepNumber < totalSteps && (
                  <div className={`w-1 h-0.5 ${
                    completedSteps.includes(stepNumber) ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
      
      {/* Populate Data Button - Hidden since auto-population is enabled */}
      <div className="hidden bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-4 mb-6 w-[919px] max-w-[919px] mx-auto">
        <div className="text-center">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Quick Setup</h3>
          <p className="text-xs text-slate-600 mb-3">Load your existing brand information to speed up the process</p>
          <PopulateDataButton 
            size="sm"
            onSuccess={() => {
              showToastMessage("Knowledge base data loaded successfully! You can now edit each step.", 'success')
            }}
            onError={(message) => {
              showToastMessage(`Failed to populate data: ${message}`, 'error')
            }}
          />
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">Loading your saved progress...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar Navigation */}
      <KnowledgeBaseSidebarNav
        currentStep={currentStep}
        totalSteps={totalSteps}
        completedSteps={completedSteps}
        onStepClick={goToStep}
        onAutoFillClick={() => setShowAutoFill(true)}
        onPopulateKnowledgeBase={(data) => {
          console.log('🔄 Populating form with knowledge base data:', data)
          const transformedData = transformParsedDataToFormData(data)
          setFormData(transformedData)
          showToastMessage("Knowledge base data loaded successfully!", 'success')
        }}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-8 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xs font-medium text-slate-600 tracking-wide uppercase">STEP {currentStep} OF {totalSteps}</h1>
              <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
                {currentStep === 1 && 'Basic Information'}
                {currentStep === 2 && 'Mission'}
                {currentStep === 3 && 'Vision'}
                {currentStep === 4 && 'Audience'}
                {currentStep === 5 && 'Products'}
                {currentStep === 6 && 'Social Links'}
                {currentStep === 7 && 'Reviews'}
                {currentStep === 8 && 'Social Media'}
                {currentStep === 9 && 'Testimonials'}
                {currentStep === 10 && 'Founders'}
                {currentStep === 11 && 'Other'}
                {currentStep === 12 && 'Done'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">Complete this section to move to the next step.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="p-1.5 h-7 text-xs"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back
            </Button>
          </div>
        </div>

        {/* Auto-fill Modal */}
        {showAutoFill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            onClick={() => setShowAutoFill(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl border max-w-lg w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Extract Information from Web</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAutoFill(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </Button>
                </div>
                
                <URLScrapingSection
                  onDataScraped={(data) => {
                    handleDataScraped(data)
                    setShowAutoFill(false) // Close modal after successful scraping
                  }}
                  onShowToast={showToastMessage}
                  formData={formData}
                  updateNestedField={updateNestedField}
                  updateField={updateField}
                />
                
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAutoFill(false)}
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Content Area */}
        <div className="flex-1 px-8 py-3 overflow-y-auto overflow-x-hidden max-w-full">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-full">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
        
        {/* Step 1: Basic Business Information */}
        {currentStep === 1 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="text-center pb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-black text-sm font-semibold">1</span>
                </div>
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription className="text-sm">Let's start with your business basics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name *</label>
                  <Input
                    type="text"
                    value={formData.brandIdentity.businessNameTagline.name}
                    onChange={(e) => updateNestedField(['brandIdentity', 'businessNameTagline', 'name'], e.target.value)}
                    placeholder="e.g., TechCorp Solutions"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tagline</label>
                  <Input
                    type="text"
                    value={formData.brandIdentity.businessNameTagline.tagline}
                    onChange={(e) => updateNestedField(['brandIdentity', 'businessNameTagline', 'tagline'], e.target.value)}
                    placeholder="e.g., Innovation at its finest"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Model *</label>
                  <Input
                    type="text"
                    value={formData.brandIdentity.businessModelType}
                    onChange={(e) => updateNestedField(['brandIdentity', 'businessModelType'], e.target.value)}
                    placeholder="e.g., B2B SaaS, E-commerce, Consulting"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Mission & Values */}
        {currentStep === 2 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-[919px] max-w-[919px] mx-auto">
              <CardHeader className="text-center pb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-black text-sm font-semibold">2</span>
                </div>
                <CardTitle className="text-lg">Mission & Values</CardTitle>
                <CardDescription className="text-sm">Define your company's purpose</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mission Statement</label>
                  <Textarea
                    value={formData.brandIdentity.missionStatement.whyWeExist}
                    onChange={(e) => updateNestedField(['brandIdentity', 'missionStatement', 'whyWeExist'], e.target.value)}
                    rows={4}
                    placeholder="Why does your company exist? What's your purpose..."
                    className="resize-y min-h-[100px] max-h-[200px] overflow-y-auto"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Core Values</label>
                  <Textarea
                    value={formData.brandIdentity.missionStatement.principles}
                    onChange={(e) => updateNestedField(['brandIdentity', 'missionStatement', 'principles'], e.target.value)}
                    rows={4}
                    placeholder="What principles guide your business..."
                    className="resize-y min-h-[100px] max-h-[200px] overflow-y-auto"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">What Makes You Unique (USP)</label>
                  <Textarea
                    value={formData.brandIdentity.uniqueSellingProposition}
                    onChange={(e) => updateNestedField(['brandIdentity', 'uniqueSellingProposition'], e.target.value)}
                    rows={4}
                    placeholder="What sets you apart from competitors..."
                    className="resize-y min-h-[100px] max-h-[200px] overflow-y-auto"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Vision */}
        {currentStep === 3 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-[919px] max-w-[919px] mx-auto">
              <CardHeader className="text-center pb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-black text-sm font-semibold">3</span>
                </div>
                <CardTitle className="text-lg">Brand Voice</CardTitle>
                <CardDescription className="text-sm">How does your brand communicate?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Brand Voice Link Extractor */}
                <BrandVoiceLinkExtractor 
                  isExtracting={isBrandVoiceExtracting}
                  setIsExtracting={setIsBrandVoiceExtracting}
                  extractionError={brandVoiceExtractionError}
                  setExtractionError={setBrandVoiceExtractionError}
                  onPatternsExtracted={(patterns: any[]) => {
                    const styles = patterns.map((p: any) => p.tone || p.style)
                    updateNestedField(['brandIdentity', 'tonePersonality', 'style'], styles)
                    showToastMessage(`Applied ${patterns.length} communication patterns`, 'success')
                  }}
                />

                {/* Tone & Personality Style */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Communication Style</label>
                  <Textarea
                    value={formData.brandIdentity.tonePersonality.style.join('\n')}
                    onChange={(e) => {
                      const value = e.target.value
                      // Split by newlines and filter out empty strings
                      const styles = value.split('\n').filter(s => s.trim() !== '')
                      updateNestedField(['brandIdentity', 'tonePersonality', 'style'], styles)
                    }}
                    placeholder="e.g., Professional yet friendly, authoritative..."
                    className="flex-1 resize-none"
                    style={{ height: '120px' }}
                  />
                </div>

              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Target Audience */}
        {currentStep === 4 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-full"
          >
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden w-[919px] max-w-[919px] mx-auto max-w-full">
              <CardHeader className="text-center pb-6 bg-gradient-to-b from-amber-50/30 to-white border-b border-amber-100 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md transition-transform duration-300 hover:scale-105">
                  <span className="text-black text-lg font-bold">4</span>
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 mb-2">Target Audience</CardTitle>
                <CardDescription className="text-slate-500 text-sm">Who are your ideal customers?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6 max-w-full overflow-x-hidden">
                
                {/* Ideal Customer Profile */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow duration-200 w-[919px] max-w-[919px] overflow-x-hidden mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-sm font-semibold text-slate-800">Ideal Customer Descriptions</label>
                        </div>
                        <p className="text-xs text-slate-500">Describe different types of ideal customers</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">{formData.targetAudience.idealCustomerProfile.description.length}</span>
                      <span className="text-xs text-slate-400">types</span>
                    </div>
                  </div>
                  
                  {formData.targetAudience.idealCustomerProfile.description.length > 0 ? (
                    <div className="relative">
                      {/* Carousel Container */}
                      <Carousel
                        setApi={setAudienceCarouselApi}
                        className="w-full"
                        opts={{
                          align: "start",
                          loop: false,
                        }}
                      >
                        <div className="relative">
                          <CarouselContent className="-ml-2 md:-ml-4">
                            {formData.targetAudience.idealCustomerProfile.description.map((desc, index) => (
                              <CarouselItem key={index} className="pl-2 md:pl-4">
                                <div className="relative bg-slate-50 rounded-lg border border-slate-100 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        removeArrayItem(['targetAudience', 'idealCustomerProfile', 'description'], index)
                                        // Adjust carousel position if needed
                                        if (currentAudienceIndex >= index && audienceCarouselApi) {
                                          audienceCarouselApi.scrollTo(Math.max(0, index - 1))
                                        }
                                      }}
                                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors duration-150"
                                      title="Remove this customer type"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <Textarea
                                    value={desc}
                                    onChange={(e) => updateArrayField(['targetAudience', 'idealCustomerProfile', 'description'], index, e.target.value)}
                                    rows={4}
                                    placeholder="Describe one type of ideal customer: demographics, job roles, company size, etc..."
                                    className="border-0 bg-transparent focus:ring-0 text-sm placeholder:text-slate-400 font-medium text-slate-700 resize-y min-h-[100px] max-h-[200px] overflow-y-auto"
                                  />
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          
                          {/* Navigation Arrows - Only show if more than 1 item */}
                          {formData.targetAudience.idealCustomerProfile.description.length > 1 && (
                            <>
                              <CarouselPrevious />
                              <CarouselNext />
                            </>
                          )}
                        </div>
                      </Carousel>
                      
                      {/* Dots Navigation */}
                      {formData.targetAudience.idealCustomerProfile.description.length > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                          {formData.targetAudience.idealCustomerProfile.description.map((_, index) => (
                            <button
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                currentAudienceIndex === index
                                  ? 'bg-blue-500 scale-125'
                                  : 'bg-slate-300 hover:bg-slate-400'
                              }`}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                audienceCarouselApi?.scrollTo(index)
                              }}
                              aria-label={`Go to customer type ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.196-2.121M12 6.75v2.25M12 6.75V3a1.5 1.5 0 00-1.5-1.5h-1.5M12 6.75H8.25m3.75 0H3m9 15v-2.25m0 0v-2.25m0 0h-2.25M12 6.75a1.5 1.5 0 011.5-1.5h1.5M12 6.75h.375m0 0h.375m-.375 0V3a1.5 1.5 0 00-1.5-1.5h-.375M12 6.75V3a1.5 1.5 0 011.5-1.5h1.5V3a1.5 1.5 0 011.5 1.5h1.5M12 6.75V3a1.5 1.5 0 011.5-1.5h1.5" />
                        </svg>
                      </div>
                      <p className="text-sm mb-2">No customer types added yet</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          addArrayItem(['targetAudience', 'idealCustomerProfile', 'description'])
                        }}
                        className="h-8 px-4 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded-lg shadow-sm transition-all duration-200"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add First Customer Type
                      </Button>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow duration-200 w-[919px] max-w-[919px] overflow-x-hidden mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-sm font-semibold text-slate-800">Audience Vocabulary</label>
                        </div>
                        <p className="text-xs text-slate-500">Industry terms and language your audience uses</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">{formData.targetAudience.audienceVocabulary.length}</span>
                      <span className="text-xs text-slate-400">words</span>
                    </div>
                  </div>
                  
                  {formData.targetAudience.audienceVocabulary.length > 0 ? (
                    <div className="relative">
                      {/* Carousel Container */}
                      <Carousel
                        setApi={setAudienceVocabularyCarouselApi}
                        className="w-full"
                        opts={{
                          align: "start",
                          loop: false,
                        }}
                      >
                        <div className="relative">
                          <CarouselContent className="-ml-2 md:-ml-4">
                            {formData.targetAudience.audienceVocabulary.map((word, index) => (
                              <CarouselItem key={index} className="pl-2 md:pl-4">
                                <div className="relative bg-slate-50 rounded-lg border border-slate-100 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        removeArrayItem(['targetAudience', 'audienceVocabulary'], index)
                                        // Adjust carousel position if needed
                                        if (currentAudienceVocabularyIndex >= index && audienceVocabularyCarouselApi) {
                                          audienceVocabularyCarouselApi.scrollTo(Math.max(0, index - 1))
                                        }
                                      }}
                                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors duration-150"
                                      title="Remove this word"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <Input
                                    type="text"
                                    value={word}
                                    onChange={(e) => updateArrayField(['targetAudience', 'audienceVocabulary'], index, e.target.value)}
                                    placeholder="e.g., ROI, scalability, efficiency, KPIs"
                                    className="border-0 bg-transparent focus:ring-0 text-sm placeholder:text-slate-400 font-medium text-slate-700"
                                  />
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          
                          {/* Navigation Arrows - Only show if more than 1 item */}
                          {formData.targetAudience.audienceVocabulary.length > 1 && (
                            <>
                              <CarouselPrevious />
                              <CarouselNext />
                            </>
                          )}
                        </div>
                      </Carousel>
                      
                      {/* Dots Navigation */}
                      {formData.targetAudience.audienceVocabulary.length > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                          {formData.targetAudience.audienceVocabulary.map((_, index) => (
                            <button
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                currentAudienceVocabularyIndex === index
                                  ? 'bg-blue-500 scale-125'
                                  : 'bg-slate-300 hover:bg-slate-400'
                              }`}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                audienceVocabularyCarouselApi?.scrollTo(index)
                              }}
                              aria-label={`Go to word ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-1.974.55-2.492 1.378-.517.83-.517 1.85 0 2.678.518.828 1.44 1.378 2.492 1.378a8.967 8.967 0 016 2.292zm6.792 0A8.967 8.967 0 0018 3.75c-1.052 0-1.974.55-2.492 1.378-.518.828-.518 1.85 0 2.678.519.828 1.44 1.378 2.492 1.378a8.967 8.967 0 016 2.292zM9 12.25A3.75 3.75 0 012.25 16a3.75 3.75 0 003.75 3.75A3.75 3.75 0 0112.75 16a3.75 3.75 0 003.75-3.75" />
                        </svg>
                      </div>
                      <p className="text-sm mb-2">No vocabulary words added yet</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          addArrayItem(['targetAudience', 'audienceVocabulary'])
                        }}
                        className="h-8 px-4 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded-lg shadow-sm transition-all duration-200"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add First Word
                      </Button>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 5: Pain Points */}
        {currentStep === 5 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden w-[919px] max-w-[919px] mx-auto">
              <CardHeader className="text-center pb-6 bg-gradient-to-b from-amber-50/30 to-white border-b border-amber-100 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md transition-transform duration-300 hover:scale-105">
                  <span className="text-black text-lg font-bold">5</span>
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 mb-2">Pain Points</CardTitle>
                <CardDescription className="text-slate-500 text-sm">What problems do you solve?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                
                {/* Primary Pain Points */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow duration-200 w-[919px] max-w-[919px] overflow-x-hidden mx-auto">
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-slate-800 mb-2 block">Customer Pain Points</label>
                    <p className="text-xs text-slate-500 mb-3">What challenges do your customers face?</p>
                    <Textarea
                      value={formData.targetAudience.primaryPainPoints}
                      onChange={(e) => updateNestedField(['targetAudience', 'primaryPainPoints'], e.target.value)}
                      placeholder="e.g., Wasting time on manual processes, struggling with scalability, lack of automation tools, difficulty tracking performance..."
                      className="min-h-[120px] resize-none border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      rows={5}
                    />
                  </div>
                </div>

                {/* Common Objections */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow duration-200 w-[919px] max-w-[919px] overflow-x-hidden mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-sm font-semibold text-slate-800">Common Objections</label>
                        </div>
                        <p className="text-xs text-slate-500">What concerns do customers have about your solution?</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">{formData.targetAudience.commonObjections.length}</span>
                      <span className="text-xs text-slate-400">items</span>
                    </div>
                  </div>
                  
                  {formData.targetAudience.commonObjections.length > 0 ? (
                    <div className="relative">
                      {/* Carousel Container */}
                      <Carousel
                        setApi={setCommonObjectionsCarouselApi}
                        className="w-full"
                        opts={{
                          align: "start",
                          loop: false,
                        }}
                      >
                        <div className="relative">
                          <CarouselContent className="-ml-2 md:-ml-4">
                            {formData.targetAudience.commonObjections.map((objection, index) => (
                              <CarouselItem key={index} className="pl-2 md:pl-4">
                                <div className="relative bg-slate-50 rounded-lg border border-slate-100 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        removeArrayItem(['targetAudience', 'commonObjections'], index)
                                        // Adjust carousel position if needed
                                        if (currentCommonObjectionsIndex >= index && commonObjectionsCarouselApi) {
                                          commonObjectionsCarouselApi.scrollTo(Math.max(0, index - 1))
                                        }
                                      }}
                                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors duration-150"
                                      title="Remove this objection"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <Input
                                    type="text"
                                    value={objection}
                                    onChange={(e) => updateArrayField(['targetAudience', 'commonObjections'], index, e.target.value)}
                                    placeholder="e.g., It's too expensive, We don't have time to implement"
                                    className="border-0 bg-transparent focus:ring-0 text-sm placeholder:text-slate-400 font-medium text-slate-700"
                                  />
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          
                          {/* Navigation Arrows - Only show if more than 1 item */}
                          {formData.targetAudience.commonObjections.length > 1 && (
                            <>
                              <CarouselPrevious />
                              <CarouselNext />
                            </>
                          )}
                        </div>
                      </Carousel>
                      
                      {/* Dots Navigation */}
                      {formData.targetAudience.commonObjections.length > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                          {formData.targetAudience.commonObjections.map((_, index) => (
                            <button
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                currentCommonObjectionsIndex === index
                                  ? 'bg-blue-500 scale-125'
                                  : 'bg-slate-300 hover:bg-slate-400'
                              }`}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                commonObjectionsCarouselApi?.scrollTo(index)
                              }}
                              aria-label={`Go to objection ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-sm mb-2">No objections added yet</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          addArrayItem(['targetAudience', 'commonObjections'])
                        }}
                        className="h-8 px-4 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded-lg shadow-sm transition-all duration-200"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add First Objection
                      </Button>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 6: Primary Desires & Goals */}
        {currentStep === 6 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden w-[919px] max-w-[919px] mx-auto">
              <CardHeader className="text-center pb-6 bg-gradient-to-b from-amber-50/30 to-white border-b border-amber-100 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md transition-transform duration-300 hover:scale-105">
                  <span className="text-black text-lg font-bold">6</span>
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 mb-2">Customer Goals & Desires</CardTitle>
                <CardDescription className="text-slate-500 text-sm">What do your customers want to achieve?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                
                <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow duration-200 w-[919px] max-w-[919px] overflow-x-hidden mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-sm font-semibold text-slate-800">Customer Goals & Desires</label>
                        </div>
                        <p className="text-xs text-slate-500">What your customers want to achieve (raw data)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Textarea
                      value={formData.targetAudience.primaryDesiresGoals[0] || ''}
                      onChange={(e) => {
                        const newGoals = [...formData.targetAudience.primaryDesiresGoals]
                        newGoals[0] = e.target.value
                        setFormData(prev => ({
                          ...prev,
                          targetAudience: {
                            ...prev.targetAudience,
                            primaryDesiresGoals: newGoals
                          }
                        }))
                      }}
                      placeholder="Enter customer goals and desires as raw text..."
                      className="min-h-[120px] resize-none border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 7: Products */}
        {currentStep === 7 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-black text-lg font-semibold">7</span>
                </div>
                <CardTitle className="text-xl">Products & Services</CardTitle>
                <CardDescription>Tell us about your offerings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Multiple Products Section */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow duration-200 w-[919px] max-w-[919px] overflow-x-hidden mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-sm font-semibold text-slate-800">Your Products & Services</label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addOffer}
                            className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-600 rounded-full transition-colors duration-150"
                            title="Add product or service"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500">List all your products and services with pricing</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">{formData.offers.length}</span>
                      <span className="text-xs text-slate-400">offers</span>
                    </div>
                  </div>
                  
                  {formData.offers.length > 0 ? (
                    <div className="relative">
                      {/* Carousel Container */}
                      <Carousel
                        setApi={setProductsCarouselApi}
                        className="w-full"
                        opts={{
                          align: "start",
                          loop: false,
                        }}
                      >
                        <div className="relative">
                          <CarouselContent className="-ml-2 md:-ml-4">
                            {formData.offers.map((offer, index) => (
                              <CarouselItem key={index} className="pl-2 md:pl-4">
                                <div className="relative bg-slate-50 rounded-lg border border-slate-100 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-slate-800">Offer #{index + 1}</span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        removeOffer(index)
                                        // Adjust carousel position if needed
                                        if (currentProductsIndex >= index && productsCarouselApi) {
                                          productsCarouselApi.scrollTo(Math.max(0, index - 1))
                                        }
                                      }}
                                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors duration-150"
                                      title="Remove this offer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-xs font-medium text-slate-600 mb-1 block">Name</label>
                                      <Input
                                        type="text"
                                        value={offer.name}
                                        onChange={(e) => updateOfferField(index, 'name', e.target.value)}
                                        placeholder="e.g., Premium Business Consulting"
                                        className="h-8 text-sm"
                                      />
                                    </div>

                                    <div>
                                      <label className="text-xs font-medium text-slate-600 mb-1 block">Price</label>
                                      <Input
                                        type="text"
                                        value={offer.price}
                                        onChange={(e) => updateOfferField(index, 'price', e.target.value)}
                                        placeholder="e.g., $2,999, Starting at $99/month"
                                        className="h-8 text-sm"
                                      />
                                    </div>

                                    <div>
                                      <label className="text-xs font-medium text-slate-600 mb-1 block">Description</label>
                                      <Textarea
                                        value={offer.description}
                                        onChange={(e) => updateOfferField(index, 'description', e.target.value)}
                                        rows={4}
                                        placeholder="Describe what this product/service includes and its key benefits..."
                                        className="text-sm resize-y min-h-[100px] max-h-[200px] overflow-y-auto"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          
                          {/* Navigation Arrows - Only show if more than 1 item */}
                          {formData.offers.length > 1 && (
                            <>
                              <CarouselPrevious />
                              <CarouselNext />
                            </>
                          )}
                        </div>
                      </Carousel>
                      
                      {/* Dots Navigation */}
                      {formData.offers.length > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                          {formData.offers.map((_, index) => (
                            <button
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                currentProductsIndex === index
                                  ? 'bg-blue-500 scale-125'
                                  : 'bg-slate-300 hover:bg-slate-400'
                              }`}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                productsCarouselApi?.scrollTo(index)
                              }}
                              aria-label={`Go to offer ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <p className="text-sm mb-2">No offers added yet</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addOffer}
                        className="h-8 px-4 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded-lg shadow-sm transition-all duration-200"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add First Offer
                      </Button>
                    </div>
                  )}
                </div>

                {/* Legacy single product fields (hidden but kept for compatibility) */}
                <div className="hidden">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Product/Service Name</label>
                    <Input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => updateField('productName', e.target.value)}
                      placeholder="e.g., Premium Business Consulting"
                      className="h-12 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Price</label>
                    <Input
                      type="text"
                      value={formData.productPrice}
                      onChange={(e) => updateField('productPrice', e.target.value)}
                      placeholder="e.g., $2,999, Starting at $99/month"
                      className="h-12 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Description</label>
                    <Textarea
                      value={formData.productDescription}
                      onChange={(e) => updateField('productDescription', e.target.value)}
                      rows={5}
                      placeholder="Describe what this product/service includes and its key benefits..."
                      className="focus:ring-purple-500 focus:border-purple-500 resize-y min-h-[120px] max-h-[250px] overflow-y-auto"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 8: Social Media */}
        {currentStep === 8 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden w-[919px] max-w-[919px] mx-auto">
              <CardHeader className="text-center pb-6 bg-gradient-to-b from-amber-50/30 to-white border-b border-amber-100 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md transition-transform duration-300 hover:scale-105">
                  <span className="text-black text-lg font-bold">8</span>
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 mb-2">Social Media</CardTitle>
                <CardDescription className="text-slate-500 text-sm">Your online presence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Instagram Profile</label>
                  <Input
                    type="url"
                    value={formData.socialInstagram}
                    onChange={(e) => updateField('socialInstagram', e.target.value)}
                    placeholder="https://instagram.com/yourbusiness"
                    className="h-12 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">YouTube Channel</label>
                  <Input
                    type="url"
                    value={formData.clientAssets.socialMediaProfiles.youtube}
                    onChange={(e) => updateNestedField(['clientAssets', 'socialMediaProfiles', 'youtube'], e.target.value)}
                    placeholder="https://youtube.com/@yourbusiness"
                    className="h-12 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Facebook Page</label>
                  <Input
                    type="url"
                    value={formData.clientAssets.socialMediaProfiles.facebook}
                    onChange={(e) => updateNestedField(['clientAssets', 'socialMediaProfiles', 'facebook'], e.target.value)}
                    placeholder="https://facebook.com/yourbusiness"
                    className="h-12 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">TikTok Profile</label>
                  <Input
                    type="url"
                    value={formData.clientAssets.socialMediaProfiles.tiktok}
                    onChange={(e) => updateNestedField(['clientAssets', 'socialMediaProfiles', 'tiktok'], e.target.value)}
                    placeholder="https://tiktok.com/@yourbusiness"
                    className="h-12 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">LinkedIn Profile</label>
                  <Input
                    type="url"
                    value={formData.socialLinkedIn}
                    onChange={(e) => updateField('socialLinkedIn', e.target.value)}
                    placeholder="https://linkedin.com/company/yourbusiness"
                    className="h-12 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 9: Testimonials & Case Studies */}
        {currentStep === 9 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden w-[919px] max-w-[919px] mx-auto">
              <CardHeader className="text-center pb-6 bg-gradient-to-b from-amber-50/30 to-white border-b border-amber-100 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md transition-transform duration-300 hover:scale-105">
                  <span className="text-black text-lg font-bold">9</span>
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 mb-2">Testimonials & Case Studies</CardTitle>
                <CardDescription className="text-slate-500 text-sm">Share customer testimonials and case studies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                
                <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow duration-200 w-[919px] max-w-[919px] overflow-x-hidden mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-sm font-semibold text-slate-800">Testimonials & Case Studies</label>
                        </div>
                        <p className="text-xs text-slate-500">Customer feedback and success stories</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">{formData.clientAssets.testimonialsCaseStudies.length}</span>
                      <span className="text-xs text-slate-400">testimonials</span>
                    </div>
                  </div>
                  
                  {formData.clientAssets.testimonialsCaseStudies.length > 0 ? (
                    <div className="relative">
                      {/* Carousel Container */}
                      <Carousel
                        setApi={setTestimonialCarouselApi}
                        className="w-full"
                        opts={{
                          align: "start",
                          loop: false,
                        }}
                      >
                        <div className="relative">
                          <CarouselContent className="-ml-2 md:-ml-4">
                            {formData.clientAssets.testimonialsCaseStudies.map((testimonial, index) => (
                              <CarouselItem key={index} className="pl-2 md:pl-4">
                                <div className="relative bg-slate-50 rounded-lg border border-slate-100 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        removeArrayItem(['clientAssets', 'testimonialsCaseStudies'], index)
                                        // Adjust carousel position if needed
                                        if (currentTestimonialIndex >= index && testimonialCarouselApi) {
                                          testimonialCarouselApi.scrollTo(Math.max(0, index - 1))
                                        }
                                      }}
                                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors duration-150"
                                      title="Remove this testimonial"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <Textarea
                                    value={testimonial}
                                    onChange={(e) => updateArrayField(['clientAssets', 'testimonialsCaseStudies'], index, e.target.value)}
                                    rows={5}
                                    placeholder="Share testimonials and case studies from your customers..."
                                    className="border-0 bg-transparent focus:ring-0 text-sm placeholder:text-slate-400 font-medium text-slate-700 resize-y min-h-[120px] max-h-[250px] overflow-y-auto"
                                  />
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          
                          {/* Navigation Arrows - Only show if more than 1 testimonial */}
                          {formData.clientAssets.testimonialsCaseStudies.length > 1 && (
                            <>
                              <CarouselPrevious />
                              <CarouselNext />
                            </>
                          )}
                        </div>
                      </Carousel>
                      
                      {/* Dots Navigation */}
                      {formData.clientAssets.testimonialsCaseStudies.length > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                          {formData.clientAssets.testimonialsCaseStudies.map((_, index) => (
                            <button
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                currentTestimonialIndex === index
                                  ? 'bg-blue-500 scale-125'
                                  : 'bg-slate-300 hover:bg-slate-400'
                              }`}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                testimonialCarouselApi?.scrollTo(index)
                              }}
                              aria-label={`Go to testimonial ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-sm mb-2">No testimonials added yet</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          addArrayItem(['clientAssets', 'testimonialsCaseStudies'])
                        }}
                        className="h-8 px-4 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded-lg shadow-sm transition-all duration-200"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add First Testimonial
                      </Button>
                    </div>
                  )}
                </div>

                {/* Legacy single testimonial field (hidden but kept for compatibility) */}
                <div className="hidden">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Customer Testimonial</label>
                    <Textarea
                      value={formData.testimonial}
                      onChange={(e) => updateField('testimonial', e.target.value)}
                      rows={4}
                      placeholder="Share a positive review or testimonial from a happy customer..."
                      className="focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 10: Founders */}
        {currentStep === 10 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden w-[919px] max-w-[919px] mx-auto">
              <CardHeader className="text-center pb-6 bg-gradient-to-b from-amber-50/30 to-white border-b border-amber-100 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md transition-transform duration-300 hover:scale-105">
                  <span className="text-black text-lg font-bold">10</span>
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 mb-2">Founders & Backstory</CardTitle>
                <CardDescription className="text-slate-500 text-sm">Tell us about the people behind the brand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Founder(s) Name(s)</label>
                  <Input
                    type="text"
                    value={formData.brandIdentity.founderNameBackstory.founders}
                    onChange={(e) => updateNestedField(['brandIdentity', 'founderNameBackstory', 'founders'], e.target.value)}
                    placeholder="e.g., John Smith & Jane Doe"
                    className="h-12 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Founder's Backstory</label>
                  <Textarea
                    value={formData.brandIdentity.founderNameBackstory.backstory}
                    onChange={(e) => updateNestedField(['brandIdentity', 'founderNameBackstory', 'backstory'], e.target.value)}
                    rows={6}
                    placeholder="Share the story of how your company started, the challenges you faced, and what drives you..."
                    className="focus:ring-purple-500 focus:border-purple-500 resize-y min-h-[150px] max-h-[300px] overflow-y-auto"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 11: Other Information */}
        {currentStep === 11 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden w-[919px] max-w-[919px] mx-auto">
              <CardHeader className="text-center pb-6 bg-gradient-to-b from-amber-50/30 to-white border-b border-amber-100 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md transition-transform duration-300 hover:scale-105">
                  <span className="text-black text-lg font-bold">11</span>
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 mb-2">Other Information</CardTitle>
                <CardDescription className="text-slate-500 text-sm">Any additional information about your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Additional Information</label>
                  <Textarea
                    value={formData.otherInformation}
                    onChange={(e) => updateField('otherInformation', e.target.value)}
                    rows={6}
                    placeholder="Share any other relevant information about your business, industry insights, special considerations, or anything else that might help create better ad copy..."
                    className="focus:ring-purple-500 focus:border-purple-500 resize-y min-h-[150px] max-h-[300px] overflow-y-auto"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 12: Completion */}
        {currentStep === 12 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-4 h-4 text-black" />
                </div>
                <CardTitle className="text-xl">Ready to Complete!</CardTitle>
                <CardDescription>Review your information and submit to save your brand profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    You've provided comprehensive information about your brand. This will help our AI create more personalized and effective ad copy for your business.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-[919px] max-w-[919px] mx-auto">
                    <p className="text-green-800 text-sm">
                      <strong>Next:</strong> Click "Complete Setup" to save your brand information and start creating amazing ad copy!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

            </motion.div>
          </form>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="border-t border-amber-100 bg-gradient-to-t from-amber-50/50 to-white px-8 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-3 py-1.5 text-xs"
            >
              <ChevronLeft className="w-3 h-3 mr-1" />
              Back
            </Button>
            
            {currentStep === totalSteps ? (
              <Button
                type="button" 
                disabled={isSaving}
                onClick={saveProgress}
                className="px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black text-xs disabled:opacity-50 shadow-sm transition-all duration-200"
              >
                <Save className="w-3 h-3 mr-1" />
                Complete Setup
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveProgress}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-xs"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save & Finish Later
                </Button>

                <Button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white text-xs shadow-sm transition-all duration-200"
                >
                  Next Step
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Progress Saved!"
        message="Your progress has been saved successfully. You can continue later from where you left off."
        duration={3000}
      />
    </div>
  )
}
