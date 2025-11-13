"use client"

import * as React from "react"
import { 
  AlertTriangle, 
  Upload, 
  X, 
  FileText, 
  Lightbulb,
  ArrowRight,
  AlertCircle
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"

interface KnowledgeBaseWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadContent: () => void
  onRetryValidation: () => void
  isLoading?: boolean
  error?: string | null
}

export function KnowledgeBaseWarningModal({
  isOpen,
  onClose,
  onUploadContent,
  onRetryValidation,
  isLoading = false,
  error = null
}: KnowledgeBaseWarningModalProps) {
  const { user } = useAuth()
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Business Information Required
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Your AI agent needs training data to provide helpful responses
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error alert if validation failed */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Main warning message */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Empty Business Information Detected</strong>
              <br />
              Your current Business Information is empty or contains insufficient training data. 
              The AI agent needs content to learn from in order to provide relevant responses.
            </AlertDescription>
          </Alert>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <div className="text-sm text-gray-600 mb-3">
              <strong>What do you need to do?</strong>
            </div>
            
            <div className="space-y-2">
              {/* Go to Business Information button */}
              <Button
                onClick={() => window.location.href = '/knowledge-base'}
                className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <Upload className="w-4 h-4" />
                <span>Go to Business Information and setup the data</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>

            </div>
          </div >

          {/* Help section */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span>Quick Tips</span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <span>Upload documents, PDFs, or paste text directly</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <span>Include examples of desired responses</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <span>The more content you provide, the better responses</span>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
