import { FAQSection } from '@/features/landing/components/FAQSection'
import { FeaturesSection } from '@/features/landing/components/FeaturesSection'
import { FinalCTASection } from '@/features/landing/components/FinalCTASection'
import { Hero } from '@/features/landing/components/Hero'
import { HowItWorksSection } from '@/features/landing/components/HowItWorksSection'
import { LandingFooter } from '@/features/landing/components/LandingFooter'
import { LandingNavbar } from '@/features/landing/components/LandingNavbar'
import { LogosRow } from '@/features/landing/components/LogosRow'
import { PricingSection } from '@/features/landing/components/PricingSection'
import { StatsSection } from '@/features/landing/components/StatsSection'
import { WhyKomiSection } from '@/features/landing/components/WhyKomiSection'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <Hero />
      <LogosRow />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <WhyKomiSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <LandingFooter />
    </div>
  )
}
