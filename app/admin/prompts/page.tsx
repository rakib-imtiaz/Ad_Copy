'use client';

import { motion } from 'framer-motion';
import { FileText, PlusCircle, Edit, Eye, Briefcase } from 'lucide-react';

const agents: any[] = [];

const versionHistory: any[] = [];

const PromptsPage = () => {
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
            Prompt Editor
          </motion.h1>
          <motion.p 
            className="text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Edit and version control agent prompts
          </motion.p>
        </div>
        <motion.button 
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Edit size={18} />
          <span>Edit</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Select Agent Panel */}
        <motion.div 
          className="bg-white rounded-xl shadow p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Agent</h2>
          <div className="space-y-3">
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <Briefcase size={20} className="text-gray-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-500">{agent.version}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Prompt Template Panel */}
        <motion.div 
          className="bg-white rounded-xl shadow p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Prompt Template</h2>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors">
                Version 1
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center space-x-1">
                <Eye size={16} />
                <span>Preview</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Prompt Template Text Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Content
              </label>
              <textarea
                className="w-full h-40 bg-gray-600 text-white p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your prompt template here..."
              />
            </div>

            {/* Template Variables */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Variables</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Variable name"
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Required</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Variable name"
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Required</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Variable name"
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="w-4 h-4 border border-gray-300 rounded"></div>
                </div>
              </div>
            </div>

            {/* Version History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Version History</h3>
              <div className="space-y-2">
                {versionHistory.map((version) => (
                  <motion.div
                    key={version.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      version.active 
                        ? 'bg-indigo-50 border border-indigo-200' 
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${version.active ? 'text-indigo-600' : 'text-gray-700'}`}>
                        {version.version}
                      </span>
                      <span className="text-sm text-gray-500">{version.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default PromptsPage;