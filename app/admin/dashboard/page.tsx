'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Users, Bot, FileText, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { authService } from '@/lib/auth-service';

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
    <>
      <div className="flex justify-between items-center mb-8">
        <motion.h1 
          className="text-2xl font-bold text-gray-900"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          System Overview
        </motion.h1>
        <motion.button 
          onClick={fetchDashboardStats}
          disabled={stats.loading}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <RefreshCw size={18} className={stats.loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </motion.button>
      </div>

      {stats.error && (
        <motion.div 
          className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-medium">Error loading dashboard data:</p>
          <p className="text-sm">{stats.error}</p>
        </motion.div>
      )}

             <motion.div 
         className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {statsCards.map((stat) => (
          <motion.div
            key={stat.title}
            className="bg-white rounded-xl shadow p-6"
            variants={item}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                <div className={`flex items-center mt-2 ${
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                  <span className="ml-1 text-sm">{stat.change} from last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`text-${stat.color}-600`} size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          className="bg-white rounded-xl shadow p-6 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Features Overview</h2>
                     <div className="grid grid-cols-1 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Agent Management</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Create new agents</li>
                <li>• Modify agent system prompts</li>
                <li>• Manage agent configurations</li>
              </ul>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View user records with filters</li>
                <li>• Create admin users</li>
                <li>• Delete users</li>
              </ul>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Referral System</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Create referral codes</li>
                <li>• Track referral usage</li>
                <li>• Manage referral rewards</li>
              </ul>
            </div>
            
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl shadow p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                     <div className="space-y-4">
             <a href="/admin/agents" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
               <h3 className="font-semibold text-gray-900">Manage Agents</h3>
               <p className="text-sm text-gray-600">View and manage AI agents</p>
             </a>
             <a href="/admin/users" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
               <h3 className="font-semibold text-gray-900">Manage Users</h3>
               <p className="text-sm text-gray-600">View and manage user accounts</p>
             </a>
             <a href="/admin/referrals" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
               <h3 className="font-semibold text-gray-900">Manage Referrals</h3>
               <p className="text-sm text-gray-600">View and manage referral codes</p>
             </a>
            
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminDashboardPage;