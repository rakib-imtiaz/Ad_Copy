'use client';

import { motion } from 'framer-motion';
import { Bot, PlusCircle, MoreHorizontal, Edit, Eye, Star, Globe } from 'lucide-react';

const agents = [
  {
    id: '1',
    name: 'Copywriting Agent',
    description: 'Specialized in creating compelling ad copy and marketing content',
    version: '2.1.0',
    usage: '1,234',
    status: 'active',
    scope: 'Marketing',
    systemPrompt: 'You are a professional copywriter specializing in creating high-converting ad copy...'
  },
  {
    id: '2',
    name: 'Social Media Agent',
    description: 'Creates engaging social media posts and captions',
    version: '1.8.2',
    usage: '856',
    status: 'active',
    scope: 'Social',
    systemPrompt: 'You are a social media expert who creates viral-worthy content...'
  },
  {
    id: '3',
    name: 'Email Marketing Agent',
    description: 'Generates email campaigns and subject lines',
    version: '1.5.0',
    usage: '432',
    status: 'inactive',
    scope: 'Email',
    systemPrompt: 'You are an email marketing specialist focused on high open rates...'
  }
];

const AgentsPage = () => {
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
        <div>
          <motion.h1 
            className="text-2xl font-bold text-gray-900"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Agents
          </motion.h1>
          <motion.p 
            className="text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Create agents and modify agent system prompts
          </motion.p>
        </div>
        <motion.button 
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <PlusCircle size={18} />
          <span>Create Agent</span>
        </motion.button>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {agents.map((agent) => (
          <motion.div
            key={agent.id}
            className="bg-white rounded-xl shadow p-6 border border-gray-200"
            variants={item}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <Bot size={24} className="text-indigo-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                      <Globe size={12} className="mr-1" />
                      {agent.scope}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {agent.status}
                    </span>
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-4">{agent.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Version</p>
                <p className="text-lg font-semibold text-gray-900">{agent.version}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Usage</p>
                <p className="text-lg font-semibold text-gray-900">{agent.usage}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">System Prompt</p>
                <p className="text-sm text-gray-700 line-clamp-2">{agent.systemPrompt}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors">
                <Edit size={16} />
                <span className="text-sm">Edit Prompt</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors">
                <Eye size={16} />
                <span className="text-sm">View Details</span>
              </button>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {agent.status}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Create New Agent Card */}
        <motion.div
          className="bg-white rounded-xl shadow p-6 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center"
          variants={item}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <PlusCircle size={32} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Agent</h3>
          <p className="text-gray-500 text-sm">Add a new AI agent to your collection</p>
        </motion.div>
      </motion.div>
    </>
  );
};

export default AgentsPage;
