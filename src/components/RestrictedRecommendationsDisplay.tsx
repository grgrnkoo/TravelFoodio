'use client'

import { Loader2, AlertCircle, CheckCircle2, X, Plus } from "lucide-react"
import { Badge } from "./ui/badge"
import { motion, AnimatePresence } from "motion/react"
import { useState, useRef, useEffect } from "react"

interface RestrictedRecommendationsDisplayProps {
    recommendations: string[];
    isLoading: boolean;
    error?: string;
    onRemove?: (index: number) => void;
    onAdd?: (recommendation: string) => void;
}

export function RecommendationBadge({ 
    recommendation, 
    index, 
    onRemove 
}: { 
    recommendation: string; 
    index: number; 
    onRemove?: (index: number) => void 
}) {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative inline-block"
        >
            <div className="group relative">
                <Badge 
                    variant="secondary"
                    className="bg-red-100 text-red-800 border-red-200 pr-2 transition-all duration-200 hover:pr-7 cursor-default"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {recommendation}
                    {onRemove && (
                        <button
                            onClick={() => onRemove(index)}
                            className={`absolute right-1 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 text-red-900 cursor-pointer ${isHovered ? 'opacity-100' : ''}`}
                            aria-label={`Remove ${recommendation}`}
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </Badge>
            </div>
        </motion.div>
    );
}

export function AddRecommendationButton({ 
    onAdd 
}: { 
    onAdd?: (recommendation: string) => void 
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isExpanded && inputRef.current) {
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, [isExpanded]);

    const handleSubmit = () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue && onAdd) {
            onAdd(trimmedValue);
            setInputValue("");
            setIsExpanded(false);
        } else {
            setIsExpanded(false);
            setInputValue("");
        }
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsExpanded(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === "Escape") {
            setIsExpanded(false);
            setInputValue("");
        }
    };

    if (!onAdd) return null;

    return (
        <motion.div
            layout
            className="relative"
        >
            <AnimatePresence mode="wait">
                {!isExpanded ? (
                    <motion.button
                        key="button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        onClick={handleButtonClick}
                        className="h-[22px] w-[22px] rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors duration-200 cursor-pointer"
                        aria-label="Add custom recommendation"
                    >
                        <Plus className="h-3.5 w-3.5 text-slate-600" />
                    </motion.button>
                ) : (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, width: 22 }}
                        animate={{ opacity: 1, width: 140 }}
                        exit={{ opacity: 0, width: 22 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onAnimationStart={() => {
                            // Focus immediately when animation starts
                            setTimeout(() => {
                                inputRef.current?.focus();
                            }, 0);
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSubmit}
                            placeholder="Add item..."
                            className="h-[22px] w-full px-2 text-xs rounded-full border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function RestrictedRecommendationsDisplay({ 
    recommendations, 
    isLoading, 
    error,
    onRemove,
    onAdd
}: RestrictedRecommendationsDisplayProps) {
    
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <div>
                        <p className="text-sm font-medium text-slate-700">
                            Analyzing dietary restrictions...
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            This may take a few seconds
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 rounded-lg border border-red-200 shadow-sm p-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-900">
                            Failed to analyze restrictions
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                            {error}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="bg-green-50 rounded-lg border border-green-200 shadow-sm p-6">
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-green-900">
                            No strict restrictions detected
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                            Based on your input, we haven't identified any medical recommendations for you.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="space-y-3">
                <div>
                    <p className="text-sm font-medium text-slate-900">
                        What to avoid?
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Based on your dietary restrictions, we'll suggest you to follow these recommendations:
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                    <AnimatePresence mode="popLayout">
                        {recommendations.map((recommendation, index) => (
                            <RecommendationBadge
                                key={recommendation}
                                recommendation={recommendation}
                                index={index}
                                onRemove={onRemove}
                            />
                        ))}
                    </AnimatePresence>
                    <AddRecommendationButton onAdd={onAdd} />
                </div>

                <p className="text-xs text-slate-400 mt-2">
                    💡 You can update your restrictions anytime in your preferences
                </p>
            </div>
        </div>
    );
}

