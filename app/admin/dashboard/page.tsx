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
    title: 'Approved Drafts',
    value: '8,942',
    change: '+20%',
    trend: 'up',
    icon: FileText,
    color: 'blue'
  },
  {
    title: 'Active Agents',
    value: '58',
    change: '-2%',
    trend: 'down',
    icon: Bot,
    color: 'green'
  },
  {
    title: 'API Usage',
    value: '1.2M',
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Overview</h2>
          <div className="h-80 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
            <BarChart size={40} className="text-gray-400"/>
            <p className="ml-4 text-gray-400">Usage chart placeholder</p>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl shadow p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">System Uptime</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">99.9%</span>
                <span className="text-xs text-gray-500">Target: 99.5%</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Response Latency</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">2.3s</span>
                <span className="text-xs text-gray-500">Target: &lt;3.0s</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Error Rate</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">0.3%</span>
                <span className="text-xs text-gray-500">Target: &lt;1.0%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminDashboardPage;