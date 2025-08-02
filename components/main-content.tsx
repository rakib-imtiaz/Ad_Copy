"use client"

import * as React from "react"
import { 
  FileText, 
  PenTool, 
  Search, 
  MessageCircle, 
  FolderOpen, 
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function MainContent() {
  const recentCases = [
    {
      id: "CASE-001",
      title: "Smith vs. Johnson Contract Dispute",
      status: "Active",
      lastUpdate: "2 hours ago",
      priority: "High"
    },
    {
      id: "CASE-002", 
      title: "Thompson Immigration Case",
      status: "Review",
      lastUpdate: "1 day ago",
      priority: "Medium"
    },
    {
      id: "CASE-003",
      title: "Corporate Merger Documentation",
      status: "Completed",
      lastUpdate: "3 days ago", 
      priority: "Low"
    }
  ]

  const quickActions = [
    {
      title: "New Case Analysis",
      description: "Upload documents and get AI-powered case insights",
      icon: FileText,
      href: "/case-viewer",
      color: "bg-blue-500"
    },
    {
      title: "Draft Document",
      description: "Generate legal documents with AI assistance",
      icon: PenTool,
      href: "/document-drafter",
      color: "bg-green-500"
    },
    {
      title: "Legal Research",
      description: "Ask questions and get legal research with citations",
      icon: Search,
      href: "/research",
      color: "bg-purple-500"
    },
    {
      title: "Client Interview",
      description: "Start an AI-powered client intake session",
      icon: MessageCircle,
      href: "/client-intake",
      color: "bg-orange-500"
    }
  ]

  const stats = [
    {
      title: "Active Cases",
      value: "24",
      change: "+12%",
      icon: FolderOpen
    },
    {
      title: "Success Rate",
      value: "94%",
      change: "+5%",
      icon: TrendingUp
    },
    {
      title: "Avg. Case Time",
      value: "45 days",
      change: "-8%",
      icon: Clock
    },
    {
      title: "Client Satisfaction", 
      value: "4.8/5",
      change: "+0.2",
      icon: CheckCircle
    }
  ]

  return (
    <main className="flex-1 overflow-auto p-6 lg:p-8">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">
            Welcome back, John
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your cases today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}>{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Quick Actions
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="glass group cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 group-hover:bg-primary/20 transition-colors`}>
                    <action.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>
                    {action.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Cases & Notifications */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Recent Cases</CardTitle>
                <CardDescription>
                  Your most recently updated cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCases.map((case_) => (
                    <div key={case_.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
                      <div className="space-y-1">
                        <p className="font-medium">{case_.title}</p>
                        <p className="text-sm text-muted-foreground">{case_.id}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center space-x-2">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            case_.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                            case_.status === 'Review' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {case_.status}
                          </span>
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            case_.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                            case_.priority === 'Medium' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {case_.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{case_.lastUpdate}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6">
                  <Button variant="outline" className="w-full">
                    View All Cases
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="glass">
              <CardHeader>
                <CardTitle>Alerts & Notifications</CardTitle>
                <CardDescription>
                  Important updates and deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/50">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Court Filing Due</p>
                      <p className="text-xs text-muted-foreground">Smith vs. Johnson - Due in 2 days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/50">
                    <Clock className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Client Meeting</p>
                      <p className="text-xs text-muted-foreground">Thompson case review - Today 3:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/50">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Document Signed</p>
                      <p className="text-xs text-muted-foreground">Merger agreement completed</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
} 