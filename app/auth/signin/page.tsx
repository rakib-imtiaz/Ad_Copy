"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { authService } from "@/lib/auth-service";
import { useAuth } from "@/lib/auth-context";
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
import { Separator } from "@/components/ui/separator";
import Iridescence from "@/components/ui/Iridescence";
import { LandingHeader } from "@/components/landing/header";

export default function SignInPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Check for error parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      
      if (errorParam === 'invalid_token') {
        setError('Your session has expired. Please sign in again.');
        authService.clearTokens();
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const token = authService.getAuthToken();
      const explicitLogin = sessionStorage.getItem('explicit_login');
      
      if (token && authService.isAuthenticated() && explicitLogin === 'true') {
        const user = authService.getCurrentUser();
        
        if (user?.role === 'Superking') {
          router.push("/admin");
        } else if (user?.role === 'paid-user') {
          router.push("/dashboard");
        } else {
          authService.clearTokens();
        }
      } else {
        if (!explicitLogin) {
          authService.clearTokens();
        }
      }
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        sessionStorage.setItem('explicit_login', 'true');
        router.push("/dashboard");
      } else {
        // If login returns false, it might be due to account freeze or other issues
        // The error should have been thrown, but if not, show a generic message
        setError('Invalid email or password. Please check your credentials and try again.');
      }
      
    } catch (error: any) {
      console.error("Sign in failed", error);
      console.error("Error message:", error.message);
      console.error("Error type:", typeof error);
      console.error("Error keys:", Object.keys(error));
      
      // Handle specific error types
      if (error.message && (
        error.message.includes('Account is freeze') || 
        error.message.includes('ACCOUNT_FROZEN') ||
        error.message.includes('frozen') ||
        error.message.includes('freeze')
      )) {
        console.log("Account freeze detected, showing freeze message");
        setError('Your account has been temporarily frozen. Please contact support for assistance.');
      } else if (error.message) {
        console.log("Showing generic error message:", error.message);
        setError(`Sign in failed: ${error.message}`);
      } else {
        console.log("No error message, showing default message");
        setError('Sign in failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rfa-theme bg-rfa-white text-rfa-black min-h-screen">
      <LandingHeader />
      <div className="relative min-h-screen bg-hero-gradient">
        {/* Iridescence animation layer */}
        <div className="absolute inset-0 w-full h-full -z-5 pointer-events-none">
          <Iridescence
            color={[0.95, 0.81, 0.25]}
            mouseReact={false}
            amplitude={0.15}
            speed={0.8}
          />
        </div>
        
        <div className="relative z-10 container flex items-center justify-center min-h-screen px-4 py-12">
          <motion.div 
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Logo Section */}
            <motion.div 
              className="mb-8 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
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
                    className="mx-auto mb-4"
                  />
                </motion.div>
              </Link>
            </motion.div>
            
            {/* Main Card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="relative"
            >
              <Card className="border-white/20 backdrop-blur-xl bg-white/10 shadow-2xl">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-2xl font-bold text-center text-black drop-shadow-sm">
                    Sign In
                  </CardTitle>
                  <CardDescription className="text-center text-black drop-shadow-sm">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Error Display */}
                  {error && (
                    <motion.div 
                      className={`p-4 text-sm rounded-xl mb-4 ${
                        error.includes('frozen') || error.includes('freeze') 
                          ? 'bg-orange-50 border border-orange-200 text-orange-700' 
                          : 'bg-red-50 border border-red-200 text-red-700'
                      }`}
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          error.includes('frozen') || error.includes('freeze') 
                            ? 'bg-orange-100' 
                            : 'bg-red-100'
                        }`}>
                          <svg className={`w-3 h-3 ${
                            error.includes('frozen') || error.includes('freeze') 
                              ? 'text-orange-600' 
                              : 'text-red-600'
                          }`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{error}</p>
                          {error.includes('No account found') && (
                            <Link 
                              href="/auth/signup" 
                              className="text-blue-600 hover:text-blue-800 underline text-sm mt-1 inline-block"
                            >
                              Click here to create a new account
                            </Link>
                          )}
                          {(error.includes('frozen') || error.includes('freeze')) && (
                            <div className="text-sm mt-2 text-orange-600">
                              <p>If you believe this is an error, please contact our support team.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Field */}
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                    >
                      <label className="text-sm font-medium text-black drop-shadow-sm" htmlFor="email">Email Address</label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="bg-white/90 backdrop-blur-sm border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-200 focus:scale-[1.02]"
                      />
                    </motion.div>
                    
                    {/* Password Field */}
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 }}
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-black drop-shadow-sm" htmlFor="password">Password</label>
                        <Link 
                          href="/auth/forgot-password" 
                          className="text-xs text-black hover:text-gray-700 hover:underline transition-colors drop-shadow-sm"
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
                        disabled={isLoading}
                        className="bg-white/90 backdrop-blur-sm border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-200 focus:scale-[1.02]"
                      />
                    </motion.div>
                    
                    {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 }}
                      className="pt-2"
                    >
                      <Button 
                        type="submit" 
                        className="w-full bg-white/90 backdrop-blur-sm hover:bg-white text-black font-semibold py-3 transition-all duration-200 hover:scale-[1.02] shadow-lg border border-gray-300" 
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4 pt-6">
                  <Separator className="bg-gray-200" />
                  <motion.div 
                    className="text-sm text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                  >
                    <span className="text-black drop-shadow-sm">Don&apos;t have an account?{" "}</span>
                    <Link 
                      href="/auth/signup" 
                      className="text-black hover:text-gray-700 hover:underline transition-colors font-medium drop-shadow-sm"
                    >
                      Create an account
                    </Link>
                  </motion.div>
                </CardFooter>
              </Card>

              {/* Loading Overlay */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-brand" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Signing you in...</h3>
                      <p className="text-sm text-gray-600">Please wait while we verify your credentials</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

