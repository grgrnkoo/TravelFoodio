import Link from "next/link";
import { Button } from "@/components/ui/button";
import Pricing from "@/components/landingPage/Pricing";
import KeyAdvantages from "@/components/KeyAdvantages";
import HowItWorks from "@/components/HowItWork";
import CTASection2 from "@/components/CtaSection2";
import CTASection from "@/components/CtaSection";
import HeroAIMenu from "@/components/HeroAiMenu";

export default function Home() {

  return (
    <div className="w-full">
      <HeroAIMenu />
      <div id='keyAdvantages'>
        <KeyAdvantages />
      </div>
      <CTASection />
      <div id='howItWorks'>
        <HowItWorks />
      </div>

      {/* <div id='testimonials'>
      
      </div> */}
      <div id='plans'>
        <Pricing />
      </div>
      <div id='cta' className="flex flex-col items-center justify-center w-full">
        <CTASection2 />
      </div>
    </div>
  );
}


