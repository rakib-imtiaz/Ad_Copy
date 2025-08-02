"use client"

import * as React from "react"
import Link from "next/link"
import { PenTool, Menu } from "lucide-react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "@/components/ui/sheet"

export function LandingHeader() {
  return (
    <motion.header 
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
    >
      <div className="flex w-full max-w-4xl items-center justify-between bg-black/60 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/30 rounded-full px-4 py-2">
        <Link href="/" className="flex items-center space-x-2.5 pr-2">
          <motion.div 
            className="flex h-10 w-10 items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img 
              src="/logo_whiteBG.png" 
              alt="Copy Ready logo" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
          </motion.div>
          <span className="text-lg font-bold text-white drop-shadow-sm">
            Copy Ready
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-1">
          {["Home", "Features", "Services", "Contact"].map((item) => {
            const handleClick = (e: React.MouseEvent) => {
              e.preventDefault();
              const sectionId = item.toLowerCase();
              const element = document.getElementById(sectionId);
              if (element) {
                const headerHeight = 80; // Approximate header height
                const elementPosition = element.offsetTop - headerHeight;
                window.scrollTo({
                  top: elementPosition,
                  behavior: 'smooth'
                });
              }
            };
            
            return (
              <Button 
                key={item} 
                variant="ghost" 
                className="rounded-full text-white/90 hover:text-white hover:bg-white/10 font-medium transition-all duration-200 drop-shadow-sm" 
                onClick={handleClick}
              >
                {item}
              </Button>
            );
          })}
        </nav>
        <Button asChild className="hidden md:inline-flex rounded-full bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-6">
          <Link href="/login">Sign In</Link>
        </Button>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-white/10 transition-colors">
              <Menu className="h-6 w-6 text-white drop-shadow-sm" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-gray-900/95 backdrop-blur-xl text-white w-64 md:hidden border-l border-white/10">
            <nav className="mt-8 flex flex-col space-y-2">
              {[
                { label: "Home", action: () => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: "Features", action: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: "Services", action: () => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: "Contact", action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) },
              ].map(({ label, action }) => (
                <SheetClose asChild key={label}>
                  <button 
                    onClick={action} 
                    className="w-full text-left py-3 px-4 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg font-medium"
                  >
                    {label}
                  </button>
                </SheetClose>
              ))}
              <div className="pt-4 mt-4 border-t border-white/10">
                <SheetClose asChild>
                  <Link 
                    href="/login" 
                    className="w-full inline-flex justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg"
                  >
                    Sign In
                  </Link>
                </SheetClose>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

      </div>
    </motion.header>
  )
}
