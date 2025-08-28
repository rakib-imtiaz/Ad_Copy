'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Copy, Trash2, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReferralCode {
  id: string;
  code: string;
  createdBy: string;
  usageCount: number;
  maxUsage: number;
  discount: number;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  expiresAt: string;
}

const mockReferralCodes: ReferralCode[] = [
  {
    id: '1',
    code: 'WELCOME2024',
    createdBy: 'admin@example.com',
    usageCount: 45,
    maxUsage: 100,
    discount: 20,
    status: 'active',
    createdAt: '2024-01-15',
    expiresAt: '2024-12-31'
  },
  {
    id: '2',
    code: 'SUMMER50',
    createdBy: 'admin@example.com',
    usageCount: 12,
    maxUsage: 50,
    discount: 50,
    status: 'active',
    createdAt: '2024-06-01',
    expiresAt: '2024-08-31'
  },
  {
    id: '3',
    code: 'NEWUSER10',
    createdBy: 'admin@example.com',
    usageCount: 100,
    maxUsage: 100,
    discount: 10,
    status: 'expired',
    createdAt: '2024-01-01',
    expiresAt: '2024-03-31'
  }
];

export default function ReferralsPage() {
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>(mockReferralCodes);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement referral creation logic
    setShowCreateForm(false);
  };

  const handleDeleteReferral = (id: string) => {
    setReferralCodes(prev => prev.filter(code => code.id !== id));
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const filteredCodes = referralCodes.filter(code => 
    filterStatus === 'all' || code.status === filterStatus
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.h1 
          className="text-2xl font-bold text-gray-900"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Referral Codes Management
        </motion.h1>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Referral Code</span>
        </Button>
      </div>

      {/* Create Referral Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-xl shadow p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Referral Code</h2>
          <form onSubmit={handleCreateReferral} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code</label>
                <Input placeholder="e.g., WELCOME2024" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                <Input type="number" min="1" max="100" placeholder="20" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Usage</label>
                <Input type="number" min="1" placeholder="100" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <Input type="date" required />
              </div>
            </div>
            <div className="flex space-x-3">
              <Button type="submit">Create Referral Code</Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Referral Codes List */}
      <div className="grid gap-4">
        {filteredCodes.map((code) => (
          <motion.div
            key={code.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow p-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{code.code}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    code.status === 'active' ? 'bg-green-100 text-green-800' :
                    code.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {code.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Usage:</span> {code.usageCount}/{code.maxUsage}
                  </div>
                  <div>
                    <span className="font-medium">Discount:</span> {code.discount}%
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {code.createdAt}
                  </div>
                  <div>
                    <span className="font-medium">Expires:</span> {code.expiresAt}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(code.code)}
                  className="flex items-center space-x-1"
                >
                  <Copy size={16} />
                  <span>Copy</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center space-x-1"
                >
                  <Eye size={16} />
                  <span>View</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteReferral(code.id)}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCodes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No referral codes found.</p>
        </div>
      )}
    </div>
  );
}
