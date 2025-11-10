'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bot, Save, X } from 'lucide-react';
import { authService } from '@/lib/auth-service';

const NewAgentPage = () => {
  const router = useRouter();
  const [agentId, setAgentId] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

      console.log('🤖 Client - Creating agent');
      console.log('🔑 Client - Token exists:', !!token);

      const response = await fetch('/api/admin/create-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: token,
          agent_id: agentId,
          system_prompt: systemPrompt,
          short_description: shortDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create agent');
      }

      const result = await response.json();
      console.log('✅ Agent created successfully:', result);
      
      setSuccess('Agent created successfully!');
      
      // Redirect back to admin agents page after a short delay
      setTimeout(() => {
        router.push('/admin/agents');
      }, 1500);
    } catch (err: any) {
      console.error('❌ Error creating agent:', err);
      setError(err.message || 'Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/agents');
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/agents" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} className="mr-2" />
            Back to Agents
          </Link>
        </div>

        <div className="bg-background rounded-xl border border-border shadow p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
              <Bot size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create New Agent</h1>
              <p className="text-muted-foreground">Define a new AI agent with custom system prompts and descriptions.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="agent-id" className="text-sm font-medium text-foreground">
                  Agent ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="agent-id"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  placeholder="e.g., google-ads-generator, seo-optimizer, content-writer"
                  className="w-full mt-2 bg-background border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A unique identifier for the agent (use lowercase, hyphens for spaces)
                </p>
              </div>

              <div>
                <label htmlFor="short-description" className="text-sm font-medium text-foreground">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="short-description"
                  rows={3}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A brief description of what this agent does and its purpose."
                  className="w-full mt-2 bg-background border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be displayed in the agent card and help users understand the agent's purpose.
                </p>
              </div>

              <div>
                <label htmlFor="system-prompt" className="text-sm font-medium text-foreground">
                  Agent Prompt <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="system-prompt"
                  rows={8}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Define the agent's behavior, capabilities, and how it should respond to users. This is the core instruction that shapes the agent's personality and expertise."
                  className="w-full mt-2 bg-background border border-border rounded-lg p-3 text-foreground font-mono text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This is the core instruction that defines how the agent behaves and responds to user queries.
                </p>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-destructive bg-destructive/10 border border-destructive/40 rounded-lg p-3 text-sm">
                  <X size={16} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 text-green-400 bg-green-500/10 border border-green-500/40 rounded-lg p-3 text-sm">
                  <Save size={16} />
                  <span>{success}</span>
                </div>
              )}

              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-border">
                <button 
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 rounded-lg text-muted-foreground bg-muted hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:bg-primary/50"
                  disabled={isSubmitting}
                >
                  <Save size={16} />
                  <span>{isSubmitting ? 'Creating...' : 'Create Agent'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewAgentPage;
