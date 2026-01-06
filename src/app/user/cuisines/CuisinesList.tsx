'use client';
import { useState } from 'react';
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePopup } from "@/components/providers/PopUpProvider";
import type { IUserCuisine } from "@/types";

interface CuisinesListProps {
    cuisines: IUserCuisine[];
}

const CUISINES_PER_PAGE = 10;

export default function CuisinesList({ cuisines: initialCuisines }: CuisinesListProps) {
    const [cuisines, setCuisines] = useState(initialCuisines);
    const [displayCount, setDisplayCount] = useState(CUISINES_PER_PAGE);
    const { showPopup } = usePopup();

    const handleDelete = async (cuisineName: string) => {
        try {
            const response = await fetch('/api/cuisines', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cuisineName }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete cuisine');
            }

            // Remove from local state
            setCuisines(prev => prev.filter(cuisine => cuisine.name !== cuisineName));
            showPopup('Cuisine removed successfully', 'success');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error deleting cuisine:', message);
            showPopup('Failed to remove cuisine: ' + message, 'error');
        }
    };

    if (cuisines.length === 0) {
        return (
            <div className="w-full">
                <p className="text-center text-muted-foreground py-8">You haven't added any cuisines yet.</p>
            </div>
        );
    }

    const displayedCuisines = cuisines.slice(0, displayCount);
    const hasMore = displayCount < cuisines.length;

    const handleShowMore = () => {
        setDisplayCount(prev => Math.min(prev + CUISINES_PER_PAGE, cuisines.length));
    };

    return (
        <div className="w-full px-4 space-y-2">
            {displayedCuisines.map((cuisine) => (
                <Card key={cuisine.name} className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4 flex-1">
                            <span className="font-medium text-lg">{cuisine.name}</span>
                            <span className="text-sm text-muted-foreground">
                                Rating: <span className="font-semibold">{cuisine.rating}</span>
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100"
                            onClick={() => handleDelete(cuisine.name)}
                            aria-label={`Delete ${cuisine.name}`}
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

