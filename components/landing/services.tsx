"use client"

import * as React from "react"
import { Database, FileVideo, Bot, MessageCircle, Search, Palette, Download, Variable, Target } from "lucide-react"
import { motion, useInView } from "motion/react"

const services = [
  { icon: Database, title: "Knowledge Base Management" },
  { icon: FileVideo, title: "Media Library & Transcription" },
  { icon: Bot, title: "AI-Powered Agents" },
  { icon: MessageCircle, title: "Chat & Conversation History" },
  { icon: Search, title: "Research & Web Scraping" },
  { icon: Palette, title: "Brand Customization" },
  { icon: Download, title: "Export & Sharing" },
  { icon: Variable, title: "Template Variables" },
  { icon: Target, title: "Output Presets" },
]

export function LandingServices() {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="services" className="py-24 sm:py-32 bg-gray-900" ref={ref}>
      <div className="container text-center">
        <motion.h2 
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Comprehensive Copy Ready Modules
        </motion.h2>
        <motion.p 
          className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Our platform provides a complete suite of tools to streamline your ad copy creation process from research to final export.
        </motion.p>
        <motion.div 
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {services.map((service, index) => (
            <motion.div 
              key={service.title} 
              className="group relative cursor-pointer"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, z: 20 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center justify-center text-center space-y-4 p-8 rounded-xl bg-gray-900/50 border border-white/10 transition-all duration-300 group-hover:bg-transparent group-hover:border-blue-500/50 group-hover:shadow-2xl group-hover:shadow-blue-500/10 h-full">
                <motion.div 
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500 transition-all duration-300"
                >
                  <service.icon className="h-6 w-6 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                </motion.div>
                <span className="font-medium text-white group-hover:text-blue-300 transition-colors duration-300">
                  {service.title}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
