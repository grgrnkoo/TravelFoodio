'use client';
import { useState } from 'react';
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePopup } from "@/components/providers/PopUpProvider";
import type { IUserIngredient } from "@/types";

interface IngredientsListProps {
    ingredients: IUserIngredient[];
}

const INGREDIENTS_PER_PAGE = 10;

export default function IngredientsList({ ingredients: initialIngredients }: IngredientsListProps) {
    const [ingredients, setIngredients] = useState(initialIngredients);
    const [displayCount, setDisplayCount] = useState(INGREDIENTS_PER_PAGE);
    const { showPopup } = usePopup();

    const handleDelete = async (ingredientName: string) => {
        try {
            const response = await fetch('/api/ingredients', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ingredientName }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete ingredient');
            }

            // Remove from local state
            setIngredients(prev => prev.filter(ing => ing.name !== ingredientName));
            showPopup('Ingredient removed successfully', 'success');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error deleting ingredient:', message);
            showPopup('Failed to remove ingredient: ' + message, 'error');
        }
    };

    if (ingredients.length === 0) {
        return (
            <div className="w-full">
                <p className="text-center text-muted-foreground py-8">You haven't added any ingredients yet.</p>
            </div>
        );
    }

    const displayedIngredients = ingredients.slice(0, displayCount);
    const hasMore = displayCount < ingredients.length;

    const handleShowMore = () => {
        setDisplayCount(prev => Math.min(prev + INGREDIENTS_PER_PAGE, ingredients.length));
    };

    return (
        <div className="w-full px-4 space-y-2">
            {displayedIngredients.map((ingredient) => (
                <Card key={ingredient.name} className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4 flex-1">
                            <span className="font-medium text-lg">{ingredient.name}</span>
                            <span className="text-sm text-muted-foreground">
                                Rating: <span className="font-semibold">{ingredient.rating}</span>
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100"
                            onClick={() => handleDelete(ingredient.name)}
                            aria-label={`Delete ${ingredient.name}`}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
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

