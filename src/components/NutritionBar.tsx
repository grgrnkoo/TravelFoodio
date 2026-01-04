"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { NutrientCircle } from "@/components/NutrientCircle"

interface NutrientProps {
  consumed: number
  goal: number
}

interface NutritionTrackerProps {
  isLoadedPassed?: boolean
  calories: NutrientProps
  carbs: NutrientProps
  protein: NutrientProps
  fat: NutrientProps
  onboarding: boolean
}

export default function NutritionBar({ isLoadedPassed = true, calories, carbs, protein, fat, onboarding = false }: NutritionTrackerProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Trigger animation after component mounts
    setIsLoaded(true)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full max-w-lg h-fit">
      <div className="md:col-span-3 flex justify-center">
        <NutrientCircle
          name="Calories"
          consumed={calories.consumed}
          goal={calories.goal}
          color="#f96a6a"
          size="large"
          isLoaded={onboarding ? isLoadedPassed : isLoaded}
          onboarding={onboarding}
        />
      </div>
      <div className="flex justify-center">
        <NutrientCircle
          name="Carbs"
          consumed={carbs.consumed}
          goal={carbs.goal}
          color="#7fb46f"
          isLoaded={onboarding ? isLoadedPassed : isLoaded}
          onboarding={onboarding}
        />
      </div>
      <div className="flex justify-center">
        <NutrientCircle
          name="Protein"
          consumed={protein.consumed}
          goal={protein.goal}
          color="#e9ed81"
          isLoaded={onboarding ? isLoadedPassed : isLoaded}
          onboarding={onboarding}
        />
      </div>
      <div className="flex justify-center">
        <NutrientCircle
          name="Fat"
          consumed={fat.consumed}
          goal={fat.goal}
          color="#a1abf6"
          isLoaded={onboarding ? isLoadedPassed : isLoaded}
          onboarding={onboarding}
        />
      </div>
    </div>
  )
}
