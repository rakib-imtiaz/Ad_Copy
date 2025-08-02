"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  variant?: "fade" | "slide" | "typing" | "words"
  duration?: number
}

export function AnimatedText({ 
  text, 
  className, 
  delay = 0, 
  variant = "fade",
  duration = 0.6 
}: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = React.useState("")
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    if (variant === "typing") {
      const timer = setTimeout(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1))
          setCurrentIndex(currentIndex + 1)
        }
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, text, variant])

  if (variant === "typing") {
    return (
      <motion.span
        className={cn("inline-block", className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay, duration: 0.3 }}
      >
        {displayedText}
        <span className="animate-blink border-r-2 border-current ml-1" />
      </motion.span>
    )
  }

  if (variant === "words") {
    const words = text.split(" ")
    return (
      <span className={className}>
        {words.map((word, index) => (
          <motion.span
            key={index}
            className="inline-block mr-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: delay + index * 0.1,
              duration: duration,
              ease: "easeOut"
            }}
          >
            {word}
          </motion.span>
        ))}
      </span>
    )
  }

  if (variant === "slide") {
    return (
      <motion.span
        className={cn("inline-block", className)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          delay,
          duration,
          ease: "easeOut"
        }}
      >
        {text}
      </motion.span>
    )
  }

  // Default fade variant
  return (
    <motion.span
      className={cn("inline-block", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration,
        ease: "easeOut"
      }}
    >
      {text}
    </motion.span>
  )
}

// Preset components for common use cases
export function TypingText({ text, className, delay = 0 }: Omit<AnimatedTextProps, 'variant'>) {
  return <AnimatedText text={text} className={className} delay={delay} variant="typing" />
}

export function FadeInText({ text, className, delay = 0 }: Omit<AnimatedTextProps, 'variant'>) {
  return <AnimatedText text={text} className={className} delay={delay} variant="fade" />
}

export function SlideInText({ text, className, delay = 0 }: Omit<AnimatedTextProps, 'variant'>) {
  return <AnimatedText text={text} className={className} delay={delay} variant="slide" />
}

export function WordByWordText({ text, className, delay = 0 }: Omit<AnimatedTextProps, 'variant'>) {
  return <AnimatedText text={text} className={className} delay={delay} variant="words" />
}

// Higher order component for animating any text content
export function withTextAnimation<T extends object>(
  Component: React.ComponentType<T>,
  variant: AnimatedTextProps['variant'] = 'fade'
) {
  return function AnimatedComponent(props: T & { animationDelay?: number }) {
    const { animationDelay = 0, ...rest } = props
    
    return (
      <motion.div
        initial={{ opacity: 0, y: variant === 'slide' ? -20 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animationDelay, duration: 0.6, ease: "easeOut" }}
      >
        <Component {...(rest as T)} />
      </motion.div>
    )
  }
}