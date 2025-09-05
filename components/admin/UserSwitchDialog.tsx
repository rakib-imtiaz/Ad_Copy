'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Eye, LogOut, AlertTriangle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { adminService } from '@/lib/admin-service';
import { useAuth } from '@/lib/auth-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface UserSwitchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId: number;
}

type SwitchStep = 'confirm' | 'loading' | 'success' | 'error';

export function UserSwitchDialog({ isOpen, onClose, userEmail, userId }: UserSwitchDialogProps) {
  const { user: currentUser } = useAuth();
  const [step, setStep] = useState<SwitchStep>('confirm');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitchToUser = async () => {
    console.log('🎯 [USER SWITCH DIALOG] handleSwitchToUser called');
    console.log('🎯 [USER SWITCH DIALOG] User email:', userEmail);
    console.log('🎯 [USER SWITCH DIALOG] User ID:', userId);
    console.log('🎯 [USER SWITCH DIALOG] Current user:', currentUser);
    
    setIsLoading(true);
    setStep('loading');
    setError('');

    try {
      // Store admin context before switching
      if (currentUser) {
        console.log('💾 [USER SWITCH DIALOG] Storing admin context:', currentUser);
        adminService.storeAdminContext(currentUser);
      } else {
        console.warn('⚠️ [USER SWITCH DIALOG] No current user found for admin context');
      }

      console.log('🔄 [USER SWITCH DIALOG] Calling adminService.switchToUser...');
      // Switch to user account
      const result = await adminService.switchToUser(userEmail);
      console.log('🔄 [USER SWITCH DIALOG] Switch result:', result);

      if (result.success) {
        console.log('✅ [USER SWITCH DIALOG] Switch successful, setting success step');
        setStep('success');
        
        // Redirect to user dashboard after a short delay
        setTimeout(() => {
          console.log('🚀 [USER SWITCH DIALOG] Redirecting to dashboard...');
          if (typeof window !== 'undefined') {
            window.location.href = '/dashboard';
          }
        }, 2000);
      } else {
        console.error('❌ [USER SWITCH DIALOG] Switch failed:', result.error);
        setError(result.error?.message || 'Failed to switch to user account');
        setStep('error');
      }
    } catch (error: any) {
      console.error('💥 [USER SWITCH DIALOG] Unexpected error:', error);
      console.error('💥 [USER SWITCH DIALOG] Error message:', error.message);
      console.error('💥 [USER SWITCH DIALOG] Error stack:', error.stack);
      
      setError(error.message || 'An unexpected error occurred');
      setStep('error');
    } finally {
      console.log('🏁 [USER SWITCH DIALOG] Setting loading to false');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setError('');
    setIsLoading(false);
    onClose();
  };

  const renderStepContent = () => {
    switch (step) {
      case 'confirm':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Switch to User Account</h3>
                <p className="text-sm text-blue-700">
                  You are about to switch to the user account for <strong>{userEmail}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  You'll be able to see their dashboard, agents, conversations, and experience exactly as they do
                </p>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> This action will log you out of your admin account and log you in as the selected user. 
                You can return to your admin account later using the "Return to Admin" option.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Admin:</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {currentUser?.email}
                </Badge>
                <Badge variant="outline">Admin</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Switching to:</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {userEmail}
                </Badge>
                <Badge variant="outline">User</Badge>
              </div>
            </div>
          </div>
        );

      case 'loading':
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Switching to User Account</h3>
              <p className="text-sm text-gray-600">
                Retrieving user credentials and logging in...
              </p>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Getting user password</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Logging in as user</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Redirecting to dashboard</span>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-green-900">Successfully Switched!</h3>
              <p className="text-sm text-green-700">
                You are now logged in as <strong>{userEmail}</strong>
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Redirecting to user dashboard...
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-900">Switch Failed</h3>
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You are still logged in as an admin. Please try again or contact support if the issue persists.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Switch to User Account</span>
          </DialogTitle>
          <DialogDescription>
            This will log you out of your admin account and log you in as the selected user. You'll be able to see their dashboard, agents, and experience exactly as they do.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0">
          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                onClick={handleSwitchToUser} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                <User className="h-4 w-4 mr-2" />
                Switch to User Account
              </Button>
            </>
          )}
          
          {step === 'error' && (
            <>
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                Close
              </Button>
              <Button 
                onClick={handleSwitchToUser} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                <User className="h-4 w-4 mr-2" />
                Try Switch Again
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
