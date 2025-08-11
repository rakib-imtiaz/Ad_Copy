import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingServices } from "@/components/landing/services";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="rfa-theme bg-rfa-white text-rfa-black min-h-screen">
      <LandingHeader />
      <main className="relative">
        <LandingHero />
        <div className="h-px w-full bg-gradient-to-r from-transparent via-rfa-border to-transparent" />
        <LandingFeatures />
        <div className="h-px w-full bg-gradient-to-r from-transparent via-rfa-border to-transparent" />
        <LandingServices />
      </main>
      <LandingFooter />
    </div>
  );
}