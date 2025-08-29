'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, PlusCircle, MoreHorizontal, Edit, Eye, Star, Globe, RefreshCw, Trash2, Power, PowerOff } from 'lucide-react';
import { authService } from '@/lib/auth-service';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
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
            status: agent.status || 'active',
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
            status: agent.status || 'active',
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
          ? { ...agent, status: newStatus ? 'active' : 'inactive' }
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
        <div className="flex space-x-3">
          <motion.button 
            onClick={fetchAgents}
            disabled={loading}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </motion.button>
          <motion.button 
            onClick={() => window.location.href = '/admin/agents/new'}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <PlusCircle size={18} />
            <span>Create Agent</span>
          </motion.button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading agents...</p>
          </div>
        </div>
      )}

      {/* Agents Grid */}
      {!loading && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {agents.length === 0 ? (
            <motion.div
              className="col-span-full bg-white rounded-xl shadow p-12 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center"
              variants={item}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bot size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Agents Found</h3>
              <p className="text-gray-500 text-sm mb-4">No agents are currently available. Try refreshing or create a new agent.</p>
              <button 
                onClick={fetchAgents}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
            </motion.div>
          ) : (
            <>
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
                    <div className="relative">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal size={20} />
                      </button>
                      {/* More options dropdown would go here */}
                    </div>
                  </div>

                                     <p className="text-gray-600 text-sm mb-4">{agent.description}</p>

                   <div className="mb-4">
                     <div className="bg-gray-50 p-3 rounded-lg">
                       <p className="text-xs text-gray-500 mb-2 font-medium">System Prompt</p>
                       <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{agent.systemPrompt}</p>
                     </div>
                   </div>

                   <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
                     <div className="bg-blue-50 p-2 rounded-lg">
                       <p className="text-blue-600 font-medium">Creator</p>
                       <p className="text-blue-800 truncate">{agent.creator}</p>
                     </div>
                     <div className="bg-green-50 p-2 rounded-lg">
                       <p className="text-green-600 font-medium">Created</p>
                       <p className="text-green-800">{new Date(agent.created_at).toLocaleDateString()}</p>
                     </div>
                   </div>

                                     <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                       <button 
                         onClick={() => window.location.href = `/admin/agents/edit/${agent.id}`}
                         className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors"
                       >
                         <Edit size={16} />
                         <span className="text-sm">Edit Prompt</span>
                       </button>
                       <button className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors">
                         <Eye size={16} />
                         <span className="text-sm">View Details</span>
                       </button>
                     </div>
                     <div className="flex items-center space-x-2">
                       <button 
                         onClick={() => activateAgent(agent.id, !(agent.status === 'active'))}
                         disabled={activatingAgentId === agent.id}
                         className={`flex items-center space-x-1 transition-colors disabled:opacity-50 ${
                           agent.status === 'active' 
                             ? 'text-orange-600 hover:text-orange-700' 
                             : 'text-green-600 hover:text-green-700'
                         }`}
                       >
                         {agent.status === 'active' ? <PowerOff size={16} /> : <Power size={16} />}
                         <span className="text-sm">
                           {activatingAgentId === agent.id 
                             ? 'Updating...' 
                             : agent.status === 'active' 
                               ? 'Deactivate' 
                               : 'Activate'
                           }
                         </span>
                       </button>
                       <button 
                         onClick={() => handleDeleteClick(agent.id)}
                         disabled={deletingAgentId === agent.id}
                         className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
                       >
                         <Trash2 size={16} />
                         <span className="text-sm">
                           {deletingAgentId === agent.id ? 'Deleting...' : 'Delete'}
                         </span>
                       </button>
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                         agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                       }`}>
                         {agent.status}
                       </span>
                     </div>
                   </div>
                </motion.div>
              ))}

              {/* Create New Agent Card */}
              <motion.div
                onClick={() => window.location.href = '/admin/agents/new'}
                className="bg-white rounded-xl shadow p-6 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                variants={item}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <PlusCircle size={32} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Agent</h3>
                <p className="text-gray-500 text-sm">Add a new AI agent to your collection</p>
              </motion.div>
            </>
          )}
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Agent</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this agent? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                disabled={deletingAgentId === showDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
              >
                {deletingAgentId === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentsPage;
