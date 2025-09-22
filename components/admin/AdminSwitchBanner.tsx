'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Crown, ChevronDown, ChevronUp, Loader2, Eye, Shield } from 'lucide-react';
import { adminService } from '@/lib/admin-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function AdminSwitchBanner() {
  const [isReturning, setIsReturning] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isAdminSwitch, setIsAdminSwitch] = useState(false);
  const [adminContext, setAdminContext] = useState<any>(null);

  // Only run on client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    const adminSwitch = adminService.isAdminSwitchSession();
    const context = adminService.getAdminContext();
    setIsAdminSwitch(adminSwitch);
    setAdminContext(context);
  }, []);

  // Don't render anything until client-side hydration is complete
  if (!isClient || !isAdminSwitch) {
    return null;
  }

  const handleReturnToAdmin = async () => {
    setIsReturning(true);
    
    try {
      const success = await adminService.returnToAdminAccount();
      
      if (!success) {
        // If return failed, show error and allow manual navigation
        console.error('Failed to return to admin account');
        if (typeof window !== 'undefined') {
          window.location.href = '/admin';
        }
      }
    } catch (error) {
      console.error('Error returning to admin:', error);
      // Fallback: redirect to admin page
      if (typeof window !== 'undefined') {
        window.location.href = '/admin';
      }
    }
  };


  return (
    <TooltipProvider>
      <div className="fixed top-4 right-4 z-50">
        <AnimatePresence mode="wait">
          {isCollapsed ? (
            // Collapsed State - Minimal Floating Button
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.4, 0, 0.2, 1],
                scale: { duration: 0.2 }
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Button
                      onClick={() => setIsCollapsed(false)}
                      size="sm"
                      className="h-8 px-3 bg-black hover:bg-gray-800 text-white border border-gray-200 shadow-lg rounded-full"
                    >
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                      </motion.div>
                      <span className="text-xs font-medium">Admin</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-gray-900 text-white border-gray-700">
                  <p className="text-sm">Admin Mode Active</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ) : (
            // Expanded State - Modern Card
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.9, y: -20, x: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20, x: 20 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.4, 0, 0.2, 1],
                scale: { duration: 0.3 },
                x: { duration: 0.3 }
              }}
              className="origin-top-right"
            >
              <Card className="w-80 bg-white border border-gray-200 shadow-xl">
                <CardContent className="p-4">
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    {/* Header */}
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.2 }}
                    >
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-black text-white border-black">
                          <motion.div
                            initial={{ rotate: -180 }}
                            animate={{ rotate: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                          </motion.div>
                          Admin Mode
                        </Badge>
                      </div>
                      
                      <Button
                        onClick={() => setIsCollapsed(true)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-gray-100"
                      >
                        <motion.div
                          whileHover={{ rotate: 180 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </motion.div>
                      </Button>
                    </motion.div>

                    {/* Status Section */}
                    <motion.div 
                      className="bg-gray-50 rounded-lg p-3 space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.2 }}
                    >
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <Eye className="h-4 w-4" />
                        <span className="font-medium">Viewing as user</span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 font-medium">Admin Email</div>
                        <code className="text-xs font-mono text-gray-800 bg-white px-2 py-1 rounded border">
                          {adminContext?.user?.email}
                        </code>
                      </div>
                    </motion.div>

                    {/* Actions */}
                    <motion.div 
                      className="pt-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.2 }}
                    >
                      <Button
                        onClick={handleReturnToAdmin}
                        disabled={isReturning}
                        size="sm"
                        className="w-full bg-black hover:bg-gray-800 text-white"
                      >
                        {isReturning ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            Returning...
                          </>
                        ) : (
                          <>
                            <LogOut className="h-3 w-3 mr-2" />
                            Return to Admin
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
