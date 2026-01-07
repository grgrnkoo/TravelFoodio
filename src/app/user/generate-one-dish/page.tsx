'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, RefreshCw } from "lucide-react"
import GenerateOneMeal from "@/components/landingPage/GenerateOneMeal"
import { useState, useEffect } from "react"
import { generateMeal } from "../../../../_lib/menuActions"
import { usePopup } from "@/components/providers/PopUpProvider"
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

export default function GenerateOneDishPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [screen, setScreen] = useState<'textarea' | 'meal'>('textarea');
    const [generatedMeal, setGeneratedMeal] = useState<GeneratedMeal>({});
    const { showPopup } = usePopup();
    const [promptValue, setPromptValue] = useState('');
    const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null);

    const fetchRemainingGenerations = async () => {
        try {
            const response = await fetch('/api/meal-generations');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setRemainingGenerations(data.remaining);
                }
            }
        } catch (error) {
            console.error('Error fetching remaining generations:', error);
        }
    };

    useEffect(() => {
        fetchRemainingGenerations();
    }, []);

    const handleGenerateSampleMenu = async () => {
        setIsLoading(true)
        setScreen('meal')
        const generatedMealFromPrompt = await generateMeal(promptValue, setIsLoading, true)
        if (generatedMealFromPrompt) {
            if ('error' in generatedMealFromPrompt && typeof generatedMealFromPrompt.error === 'string') {
                // Handle limit error
                showPopup(generatedMealFromPrompt.error || 'Daily limit reached', 'error')
                setScreen('textarea')
            } else if ('name' in generatedMealFromPrompt) {
                // Valid meal object
                setGeneratedMeal(generatedMealFromPrompt)
                // Update remaining generations after successful generation
                await fetchRemainingGenerations();
            } else {
                showPopup('Error generating meal', 'error')
                setScreen('textarea')
            }
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

    const handleReset = () => {
        setScreen('textarea')
        setGeneratedMeal({})
        setPromptValue('')
    }

    return (
        <div className="w-full flex flex-col space-y-6">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Generate One Dish
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300">
                            If you ate something that we didn't suggest, you can add it here.
                        </p>
                    </div>
                    {remainingGenerations !== null && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            You have {remainingGenerations} generation{remainingGenerations !== 1 ? 's' : ''} left today
                        </p>
                    )}
                </div>
            </div>

            <div className="w-full space-y-4">
                <Card className="relative overflow-hidden border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 px-4 py-4">
                    <GenerateOneMeal
                        screen={screen}
                        isLoading={isLoading}
                        generatedMeal={generatedMeal}
                        promptValue={promptValue}
                        onChangePrompt={onChangePrompt}
                        onKeyDown={handleKeyDown}
                        showLike={true}
                        canBeConsumed={true}
                        placeholder="Describe your meal"
                    />
                </Card>
                <span className="w-full text-center pt-2 text-slate-400 text-xs block">
                    You can type any prompt and generate your meal
                </span>
            </div>
            <div className="flex justify-end gap-2">
                    {screen === 'meal' && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleReset}
                            className="h-10 w-10"
                            aria-label="Generate another dish"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        onClick={handleGenerateSampleMenu}
                        disabled={promptValue === '' || isLoading}
                    >
                        {isLoading ? 'Generating...' : 'Generate Meal'}
                        <Sparkles className="ml-2 h-4 w-4" />
                    </Button>
                </div>
        </div>
    )
}
