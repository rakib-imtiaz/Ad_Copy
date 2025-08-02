import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingServices } from "@/components/landing/services";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="bg-gray-900 text-white">
      <LandingHeader />
      <main>
        <LandingHero />
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <LandingFeatures />
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <LandingServices />
      </main>
      <LandingFooter />
    </div>
  );
}