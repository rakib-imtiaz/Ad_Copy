"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { FlipWords } from "@/components/ui/flip-words"
import ShinyText from "@/components/ui/ShinyText"

import Iridescence from "@/components/ui/Iridescence"

export function LandingHero() {
  const router = useRouter();
  const words = ["Facebook Ads", "Google Ads", "Email Campaigns", "LinkedIn Posts", "X (Twitter)"];
  
  const letterColors = {
    "Facebook Ads": [
      "text-blue-600", // F
      "text-blue-600", // a
      "text-blue-600", // c
      "text-blue-600", // e
      "text-blue-600", // b
      "text-blue-600", // o
      "text-blue-600", // o
      "text-blue-600", // k
      "text-gray-900", // space
      "text-blue-600", // A
      "text-blue-600", // d
      "text-blue-600", // s
    ],
    "Google Ads": [
      "text-blue-600", // G
      "text-red-500",  // o
      "text-yellow-500", // o
      "text-blue-600", // g
      "text-green-500", // l
      "text-red-500",  // e
      "text-gray-900", // space
      "text-blue-600", // A
      "text-red-500",  // d
      "text-yellow-500", // s
    ],
    "Email Campaigns": [
      "text-purple-600", // E
      "text-purple-600", // m
      "text-purple-600", // a
      "text-purple-600", // i
      "text-purple-600", // l
      "text-gray-900", // space
      "text-purple-600", // C
      "text-purple-600", // a
      "text-purple-600", // m
      "text-purple-600", // p
      "text-purple-600", // a
      "text-purple-600", // i
      "text-purple-600", // g
      "text-purple-600", // n
      "text-purple-600", // s
    ],
    "LinkedIn Posts": [
      "text-blue-700", // L
      "text-blue-700", // i
      "text-blue-700", // n
      "text-blue-700", // k
      "text-blue-700", // e
      "text-blue-700", // d
      "text-blue-700", // I
      "text-blue-700", // n
      "text-gray-900", // space
      "text-blue-700", // P
      "text-blue-700", // o
      "text-blue-700", // s
      "text-blue-700", // t
      "text-blue-700", // s
    ],
    "X (Twitter)": [
      "text-white", // X
      "text-gray-900", // space
      "text-white", // (
      "text-white", // T
      "text-white", // w
      "text-white", // i
      "text-white", // t
      "text-white", // t
      "text-white", // e
      "text-white", // r
      "text-white", // )
    ]
  };
  
  return (
    <main id="home" className="relative flex flex-col h-[100vh] items-center justify-center bg-hero-gradient transition-all duration-500">
      {/* Iridescence animation layer */}
      <div className="absolute inset-0 w-full h-full -z-5 pointer-events-none">
        <Iridescence
          color={[0.95, 0.81, 0.25]} // RFA yellow colors
          mouseReact={false}
          amplitude={0.15}
          speed={0.8}
        />
      </div>
      
      {/* Hero content */}
      <div className="relative z-10 container text-center pt-20 md:pt-32 pointer-events-auto">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-6xl drop-shadow-lg">
            AI-Powered Ad Copy Platform for{" "}
            <FlipWords words={words} className="text-ink drop-shadow-lg" letterColors={letterColors} />
          </h1>
          <p className="mt-6 text-lg leading-8 text-ink/80 drop-shadow-md font-medium">
            Generate high-converting ad copy using your personalized knowledge base, AI agents, and comprehensive media library. Create compelling campaigns in minutes with intelligent templates and brand customization.
          </p>
        </motion.div>
        
        <motion.div 
          className="mt-10 flex justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Primary CTA - Try Dashboard */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <a 
              href="/dashboard"
              className="inline-flex items-center space-x-2 rounded-full bg-black border border-white/40 text-white hover:bg-gray-900 hover:border-white/50 shadow-2xl font-bold px-8 py-3 transition-all duration-200"
            >
              <ShinyText 
                text="Start Creating" 
                disabled={false} 
                speed={3} 
                className="font-bold text-white" 
              />
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-lg text-white font-bold"
              >
                →
              </motion.div>
            </a>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-black/20 blur-lg opacity-30 -z-10"></div>
          </motion.div>


        </motion.div>
      </div>
    </main>
  )
}
