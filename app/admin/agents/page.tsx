'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, PlusCircle, MoreHorizontal, Edit, Eye, Star, Globe, RefreshCw, Trash2, Power, PowerOff } from 'lucide-react';
import { authService } from '@/lib/auth-service';

interface Agent {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  scope: string;
  systemPrompt: string;
  creator: string;
  created_at: string;
}

const AgentsPage = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activatingAgentId, setActivatingAgentId] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const token = authService.getAuthToken();
      
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      console.log('🤖 Client - Fetching agents');
      console.log('🔑 Client - Token exists:', !!token);

      const response = await fetch(`/api/admin/agent-list?accessToken=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch agents');
      }

      const result = await response.json();
      console.log('✅ Agents fetched successfully:', result);
      
             // Transform API data to match our interface
       if (result && Array.isArray(result)) {
                   const transformedAgents: Agent[] = result.map((agent: any, index: number) => ({
            id: agent.agent_id || agent.id || `agent-${index + 1}`,
            name: agent.agent_id || agent.name || agent.agent_name || `Agent ${index + 1}`,
            description: agent.short_description || agent.description || agent.purpose || 'AI agent for various tasks',
            is_active: agent.is_active === true,
            scope: agent.scope || agent.category || 'General',
            systemPrompt: agent.system_prompt || agent.systemPrompt || agent.prompt || agent.short_description || 'Default system prompt for this agent',
            creator: agent.creator || 'Unknown',
            created_at: agent.created_at || new Date().toISOString()
          }));
         setAgents(transformedAgents);
       } else if (result && result.agents && Array.isArray(result.agents)) {
                   const transformedAgents: Agent[] = result.agents.map((agent: any, index: number) => ({
            id: agent.agent_id || agent.id || `agent-${index + 1}`,
            name: agent.agent_id || agent.name || agent.agent_name || `Agent ${index + 1}`,
            description: agent.short_description || agent.description || agent.purpose || 'AI agent for various tasks',
            is_active: agent.is_active === true,
            scope: agent.scope || agent.category || 'General',
            systemPrompt: agent.system_prompt || agent.systemPrompt || agent.prompt || agent.short_description || 'Default system prompt for this agent',
            creator: agent.creator || 'Unknown',
            created_at: agent.created_at || new Date().toISOString()
          }));
         setAgents(transformedAgents);
       } else {
        console.error('❌ Invalid API response format:', result);
        setAgents([]);
      }
    } catch (error) {
      console.error('❌ Error fetching agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteAgent = async (agentId: string) => {
    try {
      setDeletingAgentId(agentId);
      const token = authService.getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🗑️ Client - Deleting agent:', agentId);
      console.log('🔑 Client - Token exists:', !!token);

      const response = await fetch('/api/admin/delete-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: token,
          agent_id: agentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete agent');
      }

      const result = await response.json();
      console.log('✅ Agent deleted successfully:', result);
      
      // Remove the agent from the local state
      setAgents(prevAgents => prevAgents.filter(agent => agent.id !== agentId));
      
      // Close the confirmation dialog
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('❌ Error deleting agent:', err);
      alert(`Failed to delete agent: ${err.message}`);
    } finally {
      setDeletingAgentId(null);
    }
  };

  const handleDeleteClick = (agentId: string) => {
    setShowDeleteConfirm(agentId);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(null);
  };

  const handleDeleteConfirm = (agentId: string) => {
    deleteAgent(agentId);
  };

  const activateAgent = async (agentId: string, newStatus: boolean) => {
    try {
      setActivatingAgentId(agentId);
      const token = authService.getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔄 Client - Activating/Deactivating agent:', agentId, 'New status:', newStatus);
      console.log('🔑 Client - Token exists:', !!token);

      const response = await fetch('/api/admin/activate-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: token,
          agent_id: agentId,
          active_status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to activate/deactivate agent');
      }

      const result = await response.json();
      console.log('✅ Agent activation status updated successfully:', result);
      
      // Update the agent status in local state
      setAgents(prevAgents => prevAgents.map(agent => 
        agent.id === agentId 
          ? { ...agent, is_active: newStatus }
          : agent
      ));
      
    } catch (err: any) {
      console.error('❌ Error activating/deactivating agent:', err);
      alert(`Failed to activate/deactivate agent: ${err.message}`);
    } finally {
      setActivatingAgentId(null);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

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
            className="text-3xl font-bold text-gray-900 tracking-tight"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Agent Management
          </motion.h1>
          <motion.p 
            className="text-gray-600 mt-2 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Create, configure, and manage AI agents
          </motion.p>
        </div>
        <div className="flex space-x-4">
          <motion.button 
            onClick={fetchAgents}
            disabled={loading}
            className="flex items-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span className="font-medium">Refresh</span>
          </motion.button>
          <motion.button 
            onClick={() => window.location.href = '/admin/agents/new'}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircle size={18} />
            <span className="font-medium">Create Agent</span>
          </motion.button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg font-medium">Loading agents...</p>
            <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your agents</p>
          </div>
        </div>
      )}

      {/* Agents Grid */}
      {!loading && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {agents.length === 0 ? (
            <motion.div
              className="col-span-full bg-white rounded-2xl shadow-lg p-16 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center"
              variants={item}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-6">
                <Bot size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Agents Found</h3>
              <p className="text-gray-500 text-base mb-6 max-w-md">No agents are currently available. Try refreshing or create a new agent to get started.</p>
              <button 
                onClick={fetchAgents}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                <RefreshCw size={18} />
                <span className="font-medium">Refresh</span>
              </button>
            </motion.div>
          ) : (
            <>
              {agents.map((agent) => (
                <motion.div
                  key={agent.id}
                  className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:border-gray-200 transition-all duration-200"
                  variants={item}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center">
                        <Bot size={24} className="text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{agent.name}</h3>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full flex items-center">
                            <Globe size={12} className="mr-1" />
                            {agent.scope}
                          </span>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            agent.is_active 
                              ? 'bg-green-50 text-green-700' 
                              : 'bg-gray-50 text-gray-700'
                          }`}>
                            {agent.is_active ? 'active' : 'inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                      {/* More options dropdown would go here */}
                    </div>
                  </div>

                                     <p className="text-gray-600 text-base mb-6 leading-relaxed">{agent.description}</p>

                   <div className="mb-6">
                     <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                       <p className="text-xs text-gray-600 mb-3 font-semibold uppercase tracking-wide">System Prompt</p>
                       <p className="text-sm text-gray-800 line-clamp-3 leading-relaxed font-medium">{agent.systemPrompt}</p>
                     </div>
                   </div>

                   <div className="mb-6 grid grid-cols-2 gap-4">
                     <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                       <p className="text-blue-700 font-semibold text-sm mb-1">Creator</p>
                       <p className="text-blue-900 truncate font-medium">{agent.creator}</p>
                     </div>
                     <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                       <p className="text-green-700 font-semibold text-sm mb-1">Created</p>
                       <p className="text-green-900 font-medium">{new Date(agent.created_at).toLocaleDateString()}</p>
                     </div>
                   </div>

                                     <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                     <div className="flex items-center space-x-4">
                       <button 
                         onClick={() => window.location.href = `/admin/agents/edit/${agent.id}`}
                         className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
                       >
                         <Edit size={16} />
                         <span className="text-sm font-medium">Edit</span>
                       </button>
                       <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
                         <Eye size={16} />
                         <span className="text-sm font-medium">View</span>
                       </button>
                     </div>
                     <div className="flex items-center space-x-3">
                       <button 
                         onClick={() => activateAgent(agent.id, !agent.is_active)}
                         disabled={activatingAgentId === agent.id}
                         className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 ${
                           agent.is_active 
                             ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' 
                             : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                         }`}
                       >
                         {agent.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                         <span className="text-sm font-medium">
                           {activatingAgentId === agent.id 
                             ? 'Updating...' 
                             : agent.is_active 
                               ? 'Deactivate' 
                               : 'Activate'
                           }
                         </span>
                       </button>
                       <button 
                         onClick={() => handleDeleteClick(agent.id)}
                         disabled={deletingAgentId === agent.id}
                         className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                       >
                         <Trash2 size={16} />
                         <span className="text-sm font-medium">
                           {deletingAgentId === agent.id ? 'Deleting...' : 'Delete'}
                         </span>
                       </button>
                     </div>
                   </div>
                </motion.div>
              ))}

              {/* Create New Agent Card */}
              <motion.div
                onClick={() => window.location.href = '/admin/agents/new'}
                className="bg-white rounded-2xl shadow-lg p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group"
                variants={item}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                  <PlusCircle size={40} className="text-blue-600 group-hover:text-blue-700 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Create New Agent</h3>
                <p className="text-gray-600 text-base">Add a new AI agent to your collection</p>
              </motion.div>
            </>
          )}
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <motion.div 
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center mr-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Agent</h3>
            </div>
            <p className="text-gray-600 mb-8 text-base leading-relaxed">
              Are you sure you want to delete this agent? This action cannot be undone and will permanently remove the agent from your system.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                disabled={deletingAgentId === showDeleteConfirm}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 font-medium shadow-lg"
              >
                {deletingAgentId === showDeleteConfirm ? 'Deleting...' : 'Delete Agent'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default AgentsPage;
