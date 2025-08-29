'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LeftSidebar } from '@/components/admin/LeftSidebar';
import { authService } from '@/lib/auth-service';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          console.log('🔒 Admin - User not authenticated, redirecting to sign-in');
          window.location.href = '/auth/signin';
          return;
        }

        // Get current user
        const user = authService.getCurrentUser();
        console.log('🔐 Admin - User role:', user?.role);

        // Check if user has admin role
        if (user?.role !== 'Superking') {
          console.log('❌ Admin - Unauthorized role, redirecting to dashboard');
          window.location.href = '/dashboard';
          return;
        }

        console.log('✅ Admin - User authorized for admin access');
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking admin access:', error);
        window.location.href = '/auth/signin';
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 overflow-hidden">
      <LeftSidebar />
      <motion.main 
        className="flex-1 p-8 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
    </div>
  );
}