'use client';

import { motion } from 'framer-motion';

type ActivityItem = {
  id: string;
  user: {
    initial: string;
    name: string;
  };
  action: string;
  time: string;
};

const recentActivity: ActivityItem[] = [
  {
    id: '1',
    user: { initial: 'JD', name: 'John Doe' },
    action: 'Created agent "Email Copy Specialist"',
    time: '2 hours ago'
  },
  {
    id: '2',
    user: { initial: 'A', name: 'Admin' },
    action: 'Updated prompt for "Google Ads Expert"',
    time: '4 hours ago'
  },
  {
    id: '3',
    user: { initial: 'SW', name: 'Sarah Wilson' },
    action: 'Registered new account',
    time: '6 hours ago'
  },
  {
    id: '4',
    user: { initial: 'A', name: 'Admin' },
    action: 'Updated brand settings',
    time: '1 day ago'
  }
];

const systemStatus = [
  { name: 'API Status', value: 'Online', status: 'good' },
  { name: 'Response Time', value: '2.3s', status: 'good' },
  { name: 'Uptime', value: '99.9%', status: 'good' },
];

export const RightSidebar = () => {
  return (
    <motion.aside 
      className="w-80 bg-white p-6 shadow-md overflow-y-auto"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((item) => (
            <motion.div 
              key={item.id}
              className="flex items-start space-x-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-600`}>
                {item.user.initial}
              </div>
              <div>
                <p className="font-medium text-gray-800">{item.user.name}</p>
                <p className="text-sm text-gray-500">{item.action}</p>
                <p className="text-xs text-gray-400 mt-1">{item.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          {systemStatus.map((item, index) => (
            <div key={item.name} className={`flex justify-between py-2 ${index !== systemStatus.length - 1 ? 'border-b border-gray-200' : ''}`}>
              <span className="text-gray-600">{item.name}</span>
              <span className={`font-medium ${item.status === 'good' ? 'text-green-600' : 'text-red-600'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          Refresh
        </button>
        <button className="w-full mt-3 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          Export Data
        </button>
      </div>
    </motion.aside>
  );
};
