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
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDebugInfo("");
    setIsLoading(true);
    
    try {
      // Use auth service for sign in
      const result = await authService.signIn({ email, password });
      
      // Debug information
      setDebugInfo(`Sign In Response: ${JSON.stringify(result, null, 2)}`);

      if (!result.success) {
        throw new Error(result.error?.message || 'Sign in failed');
      }

      // Successful sign in - JWT token is automatically stored
      console.log('Sign in successful:', result.data?.user);
      router.push("/dashboard");
      
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
                    {error}
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
                      <Link href="/auth/forgot-password" className="text-xs text-brand hover:text-brand-dark hover:underline transition-colors">
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

                {/* Development Mode Info */}
                {process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' && (
                  <motion.div 
                    className="text-xs text-center bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1.0 }}
                  >
                    <strong>Development Mode:</strong> Use test@example.com / password123
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

