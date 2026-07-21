import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero"
import { FeatureSection } from "@/components/feature-section"
import { FaqsSection } from "@/components/faqs-page"
import { Footer } from "@/components/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground dark pt-4 flex flex-col justify-between">
      <div>
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-24">
          {/* Hero Section */}
          <HeroSection />
          
          {/* Features Section */}
          <FeatureSection />
          
          {/* FAQs Section */}
          <FaqsSection />
          
          {/* Footer aligned inside main */}
          <Footer />
        </main>
      </div>
    </div>
  )
}
