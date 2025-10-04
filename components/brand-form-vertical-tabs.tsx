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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Check, Save, Plus, Trash2, ArrowLeft, Building2, Target, Eye, Users, Package, Link, Star, Share2, Award, User, BookOpen, Zap } from "lucide-react"
import { URLScrapingSection } from "@/components/url-scraping-section"
import { PopulateDataButton } from "@/components/populate-data-button"
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

// Step configuration for vertical tabs
const stepData = [
  { id: "step1", label: "Basic Information", icon: Building2, number: 1 },
  { id: "step2", label: "Mission", icon: Target, number: 2 },
  { id: "step3", label: "Vision", icon: Eye, number: 3 },
  { id: "step4", label: "Audience", icon: Users, number: 4 },
  { id: "step5", label: "Products", icon: Package, number: 5 },
  { id: "step6", label: "Social Links", icon: Link, number: 6 },
  { id: "step7", label: "Reviews", icon: Star, number: 7 },
  { id: "step8", label: "Social Media", icon: Share2, number: 8 },
  { id: "step9", label: "Testimonials", icon: Award, number: 9 },
  { id: "step10", label: "Founders", icon: User, number: 10 },
  { id: "step11", label: "Other", icon: BookOpen, number: 11 },
  { id: "step12", label: "Done", icon: Zap, number: 12 },
]

export function BrandFormVerticalTabs({ onSuccess }: BrandFormProps) {
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
  const [activeTab, setActiveTab] = React.useState("step1")

  const totalSteps = 12

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
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = { ...current, [path[i]]: { ...current[path[i]] } }
      }
      current[path[path.length - 1]] = value
      return newData
    })
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    const stepNumber = parseInt(value.replace('step', ''))
    setCurrentStep(stepNumber)
    setActiveTab(value)
  }

  // Update offer fields
  const updateOfferField = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      offers: prev.offers.map((offer, i) => 
        i === index ? { ...offer, [field]: value } : offer
      )
    }))
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
    if (formData.offers.length > 1) {
      setFormData(prev => ({
        ...prev,
        offers: prev.offers.filter((_, i) => i !== index)
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Auto-fill Button - Fixed position */}
      <div className="fixed top-4 right-4 z-10">
        <Button 
          className="bg-black hover:bg-gray-800 text-white text-xs py-2 px-4 h-8 shadow-lg"
          onClick={() => setShowAutoFill(true)}
        >
          Extract Information from Web
        </Button>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={handleTabChange} orientation="vertical" className="max-w-7xl mx-auto">
        <div className="flex">
          {/* Vertical Tabs List */}
          <TabsList className="flex-col h-auto w-64 bg-white border-r border-gray-200 p-4 space-y-2 rounded-none">
            {stepData.map((step) => {
              const isCompleted = completedSteps.includes(step.number)
              const isCurrent = currentStep === step.number
              
              return (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  className={`w-full justify-start px-4 py-3 h-auto text-left border rounded-lg transition-all duration-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:border-orange-500 ${
                    isCurrent
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : isCompleted
                      ? 'bg-white text-black border-green-200 hover:bg-green-50'
                      : 'text-gray-600 hover:text-black hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isCurrent
                        ? 'bg-white text-orange-500'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                    </div>
                    <div className="flex items-center gap-2">
                      <step.icon className={`w-4 h-4 ${
                        isCurrent ? 'text-white' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`} />
                      <span className="font-medium text-sm">{step.label}</span>
                    </div>
                  </div>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Tab Content */}
          <div className="flex-1 bg-white min-h-screen">
            <div className="px-8 py-6">
              <div className="mb-6">
                <h1 className="text-xs font-medium text-gray-600 tracking-wide uppercase mb-1">
                  STEP {currentStep} OF {totalSteps}
                </h1>
                <h2 className="text-xl font-semibold text-gray-900">
                  {stepData.find(s => s.number === currentStep)?.label}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Complete this section to move to the next step.</p>
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
                        onDataScraped={() => setShowAutoFill(false)}
                        onShowToast={() => {}}
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

              {/* Form Content */}
              <div className="space-y-6">
                {/* Step 1: Basic Business Information */}
                <TabsContent value="step1" className="mt-0">
                  <Card>
                    <CardHeader className="text-center pb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                        <span className="text-white text-lg font-bold">1</span>
                      </div>
                      <CardTitle className="text-xl">Basic Information</CardTitle>
                      <CardDescription className="text-sm">Tell us about your business basics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                </TabsContent>

                {/* Step 7: Products & Services - Similar to the image */}
                <TabsContent value="step7" className="mt-0">
                  <Card>
                    <CardHeader className="text-center pb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                        <span className="text-white text-lg font-bold">7</span>
                      </div>
                      <CardTitle className="text-xl">Products & Services</CardTitle>
                      <CardDescription className="text-sm">Tell us about your offerings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <label className="text-sm font-medium">Your Products & Services</label>
                        {formData.offers.map((offer, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-medium">Product/Service #{index + 1}</h4>
                              {formData.offers.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => removeOffer(index)}
                                  className="h-7 w-7 p-0 text-center text-red-600 hover:text-red-700"
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
                            className="h-10 px-4 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white border-none shadow-sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Placeholder tabs for other steps */}
                {Array.from({ length: totalSteps }, (_, i) => {
                  const stepNumber = i + 1
                  if (stepNumber === 1 || stepNumber === 7) return null
                  
                  return (
                    <TabsContent key={`step${stepNumber}`} value={`step${stepNumber}`} className="mt-0">
                      <Card>
                        <CardHeader className="text-center pb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                            <span className="text-white text-lg font-bold">{stepNumber}</span>
                          </div>
                          <CardTitle className="text-xl">{stepData.find(s => s.number === stepNumber)?.label}</CardTitle>
                          <CardDescription className="text-sm">Complete this section to move to the next step</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-500 text-sm">Coming soon...</p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentStep > 1) {
                      handleTabChange(`step${currentStep - 1}`)
                    }
                  }}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <Button
                  onClick={() => {
                    if (currentStep < totalSteps) {
                      handleTabChange(`step${currentStep + 1}`)
                    }
                  }}
                  disabled={currentStep === totalSteps}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Tabs>

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}
