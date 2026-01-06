'use client'

import { AnimatePresence } from "motion/react"
import { RecommendationBadge, AddRecommendationButton } from "./RestrictedRecommendationsDisplay"

interface MedicalRecommendationsEditorProps {
    recommendations: string[]
    onChange: (recommendations: string[]) => void
}

export default function MedicalRecommendationsEditor({ 
    recommendations, 
    onChange
}: MedicalRecommendationsEditorProps) {
    const handleRemove = (index: number) => {
        const updated = recommendations.filter((_, i) => i !== index)
        onChange(updated)
    }

    const handleAdd = (recommendation: string) => {
        // Avoid duplicates (case-insensitive check)
        if (!recommendations.some(r => r.toLowerCase() === recommendation.toLowerCase())) {
            onChange([...recommendations, recommendation])
        }
    }

    return (
        <div className="flex flex-wrap gap-2 items-center">
            <AnimatePresence mode="popLayout">
                {recommendations.map((recommendation, index) => (
                    <RecommendationBadge
                        key={recommendation}
                        recommendation={recommendation}
                        index={index}
                        onRemove={handleRemove}
                    />
                ))}
            </AnimatePresence>
            <AddRecommendationButton onAdd={handleAdd} />
        </div>
    )
}

