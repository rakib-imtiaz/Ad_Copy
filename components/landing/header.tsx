"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import CardNav from "@/components/ui/CardNav"

export function LandingHeader() {
  const logoComponent = (
    <Link href="/" className="flex items-center space-x-2.5">
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
      <span className="text-lg font-bold text-black drop-shadow-sm no-underline">
        Copy Ready
      </span>
    </Link>
  );

  const navItems = [
    {
      label: "Platform",
      bgColor: "rgba(59, 130, 246, 0.15)",
      textColor: "#000000",
      links: [
        { label: "Home", href: "#home", ariaLabel: "Go to home section" },
        { label: "Features", href: "#features", ariaLabel: "View features" },
        { label: "Services", href: "#services", ariaLabel: "Browse services" },
        { label: "Contact", href: "#contact", ariaLabel: "Contact us" },
      ]
    },
    {
      label: "Account",
      bgColor: "rgba(34, 197, 94, 0.15)",
      textColor: "#000000",
      links: [
        { label: "Sign In", href: "/auth/signin", ariaLabel: "Sign in to account" },
        { label: "Sign Up", href: "/auth/signup", ariaLabel: "Create new account" },
        { label: "Dashboard", href: "/dashboard", ariaLabel: "Go to dashboard" },
        { label: "Support", href: "#", ariaLabel: "Get support" },
      ]
    }
  ];

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.div
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
    >
      <CardNav
        logoComponent={logoComponent}
        items={navItems}
        baseColor="rgba(255, 255, 255, 0.1)"
        menuColor="#000000"
      />
    </motion.div>
  )
}
