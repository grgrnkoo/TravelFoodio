import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Basic",
    price: "$9/month",
    features: ["AI meal planning", "Basic customization", "Limited support"],
  },
  {
    name: "Pro",
    price: "$19/month",
    features: ["All Basic features", "Advanced customization", "Priority support"],
  },
  {
    name: "Premium",
    price: "$29/month",
    features: ["All Pro features", "Personalized recommendations", "24/7 support"],
  },
];

export default function Pricing() {
  return (
    <div className="flex flex-col items-center py-12 px-8">
      <h2 className="text-3xl font-bold mb-6">Choose Your Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {plans.map((plan, index) => (
          <div key={index} className="border p-6 rounded-2xl shadow-lg flex flex-col items-center text-center">
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <p className="text-2xl font-bold mb-4">{plan.price}</p>
            <ul className="mb-6 space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="text-gray-700">✓ {feature}</li>
              ))}
            </ul>
            <Button className="w-full">Get Started</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
