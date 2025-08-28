'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, MoreHorizontal, Trash2, AlertTriangle } from 'lucide-react';
import { authService } from '@/lib/auth-service';

const teamMembers = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'john@example.com', 
    role: 'Superking', 
    status: 'active',
    lastActive: '2 hours ago',
    initials: 'JD',
    createdAt: '2024-01-15'
  },
  { 
    id: '2', 
    name: 'Sarah Wilson', 
    email: 'sarah@example.com', 
    role: 'paid-user', 
    status: 'active',
    lastActive: '1 day ago',
    initials: 'SW',
    createdAt: '2024-01-10'
  },
  { 
    id: '3', 
    name: 'Mike Johnson', 
    email: 'mike@example.com', 
    role: 'paid-user', 
    status: 'inactive',
    lastActive: '1 week ago',
    initials: 'MJ',
    createdAt: '2024-01-05'
  },
  { 
    id: '4', 
    name: 'Emily Brown', 
    email: 'emily@example.com', 
    role: 'paid-user', 
    status: 'active',
    lastActive: '3 hours ago',
    initials: 'EB',
    createdAt: '2024-01-12'
  },
  { 
    id: '5', 
    name: 'Admin User', 
    email: 'admin@example.com', 
    role: 'Superking', 
    status: 'active',
    lastActive: '30 minutes ago',
    initials: 'AU',
    createdAt: '2024-01-01'
  }
];

const UserManagementPage = () => {
  const [users, setUsers] = useState(teamMembers);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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

  const handleDeleteUser = async (userId: string) => {
    try {
      setDeletingUserId(userId);
      const token = authService.getAuthToken();
      
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          accessToken: token,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      // Remove user from local state
      setUsers(prev => prev.filter(user => user.id !== userId));
      setShowDeleteConfirm(null);
      console.log('✅ User deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingUserId(null);
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

      <motion.div 
        className="bg-white rounded-xl shadow p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">User Records</h2>
        
                 <motion.div 
           className="space-y-4"
           variants={container}
           initial="hidden"
           animate="show"
         >
           {users.map((member) => (
            <motion.div 
              key={member.id}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center"
              variants={item}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
                  {member.initials}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              
                             <div className="flex items-center space-x-4">
                 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                   member.role === 'Superking' ? 'bg-purple-100 text-purple-800' : 
                   member.role === 'paid-user' ? 'bg-blue-100 text-blue-800' : 
                   'bg-gray-100 text-gray-800'
                 }`}>
                   {member.role}
                 </span>
                 
                 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                   member.status === 'active' ? 'bg-green-100 text-green-800' : 
                   'bg-gray-100 text-gray-800'
                 }`}>
                   {member.status}
                 </span>
                 
                 <span className="text-sm text-gray-500">{member.lastActive}</span>
                 
                 <div className="flex items-center space-x-2">
                   <button className="text-gray-400 hover:text-gray-600">
                     <MoreHorizontal size={20} />
                   </button>
                   
                   {member.role !== 'Superking' && (
                     <button 
                       onClick={() => setShowDeleteConfirm(member.id)}
                       className="text-red-400 hover:text-red-600 transition-colors"
                       disabled={deletingUserId === member.id}
                     >
                       <Trash2 size={20} />
                     </button>
                   )}
                 </div>
               </div>
            </motion.div>
          ))}
                 </motion.div>
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
                 <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                 <p className="text-sm text-gray-500">This action cannot be undone</p>
               </div>
             </div>
             
             <p className="text-gray-600 mb-6">
               Are you sure you want to delete this user? This will permanently remove their account and all associated data.
             </p>
             
             <div className="flex space-x-3">
               <button
                 onClick={() => handleDeleteUser(showDeleteConfirm)}
                 disabled={deletingUserId === showDeleteConfirm}
                 className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 {deletingUserId === showDeleteConfirm ? 'Deleting...' : 'Delete User'}
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
     </>
   );
 };

export default UserManagementPage;
