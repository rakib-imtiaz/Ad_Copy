'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  Download, 
  Calendar, 
  Users, 
  Activity, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Bot,
  Eye,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Mock data for the analytics dashboard
const usageByAgent = [
  { name: 'Google Ads Generator', usage: '2.4K', percentage: 85, trend: 'up', change: '+12%' },
  { name: 'SEO Content Writer', usage: '1.8K', percentage: 65, trend: 'up', change: '+8%' },
  { name: 'Social Media Creator', usage: '1.2K', percentage: 45, trend: 'down', change: '-3%' },
  { name: 'Email Campaign Writer', usage: '890', percentage: 35, trend: 'up', change: '+15%' },
  { name: 'Product Description AI', usage: '720', percentage: 28, trend: 'stable', change: '+1%' },
];

const userActivity = [
  { metric: 'Active Users', value: '1,234', icon: Users, trend: 'up', change: '+12%' },
  { metric: 'Total Sessions', value: '5,678', icon: Activity, trend: 'up', change: '+8%' },
  { metric: 'Avg. Session Time', value: '4m 32s', icon: Zap, trend: 'down', change: '-5%' },
  { metric: 'Bounce Rate', value: '23%', icon: TrendingDown, trend: 'down', change: '-8%' },
];

const revenueData = [
  { metric: 'Total Revenue', value: '$12,450', icon: DollarSign, trend: 'up', change: '+18%' },
  { metric: 'Monthly Recurring', value: '$8,920', icon: TrendingUp, trend: 'up', change: '+22%' },
  { metric: 'Avg. Order Value', value: '$34.50', icon: BarChart2, trend: 'up', change: '+5%' },
];

const performance = [
  { metric: 'API Response Time', value: '120ms', status: 'good', trend: 'down' },
  { metric: 'System Uptime', value: '99.9%', status: 'good', trend: 'stable' },
  { metric: 'Error Rate', value: '0.02%', status: 'good', trend: 'down' },
  { metric: 'Database Load', value: '45%', status: 'good', trend: 'stable' },
  { metric: 'Memory Usage', value: '68%', status: 'warning', trend: 'up' },
];

const topRegions = [
  { region: 'United States', users: '45%', value: 560 },
  { region: 'United Kingdom', users: '18%', value: 224 },
  { region: 'Germany', users: '12%', value: 149 },
  { region: 'Canada', users: '8%', value: 99 },
  { region: 'Australia', users: '6%', value: 75 },
  { region: 'Others', users: '11%', value: 137 },
];

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor platform performance, user engagement, and revenue metrics
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLoading(true)}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw size={16} className={cn(loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button className="gap-2">
            <Download size={16} />
            Export
          </Button>
        </motion.div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* User Activity Metrics */}
        {userActivity.map((item, index) => (
          <motion.div
            key={item.metric}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.metric}
                </CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <div className={cn(
                  "flex items-center text-xs",
                  item.trend === 'up' ? 'text-green-600' : 
                  item.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                )}>
                  {item.trend === 'up' ? <TrendingUp className="mr-1 h-3 w-3" /> :
                   item.trend === 'down' ? <TrendingDown className="mr-1 h-3 w-3" /> : null}
                  {item.change} from last period
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Financial performance and growth metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {revenueData.map((item, index) => (
                <motion.div
                  key={item.metric}
                  className="space-y-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">{item.metric}</span>
                  </div>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {item.change} vs last month
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analytics Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agents">Agent Performance</TabsTrigger>
            <TabsTrigger value="regions">Geographic Data</TabsTrigger>
            <TabsTrigger value="performance">System Health</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Usage by Agent
                </CardTitle>
                <CardDescription>Most popular AI agents and their usage statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageByAgent.map((agent, index) => (
                    <motion.div
                      key={agent.name}
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{agent.name}</span>
                          <Badge 
                            variant={
                              agent.trend === 'up' ? 'default' :
                              agent.trend === 'down' ? 'destructive' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {agent.change}
                          </Badge>
                        </div>
                        <span className="text-sm font-semibold">{agent.usage} uses</span>
                      </div>
                      <div className="w-full bg-secondary/20 rounded-full h-2">
                        <motion.div
                          className={cn(
                            "h-2 rounded-full",
                            agent.trend === 'up' ? 'bg-green-500' :
                            agent.trend === 'down' ? 'bg-red-500' : 'bg-primary'
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${agent.percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="regions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>User distribution across different regions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topRegions.map((region, index) => (
                    <motion.div
                      key={region.region}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">{index + 1}</span>
                        </div>
                        <span className="font-medium">{region.region}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{region.users}</Badge>
                        <span className="text-sm text-muted-foreground">{region.value} users</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  System Performance
                </CardTitle>
                <CardDescription>Real-time system health and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {performance.map((item, index) => (
                    <motion.div
                      key={item.metric}
                      className="flex justify-between items-center p-4 rounded-lg border"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="space-y-1">
                        <span className="text-sm font-medium">{item.metric}</span>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              item.status === 'good' ? 'default' :
                              item.status === 'warning' ? 'secondary' : 'destructive'
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "text-lg font-bold",
                          item.status === 'good' ? 'text-green-600' : 
                          item.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        )}>
                          {item.value}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Chart Placeholder */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>Platform usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-muted/20 rounded-lg border-2 border-dashed border-muted flex items-center justify-center">
              <div className="text-center">
                <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Interactive Chart Coming Soon</p>
                <p className="text-xs text-muted-foreground">Real-time analytics and trend visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
