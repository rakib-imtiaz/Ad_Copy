"use client"

import * as React from "react"
import { Check, Plus } from "lucide-react"
import { motion, useInView } from "motion/react"
import { Button } from "@/components/ui/button"

const features = [
  "Knowledge Base Management", "Media Library & Transcription", "AI-Powered Agents", "Template Variables",
  "Research & Web Scraping", "Brand Customization", "Multi-Platform Export",
  "Conversation History", "Output Presets",
]

const FeatureCard = () => (
    <div className="relative h-[450px] w-full max-w-sm mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-surface to-rfa-border rounded-2xl shadow-med transform-gpu rotate-x-10 rotate-y-[-5deg] scale-95"></div>
      <div className="relative h-full w-full bg-rfa-white/90 backdrop-blur-md rounded-2xl p-6 border border-rfa-border flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>
        <div className="flex-grow bg-surface rounded-lg p-4 overflow-y-auto font-mono text-sm text-text-muted">
            <p>
              <span className="text-blue-400">const</span>{' '}
              <span className="text-green-400">generateAdCopy</span> = (
              <span className="text-orange-400">context</span>) =&gt; {'{'}
            </p>
            <p className="pl-4">
              <span className="text-gray-500">
                // Creates high-converting ad copy...
              </span>
              <br />
              <span className="text-purple-400">return</span>{' '}
              <span className="text-yellow-400">
                {'`${context.brand} ${context.platform} ad`'}
              </span>
              ;
            </p>
            <p>{'}'};</p>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="w-24 h-8 bg-surface rounded-md"></div>
          <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center">
            <Plus className="h-6 w-6 text-ink" />
          </div>
        </div>
      </div>
    </div>
  );
  

export function LandingFeatures() {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="features" className="py-24 sm:py-32 bg-rfa-white" ref={ref}>
      <div className="container grid md:grid-cols-2 gap-16 items-center">
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h2 
            className="text-3xl font-bold tracking-tight text-ink sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Copy Ready Platform Features
          </motion.h2>
          <motion.p 
            className="text-lg text-text-muted"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Our comprehensive platform combines your brand knowledge, media assets, and AI-powered agents to generate high-converting ad copy. Upload files, transcribe content, and customize outputs for any marketing channel.
          </motion.p>
          <motion.ul 
            className="grid grid-cols-2 gap-x-8 gap-y-4"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {features.map((feature, index) => (
              <motion.li 
                key={feature} 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              >
                <Check className="h-5 w-5 text-brand flex-shrink-0" />
                <span className="text-text-muted">{feature}</span>
              </motion.li>
            ))}
          </motion.ul>
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <Button size="lg" className="rounded-full bg-brand text-rfa-white hover:bg-brand-dark font-semibold px-8 py-3 shadow-soft transition-all duration-200">
              Generate Ad Copy Now
            </Button>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
          animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
        >
          <FeatureCard />
        </motion.div>
      </div>
    </section>
  )
}
