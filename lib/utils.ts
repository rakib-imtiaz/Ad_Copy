import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Legal platform specific utilities
export function formatCaseNumber(caseId: string): string {
  return `CASE-${caseId.toUpperCase().slice(0, 8)}`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2)
}

export function isValidLegalDocument(filename: string): boolean {
  const validExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf']
  const extension = getFileExtension(filename).toLowerCase()
  return validExtensions.includes(extension)
}

export function generateDocumentId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function calculateSuccessRate(wins: number, total: number): number {
  return total === 0 ? 0 : Math.round((wins / total) * 100)
}