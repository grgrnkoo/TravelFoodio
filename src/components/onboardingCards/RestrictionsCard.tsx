'use client'

import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { JSX } from "react";
import { Textarea } from "../ui/textarea";


interface RestrictionsCardProps {
    dietaryRestrictions: string;
    setDietaryRestrictions: (dietaryRestrictions: string) => void;
}

export default function RestrictionsCard({ dietaryRestrictions, setDietaryRestrictions }: RestrictionsCardProps): JSX.Element {
    return (
        <div className="flex flex-col w-full justify-between">
            <CardHeader>
                <CardTitle>Any dietary restrictions?<span className="text-xs text-muted-foreground"> (optional)</span></CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
                <div className="space-y-2">
                    <Textarea
                        id="dietary-restrictions"
                        placeholder="E.g., vegetarian, gluten-free, allergies"
                        value={dietaryRestrictions}
                        onChange={(e) => setDietaryRestrictions(e.target.value)}
                        className="resize-none"
                    />
                </div>
            </CardContent>
        </div>
    )
}