// Populate Data Button Component
// A reusable button for populating forms with existing knowledge base data

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { KnowledgeBaseService } from "@/lib/services/knowledge-base-service"

interface PopulateDataButtonProps {
  onSuccess?: () => void
  onError?: (message: string) => void
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "secondary" | "ghost"
}

export function PopulateDataButton({ 
  onSuccess, 
  onError, 
  className,
  size = "default",
  variant = "default"
}: PopulateDataButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handlePopulateData = async () => {
    setIsLoading(true)
    
    try {
      console.log('🔄 Starting knowledge base data population...')
      
      const success = await KnowledgeBaseService.populateFormWithKnowledgeBase()
      
      if (success) {
        console.log('✅ Knowledge base data populated successfully')
        onSuccess?.()
      } else {
        console.log('❌ Failed to populate knowledge base data')
        onError?.('No Business Info data found to populate')
      }
      
    } catch (error: any) {
      console.error('Error populating data:', error)
      onError?.(error.message || 'Failed to populate data')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePopulateData}
      disabled={isLoading}
      size={size}
      variant={variant}
      className={`bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black border-0 shadow-sm ${className || ''}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading Data...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Populate with Existing Data
        </>
      )}
    </Button>
  )
}
