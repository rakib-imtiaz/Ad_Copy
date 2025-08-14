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
      <div className="flex w-full max-w-4xl items-center justify-between bg-rfa-white/90 backdrop-blur-xl border border-rfa-border shadow-med rounded-full px-4 py-2">
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
          <span className="text-lg font-bold text-ink drop-shadow-sm no-underline">
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
                className="rounded-full text-ink hover:text-brand hover:bg-surface font-medium transition-all duration-200 drop-shadow-sm no-underline" 
                onClick={handleClick}
              >
                {item}
              </Button>
            );
          })}
        </nav>
        <div className="hidden md:flex items-center space-x-2">
          <Button asChild className="rounded-full bg-rfa-white border-2 border-ink text-ink hover:bg-surface font-semibold px-6 py-2 transition-all duration-200 no-underline">
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
          <Button asChild className="rounded-full bg-brand text-rfa-white hover:bg-brand-dark font-semibold px-6 py-2 shadow-soft transition-all duration-200 no-underline">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-surface transition-colors">
              <Menu className="h-6 w-6 text-ink drop-shadow-sm" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-rfa-white/95 backdrop-blur-xl text-ink w-64 md:hidden border-l border-rfa-border">
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
                    className="w-full text-left py-3 px-4 text-text-muted hover:text-ink hover:bg-surface transition-all duration-200 rounded-lg font-medium"
                  >
                    {label}
                  </button>
                </SheetClose>
              ))}
              <div className="pt-4 mt-4 border-t border-rfa-border space-y-2">
                <SheetClose asChild>
                  <Link 
                    href="/auth/signup" 
                    className="w-full inline-flex justify-center py-3 px-4 bg-rfa-white border-2 border-ink text-ink hover:bg-surface font-semibold rounded-lg transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link 
                    href="/auth/signin" 
                    className="w-full inline-flex justify-center py-3 px-4 bg-brand hover:bg-brand-dark text-rfa-white font-semibold rounded-lg transition-all duration-200 shadow-soft"
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
