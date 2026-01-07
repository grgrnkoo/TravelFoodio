'use client';
import { ThumbsUp, ThumbsDown, Utensils, Flame, Beef, Cookie, Wheat, Plus, Minus, Scale } from "lucide-react";
import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { usePopup } from './providers/PopUpProvider';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from 'motion/react';

import { useMealPreferencesContext } from './MealPreferencesProvider';
import { useConsumedMeals } from '@/app/hooks/useConsumedMeals';
import MealClass from '@/classes/MealClass';
import type { IMeal, TotalNutrition } from '@/types';

type MenuDishItem = MealClass | IMeal | TotalNutrition;

// Type guard to check if menuDish has ingredients property
function hasIngredients(item: MenuDishItem): item is MealClass | IMeal {
    return 'ingredients' in item;
}

// Type guard to check if menuDish has cuisine property
function hasCuisine(item: MenuDishItem): item is MealClass | IMeal {
    return 'cuisine' in item;
}

// Type guard to check if menuDish has weight property
function hasWeight(item: MenuDishItem): item is MealClass | IMeal {
    return 'weight' in item;
}

interface MenuDishProps {
    menuDish: MenuDishItem;
    index?: number;
    showLike?: boolean;
    canBeConsumed?: boolean;
}

// Assuming this is passed from parent to track order in stream
export default function MenuDish({ menuDish, index = 0, showLike = true, canBeConsumed = true }: MenuDishProps) {
    const { showPopup } = usePopup();
    const { favoriteMeals, dislikedMeals, likeMeal, dislikeMeal } = useMealPreferencesContext();
    const { addConsumedMeal, removeConsumedMeal, getConsumedCount, consumedMeals, loading: consumedLoading } = useConsumedMeals();

    const [like, setLike] = useState(false);
    const [dislike, setDislike] = useState(false);
    const [consuming, setConsuming] = useState(false);

    // Sync local state with global preferences
    useEffect(() => {
        const isLiked = favoriteMeals.some(meal => meal.name === menuDish?.name);
        const isDisliked = dislikedMeals.some(meal => meal.name === menuDish?.name);
        setLike(isLiked);
        setDislike(isDisliked);
    }, [favoriteMeals, dislikedMeals, menuDish]);

    const handleClick = async (action: 'like' | 'dislike') => {
        try {
            if (action === 'like') {
                await likeMeal({
                    name: menuDish?.name || '',
                    ingredients: hasIngredients(menuDish) ? menuDish.ingredients : undefined,
                    cuisine: hasCuisine(menuDish) ? menuDish.cuisine : undefined,
                });
                showPopup('Updated successfully!', 'success');
            } else {
                await dislikeMeal({
                    name: menuDish?.name || '',
                    ingredients: hasIngredients(menuDish) ? menuDish.ingredients : undefined,
                    cuisine: hasCuisine(menuDish) ? menuDish.cuisine : undefined,
                });
                showPopup('Updated successfully!', 'success');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('Request error:', message);
            showPopup('Network error: ' + message, 'error');
        }
    };

    const handleConsume = async () => {
        if (!menuDish?.name) return;
        
        const count = getConsumedCount(menuDish.name);
        if (count >= 10) {
            showPopup('You\'ve reached the maximum of 10 entries for this meal today. Great job tracking! 🎉', 'error');
            return;
        }

        setConsuming(true);
        try {
            const success = await addConsumedMeal({
                mealName: menuDish.name,
                calories: menuDish.calories ?? 0,
                protein: menuDish.protein ?? 0,
                fats: menuDish.fats ?? 0,
                carbs: menuDish.carbs ?? 0,
                weight: hasWeight(menuDish) ? menuDish.weight : undefined,
                cuisine: hasCuisine(menuDish) ? menuDish.cuisine : undefined,
                ingredients: hasIngredients(menuDish) ? menuDish.ingredients : undefined,
            });

            if (success) {
                // Dispatch event to refresh nutrition bar
                window.dispatchEvent(new CustomEvent('consumedMealChanged'));
                showPopup('Meal added! Keep tracking your nutrition! 🎉', 'success');
            } else {
                showPopup('Failed to add meal', 'error');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error consuming meal:', message);
            showPopup('Error: ' + message, 'error');
        } finally {
            setConsuming(false);
        }
    };

    const handleRemoveConsumed = async () => {
        if (!menuDish?.name) return;
        
        // Find the most recent consumed meal with this name
        const todayMeals = consumedMeals.filter(
            meal => meal.mealName === menuDish.name && 
            meal.consumedDate === new Date().toISOString().split('T')[0]
        );
        
        if (todayMeals.length === 0) return;

        // Remove the most recent one
        const mealToRemove = todayMeals[0];
        setConsuming(true);
        try {
            const success = await removeConsumedMeal(mealToRemove.id);
            if (success) {
                // Dispatch event to refresh nutrition bar
                window.dispatchEvent(new CustomEvent('consumedMealChanged'));
                showPopup('Meal removed! Your nutrition tracker is updated ✨', 'success');
            } else {
                showPopup('Failed to remove meal', 'error');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error removing consumed meal:', message);
            showPopup('Error: ' + message, 'error');
        } finally {
            setConsuming(false);
        }
    };

    const consumedCount = menuDish?.name ? getConsumedCount(menuDish.name) : 0;
    const isConsumed = consumedCount > 0;
    const canAddMore = consumedCount < 10;

    return (
        <>
            {/* Inline style for animation definition */}
            <style>{`
                @keyframes dropIn {
                    from {
                        transform: translateY(-25%);
                        opacity: 0;  
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                        z-index: 1;
                    }
                }
                .animate-drop-in {
                    animation: dropIn 1.5s ease-out forwards;
                }
            `}</style>

            <Card
                className={`
                    w-full overflow-hidden border-none shadow-lg hover:shadow-xl 
                    transition-all duration-300 my-4 animate-drop-in relative hover:cursor-default
                `}
                style={{
                    animationDelay: `${index * 0.25}s`,
                    transform: 'translateY(-25%)',
                    opacity: 0,
                    zIndex: -index - 1,
                }}
            >
                <CardHeader className={`bg-gradient-to-r ${menuDish?.name === 'Total Nutrition' ? 'from-amber-200 to-red-300' : 'from-amber-50 to-orange-50'} pb-2`}>
                    <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl font-bold pr-6">{menuDish?.name}</CardTitle>
                        {hasCuisine(menuDish) && menuDish.cuisine &&
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 px-[10px] py-[4px] mx-[2px] select-none text-center">
                                {menuDish.cuisine}
                            </Badge>}
                    </div>
                </CardHeader>

                <CardContent className="pt-4 pb-2">
                    <div className="flex items-center justify-between w-full mb-4 text-muted-foreground">
                        <div className="flex items-center">
                            <Flame className="h-4 w-4 mr-1 text-orange-500" />
                            <span className="font-medium">{menuDish?.calories} kcal</span>
                        </div>
                        {hasWeight(menuDish) && menuDish.weight && (
                            <div className="flex items-center">
                                <Scale className="h-4 w-4 mr-1 text-slate-500" />
                                <span className="font-medium">{menuDish.weight}g</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-slate-50 rounded-lg p-3 text-center">
                            <div className="flex justify-center mb-1">
                                <Beef className="h-4 w-4 text-blue-600" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Proteins</p>
                            <p className="font-medium">{menuDish?.protein}</p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3 text-center">
                            <div className="flex justify-center mb-1">
                                <Cookie className="h-4 w-4 text-yellow-600" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Fats</p>
                            <p className="font-medium">{menuDish?.fats}</p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3 text-center">
                            <div className="flex justify-center mb-1">
                                <Wheat className="h-4 w-4 text-amber-600" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Carbs</p>
                            <p className="font-medium">{menuDish?.carbs}</p>
                        </div>
                    </div>

                    {hasIngredients(menuDish) && menuDish.ingredients &&
                        <div>
                            <p className="text-sm font-medium mb-2"><strong>Ingredients</strong></p>
                            <div className="flex flex-wrap gap-1 mb-1">
                                {menuDish.ingredients.map((ingredient: string, ingredientIndex: number) => (
                                    <Badge key={ingredientIndex} variant="secondary" className="bg-slate-100 border-slate-300 text-slate-500 px-[8px] py-[4px] mx-[2px] text-center">
                                        {ingredient}
                                    </Badge>
                                ))}
                            </div>
                        </div>}
                </CardContent>

                <Separator />

                {showLike &&
                    <CardFooter className="flex justify-between pt-3 pb-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Utensils className="h-4 w-4 mr-1" />
                            <span>Rate this dish</span>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                className={`p-2 rounded-full transition-all`}
                                onClick={() => handleClick("like")}
                                aria-label="Like"
                                aria-pressed={like}
                            >
                                <ThumbsUp
                                    className={`h-5 w-5 hover:cursor-pointer`}
                                    fill={like ? "green" : "none"}
                                    stroke={like ? "green" : "currentColor"}
                                    fillOpacity={0.5}
                                />
                            </button>

                            <button
                                className={`p-2 rounded-full transition-all`}
                                onClick={() => handleClick("dislike")}
                                aria-label="Dislike"
                                aria-pressed={dislike}
                            >
                                <ThumbsDown
                                    className={`h-5 w-5 hover:cursor-pointer`}
                                    fill={dislike ? "red" : "none"}
                                    stroke={dislike ? "red" : "currentColor"}
                                    fillOpacity={0.5}
                                />
                            </button>
                        </div>
                    </CardFooter>
                }

                {canBeConsumed && menuDish?.name !== 'Total Nutrition' &&
                    <CardFooter className="flex justify-between pt-3 pb-3 border-t">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Flame className="h-4 w-4 mr-1" />
                            <span>Track consumption</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* E-commerce style quantity selector */}
                            <div className="flex items-center border rounded-lg overflow-hidden">
                                {/* Minus button - only show when there are entries */}
                                {isConsumed && (
                                    <motion.button
                                        initial={{ scale: 1 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleRemoveConsumed}
                                        disabled={consuming || consumedLoading}
                                        aria-label="Remove one"
                                    >
                                        <Minus
                                            className={`h-4 w-4 text-gray-600 ${consuming || consumedLoading ? 'opacity-50' : ''}`}
                                        />
                                    </motion.button>
                                )}
                                
                                {/* Quantity display - only show when there are entries */}
                                {isConsumed && (
                                    <div className="px-3 py-2 min-w-[2rem] text-center text-sm font-medium border-x">
                                        {consumedCount}
                                    </div>
                                )}
                                
                                {/* Plus button - always visible */}
                                <motion.button
                                    initial={{ scale: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`p-2 transition-all ${canAddMore ? 'hover:bg-green-50' : 'opacity-50 cursor-not-allowed'}`}
                                    onClick={handleConsume}
                                    disabled={!canAddMore || consuming || consumedLoading}
                                    aria-label="Add one"
                                    title={!canAddMore ? 'Maximum 10 entries per meal per day reached' : 'Add one'}
                                >
                                    <Plus
                                        className={`h-4 w-4 ${canAddMore ? 'text-green-600' : 'text-gray-400'} ${consuming || consumedLoading ? 'opacity-50' : ''}`}
                                    />
                                </motion.button>
                            </div>
                        </div>
                    </CardFooter>
                }
            </Card>
        </>
    );
}