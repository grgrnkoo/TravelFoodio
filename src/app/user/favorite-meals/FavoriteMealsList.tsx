'use client';
import { useState } from 'react';
import MenuDish from "@/components/MenuDish";
import { Button } from "@/components/ui/button";
import type { IMeal } from "@/types";

interface FavoriteMealsListProps {
    meals: IMeal[];
}

const MEALS_PER_PAGE = 10;

export default function FavoriteMealsList({ meals }: FavoriteMealsListProps) {
    const [displayCount, setDisplayCount] = useState(MEALS_PER_PAGE);

    if (meals.length === 0) {
        return (
            <div className="w-full">
                <p className="text-center text-muted-foreground py-8">You haven't added any favorite meals yet.</p>
            </div>
        );
    }

    const displayedMeals = meals.slice(0, displayCount);
    const hasMore = displayCount < meals.length;

    const handleShowMore = () => {
        setDisplayCount(prev => Math.min(prev + MEALS_PER_PAGE, meals.length));
    };

    return (
        <div className="w-full px-4">
            {displayedMeals.map((meal, index) => (
                <MenuDish
                    key={`${meal.name}-${index}`}
                    menuDish={{
                        name: meal.name,
                        calories: meal.calories,
                        protein: meal.protein,
                        fats: meal.fats,
                        carbs: meal.carbs,
                        ingredients: meal.ingredients,
                        cuisine: meal.cuisine,
                    }}
                    index={index}
                    showLike={true}
                />
            ))}
            {hasMore && (
                <div className="flex justify-center mt-6 mb-4">
                    <Button
                        variant="outline"
                        onClick={handleShowMore}
                        className="px-6"
                    >
                        Show More
                    </Button>
                </div>
            )}
        </div>
    );
}

