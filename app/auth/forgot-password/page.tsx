"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { authService } from "@/lib/auth-service";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const router = useRouter();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
             if (data.success) {
         setSuccess(data.message || "Verification code has been sent. Check your email.");
         setStep("verify");
       } else {
         setError(data.error?.message || "Failed to send verification code. Please try again.");
       }
         } catch (error: any) {
       setError("Failed to send verification code. Please try again.");
     } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);
    
    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          verificationCode 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setStep("reset");
      } else {
        setError(data.error?.message || "Invalid verification code. Please try again.");
      }
    } catch (error: any) {
      setError("Failed to verify code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    
    setIsResetting(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
                 body: JSON.stringify({ 
           email,
           newPassword
         })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(data.message || "Password has been reset successfully!");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } else {
        setError(data.error?.message || "Failed to reset password. Please try again.");
      }
    } catch (error: any) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case "request":
        return "Forgot Password";
      case "verify":
        return "Verify Code";
      case "reset":
        return "Reset Password";
      default:
        return "Forgot Password";
    }
  };

     const getStepDescription = () => {
     switch (step) {
       case "request":
         return "Enter your email address and we'll send you a verification code";
       case "verify":
         return "Enter the verification code sent to your email";
       case "reset":
         return "Enter your new password";
       default:
         return "Enter your email address and we'll send you a verification code";
     }
   };

  return (
    <div className="min-h-screen bg-hero-gradient">
      <div className="container flex items-center justify-center px-4 py-12">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image 
                  src="/logo.png" 
                  alt="Copy Ready Logo" 
                  width={120} 
                  height={40} 
                  className="mx-auto mb-4"
                />
              </motion.div>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-rfa-border/30 backdrop-blur-sm bg-rfa-white/98 shadow-med">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl font-bold text-center text-black">
                  {getStepTitle()}
                </CardTitle>
                <CardDescription className="text-center text-black">
                  {getStepDescription()}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* Error Display */}
                {error && (
                  <motion.div 
                    className="p-3 text-sm bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 mb-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error}
                  </motion.div>
                )}

                {/* Success Display */}
                {success && (
                  <motion.div 
                    className="p-3 text-sm bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 mb-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {success}
                  </motion.div>
                )}

                {step === "request" && (
                  <form onSubmit={handleRequestReset} className="space-y-4">
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      <label className="text-sm font-medium text-black" htmlFor="email">Email</label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-200 focus:scale-[1.02]"
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 }}
                    >
                                             <Button 
                         type="submit" 
                         className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-3 transition-all duration-200 hover:scale-[1.02] shadow-lg border-0" 
                         disabled={isLoading}
                       >
                         {isLoading ? "Sending..." : "Send Verification Code"}
                       </Button>
                    </motion.div>
                  </form>
                )}

                {step === "verify" && (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                                         <motion.div 
                       className="text-center text-sm text-gray-600 mb-4"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       transition={{ duration: 0.3 }}
                     >
                       We've sent a verification code to <strong>{email}</strong>. Please check your inbox and spam folder.
                     </motion.div>
                    
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <label className="text-sm font-medium text-black" htmlFor="verificationCode">Verification Code</label>
                      <Input
                        id="verificationCode"
                        type="text"
                        placeholder="Enter verification code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-200 focus:scale-[1.02]"
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      <Button 
                        type="submit" 
                        className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-3 transition-all duration-200 hover:scale-[1.02] shadow-lg border-0" 
                        disabled={isVerifying}
                      >
                        {isVerifying ? "Verifying..." : "Verify Code"}
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.9 }}
                      className="text-center"
                    >
                      <button
                        type="button"
                        onClick={() => setStep("request")}
                        className="text-sm text-black hover:text-gray-700 hover:underline transition-colors"
                      >
                        Back to email input
                      </button>
                    </motion.div>
                  </form>
                )}

                {step === "reset" && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <label className="text-sm font-medium text-black" htmlFor="newPassword">New Password</label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-200 focus:scale-[1.02]"
                      />
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      <label className="text-sm font-medium text-black" htmlFor="confirmPassword">Confirm New Password</label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-200 focus:scale-[1.02]"
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.9 }}
                    >
                      <Button 
                        type="submit" 
                        className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-3 transition-all duration-200 hover:scale-[1.02] shadow-lg border-0" 
                        disabled={isResetting}
                      >
                        {isResetting ? "Resetting..." : "Reset Password"}
                      </Button>
                    </motion.div>
                  </form>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <motion.div 
                  className="text-sm text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.1 }}
                >
                  <span className="text-black">Remember your password?{" "}</span>
                  <Link href="/auth/signin" className="text-black hover:text-gray-700 hover:underline transition-colors font-medium">
                    Sign in
                  </Link>
                </motion.div>

                {/* Development Mode Info */}
                {process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' && step === "verify" && (
                  <motion.div 
                    className="text-xs text-center bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1.0 }}
                  >
                    <strong>Development Mode:</strong> Use code "123456" to verify
                  </motion.div>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
