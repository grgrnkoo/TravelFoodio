"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon, PencilIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";

export default function UserProfileLine({
    userData,
    nameOfLine,
    id,
    editable = false,
    styleProp = "",
    setOneEditingFieldBoolean,
    oneEditingFieldBoolean,
    confirmUpdate,
    isPopupOpen,
    setIsPopupOpen,
    icon,
    inputType = "text",
    customComponent,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [optimisticUserData, setOptimisticUserData] = useState(() => userData);
    const [inputValue, setInputValue] = useState(userData);

    useEffect(() => {
        if (userData !== optimisticUserData) {
            setOptimisticUserData(userData);
            setInputValue(userData);
        }
        if (!isPopupOpen && isEditing) {
            setIsEditing(false);
            setOneEditingFieldBoolean(false);
        }
    }, []);

    const toggleEditing = () => {
        if (!isEditing && oneEditingFieldBoolean) return;
        setIsEditing(!isEditing);
        setOneEditingFieldBoolean(!isEditing);
        if (!isEditing) setInputValue(optimisticUserData);
    };

    const handleSave = async () => {
        // For custom components, they handle their own updates
        if (customComponent) {
            setIsEditing(false);
            setOneEditingFieldBoolean(false);
            return;
        }
        
        if (inputValue !== optimisticUserData && inputValue !== "" && inputValue !== null) {
            setIsPopupOpen(true);
            const confirmed = await confirmUpdate(id, inputValue);
            if (confirmed) {
                setOptimisticUserData(inputValue); // Update persists here
            } else {
                setInputValue(optimisticUserData); // Revert to last confirmed value
            }
        }
        setIsEditing(false);
        setOneEditingFieldBoolean(false);
    };

    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            await handleSave();
        } else if (e.key === "Escape") {
            setIsEditing(false);
            setOneEditingFieldBoolean(false);
            setInputValue(optimisticUserData);
        }
    };

    const inputWidth = isEditing && inputType !== "textarea" && inputType !== "date"
        ? `${Math.max(String(inputValue || '').length * 10, String(optimisticUserData || '').length * 10, 150)}px` : undefined;

    // Format display value
    const formatDisplayValue = (value: unknown) => {
        if (value === null || value === undefined || value === '') return '';
        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(', ') : '';
        }
        if (inputType === 'date' && value) {
            try {
                const date = typeof value === 'string' ? new Date(value) : value;
                return date.toLocaleDateString();
            } catch {
                return String(value);
            }
        }
        return String(value);
    };

    // If custom component is provided, render it instead
    if (customComponent) {
        return (
            <div className="flex items-start py-2 justify-between group">
                <div className="flex items-start gap-2 flex-1">
                    {icon && <span className="mt-1">{icon}</span>}
                    <div className="flex flex-col flex-1">
                        {nameOfLine && <span className="text-xs text-muted-foreground mb-2">{nameOfLine}</span>}
                        {customComponent}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center py-2 justify-between group">
            <div className="flex items-center gap-2 flex-1">
                {icon && <span>{icon}</span>}
                <div className="flex flex-col flex-1">
                    {nameOfLine && <span className="text-xs text-muted-foreground">{nameOfLine}</span>}
                    {isEditing ? (
                        inputType === "textarea" ? (
                            <Textarea
                                value={inputValue || ''}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="py-1 mt-1"
                                rows={3}
                            />
                        ) : inputType === "date" ? (
                            <Input
                                type="date"
                                value={inputValue ? (typeof inputValue === 'string' ? inputValue.split('T')[0] : new Date(inputValue).toISOString().split('T')[0]) : ''}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="py-1"
                                style={{ width: inputWidth }}
                            />
                        ) : (
                            <Input
                                type={inputType}
                                value={inputValue || ''}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="py-1"
                                style={{ width: inputWidth }}
                            />
                        )
                    ) : (
                        <span className={cn("transition-all py-2", styleProp)}>
                            {formatDisplayValue(optimisticUserData)}
                        </span>
                    )}
                </div>
            </div>

            {editable && (
                <div className="flex items-center ml-2">
                    {isEditing ? (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-green-500 hover:text-green-600 hover:bg-green-100"
                                onClick={handleSave}
                            >
                                <CheckIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-100"
                                onClick={toggleEditing}
                            >
                                <XIcon className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={toggleEditing}
                            disabled={oneEditingFieldBoolean}
                        >
                            <PencilIcon className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}