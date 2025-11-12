"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, Check, Building2, Target, Eye, Users, Package, Link, Star, User, Award, FileText, BookOpen, Zap, Share2, TestTube, Globe } from "lucide-react"
import { useKnowledgeBasePopulation } from "@/hooks/use-knowledge-base-population"
import { ParsedKnowledgeBaseData } from "@/lib/services/knowledge-base-webhook-parser"

interface KnowledgeBaseSidebarNavProps {
  currentStep: number
  totalSteps: number
  completedSteps: number[]
  onStepClick: (step: number) => void
  onAutoFillClick?: () => void
  onPopulateKnowledgeBase?: (data: ParsedKnowledgeBaseData) => void
}

const stepLabels = [
  "Basic Information",
  "Mission",
  "Brand Voice", 
  "Audience",
  "Pain Points",
  "Customer Goals",
  "Products",
  "Social Media",
  "Testimonials",
  "Founders",
  "Other",
  "Done"
]

const stepIcons = [
  Building2,   // Basic Information
  Target,      // Mission
  Eye,         // Vision
  Users,       // Audience
  Package,     // Products
  Link,        // Social Links
  Star,        // Reviews
  Share2,      // Social Media
  Award,       // Testimonials
  User,        // Founders
  BookOpen,    // Other
  Zap          // Done
]

export function KnowledgeBaseSidebarNav({ 
  currentStep, 
  totalSteps, 
  completedSteps, 
  onStepClick,
  onAutoFillClick,
  onPopulateKnowledgeBase
}: KnowledgeBaseSidebarNavProps) {
  
  const {
    isLoading,
    loadKnowledgeBase,
    error
  } = useKnowledgeBasePopulation(onPopulateKnowledgeBase)

  const handleLoadKnowledgeBase = async () => {
    try {
      await loadKnowledgeBase()
    } catch (err: any) {
      alert(`❌ Error loading Business Info:\n\n${err.message}`)
    }
  }

  
  return (
    <div className="w-56 bg-background border-r border-border h-full flex flex-col shadow-sm">

      {/* Navigation Steps */}
      <div className="flex-1 px-4 pt-6 pb-4">
        <nav className="space-y-1">
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1
            const isCompleted = completedSteps.includes(stepNumber)
            const isCurrent = currentStep === stepNumber
            const isAccessible = true // Allow navigation to any step
            
            return (
              <button
                key={stepNumber}
                onClick={() => onStepClick(stepNumber)}
                className={`w-full flex items-center gap-2 px-2 py-2 text-left rounded-lg transition-all duration-300 border ${
                  isCurrent
                    ? 'bg-foreground text-background shadow-sm hover:bg-foreground/90 border-border'
                    : isCompleted
                    ? 'bg-background text-foreground hover:bg-foreground/10 border-border shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-foreground/10 cursor-pointer border-border/60'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                  isCurrent
                    ? 'bg-background text-foreground'
                    : isCompleted
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? <Check className="w-2.5 h-2.5" /> : stepNumber}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  {React.createElement(stepIcons[index], { 
                    className: `w-3 h-3 ${
                      isCurrent ? 'text-background' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }` 
                  })}
                  <span className={`text-xs font-medium ${
                    isCurrent ? 'text-background' : 'text-foreground'
                  }`}>{label}</span>
                </div>
                {isCurrent && (
                  <div className="flex-shrink-0 pointer-events-none">
                    <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border bg-background/90">
        <div className="text-center space-y-4">
          <p className="text-xs font-medium text-muted-foreground">Need a head start?</p>
          <Button 
            className="w-full max-w-xs bg-foreground hover:bg-foreground/80 text-background text-xs py-1 px-4 h-8 flex items-center justify-center relative overflow-hidden"
            onClick={onAutoFillClick}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            <Globe className="w-3 h-3 mr-1 flex-shrink-0 relative z-10 text-background" />
            <span className="relative z-10">Fill Data from Web</span>
          </Button>
          
        </div>
      </div>
    </div>
  )
}
