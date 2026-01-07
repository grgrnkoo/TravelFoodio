"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CTASection() {
    return (
        <section className="py-20 bg-gradient-to-b from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 w-full">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    Ready to transform your meal planning?
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
                    Join users who have simplified their meal planning with TravelFoodio.
                </p>

                <div className="flex flex-col items-center">
                    <Link href="/sign-up?source=cta-why">
                        <Button size="lg" className="px-8 py-6 text-lg">
                            Start free
                        </Button>
                    </Link>
                    <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                        No credit card required • Cancel anytime
                    </div>
                </div>
            </div>

        </section>
    )
}

