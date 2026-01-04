'use client';
import { ThumbsUp, ThumbsDown, Utensils, Flame, Beef, Cookie, Wheat } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from 'react';
import { useContext } from 'react';
import { UserContext } from './UserProvider';
import { usePopup } from './providers/PopUpProvider';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Simple debounce function
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Assuming this is passed from parent to track order in stream
export default function MenuDish({ menuDish, index = 0, showLike }) {
    const { userProfile, userProfileDynamic, setUserProfileDynamic } = useContext(UserContext);
    const { showPopup } = usePopup();

    const [like, setLike] = useState(userProfileDynamic?.favoriteMeals?.some((meal) => meal?.name === menuDish?.name));
    const [dislike, setDislike] = useState(userProfileDynamic?.dislikedMeals?.some((meal) => meal?.name === menuDish?.name));

    // Fetch initial state on load
    useEffect(() => {
        if (userProfile?._id) {
            setLike(userProfileDynamic?.favoriteMeals?.some(m => m.name === menuDish?.name));
            setDislike(userProfileDynamic?.dislikedMeals?.some(m => m.name === menuDish?.name));
        }
    }, [userProfileDynamic, menuDish]);

    const updatePreference = useCallback(
        debounce(async (action) => {
            try {
                const response = await fetch('/api/preferenceUpdate', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userProfile._id, meal: menuDish, action, setUserProfileDynamic }),
                });
                const data = await response.json();
                if (response.ok) {
                    setLike(action === 'like' ? !like : false);
                    setDislike(action === 'dislike' ? !dislike : false);
                    const updatedProfile = await fetch(`/api/users/${userProfile?.email}`).then(res => res.json())
                    setUserProfileDynamic(prev => ({
                        ...prev,
                        favoriteMeals: updatedProfile.favoriteMeals,
                        dislikedMeals: updatedProfile.dislikedMeals
                    }));
                    showPopup('Updated successfully!', 'success');
                } else {
                    console.error('Update failed:', data.error);
                    showPopup(`Error: ${data.error || 'Update failed'}`, 'error');
                }
            } catch (error) {
                console.error('Request error:', error);
                showPopup('Network error: ' + error.message, 'error');
            }
        }, 500),
        [menuDish, like, dislike, userProfile?._id]
    );

    const handleClick = (action) => {
        updatePreference(action);
    };

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
                        {menuDish?.cuisine &&
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 px-[10px] py-[4px] mx-[2px] select-none text-center">
                                {menuDish?.cuisine}
                            </Badge>}
                    </div>
                </CardHeader>

                <CardContent className="pt-4 pb-2">
                    <div className="flex items-center mb-4 text-muted-foreground">
                        <Flame className="h-4 w-4 mr-1 text-orange-500" />
                        <span className="font-medium">{menuDish?.calories} kcal</span>
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

                    {menuDish?.ingredients &&
                        <div>
                            <p className="text-sm font-medium mb-2"><strong>Ingredients</strong></p>
                            <div className="flex flex-wrap gap-1 mb-1">
                                {menuDish?.ingredients?.map((ingredient, index) => (
                                    <Badge key={index} variant="secondary" className="bg-slate-100 border-slate-300 text-slate-500 px-[8px] py-[4px] mx-[2px] text-center">
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
            </Card>
        </>
    );
}