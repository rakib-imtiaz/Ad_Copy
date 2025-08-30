'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Bot, FileText, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { authService } from '@/lib/auth-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalUsers: number;
  activeAgents: number;
  referralCodes: number;
  loading: boolean;
  error: string | null;
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeAgents: 0,
    referralCodes: 0,
    loading: true,
    error: null
  });

  const fetchDashboardStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      const token = authService.getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔍 Dashboard - Starting data fetch with token:', !!token);

      // Helper function to safely parse JSON responses
      const safeJsonParse = async (response: Response, endpoint: string) => {
        const text = await response.text();
        console.log(`📡 ${endpoint} - Response status:`, response.status);
        console.log(`📡 ${endpoint} - Response text:`, text);
        
        if (!text.trim()) {
          console.warn(`⚠️ ${endpoint} - Empty response`);
          return null;
        }
        try {
          const parsed = JSON.parse(text);
          console.log(`✅ ${endpoint} - Parsed data:`, parsed);
          return parsed;
        } catch (parseError) {
          console.warn(`❌ ${endpoint} - Failed to parse JSON:`, text);
          return null;
        }
      };

             // Fetch users count
       console.log('👥 Dashboard - Fetching users...');
       const usersResponse = await fetch(`/api/admin/users?accessToken=${encodeURIComponent(token)}`);
       const usersData = await safeJsonParse(usersResponse, 'Users API');
       const totalUsers = Array.isArray(usersData) ? usersData.length : 0;
       console.log('👥 Dashboard - Total users:', totalUsers);

       // Fetch agents count
       console.log('🤖 Dashboard - Fetching agents...');
       const agentsResponse = await fetch(`/api/admin/agent-list?accessToken=${encodeURIComponent(token)}&t=${Date.now()}`);
       const agentsData = await safeJsonParse(agentsResponse, 'Agents API');
       const agents = Array.isArray(agentsData) ? agentsData : (agentsData?.agents || []);
       console.log('🤖 Dashboard - Raw agents data:', agents);
       console.log('🤖 Dashboard - Agent is_active values:', agents.map((agent: any) => ({ id: agent.agent_id, is_active: agent.is_active })));
       const activeAgents = agents.filter((agent: any) => agent.is_active === true).length;
       console.log('🤖 Dashboard - Total agents:', agents.length, 'Active agents:', activeAgents);

       // Fetch referral codes count
       console.log('📋 Dashboard - Fetching referral codes...');
       const referralsResponse = await fetch(`/api/admin/view-referral-codes?accessToken=${encodeURIComponent(token)}`);
       const referralsData = await safeJsonParse(referralsResponse, 'Referrals API');
       const referralCodes = Array.isArray(referralsData) ? referralsData.length : 0;
       console.log('📋 Dashboard - Total referral codes:', referralCodes);

              console.log('📊 Dashboard - Final stats:', {
         totalUsers,
         activeAgents,
         referralCodes
       });

       setStats({
         totalUsers,
         activeAgents,
         referralCodes,
         loading: false,
         error: null
       });
    } catch (error: any) {
      console.error('❌ Error fetching dashboard stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch dashboard data'
      }));
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.loading ? '...' : stats.totalUsers.toLocaleString(),
      change: '+0%',
      trend: 'up' as const,
      icon: Users,
      color: 'indigo'
    },
    {
      title: 'Active Agents',
      value: stats.loading ? '...' : stats.activeAgents.toString(),
      change: '+0%',
      trend: 'up' as const,
      icon: Bot,
      color: 'green'
    },
    {
      title: 'Referral Codes',
      value: stats.loading ? '...' : stats.referralCodes.toString(),
      change: '+0%',
      trend: 'up' as const,
      icon: FileText,
      color: 'blue'
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Button 
            onClick={fetchDashboardStats}
            disabled={stats.loading}
            variant="default"
            size="sm"
            className="gap-2"
          >
            <RefreshCw size={16} className={cn(stats.loading && 'animate-spin')} />
            Refresh
          </Button>
        </motion.div>
      </div>

      {/* Error Alert */}
      {stats.error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-4"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">Error loading dashboard data</h3>
              <div className="mt-2 text-sm text-destructive/80">
                <p>{stats.error}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={item}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={cn(
                  "p-2 rounded-md",
                  stat.color === 'indigo' && "bg-gray-100 text-gray-700",
                  stat.color === 'green' && "bg-gray-100 text-gray-700", 
                  stat.color === 'blue' && "bg-gray-100 text-gray-700"
                )}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span className={cn(
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {stat.change}
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Admin Features Overview */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Admin Features Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="h-5 w-5 text-gray-700" />
                    <h3 className="font-semibold">Agent Management</h3>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                      Create new agents
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                      Modify agent system prompts
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                      Manage agent configurations
                    </li>
                  </ul>
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-gray-700" />
                    <h3 className="font-semibold">User Management</h3>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                      View user records with filters
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                      Create admin users
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                      Delete users
                    </li>
                  </ul>
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-gray-700" />
                    <h3 className="font-semibold">Referral System</h3>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                      Create referral codes
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                      Track referral usage
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                      Manage referral rewards
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.a 
                href="/admin/agents" 
                className="block p-3 rounded-lg border transition-colors hover:bg-accent"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-gray-700" />
                  <div>
                    <h3 className="font-semibold text-sm">Manage Agents</h3>
                    <p className="text-xs text-muted-foreground">View and manage AI agents</p>
                  </div>
                </div>
              </motion.a>
              
              <motion.a 
                href="/admin/users" 
                className="block p-3 rounded-lg border transition-colors hover:bg-accent"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-700" />
                  <div>
                    <h3 className="font-semibold text-sm">Manage Users</h3>
                    <p className="text-xs text-muted-foreground">View and manage user accounts</p>
                  </div>
                </div>
              </motion.a>
              
              <motion.a 
                href="/admin/referrals" 
                className="block p-3 rounded-lg border transition-colors hover:bg-accent"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-700" />
                  <div>
                    <h3 className="font-semibold text-sm">Manage Referrals</h3>
                    <p className="text-xs text-muted-foreground">View and manage referral codes</p>
                  </div>
                </div>
              </motion.a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;