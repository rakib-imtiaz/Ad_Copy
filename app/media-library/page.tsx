"use client"

import { MediaLibrary } from "@/components/media-library"
import { sampleMediaItems } from "@/lib/sample-data"

export default function MediaLibraryPage() {
  // Enhanced sample data
  const mockMediaItems = sampleMediaItems

  const handleUpload = async (files: File[]) => {
    console.log("Uploading files:", files)
    // In a real app, you would upload to your backend here
  }

  const handleTranscribe = async (mediaId: string) => {
    console.log("Transcribing media:", mediaId)
    // In a real app, you would trigger transcription here
  }

  const handleScrapeUrl = async (url: string) => {
    console.log("Scraping URL:", url)
    // In a real app, you would scrape the URL here
  }

  const handleDelete = async (mediaId: string) => {
    console.log("Deleting media:", mediaId)
    // In a real app, you would delete from your backend here
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <div className="p-6">
        <MediaLibrary 
          mediaItems={mockMediaItems}
          onUpload={handleUpload}
          onTranscribe={handleTranscribe}
          onScrapeUrl={handleScrapeUrl}
          onDelete={handleDelete}
          isLoading={false}
        />
      </div>
    </div>
  )
}