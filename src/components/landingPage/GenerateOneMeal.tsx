'use client'

import MenuDish from "../MenuDish"
import MenuDishSkeleton from "../loadingSkeletons/MenuDishLoading"
import TextAreaLanding from "./TextAreaLanding"
import React from "react"
import type { IMeal } from "@/types"

interface GenerateOneMealProps {
  screen: 'textarea' | 'meal';
  isLoading: boolean;
  generatedMeal: {
    name?: string;
    ingredients?: string[];
    cuisine?: string;
    fats?: number;
    carbs?: number;
    protein?: number;
    calories?: number;
  };
  promptValue: string;
  onChangePrompt: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  showLike?: boolean;
  canBeConsumed?: boolean;
  placeholder?: string;
}

export default function GenerateOneMeal({ 
  screen, 
  isLoading, 
  generatedMeal, 
  promptValue, 
  onChangePrompt, 
  onKeyDown,
  showLike = false,
  canBeConsumed = false,
  placeholder
}: GenerateOneMealProps) {
  const defaultPlaceholder = "Describe your perfect meal, and our AI will generate one for you. Click 'Generate Sample Meal' when you're ready!";
  
  return (
    <div className="w-full flex flex-1 h-full">
      {screen === 'textarea' ? (
        <TextAreaLanding
          placeholder={placeholder || defaultPlaceholder}
          value={promptValue}
          onChange={onChangePrompt}
          onKeyDown={onKeyDown}
          className="w-full h-full flex flex-1"
        />
      ) : screen === 'meal' ? (
        isLoading ? (
          <MenuDishSkeleton showLike={showLike} />
        ) : (
          <MenuDish menuDish={generatedMeal as unknown as IMeal} showLike={showLike} canBeConsumed={canBeConsumed} />
        )
      ) : null}
    </div>
  )
}