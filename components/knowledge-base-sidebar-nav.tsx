"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, Check, Building2, Target, Eye, Users, Package, Link, Star, User, Award, FileText, BookOpen, Zap } from "lucide-react"

interface KnowledgeBaseSidebarNavProps {
  currentStep: number
  totalSteps: number
  completedSteps: number[]
  onStepClick: (step: number) => void
  onAutoFillClick?: () => void
}

const stepLabels = [
  "Basic Information",
  "Mission",
  "Vision", 
  "Audience",
  "Products",
  "Social Links",
  "Reviews",
  "Founders",
  "Testimonials",
  "Case Studies",
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
  User,        // Founders
  Award,       // Testimonials
  FileText,    // Case Studies
  BookOpen,    // Other
  Zap          // Done
]

export function KnowledgeBaseSidebarNav({ 
  currentStep, 
  totalSteps, 
  completedSteps, 
  onStepClick,
  onAutoFillClick 
}: KnowledgeBaseSidebarNavProps) {
  
  return (
    <div className="w-56 bg-white border-r border-gray-100 h-full flex flex-col shadow-sm">

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
                    ? 'bg-gray-900 text-white shadow-sm hover:bg-gray-800 border-gray-200'
                    : isCompleted
                    ? 'bg-white text-black hover:bg-gray-50 border-gray-200 shadow-sm'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50 cursor-pointer border-gray-100'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                  isCurrent
                    ? 'bg-white text-black'
                    : isCompleted
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {isCompleted ? <Check className="w-2.5 h-2.5" /> : stepNumber}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  {React.createElement(stepIcons[index], { 
                    className: `w-3 h-3 ${
                      isCurrent ? 'text-white' : isCompleted ? 'text-black' : 'text-gray-500'
                    }` 
                  })}
                  <span className={`text-xs font-medium ${
                    isCurrent ? 'text-white' : 'text-black'
                  }`}>{label}</span>
                </div>
                {isCurrent && <ChevronRight className="w-3 h-3" />}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="text-center space-y-4">
          <p className="text-xs font-medium text-gray-600">Need a head start?</p>
          <Button 
            className="w-full bg-black hover:bg-gray-800 text-white text-xs py-2"
            onClick={onAutoFillClick}
          >
            Auto-fill from Website
          </Button>
        </div>
      </div>
    </div>
  )
}
