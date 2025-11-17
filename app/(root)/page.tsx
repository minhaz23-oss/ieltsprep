import Hero from '@/components/Hero';
import PracticeMode from '@/components/PracticeMode';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Stats from '@/components/Stats';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import FinalCTA from '@/components/FinalCTA';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="px-[5px] sm:px-[50px] lg:px-[100px]">
        <Hero />
      </div>
      
      {/* Practice Mode Section */}
      <div className="px-[5px] sm:px-[50px] lg:px-[100px]">
        <PracticeMode />
      </div>
      
      {/* Features Section */}
      <Features />
      
      {/* How It Works Section */}
      <div className="px-[5px] sm:px-[50px] lg:px-[100px]">
        <HowItWorks />
      </div>
      
      {/* Stats & Social Proof Section */}
      <Stats />
      
      {/* Pricing Section */}
      <Pricing />
      
      {/* FAQ Section */}
      <div className="px-[5px] sm:px-[50px] lg:px-[100px]">
        <FAQ />
      </div>
      
      {/* Final CTA Section */}
      <FinalCTA />
    </div>
  );
}
