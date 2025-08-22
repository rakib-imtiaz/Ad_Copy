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
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function SignInPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const router = useRouter();

  // Debug authentication state and check for error parameters
  useEffect(() => {
    console.log('🔐 SignIn page - isAuthenticated:', isAuthenticated, 'loading:', loading);
    const token = authService.getAuthToken();
    console.log('🔐 SignIn page - token exists:', !!token);
    if (token) {
      console.log('🔐 SignIn page - token preview:', token.substring(0, 50) + '...');
    }
    
    // Check for error parameter in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      
      if (errorParam === 'invalid_token') {
        console.log('🔐 SignIn page - invalid_token error parameter detected');
        setError('Your session has expired. Please sign in again.');
        
        // Clear any potentially invalid auth state
        authService.clearTokens();
        
        // Remove the error parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isAuthenticated, loading]);

  // Redirect if already authenticated, but only after explicit login
  useEffect(() => {
    if (isAuthenticated && !loading) {
      // Double-check that we have a valid token before redirecting
      const token = authService.getAuthToken();
      const explicitLogin = sessionStorage.getItem('explicit_login');
      
      // Only redirect if we have a valid token AND user explicitly logged in during this session
      if (token && authService.isAuthenticated() && explicitLogin === 'true') {
        console.log('🔐 SignIn page - Redirecting to dashboard because user explicitly authenticated with valid token');
        router.push("/dashboard");
      } else {
        console.log('🔐 SignIn page - User appears authenticated but either token is invalid or not from explicit login');
        // Clear any potentially invalid authentication state
        if (!explicitLogin) {
          console.log('🔐 SignIn page - No explicit login detected, clearing tokens');
          authService.clearTokens();
        }
      }
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDebugInfo("");
    setIsLoading(true);
    
    try {
      console.log('🔐 Starting sign in process...');
      // Use auth context for sign in
      const success = await login(email, password);
      
      if (success) {
        // Mark this as an explicit user login
        sessionStorage.setItem('explicit_login', 'true');
        
        // Successful sign in - show success message and redirect
        console.log('✅ Sign in successful - webhook responded with success');
        setError(""); // Clear any previous errors
        setDebugInfo("✅ Authentication successful! Redirecting to dashboard...");
        
        // Wait a moment to show the success message, then redirect
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        console.log('❌ Sign in failed - webhook did not return success');
        setError('Invalid email or password. Please check your credentials and try again.');
      }
      
    } catch (error: any) {
      console.error("Sign in failed", error);
      setError(`Sign in failed: ${error.message}`);
      setDebugInfo(prev => prev + `\nError: ${error.message}`);
    } finally {
      setIsLoading(false);
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
                <CardTitle className="text-2xl font-bold text-center text-ink">Sign In</CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Enter your credentials to access your account
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
                      {error.includes('No account found') && (
                        <Link 
                          href="/auth/signup" 
                          className="text-blue-600 hover:text-blue-800 underline text-xs"
                        >
                          Click here to create a new account
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Success Display */}
                {debugInfo && debugInfo.includes('✅') && (
                  <motion.div 
                    className="p-3 text-sm bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 mb-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col space-y-2">
                      <span>{debugInfo}</span>
                    </div>
                  </motion.div>
                )}

                {/* Debug Information */}
                {debugInfo && !debugInfo.includes('✅') && (
                  <motion.div 
                    className="p-3 text-xs bg-blue-50 border border-blue-200 rounded-lg text-blue-700 mb-4 max-h-32 overflow-y-auto"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <pre className="whitespace-pre-wrap">{debugInfo}</pre>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <label className="text-sm font-medium text-ink" htmlFor="email">Email</label>
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
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-ink" htmlFor="password">Password</label>
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-3 transition-all duration-200 hover:scale-[1.02] shadow-lg border-0" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <motion.div 
                  className="text-sm text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                >
                  <span className="text-black">Don&apos;t have an account?{" "}</span>
                  <Link href="/auth/signup" className="text-black hover:text-gray-700 hover:underline transition-colors font-medium">
                    Create an account
                  </Link>
                </motion.div>

                {/* Debug: Current State */}
                <motion.div 
                  className="text-center space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                >
                  <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                    <div>Auth State: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
                    <div>Loading: {loading ? 'Yes' : 'No'}</div>
                    <div>Token: {authService.getAuthToken() ? 'Exists' : 'None'}</div>
                  </div>
                </motion.div>

                {/* Debug: Clear Cache Button */}
                <motion.div 
                  className="text-center space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                >
                  <button
                    onClick={() => {
                      console.log('🔍 === CURRENT STORAGE STATE ===');
                      console.log('localStorage.auth_token:', localStorage.getItem('auth_token'));
                      console.log('localStorage.refresh_token:', localStorage.getItem('refresh_token'));
                      console.log('authService.getAuthToken():', authService.getAuthToken());
                      console.log('authService.isAuthenticated():', authService.isAuthenticated());
                      console.log('=== END STORAGE STATE ===');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline transition-colors block"
                  >
                    Check Current Storage State
                  </button>
                  <button
                    onClick={() => {
                      console.log('🧹 Clearing all tokens and cache...');
                      
                      // Clear auth service tokens
                      authService.clearTokens();
                      
                      // Clear localStorage completely
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('refresh_token');
                        localStorage.removeItem('chat_session_id');
                        localStorage.removeItem('chat_started');
                        localStorage.removeItem('chat_messages');
                        console.log('🧹 localStorage cleared');
                      }
                      
                      // Clear sessionStorage
                      if (typeof window !== 'undefined') {
                        sessionStorage.removeItem('explicit_login');
                        sessionStorage.clear();
                        console.log('🧹 sessionStorage cleared (including explicit_login flag)');
                      }
                      
                      console.log('🧹 Reloading page...');
                      window.location.reload();
                    }}
                    className="text-xs text-red-600 hover:text-red-800 underline transition-colors"
                  >
                    Clear All Cache & Reload
                  </button>
                  
                  <button
                    onClick={() => {
                      console.log('🔧 Force loading to false...');
                      // Force reload to reset auth state
                      window.location.reload();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline transition-colors"
                  >
                    Force Reset Auth State
                  </button>
                </motion.div>


              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

