"use client"

import * as React from "react"
import { 
  Download, FileText, File, Database, Calendar, Filter, 
  Check, X, Eye, Share, Link, Copy, Settings,
  ChevronDown, Search, Archive, Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { GeneratedCopy, Conversation, OutputPreset } from "@/types"

interface ExportManagerProps {
  conversations?: Conversation[]
  generatedCopy?: GeneratedCopy[]
  onExport?: (format: 'txt' | 'csv' | 'json', items: string[]) => void
  onCreateShareLink?: (items: string[]) => string
}

export function ExportManager({ 
  conversations = [], 
  generatedCopy = [],
  onExport,
  onCreateShareLink
}: ExportManagerProps) {
  const [selectedItems, setSelectedItems] = React.useState<string[]>([])
  const [exportFormat, setExportFormat] = React.useState<'txt' | 'csv' | 'json'>('txt')
  const [filterPreset, setFilterPreset] = React.useState<OutputPreset | 'all'>('all')
  const [searchQuery, setSearchQuery] = React.useState("")
  const [dateRange, setDateRange] = React.useState<'today' | 'week' | 'month' | 'all'>('all')

  // Filter generated copy based on search, preset, and date
  const filteredCopy = React.useMemo(() => {
    return generatedCopy.filter(copy => {
      const matchesSearch = copy.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPreset = filterPreset === 'all' || copy.preset === filterPreset
      
      const now = new Date()
      const copyDate = new Date(copy.createdAt)
      let matchesDate = true
      
      switch (dateRange) {
        case 'today':
          matchesDate = copyDate.toDateString() === now.toDateString()
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = copyDate >= weekAgo
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = copyDate >= monthAgo
          break
        case 'all':
        default:
          matchesDate = true
      }
      
      return matchesSearch && matchesPreset && matchesDate
    })
  }, [generatedCopy, searchQuery, filterPreset, dateRange])

  const handleSelectAll = () => {
    if (selectedItems.length === filteredCopy.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredCopy.map(copy => copy.id))
    }
  }

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleExport = () => {
    if (selectedItems.length > 0 && onExport) {
      onExport(exportFormat, selectedItems)
    }
  }

  const handleCreateShareLink = () => {
    if (selectedItems.length > 0 && onCreateShareLink) {
      const shareLink = onCreateShareLink(selectedItems)
      navigator.clipboard.writeText(shareLink)
      // TODO: Show toast notification
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getPresetLabel = (preset: OutputPreset) => {
    const labels: Record<OutputPreset, string> = {
      'facebook': 'Facebook',
      'google': 'Google Ads',
      'linkedin': 'LinkedIn',
      'x': 'X (Twitter)',
      'email-subject': 'Email Subject',
      'custom': 'Custom'
    }
    return labels[preset]
  }

  const getExportStats = () => {
    const selectedCopy = generatedCopy.filter(copy => selectedItems.includes(copy.id))
    const totalWords = selectedCopy.reduce((sum, copy) => 
      sum + copy.content.split(' ').length, 0
    )
    const presetCounts = selectedCopy.reduce((acc, copy) => {
      acc[copy.preset] = (acc[copy.preset] || 0) + 1
      return acc
    }, {} as Record<OutputPreset, number>)
    
    return { totalWords, presetCounts, totalItems: selectedCopy.length }
  }

  const stats = getExportStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Export & Sharing</h2>
          <p className="text-muted-foreground">
            Export copy as TXT/CSV/JSON or create shareable links
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{generatedCopy.length} total copies</Badge>
          <Badge variant="secondary">{selectedItems.length} selected</Badge>
        </div>
      </div>

      {/* Export Controls */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Export Settings</CardTitle>
          <CardDescription>
            Configure your export format and options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Export Format</label>
            <div className="flex space-x-4">
              {[
                { value: 'txt', label: 'Plain Text', icon: FileText },
                { value: 'csv', label: 'CSV Spreadsheet', icon: Database },
                { value: 'json', label: 'JSON Data', icon: File }
              ].map(format => (
                <button
                  key={format.value}
                  onClick={() => setExportFormat(format.value as typeof exportFormat)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    exportFormat === format.value
                      ? 'border-[#1ABC9C] bg-[#1ABC9C]/10 text-[#1ABC9C]'
                      : 'border-gray-700 hover:border-gray-600 text-gray-400'
                  }`}
                >
                  <format.icon className="h-4 w-4" />
                  <span className="text-sm">{format.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleExport}
              disabled={selectedItems.length === 0}
              className="flex items-center space-x-2 bg-[#1ABC9C] hover:bg-[#1ABC9C]/90 text-black"
            >
              <Download className="h-4 w-4" />
              <span>Export {selectedItems.length} items</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCreateShareLink}
              disabled={selectedItems.length === 0}
              className="flex items-center space-x-2"
            >
              <Share className="h-4 w-4" />
              <span>Create Share Link</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setSelectedItems([])}
              disabled={selectedItems.length === 0}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Clear Selection</span>
            </Button>
          </div>

          {/* Export Preview */}
          {selectedItems.length > 0 && (
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium mb-2">Export Preview</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Items:</span>
                  <span className="ml-2 font-medium">{stats.totalItems}</span>
                </div>
                <div>
                  <span className="text-gray-400">Words:</span>
                  <span className="ml-2 font-medium">{stats.totalWords.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Format:</span>
                  <span className="ml-2 font-medium">{exportFormat.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Size:</span>
                  <span className="ml-2 font-medium">~{Math.round(stats.totalWords * 6 / 1024)}KB</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search copy content..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
                />
              </div>
            </div>

            {/* Preset Filter */}
            <div className="min-w-[150px]">
              <select
                value={filterPreset}
                onChange={(e) => setFilterPreset(e.target.value as typeof filterPreset)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
              >
                <option value="all">All Presets</option>
                <option value="facebook">Facebook</option>
                <option value="google">Google Ads</option>
                <option value="linkedin">LinkedIn</option>
                <option value="x">X (Twitter)</option>
                <option value="email-subject">Email Subject</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="min-w-[120px]">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-[#1ABC9C] focus:ring-[#1ABC9C]"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copy Selection */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Generated Copy</CardTitle>
              <CardDescription>
                Select items to export or share
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedItems.length === filteredCopy.length && filteredCopy.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-400">
                Select All ({filteredCopy.length})
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredCopy.map((copy) => (
            <div
              key={copy.id}
              className={`p-4 rounded-lg border transition-colors ${
                selectedItems.includes(copy.id)
                  ? 'border-[#1ABC9C] bg-[#1ABC9C]/5'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={selectedItems.includes(copy.id)}
                  onCheckedChange={() => handleItemSelect(copy.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {getPresetLabel(copy.preset)}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDate(copy.createdAt)}
                    </span>
                    {copy.isSaved && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Saved
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                    {copy.content}
                  </p>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{copy.content.split(' ').length} words</span>
                    <span>•</span>
                    <span>{copy.content.length} characters</span>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(copy.content)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredCopy.length === 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-800 rounded-full">
                <Download className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery || filterPreset !== 'all' || dateRange !== 'all' 
                    ? "No matching copy found" 
                    : "No copy generated yet"
                  }
                </h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery || filterPreset !== 'all' || dateRange !== 'all'
                    ? "Try adjusting your search criteria or filters"
                    : "Start generating ad copy to see exportable content here"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}