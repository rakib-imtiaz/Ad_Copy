"use client"

import * as React from "react"
import { 
  AlertCircle, 
  X,
  RefreshCw
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ChatSessionErrorDialogProps {
  isOpen: boolean
  onClose: () => void
  onRetry?: () => void
  error: string
  errorType?: 'session_creation' | 'network' | 'authentication' | 'server' | 'unknown'
  isLoading?: boolean
}

export function ChatSessionErrorDialog({
  isOpen,
  onClose,
  onRetry,
  error,
  errorType = 'unknown',
  isLoading = false
}: ChatSessionErrorDialogProps) {
  
  // Map error types to user-friendly messages
  const getUserFriendlyMessage = () => {
    switch (errorType) {
      case 'session_creation':
        return {
          title: "Unable to Start Conversation",
          description: "We couldn't set up a new chat session. This might be due to a temporary service issue.",
          action: "Please try again in a moment. If the problem continues, refresh the page or contact support."
        }
      case 'network':
        return {
          title: "Connection Problem",
          description: "We're having trouble connecting to our servers. Please check your internet connection.",
          action: "Make sure you're connected to the internet and try again."
        }
      case 'authentication':
        return {
          title: "Authentication Required",
          description: "Your session has expired. Please sign in again to continue.",
          action: "You'll be redirected to the sign-in page shortly."
        }
      case 'server':
        return {
          title: "Service Temporarily Unavailable",
          description: "Our servers are experiencing issues right now. We're working to fix this.",
          action: "Please try again in a few moments. If the problem persists, contact our support team."
        }
      default:
        return {
          title: "Something Went Wrong",
          description: "An unexpected error occurred while trying to start your conversation.",
          action: "Please try again. If the issue continues, refresh the page or contact support."
        }
    }
  }

  const message = getUserFriendlyMessage()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {message.title}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {message.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Main error message */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {message.action}
            </AlertDescription>
          </Alert>

          {/* Action buttons */}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            {onRetry && (
              <Button
                onClick={onRetry}
                disabled={isLoading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Trying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

