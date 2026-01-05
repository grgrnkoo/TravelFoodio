'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles } from 'lucide-react';

const plans = [
  {
    name: "Free",
    price: {
      monthly: "$0",
      yearly: "$0",
    },
    description: "Perfect for trying out our service",
    features: [
      { text: "AI meal planning", included: true },
      { text: "1 menu per day", included: true },
      { text: "Basic meal customization", included: true },
      { text: "Saved meal history", included: false },
      { text: "Priority support", included: false },
    ],
    available: true,
    popular: false,
    color: "from-slate-500 to-cyan-500",
  },
  {
    name: "Pro",
    price: {
      monthly: "$5",
      yearly: "$48",
    },
    description: "For serious meal planners",
    features: [
      { text: "Everything in Free", included: true },
      { text: "3 menus per day", included: true },
      { text: "Meal history & favorites", included: true },
      { text: "More flexible customization", included: true },
      { text: "Priority support", included: true },
    ],
    available: false,
    popular: false,
    color: "from-slate-500 to-pink-600",
    savings: "$12",
  },
  {
    name: "Premium",
    price: {
      monthly: "$9",
      yearly: "$84",
    },
    description: "The ultimate meal planning experience",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "5 menus per day", included: true },
      { text: "Detailed nutrition breakdown", included: true },
      { text: "Personalized tweaks", included: true },
      { text: "Export meals to grocery lists", included: true },
      { text: "24/7 support", included: true },
    ],
    available: false,
    popular: false,
    color: "from-slate-500 to-orange-500",
    savings: "$24",
  },
];

interface PlanType {
  name: string;
  price: { monthly: string; yearly: string };
  description: string;
  features: { text: string; included: boolean }[];
  available: boolean;
  popular: boolean;
  color: string;
  savings?: string;
}

function Plan({ plan, onClick, isYearly }: { plan: PlanType; onClick: (name: string) => void; isYearly: boolean }) {
  return (
    <div 
      className={`relative overflow-hidden border-2 rounded-3xl shadow-xl transition-all duration-300 flex flex-col h-full text-center min-w-[80%] md:min-w-0 snap-center hover:shadow-2xl hover:-translate-y-1 ${
        plan.popular ? "border-primary" : "border-transparent"
      }`}
    >
      {plan.popular && (
        <div className="absolute -right-12 top-8 rotate-45 bg-primary text-primary-foreground px-12 py-1 text-sm font-medium">
          Popular
        </div>
      )}
      
      {!plan.available && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-foreground z-10">
          <Sparkles className="w-10 h-10 mb-2 text-primary animate-pulse" />
          <p className="text-xl font-bold">Coming Soon</p>
          <p className="text-sm text-muted-foreground mt-1">Stay tuned for updates</p>
        </div>
      )}
      
      <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
        <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
        <p className="text-sm opacity-90 mb-4">{plan.description}</p>
        <div className="flex items-center justify-center">
          <span className="text-3xl font-extrabold">
            {isYearly ? plan.price.yearly : plan.price.monthly}
          </span>
          <span className="ml-1 text-sm opacity-90">
            /{isYearly ? "year" : "month"}
          </span>
        </div>
        {isYearly && plan.savings && (
          <Badge variant="outline" className="mt-2 bg-white/20 text-white border-0">
            Save {plan.savings} yearly
          </Badge>
        )}
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <ul className="mb-6 space-y-3 text-left flex-grow">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start">
              {feature.included ? (
                <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
              ) : (
                <X className="h-5 w-5 text-muted-foreground shrink-0 mr-2" />
              )}
              <span className={feature.included ? "" : "text-muted-foreground"}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
        
        <Button
          className="w-full mt-auto"
          variant={plan.popular ? "default" : "outline"}
          size="lg"
          disabled={!plan.available}
          onClick={() => onClick(plan.name)}
        >
          {plan.available ? "Get Started" : "Join Waitlist"}
        </Button>
      </div>
    </div>
  );
}

export default function PricingComponent() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  
  const handlePricingButtonClick = (plan: string) => {
    router.push(`/sign-up?plan=${plan.toLowerCase()}`);
  };

  return (
    <div className="container max-w-6xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Choose Your Plan
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Select the perfect meal planning package that fits your needs and budget
        </p>
        
        <div className="flex items-center justify-center mt-8 space-x-2">
          <span className={`text-sm ${!isYearly ? "font-medium text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-primary"
          />
          <span className={`text-sm ${isYearly ? "font-medium text-foreground" : "text-muted-foreground"}`}>
            Yearly
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
              Save 20%
            </Badge>
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <Plan 
            key={index} 
            plan={plan} 
            onClick={handlePricingButtonClick}
            isYearly={isYearly}
          />
        ))}
      </div>
    </div>
  );
}
