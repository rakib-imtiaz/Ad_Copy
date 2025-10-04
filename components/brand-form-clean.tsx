"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { authService } from "@/lib/auth-service"
import { Toast } from "@/components/ui/toast"
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
    primaryPainPoints: string[]
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
    primaryPainPoints: [""],
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

interface BrandFormProps {
  onSuccess?: () => void
}

export function BrandFormClean({ onSuccess }: BrandFormProps) {
  const [formData, setFormData] = React.useState<BrandFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showToast, setShowToast] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState("")
  const [toastType, setToastType] = React.useState<'success' | 'error' | 'info'>('success')
  const [currentStep, setCurrentStep] = React.useState(1)
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([])
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [showAutoFill, setShowAutoFill] = React.useState(false)

  const totalSteps = 12

  // Function to populate form with structured data
  const populateFormWithData = React.useCallback((data: BrandFormData) => {
    setFormData(data)
    
    // Show success message
    setToastMessage("Knowledge base data loaded successfully! You can now edit each step.")
    setToastType('success')
    setShowToast(true)
    
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
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
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
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            access_token: accessToken
          })
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
                
                setToastMessage("Previous progress loaded successfully!")
                setToastType('info')
                setShowToast(true)
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
      
      transformed.targetAudience.primaryPainPoints = audienceData['Primary Pain Points'] || ['']
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
        setToastMessage("Authentication required. Please log in again.")
        setToastType('error')
        setShowToast(true)
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
            "Primary Pain Points": data.targetAudience?.primaryPainPoints?.filter((p: string) => p.trim() !== '') || [],
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
            "Testimonials & Case Studies": data.clientAssets?.testimonialsCaseStudies?.filter((t: string) => t.trim() !== '') || []
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
        setToastMessage("Progress saved successfully!")
        setToastType('success')
        setShowToast(true)
      } else {
        setToastMessage("Failed to save progress")
        setToastType('error')
        setShowToast(true)
      }
    } catch (error: any) {
      setToastMessage("Error saving progress: " + error.message)
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsSaving(false)
    }
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log('=== FORM SUBMISSION START ===')
      console.log('Timestamp:', new Date().toISOString())
      
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        console.log('❌ No access token found')
        setToastMessage("Authentication required. Please log in again.")
        setToastType('error')
        setShowToast(true)
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
            "Primary Pain Points": data.targetAudience?.primaryPainPoints?.filter((p: string) => p.trim() !== '') || [],
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
            "Testimonials & Case Studies": data.clientAssets?.testimonialsCaseStudies?.filter((t: string) => t.trim() !== '') || []
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
        setToastMessage("Brand information updated successfully!")
        setToastType('success')
        setShowToast(true)
        onSuccess?.()
      } else {
        console.log('❌ Form submission failed with status:', response.status)
        setToastMessage(`Failed to update brand information (${response.status})`)
        setToastType('error')
        setShowToast(true)
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
      
      setToastMessage(errorMessage)
      setToastType('error')
      setShowToast(true)
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
    <div className="w-full mb-8 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
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
      
      {/* Populate Data Button */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-4 mb-6">
        <div className="text-center">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Quick Setup</h3>
          <p className="text-xs text-slate-600 mb-3">Load your existing brand information to speed up the process</p>
          <PopulateDataButton 
            size="sm"
            onSuccess={() => {
              setToastMessage("Knowledge base data loaded successfully! You can now edit each step.")
              setToastType('success')
              setShowToast(true)
            }}
            onError={(message) => {
              setToastMessage(`Failed to populate data: ${message}`)
              setToastType('error')
              setShowToast(true)
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
        <div className="flex-1 px-8 py-3 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
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
            <Card>
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
                    rows={3}
                    placeholder="Why does your company exist? What's your purpose..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Core Values</label>
                  <Textarea
                    value={formData.brandIdentity.missionStatement.principles}
                    onChange={(e) => updateNestedField(['brandIdentity', 'missionStatement', 'principles'], e.target.value)}
                    rows={3}
                    placeholder="What principles guide your business..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">What Makes You Unique (USP)</label>
                  <Textarea
                    value={formData.brandIdentity.uniqueSellingProposition}
                    onChange={(e) => updateNestedField(['brandIdentity', 'uniqueSellingProposition'], e.target.value)}
                    rows={3}
                    placeholder="What sets you apart from competitors..."
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
            <Card>
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
                  onPatternsExtracted={(patterns: any[]) => {
                    const styles = patterns.map((p: any) => p.style)
                    updateArrayField(['brandIdentity', 'tonePersonality', 'style'], 0, styles.join(', '))
                    showToastMessage(`Applied ${patterns.length} communication patterns`, 'success')
                  }}
                  onShowToast={showToastMessage}
                />

                {/* Tone & Personality Style */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Communication Style</label>
                  {formData.brandIdentity.tonePersonality.style.map((style, index) => (
                    <div key={index} className="space-y-2">
                      {/* Show Markdown preview for YouTube tone analysis */}
                      {style.includes('##') || style.includes('**') ? (
                        <div className="border rounded-lg p-4 bg-slate-50">
                          <MarkdownRenderer 
                            content={style}
                            className="text-sm"
                          />
                        </div>
                      ) : (
                        <Input
                          type="text"
                          value={style}
                          onChange={(e) => updateArrayField(['brandIdentity', 'tonePersonality', 'style'], index, e.target.value)}
                          placeholder="e.g., Professional yet friendly, authoritative..."
                          className="flex-1"
                        />
                      )}
                      
                      {/* Remove button */}
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log('Remove button clicked for style', index)
                            removeArrayItem(['brandIdentity', 'tonePersonality', 'style'], index)
                          }}
                          className="h-7 w-7 p-0 text-center text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
          >
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-b from-amber-50/30 to-white border-b border-amber-100 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md transition-transform duration-300 hover:scale-105">
                  <span className="text-black text-lg font-bold">4</span>
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 mb-2">Target Audience</CardTitle>
                <CardDescription className="text-slate-500 text-sm">Who are your ideal customers?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                
                {/* Ideal Customer Profile */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">Ideal Customer Descriptions</label>
                  {formData.targetAudience.idealCustomerProfile.description.map((desc, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <Textarea
                        value={desc}
                        onChange={(e) => updateArrayField(['targetAudience', 'idealCustomerProfile', 'description'], index, e.target.value)}
                        rows={3}
                        placeholder="Describe one type of ideal customer: demographics, job roles, company size, etc..."
                        className="flex-1 focus:ring-yellow-500 focus:border-yellow-500 border-slate-200 rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeArrayItem(['targetAudience', 'idealCustomerProfile', 'description'], index)
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50 self-start mt-2"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addArrayItem(['targetAudience', 'idealCustomerProfile', 'description'])
                      }}
                      className="h-7 px-3 text-xs text-center bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black border-yellow-500 shadow-sm"
                    >
                        <Plus className="w-3 h-3 mr-1" />
                      Add Type
                    </Button>
                  </div>
                </div>

                {/* Audience Vocabulary */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Audience Vocabulary</label>
                  {formData.targetAudience.audienceVocabulary.map((word, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        value={word}
                        onChange={(e) => updateArrayField(['targetAudience', 'audienceVocabulary'], index, e.target.value)}
                        placeholder="e.g., ROI, scalability, efficiency, KPIs"
                        className="flex-1 focus:ring-yellow-500 focus:border-yellow-500 border-slate-200 rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeArrayItem(['targetAudience', 'audienceVocabulary'], index)
                        }}
                        className="h-7 w-7 p-0 text-center text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addArrayItem(['targetAudience', 'audienceVocabulary'])
                      }}
                      className="h-7 px-3 text-xs text-center bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black border-yellow-500 shadow-sm"
                    >
                        <Plus className="w-3 h-3 mr-1" />
                      Add Word
                    </Button>
                  </div>
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
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-b from-amber-50/30 to-white border-b border-amber-100 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md transition-transform duration-300 hover:scale-105">
                  <span className="text-black text-lg font-bold">5</span>
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 mb-2">Pain Points</CardTitle>
                <CardDescription className="text-slate-500 text-sm">What problems do you solve?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                
                {/* Primary Pain Points */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Customer Pain Points</label>
                  {formData.targetAudience.primaryPainPoints.map((pain, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        value={pain}
                        onChange={(e) => updateArrayField(['targetAudience', 'primaryPainPoints'], index, e.target.value)}
                        placeholder="e.g., Wasting time on manual processes, struggling with scalability"
                        className="flex-1 focus:ring-yellow-500 focus:border-yellow-500 border-slate-200 rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeArrayItem(['targetAudience', 'primaryPainPoints'], index)
                        }}
                        className="h-7 w-7 p-0 text-center text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addArrayItem(['targetAudience', 'primaryPainPoints'])
                      }}
                      className="h-7 px-3 text-xs text-center bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black border-yellow-500 shadow-sm"
                    >
                        <Plus className="w-3 h-3 mr-1" />
                      Add Pain
                    </Button>
                  </div>
                </div>

                {/* Common Objections */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Common Objections</label>
                  {formData.targetAudience.commonObjections.map((objection, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        value={objection}
                        onChange={(e) => updateArrayField(['targetAudience', 'commonObjections'], index, e.target.value)}
                        placeholder="e.g., It's too expensive, We don't have time to implement"
                        className="flex-1 focus:ring-yellow-500 focus:border-yellow-500 border-slate-200 rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeArrayItem(['targetAudience', 'commonObjections'], index)
                        }}
                        className="h-7 w-7 p-0 text-center text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addArrayItem(['targetAudience', 'commonObjections'])
                      }}
                      className="h-7 px-3 text-xs text-center bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black border-yellow-500 shadow-sm"
                    >
                        <Plus className="w-3 h-3 mr-1" />
                      Add +
                    </Button>
                  </div>
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
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-b from-amber-50/30 to-white border-b border-amber-100 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md transition-transform duration-300 hover:scale-105">
                  <span className="text-black text-lg font-bold">6</span>
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 mb-2">Customer Goals & Desires</CardTitle>
                <CardDescription className="text-slate-500 text-sm">What do your customers want to achieve?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                
                {/* Primary Desires & Goals */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Customer Goals & Desires</label>
                  {formData.targetAudience.primaryDesiresGoals.map((goal, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        value={goal}
                        onChange={(e) => updateArrayField(['targetAudience', 'primaryDesiresGoals'], index, e.target.value)}
                        placeholder="e.g., Increase revenue by 50%, Scale to 100+ employees, Reduce operational costs"
                        className="flex-1 focus:ring-yellow-500 focus:border-yellow-500 border-slate-200 rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeArrayItem(['targetAudience', 'primaryDesiresGoals'], index)
                        }}
                        className="h-7 w-7 p-0 text-center text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addArrayItem(['targetAudience', 'primaryDesiresGoals'])
                      }}
                      className="h-7 px-3 text-xs text-center bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black border-yellow-500 shadow-sm"
                    >
                        <Plus className="w-3 h-3 mr-1" />
                      Add Goal
                    </Button>
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
                <div className="space-y-4">
                  <label className="text-sm font-medium">Your Products & Services</label>
                  {formData.offers.map((offer, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium">Product/Service #{index + 1}</h4>
                        {formData.offers.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeOffer(index)}
                            className="h-7 w-7 p-0 text-center text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            type="text"
                            value={offer.name}
                            onChange={(e) => updateOfferField(index, 'name', e.target.value)}
                            placeholder="e.g., Premium Business Consulting"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Price</label>
                          <Input
                            type="text"
                            value={offer.price}
                            onChange={(e) => updateOfferField(index, 'price', e.target.value)}
                            placeholder="e.g., $2,999, Starting at $99/month"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={offer.description}
                            onChange={(e) => updateOfferField(index, 'description', e.target.value)}
                            rows={3}
                            placeholder="Describe what this product/service includes and its key benefits..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addOffer}
                      className="h-7 px-3 text-xs text-center bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black border-yellow-500 shadow-sm"
                    >
                        <Plus className="w-3 h-3 mr-1" />
                      Add Product
                    </Button>
                  </div>
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
                      rows={4}
                      placeholder="Describe what this product/service includes and its key benefits..."
                      className="focus:ring-purple-500 focus:border-purple-500"
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
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
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
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-b from-amber-50/30 to-white border-b border-amber-100 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md transition-transform duration-300 hover:scale-105">
                  <span className="text-black text-lg font-bold">9</span>
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 mb-2">Testimonials & Case Studies</CardTitle>
                <CardDescription className="text-slate-500 text-sm">Share customer testimonials and case studies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                
                {/* Testimonials & Case Studies */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Testimonials & Case Studies</label>
                  {formData.clientAssets.testimonialsCaseStudies.map((testimonial, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <Textarea
                        value={testimonial}
                        onChange={(e) => updateArrayField(['clientAssets', 'testimonialsCaseStudies'], index, e.target.value)}
                        rows={3}
                        placeholder="Share testimonials and case studies from your customers..."
                        className="flex-1 focus:ring-yellow-500 focus:border-yellow-500 border-slate-200 rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeArrayItem(['clientAssets', 'testimonialsCaseStudies'], index)
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50 self-start mt-2"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addArrayItem(['clientAssets', 'testimonialsCaseStudies'])
                      }}
                      className="h-7 px-3 text-xs text-center bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black border-yellow-500 shadow-sm"
                    >
                        <Plus className="w-3 h-3 mr-1" />
                      Add +
                    </Button>
                  </div>
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
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
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
                    className="focus:ring-purple-500 focus:border-purple-500"
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
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
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
                    className="focus:ring-purple-500 focus:border-purple-500"
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
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white text-xs shadow-sm transition-all duration-200"
              >
                Next Step
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white text-xs disabled:opacity-50 shadow-sm"
              >
                <Save className="w-3 h-3 mr-1" />
                Complete Setup
              </Button>
            )}
          </div>
        </div>
        {/* Toast Notification */}
        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>
  )
}
