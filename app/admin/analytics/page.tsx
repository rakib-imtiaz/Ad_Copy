'use client';

import { motion } from 'framer-motion';
import { BarChart2, Download, Calendar, Users, Activity, Zap } from 'lucide-react';

const usageByAgent: any[] = [];

const userActivity: any[] = [];

const performance: any[] = [];

const AnalyticsPage = () => {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <motion.h1 
            className="text-2xl font-bold text-gray-900"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Analytics
          </motion.h1>
          <motion.p 
            className="text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Monitor usage and performance metrics
          </motion.p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar size={18} className="text-gray-500"/>
            <select className="bg-gray-50 border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-indigo-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <motion.button 
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Download size={18} />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Usage by Agent */}
        <motion.div 
          className="bg-white rounded-xl shadow p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <BarChart2 size={24} className="text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Usage by Agent</h2>
          </div>
          
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
                  <span className="text-sm font-medium text-gray-700">{agent.name}</span>
                  <span className="text-sm font-semibold text-gray-900">{agent.usage}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-indigo-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* User Activity */}
        <motion.div 
          className="bg-white rounded-xl shadow p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <Users size={24} className="text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">User Activity</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {userActivity.map((item, index) => (
              <motion.div
                key={item.metric}
                className="bg-gray-50 p-4 rounded-lg text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <item.icon size={24} className="mx-auto text-indigo-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-sm text-gray-500">{item.metric}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Performance */}
        <motion.div 
          className="bg-white rounded-xl shadow p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <Zap size={24} className="text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Performance</h2>
          </div>
          
          <div className="space-y-4">
            {performance.map((item, index) => (
              <motion.div
                key={item.metric}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <span className="text-sm text-gray-600">{item.metric}</span>
                <span className={`font-semibold ${
                  item.status === 'good' ? 'text-green-600' : 
                  item.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {item.value}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Chart Placeholder */}
      <motion.div 
        className="mt-8 bg-white rounded-xl shadow p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Trends</h2>
        <div className="h-80 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <BarChart2 size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Interactive chart will be displayed here</p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AnalyticsPage;
