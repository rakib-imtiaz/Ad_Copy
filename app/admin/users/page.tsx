'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, MoreHorizontal, Trash2, AlertTriangle, Filter, RefreshCw, Crown } from 'lucide-react';
import { authService } from '@/lib/auth-service';

interface User {
  id: number;
  email: string;
  created_at: string;
  role: 'Superking' | 'paid-user' | null;
  total_credit: string;
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [changingRoleUserId, setChangingRoleUserId] = useState<number | null>(null);
  const [showRoleChangeConfirm, setShowRoleChangeConfirm] = useState<number | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<{ id?: number; email?: string } | null>(null);

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

  const fetchUsers = async (searchFor: string = 'all') => {
    try {
      setLoading(true);
      const token = authService.getAuthToken();
      
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        console.error('User not authenticated');
        setLoading(false);
        return;
      }

      console.log('🔗 Client - Making request to:', '/api/admin/users');
      console.log('🔑 Client - Token exists:', !!token);
      console.log('📋 Client - Request body:', { accessToken: token ? '***' : 'NOT PROVIDED', search_for: searchFor });

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: token,
          search_for: searchFor,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch users');
      }

      const result = await response.json();
      console.log('✅ Users fetched successfully:', result);
      
      // The API returns an array directly, no need for nested data.users
      const transformedUsers = Array.isArray(result) ? result : [];
      
      // Get current user info directly to ensure it's available for filtering
      const currentUserInfo = authService.getCurrentUser();
      
      // Filter out the current logged-in user
      const filteredUsers = transformedUsers.filter(user => 
        user.id !== currentUserInfo?.id && user.email !== currentUserInfo?.email
      );
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      alert(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get current user info
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser({
        id: user.id,
        email: user.email
      });
    }

    // Only fetch users if authenticated
    if (authService.isAuthenticated()) {
      fetchUsers(filterRole);
    }
  }, [filterRole]);

  const handleDeleteUser = async (userId: number) => {
    try {
      setDeletingUserId(userId);
      const token = authService.getAuthToken();
      
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      // Find the user to get their email
      const userToDelete = users.find(user => user.id === userId);
      if (!userToDelete) {
        alert('User not found');
        return;
      }

      console.log('🗑️ Client - Deleting user ID:', userId, 'Email:', userToDelete.email);
      console.log('🔑 Client - Token exists:', !!token);

      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email: userToDelete.email,
          accessToken: token,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      // This should never happen since current user is filtered out, but keep as safety
      const currentUserInfo = authService.getCurrentUser();
      if (userId === currentUserInfo?.id) {
        console.log('❌ Self-deletion prevented');
        alert('You cannot delete your own account');
        return;
      }

      // Refresh the user list
      await fetchUsers(filterRole);
      setShowDeleteConfirm(null);
      console.log('✅ User deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleChangeUserRole = async (userId: number) => {
    try {
      setChangingRoleUserId(userId);
      const token = authService.getAuthToken();
      
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      // Find the user to get their email
      const userToChange = users.find(user => user.id === userId);
      if (!userToChange) {
        alert('User not found');
        return;
      }

      console.log('👑 Client - Changing role for user ID:', userId, 'Email:', userToChange.email);
      console.log('🔑 Client - Token exists:', !!token);

      const response = await fetch('/api/admin/change-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userToChange.email,
          accessToken: token,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change user role');
      }

      // Refresh the user list
      await fetchUsers(filterRole);
      setShowRoleChangeConfirm(null);
      console.log('✅ User role changed successfully');
    } catch (error) {
      console.error('❌ Error changing user role:', error);
      alert(`Failed to change user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setChangingRoleUserId(null);
    }
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
            User Management
          </motion.h1>
          <motion.p 
            className="text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            View user records with filters, create admin users, and manage accounts
            {currentUser && (
              <span className="block text-xs text-blue-600 mt-1">
                💡 Your account is hidden from this list for security
              </span>
            )}
          </motion.p>
        </div>
        <motion.button 
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <UserPlus size={18} />
          <span>Create Admin User</span>
        </motion.button>
      </div>

             {/* Filters */}
       <motion.div 
         className="bg-white rounded-xl shadow p-4 mb-6"
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.4 }}
       >
         <div className="flex items-center justify-between">
           <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2">
               <Filter size={20} className="text-gray-500" />
               <span className="text-sm font-medium text-gray-700">Filter by role:</span>
             </div>
             <select 
               value={filterRole} 
               onChange={(e) => setFilterRole(e.target.value)}
               className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
             >
               <option value="all">All Users</option>
               <option value="paid-user">Paid Users</option>
               <option value="Superking">Admin Users</option>
             </select>
           </div>
           <button
             onClick={() => fetchUsers(filterRole)}
             disabled={loading}
             className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
           >
             <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
             <span className="text-sm">Refresh</span>
           </button>
         </div>
       </motion.div>

       <motion.div 
         className="bg-white rounded-xl shadow p-6"
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.4 }}
       >
         <h2 className="text-xl font-semibold text-gray-900 mb-6">User Records</h2>
        
                 {loading ? (
           <div className="flex items-center justify-center py-12">
             <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
               <p className="text-gray-600">Loading users...</p>
             </div>
           </div>
         ) : !authService.isAuthenticated() ? (
           <div className="flex items-center justify-center py-12">
             <div className="text-center">
               <p className="text-gray-600 mb-2">Authentication required</p>
               <p className="text-sm text-gray-500">Please sign in to view user data</p>
             </div>
           </div>
         ) : (
           <motion.div 
             className="space-y-4"
             variants={container}
             initial="hidden"
             animate="show"
           >
             {users.length === 0 ? (
               <div className="text-center py-12">
                 <p className="text-gray-500">No users found.</p>
               </div>
             ) : (
               users.map((member) => (
                         <motion.div 
               key={member.id}
               className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center"
               variants={item}
             >
                             <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
                   {member.email.split('@')[0].substring(0, 2).toUpperCase()}
                 </div>
                 <div>
                   <h3 className="font-semibold text-gray-800">{member.email}</h3>
                   <p className="text-sm text-gray-500">ID: {member.id}</p>
                 </div>
               </div>
              
                             <div className="flex items-center space-x-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                     member.role === 'Superking' ? 'bg-purple-100 text-purple-800' : 
                     member.role === 'paid-user' ? 'bg-blue-100 text-blue-800' : 
                     'bg-gray-100 text-gray-800'
                   }`}>
                     {member.role === 'Superking' ? 'Admin' : member.role || 'No Role'}
                     {member.role === 'Superking' && (
                       <span className="ml-1 text-xs">👑</span>
                     )}
                   </span>
                 
                 <span className="text-sm text-gray-500">
                   Credits: {parseFloat(member.total_credit).toFixed(2)}
                 </span>
                 
                 <span className="text-sm text-gray-500">
                   {new Date(member.created_at).toLocaleDateString()}
                 </span>
                 
                 <div className="flex items-center space-x-2">
                   <button className="text-gray-400 hover:text-gray-600">
                     <MoreHorizontal size={20} />
                   </button>
                   
                   {/* Change role button - only show for non-admin users */}
                   {member.role !== 'Superking' && (
                     <button 
                       onClick={() => setShowRoleChangeConfirm(member.id)}
                       className="text-purple-400 hover:text-purple-600 transition-colors"
                       disabled={changingRoleUserId === member.id}
                       title="Make Admin"
                     >
                       <Crown size={20} />
                     </button>
                   )}
                   
                   {/* Allow deleting any user (current user is filtered out) */}
                   <button 
                     onClick={() => setShowDeleteConfirm(member.id)}
                     className="text-red-400 hover:text-red-600 transition-colors"
                     disabled={deletingUserId === member.id}
                   >
                     <Trash2 size={20} />
                   </button>
                 </div>
                                </div>
               </motion.div>
             ))
             )}
           </motion.div>
         )}
       </motion.div>

              {/* Delete Confirmation Modal */}
       {showDeleteConfirm && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
           >
             <div className="flex items-center space-x-3 mb-4">
               <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                 <AlertTriangle className="text-red-600" size={20} />
               </div>
               <div>
                 <h3 className="text-lg font-semibold text-gray-900">
                   {showDeleteConfirm && users.find(u => u.id === showDeleteConfirm)?.role === 'Superking' 
                     ? 'Delete Admin User' 
                     : 'Delete User'
                   }
                 </h3>
                 <p className="text-sm text-gray-500">This action cannot be undone</p>
               </div>
             </div>
             
             <p className="text-gray-600 mb-6">
                {showDeleteConfirm && users.find(u => u.id === showDeleteConfirm)?.role === 'Superking' 
                  ? 'Are you sure you want to delete this admin user? This will permanently remove their admin account and all associated data. This action requires careful consideration.'
                  : 'Are you sure you want to delete this user? This will permanently remove their account and all associated data.'
                }
                {showDeleteConfirm && (
                  <span className="block mt-2 font-semibold">
                    User: {users.find(u => u.id === showDeleteConfirm)?.email}
                    {users.find(u => u.id === showDeleteConfirm)?.role === 'Superking' && (
                      <span className="text-red-600 ml-2">(Admin User)</span>
                    )}
                  </span>
                )}
              </p>
             
             <div className="flex space-x-3">
               <button
                 onClick={() => handleDeleteUser(showDeleteConfirm)}
                 disabled={deletingUserId === showDeleteConfirm}
                 className={`flex-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                   showDeleteConfirm && users.find(u => u.id === showDeleteConfirm)?.role === 'Superking'
                     ? 'bg-red-700 text-white hover:bg-red-800'
                     : 'bg-red-600 text-white hover:bg-red-700'
                 }`}
               >
                 {deletingUserId === showDeleteConfirm 
                   ? 'Deleting...' 
                   : showDeleteConfirm && users.find(u => u.id === showDeleteConfirm)?.role === 'Superking'
                     ? 'Delete Admin User'
                     : 'Delete User'
                 }
               </button>
               <button
                 onClick={() => setShowDeleteConfirm(null)}
                 disabled={deletingUserId === showDeleteConfirm}
                 className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 Cancel
               </button>
             </div>
           </motion.div>
         </div>
       )}

       {/* Role Change Confirmation Modal */}
       {showRoleChangeConfirm && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
           >
             <div className="flex items-center space-x-3 mb-4">
               <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                 <Crown className="text-purple-600" size={20} />
               </div>
               <div>
                 <h3 className="text-lg font-semibold text-gray-900">Make User Admin</h3>
                 <p className="text-sm text-gray-500">This will grant admin privileges</p>
               </div>
             </div>
             
             <p className="text-gray-600 mb-6">
                Are you sure you want to make this user an admin? They will have full access to the admin dashboard and all administrative functions.
                {showRoleChangeConfirm && (
                  <span className="block mt-2 font-semibold">
                    User: {users.find(u => u.id === showRoleChangeConfirm)?.email}
                  </span>
                )}
              </p>
             
             <div className="flex space-x-3">
               <button
                 onClick={() => handleChangeUserRole(showRoleChangeConfirm)}
                 disabled={changingRoleUserId === showRoleChangeConfirm}
                 className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 {changingRoleUserId === showRoleChangeConfirm 
                   ? 'Changing Role...' 
                   : 'Make Admin'
                 }
               </button>
               <button
                 onClick={() => setShowRoleChangeConfirm(null)}
                 disabled={changingRoleUserId === showRoleChangeConfirm}
                 className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 Cancel
               </button>
             </div>
           </motion.div>
         </div>
       )}
     </>
   );
 };

export default UserManagementPage;
