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
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Save, ChevronLeft, ChevronRight, Check } from "lucide-react"

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
  otherInformation: ""
}

interface BrandFormProps {
  onSuccess?: () => void
}

export function BrandForm({ onSuccess }: BrandFormProps) {
  const [formData, setFormData] = React.useState<BrandFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showToast, setShowToast] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState("")
  const [toastType, setToastType] = React.useState<'success' | 'error' | 'info'>('success')
  const [currentStep, setCurrentStep] = React.useState(1)
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([])

  const totalSteps = 9

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCompletedSteps(prev => [...prev, currentStep])
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

  // Update nested object fields
  const updateNestedField = (path: string[], value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = { ...current, [path[i]]: { ...current[path[i]] } }
      }
      current[path[path.length - 1]] = value
      return newData
    })
  }

  // Update array fields
  const updateArrayField = (path: string[], index: number, value: string) => {
    setFormData(prev => {
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = { ...current, [path[i]]: { ...current[path[i]] } }
      }
      const newArray = [...current[path[path.length - 1]]]
      newArray[index] = value
      current[path[path.length - 1]] = newArray
      return newData
    })
  }

  // Add item to array
  const addArrayItem = (path: string[]) => {
    setFormData(prev => {
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = { ...current, [path[i]]: { ...current[path[i]] } }
      }
      // Only add if we can access the array properly
      if (Array.isArray(current[path[path.length - 1]])) {
        current[path[path.length - 1]] = [...current[path[path.length - 1]], ""]
      }
      return newData
    })
  }

  // Remove item from array
  const removeArrayItem = (path: string[], index: number) => {
    setFormData(prev => {
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = { ...current, [path[i]]: { ...current[path[i]] } }
      }
      const newArray = [...current[path[path.length - 1]]]
      newArray.splice(index, 1)
      current[path[path.length - 1]] = newArray
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

  // Filter out empty fields from form data
  const filterEmptyFields = (data: any): any => {
    if (Array.isArray(data)) {
      return data
        .map(item => filterEmptyFields(item))
        .filter(item => {
          if (typeof item === 'object' && item !== null) {
            return Object.keys(item).length > 0
          }
          return item !== '' && item != null
        })
    }
    
    if (typeof data === 'object' && data !== null) {
      const filtered: any = {}
      for (const [key, value] of Object.entries(data)) {
        const filteredValue = filterEmptyFields(value)
        if (Array.isArray(filteredValue)) {
          if (filteredValue.length > 0) {
            filtered[key] = filteredValue
          }
        } else if (typeof filteredValue === 'object' && filteredValue !== null) {
          if (Object.keys(filteredValue).length > 0) {
            filtered[key] = filteredValue
          }
        } else if (filteredValue !== '' && filteredValue != null) {
          filtered[key] = filteredValue
        }
      }
      return filtered
    }
    
    return data
  }

  // Submit form to webhook
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        setToastMessage("Authentication required. Please log in again.")
        setToastType('error')
        setShowToast(true)
        return
      }

      // Filter out empty fields before sending
      const filteredFormData = filterEmptyFields(formData)
      
      // Add other information to the filtered data if it exists
      if (formData.otherInformation && formData.otherInformation.trim() !== '') {
        filteredFormData["6. Other Information"] = formData.otherInformation
      }
      
      console.log('📤 Submitting brand form data to webhook...')
      console.log('URL:', API_ENDPOINTS.N8N_WEBHOOKS.UPLOAD_KNOWLEDGE_BASE_BY_FIELD)
      console.log('📋 Filtered form data:', filteredFormData)
      console.log('🔑 Access token available:', !!accessToken)
      console.log('📊 Data size:', JSON.stringify(filteredFormData).length, 'characters')

      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.UPLOAD_KNOWLEDGE_BASE_BY_FIELD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(filteredFormData),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log('📡 Response status:', response.status)

      // Read the response body only once
      let responseText = ''
      try {
        responseText = await response.text()
        console.log('📄 Response body:', responseText)
      } catch (readError) {
        console.error('❌ Failed to read response body:', readError)
        responseText = 'Unable to read response'
      }

      if (response.ok) {
        try {
          const result = JSON.parse(responseText)
          console.log('✅ Success response:', result)
          setToastMessage("Brand information updated successfully!")
          setToastType('success')
          setShowToast(true)
          onSuccess?.()
        } catch (jsonError) {
          console.log('✅ Response received (not JSON):', responseText)
          setToastMessage("Brand information updated successfully!")
          setToastType('success')
          setShowToast(true)
          onSuccess?.()
        }
      } else {
        console.error('❌ Submission failed:', responseText)
        try {
          const errorData = JSON.parse(responseText)
          setToastMessage(`Failed to update brand information: ${errorData.message || 'Unknown error'}`)
        } catch {
          setToastMessage(`Failed to update brand information: ${response.status} - ${responseText}`)
        }
        setToastType('error')
        setShowToast(true)
      }
    } catch (error: any) {
      console.error('❌ Network error:', error)
      
      let errorMessage = 'Network error occurred'
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.'
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.'
      } else if (error.message) {
        errorMessage = `Network error: ${error.message}`
      }
      
      setToastMessage(errorMessage)
      setToastType('error')
      setShowToast(true)
    } finally {
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
      <div className="flex items-center space-x-4">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1
          const isCompleted = completedSteps.includes(stepNumber)
          const isCurrent = currentStep === stepNumber
          const isAccessible = stepNumber <= currentStep || completedSteps.includes(stepNumber - 1)

  return (
            <React.Fragment key={stepNumber}>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => goToStep(stepNumber)}
                  disabled={!isAccessible}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-purple-600 text-white'
                      : isAccessible
                      ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                </button>
                <span className={`ml-2 text-sm font-medium ${
                  isCurrent ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-slate-500'
                }`}>
                  {stepNumber === 1 && 'Basic Info'}
                  {stepNumber === 2 && 'Mission & Values'}
                  {stepNumber === 3 && 'Brand Voice'}
                  {stepNumber === 4 && 'Target Audience'}
                  {stepNumber === 5 && 'Pain Points'}
                  {stepNumber === 6 && 'Products'}
                  {stepNumber === 7 && 'Social Media'}
                  {stepNumber === 8 && 'Testimonials'}
                  {stepNumber === 9 && 'Other Info'}
                </span>
              </div>
              {stepNumber < totalSteps && (
                <div className={`w-12 h-0.5 ${
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
      className="max-w-4xl mx-auto space-y-8"
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
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900 flex items-center space-x-2">
                  <span className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white text-sm font-bold">1</span>
                  <span>Basic Business Information</span>
                </CardTitle>
                <CardDescription>Let's start with your basic business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

            {/* Business Name & Tagline */}
                <div className="space-y-6">
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
                    <label className="block text-sm font-medium text-slate-700 mb-3">Business Model Type *</label>
                    <Input
                    type="text"
                      value={formData.brandIdentity.businessModelType}
                      onChange={(e) => updateNestedField(['brandIdentity', 'businessModelType'], e.target.value)}
                      placeholder="e.g., B2B SaaS, E-commerce, Consulting"
                      className="h-12 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
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
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900 flex items-center space-x-2">
                  <span className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white text-sm font-bold">2</span>
                  <span>Mission & Values</span>
                </CardTitle>
                <CardDescription>Define your company's purpose and core principles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Why We Exist (Mission Statement)</label>
                  <Textarea
                    value={formData.brandIdentity.missionStatement.whyWeExist}
                    onChange={(e) => updateNestedField(['brandIdentity', 'missionStatement', 'whyWeExist'], e.target.value)}
                    rows={4}
                    placeholder="Describe your company's purpose and mission..."
                    className="focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Core Principles & Values</label>
                  <Textarea
                    value={formData.brandIdentity.missionStatement.principles}
                    onChange={(e) => updateNestedField(['brandIdentity', 'missionStatement', 'principles'], e.target.value)}
                    rows={4}
                    placeholder="List your core values and principles..."
                    className="focus:ring-purple-500 focus:border-purple-500"
                  />
            </div>

            <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Unique Selling Proposition (USP)</label>
                  <Textarea
                value={formData.brandIdentity.uniqueSellingProposition}
                onChange={(e) => updateNestedField(['brandIdentity', 'uniqueSellingProposition'], e.target.value)}
                rows={3}
                    placeholder="What makes your business unique and different from competitors..."
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
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900 flex items-center space-x-2">
                  <span className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white text-sm font-bold">3</span>
                  <span>Brand Voice</span>
                </CardTitle>
                <CardDescription>Define how your brand communicates and sounds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

            {/* Ideal Customer Profile */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Ideal Customer Profile(s)</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                {formData.targetAudience.idealCustomerProfile.description.map((desc, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <textarea
                      value={desc}
                      onChange={(e) => updateArrayField(['targetAudience', 'idealCustomerProfile', 'description'], index, e.target.value)}
                      rows={3}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter customer description"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(['targetAudience', 'idealCustomerProfile', 'description'], index)}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    addArrayItem(['targetAudience', 'idealCustomerProfile', 'description'])
                  }}
                  className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
                >
                  Add Description
                </button>
              </div>
            </div>

            {/* Primary Pain Points */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Primary Pain Points</h3>
              {formData.targetAudience.primaryPainPoints.map((pain, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={pain}
                    onChange={(e) => updateArrayField(['targetAudience', 'primaryPainPoints'], index, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter pain point"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(['targetAudience', 'primaryPainPoints'], index)}
                    className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  addArrayItem(['targetAudience', 'primaryPainPoints'])
                }}
                className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
              >
                Add Pain Point
              </button>
            </div>

            {/* Primary Desires & Goals */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Primary Desires & Goals</h3>
              {formData.targetAudience.primaryDesiresGoals.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => updateArrayField(['targetAudience', 'primaryDesiresGoals'], index, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter desire or goal"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(['targetAudience', 'primaryDesiresGoals'], index)}
                    className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  addArrayItem(['targetAudience', 'primaryDesiresGoals'])
                }}
                className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
              >
                Add Desire/Goal
              </button>
            </div>

            {/* Common Objections */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Common Objections</h3>
              {formData.targetAudience.commonObjections.map((objection, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={objection}
                    onChange={(e) => updateArrayField(['targetAudience', 'commonObjections'], index, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter common objection"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(['targetAudience', 'commonObjections'], index)}
                    className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  addArrayItem(['targetAudience', 'commonObjections'])
                }}
                className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
              >
                Add Objection
              </button>
            </div>

            {/* Audience Vocabulary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Audience Vocabulary</h3>
              {formData.targetAudience.audienceVocabulary.map((word, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => updateArrayField(['targetAudience', 'audienceVocabulary'], index, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter vocabulary word"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(['targetAudience', 'audienceVocabulary'], index)}
                    className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  addArrayItem(['targetAudience', 'audienceVocabulary'])
                }}
                className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
              >
                Add Vocabulary Word
              </button>
            </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Products & Services */}
        {currentStep === 3 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900 flex items-center space-x-2">
                  <span className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white text-sm font-bold">3</span>
                  <span>Products & Services</span>
                </CardTitle>
                <CardDescription>Define your products and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
            {formData.offers.map((offer, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Offer {index + 1}</h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      removeOffer(index)
                    }}
                    className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    Remove Offer
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Offer Name</label>
                    <input
                      type="text"
                      value={offer.name}
                      onChange={(e) => updateOfferField(index, 'name', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter offer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="text"
                      value={offer.price}
                      onChange={(e) => updateOfferField(index, 'price', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter price (e.g., $1,000 or Free)"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={offer.description}
                    onChange={(e) => updateOfferField(index, 'description', e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Describe what this offer includes, benefits, features, etc."
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addOffer()
              }}
              className="w-full px-4 py-3 text-purple-600 border-2 border-dashed border-purple-300 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-colors"
            >
              + Add New Offer
            </button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Social Assets */}
        {currentStep === 4 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900 flex items-center space-x-2">
                  <span className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white text-sm font-bold">4</span>
                  <span>Social Assets</span>
                </CardTitle>
                <CardDescription>Define your social media profiles and testimonials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

            {/* Social Media Profiles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Links to All Social Media Profiles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <input
                    type="url"
                    value={formData.clientAssets.socialMediaProfiles.instagram}
                    onChange={(e) => updateNestedField(['clientAssets', 'socialMediaProfiles', 'instagram'], e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://instagram.com/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                  <input
                    type="url"
                    value={formData.clientAssets.socialMediaProfiles.youtube}
                    onChange={(e) => updateNestedField(['clientAssets', 'socialMediaProfiles', 'youtube'], e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://youtube.com/@channel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                  <input
                    type="url"
                    value={formData.clientAssets.socialMediaProfiles.facebook}
                    onChange={(e) => updateNestedField(['clientAssets', 'socialMediaProfiles', 'facebook'], e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://facebook.com/page"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
                  <input
                    type="url"
                    value={formData.clientAssets.socialMediaProfiles.tiktok}
                    onChange={(e) => updateNestedField(['clientAssets', 'socialMediaProfiles', 'tiktok'], e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://tiktok.com/@username"
                  />
                </div>
              </div>
            </div>

            {/* Testimonials & Case Studies */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Testimonials & Case Studies</h3>

              {/* Ecommerce */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-800">Ecommerce</h4>
                {formData.clientAssets.testimonialsCaseStudies.ecommerce.map((testimonial, index) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      value={testimonial}
                      onChange={(e) => updateArrayField(['clientAssets', 'testimonialsCaseStudies', 'ecommerce'], index, e.target.value)}
                      rows={2}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter ecommerce testimonial"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(['clientAssets', 'testimonialsCaseStudies', 'ecommerce'], index)}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    addArrayItem(['clientAssets', 'testimonialsCaseStudies', 'ecommerce'])
                  }}
                  className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
                >
                  Add Ecommerce Testimonial
                </button>
              </div>

              {/* Financial Services */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-800">Financial Services</h4>
                {formData.clientAssets.testimonialsCaseStudies.financialServices.map((testimonial, index) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      value={testimonial}
                      onChange={(e) => updateArrayField(['clientAssets', 'testimonialsCaseStudies', 'financialServices'], index, e.target.value)}
                      rows={2}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter financial services testimonial"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(['clientAssets', 'testimonialsCaseStudies', 'financialServices'], index)}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    addArrayItem(['clientAssets', 'testimonialsCaseStudies', 'financialServices'])
                  }}
                  className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
                >
                  Add Financial Services Testimonial
                </button>
              </div>

              {/* Entertainment */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-800">Entertainment</h4>
                {formData.clientAssets.testimonialsCaseStudies.entertainment.map((testimonial, index) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      value={testimonial}
                      onChange={(e) => updateArrayField(['clientAssets', 'testimonialsCaseStudies', 'entertainment'], index, e.target.value)}
                      rows={2}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter entertainment testimonial"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(['clientAssets', 'testimonialsCaseStudies', 'entertainment'], index)}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    addArrayItem(['clientAssets', 'testimonialsCaseStudies', 'entertainment'])
                  }}
                  className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
                >
                  Add Entertainment Testimonial
                </button>
              </div>

              {/* Coaches / Consultants */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-800">Coaches / Consultants</h4>
                {formData.clientAssets.testimonialsCaseStudies.coachesConsultants.map((testimonial, index) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      value={testimonial}
                      onChange={(e) => updateArrayField(['clientAssets', 'testimonialsCaseStudies', 'coachesConsultants'], index, e.target.value)}
                      rows={2}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter coach/consultant testimonial"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(['clientAssets', 'testimonialsCaseStudies', 'coachesConsultants'], index)}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    addArrayItem(['clientAssets', 'testimonialsCaseStudies', 'coachesConsultants'])
                  }}
                  className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
                >
                  Add Coach/Consultant Testimonial
                </button>
              </div>

              {/* Brick & Mortar */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-800">Brick & Mortar</h4>
                {formData.clientAssets.testimonialsCaseStudies.brickMortar.map((testimonial, index) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      value={testimonial}
                      onChange={(e) => updateArrayField(['clientAssets', 'testimonialsCaseStudies', 'brickMortar'], index, e.target.value)}
                      rows={2}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter brick & mortar testimonial"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(['clientAssets', 'testimonialsCaseStudies', 'brickMortar'], index)}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    addArrayItem(['clientAssets', 'testimonialsCaseStudies', 'brickMortar'])
                  }}
                  className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
                >
                  Add Brick & Mortar Testimonial
                </button>
              </div>

              {/* Others */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-800">Others</h4>
                {formData.clientAssets.testimonialsCaseStudies.others.map((testimonial, index) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      value={testimonial}
                      onChange={(e) => updateArrayField(['clientAssets', 'testimonialsCaseStudies', 'others'], index, e.target.value)}
                      rows={2}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter other testimonial or case study"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(['clientAssets', 'testimonialsCaseStudies', 'others'], index)}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
            </div>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    addArrayItem(['clientAssets', 'testimonialsCaseStudies', 'others'])
                  }}
                  className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
                >
                  Add Other Testimonial
                </button>
          </div>
        </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 9: Other Information */}
        {currentStep === 9 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900 flex items-center space-x-2">
                  <span className="p-2 bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg text-white text-sm font-bold">9</span>
                  <span>Other Information</span>
                </CardTitle>
                <CardDescription>Any additional information about your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Additional Information</label>
                  <Textarea
                    value={formData.otherInformation}
                    onChange={(e) => updateNestedField(['otherInformation'], e.target.value)}
                    rows={6}
                    placeholder="Share any other relevant information about your business, industry insights, special considerations, or anything else that might help create better ad copy..."
                    className="focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <motion.div 
          className="flex items-center justify-between pt-6"
          variants={itemVariants}
        >
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">
              Step {currentStep} of {totalSteps}
            </span>
          </div>

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
            type="submit"
            disabled={isSubmitting}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Updating...' : 'Complete & Save'}
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
