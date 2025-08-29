'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Bot, Save, X } from 'lucide-react';
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

const EditAgentPage = () => {
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch agent data
  const fetchAgent = async () => {
    try {
      setIsLoading(true);
      const token = authService.getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

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
      
      // Find the specific agent
      const agents = Array.isArray(result) ? result : (result.agents || []);
      const foundAgent = agents.find((a: any) => a.agent_id === agentId);
      
      if (!foundAgent) {
        throw new Error('Agent not found');
      }

             const transformedAgent: Agent = {
         id: foundAgent.agent_id || foundAgent.id,
         name: foundAgent.agent_id || foundAgent.name || foundAgent.agent_name,
         description: foundAgent.short_description || foundAgent.description || foundAgent.purpose || 'AI agent for various tasks',
         status: foundAgent.status || 'active',
         scope: foundAgent.scope || foundAgent.category || 'General',
         systemPrompt: foundAgent.system_prompt || foundAgent.systemPrompt || foundAgent.prompt || foundAgent.short_description || 'Default system prompt for this agent',
         creator: foundAgent.creator || 'Unknown',
         created_at: foundAgent.created_at || new Date().toISOString()
       };

      setAgent(transformedAgent);
      setSystemPrompt(transformedAgent.systemPrompt);
    } catch (err: any) {
      console.error('❌ Error fetching agent:', err);
      setError(err.message || 'Failed to fetch agent');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = authService.getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('✏️ Client - Updating system prompt');
      console.log('🔑 Client - Token exists:', !!token);

      const response = await fetch('/api/admin/update-system-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: token,
          agent_id: agentId,
          system_prompt: systemPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update system prompt');
      }

      const result = await response.json();
      console.log('✅ System prompt updated successfully:', result);
      
      setSuccess('System prompt updated successfully!');
      
      // Redirect to agents list after a short delay
      setTimeout(() => {
        router.push('/admin/agents');
      }, 1500);
    } catch (err: any) {
      console.error('❌ Error updating system prompt:', err);
      setError(err.message || 'Failed to update system prompt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/agents');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading agent...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !agent) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/admin/agents" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft size={18} className="mr-2" />
              Back to Agents
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X size={32} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Agent</h3>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <button 
                onClick={fetchAgent}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/agents" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={18} className="mr-2" />
            Back to Agents
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
              <Bot size={24} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit System Prompt</h1>
              <p className="text-gray-500">Update the system prompt for {agent.name}</p>
            </div>
          </div>

                     <div className="mb-6 p-4 bg-gray-50 rounded-lg">
             <h3 className="font-semibold text-gray-900 mb-3">Agent Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
               <div>
                 <span className="text-gray-500">Name:</span>
                 <span className="ml-2 font-medium">{agent.name}</span>
               </div>
               <div>
                 <span className="text-gray-500">Status:</span>
                 <span className="ml-2 font-medium">{agent.status}</span>
               </div>
               <div>
                 <span className="text-gray-500">Scope:</span>
                 <span className="ml-2 font-medium">{agent.scope}</span>
               </div>
               <div>
                 <span className="text-gray-500">Creator:</span>
                 <span className="ml-2 font-medium">{agent.creator}</span>
               </div>
               <div>
                 <span className="text-gray-500">Created:</span>
                 <span className="ml-2 font-medium">{new Date(agent.created_at).toLocaleDateString()}</span>
               </div>
               <div>
                 <span className="text-gray-500">Description:</span>
                 <span className="ml-2 font-medium">{agent.description}</span>
               </div>
             </div>
           </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="system-prompt" className="text-sm font-medium text-gray-700">
                System Prompt <span className="text-red-500">*</span>
              </label>
              <textarea
                id="system-prompt"
                rows={12}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Define the agent's behavior, capabilities, and how it should respond to users. This is the core instruction that shapes the agent's personality and expertise."
                className="w-full mt-2 bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This is the core instruction that defines how the agent behaves and responds to user queries.
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-100 border border-red-400 rounded-lg p-3 text-sm mb-4">
                <X size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-100 border border-green-400 rounded-lg p-3 text-sm mb-4">
                <Save size={16} />
                <span>{success}</span>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button 
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                disabled={isSubmitting}
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Updating...' : 'Update Prompt'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAgentPage;
