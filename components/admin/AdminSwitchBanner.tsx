'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Crown, AlertTriangle, Loader2 } from 'lucide-react';
import { adminService } from '@/lib/admin-service';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AdminSwitchBanner() {
  const [isReturning, setIsReturning] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
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
  if (!isClient || !isAdminSwitch || !showBanner) {
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

  const handleDismiss = () => {
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="h-5 w-5 text-yellow-300" />
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Admin Mode:</span>
                  <span className="text-sm opacity-90">
                    Viewing as user • Admin: {adminContext?.user?.email}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleReturnToAdmin}
                  disabled={isReturning}
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  {isReturning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Returning...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Return to Admin
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  ×
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
