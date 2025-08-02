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
      <div className="flex w-full max-w-4xl items-center justify-between bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 rounded-full px-4 py-2">
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
          <span className="text-lg font-bold text-white">
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
              <Button key={item} variant="ghost" className="rounded-full text-gray-300 hover:text-white" onClick={handleClick}>
                {item}
              </Button>
            );
          })}
        </nav>
        <Button asChild className="hidden md:inline-flex rounded-full bg-white text-black hover:bg-white/90 font-semibold">
          <Link href="/login">Sign In</Link>
        </Button>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6 text-white" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-gray-900 text-white w-64 md:hidden">
            <nav className="mt-8 flex flex-col space-y-4">
              {[
                { label: "Home", action: () => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: "Features", action: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: "Services", action: () => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: "Contact", action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: "Sign In", href: "/login" },
              ].map(({ label, href, action }) => (
                <SheetClose asChild key={label}>
                  {href ? (
                    <Link href={href} className="text-lg font-medium hover:text-primary">
                      {label}
                    </Link>
                  ) : (
                    <button onClick={action} className="text-lg font-medium hover:text-primary text-left">
                      {label}
                    </button>
                  )}
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

      </div>
    </motion.header>
  )
}
