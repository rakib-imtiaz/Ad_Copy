'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, PlusCircle, MoreHorizontal, Edit, Star, Globe, RefreshCw, Trash2, Power, PowerOff } from 'lucide-react';
import { authService } from '@/lib/auth-service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div className="space-y-2">
          <motion.h1 
            className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Agent Management
          </motion.h1>
          <motion.p 
            className="text-muted-foreground text-sm sm:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Create, configure, and manage AI agents
          </motion.p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button 
            variant="outline"
            onClick={fetchAgents}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button 
            onClick={() => window.location.href = '/admin/agents/new'}
            className="flex-1 sm:flex-none"
          >
            <PlusCircle size={16} />
            Create Agent
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="text-center">
          <CardContent className="py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary mx-auto mb-4"></div>
            <CardTitle className="mb-2">Loading agents...</CardTitle>
            <CardDescription>Please wait while we fetch your agents</CardDescription>
          </CardContent>
        </Card>
      )}

      {/* Agents Grid */}
      {!loading && (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {agents.length === 0 ? (
            <motion.div
              className="col-span-full"
              variants={item}
            >
              <Card className="border-dashed border-2 text-center">
                <CardContent className="pt-8 pb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Bot size={32} className="text-muted-foreground" />
                  </div>
                  <CardTitle className="mb-2">No Agents Found</CardTitle>
                  <CardDescription className="mb-6">
                    No agents are currently available. Try refreshing or create a new agent to get started.
                  </CardDescription>
                  <Button onClick={fetchAgents} className="mx-auto">
                    <RefreshCw size={16} />
                    Refresh
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <>
              {agents.map((agent) => (
                <motion.div
                  key={agent.id}
                  variants={item}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                          <Bot size={20} className="text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base leading-tight truncate">
                            {agent.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              <Globe size={10} className="mr-1" />
                              {agent.scope}
                            </Badge>
                            <Badge 
                              variant={agent.is_active ? "default" : "outline"}
                              className="text-xs flex items-center gap-1.5"
                            >
                              <div className={`w-2 h-2 rounded-full ${
                                agent.is_active 
                                  ? 'bg-green-500 status-dot-active' 
                                  : 'bg-red-500 status-dot-inactive'
                              }`} />
                              {agent.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 pb-4 space-y-4">
                      <CardDescription className="text-sm leading-relaxed text-truncate-2">
                        {agent.description}
                      </CardDescription>
                      
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                          Agent Prompt
                        </p>
                        <p className="text-xs text-foreground leading-relaxed text-truncate-3">
                          {agent.systemPrompt}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded">
                          <p className="text-blue-700 dark:text-blue-300 font-medium mb-1">Creator</p>
                          <p className="text-blue-900 dark:text-blue-100 truncate">{agent.creator}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded">
                          <p className="text-green-700 dark:text-green-300 font-medium mb-1">Created</p>
                          <p className="text-green-900 dark:text-green-100">
                            {new Date(agent.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-0 flex-col gap-3">
                      <div className="flex w-full gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => window.location.href = `/admin/agents/edit/${agent.id}`}
                        >
                          <Edit size={14} />
                          Edit
                        </Button>
                        <Button 
                          variant={agent.is_active ? "outline" : "default"}
                          size="sm"
                          className="flex-1"
                          onClick={() => activateAgent(agent.id, !agent.is_active)}
                          disabled={activatingAgentId === agent.id}
                        >
                          {agent.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                          {activatingAgentId === agent.id 
                            ? 'Updating...' 
                            : agent.is_active 
                              ? 'Deactivate' 
                              : 'Activate'
                          }
                        </Button>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClick(agent.id)}
                        disabled={deletingAgentId === agent.id}
                      >
                        <Trash2 size={14} />
                        {deletingAgentId === agent.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}

              {/* Create New Agent Card */}
              <motion.div
                variants={item}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Card 
                  className="h-full border-dashed border-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                  onClick={() => window.location.href = '/admin/agents/new'}
                >
                  <CardContent className="flex flex-col items-center justify-center text-center p-8 h-full min-h-[320px]">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <PlusCircle size={32} className="text-primary" />
                    </div>
                    <CardTitle className="mb-2">Create New Agent</CardTitle>
                    <CardDescription>
                      Add a new AI agent to your collection
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Trash2 size={20} className="text-destructive" />
              </div>
              Delete Agent
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this agent? This action cannot be undone and will permanently remove the agent from your system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deletingAgentId === showDeleteConfirm}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteConfirm(showDeleteConfirm!)}
              disabled={deletingAgentId === showDeleteConfirm}
            >
              {deletingAgentId === showDeleteConfirm ? 'Deleting...' : 'Delete Agent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AgentsPage;
