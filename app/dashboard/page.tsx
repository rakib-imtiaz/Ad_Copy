"use client"

import * as React from "react"
import { motion } from "motion/react"
import { 
  Menu, Search, Bell, User, MessageSquare, Plus, 
  Bot, Settings, Upload, FileText, Link2, Mic, 
  PanelLeftClose, PanelRightClose, Send, Paperclip,
  ChevronRight, MoreHorizontal, Star, Clock, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { AnimatedText, FadeInText, SlideInText, WordByWordText } from "@/components/ui/animated-text"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { sampleAgents, sampleConversations, sampleMediaItems } from "@/lib/sample-data"

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 48) return "Yesterday"
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export default function Dashboard() {
  const [leftPanelOpen, setLeftPanelOpen] = React.useState(true)
  const [rightPanelOpen, setRightPanelOpen] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<'files' | 'links' | 'transcripts'>('files')
  const [selectedAgent, setSelectedAgent] = React.useState("CopyMaster Pro")

  // Enhanced sample data
  const agents = sampleAgents.map((agent, index) => ({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    icon: ["📱", "📧", "🎯", "✍️", "🎨"][index] || "🤖"
  }))

  const conversations = sampleConversations.map(conv => ({
    id: conv.id,
    title: conv.title,
    agent: agents.find(a => a.id === conv.agentId)?.name || "Unknown Agent",
    lastMessage: conv.messages[conv.messages.length - 1]?.content.substring(0, 50) + "...",
    time: formatTimeAgo(conv.updatedAt),
    status: "active"
  }))

  const messages = [
    { role: "assistant", content: "Hi! I'm your Social Media Agent. I can help you create high-converting ad copy for Facebook, Instagram, and Twitter. What campaign are you working on today?", timestamp: "10:30 AM", animated: false },
    { role: "user", content: "I need to create Facebook ads for our summer sale. We're offering 30% off all products.", timestamp: "10:32 AM", animated: false },
    { role: "assistant", content: "Perfect! A summer sale with 30% off is great material. Let me create some compelling ad copy for you. I'll focus on urgency, value, and seasonal appeal.\n\n**Headline Options:**\n1. 🌞 Summer Sale: 30% Off Everything!\n2. Beat the Heat with 30% Savings\n3. Last Days of Summer - Save Big!\n\n**Primary Text:**\nDon't let summer slip away without scoring amazing deals! 🏖️\n\nFor a limited time, enjoy 30% off our entire collection. Whether you're updating your wardrobe or grabbing those items you've been eyeing all season - now's the time!\n\n✅ 30% off EVERYTHING\n✅ Free shipping on orders $50+\n✅ Limited time only\n\nWould you like me to create variations for different audiences or adjust the tone?", timestamp: "10:33 AM", animated: false },
    { role: "user", content: "Yes, please create variations for different audiences. We want to target both young professionals and families.", timestamp: "10:35 AM", animated: false },
    { role: "assistant", content: "Excellent! I'll create targeted variations for both audiences. Let me craft copy that speaks directly to their specific needs and lifestyles.\n\n**For Young Professionals (25-35):**\n\n**Headline:** Summer Style Upgrade - 30% Off Everything\n\n**Primary Text:**\nYour summer wardrobe needs a refresh! 🌟\n\nFrom office-to-weekend essentials, get 30% off our entire collection. Perfect for the professional who wants to look polished without breaking the bank.\n\n✨ Work-appropriate summer pieces\n✨ Weekend getaway essentials\n✨ Investment pieces at steal prices\n\nLimited time only - don't miss out!\n\n**Call-to-Action:** Shop Now", timestamp: "10:36 AM", animated: false },
    { role: "assistant", content: "**For Families (Parents 30-45):**\n\n**Headline:** Family Summer Sale - Everyone Gets 30% Off!\n\n**Primary Text:**\nSummer is here, and the whole family needs new gear! 👨‍👩‍👧‍👦\n\nFrom kids' swimwear to parents' vacation essentials, everyone gets 30% off. Stock up on everything you need for a memorable summer.\n\n👶 Kids' summer collection\n👕 Family matching outfits\n🏖️ Vacation essentials\n🎒 Back-to-school prep\n\nFree shipping on orders $75+\n\n**Call-to-Action:** Shop Family Sale", timestamp: "10:37 AM", animated: false },
    { role: "user", content: "These are great! Can you also create some Instagram Stories content for the same campaign?", timestamp: "10:38 AM", animated: false },
    { role: "assistant", content: "Absolutely! Instagram Stories are perfect for creating urgency and FOMO. Here are some engaging Story concepts for your summer sale:\n\n**Story 1 - Countdown Timer:**\n🎯 \"24 HOURS LEFT!\"\n🔥 Summer Sale ends tomorrow\n💥 30% off everything\n⏰ Don't miss out!\n\n**Story 2 - Before/After:**\n📸 \"Summer Style Transformation\"\nBefore: Basic summer look\nAfter: 🔥 30% off upgrade\n\"Your glow-up starts now!\"\n\n**Story 3 - User-Generated Content:**\n📱 \"Tag us in your summer looks!\"\n🎁 Best posts get featured\n🏆 Plus 50% off next purchase\n#SummerSale #StyleUpgrade", timestamp: "10:39 AM", animated: false },
    { role: "assistant", content: "**Story 4 - Flash Sale Alert:**\n⚡ FLASH SALE ALERT ⚡\n🔥 4 hours only\n💎 30% off + free shipping\n🎯 Limited quantities\nSwipe up to shop now!\n\n**Story 5 - Social Proof:**\n📊 \"What our customers are saying:\"\n💬 \"Best summer sale ever!\" - Sarah\n💬 \"Got everything I needed!\" - Mike\n💬 \"Amazing deals!\" - Jessica\n\n**Story 6 - Product Showcase:**\n🛍️ \"Summer Must-Haves\"\n👗 Dresses: $45 (was $65)\n👕 Tops: $28 (was $40)\n👖 Shorts: $35 (was $50)\nSwipe to see more! 👉", timestamp: "10:40 AM", animated: false },
    { role: "user", content: "Perfect! Can you also suggest some hashtags for the Instagram posts?", timestamp: "10:41 AM", animated: false },
    { role: "assistant", content: "Here are strategic hashtag combinations for your summer sale campaign:\n\n**Primary Hashtags (High Reach):**\n#SummerSale #Sale #Discount #Fashion #Style\n\n**Seasonal Hashtags:**\n#SummerFashion #SummerStyle #SummerVibes #Summer2024 #SummerCollection\n\n**Sale-Specific Hashtags:**\n#30Off #DiscountCode #FashionSale #StyleSale #ClothingSale\n\n**Lifestyle Hashtags:**\n#Fashionista #StyleBlogger #FashionBlogger #OOTD #FashionInspo\n\n**Brand Hashtags:**\n#[YourBrandName] #[YourBrandName]Sale #[YourBrandName]Summer\n\n**Recommended Combinations:**\n\n**For Young Professionals:**\n#SummerSale #SummerStyle #Fashion #Style #30Off #Fashionista #OOTD\n\n**For Families:**\n#SummerSale #FamilyFashion #SummerVibes #KidsFashion #FamilyStyle #30Off", timestamp: "10:42 AM", animated: false },
    { role: "assistant", content: "**Pro Tips for Hashtag Strategy:**\n\n1. **Mix of Reach & Relevance:** Use 3-5 high-reach hashtags + 5-7 niche hashtags\n\n2. **Location-Based:** Add #[YourCity]Fashion or #[YourCity]Style for local reach\n\n3. **Trending:** Monitor #SummerSale, #FashionSale for trending variations\n\n4. **Engagement:** Include #[YourBrandName] to encourage user-generated content\n\n5. **Avoid Spam:** Don't use more than 30 hashtags total\n\n**Best Time to Post:**\n- Instagram: Tuesday-Thursday, 11 AM - 3 PM\n- Facebook: Wednesday-Friday, 1 PM - 4 PM\n\nWould you like me to create a complete posting schedule for this campaign?", timestamp: "10:43 AM", animated: false },
    { role: "user", content: "Yes, that would be very helpful! Please create a 2-week posting schedule.", timestamp: "10:44 AM", animated: false },
    { role: "assistant", content: "Perfect! Here's a comprehensive 2-week posting schedule for your summer sale campaign:\n\n**Week 1 - Launch & Awareness:**\n\n**Monday (Day 1):**\n📱 Instagram Post: \"Summer Sale is HERE! 🌞\"\n📘 Facebook Post: \"Don't miss our biggest sale of the season\"\n⏰ Best time: 2 PM\n\n**Tuesday (Day 2):**\n📱 Instagram Story: Countdown timer + product showcase\n📘 Facebook Ad: Young professionals targeting\n⏰ Best time: 1 PM\n\n**Wednesday (Day 3):**\n📱 Instagram Post: Before/after transformation\n📘 Facebook Post: Family-focused content\n⏰ Best time: 3 PM\n\n**Thursday (Day 4):**\n📱 Instagram Story: Flash sale alert\n📘 Facebook Ad: Retargeting previous visitors\n⏰ Best time: 2 PM", timestamp: "10:45 AM", animated: false },
    { role: "assistant", content: "**Friday (Day 5):**\n📱 Instagram Post: User-generated content showcase\n📘 Facebook Post: \"Weekend shopping guide\"\n⏰ Best time: 4 PM\n\n**Saturday (Day 6):**\n📱 Instagram Story: Weekend flash sale\n📘 Facebook Ad: Weekend shoppers\n⏰ Best time: 11 AM\n\n**Sunday (Day 7):**\n📱 Instagram Post: \"Last day of week 1!\"\n📘 Facebook Post: Weekly roundup + preview of week 2\n⏰ Best time: 3 PM\n\n**Week 2 - Urgency & Closing:**\n\n**Monday (Day 8):**\n📱 Instagram Post: \"Final week starts NOW!\"\n📘 Facebook Ad: Urgency messaging\n⏰ Best time: 2 PM", timestamp: "10:46 AM", animated: false },
    { role: "assistant", content: "**Tuesday (Day 9):**\n📱 Instagram Story: \"Only 5 days left!\"\n📘 Facebook Post: Customer testimonials\n⏰ Best time: 1 PM\n\n**Wednesday (Day 10):**\n📱 Instagram Post: \"Midweek madness - extra 10% off!\"\n📘 Facebook Ad: Midweek special\n⏰ Best time: 3 PM\n\n**Thursday (Day 11):**\n📱 Instagram Story: \"3 days remaining\"\n📘 Facebook Post: \"Don't wait until the last minute\"\n⏰ Best time: 2 PM\n\n**Friday (Day 12):**\n📱 Instagram Post: \"Final weekend alert!\"\n📘 Facebook Ad: Weekend urgency\n⏰ Best time: 4 PM", timestamp: "10:47 AM", animated: false },
    { role: "assistant", content: "**Saturday (Day 13):**\n📱 Instagram Story: \"Last 24 hours!\"\n📘 Facebook Post: \"Final countdown begins\"\n⏰ Best time: 11 AM\n\n**Sunday (Day 14):**\n📱 Instagram Post: \"Sale ends at midnight!\"\n📘 Facebook Post: \"Last chance to save 30%\"\n⏰ Best time: 3 PM\n\n**Content Mix Strategy:**\n- 40% Product-focused posts\n- 30% Lifestyle/aspirational content\n- 20% User-generated content\n- 10% Behind-the-scenes\n\n**Engagement Boosters:**\n- Ask questions in captions\n- Use polls in Stories\n- Encourage tagging friends\n- Create shareable content\n\nWould you like me to create the actual post captions for any of these days?", timestamp: "10:48 AM", animated: false },
    { role: "user", content: "Yes, please create the captions for the first week!", timestamp: "10:49 AM", animated: false },
    { role: "assistant", content: "**Week 1 Captions - Ready to Post!**\n\n**Monday (Day 1) - Launch:**\n\n📱 **Instagram:**\n\"Summer Sale is HERE! 🌞🔥\n\n30% off EVERYTHING starts NOW!\n\nFrom beach essentials to office upgrades, we've got your summer style covered. Don't wait - these deals won't last!\n\n✅ 30% off entire collection\n✅ Free shipping on orders $50+\n✅ Limited time only\n\nShop now before your size sells out! 👇\n\n#SummerSale #SummerFashion #30Off #FashionSale #SummerStyle #StyleUpgrade #Fashionista #OOTD #SummerVibes #FashionInspo\"\n\n📘 **Facebook:**\n\"The moment you've been waiting for is finally here! 🎉\n\nOur biggest summer sale of the season starts TODAY with 30% off everything in our collection.\n\nWhether you're planning a beach vacation, updating your work wardrobe, or just want to refresh your style for the season, now's the perfect time to shop.\n\nWhat's on your summer shopping list? Comment below! 👇\n\n#SummerSale #FashionSale #30Off #SummerStyle\"", timestamp: "10:50 AM", animated: false },
    { role: "assistant", content: "**Tuesday (Day 2) - Young Professionals:**\n\n📱 **Instagram:**\n\"Young professionals, this one's for you! 💼✨\n\nSummer Style Upgrade - 30% Off Everything\n\nYour summer wardrobe needs a refresh! From office-to-weekend essentials, get 30% off our entire collection. Perfect for the professional who wants to look polished without breaking the bank.\n\n✨ Work-appropriate summer pieces\n✨ Weekend getaway essentials\n✨ Investment pieces at steal prices\n\nTag a friend who needs this! 👇\n\n#YoungProfessional #SummerStyle #OfficeFashion #WeekendVibes #30Off #FashionSale #StyleUpgrade #ProfessionalStyle #SummerFashion #Fashionista\"\n\n📘 **Facebook:**\n\"Attention young professionals! 💼\n\nYour summer wardrobe upgrade is waiting. Get 30% off our entire collection - perfect for that office-to-weekend transition.\n\nWhat's your biggest summer style challenge? Let us know in the comments! 👇\n\n#YoungProfessional #SummerStyle #OfficeFashion #30Off\"", timestamp: "10:51 AM", animated: false },
    { role: "assistant", content: "**Wednesday (Day 3) - Family Focus:**\n\n📱 **Instagram:**\n\"Family Summer Sale - Everyone Gets 30% Off! 👨‍👩‍👧‍👦\n\nSummer is here, and the whole family needs new gear! From kids' swimwear to parents' vacation essentials, everyone gets 30% off.\n\n👶 Kids' summer collection\n👕 Family matching outfits\n🏖️ Vacation essentials\n🎒 Back-to-school prep\n\nStock up on everything you need for a memorable summer!\n\nFree shipping on orders $75+ 🚚\n\n#FamilyFashion #KidsFashion #SummerSale #FamilyStyle #30Off #SummerVibes #FamilyTime #KidsStyle #SummerFashion #FamilyGoals\"\n\n📘 **Facebook:**\n\"Families, unite! 👨‍👩‍👧‍👦\n\nOur family summer sale is here with 30% off everything for everyone in your household. From the littlest ones to the grown-ups, we've got summer covered.\n\nWhat's your family's summer tradition? Share in the comments! 👇\n\n#FamilyFashion #SummerSale #FamilyStyle #30Off\"", timestamp: "10:52 AM", animated: false },
    { role: "assistant", content: "**Thursday (Day 4) - Flash Sale:**\n\n📱 **Instagram:**\n\"⚡ FLASH SALE ALERT ⚡\n\n4 HOURS ONLY!\n\n30% off + FREE shipping on everything!\n\nLimited quantities available - don't miss out on these incredible deals!\n\n⏰ Sale ends at 6 PM today\n🔥 First come, first served\n💎 Premium quality at discount prices\n\nShop now before it's gone! 👇\n\n#FlashSale #SummerSale #30Off #FreeShipping #LimitedTime #FashionSale #UrgentSale #FlashDeal #SummerFashion #StyleUpgrade\"\n\n📘 **Facebook:**\n\"⚡ FLASH SALE ALERT ⚡\n\nOnly 4 hours left to get 30% off + FREE shipping on everything!\n\nThis is your chance to grab those items you've been eyeing at unbeatable prices. Limited quantities available!\n\nWhat's the first thing you're adding to your cart? 👇\n\n#FlashSale #SummerSale #30Off #FreeShipping\"", timestamp: "10:53 AM", animated: false },
    { role: "assistant", content: "**Friday (Day 5) - User-Generated Content:**\n\n📱 **Instagram:**\n\"Real customers, real results! 🙌\n\nThank you to everyone who's been sharing their summer sale hauls! We love seeing how you're styling your new pieces.\n\n📸 @sarah_style - \"Best summer sale ever!\"\n📸 @mike_fashion - \"Got everything I needed!\"\n📸 @jessica_style - \"Amazing deals!\"\n\nKeep tagging us in your posts for a chance to be featured! 🏆\n\nPlus, the best posts get 50% off their next purchase! 🎁\n\n#CustomerSpotlight #SummerSale #UserGeneratedContent #StyleInspo #CustomerLove #SummerFashion #FashionCommunity #StyleUpgrade #CustomerTestimonials #Fashionista\"\n\n📘 **Facebook:**\n\"Customer spotlight! 🙌\n\nWe're loving all the amazing feedback from our summer sale customers. Thank you for sharing your style with us!\n\nWhat's your favorite purchase from the sale so far? Share in the comments! 👇\n\n#CustomerSpotlight #SummerSale #CustomerLove\"", timestamp: "10:54 AM", animated: false },
    { role: "assistant", content: "**Saturday (Day 6) - Weekend Flash:**\n\n📱 **Instagram:**\n\"Weekend warriors, this is for you! 🎉\n\nWeekend Flash Sale - 24 hours only!\n\n30% off + extra 10% off with code WEEKEND\n\nPerfect timing for your weekend shopping spree! From casual weekend looks to date night essentials, we've got you covered.\n\n⏰ Sale ends Sunday at midnight\n🎯 Limited time weekend code\n💎 Premium quality at unbeatable prices\n\nShop the weekend sale now! 👇\n\n#WeekendSale #SummerSale #30Off #WeekendVibes #FashionSale #WeekendStyle #SummerFashion #StyleUpgrade #WeekendWarrior #Fashionista\"\n\n📘 **Facebook:**\n\"Weekend warriors! 🎉\n\nSpecial weekend flash sale - 30% off + extra 10% off with code WEEKEND. Perfect for your weekend shopping!\n\nWhat are your weekend plans? Shopping included? 👇\n\n#WeekendSale #SummerSale #30Off\"", timestamp: "10:55 AM", animated: false },
    { role: "assistant", content: "**Sunday (Day 7) - Week 1 Wrap-up:**\n\n📱 **Instagram:**\n\"Week 1 of our Summer Sale is coming to an end! 🌞\n\nBut don't worry - we still have 7 more days of amazing deals!\n\n🔥 30% off everything continues\n🚚 Free shipping on orders $50+\n🎯 New arrivals added daily\n\nThis week's highlights:\n✅ Launched with a bang\n✅ Featured customer spotlights\n✅ Weekend flash sales\n✅ Family-focused content\n\nWeek 2 starts tomorrow with even more excitement! Stay tuned for:\n🎁 Daily flash sales\n📸 More customer features\n⚡ Urgency messaging\n🎯 Final countdown\n\n#SummerSale #Week1Wrap #SummerFashion #30Off #FashionSale #Week1Complete #SummerStyle #StyleUpgrade #Fashionista #Week2Coming\"\n\n📘 **Facebook:**\n\"Week 1 of our summer sale is wrapping up! 🌞\n\nWhat an amazing week it's been! Thank you to everyone who shopped with us. The deals continue for 7 more days!\n\nWhat was your favorite part of week 1? 👇\n\n#SummerSale #Week1Wrap #30Off\"", timestamp: "10:56 AM", animated: false },
    { role: "assistant", content: "**Content Performance Tips:**\n\n📊 **Best Performing Times:**\n- Instagram: 2-3 PM weekdays, 11 AM weekends\n- Facebook: 1-4 PM weekdays, 3 PM weekends\n\n📈 **Engagement Boosters:**\n- Ask questions in every caption\n- Use 10-15 relevant hashtags\n- Encourage tagging friends\n- Create shareable content\n- Respond to comments within 1 hour\n\n🎯 **Call-to-Action Variations:**\n- \"Shop now\" (direct)\n- \"Tag a friend\" (social)\n- \"Comment below\" (engagement)\n- \"Swipe up\" (Stories)\n- \"Save this post\" (algorithm boost)\n\nWould you like me to create the week 2 captions as well, or would you prefer to see how week 1 performs first?", timestamp: "10:57 AM", animated: false }
  ]

  return (
    <div className="min-h-screen bg-white text-[#393E46] font-sans">
      {/* Header */}
      <header className="h-14 border-b border-[#EEEEEE] bg-white px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 bg-white border-[#EEEEEE]">
                <MobileSidebar agents={agents} conversations={conversations} />
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#393E46]">
              <span className="text-sm font-bold text-white">C</span>
            </div>
            <span className="font-semibold text-lg hidden sm:block">CopyForge</span>
          </div>

          {/* Active Agent Chip */}
          <div className="hidden md:flex items-center space-x-2 bg-[#F7F7F7] px-3 py-1.5 rounded-full border border-[#EEEEEE]">
            <Bot className="h-4 w-4 text-[#393E46]" />
            <span className="text-sm font-medium">{selectedAgent}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Desktop panel toggles */}
          <TooltipProvider>
            <div className="hidden xl:flex items-center space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                    className="h-8 w-8 text-[#929AAB] hover:text-[#393E46] hover:bg-[#F7F7F7]"
                  >
                    <PanelLeftClose className={`h-4 w-4 transition-transform ${!leftPanelOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{leftPanelOpen ? 'Hide sidebar' : 'Show sidebar'}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                    className="h-8 w-8 text-[#929AAB] hover:text-[#393E46] hover:bg-[#F7F7F7]"
                  >
                    <PanelRightClose className={`h-4 w-4 transition-transform ${!rightPanelOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{rightPanelOpen ? 'Hide media library' : 'Show media library'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#929AAB] hover:text-[#393E46] hover:bg-[#F7F7F7]">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#393E46] text-white text-xs">SJ</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left Sidebar - Agents & Conversations */}
        <motion.div 
          className={`hidden lg:flex flex-col bg-[#F7F7F7] border-r border-[#EEEEEE] transition-all duration-300 ${
            leftPanelOpen ? 'w-80' : 'w-0'
          }`}
          initial={false}
          animate={{ width: leftPanelOpen ? 320 : 0 }}
        >
          <div className="flex-1 overflow-y-auto">
            <LeftSidebar agents={agents} conversations={conversations} selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent} />
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white h-full">
          <div className="flex-1 w-full bg-white h-full">
            <ChatInterface messages={messages} selectedAgent={selectedAgent} />
          </div>
        </div>

        {/* Right Media Drawer */}
        <motion.div 
          className={`hidden xl:flex flex-col bg-[#F7F7F7] border-l border-[#EEEEEE] transition-all duration-300 ${
            rightPanelOpen ? 'w-96' : 'w-0'
          }`}
          initial={false}
          animate={{ width: rightPanelOpen ? 384 : 0 }}
        >
          <div className="flex-1 overflow-y-auto">
            <MediaDrawer activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </motion.div>
      </div>

      {/* Mobile New Chat FAB */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button className="h-14 w-14 rounded-full bg-[#393E46] hover:bg-[#2C3036] shadow-lg">
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  )
}

// Left Sidebar Component
function LeftSidebar({ agents, conversations, selectedAgent, onSelectAgent }: any) {
  return (
    <div className="h-full flex flex-col">
      {/* Agents Section */}
      <div className="p-4 border-b border-[#EEEEEE]">
        <h3 className="text-xs font-medium text-[#929AAB] uppercase tracking-wider mb-3">Agents</h3>
        <div className="space-y-1">
          {agents.map((agent: any) => (
            <motion.button
              key={agent.id}
              onClick={() => onSelectAgent(agent.name)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedAgent === agent.name 
                  ? 'bg-white border border-[#EEEEEE] shadow-sm' 
                  : 'hover:bg-white/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{agent.icon}</span>
                <div className="flex-1 min-w-0">
                  <FadeInText text={agent.name} className="font-medium text-sm truncate" delay={agent.id * 0.1} />
                  <FadeInText text={agent.description} className="text-xs text-[#929AAB] whitespace-normal" delay={agent.id * 0.1 + 0.05} />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Conversations Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-[#929AAB] uppercase tracking-wider">Conversations</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-[#929AAB] hover:text-[#393E46] hover:bg-white/50">
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="space-y-1">
          {conversations.map((conv: any) => (
            <motion.div
              key={conv.id}
              className="p-3 rounded-lg hover:bg-white/50 cursor-pointer border border-transparent hover:border-[#EEEEEE]"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-medium text-sm truncate pr-2">{conv.title}</h4>
                <span className="text-xs text-[#929AAB] flex-shrink-0">{conv.time}</span>
              </div>
              <p className="text-xs text-[#929AAB] mb-2 line-clamp-2">{conv.lastMessage}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#929AAB]">{conv.agent}</span>
                <div className={`w-2 h-2 rounded-full ${
                  conv.status === 'active' ? 'bg-green-400' : 
                  conv.status === 'review' ? 'bg-yellow-400' : 'bg-gray-400'
                }`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Mobile Sidebar Component
function MobileSidebar({ agents, conversations }: any) {
  return (
    <div className="h-full relative flex flex-col bg-white">
      <div className="p-4 border-b border-[#EEEEEE]">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#393E46]">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <div>
            <div className="font-semibold">CopyForge</div>
            <div className="text-xs text-[#929AAB]">AI Ad Copy Platform</div>
          </div>
        </div>
      </div>
      <LeftSidebar agents={agents} conversations={conversations} selectedAgent="Social Media Agent" onSelectAgent={() => {}} />
    </div>
  )
}

// Chat Interface Component
function ChatInterface({ messages, selectedAgent }: any) {
  const [input, setInput] = React.useState("")

  return (
    <div className="h-full relative flex flex-col bg-white" style={{ height: '100vh' }}>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-white pb-40" style={{ height: 'calc(100vh - 300px)', maxHeight: 'calc(100vh - 300px)' }}>
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {messages.map((message: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-[#F1F2F4] border border-[#EEEEEE]' 
                    : 'bg-white border border-[#EEEEEE] shadow-sm'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.isTyping ? (
                      <AnimatedText text={message.content} variant="typing" />
                    ) : message.animated ? (
                      <WordByWordText text={message.content} delay={0.1} />
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
                <div className={`text-xs text-[#929AAB] mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-[#EEEEEE] bg-white sticky bottom-0 left-0 right-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message your AI agent..."
              className="w-full min-h-[48px] max-h-40 p-3 pr-12 border border-[#EEEEEE] rounded-xl resize-none focus:ring-2 focus:ring-[#393E46] focus:border-transparent focus:outline-none text-sm"
              style={{ fieldSizing: 'content' } as any}
            />
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#929AAB] hover:text-[#393E46] hover:bg-[#F7F7F7]">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Attach file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" className="h-8 w-8 bg-[#393E46] hover:bg-[#2C3036]">
                      <Send className="h-4 w-4 text-white" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-[#929AAB] hover:text-[#393E46] hover:bg-[#F7F7F7]">
                      <Upload className="h-3 w-3 mr-1" />
                      /upload
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload files to media library</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-[#929AAB] hover:text-[#393E46] hover:bg-[#F7F7F7]">
                      <Mic className="h-3 w-3 mr-1" />
                      /transcribe
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Transcribe audio or video files</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
              <div className="text-xs text-[#929AAB]">
                Press Enter to send
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Media Drawer Component  
function MediaDrawer({ activeTab, onTabChange }: any) {
  const tabs = [
    { id: 'files' as const, label: 'Files', icon: FileText },
    { id: 'links' as const, label: 'Links', icon: Link2 },
    { id: 'transcripts' as const, label: 'Transcripts', icon: Mic },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header with tabs */}
      <div className="border-b border-[#EEEEEE] p-4">
        <SlideInText text="Media Library" className="font-medium mb-3" />
        <div className="flex space-x-1 bg-[#EEEEEE] p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-white text-[#393E46] shadow-sm' 
                  : 'text-[#929AAB] hover:text-[#393E46]'
              }`}
            >
              <tab.icon className="h-3 w-3" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'files' && <FilesTab />}
        {activeTab === 'links' && <LinksTab />}
        {activeTab === 'transcripts' && <TranscriptsTab />}
      </div>
    </div>
  )
}

// Media Tab Components
function FilesTab() {
  const [dragActive, setDragActive] = React.useState(false)
  
  const fileItems = sampleMediaItems.filter(item => 
    ['pdf', 'doc', 'txt', 'audio', 'video'].includes(item.type)
  )

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-[#393E46] bg-[#F4F5F7]' 
            : 'border-[#EEEEEE] hover:border-[#393E46] hover:bg-[#F4F5F7]'
        }`}
      >
        <Upload className="h-6 w-6 text-[#929AAB] mx-auto mb-2" />
        <FadeInText text="Drop files here" className="text-sm font-medium mb-1" />
        <FadeInText text="or click to browse" className="text-xs text-[#929AAB]" delay={0.1} />
      </div>

      {/* File list */}
      <div className="space-y-2">
        {fileItems.slice(0, 8).map((item, index) => (
          <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#EEEEEE]">
            <FileText className="h-4 w-4 text-[#929AAB]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.filename}</p>
              <p className="text-xs text-[#929AAB]">
                {item.size ? `${(item.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'} • {formatTimeAgo(item.uploadedAt)}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function LinksTab() {
  const urlItems = sampleMediaItems.filter(item => item.type === 'url')
  
  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input placeholder="Paste URL here..." className="flex-1 text-sm border-[#EEEEEE] focus:ring-[#393E46] focus:border-[#393E46]" />
        <Button size="sm" className="bg-[#393E46] hover:bg-[#2C3036]">Add</Button>
      </div>
      
      <div className="space-y-2">
        {urlItems.map((item, index) => (
          <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#EEEEEE]">
            <Link2 className="h-4 w-4 text-[#929AAB]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.filename}</p>
              <p className="text-xs text-[#929AAB]">Scraped • {formatTimeAgo(item.uploadedAt)}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function TranscriptsTab() {
  const audioVideoItems = sampleMediaItems.filter(item => 
    ['audio', 'video'].includes(item.type)
  )
  
  return (
    <div className="space-y-4">
      {audioVideoItems.length > 0 ? (
        <div className="space-y-2">
          {audioVideoItems.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#EEEEEE]">
              <Mic className="h-4 w-4 text-[#929AAB]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.filename}</p>
                <p className="text-xs text-[#929AAB]">
                  {item.metadata?.duration || 'Unknown duration'} • {formatTimeAgo(item.uploadedAt)}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Mic className="h-8 w-8 text-[#929AAB] mx-auto mb-2" />
          <p className="text-sm text-[#929AAB]">No transcripts yet</p>
          <p className="text-xs text-[#929AAB] mt-1">Upload audio or video files to transcribe</p>
        </div>
      )}
    </div>
  )
}