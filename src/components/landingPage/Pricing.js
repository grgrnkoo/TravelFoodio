import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "$0/month",
    features: ["✅ AI meal planning", "✅ 1 menu per day", "✅ Basic meal customization", "🚫 No saved meal history", "🚫 Limited support"],
    available: true
  },
  {
    name: "Pro",
    price: "$5/month",
    features: ["✅ Everything in Free", "✅ 3 menus per day (try different options & switch things up)", "✅ Meal history & favorites (save meals you like, so they don’t disappear)", "✅ More flexible customization (adjust meal types, tweak portion sizes)", "✅ Priority support"],
    available: false
  },
  {
    name: "Premium",
    price: "$9/month",
    features: ["✅ Everything in Pro", "✅ 5 menus per day (more flexibility, more meal ideas)", "✅ Detailed nutrition breakdown (calories, macros, and portion suggestions)", "✅ Personalized tweaks (improved AI suggestions over time based on feedback)", "✅ Export meals to grocery lists (get a simple ingredient list for shopping)", "✅ 24/7 support"],
    available: false
  },
];

function Plan({ plan, index }) {
  return (
    <div
      key={(index + 1) * 2}
      className="relative border p-6 rounded-2xl shadow-lg flex flex-col items-center justify-between h-full text-center"
    >
      {!plan.available && (
        <div className="absolute inset-0 bg-gray-200/60 backdrop-blur-sm flex items-center justify-center text-gray-700 text-lg font-semibold">
          Coming Soon
        </div>
      )}
      <div>
        <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
        <p className="text-2xl font-bold mb-4">{plan.price}</p>
      </div>
      <ul className="mb-6 space-y-2">
        {plan.features.map((feature, i) => (
          <li key={i} className={plan.available ? 'text-gray-800' : 'text-gray-400'}>{feature}</li>
        ))}
      </ul>
      <Button
        className="w-full"
        disabled={!plan.available}
      >{
          plan.available ?
            <span>Get Started</span> :
            <span>Stay tuned</span>
        }
      </Button>
    </div>
  )
}

export default function Pricing() {
  return (
    <div className="flex flex-col items-center py-12 px-8">
      <h2 className="text-3xl font-bold mb-6">Choose Your Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full h-full max-w-5xl">
        {plans.map((plan, index) => (
          <Plan plan={plan} index={index} key={index} />
        ))}
      </div>
    </div>
  );
}
