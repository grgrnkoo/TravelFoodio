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
            console.log(`${id} Resetting edit mode`);
            setIsEditing(false);
            setOneEditingFieldBoolean(false);
        }
    }, []);

    const toggleEditing = () => {
        console.log(`${id} toggleEditing: isEditing=${isEditing}, oneEditingFieldBoolean=${oneEditingFieldBoolean}`);
        if (!isEditing && oneEditingFieldBoolean) return;
        setIsEditing(!isEditing);
        setOneEditingFieldBoolean(!isEditing);
        if (!isEditing) setInputValue(optimisticUserData);
    };

    const handleSave = async () => {
        console.log(`${id} handleSave: inputValue=${inputValue}, optimistic=${optimisticUserData}`);
        if (inputValue !== optimisticUserData && inputValue !== "") {
            setIsPopupOpen(true);
            const confirmed = await confirmUpdate(id, inputValue);
            console.log(`${id} Confirmed: ${confirmed}`);
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
        console.log(`${id} Key: ${e.key}`);
        if (e.key === "Enter") {
            e.preventDefault();
            await handleSave();
        } else if (e.key === "Escape") {
            setIsEditing(false);
            setOneEditingFieldBoolean(false);
            setInputValue(optimisticUserData);
        }
    };

    const inputWidth = isEditing
        ? `${Math.max(inputValue.length * 10, String(optimisticUserData).length * 10, 150)}px` : undefined;

    return (
        <div className="flex items-center py-2 justify-between group">
            <div className="flex items-center gap-2 flex-1">
                {icon && <span>{icon}</span>}
                <div className="flex flex-col">
                    {nameOfLine && <span className="text-xs text-muted-foreground">{nameOfLine}</span>}
                    {isEditing ? (
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="py-1"
                            style={{ width: inputWidth }}
                        />
                    ) : (
                        <span className={cn("transition-all py-2", styleProp)}>{optimisticUserData}</span>
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