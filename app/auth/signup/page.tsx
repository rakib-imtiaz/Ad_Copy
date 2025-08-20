"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth-service";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
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
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDebugInfo("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    try {
      // Use auth service for registration
      const result = await authService.signUp({
        email,
        password,
        fullName
      });
      
      // Debug information
      setDebugInfo(`Registration Response: ${JSON.stringify(result, null, 2)}`);

      if (!result.success) {
        // Handle specific error cases
        if (result.error?.code === 'USER_EXISTS' || result.error?.code === 'USER_ALREADY_VERIFIED') {
          const message = result.error?.code === 'USER_ALREADY_VERIFIED' 
            ? 'This email is already registered and verified. Please sign in instead.'
            : 'An account with this email already exists. Please sign in instead or use a different email address.';
          setError(message);
          return; // Don't throw error, just show message
        }
        throw new Error(result.error?.message || 'Registration failed');
      }

      // If registration successful, show verification step
      setShowVerification(true);
      
    } catch (error: any) {
      console.error("Registration failed", error);
      setError(`Registration failed: ${error.message}`);
      setDebugInfo(prev => prev + `\nError: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);
    
    try {
      // Use auth service to verify the code
      const result = await authService.verifyCode(email, verificationCode);
      
      // Debug information
      setDebugInfo(prev => prev + `\nVerification Response: ${JSON.stringify(result, null, 2)}`);

      if (!result.success) {
        // Handle specific n8n configuration error
        if (result.error?.code === 'N8N_CONFIG_ERROR') {
          setError('The verification service is currently experiencing technical difficulties. Please try again in a few minutes or contact support if the issue persists.');
        } else if (result.error?.code === 'ALREADY_VERIFIED') {
          setError('This email is already verified. You can sign in directly.');
        } else if (result.error?.code === 'VERIFICATION_FAILED') {
          setError('The verification code is invalid or has expired. Please check your email and try again.');
        } else if (result.error?.code === 'NETWORK_ERROR') {
          setError('Unable to connect to the verification service. Please check your internet connection and try again.');
        } else {
          setError(result.error?.message || 'Verification failed. Please try again.');
        }
        return; // Don't redirect on error
      }

      // Verification successful, redirect to dashboard
      router.push("/dashboard");
      
    } catch (error: any) {
      console.error("Verification failed", error);
      setError(`Verification failed: ${error.message}`);
      setDebugInfo(prev => prev + `\nVerification Error: ${error.message}`);
    } finally {
      setIsVerifying(false);
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
                   {showVerification ? "Verify Your Email" : "Create an Account"}
                 </CardTitle>
                 <CardDescription className="text-center text-black">
                   {showVerification 
                     ? "Enter the verification code sent to your email" 
                     : "Enter your details to create your account"
                   }
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
                     <div className="flex flex-col space-y-2">
                       <span>{error}</span>
                       {(error.includes('already exists') || error.includes('already verified')) && (
                         <Link 
                           href="/auth/signin" 
                           className="text-blue-600 hover:text-blue-800 underline text-xs"
                         >
                           Click here to sign in instead
                         </Link>
                       )}
                     </div>
                   </motion.div>
                 )}

                 {/* Debug Information */}
                 {debugInfo && (
                   <motion.div 
                     className="p-3 text-xs bg-blue-50 border border-blue-200 rounded-lg text-blue-700 mb-4 max-h-32 overflow-y-auto"
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ duration: 0.3 }}
                   >
                     <pre className="whitespace-pre-wrap">{debugInfo}</pre>
                   </motion.div>
                 )}

                 {!showVerification ? (
                   // Registration Form
                   <form onSubmit={handleSubmit} className="space-y-4">
                     <motion.div 
                       className="space-y-2"
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ duration: 0.3, delay: 0.6 }}
                     >
                       <label className="text-sm font-medium text-black" htmlFor="fullName">Full Name</label>
                       <Input
                         id="fullName"
                         type="text"
                         placeholder="John Doe"
                         value={fullName}
                         onChange={(e) => setFullName(e.target.value)}
                         required
                         className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-200 focus:scale-[1.02]"
                       />
                     </motion.div>
                     <motion.div 
                       className="space-y-2"
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ duration: 0.3, delay: 0.7 }}
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
                       className="space-y-2"
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ duration: 0.3, delay: 0.8 }}
                     >
                       <div className="flex items-center justify-between">
                         <label className="text-sm font-medium text-black" htmlFor="password">Password</label>
                         <Link href="/auth/forgot-password" className="text-xs text-black hover:text-gray-700 hover:underline transition-colors">
                           Forgot password?
                         </Link>
                       </div>
                       <Input
                         id="password"
                         type="password"
                         placeholder="••••••••"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         required
                         className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-200 focus:scale-[1.02]"
                       />
                     </motion.div>
                     <motion.div 
                       className="space-y-2"
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ duration: 0.3, delay: 0.9 }}
                     >
                       <label className="text-sm font-medium text-black" htmlFor="confirmPassword">Confirm Password</label>
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
                       transition={{ duration: 0.3, delay: 1.0 }}
                     >
                       <Button 
                         type="submit" 
                         className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 transition-all duration-200 hover:scale-[1.02] shadow-lg border border-gray-300" 
                         disabled={isLoading}
                       >
                         {isLoading ? "Creating Account..." : "Sign Up"}
                       </Button>
                     </motion.div>
                   </form>
                 ) : (
                   // Verification Form
                   <form onSubmit={handleVerification} className="space-y-4">
                     <motion.div 
                       className="text-center text-sm text-gray-600 mb-4"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       transition={{ duration: 0.3 }}
                     >
                       We've sent a verification code to <strong>{email}</strong>
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
                         className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 transition-all duration-200 hover:scale-[1.02] shadow-lg border border-gray-300" 
                         disabled={isVerifying}
                       >
                         {isVerifying ? "Verifying..." : "Verify Email"}
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
                         onClick={() => setShowVerification(false)}
                         className="text-sm text-black hover:text-gray-700 hover:underline transition-colors"
                       >
                         Back to registration
                       </button>
                     </motion.div>
                   </form>
                 )}
               </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                {!showVerification && (
                  <motion.div 
                    className="text-sm text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1.1 }}
                  >
                    <span className="text-black">Already have an account?{" "}</span>
                    <Link href="/auth/signin" className="text-black hover:text-gray-700 hover:underline transition-colors font-medium">
                      Sign in
                    </Link>
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

