'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ImageIcon, RefreshCw, Upload, X } from "lucide-react"
import MenuDish from "@/components/MenuDish"
import MenuDishSkeleton from "@/components/loadingSkeletons/MenuDishLoading"
import { useState, useEffect, useRef } from "react"
import { usePopup } from "@/components/providers/PopUpProvider"
import React from "react"
import { motion } from 'motion/react'

interface GeneratedMeal {
    name?: string;
    ingredients?: string[];
    cuisine?: string;
    fats?: number;
    carbs?: number;
    protein?: number;
    calories?: number;
    weight?: number;
}

export default function InspectPhotoPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [screen, setScreen] = useState<'upload' | 'meal'>('upload');
    const [generatedMeal, setGeneratedMeal] = useState<GeneratedMeal>({});
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [remainingAnalyses, setRemainingAnalyses] = useState<number | null>(null);
    const { showPopup } = usePopup();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchRemainingAnalyses = async () => {
        try {
            const response = await fetch('/api/photo-analyses');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setRemainingAnalyses(data.remaining);
                }
            }
        } catch (error) {
            console.error('Error fetching remaining analyses:', error);
        }
    };

    useEffect(() => {
        fetchRemainingAnalyses();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showPopup('Invalid file type. Please upload a JPG, PNG, or WebP image.', 'error');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showPopup('File too large. Maximum size is 5MB.', 'error');
            return;
        }

        setSelectedImage(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showPopup('Invalid file type. Please upload a JPG, PNG, or WebP image.', 'error');
            return;
        }

        // Validate file size
        if (file.size > 5 * 1024 * 1024) {
            showPopup('File too large. Maximum size is 5MB.', 'error');
            return;
        }

        setSelectedImage(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyzePhoto = async () => {
        if (!selectedImage) {
            showPopup('Please select an image first', 'error');
            return;
        }

        setIsLoading(true);
        setScreen('meal');

        try {
            const formData = new FormData();
            formData.append('image', selectedImage);

            const response = await fetch('/api/analyzePhoto', {
                method: 'POST',
                body: formData,
            });

            // Update counter after API call to reflect real-time changes
            // This happens regardless of success/failure to ensure accurate count
            await fetchRemainingAnalyses();

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || 'Failed to analyze photo';
                showPopup(errorMessage, 'error');
                setScreen('upload');
                setIsLoading(false);
                return;
            }

            const data = await response.json();
            
            if ('error' in data && typeof data.error === 'string') {
                showPopup(data.error, 'error');
                setScreen('upload');
            } else if ('name' in data && data.name) {
                setGeneratedMeal(data as GeneratedMeal);
            } else {
                showPopup('Error analyzing photo', 'error');
                setScreen('upload');
            }
        } catch (error) {
            console.error('Error analyzing photo:', error);
            showPopup('Network error. Please try again.', 'error');
            setScreen('upload');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setScreen('upload');
        setGeneratedMeal({});
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full flex flex-col space-y-6">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Inspect Photo with AI
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300">
                            Upload a photo of your meal and get detailed nutritional information.
                        </p>
                    </div>
                    {remainingAnalyses !== null && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            You have {remainingAnalyses} {remainingAnalyses === 1 ? 'analysis' : 'analyses'} left today
                        </p>
                    )}
                </div>
            </div>

            <div className="w-full space-y-4">
                <Card className="relative overflow-hidden border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 px-4 py-4">
                    {screen === 'upload' ? (
                        <div className="w-full">
                            {!imagePreview ? (
                                <div
                                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-12 text-center cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Drop your meal photo here or click to upload
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Supports JPG, PNG, WebP (max 5MB)
                                    </p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-auto max-h-96 object-contain"
                                        />
                                        <button
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            aria-label="Remove image"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="mt-4 flex justify-center">
                                        <Button
                                            onClick={() => fileInputRef.current?.click()}
                                            variant="outline"
                                            className="mr-2"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Change Photo
                                        </Button>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>
                    ) : screen === 'meal' ? (
                        isLoading ? (
                            <MenuDishSkeleton showLike={true} />
                        ) : generatedMeal.name ? (
                            <MenuDish 
                                menuDish={generatedMeal as GeneratedMeal & { name: string }} 
                                showLike={true} 
                                canBeConsumed={true} 
                            />
                        ) : null
                    ) : null}
                </Card>
                <span className="w-full text-center pt-2 text-slate-400 text-xs block">
                    AI will analyze your meal photo and provide nutritional information
                </span>
            </div>
            <div className="flex justify-end gap-2">
                {screen === 'meal' && !isLoading && generatedMeal.name && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleReset}
                        className="h-10 w-10"
                        aria-label="Analyze another photo"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                )}
                {screen === 'upload' && selectedImage && (
                    <Button
                        onClick={handleAnalyzePhoto}
                        disabled={isLoading || !selectedImage}
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze Photo'}
                        <ImageIcon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
