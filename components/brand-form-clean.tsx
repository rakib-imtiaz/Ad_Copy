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
  testimonial: ""
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

  const totalSteps = 11

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
    if (step <= currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step)
    }
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
      const transformToWebhookFormat = (data: any): any => {
        return {
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
          }
        }
      }

      const transformedData = transformToWebhookFormat(formData)
      
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
          const isAccessible = stepNumber <= currentStep || completedSteps.includes(stepNumber - 1)
          
          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => goToStep(stepNumber)}
                  disabled={!isAccessible}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-green-500 text-white shadow-lg'
                      : isCurrent
                      ? 'bg-purple-600 text-white shadow-lg scale-110'
                      : isAccessible
                      ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                </button>
                <span className={`mt-2 text-xs font-medium text-center ${
                  isCurrent ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-slate-500'
                }`}>
                  {stepNumber === 1 && 'Basic Info'}
                  {stepNumber === 2 && 'Mission'}
                  {stepNumber === 3 && 'Brand Voice'}
                  {stepNumber === 4 && 'Audience'}
                  {stepNumber === 5 && 'Pain Points'}
                  {stepNumber === 6 && 'Goals'}
                  {stepNumber === 7 && 'Products'}
                  {stepNumber === 8 && 'Social'}
                  {stepNumber === 9 && 'Testimonials'}
                  {stepNumber === 10 && 'Founders'}
                  {stepNumber === 11 && 'Complete'}
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
                <CardTitle className="text-2xl font-bold text-slate-900">Main Product/Service</CardTitle>
                <CardDescription className="text-slate-600">Tell us about your primary offering</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

        {/* Step 11: Completion */}
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

          <Badge variant="secondary" className="px-4 py-2 text-sm">
            Step {currentStep} of {totalSteps}
          </Badge>

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
