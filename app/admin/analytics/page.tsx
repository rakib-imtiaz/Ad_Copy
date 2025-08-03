'use client';

import { motion } from 'framer-motion';
import { BarChart2, Download } from 'lucide-react';

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
            Usage analytics
          </motion.p>
        </div>
        <motion.button 
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Download size={18} />
          <span>Export Data</span>
        </motion.button>
      </div>

      <motion.div 
        className="bg-white rounded-xl shadow p-6 flex items-center justify-center h-80"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center">
          <BarChart2 size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Usage Analytics</h2>
          <p className="text-gray-500 mt-2">This is a placeholder for the Analytics page</p>
        </div>
      </motion.div>
    </>
  );
};

export default AnalyticsPage;
