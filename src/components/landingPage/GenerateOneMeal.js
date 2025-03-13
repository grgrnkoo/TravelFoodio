'use client'

import MenuDish from "../MenuDish"
import MenuDishSkeleton from "../loadingSkeletons/MenuDishLoading";
import { useEffect, useState } from "react"
import { Button } from "../ui/button";
import TextAreaLanding from "./TextAreaLanding";
import { generateMeal } from "../../../_lib/menuActions";
import { usePopup } from "../providers/PopUpProvider";

export default function GenerateOneMeal() {
    const [isLoading, setIsLoading] = useState(false);
    const [screen, setScreen] = useState('textarea');
    const [promptValue, setPromptValue] = useState('');
    const [generatedMeal, setGeneratedMeal] = useState({});
    const { showPopup } = usePopup()
    const handleGenerateOneMeal = async () => {
        setIsLoading(true);
        setScreen('meal')
        console.log("Generating meal with prompt:", promptValue);
        const generatedMealFromPrompt = await generateMeal(promptValue, setIsLoading);
        if (generatedMealFromPrompt) {
            setGeneratedMeal(generatedMealFromPrompt)
        } else {
            showPopup('Error generating meal', 'error');
            setScreen('textarea');
        }
        console.log("Generated meal with prompt:", generatedMealFromPrompt);
        setPromptValue('')
    }

    const onChangePrompt = (e) => {
        setPromptValue(e.target.value);
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading && promptValue.trim() !== '') {
            e.preventDefault(); // Prevent new line
            handleGenerateOneMeal();
        }
    };

    return (
        <div className="w-full">
            {
                screen === 'textarea' ?
                    <TextAreaLanding
                        placeholder='Write any prompt to generate a custom meal!'
                        value={promptValue}
                        onChange={onChangePrompt}
                        onKeyDown={handleKeyDown}
                    />
                    : screen === 'meal' ? (
                    isLoading ? 
                    <MenuDishSkeleton 
                        showLike={false}
                    /> :
                    <MenuDish 
                        menuDish={generatedMeal}
                        showLike={false}
                    />
                    ) : null
            }
            <Button
                className='w-[40%] hover:cursor-pointer'
                onClick={handleGenerateOneMeal}
                disabled={promptValue === '' || isLoading}
            >
                {
                    isLoading ?
                    <span>Loading...</span> :
                    <span>Try it!</span>
                }
            </Button>
        </div>
    )
}