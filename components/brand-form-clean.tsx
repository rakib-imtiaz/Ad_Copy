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
import { ChevronLeft, ChevronRight, Check, Save, Plus, Trash2 } from "lucide-react"

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
    examplePhrases: string[]
    brandPowerWords: string[]
    thingsToAvoid: string[]
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
    testimonialsCaseStudies: {
      ecommerce: string[]
      financialServices: string[]
      entertainment: string[]
      coachesConsultants: string[]
      brickMortar: string[]
      others: string[]
    }
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
    },
    examplePhrases: [""],
    brandPowerWords: [""],
    thingsToAvoid: [""]
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
    testimonialsCaseStudies: {
      ecommerce: [""],
      financialServices: [""],
      entertainment: [""],
      coachesConsultants: [""],
      brickMortar: [""],
      others: [""]
    }
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

  const totalSteps = 12

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
      
      transformed.brandIdentity.examplePhrases = brandData['Example Phrases'] || ['']
      transformed.brandIdentity.brandPowerWords = brandData['Brand Power Words/Phrases'] || ['']
      transformed.brandIdentity.thingsToAvoid = brandData['Things to Avoid'] || ['']
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
        transformed.clientAssets.testimonialsCaseStudies = {
          ecommerce: testimonialsData['Ecommerce'] || [''],
          financialServices: testimonialsData['Financial Services'] || [''],
          entertainment: testimonialsData['Entertainment'] || [''],
          coachesConsultants: testimonialsData['Coaches / Consultants'] || [''],
          brickMortar: testimonialsData['Brick & Mortar'] || [''],
          others: testimonialsData['Others'] || ['']
        }
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
            "Example Phrases": data.brandIdentity?.examplePhrases?.filter((p: string) => p.trim() !== '') || [],
            "Brand Power Words/Phrases": data.brandIdentity?.brandPowerWords?.filter((w: string) => w.trim() !== '') || [],
            "Things to Avoid": data.brandIdentity?.thingsToAvoid?.filter((t: string) => t.trim() !== '') || []
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
            "Testimonials & Case Studies": {
              "Ecommerce": data.clientAssets?.testimonialsCaseStudies?.ecommerce?.filter((t: string) => t.trim() !== '') || [],
              "Financial Services": data.clientAssets?.testimonialsCaseStudies?.financialServices?.filter((t: string) => t.trim() !== '') || [],
              "Entertainment": data.clientAssets?.testimonialsCaseStudies?.entertainment?.filter((t: string) => t.trim() !== '') || [],
              "Coaches / Consultants": data.clientAssets?.testimonialsCaseStudies?.coachesConsultants?.filter((t: string) => t.trim() !== '') || [],
              "Brick & Mortar": data.clientAssets?.testimonialsCaseStudies?.brickMortar?.filter((t: string) => t.trim() !== '') || [],
              "Others": data.testimonial && data.testimonial.trim() !== '' ? [data.testimonial] : []
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
            "Example Phrases": data.brandIdentity?.examplePhrases?.filter((p: string) => p.trim() !== '') || [],
            "Brand Power Words/Phrases": data.brandIdentity?.brandPowerWords?.filter((w: string) => w.trim() !== '') || [],
            "Things to Avoid": data.brandIdentity?.thingsToAvoid?.filter((t: string) => t.trim() !== '') || []
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
            "Testimonials & Case Studies": {
              "Ecommerce": data.clientAssets?.testimonialsCaseStudies?.ecommerce?.filter((t: string) => t.trim() !== '') || [],
              "Financial Services": data.clientAssets?.testimonialsCaseStudies?.financialServices?.filter((t: string) => t.trim() !== '') || [],
              "Entertainment": data.clientAssets?.testimonialsCaseStudies?.entertainment?.filter((t: string) => t.trim() !== '') || [],
              "Coaches / Consultants": data.clientAssets?.testimonialsCaseStudies?.coachesConsultants?.filter((t: string) => t.trim() !== '') || [],
              "Brick & Mortar": data.clientAssets?.testimonialsCaseStudies?.brickMortar?.filter((t: string) => t.trim() !== '') || [],
              "Others": data.testimonial && data.testimonial.trim() !== '' ? [data.testimonial] : []
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
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-3">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1
          const isCompleted = completedSteps.includes(stepNumber)
          const isCurrent = currentStep === stepNumber
          
          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => goToStep(stepNumber)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-green-500 text-white shadow-lg hover:bg-green-600'
                      : isCurrent
                      ? 'bg-purple-600 text-white shadow-lg scale-110'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                </button>
                <span className={`mt-2 text-xs font-medium text-center ${
                  isCurrent ? 'text-purple-600' : 
                  isCompleted ? 'text-green-600' : 'text-slate-500'
                }`}>
                  {stepNumber === 1 && 'Basic Info'}
                  {stepNumber === 2 && 'Mission'}
                  {stepNumber === 3 && 'Brand Voice'}
                  {stepNumber === 4 && 'Audience'}
                  {stepNumber === 5 && 'Pain Points'}
                  {stepNumber === 6 && 'Goals'}
                  {stepNumber === 7 && 'Products & Services'}
                  {stepNumber === 8 && 'Social'}
                  {stepNumber === 9 && 'Testimonials'}
                  {stepNumber === 10 && 'Founders'}
                  {stepNumber === 11 && 'Other Info'}
                  {stepNumber === 12 && 'Complete'}
                </span>
              </div>
              {stepNumber < totalSteps && (
                <div className={`w-8 h-0.5 ${
                  completedSteps.includes(stepNumber) ? 'bg-green-500' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your saved progress...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="max-w-2xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <StepIndicator />
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Basic Business Information */}
        {currentStep === 1 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">1</span>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Basic Information</CardTitle>
                <CardDescription className="text-slate-600">Let's start with your business basics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Business Name *</label>
                  <Input
                    type="text"
                    value={formData.brandIdentity.businessNameTagline.name}
                    onChange={(e) => updateNestedField(['brandIdentity', 'businessNameTagline', 'name'], e.target.value)}
                    placeholder="e.g., TechCorp Solutions"
                    className="text-lg h-12 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Tagline</label>
                  <Input
                    type="text"
                    value={formData.brandIdentity.businessNameTagline.tagline}
                    onChange={(e) => updateNestedField(['brandIdentity', 'businessNameTagline', 'tagline'], e.target.value)}
                    placeholder="e.g., Innovation at its finest"
                    className="h-12 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Business Model *</label>
                  <Input
                    type="text"
                    value={formData.brandIdentity.businessModelType}
                    onChange={(e) => updateNestedField(['brandIdentity', 'businessModelType'], e.target.value)}
                    placeholder="e.g., B2B SaaS, E-commerce, Consulting"
                    className="h-12 focus:ring-purple-500 focus:border-purple-500"
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
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">2</span>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Mission & Values</CardTitle>
                <CardDescription className="text-slate-600">Define your company's purpose</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Mission Statement</label>
                  <Textarea
                    value={formData.brandIdentity.missionStatement.whyWeExist}
                    onChange={(e) => updateNestedField(['brandIdentity', 'missionStatement', 'whyWeExist'], e.target.value)}
                    rows={4}
                    placeholder="Why does your company exist? What's your purpose..."
                    className="focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Core Values</label>
                  <Textarea
                    value={formData.brandIdentity.missionStatement.principles}
                    onChange={(e) => updateNestedField(['brandIdentity', 'missionStatement', 'principles'], e.target.value)}
                    rows={4}
                    placeholder="What principles guide your business..."
                    className="focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">What Makes You Unique (USP)</label>
                  <Textarea
                    value={formData.brandIdentity.uniqueSellingProposition}
                    onChange={(e) => updateNestedField(['brandIdentity', 'uniqueSellingProposition'], e.target.value)}
                    rows={3}
                    placeholder="What sets you apart from competitors..."
                    className="focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Brand Voice */}
        {currentStep === 3 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">3</span>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Brand Voice</CardTitle>
                <CardDescription className="text-slate-600">How does your brand communicate?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Tone & Personality Style */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Communication Style</label>
                  {formData.brandIdentity.tonePersonality.style.map((style, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        value={style}
                        onChange={(e) => updateArrayField(['brandIdentity', 'tonePersonality', 'style'], index, e.target.value)}
                        placeholder="e.g., Professional yet friendly, authoritative..."
                        className="flex-1 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('Remove button clicked for style', index)
                          removeArrayItem(['brandIdentity', 'tonePersonality', 'style'], index)
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Add button clicked for style')
                      addArrayItem(['brandIdentity', 'tonePersonality', 'style'])
                    }}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50 w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Communication Style
                  </Button>
                </div>

                {/* Example Phrases */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Example Phrases</label>
                  {formData.brandIdentity.examplePhrases.map((phrase, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        value={phrase}
                        onChange={(e) => updateArrayField(['brandIdentity', 'examplePhrases'], index, e.target.value)}
                        placeholder="e.g., 'Innovating for tomorrow', 'Your success is our mission'"
                        className="flex-1 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeArrayItem(['brandIdentity', 'examplePhrases'], index)
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      addArrayItem(['brandIdentity', 'examplePhrases'])
                    }}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50 w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Example Phrase
                  </Button>
                </div>

                {/* Brand Power Words */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Brand Power Words</label>
                  {formData.brandIdentity.brandPowerWords.map((word, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        value={word}
                        onChange={(e) => updateArrayField(['brandIdentity', 'brandPowerWords'], index, e.target.value)}
                        placeholder="e.g., innovative, reliable, cutting-edge, transformative"
                        className="flex-1 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeArrayItem(['brandIdentity', 'brandPowerWords'], index)
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      addArrayItem(['brandIdentity', 'brandPowerWords'])
                    }}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50 w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Power Word
                  </Button>
                </div>

                {/* Things to Avoid */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Things to Avoid</label>
                  {formData.brandIdentity.thingsToAvoid.map((thing, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        value={thing}
                        onChange={(e) => updateArrayField(['brandIdentity', 'thingsToAvoid'], index, e.target.value)}
                        placeholder="e.g., overly technical jargon, aggressive sales language"
                        className="flex-1 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeArrayItem(['brandIdentity', 'thingsToAvoid'], index)
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      addArrayItem(['brandIdentity', 'thingsToAvoid'])
                    }}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50 w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Thing to Avoid
                  </Button>
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
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">4</span>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Target Audience</CardTitle>
                <CardDescription className="text-slate-600">Who are your ideal customers?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Ideal Customer Profile */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Ideal Customer Descriptions</label>
                  {formData.targetAudience.idealCustomerProfile.description.map((desc, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <Textarea
                        value={desc}
                        onChange={(e) => updateArrayField(['targetAudience', 'idealCustomerProfile', 'description'], index, e.target.value)}
                        rows={3}
                        placeholder="Describe one type of ideal customer: demographics, job roles, company size, etc..."
                        className="flex-1 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeArrayItem(['targetAudience', 'idealCustomerProfile', 'description'], index)
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50 self-start mt-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      addArrayItem(['targetAudience', 'idealCustomerProfile', 'description'])
                    }}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50 w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer Type
                  </Button>
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
                        className="flex-1 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeArrayItem(['targetAudience', 'audienceVocabulary'], index)
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      addArrayItem(['targetAudience', 'audienceVocabulary'])
                    }}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50 w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vocabulary Word
                  </Button>
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
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">5</span>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Pain Points</CardTitle>
                <CardDescription className="text-slate-600">What problems do you solve?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
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
                        className="flex-1 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeArrayItem(['targetAudience', 'primaryPainPoints'], index)
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      addArrayItem(['targetAudience', 'primaryPainPoints'])
                    }}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50 w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Pain Point
                  </Button>
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
                        className="flex-1 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeArrayItem(['targetAudience', 'commonObjections'], index)
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      addArrayItem(['targetAudience', 'commonObjections'])
                    }}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50 w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Objection
                  </Button>
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
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">6</span>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Customer Goals & Desires</CardTitle>
                <CardDescription className="text-slate-600">What do your customers want to achieve?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
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
                        className="flex-1 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeArrayItem(['targetAudience', 'primaryDesiresGoals'], index)
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      addArrayItem(['targetAudience', 'primaryDesiresGoals'])
                    }}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50 w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer Goal
                  </Button>
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
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">7</span>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Products & Services</CardTitle>
                <CardDescription className="text-slate-600">Tell us about your offerings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Multiple Products Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Your Products & Services</label>
                  {formData.offers.map((offer, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-slate-700">Product/Service #{index + 1}</h4>
                        {formData.offers.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOffer(index)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-2">Name</label>
                          <Input
                            type="text"
                            value={offer.name}
                            onChange={(e) => updateOfferField(index, 'name', e.target.value)}
                            placeholder="e.g., Premium Business Consulting"
                            className="h-10 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-2">Price</label>
                          <Input
                            type="text"
                            value={offer.price}
                            onChange={(e) => updateOfferField(index, 'price', e.target.value)}
                            placeholder="e.g., $2,999, Starting at $99/month"
                            className="h-10 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-2">Description</label>
                          <Textarea
                            value={offer.description}
                            onChange={(e) => updateOfferField(index, 'description', e.target.value)}
                            rows={3}
                            placeholder="Describe what this product/service includes and its key benefits..."
                            className="focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOffer}
                    className="w-full text-purple-600 border-purple-300 hover:bg-purple-50 py-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Product/Service
                  </Button>
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
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">8</span>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Social Media</CardTitle>
                <CardDescription className="text-slate-600">Your online presence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

        {/* Step 9: Testimonials */}
        {currentStep === 9 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">9</span>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Social Proof</CardTitle>
                <CardDescription className="text-slate-600">Share a customer testimonial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">10</span>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Founders & Backstory</CardTitle>
                <CardDescription className="text-slate-600">Tell us about the people behind the brand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">11</span>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Other Information</CardTitle>
                <CardDescription className="text-slate-600">Any additional information about your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Ready to Complete!</CardTitle>
                <CardDescription className="text-slate-600">Review your information and submit to save your brand profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-slate-600 mb-4">
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

        {/* Navigation Buttons */}
        <motion.div 
          className="flex items-center justify-between pt-8"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={saveProgress}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-3 text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Progress'}</span>
            </Button>
          </div>

          <Badge variant="secondary" className="px-4 py-2 text-sm">
            Step {currentStep} of {totalSteps}
          </Badge>

          <div className="flex items-center space-x-3">
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </motion.div>
      </form>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </motion.div>
  )
}
