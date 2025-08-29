'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Copy, Trash2, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/lib/auth-service';

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

// Interface for API response based on actual data
interface ApiReferralCode {
  id: number;
  creator: string;
  referral_code: string;
  allocated_credit: string;
  total_usage_limit: number;
  user_redeem_limit: number;
  created_at: string;
  remaining_usage_limit: number;
}

export default function ReferralsPage() {
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [creatingReferral, setCreatingReferral] = useState(false);
  const [deletingReferral, setDeletingReferral] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    referral_code: '',
    allocated_credit: '',
    limit: '',
    user_redeem_limit: ''
  });

  const fetchReferralCodes = async () => {
    try {
      setLoading(true);
      const token = authService.getAuthToken();
      
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      console.log('📋 Client - Fetching referral codes');
      console.log('🔑 Client - Token exists:', !!token);

      const response = await fetch(`/api/admin/view-referral-codes?accessToken=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch referral codes');
      }

      const result = await response.json();
      console.log('✅ Referral codes fetched successfully:', result);
      
             // Transform API data to match our interface
       const transformedCodes: ReferralCode[] = Array.isArray(result) ? result.map((apiCode: ApiReferralCode) => ({
         id: apiCode.id.toString(),
         code: apiCode.referral_code,
         createdBy: apiCode.creator,
         usageCount: apiCode.total_usage_limit - apiCode.remaining_usage_limit,
         maxUsage: apiCode.total_usage_limit,
         discount: parseFloat(apiCode.allocated_credit),
         status: apiCode.remaining_usage_limit > 0 ? 'active' : 'inactive',
         createdAt: new Date(apiCode.created_at).toLocaleDateString(),
         expiresAt: 'No expiration', // API doesn't provide expiration date
       })) : [];

      setReferralCodes(transformedCodes);
    } catch (error) {
      console.error('❌ Error fetching referral codes:', error);
      alert(`Failed to fetch referral codes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralCodes();
  }, []);

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setCreatingReferral(true);
      const token = authService.getAuthToken();
      
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      console.log('🎫 Client - Creating referral code:', formData.referral_code);
      console.log('🔑 Client - Token exists:', !!token);

      const response = await fetch('/api/admin/generate-referral-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: token,
          referral_code: formData.referral_code,
          allocated_credit: parseFloat(formData.allocated_credit),
          limit: parseInt(formData.limit),
          user_redeem_limit: parseInt(formData.user_redeem_limit),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create referral code');
      }

      const result = await response.json();
      console.log('✅ Referral code created successfully:', result);

      // Reset form and close
      setFormData({
        referral_code: '',
        allocated_credit: '',
        limit: '',
        user_redeem_limit: ''
      });
      setShowCreateForm(false);
      
      // Refresh referral codes list
      await fetchReferralCodes();
      alert('Referral code created successfully!');
    } catch (error) {
      console.error('❌ Error creating referral code:', error);
      alert(`Failed to create referral code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingReferral(false);
    }
  };

  const handleDeleteReferral = async (code: ReferralCode) => {
    try {
      setDeletingReferral(code.id);
      const token = authService.getAuthToken();
      
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      console.log('🗑️ Client - Deleting referral code:', code.code);
      console.log('🔑 Client - Token exists:', !!token);

      const response = await fetch('/api/admin/delete-referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: token,
          referral_code: code.code,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete referral code');
      }

      const result = await response.json();
      console.log('✅ Referral code deleted successfully:', result);

      // Remove from local state
      setReferralCodes(prev => prev.filter(c => c.id !== code.id));
      setShowDeleteConfirm(null);
      alert('Referral code deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting referral code:', error);
      alert(`Failed to delete referral code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingReferral(null);
    }
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
                <Input 
                  placeholder="e.g., WELCOME2024" 
                  value={formData.referral_code}
                  onChange={(e) => setFormData({...formData, referral_code: e.target.value})}
                  required 
                />
              </div>
                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Allocated Credit ($)</label>
                 <Input 
                   type="number" 
                   min="0.01" 
                   step="0.01"
                   placeholder="10.00" 
                   value={formData.allocated_credit}
                   onChange={(e) => setFormData({...formData, allocated_credit: e.target.value})}
                   required 
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Total Usage Limit</label>
                 <Input 
                   type="number" 
                   min="1" 
                   placeholder="50" 
                   value={formData.limit}
                   onChange={(e) => setFormData({...formData, limit: e.target.value})}
                   required 
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">User Redeem Limit</label>
                 <Input 
                   type="number" 
                   min="1" 
                   placeholder="1" 
                   value={formData.user_redeem_limit}
                   onChange={(e) => setFormData({...formData, user_redeem_limit: e.target.value})}
                   required 
                 />
               </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                type="submit" 
                disabled={creatingReferral}
                className="flex items-center space-x-2"
              >
                {creatingReferral ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Create Referral Code</span>
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                disabled={creatingReferral}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between">
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
          <button
            onClick={fetchReferralCodes}
            disabled={loading}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Referral Codes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading referral codes...</p>
          </div>
        </div>
      ) : (
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
                       <span className="font-medium">Credit:</span> ${code.discount}
                     </div>
                     <div>
                       <span className="font-medium">Remaining:</span> {code.maxUsage - code.usageCount}
                     </div>
                     <div>
                       <span className="font-medium">Creator:</span> {code.createdBy}
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
                     onClick={() => setShowDeleteConfirm(code.id)}
                     disabled={deletingReferral === code.id}
                     className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                   >
                     {deletingReferral === code.id ? (
                       <>
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                         <span>Deleting...</span>
                       </>
                     ) : (
                       <>
                         <Trash2 size={16} />
                         <span>Delete</span>
                       </>
                     )}
                   </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

             {!loading && filteredCodes.length === 0 && (
         <div className="text-center py-12">
           <p className="text-gray-500">No referral codes found.</p>
         </div>
       )}

       {/* Delete Confirmation Modal */}
       {showDeleteConfirm && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Referral Code</h3>
             <p className="text-gray-600 mb-6">
               Are you sure you want to delete the referral code "{filteredCodes.find(c => c.id === showDeleteConfirm)?.code}"? 
               This action cannot be undone.
             </p>
             <div className="flex space-x-3">
               <Button
                 onClick={() => handleDeleteReferral(filteredCodes.find(c => c.id === showDeleteConfirm)!)}
                 disabled={deletingReferral === showDeleteConfirm}
                 className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
               >
                 {deletingReferral === showDeleteConfirm ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                     <span>Deleting...</span>
                   </>
                 ) : (
                   <>
                     <Trash2 size={16} />
                     <span>Delete</span>
                   </>
                 )}
               </Button>
               <Button
                 variant="outline"
                 onClick={() => setShowDeleteConfirm(null)}
                 disabled={deletingReferral === showDeleteConfirm}
               >
                 Cancel
               </Button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }
