"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/protected-route"
import { BrandFormClean } from "@/components/brand-form-clean"
import { KnowledgeBaseViewer } from "@/components/knowledge-base-viewer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Eye, CheckCircle } from "lucide-react"

export default function KnowledgeBasePage() {
  const [isSaving, setIsSaving] = React.useState(false)
  const [isKnowledgeViewerOpen, setIsKnowledgeViewerOpen] = React.useState(false)
  const [isFormCompleted, setIsFormCompleted] = React.useState(false)

  const handleFormSuccess = () => {
    setIsFormCompleted(true)
    setIsKnowledgeViewerOpen(true)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
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
  
  return (
    <ProtectedRoute>
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Clean Header */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-8"
          variants={itemVariants}
        >
          <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                onClick={() => window.history.back()}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full"
              >
                  <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
                </Button>
                              <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Brand Information
                    </h1>
                    <p className="text-slate-600 mt-1">
                      {isFormCompleted 
                        ? "Your brand profile has been saved successfully!" 
                        : "Fill out your comprehensive brand information to enhance AI copy generation"
                      }
                    </p>
                    {isFormCompleted && (
                      <div className="flex items-center space-x-2 text-green-600 mt-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Profile completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  console.log('=== VIEW KNOWLEDGE BASE BUTTON CLICKED ===')
                  console.log('🔘 Button clicked - opening knowledge base viewer modal')
                  console.log('📅 Timestamp:', new Date().toISOString())
                  setIsKnowledgeViewerOpen(true)
                }}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Knowledge Base
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Clean Form Container */}
        <div className="max-w-4xl mx-auto p-6">
          <motion.div variants={itemVariants}>
            <BrandFormClean onSuccess={handleFormSuccess} />
          </motion.div>
      </div>

      {/* Knowledge Base Viewer Modal */}
      <KnowledgeBaseViewer
        isOpen={isKnowledgeViewerOpen}
        onClose={() => setIsKnowledgeViewerOpen(false)}
      />
      </motion.div>
    </ProtectedRoute>
  )
}