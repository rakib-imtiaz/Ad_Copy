"use client"

import * as React from "react"
import { authService } from "@/lib/auth-service"
import { Toast } from "@/components/ui/toast"

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
    }
  }
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
      brickMortar: [""]
    }
  }
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

  // Update nested object fields
  const updateNestedField = (path: string[], value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      let current: any = newData
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
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      current[path[path.length - 1]][index] = value
      return newData
    })
  }

  // Add item to array
  const addArrayItem = (path: string[]) => {
    setFormData(prev => {
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      // Only add if we can access the array properly
      if (Array.isArray(current[path[path.length - 1]])) {
        current[path[path.length - 1]].push("")
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

      console.log('📤 Submitting brand form data to webhook...')
      console.log('URL: https://n8n.srv934833.hstgr.cloud/webhook-test/upload-knowledgebase-by-field')

      const response = await fetch('https://n8n.srv934833.hstgr.cloud/webhook-test/upload-knowledgebase-by-field', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData)
      })

      console.log('📡 Response status:', response.status)

      if (response.ok) {
        try {
          const result = await response.json()
          console.log('✅ Success response:', result)
          setToastMessage("Brand information updated successfully!")
          setToastType('success')
          setShowToast(true)
          onSuccess?.()
        } catch (jsonError) {
          console.log('✅ Response received (not JSON):', await response.text())
          setToastMessage("Brand information updated successfully!")
          setToastType('success')
          setShowToast(true)
          onSuccess?.()
        }
      } else {
        const errorText = await response.text()
        console.error('❌ Submission failed:', errorText)
        setToastMessage(`Failed to update brand information: ${response.status}`)
        setToastType('error')
        setShowToast(true)
      }
    } catch (error: any) {
      console.error('❌ Network error:', error)
      setToastMessage(`Network error: ${error.message}`)
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Brand & Identity Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">1. Brand & Identity</h2>
            <p className="text-gray-600 mt-1">Define your brand's core identity and personality</p>
          </div>
          <div className="p-6 space-y-6">

            {/* Business Name & Tagline */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Business Name & Tagline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.brandIdentity.businessNameTagline.name}
                    onChange={(e) => updateNestedField(['brandIdentity', 'businessNameTagline', 'name'], e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                  <input
                    type="text"
                    value={formData.brandIdentity.businessNameTagline.tagline}
                    onChange={(e) => updateNestedField(['brandIdentity', 'businessNameTagline', 'tagline'], e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter tagline"
                  />
                </div>
              </div>
            </div>

            {/* Founder Name & Backstory */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Founder Name & Backstory</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Founders</label>
                  <input
                    type="text"
                    value={formData.brandIdentity.founderNameBackstory.founders}
                    onChange={(e) => updateNestedField(['brandIdentity', 'founderNameBackstory', 'founders'], e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter founder names"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backstory</label>
                  <textarea
                    value={formData.brandIdentity.founderNameBackstory.backstory}
                    onChange={(e) => updateNestedField(['brandIdentity', 'founderNameBackstory', 'backstory'], e.target.value)}
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter founder backstory"
                  />
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Mission Statement</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Why We Exist</label>
                  <textarea
                    value={formData.brandIdentity.missionStatement.whyWeExist}
                    onChange={(e) => updateNestedField(['brandIdentity', 'missionStatement', 'whyWeExist'], e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter mission statement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Principles</label>
                  <textarea
                    value={formData.brandIdentity.missionStatement.principles}
                    onChange={(e) => updateNestedField(['brandIdentity', 'missionStatement', 'principles'], e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter core principles"
                  />
                </div>
              </div>
            </div>

            {/* Business Model Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Model Type</label>
              <input
                type="text"
                value={formData.brandIdentity.businessModelType}
                onChange={(e) => updateNestedField(['brandIdentity', 'businessModelType'], e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter business model type"
              />
            </div>

            {/* Unique Selling Proposition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unique Selling Proposition (USP)</label>
              <textarea
                value={formData.brandIdentity.uniqueSellingProposition}
                onChange={(e) => updateNestedField(['brandIdentity', 'uniqueSellingProposition'], e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter USP"
              />
            </div>

            {/* Tone & Personality */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Tone & Personality</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                {formData.brandIdentity.tonePersonality.style.map((style, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={style}
                      onChange={(e) => updateArrayField(['brandIdentity', 'tonePersonality', 'style'], index, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter style description"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(['brandIdentity', 'tonePersonality', 'style'], index)}
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
                    addArrayItem(['brandIdentity', 'tonePersonality', 'style'])
                  }}
                  className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
                >
                  Add Style
                </button>
              </div>
            </div>

            {/* Example Phrases */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Example Phrases</h3>
              {formData.brandIdentity.examplePhrases.map((phrase, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={phrase}
                    onChange={(e) => updateArrayField(['brandIdentity', 'examplePhrases'], index, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter example phrase"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(['brandIdentity', 'examplePhrases'], index)}
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
                  addArrayItem(['brandIdentity', 'examplePhrases'])
                }}
                className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
              >
                Add Example Phrase
              </button>
            </div>

            {/* Brand Power Words */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Brand Power Words/Phrases</h3>
              {formData.brandIdentity.brandPowerWords.map((word, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => updateArrayField(['brandIdentity', 'brandPowerWords'], index, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter power word or phrase"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(['brandIdentity', 'brandPowerWords'], index)}
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
                  addArrayItem(['brandIdentity', 'brandPowerWords'])
                }}
                className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
              >
                Add Power Word
              </button>
            </div>

            {/* Things to Avoid */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Things to Avoid</h3>
              {formData.brandIdentity.thingsToAvoid.map((thing, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={thing}
                    onChange={(e) => updateArrayField(['brandIdentity', 'thingsToAvoid'], index, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter thing to avoid"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(['brandIdentity', 'thingsToAvoid'], index)}
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
                  addArrayItem(['brandIdentity', 'thingsToAvoid'])
                }}
                className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
              >
                Add Thing to Avoid
              </button>
            </div>
          </div>
        </div>

        {/* Target Audience Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">2. Target Audience</h2>
            <p className="text-gray-600 mt-1">Define your ideal customers and their characteristics</p>
          </div>
          <div className="p-6 space-y-6">

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
          </div>
        </div>

        {/* Offers Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">3. Offers</h2>
            <p className="text-gray-600 mt-1">Define your products and services</p>
          </div>
          <div className="p-6 space-y-6">
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
          </div>
        </div>

        {/* Client Assets Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">4. Client Assets</h2>
            <p className="text-gray-600 mt-1">Define your social media profiles and testimonials</p>
          </div>
          <div className="p-6 space-y-8">

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
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isSubmitting ? 'Updating...' : 'Update Brand Information'}
          </button>
        </div>
      </form>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}
