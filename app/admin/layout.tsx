'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LeftSidebar } from '@/components/admin/LeftSidebar';
import { RightSidebar } from '@/components/admin/RightSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <RightSidebar />
    </div>
  );
}