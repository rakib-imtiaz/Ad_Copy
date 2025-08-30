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
import Iridescence from "@/components/ui/Iridescence";
import { LandingHeader } from "@/components/landing/header";
import ShinyText from "@/components/ui/ShinyText";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await authService.signUp({
        email,
        password
      });

      if (!result.success) {
        if (result.error?.code === 'USER_EXISTS' || result.error?.code === 'USER_ALREADY_VERIFIED') {
          const message = result.error?.code === 'USER_ALREADY_VERIFIED' 
            ? 'This email is already registered and verified. Please sign in instead.'
            : 'An account with this email already exists. Please sign in instead or use a different email address.';
          setError(message);
          return;
        }
        throw new Error(result.error?.message || 'Registration failed');
      }

      setShowVerification(true);
      
    } catch (error: any) {
      console.error("Registration failed", error);
      setError(`Registration failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);
    
    try {
      const result = await authService.verifyCode(email, verificationCode);

      if (!result.success) {
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
        return;
      }

      router.push("/dashboard");
      
    } catch (error: any) {
      console.error("Verification failed", error);
      setError(`Verification failed: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-600 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <Iridescence
          color={[0.95, 0.81, 0.25]}
          mouseReact={false}
          amplitude={0.15}
          speed={0.8}
        />
      </div>
      
      {/* Navigation Header */}
      <div className="relative z-20">
        <LandingHeader />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-20 pb-8">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo Section */}
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
                className="inline-block"
              >
                <Image 
                  src="/logo.png" 
                  alt="Copy Ready Logo" 
                  width={120} 
                  height={40} 
                  className="mx-auto"
                />
              </motion.div>
            </Link>
          </motion.div>
          
          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-white/20 backdrop-blur-xl bg-white/10 shadow-2xl">
              <CardHeader className="space-y-3 pb-6">
                <CardTitle className="text-2xl font-bold text-center text-black">
                  {showVerification ? "Verify Your Email" : "Create an Account"}
                </CardTitle>
                <CardDescription className="text-center text-black/80">
                  {showVerification 
                    ? "Enter the verification code sent to your email" 
                    : "Enter your details to create your account"
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Error Display */}
                {error && (
                  <motion.div 
                    className="p-4 text-sm bg-red-500/10 border border-red-500/20 rounded-lg text-red-600"
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

                {!showVerification ? (
                  // Registration Form
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      <label className="text-sm font-semibold text-black" htmlFor="email">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/90 backdrop-blur-sm border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-200 h-12"
                      />
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 }}
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-black" htmlFor="password">
                          Password
                        </label>
                        <Link 
                          href="/auth/forgot-password" 
                          className="text-xs text-black/70 hover:text-black hover:underline transition-colors"
                        >
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
                        className="bg-white/90 backdrop-blur-sm border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-200 h-12"
                      />
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 }}
                    >
                      <label className="text-sm font-semibold text-black" htmlFor="confirmPassword">
                        Confirm Password
                      </label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-white/90 backdrop-blur-sm border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-200 h-12"
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.9 }}
                      className="pt-2"
                    >
                      <Button 
                        type="submit" 
                        className="w-full bg-white/90 backdrop-blur-sm hover:bg-white text-black font-semibold py-3 h-12 transition-all duration-200 hover:scale-[1.02] shadow-lg border border-gray-300 relative overflow-hidden" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          "Creating Account..."
                        ) : (
                          <ShinyText 
                            text="Sign Up" 
                            disabled={false} 
                            speed={4} 
                            className="font-semibold" 
                          />
                        )}
                      </Button>
                    </motion.div>
                  </form>
                ) : (
                  // Verification Form
                  <form onSubmit={handleVerification} className="space-y-5">
                    <motion.div 
                      className="text-center text-sm text-black/80 mb-4"
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
                      <label className="text-sm font-semibold text-black" htmlFor="verificationCode">
                        Verification Code
                      </label>
                      <Input
                        id="verificationCode"
                        type="text"
                        placeholder="Enter verification code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                        className="bg-white/90 backdrop-blur-sm border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-200 h-12"
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                      className="pt-2"
                    >
                      <Button 
                        type="submit" 
                        className="w-full bg-white/90 backdrop-blur-sm hover:bg-white text-black font-semibold py-3 h-12 transition-all duration-200 hover:scale-[1.02] shadow-lg border border-gray-300 relative overflow-hidden" 
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          "Verifying..."
                        ) : (
                          <ShinyText 
                            text="Verify Email" 
                            disabled={false} 
                            speed={4} 
                            className="font-semibold" 
                          />
                        )}
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.9 }}
                      className="text-center pt-2"
                    >
                      <button
                        type="button"
                        onClick={() => setShowVerification(false)}
                        className="text-sm text-black/70 hover:text-black hover:underline transition-colors"
                      >
                        Back to registration
                      </button>
                    </motion.div>
                  </form>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4 pt-6">
                {!showVerification && (
                  <motion.div 
                    className="text-sm text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1.1 }}
                  >
                    <span className="text-black/70">Already have an account?{" "}</span>
                    <Link 
                      href="/auth/signin" 
                      className="text-black hover:text-black/70 hover:underline transition-colors font-semibold"
                    >
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

