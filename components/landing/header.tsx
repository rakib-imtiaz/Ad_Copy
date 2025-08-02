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
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-blue-500"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <PenTool className="h-6 w-6 text-black" />
          </motion.div>
          <span className="text-lg font-bold text-white">
            CopyForge
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-1">
          {["Home", "Features", "Pricing", "Contact"].map((item) => {
            const href = item === "Home" ? "/dashboard" 
                       : item === "Features" ? "/#features"
                       : item === "Pricing" ? "/pricing"
                       : "/contact";
            
            return (
              <Button key={item} variant="ghost" asChild className="rounded-full text-gray-300 hover:text-white">
                <Link href={href}>{item}</Link>
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
                { label: "Home", href: "/dashboard" },
                { label: "Features", href: "/#features" },
                { label: "Pricing", href: "/pricing" },
                { label: "Contact", href: "/contact" },
                { label: "Sign In", href: "/login" },
              ].map(({ label, href }) => (
                <SheetClose asChild key={label}>
                  <Link href={href} className="text-lg font-medium hover:text-primary">
                    {label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

      </div>
    </motion.header>
  )
}
