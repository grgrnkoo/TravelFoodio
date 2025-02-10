"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function YesNoPopUp({ isOpen, onClose, onChoice, title = "Are you sure?", content, yesLabel = "Yes", noLabel = "No" }) {
    const [localOpen, setLocalOpen] = useState(isOpen) // Local state to track changes

    console.log("Popup title:", title);

    useEffect(() => {
        setLocalOpen(isOpen)
    }, [isOpen]) // Sync state when `isOpen` changes

    if (!localOpen) return null // Prevent rendering when closed

    return (
        <Dialog open={localOpen} onOpenChange={(state) => {
            setLocalOpen(state) // Update local state
            onClose(state) // Call parent handler
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{content}</DialogDescription>
                </DialogHeader>
                <div className="flex justify-center space-x-4">
                    <Button onClick={() => onChoice(true)}>{yesLabel}</Button>
                    <Button onClick={() => onChoice(false)} variant="outline">
                        {noLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
