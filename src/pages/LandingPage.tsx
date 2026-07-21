import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero"
import { SandboxWidget } from "@/components/sandbox-widget"
import { FeatureSection } from "@/components/feature-section"
import { FaqsSection } from "@/components/faqs-page"
import { CtaBanner } from "@/components/cta-banner"
import { Footer } from "@/components/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground dark pt-4 flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Header />
        
        <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-0">
          {/* 1. Hero Section */}
          <HeroSection />
          
          {/* 2. Live Sandbox Contribution Ledger Widget */}
          <SandboxWidget />
          
          {/* Spacer to transition to features */}
          <div className="py-12" />
          
          {/* 3. Features Section */}
          <FeatureSection />
          
          {/* 4. FAQs Section */}
          <FaqsSection />
          
          {/* 5. Call-to-Action Bottom Banner */}
          <CtaBanner />
          
          {/* 6. Footer aligned inside main */}
          <Footer />
        </main>
      </div>
    </div>
  )
}
