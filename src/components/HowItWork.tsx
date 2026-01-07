import { ClipboardCheck, Utensils, Settings } from "lucide-react";
import Image from "next/image";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Complete onboarding",
    description: "A quick, friendly chat — just 4-5 easy questions — to figure out what works best for you.",
  },
  {
    icon: Utensils,
    title: "Start using TravelFoodio",
    description: "Every liked or disliked meal fine-tunes your preferences, helping TravelFoodio suggest better meals just for you.",
  },
  {
    icon: Settings,
    title: "Plans changed? Just update your profile",
    description: "Traveling or adjusting your goals? No waiting — edit your profile, and your next meal adapts instantly.",
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Getting started with TravelFoodio is simple. Follow these steps to enjoy personalized meal planning.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold mb-6">
                  <step.icon className="h-8 w-8" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white border-2 border-primary text-primary text-xs items-center justify-center hidden md:flex">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
