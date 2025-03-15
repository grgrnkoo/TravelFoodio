"use client"

import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { useState } from "react"

export default function CTASection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <section className="py-20 bg-gradient-to-b from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Ready to transform your meal planning?
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
          Join thousands of users who have simplified their meal planning with FoodSm.art.
        </p>

        <div className="flex flex-col items-center">
          <div className="text-slate-500 dark:text-slate-400 mb-4">Still thinking?</div>

          <div
            className="relative w-full max-w-3xl mx-auto mb-10 cursor-pointer group"
            onClick={() => setIsVideoOpen(true)}
          >
            <div className="aspect-video rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg">
              <img
                src="/placeholder.svg?height=720&width=1280"
                alt="FoodSm.art Demo Video"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-all">
                <div className="h-20 w-20 rounded-full bg-primary/90 flex items-center justify-center text-white group-hover:bg-primary transition-all">
                  <Play className="h-10 w-10 ml-1" />
                </div>
              </div>
            </div>
            <div className="mt-3 text-slate-600 dark:text-slate-300">Watch our demo video</div>
          </div>

          <Button size="lg" className="px-8 py-6 text-lg">
            Start free trial
          </Button>
          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            No credit card required • 14-day free trial • Cancel anytime
          </div>
        </div>
      </div>

      {isVideoOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full h-8 w-8 flex items-center justify-center hover:bg-black/70 z-10"
              onClick={() => setIsVideoOpen(false)}
            >
              ✕
            </button>
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="FoodSm.art Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

