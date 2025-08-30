'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LeftSidebar } from '@/components/admin/LeftSidebar';
import { authService } from '@/lib/auth-service';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

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
      <div className="flex h-screen items-center justify-center bg-background">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking admin access...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect in useEffect
  }

  return (
    <SidebarProvider>
      <LeftSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="flex flex-1 items-center gap-2 px-3" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <motion.main 
            className="flex-1 rounded-xl bg-white md:min-h-min p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {children}
          </motion.main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}