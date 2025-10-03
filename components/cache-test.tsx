'use client'

/**
 * Cache System Test Component
 * 
 * This component tests our new caching system.
 * Add it temporarily to dashboard to see caching in action.
 */

import React from 'react';
import { useKnowledgeBase, useAgents, useCacheDebug } from '@/hooks/use-cache';
import { cacheHelpers } from '@/lib/cache-manager';

export function CacheTest() {
  const { 
    data: kbData, 
    isLoading: kbLoading, 
    error: kbError,
    refresh: refreshKB 
  } = useKnowledgeBase();

  const { 
    data: agentsData, 
    isLoading: agentsLoading, 
    error: agentsError,
    refresh: refreshAgents 
  } = useAgents();

  const { stats, clearAllCache } = useCacheDebug();

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid #333',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🧪 Cache Test Panel</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>📊 Cache Stats:</strong>
        <div style={{ marginLeft: '10px', fontSize: '11px' }}>
          <div>Entries: {stats.totalEntries}</div>
          <div>Memory: {stats.memUsage}</div>
          <div>Pending: {stats.pendingRequests}</div>
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>🧠 Knowledge Base:</strong>
        <div style={{ marginLeft: '10px', fontSize: '11px' }}>
          {kbLoading && <div>⏳ Loading...</div>}
          {kbError && <div style={{ color: 'red' }}>❌ {kbError.message}</div>}
          {kbData && <div>✅ Cached ({kbData.length} chars)</div>}
          <button 
            onClick={refreshKB}
            style={{ marginTop: '5px', fontSize: '10px', padding: '2px 6px' }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>🤖 Agents:</strong>
        <div style={{ marginLeft: '10px', fontSize: '11px' }}>
          {agentsLoading && <div>⏳ Loading...</div>}
          {agentsError && <div style={{ color: 'red' }}>❌ {agentsError.message}</div>}
          {agentsData && <div>✅ Cached ({agentsData.length} agents)</div>}
          <button 
            onClick={refreshAgents}
            style={{ marginTop: '5px', fontSize: '10px', padding: '2px 6px' }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div>
        <button 
          onClick={clearAllCache}
          style={{ 
            background: '#ff4444', 
            color: 'white', 
            border: 'none', 
            padding: '5px 10px', 
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear All Cache
        </button>
      </div>

      <div style={{ 
        marginTop: '10px', 
        padding: '5px', 
        background: '#f0f0f0', 
        borderRadius: '4px',
        fontSize: '10px' 
      }}>
        💡 Open browser console to see cache logs
      </div>
    </div>
  );
}
