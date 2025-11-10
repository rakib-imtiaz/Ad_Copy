'use client';

import { motion } from 'framer-motion';
import { FileText, PlusCircle, Edit, Eye, Briefcase } from 'lucide-react';

const agents: any[] = [];

const versionHistory: any[] = [];

const PromptsPage = () => {
  return (
    <>
      <div className="flex justify-between items-center mb-8 text-foreground">
        <div>
          <motion.h1 
            className="text-2xl font-bold text-foreground"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Prompt Editor
          </motion.h1>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Edit and version control agent prompts
          </motion.p>
        </div>
        <motion.button 
          className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
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
          className="bg-background border border-border rounded-xl shadow p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">Select Agent</h2>
          <div className="space-y-3">
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                className="bg-muted/20 p-4 rounded-lg border border-border cursor-pointer hover:bg-muted/40 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <Briefcase size={20} className="text-muted-foreground" />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.version}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Prompt Template Panel */}
        <motion.div 
          className="bg-background border border-border rounded-xl shadow p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Prompt Template</h2>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors">
                Version 1
              </button>
              <button className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors flex items-center space-x-1">
                <Eye size={16} />
                <span>Preview</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Prompt Template Text Area */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Template Content
              </label>
              <textarea
                className="w-full h-40 bg-secondary text-foreground p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your prompt template here..."
              />
            </div>

            {/* Template Variables */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Template Variables</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Variable name"
                    className="flex-1 bg-background border border-border rounded-lg p-2 text-foreground focus:ring-2 focus:ring-primary"
                  />
                  <span className="px-2 py-1 bg-destructive/20 text-destructive text-xs rounded">Required</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Variable name"
                    className="flex-1 bg-background border border-border rounded-lg p-2 text-foreground focus:ring-2 focus:ring-primary"
                  />
                  <span className="px-2 py-1 bg-destructive/20 text-destructive text-xs rounded">Required</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Variable name"
                    className="flex-1 bg-background border border-border rounded-lg p-2 text-foreground focus:ring-2 focus:ring-primary"
                  />
                  <div className="w-4 h-4 border border-border rounded"></div>
                </div>
              </div>
            </div>

            {/* Version History */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Version History</h3>
              <div className="space-y-2">
                {versionHistory.map((version) => (
                  <motion.div
                    key={version.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      version.active 
                        ? 'bg-primary/10 border border-primary/40' 
                        : 'bg-muted/20 border border-border hover:bg-muted/40'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${version.active ? 'text-primary' : 'text-foreground'}`}>
                        {version.version}
                      </span>
                      <span className="text-sm text-muted-foreground">{version.time}</span>
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