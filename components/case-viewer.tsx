"use client"

import * as React from "react"
import { Upload, FileText, AlertCircle, CheckCircle, Clock, Scale, Users, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { formatFileSize, isValidLegalDocument } from "@/lib/utils"

interface CaseAnalysis {
  summary: string
  legalIssues: string[]
  successRate: number
  opposingArguments: string[]
  requiredDocuments: string[]
  similarCases: string[]
  recommendedJudges: Array<{
    name: string
    court: string
    successRate: number
    specialty: string[]
  }>
}

export function CaseViewer() {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [analysis, setAnalysis] = React.useState<CaseAnalysis | null>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    
    const validFiles = Array.from(files).filter(file => 
      isValidLegalDocument(file.name)
    )
    
    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) return
    
    setIsAnalyzing(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis({
        summary: "This case involves a contract dispute between Smith Construction and Johnson Enterprises regarding breach of a $2.5M construction agreement. The plaintiff alleges non-payment and scope changes, while the defendant claims substandard work quality. Key issues include interpretation of change order clauses and performance standards.",
        legalIssues: [
          "Breach of Contract",
          "Payment Disputes", 
          "Construction Defects",
          "Change Order Interpretation",
          "Damages Calculation"
        ],
        successRate: 78,
        opposingArguments: [
          "Work quality did not meet specifications",
          "Plaintiff failed to follow proper change order procedures",
          "Timeline delays were caused by plaintiff's actions",
          "Damages are overstated and lack proper documentation"
        ],
        requiredDocuments: [
          "Original Contract Agreement",
          "Change Order Documentation", 
          "Payment Records",
          "Quality Inspection Reports",
          "Communications Timeline"
        ],
        similarCases: [
          "Brown v. ABC Construction (2023) - 85% plaintiff success",
          "Metro Builders v. City Corp (2022) - 65% defendant success",
          "Quality Homes v. Investment LLC (2021) - 90% plaintiff success"
        ],
        recommendedJudges: [
          {
            name: "Judge Sarah Mitchell",
            court: "Superior Court District 5",
            successRate: 82,
            specialty: ["Construction Law", "Commercial Disputes"]
          },
          {
            name: "Judge Robert Chen", 
            court: "Circuit Court",
            successRate: 76,
            specialty: ["Contract Law", "Business Litigation"]
          }
        ]
      })
      setIsAnalyzing(false)
    }, 3000)
  }

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold legal-heading">Case Glancer</h1>
        <p className="text-muted-foreground legal-body">
          Upload case documents to get AI-powered analysis, insights, and strategic recommendations.
        </p>
      </div>

      {/* File Upload Section */}
      <Card className="legal-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Document Upload</span>
          </CardTitle>
          <CardDescription>
            Upload legal documents (PDF, DOC, DOCX, TXT) for AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`upload-area ${isDragging ? 'dragover' : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF, DOC, DOCX, TXT files up to 10MB each
            </p>
            <Input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Select Files
              </label>
            </Button>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Files:</h4>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                    Remove
                  </Button>
                </div>
              ))}
              
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="legal-button w-full mt-4"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Documents...
                  </>
                ) : (
                  <>
                    <Scale className="h-4 w-4 mr-2" />
                    Analyze Case
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Case Summary */}
          <Card className="legal-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Case Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="legal-body mb-4">{analysis.summary}</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Success Probability:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    analysis.successRate >= 70 ? 'bg-green-100 text-green-800' :
                    analysis.successRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {analysis.successRate}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Issues */}
          <Card className="legal-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span>Identified Legal Issues</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.legalIssues.map((issue, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="legal-body">{issue}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Required Documents */}
          <Card className="legal-shadow">
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.requiredDocuments.map((doc, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="legal-body">{doc}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Similar Cases */}
          <Card className="legal-shadow">
            <CardHeader>
              <CardTitle>Similar Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.similarCases.map((case_, index) => (
                  <li key={index} className="p-3 border rounded-lg">
                    <p className="legal-body text-sm">{case_}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Opposing Arguments */}
          <Card className="legal-shadow lg:col-span-2">
            <CardHeader>
              <CardTitle>Potential Opposing Arguments</CardTitle>
              <CardDescription>
                Prepare for these counterarguments from the opposing party
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {analysis.opposingArguments.map((argument, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-red-50 border-red-200">
                    <p className="legal-body text-sm">{argument}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Judges */}
          <Card className="legal-shadow lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Recommended Judges</span>
              </CardTitle>
              <CardDescription>
                Judges with relevant experience and favorable track records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {analysis.recommendedJudges.map((judge, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium legal-heading">{judge.name}</h4>
                        <p className="text-sm text-muted-foreground">{judge.court}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {judge.successRate}% Success Rate
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {judge.specialty.map((spec, specIndex) => (
                        <span key={specIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 