'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, ChevronRight, Utensils, Clock, Leaf, MapPinPlus } from "lucide-react"
import GenerateOneMeal from "./landingPage/GenerateOneMeal"
import { useState } from "react"
import { generateMeal } from "../../_lib/menuActions"
import { usePopup } from "./providers/PopUpProvider"
import Link from "next/link"
import React from "react"

interface GeneratedMeal {
    name?: string;
    ingredients?: string[];
    cuisine?: string;
    fats?: number;
    carbs?: number;
    protein?: number;
    calories?: number;
}

export default function HeroAIMenu() {
    const [isLoading, setIsLoading] = useState(false);
    const [screen, setScreen] = useState<'textarea' | 'meal'>('textarea');
    const [generatedMeal, setGeneratedMeal] = useState<GeneratedMeal>({});
    const { showPopup } = usePopup();
    const viralMealPrompts = [
        "A meal that feels illegal to eat but is actually healthy.",
        "Generate a meal that looks like junk food but is secretly packed with nutrients.",
        "A dish that makes your gym bro question his entire diet.",
        "The ultimate 3-ingredient meal for when you're broke but still want to eat like a king.",
        "A meal so optimized it makes dietitians rethink their careers.",
        "Generate a meal that looks Michelin-starred but costs less than $5 to make.",
        "The one meal an AI thinks will make you live to 120.",
        "Create a meal Gordon Ramsay would roast… until he actually tastes it.",
        "A dish so balanced it makes MyFitnessPal jealous.",
        "The weirdest but most delicious meal combo you’d never think of."
    ];
    const getRandomMealPrompt = () => {
        return viralMealPrompts[Math.floor(Math.random() * viralMealPrompts.length)];
    }
    const [promptValue, setPromptValue] = useState(getRandomMealPrompt);


    const handleGenerateSampleMenu = async () => {
        setIsLoading(true)
        setScreen('meal')
        const generatedMealFromPrompt = await generateMeal(promptValue, setIsLoading)
        if (generatedMealFromPrompt) {
            setGeneratedMeal(generatedMealFromPrompt)
        } else {
            showPopup('Error generating meal', 'error')
            setScreen('textarea')
        }
        setPromptValue('')
    }

    const onChangePrompt = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPromptValue(e.target.value)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

                    <div className="relative w-full flex flex-col justify-center">
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
                            />
                        </Card>
                        <span className="w-full text-center pt-2 text-slate-400 text-xs">You can type any prompt and generate your meal</span>
                    </div>
                </div>
            </div>
        </section>
    )
}