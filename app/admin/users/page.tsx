'use client';

import { motion } from 'framer-motion';
import { UserPlus, MoreHorizontal } from 'lucide-react';

const teamMembers = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'john@example.com', 
    role: 'admin', 
    status: 'active',
    lastActive: '2 hours ago',
    initials: 'JD'
  },
  { 
    id: '2', 
    name: 'Sarah Wilson', 
    email: 'sarah@example.com', 
    role: 'editor', 
    status: 'active',
    lastActive: '1 day ago',
    initials: 'SW'
  },
  { 
    id: '3', 
    name: 'Mike Johnson', 
    email: 'mike@example.com', 
    role: 'viewer', 
    status: 'inactive',
    lastActive: '1 week ago',
    initials: 'MJ'
  },
  { 
    id: '4', 
    name: 'Emily Brown', 
    email: 'emily@example.com', 
    role: 'editor', 
    status: 'active',
    lastActive: '3 hours ago',
    initials: 'EB'
  }
];

const UserManagementPage = () => {
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
            User Management
          </motion.h1>
          <motion.p 
            className="text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Manage team members and permissions
          </motion.p>
        </div>
        <motion.button 
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <UserPlus size={18} />
          <span>Invite User</span>
        </motion.button>
      </div>

      <motion.div 
        className="bg-white rounded-xl shadow p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Team Members</h2>
        
        <motion.div 
          className="space-y-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {teamMembers.map((member) => (
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
                  member.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 
                  member.role === 'editor' ? 'bg-blue-100 text-blue-800' : 
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
                
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </>
  );
};

export default UserManagementPage;
