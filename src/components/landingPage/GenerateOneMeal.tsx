'use client'

import MenuDish from "../MenuDish"
import MenuDishSkeleton from "../loadingSkeletons/MenuDishLoading"
import TextAreaLanding from "./TextAreaLanding"
import React from "react"

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
}

export default function GenerateOneMeal({ 
  screen, 
  isLoading, 
  generatedMeal, 
  promptValue, 
  onChangePrompt, 
  onKeyDown
}: GenerateOneMealProps) {
  return (
    <div className="w-full flex flex-1 h-full">
      {screen === 'textarea' ? (
        <TextAreaLanding
          placeholder={`Describe your perfect meal, and our AI will generate one for you. Click 'Generate Sample Meal' when you're ready!`}
          value={promptValue}
          onChange={onChangePrompt}
          onKeyDown={onKeyDown}
          className="w-full h-full flex flex-1"
        />
      ) : screen === 'meal' ? (
        isLoading ? (
          <MenuDishSkeleton showLike={false} />
        ) : (
          <MenuDish menuDish={generatedMeal} showLike={false} />
        )
      ) : null}
    </div>
  )
}