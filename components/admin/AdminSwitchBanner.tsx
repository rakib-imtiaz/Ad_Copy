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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-4 right-4 z-50"
          >
            {isCollapsed ? (
              // Collapsed State - Minimal Floating Button
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => setIsCollapsed(false)}
                      size="sm"
                      className="h-8 px-3 bg-black hover:bg-gray-800 text-white border border-gray-200 shadow-lg rounded-full"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      <span className="text-xs font-medium">Admin</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-gray-900 text-white border-gray-700">
                  <p className="text-sm">Admin Mode Active</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              // Expanded State - Modern Card
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card className="w-80 bg-white border border-gray-200 shadow-xl">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-black text-white border-black">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin Mode
                          </Badge>
                        </div>
                        
                        <Button
                          onClick={() => setIsCollapsed(true)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 hover:bg-gray-100"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Status */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Eye className="h-4 w-4" />
                        <span>Viewing as user</span>
                      </div>

                      {/* Admin Email */}
                      <div className="bg-gray-50 rounded-md p-2">
                        <div className="text-xs text-gray-500 mb-1">Admin Email</div>
                        <code className="text-xs font-mono text-gray-800">
                          {adminContext?.user?.email}
                        </code>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <Button
                          onClick={handleReturnToAdmin}
                          disabled={isReturning}
                          size="sm"
                          className="bg-black hover:bg-gray-800 text-white"
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

                        <Button
                          onClick={() => setIsCollapsed(true)}
                          size="sm"
                          variant="outline"
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Collapse
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </TooltipProvider>
  );
}
