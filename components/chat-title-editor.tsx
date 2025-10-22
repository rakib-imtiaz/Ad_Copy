import React, { useState, useRef, useEffect } from 'react'
import { Check, X } from 'lucide-react'

interface ChatTitleEditorProps {
  initialTitle: string
  sessionId: string
  onSave: (sessionId: string, newTitle: string) => Promise<void>
  onCancel: () => void
  className?: string
}

export function ChatTitleEditor({ 
  initialTitle, 
  sessionId, 
  onSave, 
  onCancel, 
  className = '' 
}: ChatTitleEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  const handleSave = async () => {
    console.log('🔄 [ChatTitleEditor] Save triggered')
    console.log('🔄 [ChatTitleEditor] Current title:', title)
    console.log('🔄 [ChatTitleEditor] Initial title:', initialTitle)
    console.log('🔄 [ChatTitleEditor] Session ID:', sessionId)
    
    if (title.trim() === initialTitle.trim() || !title.trim()) {
      console.log('🔄 [ChatTitleEditor] No changes or empty title, canceling')
      onCancel()
      return
    }

    console.log('🔄 [ChatTitleEditor] Starting optimistic update...')
    // Close the editor immediately for instant feedback
    onCancel()
    
    // Run the API call in the background
    console.log('🔄 [ChatTitleEditor] Starting background save process...')
    try {
      await onSave(sessionId, title.trim())
      console.log('✅ [ChatTitleEditor] Background save completed successfully')
    } catch (error) {
      console.error('❌ [ChatTitleEditor] Background save failed:', error)
      // Note: We could show a toast notification here if the save fails
      // For now, we'll just log the error since the UI already updated
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  const handleBlur = () => {
    // Auto-save on blur if title has changed
    if (title.trim() !== initialTitle.trim() && title.trim()) {
      handleSave()
    } else {
      onCancel()
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={isSaving}
        className="flex-1 bg-transparent border-none outline-none text-xs font-normal text-white placeholder-gray-400 min-w-0"
        placeholder="Enter chat title..."
        maxLength={100}
      />
      <div className="flex items-center gap-1">
        <button
          onClick={handleSave}
          disabled={isSaving || title.trim() === initialTitle.trim() || !title.trim()}
          className="p-0.5 text-green-400 hover:text-green-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          title="Save"
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="p-0.5 text-red-400 hover:text-red-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          title="Cancel"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
