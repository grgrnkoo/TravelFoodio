'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, ChevronRight, Utensils, Clock, Leaf, MapPinPlus } from "lucide-react"
import GenerateOneMeal from "./landingPage/GenerateOneMeal"
import { useState } from "react"
import { generateMeal } from "../../_lib/menuActions"
import { usePopup } from "./providers/PopUpProvider"
import Link from "next/link"

export default function HeroAIMenu() {
    const [isLoading, setIsLoading] = useState(false)
    const [screen, setScreen] = useState('textarea')
    const [promptValue, setPromptValue] = useState('')
    const [generatedMeal, setGeneratedMeal] = useState({})
    const { showPopup } = usePopup()

    const handleGenerateSampleMenu = async () => {
        setIsLoading(true)
        setScreen('meal')
        console.log("Generating meal with prompt:", promptValue)
        const generatedMealFromPrompt = await generateMeal(promptValue, setIsLoading)
        if (generatedMealFromPrompt) {
            setGeneratedMeal(generatedMealFromPrompt)
        } else {
            showPopup('Error generating meal', 'error')
            setScreen('textarea')
        }
        console.log("Generated meal with prompt:", generatedMealFromPrompt)
        setPromptValue('')
    }

    const onChangePrompt = (e) => {
        setPromptValue(e.target.value)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading && promptValue.trim() !== '') {
            e.preventDefault() // Prevent new line
            handleGenerateSampleMenu()
        }
    }

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-[30px] md:pt-0">
            <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/20 [mask-image:linear-gradient(to_bottom,white,transparent)]" />

            <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            <Sparkles className="mr-1 h-3.5 w-3.5" />
                            AI-Powered Menu Creation
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
                            Create tailored menus with{" "}
                            <span className="relative">
                                <span className="relative z-10 text-primary">AI magic</span>
                                <span className="absolute bottom-2 left-0 z-0 h-3 w-full bg-primary/20"></span>
                            </span>
                        </h1>

                        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg justify-normal">
                            Let our smart AI agent handle your meals effortlessly<br />
                            Enjoy personalized suggestions that match your taste and goals
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Button
                                size="lg"
                                onClick={handleGenerateSampleMenu}
                                disabled={promptValue === '' || isLoading}
                            >
                                {isLoading ? 'Generating...' : 'Generate Sample Meal'}
                                <Sparkles className="ml-2 h-4 w-4" />
                            </Button>
                            <Link href='#keyAdvantages'>
                                <Button size="lg" variant="outline">
                                    Learn More
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        <div className="flex items-center gap-6 pt-4">
                            <div className="flex items-center gap-2">
                                <Utensils className="h-5 w-5 text-primary" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Customizable</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Time-saving</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Leaf className="h-5 w-5 text-primary" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Seasonal</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -left-4 -top-4 h-72 w-72 rounded-full bg-primary/20 filter blur-3xl" />
                        <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-amber-500/10 filter blur-3xl" />

                        <Card className="relative overflow-hidden border-slate-200 bg-white/80 backdrop-blur-sm px-4 dark:border-slate-700 dark:bg-slate-800/80">
                            <GenerateOneMeal
                                screen={screen}
                                isLoading={isLoading}
                                generatedMeal={generatedMeal}
                                promptValue={promptValue}
                                onChangePrompt={onChangePrompt}
                                onKeyDown={handleKeyDown}
                                classname="w-full h-full flex flex-1"
                            />
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}