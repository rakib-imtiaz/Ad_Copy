"use client"

import * as React from "react"
import { Save, Edit, History, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { KnowledgeBase } from "@/types"

interface KnowledgeBaseProps {
  knowledgeBase?: KnowledgeBase
  onSave?: (data: Partial<KnowledgeBase>) => void
  isLoading?: boolean
}

export function KnowledgeBaseComponent({ knowledgeBase, onSave, isLoading }: KnowledgeBaseProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [formData, setFormData] = React.useState({
    companyName: knowledgeBase?.companyName || "",
    service: knowledgeBase?.service || "",
    industry: knowledgeBase?.industry || "",
    niche: knowledgeBase?.niche || ""
  })
  const [hasChanges, setHasChanges] = React.useState(false)

  React.useEffect(() => {
    if (knowledgeBase) {
      setFormData({
        companyName: knowledgeBase.companyName || "",
        service: knowledgeBase.service || "",
        industry: knowledgeBase.industry || "",
        niche: knowledgeBase.niche || ""
      })
    }
  }, [knowledgeBase])

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (onSave) {
      await onSave(formData)
      setIsEditing(false)
      setHasChanges(false)
    }
  }

  const handleCancel = () => {
    if (knowledgeBase) {
      setFormData({
        companyName: knowledgeBase.companyName || "",
        service: knowledgeBase.service || "",
        industry: knowledgeBase.industry || "",
        niche: knowledgeBase.niche || ""
      })
    }
    setIsEditing(false)
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Base</h2>
          <p className="text-muted-foreground">
            Core information auto-injected into all AI copy generations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {knowledgeBase && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <History className="h-3 w-3" />
              <span>v{knowledgeBase.version}</span>
            </Badge>
          )}
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges || isLoading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? "Saving..." : "Save"}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Knowledge Base Form */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>Business Information</span>
                {!isEditing && knowledgeBase && (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                )}
              </CardTitle>
              <CardDescription>
                Fixed fields that will be automatically included in every AI prompt
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Company Name <span className="text-red-400">*</span>
            </label>
            {isEditing ? (
              <Input
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="e.g., TechCorp Solutions"
                className="bg-gray-800 border-gray-700 text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
              />
            ) : (
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <span className="text-white">
                  {formData.companyName || "Not set"}
                </span>
              </div>
            )}
          </div>

          {/* Service */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Service/Product <span className="text-red-400">*</span>
            </label>
            {isEditing ? (
              <Input
                value={formData.service}
                onChange={(e) => handleInputChange("service", e.target.value)}
                placeholder="e.g., B2B Software Solutions, E-commerce Platform"
                className="bg-gray-800 border-gray-700 text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
              />
            ) : (
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <span className="text-white">
                  {formData.service || "Not set"}
                </span>
              </div>
            )}
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Industry <span className="text-red-400">*</span>
            </label>
            {isEditing ? (
              <Input
                value={formData.industry}
                onChange={(e) => handleInputChange("industry", e.target.value)}
                placeholder="e.g., Technology, Healthcare, Finance"
                className="bg-gray-800 border-gray-700 text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
              />
            ) : (
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <span className="text-white">
                  {formData.industry || "Not set"}
                </span>
              </div>
            )}
          </div>

          {/* Niche */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Niche/Specialization <span className="text-red-400">*</span>
            </label>
            {isEditing ? (
              <Input
                value={formData.niche}
                onChange={(e) => handleInputChange("niche", e.target.value)}
                placeholder="e.g., AI-powered project management for remote teams"
                className="bg-gray-800 border-gray-700 text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
              />
            ) : (
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <span className="text-white">
                  {formData.niche || "Not set"}
                </span>
              </div>
            )}
          </div>

          {hasChanges && isEditing && (
            <div className="flex items-center space-x-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-orange-400">You have unsaved changes</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Information */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Understanding how your knowledge base enhances AI copy generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-[#1ABC9C] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-black">1</span>
              </div>
              <div>
                <h4 className="font-medium text-white">Auto-Injection</h4>
                <p className="text-sm text-gray-400">
                  These fields are automatically included in every AI conversation to ensure consistent, 
                  brand-aligned copy generation.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-[#1ABC9C] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-black">2</span>
              </div>
              <div>
                <h4 className="font-medium text-white">Version Control</h4>
                <p className="text-sm text-gray-400">
                  Changes are tracked with version history, allowing you to revert to previous 
                  configurations if needed.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-[#1ABC9C] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-black">3</span>
              </div>
              <div>
                <h4 className="font-medium text-white">Context Awareness</h4>
                <p className="text-sm text-gray-400">
                  AI agents use this context to generate more relevant, targeted copy that aligns 
                  with your business goals and industry standards.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}