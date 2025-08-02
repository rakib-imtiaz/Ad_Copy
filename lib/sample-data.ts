import { Conversation, ChatMessage, Agent, MediaItem } from "@/types"

// Enhanced Agents
export const sampleAgents: Agent[] = [
  {
    id: "agent-1",
    name: "CopyMaster Pro",
    description: "Expert in creating high-converting ad copy for all platforms",
    prompt: "You are a professional copywriter specializing in creating compelling ad copy that drives conversions.",
    isGlobal: true,
    version: 1,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
    createdBy: "admin-1"
  },
  {
    id: "agent-2", 
    name: "Social Media Specialist",
    description: "Focused on engaging social media content and captions",
    prompt: "You create viral social media content that builds brand awareness and engagement.",
    isGlobal: true,
    version: 1,
    isActive: true,
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-16"),
    createdBy: "admin-1"
  },
  {
    id: "agent-3",
    name: "Email Marketing Expert", 
    description: "Crafting compelling email subject lines and body copy",
    prompt: "You specialize in email marketing copy that increases open rates and click-through rates.",
    isGlobal: true,
    version: 1,
    isActive: true,
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-17"),
    createdBy: "admin-1"
  },
  {
    id: "agent-4",
    name: "Google Ads Specialist",
    description: "Optimized Google Ads copy for maximum ROI",
    prompt: "You create Google Ads copy that maximizes click-through rates and conversions.",
    isGlobal: true,
    version: 1,
    isActive: true,
    createdAt: new Date("2024-01-04"),
    updatedAt: new Date("2024-01-18"),
    createdBy: "admin-1"
  },
  {
    id: "agent-5",
    name: "Brand Voice Architect",
    description: "Develops consistent brand voice across all channels",
    prompt: "You help establish and maintain a consistent brand voice that resonates with target audiences.",
    isGlobal: true,
    version: 1,
    isActive: true,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-19"),
    createdBy: "admin-1"
  }
]

// Enhanced Conversations with Detailed Chat Messages
export const sampleConversations: Conversation[] = [
  {
    id: "conv-1",
    userId: "user-1",
    agentId: "agent-1",
    title: "Facebook Ad Campaign for SaaS Product",
    messages: [
      {
        id: "msg-1-1",
        conversationId: "conv-1",
        content: "I need help creating Facebook ads for our SaaS product. We're targeting small business owners aged 25-45 who are struggling with project management.",
        type: "user",
        timestamp: new Date("2024-01-20T10:00:00Z")
      },
      {
        id: "msg-1-2",
        conversationId: "conv-1",
        content: "Perfect! I'll help you create compelling Facebook ads for your SaaS product. Let me start by understanding your key value propositions and then craft some high-converting ad copy.\n\nFirst, let me create a primary ad headline that speaks directly to your target audience's pain points:",
        type: "ai",
        timestamp: new Date("2024-01-20T10:01:00Z")
      },
      {
        id: "msg-1-3",
        conversationId: "conv-1",
        content: "Here are 3 powerful Facebook ad headlines:\n\n1. 'Stop Losing Money on Missed Deadlines'\n2. 'The #1 Project Management Tool Small Businesses Love'\n3. 'Get Your Team Organized in 5 Minutes'\n\nWhich direction resonates most with your audience?",
        type: "ai",
        timestamp: new Date("2024-01-20T10:02:00Z"),
        metadata: {
          generatedCopy: {
            id: "copy-1-1",
            content: "Stop Losing Money on Missed Deadlines - Streamline your projects with our intuitive SaaS platform. Join 10,000+ businesses already saving time and money.",
            preset: "facebook",
            templateVariables: { product: "SaaS", audience: "small business owners" },
            createdAt: new Date("2024-01-20T10:02:00Z"),
            conversationId: "conv-1",
            isSaved: false
          }
        }
      },
      {
        id: "msg-1-4",
        conversationId: "conv-1",
        content: "I like the first one about missed deadlines. Can you expand on that and create a full ad with description and call-to-action?",
        type: "user",
        timestamp: new Date("2024-01-20T10:05:00Z")
      },
      {
        id: "msg-1-5",
        conversationId: "conv-1",
        content: "Absolutely! Here's a complete Facebook ad using the missed deadlines angle:\n\n**Headline:** Stop Losing Money on Missed Deadlines\n\n**Primary Text:**\nTired of projects falling behind? Our SaaS platform helps small business owners:\n• Track progress in real-time\n• Set automated reminders\n• Collaborate seamlessly\n• Never miss another deadline\n\nJoin 10,000+ businesses already saving 15+ hours per week.\n\n**Call-to-Action:** Start Free Trial\n\nThis ad focuses on the pain point (missed deadlines) and offers a clear solution with social proof.",
        type: "ai",
        timestamp: new Date("2024-01-20T10:06:00Z"),
        metadata: {
          generatedCopy: {
            id: "copy-1-2",
            content: "Stop Losing Money on Missed Deadlines\n\nTired of projects falling behind? Our SaaS platform helps small business owners track progress in real-time, set automated reminders, collaborate seamlessly, and never miss another deadline.\n\nJoin 10,000+ businesses already saving 15+ hours per week.\n\nStart Free Trial",
            preset: "facebook",
            templateVariables: { product: "SaaS", audience: "small business owners" },
            createdAt: new Date("2024-01-20T10:06:00Z"),
            conversationId: "conv-1",
            isSaved: false
          }
        }
      }
    ],
    pinnedMessages: ["msg-1-5"],
    knowledgeBaseSnapshot: {
      id: "kb-1",
      userId: "user-1",
      companyName: "ProjectFlow SaaS",
      service: "Project Management Software",
      industry: "SaaS",
      niche: "Small Business Project Management",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-20"),
      version: 1
    },
    attachedMedia: ["media-1", "media-3"],
    createdAt: new Date("2024-01-20T10:00:00Z"),
    updatedAt: new Date("2024-01-20T10:06:00Z")
  },
  {
    id: "conv-2",
    userId: "user-1",
    agentId: "agent-2",
    title: "Instagram Content Strategy for Fitness Brand",
    messages: [
      {
        id: "msg-2-1",
        conversationId: "conv-2",
        content: "I need Instagram captions for our fitness brand. We focus on home workouts and healthy meal prep. Target audience is busy professionals aged 28-40.",
        type: "user",
        timestamp: new Date("2024-01-19T14:30:00Z")
      },
      {
        id: "msg-2-2",
        conversationId: "conv-2",
        content: "Great! Let me create engaging Instagram captions for your fitness brand. I'll focus on the busy professional lifestyle and make the content relatable and motivating.\n\nHere are 5 Instagram captions for different types of posts:",
        type: "ai",
        timestamp: new Date("2024-01-19T14:31:00Z")
      },
      {
        id: "msg-2-3",
        conversationId: "conv-2",
        content: "**Workout Motivation Post:**\n'No time for the gym? No problem! 💪\n\nThis 15-minute home workout will torch calories and build strength - perfect for busy professionals who want results without the commute.\n\nTag a friend who needs this reminder! 👇\n\n#HomeWorkout #BusyProfessional #FitnessMotivation #NoExcuses'",
        type: "ai",
        timestamp: new Date("2024-01-19T14:32:00Z"),
        metadata: {
          generatedCopy: {
            id: "copy-2-1",
            content: "No time for the gym? No problem! 💪\n\nThis 15-minute home workout will torch calories and build strength - perfect for busy professionals who want results without the commute.\n\nTag a friend who needs this reminder! 👇\n\n#HomeWorkout #BusyProfessional #FitnessMotivation #NoExcuses",
            preset: "custom",
            templateVariables: { platform: "Instagram", content_type: "workout" },
            createdAt: new Date("2024-01-19T14:32:00Z"),
            conversationId: "conv-2",
            isSaved: false
          }
        }
      },
      {
        id: "msg-2-4",
        conversationId: "conv-2",
        content: "**Meal Prep Sunday Post:**\n'Meal prep = success prep! 🥗\n\nSpend 2 hours on Sunday, eat healthy all week. This is how busy professionals stay on track with their nutrition goals.\n\nWhat's your favorite meal prep hack? Share below! 👇\n\n#MealPrep #HealthyEating #BusyLifestyle #NutritionGoals'",
        type: "ai",
        timestamp: new Date("2024-01-19T14:33:00Z"),
        metadata: {
          generatedCopy: {
            id: "copy-2-2",
            content: "Meal prep = success prep! 🥗\n\nSpend 2 hours on Sunday, eat healthy all week. This is how busy professionals stay on track with their nutrition goals.\n\nWhat's your favorite meal prep hack? Share below! 👇\n\n#MealPrep #HealthyEating #BusyLifestyle #NutritionGoals",
            preset: "custom",
            templateVariables: { platform: "Instagram", content_type: "meal_prep" },
            createdAt: new Date("2024-01-19T14:33:00Z"),
            conversationId: "conv-2",
            isSaved: false
          }
        }
      },
      {
        id: "msg-2-5",
        conversationId: "conv-2",
        content: "These are perfect! Can you create more captions for transformation stories and before/after posts?",
        type: "user",
        timestamp: new Date("2024-01-19T14:35:00Z")
      },
      {
        id: "msg-2-6",
        conversationId: "conv-2",
        content: "Absolutely! Here are powerful captions for transformation content:\n\n**Transformation Story:**\n'Real results, real people! 🙌\n\nSarah went from 'no time to exercise' to crushing her fitness goals with just 20 minutes a day. Her secret? Consistency over perfection.\n\nYour transformation is waiting. Ready to start? 💪\n\n#TransformationTuesday #RealResults #FitnessJourney #ConsistencyIsKey'",
        type: "ai",
        timestamp: new Date("2024-01-19T14:36:00Z"),
        metadata: {
          generatedCopy: {
            id: "copy-2-3",
            content: "Real results, real people! 🙌\n\nSarah went from 'no time to exercise' to crushing her fitness goals with just 20 minutes a day. Her secret? Consistency over perfection.\n\nYour transformation is waiting. Ready to start? 💪\n\n#TransformationTuesday #RealResults #FitnessJourney #ConsistencyIsKey",
            preset: "custom",
            templateVariables: { platform: "Instagram", content_type: "transformation" },
            createdAt: new Date("2024-01-19T14:36:00Z"),
            conversationId: "conv-2",
            isSaved: false
          }
        }
      }
    ],
    pinnedMessages: ["msg-2-3", "msg-2-6"],
    knowledgeBaseSnapshot: {
      id: "kb-2",
      userId: "user-1",
      companyName: "FitLife Pro",
      service: "Home Fitness & Nutrition",
      industry: "Fitness",
      niche: "Home Workouts for Busy Professionals",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-19"),
      version: 1
    },
    attachedMedia: ["media-2", "media-5"],
    createdAt: new Date("2024-01-19T14:30:00Z"),
    updatedAt: new Date("2024-01-19T14:36:00Z")
  },
  {
    id: "conv-3",
    userId: "user-1",
    agentId: "agent-3",
    title: "Email Subject Lines for E-commerce",
    messages: [
      {
        id: "msg-3-1",
        conversationId: "conv-3",
        content: "I need compelling email subject lines for our e-commerce store. We sell premium skincare products and want to increase open rates.",
        type: "user",
        timestamp: new Date("2024-01-18T09:15:00Z")
      },
      {
        id: "msg-3-2",
        conversationId: "conv-3",
        content: "Perfect! Email subject lines are crucial for open rates. Let me create some compelling options for your skincare brand that will make subscribers want to click.\n\nHere are 10 high-converting subject lines:",
        type: "ai",
        timestamp: new Date("2024-01-18T09:16:00Z")
      },
      {
        id: "msg-3-3",
        conversationId: "conv-3",
        content: "**Urgency & Scarcity:**\n1. 'Only 24 hours left: 50% off luxury skincare'\n2. 'Your cart is about to expire - don't lose these deals!'\n\n**Personalization:**\n3. 'Sarah, your skin type needs this serum'\n4. 'Based on your last purchase, you'll love this'\n\n**Curiosity:**\n5. 'The secret to glowing skin (dermatologists won't tell you)'\n6. 'What your skin is trying to tell you'\n\n**Social Proof:**\n7. 'Join 50,000+ customers with radiant skin'\n8. 'See the transformation (before & after)'\n\n**Value:**\n9. 'Free shipping + 3 free samples with your order'\n10. 'Your VIP discount is waiting inside'",
        type: "ai",
        timestamp: new Date("2024-01-18T09:17:00Z"),
        metadata: {
          generatedCopy: {
            id: "copy-3-1",
            content: "Only 24 hours left: 50% off luxury skincare\nYour cart is about to expire - don't lose these deals!\nSarah, your skin type needs this serum\nBased on your last purchase, you'll love this\nThe secret to glowing skin (dermatologists won't tell you)\nWhat your skin is trying to tell you\nJoin 50,000+ customers with radiant skin\nSee the transformation (before & after)\nFree shipping + 3 free samples with your order\nYour VIP discount is waiting inside",
            preset: "email-subject",
            templateVariables: { industry: "skincare", audience: "e-commerce customers" },
            createdAt: new Date("2024-01-18T09:17:00Z"),
            conversationId: "conv-3",
            isSaved: false
          }
        }
      },
      {
        id: "msg-3-4",
        conversationId: "conv-3",
        content: "These are great! Can you also create the email body copy for the first subject line about the 24-hour sale?",
        type: "user",
        timestamp: new Date("2024-01-18T09:20:00Z")
      },
      {
        id: "msg-3-5",
        conversationId: "conv-3",
        content: "Absolutely! Here's the complete email for the 24-hour sale:\n\n**Subject:** Only 24 hours left: 50% off luxury skincare\n\n**Email Body:**\n\nHi [First Name],\n\n⏰ The clock is ticking! Your exclusive 50% off luxury skincare sale ends in just 24 hours.\n\nDon't miss out on these premium products at half price:\n\n✨ Vitamin C Serum - Brightens & evens skin tone\n🌿 Hyaluronic Acid Moisturizer - Deep hydration\n🧴 Retinol Night Cream - Anti-aging powerhouse\n\n🔥 Limited quantities available\n🚚 Free shipping on orders over $50\n💳 Secure checkout\n\n[SHOP NOW] [View Cart]\n\nThis offer won't be repeated. Treat your skin to luxury at an unbeatable price.\n\nBest regards,\nThe [Brand Name] Team\n\nP.S. Questions? Reply to this email - we're here to help!",
        type: "ai",
        timestamp: new Date("2024-01-18T09:21:00Z"),
        metadata: {
          generatedCopy: {
            id: "copy-3-2",
            content: "Hi [First Name],\n\n⏰ The clock is ticking! Your exclusive 50% off luxury skincare sale ends in just 24 hours.\n\nDon't miss out on these premium products at half price:\n\n✨ Vitamin C Serum - Brightens & evens skin tone\n🌿 Hyaluronic Acid Moisturizer - Deep hydration\n🧴 Retinol Night Cream - Anti-aging powerhouse\n\n🔥 Limited quantities available\n🚚 Free shipping on orders over $50\n💳 Secure checkout\n\n[SHOP NOW] [View Cart]\n\nThis offer won't be repeated. Treat your skin to luxury at an unbeatable price.\n\nBest regards,\nThe [Brand Name] Team\n\nP.S. Questions? Reply to this email - we're here to help!",
            preset: "email-subject",
            templateVariables: { industry: "skincare", audience: "e-commerce customers" },
            createdAt: new Date("2024-01-18T09:21:00Z"),
            conversationId: "conv-3",
            isSaved: false
          }
        }
      }
    ],
    pinnedMessages: ["msg-3-3", "msg-3-5"],
    knowledgeBaseSnapshot: {
      id: "kb-3",
      userId: "user-1",
      companyName: "Glow Beauty",
      service: "Premium Skincare Products",
      industry: "Beauty & Skincare",
      niche: "Luxury Skincare E-commerce",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-18"),
      version: 1
    },
    attachedMedia: ["media-7", "media-9"],
    createdAt: new Date("2024-01-18T09:15:00Z"),
    updatedAt: new Date("2024-01-18T09:21:00Z")
  },
  {
    id: "conv-4",
    userId: "user-1",
    agentId: "agent-4",
    title: "Google Ads Copy for B2B Software",
    messages: [
      {
        id: "msg-4-1",
        conversationId: "conv-4",
        content: "I need Google Ads copy for our B2B accounting software. We help small businesses automate their bookkeeping. Target audience is business owners and accountants.",
        type: "user",
        timestamp: new Date("2024-01-17T11:45:00Z")
      },
      {
        id: "msg-4-2",
        conversationId: "conv-4",
        content: "Excellent! B2B Google Ads require a different approach than B2C. Let me create compelling ad copy that speaks to business decision-makers and emphasizes ROI and efficiency.\n\nHere are 3 Google Ads variations:",
        type: "ai",
        timestamp: new Date("2024-01-17T11:46:00Z")
      },
      {
        id: "msg-4-3",
        conversationId: "conv-4",
        content: "**Ad Group 1: Efficiency Focus**\n\nHeadline 1: Automated Bookkeeping Software\nHeadline 2: Save 20+ Hours Monthly\nHeadline 3: Free 30-Day Trial\n\nDescription: Streamline your accounting with AI-powered automation. Reduce manual data entry by 80%. Trusted by 5,000+ businesses.\n\n**Ad Group 2: Cost Savings**\n\nHeadline 1: Cut Accounting Costs by 60%\nHeadline 2: B2B Bookkeeping Software\nHeadline 3: Start Free Trial Today\n\nDescription: Reduce accounting expenses while improving accuracy. Automated reconciliation, reporting, and compliance. No setup fees.\n\n**Ad Group 3: Professional Services**\n\nHeadline 1: Accountant-Friendly Software\nHeadline 2: Streamline Client Work\nHeadline 3: Free Demo Available\n\nDescription: Built for accounting professionals. Manage multiple clients efficiently. Real-time collaboration and automated workflows.",
        type: "ai",
        timestamp: new Date("2024-01-17T11:47:00Z"),
        metadata: {
          generatedCopy: {
            id: "copy-4-1",
            content: "Automated Bookkeeping Software | Save 20+ Hours Monthly | Free 30-Day Trial\n\nStreamline your accounting with AI-powered automation. Reduce manual data entry by 80%. Trusted by 5,000+ businesses.",
            preset: "google",
            templateVariables: { industry: "B2B software", audience: "business owners" },
            createdAt: new Date("2024-01-17T11:47:00Z"),
            conversationId: "conv-4",
            isSaved: false
          }
        }
      },
      {
        id: "msg-4-4",
        conversationId: "conv-4",
        content: "These are perfect! Can you also suggest some negative keywords to avoid wasting budget?",
        type: "user",
        timestamp: new Date("2024-01-17T11:50:00Z")
      },
      {
        id: "msg-4-5",
        conversationId: "conv-4",
        content: "Absolutely! Here are negative keywords to add to your Google Ads campaigns to avoid irrelevant clicks:\n\n**General Negatives:**\n- free\n- online\n- app\n- mobile\n- personal\n- individual\n- student\n- tutorial\n- course\n- training\n\n**Competitor Negatives:**\n- quickbooks\n- xero\n- freshbooks\n- wave\n- sage\n\n**Irrelevant Business Types:**\n- restaurant\n- retail\n- ecommerce\n- dropshipping\n- affiliate\n\n**Job-Related Negatives:**\n- job\n- career\n- employment\n- salary\n- resume\n\n**Consumer Negatives:**\n- personal finance\n- budgeting\n- saving money\n- debt\n- credit card\n\nThis will help you target only business decision-makers and avoid consumer searches.",
        type: "ai",
        timestamp: new Date("2024-01-17T11:51:00Z"),
        metadata: {
          generatedCopy: {
            id: "copy-4-2",
            content: "Negative Keywords:\nfree, online, app, mobile, personal, individual, student, tutorial, course, training, quickbooks, xero, freshbooks, wave, sage, restaurant, retail, ecommerce, dropshipping, affiliate, job, career, employment, salary, resume, personal finance, budgeting, saving money, debt, credit card",
            preset: "google",
            templateVariables: { industry: "B2B software", audience: "business owners" },
            createdAt: new Date("2024-01-17T11:51:00Z"),
            conversationId: "conv-4",
            isSaved: false
          }
        }
      }
    ],
    pinnedMessages: ["msg-4-3", "msg-4-5"],
    knowledgeBaseSnapshot: {
      id: "kb-4",
      userId: "user-1",
      companyName: "AutoBooks Pro",
      service: "B2B Accounting Software",
      industry: "SaaS",
      niche: "Automated Bookkeeping for Small Businesses",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-17"),
      version: 1
    },
    attachedMedia: ["media-4", "media-12"],
    createdAt: new Date("2024-01-17T11:45:00Z"),
    updatedAt: new Date("2024-01-17T11:51:00Z")
  },
  {
    id: "conv-5",
    userId: "user-1",
    agentId: "agent-5",
    title: "Brand Voice Development for Tech Startup",
    messages: [
      {
        id: "msg-5-1",
        conversationId: "conv-5",
        content: "We're a tech startup launching a new AI-powered productivity tool. We need to develop our brand voice guidelines. We want to be seen as innovative but approachable.",
        type: "user",
        timestamp: new Date("2024-01-16T16:20:00Z")
      },
      {
        id: "msg-5-2",
        conversationId: "conv-5",
        content: "Great! Developing a consistent brand voice is crucial for tech startups. Let me help you create guidelines that balance innovation with approachability.\n\nHere's your brand voice framework:",
        type: "ai",
        timestamp: new Date("2024-01-16T16:21:00Z")
      },
      {
        id: "msg-5-3",
        conversationId: "conv-5",
        content: "**Brand Voice Pillars:**\n\n1. **Innovative but Human**\n- Use cutting-edge language without being intimidating\n- Explain complex features in simple terms\n- Show excitement about technology while staying grounded\n\n2. **Approachable Expert**\n- Be knowledgeable without being condescending\n- Use 'we' and 'you' to create connection\n- Share insights that help users succeed\n\n3. **Confident but Humble**\n- Believe in your product's capabilities\n- Acknowledge that users are smart and capable\n- Focus on partnership, not superiority\n\n**Tone Guidelines:**\n- Write at a 9th-grade reading level\n- Use active voice\n- Include specific examples and use cases\n- Avoid jargon unless necessary\n- Be conversational, not corporate",
        type: "ai",
        timestamp: new Date("2024-01-16T16:22:00Z"),
        metadata: {
          generatedCopy: {
            id: "copy-5-1",
            content: "Brand Voice Pillars:\n1. Innovative but Human - Use cutting-edge language without being intimidating\n2. Approachable Expert - Be knowledgeable without being condescending\n3. Confident but Humble - Believe in your product's capabilities\n\nTone Guidelines: Write at 9th-grade level, use active voice, include examples, avoid jargon, be conversational",
            preset: "custom",
            templateVariables: { industry: "tech startup", audience: "general" },
            createdAt: new Date("2024-01-16T16:22:00Z"),
            conversationId: "conv-5",
            isSaved: false
          }
        }
      },
      {
        id: "msg-5-4",
        conversationId: "conv-5",
        content: "This is exactly what we need! Can you provide some examples of how this voice would sound in different contexts?",
        type: "user",
        timestamp: new Date("2024-01-16T16:25:00Z")
      },
      {
        id: "msg-5-5",
        conversationId: "conv-5",
        content: "Perfect! Here are examples of your brand voice in different contexts:\n\n**Website Copy:**\n'We built this tool because we know how frustrating it is to juggle multiple apps. Our AI learns your workflow and brings everything together - no more switching between tabs or losing important information.'\n\n**Social Media:**\n'Just launched: Smart notifications that actually make sense! 🚀 Our AI figured out that you don't need alerts for everything - just the stuff that matters. Game changer for productivity.'\n\n**Email Marketing:**\n'Hey [Name],\n\nWe noticed you've been exploring our automation features. Want to see how other teams are saving 5+ hours per week? Here's a quick demo that shows exactly how it works.\n\nNo pressure - just thought you'd find it helpful!'\n\n**Customer Support:**\n'Thanks for reaching out! We totally get how frustrating that bug must be. Our team is already looking into it, and we'll have a fix ready by tomorrow. In the meantime, here's a workaround that should help.'\n\n**Product Updates:**\n'New feature alert! 🎉 We've added smart templates that adapt to your team's style. No more starting from scratch - just pick a template and customize it to match your workflow.'",
        type: "ai",
        timestamp: new Date("2024-01-16T16:26:00Z"),
        metadata: {
          generatedCopy: {
            id: "copy-5-2",
            content: "Website: 'We built this tool because we know how frustrating it is to juggle multiple apps. Our AI learns your workflow and brings everything together.'\n\nSocial Media: 'Just launched: Smart notifications that actually make sense! 🚀 Our AI figured out that you don't need alerts for everything - just the stuff that matters.'\n\nEmail: 'Hey [Name], We noticed you've been exploring our automation features. Want to see how other teams are saving 5+ hours per week?'\n\nSupport: 'Thanks for reaching out! We totally get how frustrating that bug must be. Our team is already looking into it.'\n\nUpdates: 'New feature alert! 🎉 We've added smart templates that adapt to your team's style.'",
            preset: "custom",
            templateVariables: { industry: "tech startup", audience: "general" },
            createdAt: new Date("2024-01-16T16:26:00Z"),
            conversationId: "conv-5",
            isSaved: false
          }
        }
      }
    ],
    pinnedMessages: ["msg-5-3", "msg-5-5"],
    knowledgeBaseSnapshot: {
      id: "kb-5",
      userId: "user-1",
      companyName: "FlowSync AI",
      service: "AI-Powered Productivity Tool",
      industry: "Technology",
      niche: "Workflow Automation for Teams",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-16"),
      version: 1
    },
    attachedMedia: ["media-6", "media-8"],
    createdAt: new Date("2024-01-16T16:20:00Z"),
    updatedAt: new Date("2024-01-16T16:26:00Z")
  }
]

// Enhanced Media Library Items
export const sampleMediaItems: MediaItem[] = [
  {
    id: "media-1",
    userId: "user-1",
    filename: "Brand Guidelines 2024.pdf",
    type: "pdf",
    size: 2048576,
    uploadedAt: new Date("2024-01-10"),
    content: "Comprehensive brand guidelines including voice, tone, and visual elements",
    tags: ["brand", "guidelines", "2024", "marketing"],
    metadata: { pages: 45, category: "branding" }
  },
  {
    id: "media-2",
    userId: "user-1", 
    filename: "Customer Testimonials.mp4",
    type: "video",
    size: 15728640,
    uploadedAt: new Date("2024-01-11"),
    content: "Video testimonials from satisfied customers",
    tags: ["testimonials", "video", "customers", "social-proof"],
    metadata: { duration: "3:45", resolution: "1080p" }
  },
  {
    id: "media-3",
    userId: "user-1",
    filename: "Product Catalog.docx",
    type: "doc", 
    size: 1048576,
    uploadedAt: new Date("2024-01-12"),
    content: "Complete product catalog with descriptions and pricing",
    tags: ["products", "catalog", "pricing", "features"],
    metadata: { products: 25, category: "catalog" }
  },
  {
    id: "media-4",
    userId: "user-1",
    filename: "Competitor Analysis.txt",
    type: "txt",
    size: 512000,
    uploadedAt: new Date("2024-01-13"),
    content: "Detailed analysis of competitor marketing strategies and messaging",
    tags: ["competitors", "analysis", "research", "strategy"],
    metadata: { competitors: 8, category: "research" }
  },
  {
    id: "media-5",
    userId: "user-1",
    filename: "Podcast Interview.mp3",
    type: "audio",
    size: 52428800,
    uploadedAt: new Date("2024-01-14"),
    content: "CEO interview about company vision and product benefits",
    tags: ["podcast", "interview", "ceo", "vision"],
    metadata: { duration: "45:30", format: "mp3" }
  },
  {
    id: "media-6",
    userId: "user-1",
    filename: "Blog Post - Industry Trends",
    type: "url",
    size: 0,
    uploadedAt: new Date("2024-01-15"),
    content: "Latest industry trends and insights for 2024",
    url: "https://example.com/blog/industry-trends-2024",
    tags: ["blog", "trends", "industry", "insights"],
    metadata: { wordCount: 2500, category: "content" }
  },
  {
    id: "media-7",
    userId: "user-1",
    filename: "Sales Scripts.pdf",
    type: "pdf",
    size: 1536000,
    uploadedAt: new Date("2024-01-16"),
    content: "Proven sales scripts for different customer segments",
    tags: ["sales", "scripts", "conversion", "b2b"],
    metadata: { scripts: 12, category: "sales" }
  },
  {
    id: "media-8",
    userId: "user-1",
    filename: "Webinar Recording.mp4",
    type: "video",
    size: 209715200,
    uploadedAt: new Date("2024-01-17"),
    content: "Educational webinar about product features and benefits",
    tags: ["webinar", "education", "features", "benefits"],
    metadata: { duration: "1:15:30", attendees: 500 }
  },
  {
    id: "media-9",
    userId: "user-1",
    filename: "Case Study - Success Story",
    type: "doc",
    size: 2048000,
    uploadedAt: new Date("2024-01-18"),
    content: "Detailed case study showing customer success and ROI",
    tags: ["case-study", "success", "roi", "customer"],
    metadata: { roi: "350%", category: "case-study" }
  },
  {
    id: "media-10",
    userId: "user-1",
    filename: "Industry Report 2024",
    type: "url",
    size: 0,
    uploadedAt: new Date("2024-01-19"),
    content: "Comprehensive industry report with market insights",
    url: "https://example.com/reports/industry-2024",
    tags: ["report", "industry", "market", "insights"],
    metadata: { pages: 120, category: "research" }
  },
  {
    id: "media-11",
    userId: "user-1",
    filename: "Product Demo Video.mp4",
    type: "video",
    size: 104857600,
    uploadedAt: new Date("2024-01-20"),
    content: "Step-by-step product demonstration video",
    tags: ["demo", "product", "video", "tutorial"],
    metadata: { duration: "8:45", resolution: "4K" }
  },
  {
    id: "media-12",
    userId: "user-1",
    filename: "Customer Survey Results.xlsx",
    type: "doc",
    size: 307200,
    uploadedAt: new Date("2024-01-21"),
    content: "Customer satisfaction survey results and insights",
    tags: ["survey", "customers", "feedback", "data"],
    metadata: { respondents: 1000, satisfaction: "92%" }
  },
  {
    id: "media-13",
    userId: "user-1",
    filename: "Press Release Template",
    type: "txt",
    size: 256000,
    uploadedAt: new Date("2024-01-22"),
    content: "Professional press release template and guidelines",
    tags: ["press", "template", "pr", "media"],
    metadata: { sections: 8, category: "templates" }
  },
  {
    id: "media-14",
    userId: "user-1",
    filename: "Social Media Calendar",
    type: "url",
    size: 0,
    uploadedAt: new Date("2024-01-23"),
    content: "Monthly social media content calendar and strategy",
    url: "https://example.com/calendar/social-media-q1",
    tags: ["calendar", "social-media", "content", "strategy"],
    metadata: { posts: 90, platforms: 5 }
  },
  {
    id: "media-15",
    userId: "user-1",
    filename: "Training Manual.pdf",
    type: "pdf",
    size: 5120000,
    uploadedAt: new Date("2024-01-24"),
    content: "Comprehensive training manual for new employees",
    tags: ["training", "manual", "employees", "onboarding"],
    metadata: { chapters: 15, category: "training" }
  }
] 