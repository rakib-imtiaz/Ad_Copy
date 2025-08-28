'use client';

import { motion } from 'framer-motion';
import { BarChart, Users, Bot, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const statsCards = [
  {
    title: 'Total Users',
    value: '1,250',
    change: '+15%',
    trend: 'up',
    icon: Users,
    color: 'indigo'
  },
  {
    title: 'Active Agents',
    value: '58',
    change: '+5%',
    trend: 'up',
    icon: Bot,
    color: 'green'
  },
  {
    title: 'Referral Codes',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: FileText,
    color: 'blue'
  },
  {
    title: 'Token Price',
    value: '$0.05',
    change: '+8%',
    trend: 'up',
    icon: BarChart,
    color: 'purple'
  }
];

const AdminDashboardPage = () => {
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
      <motion.h1 
        className="text-2xl font-bold text-gray-900 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        System Overview
      </motion.h1>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
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
          <div className="grid grid-cols-2 gap-4">
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
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Token Pricing</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Set token prices</li>
                <li>• View current pricing</li>
                <li>• Monitor token usage</li>
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
            <a href="/admin/agents/create" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900">Create Agent</h3>
              <p className="text-sm text-gray-600">Add new AI agent to the system</p>
            </a>
            <a href="/admin/users" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-600">View and manage user accounts</p>
            </a>
            <a href="/admin/referrals/create" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900">Create Referral</h3>
              <p className="text-sm text-gray-600">Generate new referral codes</p>
            </a>
            <a href="/admin/tokens" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900">Token Pricing</h3>
              <p className="text-sm text-gray-600">Set and view token prices</p>
            </a>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminDashboardPage;